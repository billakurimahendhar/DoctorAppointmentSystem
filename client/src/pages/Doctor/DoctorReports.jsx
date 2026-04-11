import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot,
} from "recharts";

const normalRanges = {
  diabetes: [70, 140],
  bp: [80, 120],
  hypertension: [80, 120],
  thyroid: [0.5, 5.0],
};

export default function DoctorReports() {
  const location = useLocation();
  const requestedPatientId = location.state?.patientId;
  const requestedAppointmentId = location.state?.appointmentId;

  const doctor = JSON.parse(localStorage.getItem("user"));
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [groupedReports, setGroupedReports] = useState({});
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get(`/appointments/doctor/${doctor._id}`);
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointments();
  }, [doctor._id]);

  useEffect(() => {
    if (!appointments.length) return;

    if (requestedAppointmentId) {
      const preSelect = appointments.find((appointment) => appointment._id === requestedAppointmentId);
      if (preSelect) {
        setSelectedAppt(preSelect);
        return;
      }
    }

    if (requestedPatientId) {
      const preSelect = appointments.find((appointment) => appointment.patientId?._id === requestedPatientId);
      if (preSelect) {
        setSelectedAppt(preSelect);
        return;
      }

      const fetchReportsDirect = async () => {
        setReportsLoading(true);
        try {
          const res = await api.get(`/reports/patient/${requestedPatientId}`);
          setGroupedReports(res.data.groupedByDisease || {});
        } catch (err) {
          console.error("Error fetching patient reports:", err);
          setGroupedReports({});
        } finally {
          setReportsLoading(false);
        }
      };

      fetchReportsDirect();
    }
  }, [appointments, requestedAppointmentId, requestedPatientId]);

  useEffect(() => {
    if (!selectedAppt?.patientId?._id) return;

    const fetchPatientReports = async (patientId) => {
      try {
        setReportsLoading(true);
        const res = await api.get(`/reports/patient/${patientId}`);
        setGroupedReports(res.data.groupedByDisease || {});
      } catch (err) {
        console.error("Error fetching patient reports:", err);
        setGroupedReports({});
      } finally {
        setReportsLoading(false);
      }
    };

    fetchPatientReports(selectedAppt.patientId._id);
  }, [selectedAppt]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-lg sm:p-6">
        <h2 className="mb-4 text-center text-2xl font-bold text-blue-700">
          View Patient Reports and Graphs
        </h2>

        {!requestedPatientId && (
          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Select Appointment / Patient
            </label>
            <select
              value={selectedAppt?._id || ""}
              onChange={(e) => {
                const appointment = appointments.find((item) => item._id === e.target.value);
                setSelectedAppt(appointment || null);
              }}
              className="w-full rounded-lg border p-2"
            >
              <option value="">-- Choose appointment --</option>
              {appointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {appointment.patientId?.name} - {appointment.date} @ {appointment.time}
                </option>
              ))}
            </select>
          </div>
        )}

        {requestedPatientId && selectedAppt && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
            Viewing reports for <strong>{selectedAppt.patientId?.name}</strong> ({selectedAppt.date} @ {selectedAppt.time})
          </div>
        )}

        <div className="mt-8">
          {!selectedAppt ? (
            <div className="text-center text-gray-600">
              Select an appointment above to load that patient&apos;s reports.
            </div>
          ) : reportsLoading ? (
            <div className="text-center text-blue-600">Loading reports...</div>
          ) : !Object.keys(groupedReports).length ? (
            <div className="text-center text-red-600">No reports found for this patient.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(groupedReports).map(([disease, reports]) => {
                const [min, max] = normalRanges[disease] || [0, Infinity];
                const latest = reports[reports.length - 1];

                const status =
                  latest?.value < min
                    ? { text: "Low", color: "text-red-600" }
                    : latest?.value > max
                    ? { text: "High", color: "text-orange-600" }
                    : { text: "Normal", color: "text-green-600" };

                return (
                  <div key={disease} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold capitalize text-blue-700">{disease}</h3>
                      <span className={`text-sm font-semibold ${status.color}`}>{status.text}</span>
                    </div>

                    <div className="chart-scroll">
                      <div className="chart-frame">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reports}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const point = payload[0].payload;
                                  const abnormal = point.value < min || point.value > max;

                                  return (
                                    <div className="rounded-lg border bg-white p-3 text-sm shadow-lg">
                                      <p className="font-semibold text-blue-700">{label}</p>
                                      <p>
                                        Value: <span className="font-semibold">{point.value}</span> {point.unit || ""}
                                      </p>
                                      <p className={`mt-1 font-semibold ${abnormal ? "text-red-600" : "text-green-600"}`}>
                                        {abnormal ? "Abnormal" : "Normal"}
                                      </p>
                                      {point.prescribedMedicines?.length > 0 && (
                                        <>
                                          <p className="mt-2 font-semibold text-gray-700">Medicines:</p>
                                          <ul className="ml-4 list-disc text-gray-600">
                                            {point.prescribedMedicines.map((med, index) => (
                                              <li key={index}>{med}</li>
                                            ))}
                                          </ul>
                                        </>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={(dotProps) => {
                                const abnormal = dotProps.payload.value < min || dotProps.payload.value > max;
                                return <Dot cx={dotProps.cx} cy={dotProps.cy} r={4} fill={abnormal ? "red" : "#2563eb"} />;
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border bg-blue-50 p-3 text-sm">
                      <p className="mb-1 font-semibold text-blue-700">Latest reading ({latest?.date})</p>
                      <p className="text-gray-700">Value: {latest?.value} {latest?.unit || ""}</p>
                      <p className="text-gray-700">Doctor: {latest?.doctorName || "N/A"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
