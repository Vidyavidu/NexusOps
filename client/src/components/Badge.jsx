export function PriorityBadge({ priority }) {
  return <span className={`badge badge-p${priority}`}>P{priority}</span>;
}

export function StateBadge({ state }) {
  return <span className="badge badge-state">{state}</span>;
}