import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const { role, userId } = req.params;

    const notifications = await Notification.find({
      recipientRole: role,
      recipientId: String(userId),
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((item) => !item.read).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { role, userId } = req.params;

    await Notification.updateMany(
      {
        recipientRole: role,
        recipientId: String(userId),
        read: false,
      },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
