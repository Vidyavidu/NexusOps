import express from "express";
import prisma from "../lib/prisma.js";
import { generateTicketNumber } from "../lib/numbering.js";
import { calculatePriority } from "../lib/priority.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const CALLER_SELECT = { select: { name: true, email: true, employeeId: true, phone: true, department: true } };

router.get("/", requireAuth, async (req, res) => {
  try {
    const incidents = await prisma.ticket.findMany({
      where: { type: "INCIDENT" },
      orderBy: { createdAt: "desc" },
      include: { openedBy: CALLER_SELECT, assignedTo: CALLER_SELECT },
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching incidents" });
  }
});

router.get("/:number", requireAuth, async (req, res) => {
  try {
    const incident = await prisma.ticket.findUnique({
      where: { number: req.params.number },
      include: {
        openedBy: CALLER_SELECT,
        assignedTo: CALLER_SELECT,
        activities: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
      },
    });
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching the incident" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { shortDescription, description, impact, urgency, category, assignmentGroup } = req.body;
    if (!shortDescription) return res.status(400).json({ error: "Short description is required" });

    const finalImpact = impact || 3;
    const finalUrgency = urgency || 3;
    const priority = calculatePriority(finalImpact, finalUrgency);
    const number = await generateTicketNumber("INCIDENT");

    const incident = await prisma.ticket.create({
      data: {
        number, type: "INCIDENT", shortDescription, description, category, assignmentGroup,
        impact: finalImpact, urgency: finalUrgency, priority,
        state: "New", openedById: req.user.id,
      },
    });

    await prisma.activity.create({
      data: { ticketId: incident.id, userId: req.user.id, kind: "field_change", field: "state", newValue: "New", body: `Incident ${number} created` },
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the incident" });
  }
});

router.patch("/:number", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.ticket.findUnique({ where: { number: req.params.number } });
    if (!existing) return res.status(404).json({ error: "Incident not found" });

    const { state, assignedToId, assignmentGroup, resolutionCode, resolutionNotes, impact, urgency } = req.body;
    const updateData = {};
    const logs = [];

    if (state && state !== existing.state) {
      if (state === "Resolved" && (!resolutionCode || !resolutionNotes)) {
        return res.status(400).json({ error: "Resolution code and notes are required to resolve an incident" });
      }
      updateData.state = state;
      logs.push({ field: "state", oldValue: existing.state, newValue: state });
      if (state === "Resolved") updateData.closedAt = new Date();
    }

    if (assignedToId && assignedToId !== existing.assignedToId) {
      updateData.assignedToId = assignedToId;
      logs.push({ field: "assignedTo", oldValue: existing.assignedToId, newValue: assignedToId });
    }

    if (assignmentGroup && assignmentGroup !== existing.assignmentGroup) {
      updateData.assignmentGroup = assignmentGroup;
      logs.push({ field: "assignmentGroup", oldValue: existing.assignmentGroup, newValue: assignmentGroup });
    }

    if (resolutionCode) updateData.resolutionCode = resolutionCode;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;

    if (impact || urgency) {
      const finalImpact = impact || existing.impact;
      const finalUrgency = urgency || existing.urgency;
      updateData.impact = finalImpact;
      updateData.urgency = finalUrgency;
      updateData.priority = calculatePriority(finalImpact, finalUrgency);
    }

    const updated = await prisma.ticket.update({ where: { number: req.params.number }, data: updateData });

    for (const log of logs) {
      await prisma.activity.create({ data: { ticketId: existing.id, userId: req.user.id, kind: "field_change", ...log } });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong updating the incident" });
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