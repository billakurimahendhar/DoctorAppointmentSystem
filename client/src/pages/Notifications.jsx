import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import api from "../lib/api";

export default function Notifications() {
  const { user } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?._id || !user?.role) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/notifications/${user.role}/${user._id}`);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?._id, user?.role]);

  const markAllAsRead = async () => {
    try {
      await api.patch(`/notifications/${user.role}/${user._id}/read-all`);
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Booking updates, approval messages, reports, and reminders appear
              here.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {notification.title}
                      </h2>
                      {!notification.read && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
