import express from "express";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/:role/:userId", getNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/:role/:userId/read-all", markAllNotificationsAsRead);

export default router;
