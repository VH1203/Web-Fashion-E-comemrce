import React from "react";
export default function PriorityBadge({ value }) {
  const map = { low:"secondary", medium:"info", high:"warning", critical:"danger" };
  return <span className={`badge text-bg-${map[value] || "secondary"}`}>{value}</span>;
}
