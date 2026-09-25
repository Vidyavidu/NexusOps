import express from "express";
import prisma from "../lib/prisma.js";
import { generateTicketNumber } from "../lib/numbering.js";
import { calculatePriority } from "../lib/priority.js";
import { requireAuth, requireEmployee } from "../middleware/auth.js";

const router = express.Router();
const CALLER_SELECT = { select: { name: true, email: true, employeeId: true, phone: true, department: true } };

router.get("/", requireAuth, async (req, res) => {
  try {
    const changes = await prisma.ticket.findMany({
      where: { type: "CHANGE" },
      orderBy: { createdAt: "desc" },
      include: { openedBy: CALLER_SELECT, assignedTo: CALLER_SELECT },
    });
    res.json(changes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching changes" });
  }
});

router.get("/:number", requireAuth, async (req, res) => {
  try {
    const change = await prisma.ticket.findUnique({
      where: { number: req.params.number },
      include: {
        openedBy: CALLER_SELECT,
        assignedTo: CALLER_SELECT,
        activities: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
      },
    });
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json(change);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching the change" });
  }
});

router.post("/", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { shortDescription, description, impact, urgency, changeType, riskLevel, category, assignmentGroup } = req.body;
    if (!shortDescription) return res.status(400).json({ error: "Short description is required" });

    const finalImpact = impact || 3;
    const finalUrgency = urgency || 3;
    const priority = calculatePriority(finalImpact, finalUrgency);
    const number = await generateTicketNumber("CHANGE");

    const change = await prisma.ticket.create({
      data: {
        number, type: "CHANGE", shortDescription, description, category, assignmentGroup,
        impact: finalImpact, urgency: finalUrgency, priority,
        state: "New", changeType, riskLevel, openedById: req.user.id,
      },
    });

    await prisma.activity.create({
      data: { ticketId: change.id, userId: req.user.id, kind: "field_change", field: "state", newValue: "New", body: `Change ${number} created` },
    });

    res.status(201).json(change);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the change" });
  }
});

const VALID_TRANSITIONS = {
  New: ["Assess"],
  Assess: ["Authorize"],
  Authorize: ["Scheduled", "Rejected"],
  Scheduled: ["Implement"],
  Implement: ["Review"],
  Review: ["Closed"],
};

router.patch("/:number", requireAuth, requireEmployee, async (req, res) => {
  try {
    const existing = await prisma.ticket.findUnique({ where: { number: req.params.number } });
    if (!existing) return res.status(404).json({ error: "Change not found" });

    const { state, riskLevel, resolutionNotes, assignedToId, assignmentGroup } = req.body;
    const updateData = {};
    const logs = [];

    if (state && state !== existing.state) {
      const allowed = VALID_TRANSITIONS[existing.state] || [];
      if (!allowed.includes(state)) {
        return res.status(400).json({ error: `Cannot move from ${existing.state} to ${state}` });
      }
      updateData.state = state;
      logs.push({ field: "state", oldValue: existing.state, newValue: state });
      if (state === "Closed") updateData.closedAt = new Date();
    }
    if (riskLevel) updateData.riskLevel = riskLevel;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (assignedToId) updateData.assignedToId = assignedToId;
    if (assignmentGroup && assignmentGroup !== existing.assignmentGroup) {
      updateData.assignmentGroup = assignmentGroup;
      logs.push({ field: "assignmentGroup", oldValue: existing.assignmentGroup, newValue: assignmentGroup });
    }

    const updated = await prisma.ticket.update({ where: { number: req.params.number }, data: updateData });

    for (const log of logs) {
      await prisma.activity.create({ data: { ticketId: existing.id, userId: req.user.id, kind: "field_change", ...log } });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong updating the change" });
  }
});
async function handleDelete() {
  if (!window.confirm(`Delete ${ticket.number}? This cannot be undone.`)) return;
  try {
    await api.delete(`/${endpoint}/${number}`);
    navigate(`/${endpoint}`);
  } catch (err) {
    setError(err.response?.data?.error || "Could not delete record");
  }
}

export default router;