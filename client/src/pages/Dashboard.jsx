import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/client";
import Layout from "../components/Layout";
import { PriorityBadge, StateBadge } from "../components/Badge";

function Dashboard() {
  const [counts, setCounts] = useState({ incidents: 0, problems: 0, changes: 0, requests: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/"); return; }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [inc, prob, chg, req] = await Promise.all([
        api.get("/incidents"),
        api.get("/problems"),
        api.get("/changes"),
        api.get("/requests"),
      ]);

      setCounts({
        incidents: inc.data.filter((t) => t.state !== "Closed" && t.state !== "Resolved").length,
        problems: prob.data.filter((t) => t.state !== "Closed").length,
        changes: chg.data.filter((t) => t.state !== "Closed").length,
        requests: req.data.filter((t) => t.state !== "Closed").length,
      });

      const all = [...inc.data, ...prob.data, ...chg.data, ...req.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
      setRecent(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: "Open Incidents", value: counts.incidents, path: "/incidents", color: "#e5484d" },
    { label: "Open Problems", value: counts.problems, path: "/problems", color: "#f5a623" },
    { label: "Active Changes", value: counts.changes, path: "/changes", color: "#4a9eff" },
    { label: "Pending Requests", value: counts.requests, path: "/requests", color: "#3ecf8e" },
  ];

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p style={{ fontSize: "13px", color: "#8a8f9c", marginBottom: "28px" }}>Here's what's happening across your service desk.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ cursor: "pointer", borderTop: `2px solid ${c.color}` }} onClick={() => navigate(c.path)}>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>{loading ? "—" : c.value}</div>
            <div style={{ fontSize: "12px", color: "#8a8f9c", marginTop: "4px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "15px", marginBottom: "12px", color: "#8a8f9c", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recent Activity</h2>
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading...</p>
        ) : recent.length === 0 ? (
          <p style={{ padding: "20px", color: "#8a8f9c" }}>No records yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Number</th><th>Description</th><th>State</th><th>Priority</th></tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/${t.type.toLowerCase()}s/${t.number}`)}>
                  <td className="ticket-number" style={{ color: "#f5a623" }}>{t.number}</td>
                  <td>{t.shortDescription}</td>
                  <td><StateBadge state={t.state} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;