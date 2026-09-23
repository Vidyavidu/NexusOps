const SLA_HOURS = { 1: 4, 2: 8, 3: 24, 4: 48, 5: 72 };

export function slaInfo(ticket) {
  const hours = SLA_HOURS[ticket.priority] || 72;
  const deadline = new Date(new Date(ticket.createdAt).getTime() + hours * 3600 * 1000);
  const closed = ["Closed", "Resolved"].includes(ticket.state);
  if (closed) return { label: "SLA Met", color: "#3ecf8e" };
  const diffMs = deadline - new Date();
  if (diffMs <= 0) return { label: "SLA Breached", color: "#e5484d" };
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { label: `${hrs}h ${mins}m left`, color: "#4a9eff" };
}

export function SlaBadge({ ticket }) {
  const info = slaInfo(ticket);
  return <span style={{ fontSize: "11px", color: info.color, fontWeight: 600 }}>{info.label}</span>;
}