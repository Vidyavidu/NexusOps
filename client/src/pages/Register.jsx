import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../API/client";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", employeeId: "", phone: "", department: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate(loggedIn ? "/dashboard" : "/"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  }

  const content = (
    <div style={{ width: "380px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontWeight: 700, fontSize: "22px" }}>
          NEXUS<span style={{ color: "#f5a623" }}>OPS</span>
        </div>
        <div style={{ fontSize: "12px", color: "#8a8f9c", marginTop: "4px" }}>Create Employee Account</div>
      </div>

      {success ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#3ecf8e", fontSize: "13px" }}>Account created. Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
          <label>Employee ID</label>
          <input value={form.employeeId} onChange={(e) => update("employeeId", e.target.value)} placeholder="e.g. EMP1024" />
          <label>Phone Number</label>
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 9876543210" />
          <label>Department</label>
          <input value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="e.g. IT, HR, Finance" />
          {error && <p style={{ color: "#e5484d", fontSize: "12px", marginTop: "12px" }}>{error}</p>}
          <button type="submit" style={{ width: "100%", marginTop: "20px" }}>Create Account</button>
        </form>
      )}

      {!loggedIn && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#8a8f9c", marginTop: "16px" }}>
          Already have an account? <Link to="/">Log in</Link>
        </p>
      )}
    </div>
  );

  if (loggedIn) {
    // Rendered inside the app shell if an employee is creating another account
    return content;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0f1115" }}>
      {content}
    </div>
  );
}

export default Register;