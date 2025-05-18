const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // hoặc SMTP server bạn đang dùng
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HỆ THỐNG E-Learning do sinh viên CT5 PHÁT TRIỂN" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error;
  }
};

module.exports = sendEmail;
