import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../API/client";
import Layout from "../components/Layout";
import { PriorityBadge, StateBadge } from "../components/Badge";
import { SlaBadge } from "../components/Sla";

const STATE_OPTIONS = {
  incidents: ["New", "In Progress", "On Hold", "Resolved", "Closed"],
  problems: ["New", "In Progress", "Closed"],
  changes: ["New", "Assess", "Authorize", "Scheduled", "Implement", "Review", "Closed", "Rejected"],
  requests: ["New", "In Progress", "Closed"],
};

const GROUPS = ["L1 Service Desk", "L2 Network", "L2 Hardware", "L2 Software", "Database Team", "Security Team"];

function TicketDetail({ endpoint }) {
  const { number } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [newState, setNewState] = useState("");
  const [assignmentGroup, setAssignmentGroup] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionCode, setResolutionCode] = useState("Solved");
  const [error, setError] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteKind, setNoteKind] = useState("comment");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => { load(); }, [number]);

  async function load() {
    try {
      const res = await api.get(`/${endpoint}/${number}`);
      setTicket(res.data);
      setNewState(res.data.state);
      setAssignmentGroup(res.data.assignmentGroup || "");
    } catch (err) {
      setError("Could not load record");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    const payload = { state: newState, assignmentGroup };
    if (newState === "Resolved" || newState === "Closed") {
      payload.resolutionCode = resolutionCode;
      payload.resolutionNotes = resolutionNotes;
    }
    try {
      await api.patch(`/${endpoint}/${number}`, payload);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update record");
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    try {
      await api.post(`/tickets/${number}/notes`, { kind: noteKind, body: noteBody });
      setNoteBody("");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add note");
    }
  }
  async function handleDelete() {
  if (!window.confirm(`Delete ${ticket.number}? This cannot be undone.`)) return;
  try {
    await api.delete(`/${endpoint}/${number}`);
    navigate(`/${endpoint}`);
  } catch (err) {
    setError(err.response?.data?.error || "Could not delete record");
  }
}

  if (error && !ticket) return <Layout><p style={{ color: "#e5484d" }}>{error}</p></Layout>;
  if (!ticket) return <Layout><p>Loading...</p></Layout>;

  const caller = ticket.openedBy;

  return (
    <Layout>
      <button className="secondary" onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>← Back</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px" }}>
        <div>
          <div className="ticket-number" style={{ color: "#f5a623", fontSize: "13px" }}>{ticket.number}</div>
          <h1 style={{ fontSize: "20px", marginTop: "4px" }}>{ticket.shortDescription}</h1>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <StateBadge state={ticket.state} />
          <PriorityBadge priority={ticket.priority} />
          <SlaBadge ticket={ticket} />
           {user?.role === "EMPLOYEE" && (
             <button className="danger" onClick={handleDelete} style={{ marginLeft: "8px" }}>Delete</button>
           )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#8a8f9c", marginBottom: "12px" }}>Description</h3>
            <p style={{ fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{ticket.description || "No description provided."}</p>
            {ticket.category && <p style={{ marginTop: "12px", fontSize: "13px" }}><strong>Category:</strong> {ticket.category}</p>}
            {ticket.rootCause && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Root Cause:</strong> {ticket.rootCause}</p>}
            {ticket.workaround && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Workaround:</strong> {ticket.workaround}</p>}
            {ticket.riskLevel && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Risk:</strong> {ticket.riskLevel}</p>}
            {ticket.requestedItem && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Requested Item:</strong> {ticket.requestedItem}</p>}
          </div>

          <div className="card">
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#8a8f9c", marginBottom: "12px" }}>Activity</h3>
            {ticket.activities?.length === 0 && <p style={{ fontSize: "13px", color: "#8a8f9c" }}>No activity yet.</p>}
            {ticket.activities?.map((a) => (
              <div key={a.id} style={{ borderLeft: "2px solid #2a2f3a", paddingLeft: "12px", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#8a8f9c" }}>
                  {a.user?.name} · {new Date(a.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", marginTop: "2px" }}>
                  {a.kind === "work_note" && <span style={{ fontSize: "10px", color: "#f5a623", marginRight: "6px" }}>[WORK NOTE]</span>}
                  {a.kind === "comment" && <span style={{ fontSize: "10px", color: "#4a9eff", marginRight: "6px" }}>[COMMENT]</span>}
                  {a.body || `${a.field} changed: ${a.oldValue || "—"} → ${a.newValue}`}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="card" style={{ marginTop: "16px" }}>
            <label>Add {noteKind === "work_note" ? "Work Note (internal)" : "Comment (visible to caller)"}</label>
            <textarea rows={2} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} required />
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <select value={noteKind} onChange={(e) => setNoteKind(e.target.value)} style={{ width: "auto" }}>
                <option value="comment">Comment</option>
                {user?.role === "EMPLOYEE" && <option value="work_note">Work Note</option>}
              </select>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>

        <div>
          {user?.role === "EMPLOYEE" && (
            <form onSubmit={handleUpdate} className="card" style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#8a8f9c", marginBottom: "4px" }}>Update Record</h3>
              <label>State</label>
              <select value={newState} onChange={(e) => setNewState(e.target.value)}>
                {(STATE_OPTIONS[endpoint] || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label>Assignment Group</label>
              <select value={assignmentGroup} onChange={(e) => setAssignmentGroup(e.target.value)}>
                <option value="">Unassigned</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>

              {(newState === "Resolved" || newState === "Closed") && (
                <>
                  <label>Resolution Code</label>
                  <select value={resolutionCode} onChange={(e) => setResolutionCode(e.target.value)}>
                    <option>Solved</option>
                    <option>Workaround</option>
                    <option>Not Reproducible</option>
                  </select>
                  <label>Resolution Notes</label>
                  <textarea rows={3} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} required />
                </>
              )}

              {error && <p style={{ color: "#e5484d", fontSize: "12px", marginTop: "10px" }}>{error}</p>}
              <button type="submit" style={{ marginTop: "16px", width: "100%" }}>Save Changes</button>
            </form>
          )}

          <div className="card">
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#8a8f9c", marginBottom: "10px" }}>Caller Details</h3>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Name:</span> {caller?.name || "—"}</p>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Employee ID:</span> {caller?.employeeId || "—"}</p>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Email:</span> {caller?.email || "—"}</p>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Phone:</span> {caller?.phone || "—"}</p>
            <p style={{ fontSize: "12px" }}><span style={{ color: "#8a8f9c" }}>Department:</span> {caller?.department || "—"}</p>
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#8a8f9c", marginBottom: "10px" }}>Assignment</h3>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Group:</span> {ticket.assignmentGroup || "Unassigned"}</p>
            <p style={{ fontSize: "12px", marginBottom: "6px" }}><span style={{ color: "#8a8f9c" }}>Assigned to:</span> {ticket.assignedTo?.name || "Unassigned"}</p>
            <p style={{ fontSize: "12px" }}><span style={{ color: "#8a8f9c" }}>Created:</span> {new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default TicketDetail;