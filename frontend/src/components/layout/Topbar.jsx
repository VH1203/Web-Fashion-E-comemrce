import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { applyDevHeaders } from "../../utils/api";

export default function Topbar() {
  const [role, setRole] = useState(localStorage.getItem("devRole") || "system_admin");

  useEffect(() => {
    localStorage.setItem("devRole", role);
    localStorage.setItem("devAuth", "1");
    applyDevHeaders();
  }, [role]);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">CSKH Console</Link>
        <div className="d-flex align-items-center gap-3">
          <NavLink className="nav-link" to="/admin/intake">Intake</NavLink>
          <NavLink className="nav-link" to="/support/tickets">Support</NavLink>
          <NavLink className="nav-link" to="/shop/desk">Owner</NavLink>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Role:</span>
            <select className="form-select form-select-sm" style={{ width: 160 }} value={role} onChange={e=>setRole(e.target.value)}>
              <option value="system_admin">System Admin</option>
              <option value="support">Support (Shop)</option>
              <option value="shop_owner">Shop Owner</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
