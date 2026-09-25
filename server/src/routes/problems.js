import express from "express";
import prisma from "../lib/prisma.js";
import { generateTicketNumber } from "../lib/numbering.js";
import { calculatePriority } from "../lib/priority.js";
import { requireAuth, requireEmployee } from "../middleware/auth.js";

const router = express.Router();
const CALLER_SELECT = { select: { name: true, email: true, employeeId: true, phone: true, department: true } };

router.get("/", requireAuth, async (req, res) => {
  try {
    const problems = await prisma.ticket.findMany({
      where: { type: "PROBLEM" },
      orderBy: { createdAt: "desc" },
      include: { openedBy: CALLER_SELECT, assignedTo: CALLER_SELECT },
    });
    res.json(problems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching problems" });
  }
});

router.get("/:number", requireAuth, async (req, res) => {
  try {
    const problem = await prisma.ticket.findUnique({
      where: { number: req.params.number },
      include: {
        openedBy: CALLER_SELECT,
        assignedTo: CALLER_SELECT,
        children: true,
        activities: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
      },
    });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching the problem" });
  }
});

router.post("/", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { shortDescription, description, impact, urgency, rootCause, workaround, category, assignmentGroup } = req.body;
    if (!shortDescription) return res.status(400).json({ error: "Short description is required" });

    const finalImpact = impact || 3;
    const finalUrgency = urgency || 3;
    const priority = calculatePriority(finalImpact, finalUrgency);
    const number = await generateTicketNumber("PROBLEM");

    const problem = await prisma.ticket.create({
      data: {
        number, type: "PROBLEM", shortDescription, description, category, assignmentGroup,
        impact: finalImpact, urgency: finalUrgency, priority,
        state: "New", rootCause, workaround, openedById: req.user.id,
      },
    });

    await prisma.activity.create({
      data: { ticketId: problem.id, userId: req.user.id, kind: "field_change", field: "state", newValue: "New", body: `Problem ${number} created` },
    });

    res.status(201).json(problem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the problem" });
  }
});

router.patch("/:number", requireAuth, requireEmployee, async (req, res) => {
  try {
    const existing = await prisma.ticket.findUnique({ where: { number: req.params.number } });
    if (!existing) return res.status(404).json({ error: "Problem not found" });

    const { state, rootCause, workaround, resolutionNotes, assignedToId, assignmentGroup } = req.body;
    const updateData = {};
    const logs = [];

    if (state && state !== existing.state) {
      updateData.state = state;
      logs.push({ field: "state", oldValue: existing.state, newValue: state });
      if (state === "Closed") updateData.closedAt = new Date();
    }
    if (rootCause) updateData.rootCause = rootCause;
    if (workaround) updateData.workaround = workaround;
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
    res.status(500).json({ error: "Something went wrong updating the problem" });
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