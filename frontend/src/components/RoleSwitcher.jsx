import { useEffect, useState } from "react";
import { setDevRole } from "../utils/api";

export default function RoleSwitcher() {
  const [role, setRole] = useState("system_admin");

  useEffect(() => {
    if (role === "system_admin") setDevRole({ id: "sys1", role, shopId: "central" });
    if (role === "support") setDevRole({ id: "u1", role, shopId: "shop1" });
    if (role === "shop_owner") setDevRole({ id: "owner1", role, shopId: "shop1" });
  }, [role]);

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-muted small">Role:</span>
      <select className="form-select form-select-sm" style={{ width: 180 }} value={role} onChange={e => setRole(e.target.value)}>
        <option value="system_admin">System Admin</option>
        <option value="support">Support (Shop)</option>
        <option value="shop_owner">Shop Owner</option>
      </select>
    </div>
  );
}
