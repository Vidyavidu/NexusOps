import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../API/client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0f1115" }}>
      <div style={{ width: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontWeight: 700, fontSize: "22px", letterSpacing: "0.5px" }}>
            NEXUS<span style={{ color: "#f5a623" }}>OPS</span>
          </div>
          <div style={{ fontSize: "12px", color: "#8a8f9c", marginTop: "4px" }}>IT Service Management</div>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: "#e5484d", fontSize: "12px", marginTop: "12px" }}>{error}</p>}
          <button type="submit" style={{ width: "100%", marginTop: "20px" }}>Sign In</button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#8a8f9c", marginTop: "16px" }}>
          Employee? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;