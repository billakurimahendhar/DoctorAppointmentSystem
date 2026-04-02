import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import api, { getAuthHeaders } from "../../lib/api";

export default function AdminDashboard() {
  const { user } = useContext(AppContext);
  const [metrics, setMetrics] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, pendingRes] = await Promise.all([
        api.get("/admin/dashboard", {
          headers: getAuthHeaders(),
        }),
        api.get("/admin/doctors/pending", {
          headers: getAuthHeaders(),
        }),
      ]);

      setMetrics(dashboardRes.data.metrics);
      setRecentAppointments(dashboardRes.data.recentAppointments || []);
      setPendingDoctors(pendingRes.data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch admin dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?._id]);

  const approveDoctor = async (doctorId) => {
    try {
      await api.patch(
        `/admin/doctors/${doctorId}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      await fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to approve doctor");
    }
  };

  const rejectDoctor = async (doctorId) => {
    try {
      await api.patch(
        `/admin/doctors/${doctorId}/reject`,
        {
          reason:
            rejectionReasons[doctorId] ||
            "Profile needs more information before approval.",
        },
        { headers: getAuthHeaders() }
      );
      await fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to reject doctor");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Admin Console
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            Manage approvals, appointments, and platform activity
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Review new doctor registrations, track system activity, and keep the
            appointment flow moving smoothly.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Patients", metrics?.patients || 0],
            ["Doctors", metrics?.totalDoctors || 0],
            ["Approved Doctors", metrics?.approvedDoctors || 0],
            ["Pending Doctors", metrics?.pendingDoctors || 0],
            ["Appointments", metrics?.totalAppointments || 0],
            ["Paid Appointments", metrics?.paidAppointments || 0],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                Pending doctor approvals
              </h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                {pendingDoctors.length} waiting
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {pendingDoctors.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  No pending approvals right now.
                </p>
              ) : (
                pendingDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Dr. {doctor.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {doctor.specialization} | {doctor.qualification}
                        </p>
                        <p className="text-sm text-slate-500">
                          {doctor.experience} years experience | Fee Rs.
                          {doctor.feesPerConsultation || 0}
                        </p>
                        <p className="text-sm text-slate-500">{doctor.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => approveDoctor(doctor._id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectDoctor(doctor._id)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={rejectionReasons[doctor._id] || ""}
                      onChange={(event) =>
                        setRejectionReasons((current) => ({
                          ...current,
                          [doctor._id]: event.target.value,
                        }))
                      }
                      rows="2"
                      placeholder="Optional rejection reason"
                      className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Recent appointments
            </h2>

            <div className="mt-5 space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  No appointments available.
                </p>
              ) : (
                recentAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {appointment.patientId?.name} with Dr.{" "}
                          {appointment.doctorId?.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
