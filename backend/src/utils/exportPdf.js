function ticketsToHtml(tickets=[]) {
  const rows = tickets.map(t => `
    <tr>
      <td>${t.code}</td><td>${t.type}</td><td>${t.status}</td>
      <td>${t.priority}</td><td>${t.customerId||""}</td>
      <td>${new Date(t.createdAt).toLocaleString()}</td>
    </tr>`).join("");

  return `
  <html><head><meta charset="utf-8"><style>
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;font-family:Arial;font-size:12px}
    th{background:#f4f6f8;text-align:left}
  </style></head><body>
    <h2>Ticket Report</h2>
    <table>
      <thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Priority</th><th>Customer</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`;
}
module.exports = { ticketsToHtml };
