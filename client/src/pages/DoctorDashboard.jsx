import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  Wallet2,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    patients: 0,
    earnings: 0,
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return;
    axios
      .get(
        `http://localhost:4000/api/appointments?userId=${user._id}&role=doctor`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const appts = res.data.appointments || [];
        const completed = appts.filter((a) => a.status === "completed").length;
        const patients = new Set(appts.map((a) => a.patientId?._id)).size;
        const earnings = appts.length * 500; // 💰 simulate ₹500 per appointment

        setAppointments(appts);
        setMetrics({
          total: appts.length,
          completed,
          patients,
          earnings,
        });
      })
      .catch((err) => console.error(err));
  }, [user, token]);

  const data = [
    { name: "Mon", appts: 3 },
    { name: "Tue", appts: 4 },
    { name: "Wed", appts: 6 },
    { name: "Thu", appts: 2 },
    { name: "Fri", appts: 5 },
    { name: "Sat", appts: 3 },
    { name: "Sun", appts: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-8">
          Doctor Dashboard
        </h1>

        {/* 📊 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Patients", value: metrics.patients, icon: Users, color: "text-blue-600" },
            { label: "Appointments", value: metrics.total, icon: CalendarCheck, color: "text-indigo-600" },
            { label: "Completed", value: metrics.completed, icon: CheckCircle2, color: "text-green-600" },
            { label: "Earnings", value: `₹${metrics.earnings}`, icon: Wallet2, color: "text-yellow-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center"
            >
              <Icon className={`w-8 h-8 mb-3 ${color}`} />
              <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* 📈 Appointments Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Weekly Appointment Activity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="appts"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorAppts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 🗓️ Upcoming Appointments */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Upcoming Appointments
          </h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center">
              No upcoming appointments.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt, i) => (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {appt.patientId?.name || "Patient"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : appt.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <Clock className="inline w-4 h-4 mr-1 text-blue-500" />
                      {appt.date} — {appt.time}
                    </p>
                    <p>
                      Mode:{" "}
                      <span className="font-medium text-gray-800">
                        {appt.paymentMode}
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
