// src/utils/exportCsv.js
const { Parser } = require("json2csv");

function toISO(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

function ticketsToCsv(tickets = []) {
  // đảm bảo là plain objects (nếu là mongoose docs)
  const rows = tickets.map((t) => {
    const o = typeof t.toObject === "function" ? t.toObject() : t;
    return {
      ...o,
      tags: Array.isArray(o.tags) ? o.tags.join("|") : "",
      createdAt: toISO(o.createdAt),
      updatedAt: toISO(o.updatedAt),
      sla: {
        ...(o.sla || {}),
        createdAt: toISO(o.sla?.createdAt),
        firstResponseAt: toISO(o.sla?.firstResponseAt),
        resolvedAt: toISO(o.sla?.resolvedAt),
      },
    };
  });

  const fields = [
    "code",
    "orderId",
    "customerId",
    "type",
    "status",
    "priority",
    "channel",
    "tags",
    "createdAt",
    "updatedAt",
    "sla.createdAt",
    "sla.firstResponseAt",
    "sla.resolvedAt",
  ];

  const parser = new Parser({
    fields,
    defaultValue: "",
    flatten: true,              // <— quan trọng để hiểu "sla.*"
    flattenSeparator: ".",      // dùng dấu chấm đúng như fields
  });

  return parser.parse(rows);
}

module.exports = { ticketsToCsv };
