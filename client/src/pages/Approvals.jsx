import { useState, useEffect } from "react";
import api from "../API/client";
import Layout from "../components/Layout";
import { PriorityBadge } from "../components/Badge";

function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/changes");
      setPending(res.data.filter((c) => c.state === "Authorize"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function decide(number, decision) {
    try {
      await api.patch(`/changes/${number}`, { state: decision === "approve" ? "Scheduled" : "Rejected" });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>Approvals</h1>
      <p style={{ fontSize: "13px", color: "#8a8f9c", marginBottom: "24px" }}>Change requests awaiting authorization.</p>

      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <div className="card"><p style={{ color: "#8a8f9c" }}>Nothing pending approval.</p></div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {pending.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="ticket-number" style={{ color: "#f5a623", fontSize: "12px" }}>{c.number}</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{c.shortDescription}</div>
                <div style={{ fontSize: "12px", color: "#8a8f9c" }}>Risk: {c.riskLevel || "Not specified"}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <PriorityBadge priority={c.priority} />
                <button className="secondary" onClick={() => decide(c.number, "reject")}>Reject</button>
                <button onClick={() => decide(c.number, "approve")}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Approvals;