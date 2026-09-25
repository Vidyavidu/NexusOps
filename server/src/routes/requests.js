import express from "express";
import prisma from "../lib/prisma.js";
import { generateTicketNumber } from "../lib/numbering.js";
import { calculatePriority } from "../lib/priority.js";
import { requireAuth, requireEmployee } from "../middleware/auth.js";

const router = express.Router();
const CALLER_SELECT = { select: { name: true, email: true, employeeId: true, phone: true, department: true } };

router.get("/", requireAuth, async (req, res) => {
  try {
    const requests = await prisma.ticket.findMany({
      where: { type: "REQUEST" },
      orderBy: { createdAt: "desc" },
      include: { openedBy: CALLER_SELECT, assignedTo: CALLER_SELECT },
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching requests" });
  }
});

router.get("/:number", requireAuth, async (req, res) => {
  try {
    const request = await prisma.ticket.findUnique({
      where: { number: req.params.number },
      include: {
        openedBy: CALLER_SELECT,
        assignedTo: CALLER_SELECT,
        activities: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
      },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching the request" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { shortDescription, description, requestedItem, category, assignmentGroup } = req.body;
    if (!shortDescription) return res.status(400).json({ error: "Short description is required" });

    const number = await generateTicketNumber("REQUEST");

    const request = await prisma.ticket.create({
      data: {
        number, type: "REQUEST", shortDescription, description, category, assignmentGroup,
        impact: 3, urgency: 3, priority: calculatePriority(3, 3),
        state: "New", stage: "Requested", requestedItem, openedById: req.user.id,
      },
    });

    await prisma.activity.create({
      data: { ticketId: request.id, userId: req.user.id, kind: "field_change", field: "state", newValue: "New", body: `Request ${number} created` },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the request" });
  }
});

router.patch("/:number", requireAuth, requireEmployee, async (req, res) => {
  try {
    const existing = await prisma.ticket.findUnique({ where: { number: req.params.number } });
    if (!existing) return res.status(404).json({ error: "Request not found" });

    const { state, stage, assignedToId, assignmentGroup } = req.body;
    const updateData = {};
    const logs = [];

    if (state && state !== existing.state) {
      updateData.state = state;
      logs.push({ field: "state", oldValue: existing.state, newValue: state });
      if (state === "Closed") updateData.closedAt = new Date();
    }
    if (stage) updateData.stage = stage;
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
    res.status(500).json({ error: "Something went wrong updating the request" });
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