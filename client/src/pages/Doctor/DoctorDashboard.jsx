import { useEffect, useMemo, useState } from "react";
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
import api, { getAuthHeaders } from "../../lib/api";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    api
      .get(`/appointments?userId=${user._id}&role=doctor`, {
        headers: getAuthHeaders(),
      })
      .then((res) => setAppointments(res.data.appointments || []))
      .catch((err) => console.error(err));
  }, [user]);

  const metrics = useMemo(() => {
    const completed = appointments.filter((appointment) => appointment.status === "completed");
    const patients = new Set(appointments.map((appointment) => appointment.patientId?._id)).size;

    return {
      total: appointments.length,
      completed: completed.length,
      patients,
      earnings: completed.length * 500,
    };
  }, [appointments]);

  const metricCards = [
    { label: "Total Patients", value: metrics.patients, icon: Users, color: "text-blue-600" },
    { label: "Appointments", value: metrics.total, icon: CalendarCheck, color: "text-indigo-600" },
    { label: "Completed", value: metrics.completed, icon: CheckCircle2, color: "text-green-600" },
    { label: "Earnings", value: `Rs ${metrics.earnings}`, icon: Wallet2, color: "text-yellow-600" },
  ];

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((appointment) => {
      if (appointment.status !== "booked") return false;

      const [year, month, day] = appointment.date.split("-").map(Number);
      const [hour, minute] = appointment.time.split(":").map(Number);
      const appointmentDate = new Date(year, month - 1, day, hour, minute);

      return appointmentDate > now;
    });
  }, [appointments]);

  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = Array(7)
      .fill(0)
      .map((_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));
        return {
          name: days[day.getDay()],
          date: day.toISOString().slice(0, 10),
          appts: 0,
        };
      });

    appointments.forEach((appointment) => {
      const dayObj = result.find((entry) => entry.date === appointment.date);
      if (dayObj) dayObj.appts += 1;
    });

    return result;
  }, [appointments]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
        <h1 className="text-center text-3xl font-bold text-blue-700 sm:text-4xl">
          Doctor Dashboard
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => {
            const MetricIcon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border bg-white p-5 text-center shadow-lg transition-transform duration-200 hover:-translate-y-1 sm:p-6"
              >
                <MetricIcon className={`mb-2 h-8 w-8 ${item.color}`} />
                <h2 className="text-2xl font-semibold">{item.value}</h2>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-lg sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Weekly Appointment Activity</h2>
          <div className="chart-scroll">
            <div className="h-[250px] min-w-[320px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-center text-gray-500">No upcoming appointments.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="rounded-xl border bg-white p-5 shadow"
                >
                  <h3 className="font-semibold">{appointment.patientId?.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    <Clock className="mr-1 inline h-4 w-4" />
                    {appointment.date} - {appointment.time}
                  </p>
                  <p className="mt-1 text-sm">Mode: {appointment.paymentMode}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
