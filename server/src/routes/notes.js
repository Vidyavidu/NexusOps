import express from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:number/notes", requireAuth, async (req, res) => {
  try {
    const { kind, body } = req.body;
    if (!body) return res.status(400).json({ error: "Note text is required" });
    if (!["work_note", "comment"].includes(kind)) {
      return res.status(400).json({ error: "Invalid note type" });
    }

    const ticket = await prisma.ticket.findUnique({ where: { number: req.params.number } });
    if (!ticket) return res.status(404).json({ error: "Record not found" });

    const activity = await prisma.activity.create({
      data: { ticketId: ticket.id, userId: req.user.id, kind, body },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong adding the note" });
  }
});

export default router;