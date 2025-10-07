import React from "react";
export default function StatusBadge({ value }) {
  const map = {
    intake:"secondary", routed:"info", assigned:"primary",
    processing:"primary", waiting_customer:"warning",
    escalated_to_owner:"dark", escalated:"dark",
    approved:"success", rejected:"danger",
    resolved:"success", closed:"secondary",
    returned_to_system:"secondary", pending:"secondary",
  };
  const color = map[value] || "secondary";
  return <span className={`badge text-bg-${color}`}>{value}</span>;
}
