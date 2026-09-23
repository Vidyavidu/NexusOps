import { NavLink, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 20px",
    color: isActive ? "#f5a623" : "#8a8f9c",
    borderLeft: isActive ? "2px solid #f5a623" : "2px solid transparent",
    background: isActive ? "#1e222b" : "transparent",
    fontSize: "13px",
    fontWeight: 500,
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: "220px", background: "#171a21", borderRight: "1px solid #2a2f3a", flexShrink: 0, position: "relative" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #2a2f3a" }}>
          <div style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.5px" }}>
            NEXUS<span style={{ color: "#f5a623" }}>OPS</span>
          </div>
        </div>
        <nav style={{ paddingTop: "12px", paddingBottom: "100px" }}>
          <NavLink to="/dashboard" style={linkStyle}>Overview</NavLink>
          <NavLink to="/incidents" style={linkStyle}>Incidents</NavLink>
          <NavLink to="/problems" style={linkStyle}>Problems</NavLink>
          <NavLink to="/changes" style={linkStyle}>Changes</NavLink>
          <NavLink to="/requests" style={linkStyle}>Requests</NavLink>
          <NavLink to="/catalog" style={linkStyle}>Service Catalog</NavLink>
          <NavLink to="/knowledge" style={linkStyle}>Knowledge Base</NavLink>
          {user?.role === "EMPLOYEE" && <NavLink to="/approvals" style={linkStyle}>Approvals</NavLink>}
          {user?.role === "EMPLOYEE" && <NavLink to="/register" style={linkStyle}>+ New Employee</NavLink>}
        </nav>
        <div style={{ position: "absolute", bottom: 0, width: "220px", padding: "16px 20px", borderTop: "1px solid #2a2f3a" }}>
          <div style={{ fontSize: "12px", fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: "11px", color: "#8a8f9c", marginBottom: "10px" }}>{user?.role}</div>
          <button className="secondary" onClick={handleLogout} style={{ width: "100%", fontSize: "11px" }}>Log Out</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "32px", maxWidth: "1100px" }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;