import nodemailer from "nodemailer";
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass Exists:", !!process.env.EMAIL_PASS);



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"MediConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📨 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email sending error:", err.message);
  }
};
