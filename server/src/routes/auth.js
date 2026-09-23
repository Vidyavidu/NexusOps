import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { requireAuth, requireEmployee } from "../middleware/auth.js";

const router = express.Router();

// REGISTER — only an existing employee can create a new login
router.post("/register", requireAuth, requireEmployee, async (req, res) => {
  try {
    const { email, password, name, employeeId, phone, department } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, employeeId, phone, department, role: "EMPLOYEE" },
    });

    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        employeeId: user.employeeId, phone: user.phone, department: user.department,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong during login" });
  }
});

export default router;