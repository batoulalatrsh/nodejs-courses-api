const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP server is ready");
  } catch (err) {
    console.error("❌ SMTP verify failed:", err);
  }

  // 2) Define email option (like: from, to, subject, email content) and send it
  const info = await transporter.sendMail({
    from: "Aether Team <aetheracademy123@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};
