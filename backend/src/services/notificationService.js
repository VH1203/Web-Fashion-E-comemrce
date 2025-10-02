const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: false,
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});


async function sendOtpEmail(to, otp, purpose) {
const info = await transporter.sendMail({
from: `DFS Auth <${process.env.SMTP_USER}>`,
to,
subject: `[DFS] OTP ${purpose} của bạn`,
text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
html: `<p>Mã OTP của bạn là: <b>${otp}</b>. Mã có hiệu lực trong 10 phút.</p>`
});
return info.messageId;
}


module.exports = { sendOtpEmail };