// ================================
// 📧 DFS - Notification Service
// ================================
const nodemailer = require("nodemailer");

// Hàm gửi email OTP / thông báo hệ thống
exports.sendEmail = async (to, subject, text) => {
  try {
    if (!to) throw new Error("Thiếu địa chỉ email người nhận");

    // ⚙️ Cấu hình transporter từ .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Daily Fit System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Đã gửi email tới ${to} với tiêu đề: ${subject}`);
    return true;
  } catch (err) {
    console.error("❌ Lỗi khi gửi email:", err.message);
    throw new Error("Không thể gửi email");
  }
};
