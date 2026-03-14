import { useEffect, useState, useMemo } from "react";
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
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return;
    axios
      .get(
        `https://doctorappointmentsystem.onrender.com/api/appointments?userId=${user._id}&role=doctor`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setAppointments(res.data.appointments || []))
      .catch((err) => console.error(err));
  }, [user, token]);

  /* ---------------- METRICS ---------------- */
  const metrics = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed");
    const patients = new Set(appointments.map((a) => a.patientId?._id)).size;
    return {
      total: appointments.length,
      completed: completed.length,
      patients,
      earnings: completed.length * 500,
    };
  }, [appointments]);

  /* ---------------- UPCOMING FILTER ---------------- */
  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((a) => {
      if (a.status !== "booked") return false;

      const [year, month, day] = a.date.split("-").map(Number);
      const [hour, minute] = a.time.split(":").map(Number);
      const apptDate = new Date(year, month - 1, day, hour, minute);

      return apptDate > now;
    });
  }, [appointments]);

  /* ---------------- WEEKLY DATA ---------------- */
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: days[d.getDay()],
          date: d.toISOString().slice(0, 10),
          appts: 0,
        };
      });

    appointments.forEach((a) => {
      const dayObj = result.find((d) => d.date === a.date);
      if (dayObj) dayObj.appts += 1;
    });

    return result;
  }, [appointments]);

  return (
    <div className="min-h-screen from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-blue-700 text-center">
          Doctor Dashboard
        </h1>

        {/* 📊 Metrics */}
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
              className="bg-white p-6 rounded-2xl shadow-lg border text-center"
            >
              <Icon className={`w-8 h-8 mb-2 ${color}`} />
              <h2 className="text-2xl font-semibold">{value}</h2>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* 📈 Weekly Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h2 className="text-lg font-semibold mb-4">
            Weekly Appointment Activity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="appts"
                stroke="#2563eb"
                fill="url(#colorAppts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 🗓️ Upcoming */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center">No upcoming appointments.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white p-5 rounded-xl shadow border"
                >
                  <h3 className="font-semibold">{appt.patientId?.name}</h3>
                  <p className="text-sm text-gray-600">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {appt.date} — {appt.time}
                  </p>
                  <p className="text-sm">Mode: {appt.paymentMode}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
