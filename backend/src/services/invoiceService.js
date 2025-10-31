const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

exports.generateInvoice = async (order) => {
  const dir = path.join(__dirname, "../public/invoices");
  ensureDir(dir);
  const file = path.join(dir, `${order.order_code}.pdf`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  doc.fontSize(18).text("DFS – Hóa đơn điện tử", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Mã đơn: ${order.order_code}`);
  doc.text(`Ngày: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Khách hàng: ${order.user_id}`);
  doc.text(`PTTT: ${order.payment_method} – ${order.payment_status}`);

  doc.moveDown(1);
  doc.fontSize(11).text("Sản phẩm", 50, doc.y, { continued: true });
  doc.text("SL", 300, undefined, { width: 50, align: "right", continued: true });
  doc.text("Đơn giá", 360, undefined, { width: 80, align: "right", continued: true });
  doc.text("Thành tiền", 450, undefined, { width: 100, align: "right" });
  doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();

  (order.items || []).forEach((it) => {
    const total = Number(it.total || it.price * it.qty);
    doc.text(it.name, 50, doc.y + 6, { continued: true });
    doc.text(String(it.qty), 300, undefined, { width: 50, align: "right", continued: true });
    doc.text(`${Number(it.price).toLocaleString()} VND`, 360, undefined, { width: 80, align: "right", continued: true });
    doc.text(`${total.toLocaleString()} VND`, 450, undefined, { width: 100, align: "right" });
  });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.text(`Phí vận chuyển: ${Number(order.shipping_fee).toLocaleString()} VND`, { align: "right" });
  doc.text(`Tổng thanh toán: ${Number(order.total_price).toLocaleString()} VND`, { align: "right" });

  doc.moveDown(1);
  doc.fontSize(9).text("* Hóa đơn tự động tạo bởi DFS.", { align: "right" });

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));
  return `${process.env.API_URL}/static/invoices/${order.order_code}.pdf`;
};
