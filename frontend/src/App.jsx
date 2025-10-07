import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import SystemIntake from "./pages/support/SystemIntake.jsx";
import TicketList from "./pages/support/TicketList.jsx";
import TicketDetail from "./pages/support/TicketDetail.jsx";
import RoleSwitcher from "./components/RoleSwitcher.jsx";

export default function App() {
  return (
    <div className="container-fluid py-3">
      <header className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">
          <Link to="/" className="text-decoration-none text-dark">CSKH Console</Link>
        </h4>
        <nav className="d-flex gap-3">
          <NavLink className="nav-link" to="/system/intake">System Intake</NavLink>
          <NavLink className="nav-link" to="/support/tickets">Support Tickets</NavLink>
        </nav>
        <RoleSwitcher />
      </header>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/system/intake" element={<SystemIntake />} />
        <Route path="/support/tickets" element={<TicketList />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Routes>
    </div>
  );
}

function Landing() {
  const nav = useNavigate();
  return (
    <div className="p-4 border rounded-3 bg-light">
      <h5 className="mb-3">Chọn khu vực làm việc</h5>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={() => nav("/system/intake")}>System Intake</button>
        <button className="btn btn-outline-primary" onClick={() => nav("/support/tickets")}>Support Tickets</button>
      </div>
    </div>
  );
}
