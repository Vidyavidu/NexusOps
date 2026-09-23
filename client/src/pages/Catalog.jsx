import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/client";
import Layout from "../components/Layout";

const CATALOG = [
  { id: "laptop", name: "New Laptop", category: "Hardware", desc: "Request a new company laptop." },
  { id: "monitor", name: "Extra Monitor", category: "Hardware", desc: "Request an additional monitor." },
  { id: "vpn", name: "VPN Access", category: "Access", desc: "Request VPN access for remote work." },
  { id: "software", name: "Software Installation", category: "Software", desc: "Request installation of approved software." },
  { id: "password", name: "Password Reset", category: "Account", desc: "Request a password reset for an account." },
];

function Catalog() {
  const [active, setActive] = useState(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    try {
      await api.post("/requests", {
        shortDescription: active.name,
        description: reason,
        requestedItem: active.name,
        category: active.category,
      });
      setSubmitted(true);
      setTimeout(() => navigate("/requests"), 1200);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>Service Catalog</h1>
      <p style={{ fontSize: "13px", color: "#8a8f9c", marginBottom: "24px" }}>Browse available services and submit a request.</p>

      {!active ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {CATALOG.map((item) => (
            <div key={item.id} className="card" style={{ cursor: "pointer" }} onClick={() => setActive(item)}>
              <div style={{ fontSize: "11px", color: "#8a8f9c", textTransform: "uppercase" }}>{item.category}</div>
              <div style={{ fontSize: "15px", fontWeight: 600, margin: "6px 0" }}>{item.name}</div>
              <div style={{ fontSize: "12px", color: "#8a8f9c" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      ) : submitted ? (
        <div className="card"><p style={{ color: "#3ecf8e" }}>Request submitted. Redirecting...</p></div>
      ) : (
        <form onSubmit={handleRequest} className="card" style={{ maxWidth: "420px" }}>
          <button type="button" className="secondary" onClick={() => setActive(null)} style={{ marginBottom: "16px" }}>← Back to Catalog</button>
          <h3>{active.name}</h3>
          <label>Reason for request</label>
          <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required />
          <button type="submit" style={{ marginTop: "16px" }}>Submit Request</button>
        </form>
      )}
    </Layout>
  );
}

export default Catalog;