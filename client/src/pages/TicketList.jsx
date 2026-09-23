import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/client";
import Layout from "../components/Layout";
import { PriorityBadge, StateBadge } from "../components/Badge";

const GROUPS = ["L1 Service Desk", "L2 Network", "L2 Hardware", "L2 Software", "Database Team", "Security Team"];

function TicketList({ endpoint, title }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ shortDescription: "", description: "", impact: 3, urgency: 3, category: "", assignmentGroup: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const canCreate = user?.role === "EMPLOYEE" || endpoint === "incidents" || endpoint === "requests";

  useEffect(() => { load(); }, [endpoint]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/${endpoint}`);
      setTickets(res.data);
    } catch (err) {
      setError("Could not load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/${endpoint}`, { ...form, impact: Number(form.impact), urgency: Number(form.urgency) });
      setForm({ shortDescription: "", description: "", impact: 3, urgency: 3, category: "", assignmentGroup: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create record");
    }
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px" }}>{title}</h1>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : `+ New ${title.slice(0, -1)}`}</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: "24px" }}>
          <label>Short Description</label>
          <input
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            required
          />
          <label>Long Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide full details of the issue or request..."
          />
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Network, Hardware" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Assignment Group</label>
              <select value={form.assignmentGroup} onChange={(e) => setForm({ ...form, assignmentGroup: e.target.value })}>
                <option value="">Unassigned</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Impact</label>
              <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                <option value={1}>1 - High</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - Low</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Urgency</label>
              <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value={1}>1 - High</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - Low</option>
              </select>
            </div>
          </div>
          {error && <p style={{ color: "#e5484d", marginTop: "12px", fontSize: "13px" }}>{error}</p>}
          <button type="submit" style={{ marginTop: "16px" }}>Submit</button>
        </form>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading...</p>
        ) : tickets.length === 0 ? (
          <p style={{ padding: "20px", color: "#8a8f9c" }}>No records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Short Description</th>
                <th>State</th>
                <th>Priority</th>
                <th>Assignment Group</th>
                <th>Opened By</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/${endpoint}/${t.number}`)}>
                  <td className="ticket-number" style={{ color: "#f5a623" }}>{t.number}</td>
                  <td>{t.shortDescription}</td>
                  <td><StateBadge state={t.state} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td style={{ fontSize: "12px", color: "#8a8f9c" }}>{t.assignmentGroup || "—"}</td>
                  <td>{t.openedBy?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default TicketList;