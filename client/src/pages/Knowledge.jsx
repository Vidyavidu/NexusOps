import { useState } from "react";
import Layout from "../components/Layout";

const ARTICLES = [
  { id: 1, title: "How to reset your password", category: "Account", body: "1. Open the login page.\n2. Click 'Forgot Password'.\n3. Enter your registered email.\n4. Follow the emailed link to set a new password." },
  { id: 2, title: "Troubleshooting VPN connection issues", category: "Network", body: "1. Confirm your internet connection is active.\n2. Restart the VPN client.\n3. Re-enter your credentials.\n4. If the issue persists, raise an Incident under category Network." },
  { id: 3, title: "Requesting new hardware", category: "Hardware", body: "Hardware requests such as laptops or monitors should go through the Service Catalog rather than as an Incident, since nothing existing is broken." },
  { id: 4, title: "Understanding ticket priority", category: "General", body: "Priority is calculated automatically from Impact and Urgency, not chosen directly. Impact 1 (High) with Urgency 1 (High) produces the highest priority, P1." },
];

function Knowledge() {
  const [selected, setSelected] = useState(null);

  return (
    <Layout>
      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>Knowledge Base</h1>
      <p style={{ fontSize: "13px", color: "#8a8f9c", marginBottom: "24px" }}>Find answers before raising a ticket.</p>

      {selected ? (
        <div className="card" style={{ maxWidth: "640px" }}>
          <button className="secondary" onClick={() => setSelected(null)} style={{ marginBottom: "16px" }}>← Back</button>
          <div style={{ fontSize: "11px", color: "#8a8f9c", textTransform: "uppercase" }}>{selected.category}</div>
          <h2 style={{ margin: "6px 0 16px" }}>{selected.title}</h2>
          <p style={{ fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-line" }}>{selected.body}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px", maxWidth: "640px" }}>
          {ARTICLES.map((a) => (
            <div key={a.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSelected(a)}>
              <div style={{ fontSize: "11px", color: "#8a8f9c", textTransform: "uppercase" }}>{a.category}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>{a.title}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Knowledge;