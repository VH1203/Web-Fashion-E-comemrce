import React from "react";
import { Navigate } from "react-router-dom";

function getRole() {
  return localStorage.getItem("devRole") || "system_admin"; // mặc định sys admin để thấy intake
}
function isAuthed() {
  return localStorage.getItem("devAuth") === "1";
}

export default function ProtectedRoute({ allowedRoles = [], children }) {
  if (!isAuthed()) localStorage.setItem("devAuth", "1"); // coi như đã login khi dev

  const role = getRole();
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <h1 className="p-4">403 - Forbidden (role: {role})</h1>;
  }
  return children;
}
