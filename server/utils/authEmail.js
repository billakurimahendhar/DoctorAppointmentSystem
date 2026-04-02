import { sendEmail } from "../config/email.js";

const getClientBaseUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const buildClientLink = (path, params = {}) => {
  const url = new URL(`${getClientBaseUrl()}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const sendVerificationEmail = async ({ email, name, role, token }) => {
  const verifyUrl = buildClientLink("/verify-email", { role, token });
  const subject = "Verify your email";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Verify your email</h2>
      <p>Hello ${name || "there"},</p>
      <p>Please confirm your ${role} account to continue using MediConnect.</p>
      <p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;"
        >
          Verify email
        </a>
      </p>
      <p>If the button does not work, open this link:</p>
      <p>${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async ({ email, name, role, token }) => {
  const resetUrl = buildClientLink("/reset-password", { role, token });
  const subject = "Reset your password";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Reset your password</h2>
      <p>Hello ${name || "there"},</p>
      <p>We received a request to reset your ${role} account password.</p>
      <p>
        <a
          href="${resetUrl}"
          style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;"
        >
          Reset password
        </a>
      </p>
      <p>If the button does not work, open this link:</p>
      <p>${resetUrl}</p>
      <p>This link expires in 30 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};
