import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./src/routes/auth.js";
import incidentRoutes from "./src/routes/incidents.js";
import problemRoutes from "./src/routes/problems.js";
import changeRoutes from "./src/routes/changes.js";
import requestRoutes from "./src/routes/requests.js";
import notesRoutes from "./src/routes/notes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "NexusOps API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/changes", changeRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/tickets", notesRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});