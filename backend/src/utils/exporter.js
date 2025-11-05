const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

exports.buildExcelBuffer = async ({ revenueDay, status, topProducts, topCustomers }) => {
  const wb = new ExcelJS.Workbook();
  const ws1 = wb.addWorksheet("Revenue (Day)");
  ws1.columns = [ { header: "Date", key: "date", width: 14 }, { header: "Revenue", key: "revenue", width: 14 }, { header: "Orders", key: "orders", width: 10 } ];
  ws1.addRows(revenueDay);

  const ws2 = wb.addWorksheet("Order Status");
  ws2.columns = [ { header: "Status", key: "status", width: 24 }, { header: "Count", key: "count", width: 10 } ];
  ws2.addRows(status);

  const ws3 = wb.addWorksheet("Top Products");
  ws3.columns = [ { header: "Product", key: "name", width: 30 }, { header: "Qty", key: "qty", width: 10 }, { header: "Revenue", key: "revenue", width: 14 } ];
  ws3.addRows(topProducts);

  const ws4 = wb.addWorksheet("Top Customers");
  ws4.columns = [ { header: "Name", key: "name", width: 26 }, { header: "Email", key: "email", width: 28 }, { header: "Phone", key: "phone", width: 16 }, { header: "Orders", key: "orders", width: 10 }, { header: "Spend", key: "spend", width: 14 } ];
  ws4.addRows(topCustomers);

  return wb.xlsx.writeBuffer();
};

exports.buildPdfBuffer = async ({ revenueDay, status, topProducts, topCustomers }) => new Promise((resolve) => {
  const doc = new PDFDocument({ size: "A4", margin: 36 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => resolve(Buffer.concat(chunks)));

  doc.fontSize(18).text("DFS – Shop Dashboard Report", { align: "center" }).moveDown(1);

  doc.fontSize(12).text("Revenue (by day)");
  revenueDay.forEach(r => doc.text(`${r.date}  —  ${r.revenue.toLocaleString("vi-VN")} VND  (${r.orders} orders)`));
  doc.moveDown(1);

  doc.fontSize(12).text("Order Status");
  status.forEach(s => doc.text(`${s.status}: ${s.count}`));
  doc.moveDown(1);

  doc.fontSize(12).text("Top Products");
  topProducts.forEach(p => doc.text(`${p.name} – Qty: ${p.qty} – Rev: ${p.revenue.toLocaleString("vi-VN")} VND`));
  doc.moveDown(1);

  doc.fontSize(12).text("Top VIP Customers");
  topCustomers.forEach(c => doc.text(`${c.name} – ${c.email} – Orders: ${c.orders} – Spend: ${c.spend.toLocaleString("vi-VN")} VND`));

  doc.end();
});
