import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import Catalog from "./pages/Catalog";
import Knowledge from "./pages/Knowledge";
import Approvals from "./pages/Approvals";
import Layout from "./components/Layout";

function RegisterInApp() {
  return (
    <Layout>
      <Register />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={localStorage.getItem("token") ? <RegisterInApp /> : <Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/incidents" element={<TicketList endpoint="incidents" title="Incidents" />} />
        <Route path="/incidents/:number" element={<TicketDetail endpoint="incidents" />} />

        <Route path="/problems" element={<TicketList endpoint="problems" title="Problems" />} />
        <Route path="/problems/:number" element={<TicketDetail endpoint="problems" />} />

        <Route path="/changes" element={<TicketList endpoint="changes" title="Changes" />} />
        <Route path="/changes/:number" element={<TicketDetail endpoint="changes" />} />

        <Route path="/requests" element={<TicketList endpoint="requests" title="Requests" />} />
        <Route path="/requests/:number" element={<TicketDetail endpoint="requests" />} />

        <Route path="/catalog" element={<Catalog />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/approvals" element={<Approvals />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
