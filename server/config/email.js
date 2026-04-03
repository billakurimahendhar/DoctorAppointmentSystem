import nodemailer from "nodemailer";

const emailUser = (process.env.EMAIL_USER || "").trim();
let emailPass = (process.env.EMAIL_PASS || "").trim();
console.log(emailUser);
console.log(process.env.EMAIL_USER);



// Remove wrapping quotes, which can be introduced by some .env editors
if (/^".*"$/.test(emailPass)) {
  emailPass = emailPass.slice(1, -1).trim();
}

if (!emailUser || !emailPass) {
  console.error("❌ EMAIL_USER / EMAIL_PASS not set. Email functionality is disabled.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
    method: "LOGIN", // enforce explicit login method for better compatibility
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/*transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer transporter verification failed:", error.message);
  } else {
    console.log("✅ Nodemailer transporter ready");
  }
});*/

export const sendEmail = async (to, subject, html) => {
  if (!emailUser || !emailPass) {
    throw new Error("Email settings are not configured. Set EMAIL_USER and EMAIL_PASS in .env.");
  }

  try {
    await transporter.sendMail({
      from: `"MediConnect" <${emailUser}>`,
      to,
      subject,
      html,
    });
    console.log("📨 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email sending error:", err.message);
    throw err;
  }
};
