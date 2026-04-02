import Notification from "../models/notification.model.js";
import { sendEmail } from "../config/email.js";

export const createNotification = async ({
  recipientId,
  recipientRole,
  title,
  message,
  type = "general",
  actionUrl = "",
  metadata = {},
  email,
}) => {
  if (!recipientId || !recipientRole || !title || !message) {
    return null;
  }

  const notification = await Notification.create({
    recipientId: String(recipientId),
    recipientRole,
    title,
    message,
    type,
    actionUrl,
    metadata,
  });

  if (email) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${title}</h2>
        <p>${message}</p>
      </div>
    `;

    await sendEmail(email, title, html);
  }

  return notification;
};

export const createNotifications = async (items = []) =>
  Promise.all(items.map((item) => createNotification(item)));
