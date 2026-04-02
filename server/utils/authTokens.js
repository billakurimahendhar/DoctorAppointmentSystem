import crypto from "crypto";

const TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createToken = () => crypto.randomBytes(TOKEN_BYTES).toString("hex");

export const assignEmailVerificationToken = (user) => {
  const token = createToken();

  user.emailVerified = false;
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  return token;
};

export const assignPasswordResetToken = (user) => {
  const token = createToken();

  user.resetPasswordToken = hashToken(token);
  user.resetPasswordExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  return token;
};

export const clearEmailVerificationToken = (user) => {
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
};

export const clearPasswordResetToken = (user) => {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
};
