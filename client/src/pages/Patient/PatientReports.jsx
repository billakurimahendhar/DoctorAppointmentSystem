import { useEffect, useState } from "react";
import axios from "axios";
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

export default function PatientReports() {
  const patient = JSON.parse(localStorage.getItem("user"));
  const [groupedReports, setGroupedReports] = useState({});
  const [loading, setLoading] = useState(true);

  const normalRanges = {
    diabetes: [70, 140],
    bp: [80, 120],
    hypertension: [80, 120],
    thyroid: [0.5, 5.0],
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `https://doctorappointmentsystem-0818.onrender.com/api/reports/patient/${patient._id}`
        );
        setGroupedReports(res.data.groupedByDisease || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [patient._id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-lg font-semibold text-blue-600">
        Loading reports...
      </div>
    );

  if (!Object.keys(groupedReports).length)
    return (
      <div className="flex h-screen items-center justify-center px-4 text-center text-lg font-semibold text-red-600">
        No reports found.
      </div>
    );

  return (
    <div className="page-shell">
      <h1 className="mb-10 text-center text-3xl font-bold text-blue-700 sm:mb-12">
        My Health Reports
      </h1>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
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
            <div
              key={disease}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition hover:shadow-xl"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold capitalize text-blue-700">
                  {disease}
                </h2>
                <span className={`text-sm font-semibold ${status.color}`}>
                  {status.text}
                </span>
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
                                <p className="font-semibold text-blue-700">
                                  {label}
                                </p>
                                <p>
                                  Value: <span className="font-semibold">{point.value}</span> {point.unit || ""}
                                </p>

                                <p
                                  className={`mt-1 font-semibold ${
                                    abnormal ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  {abnormal ? "Abnormal" : "Normal"}
                                </p>

                                {point.prescribedMedicines?.length > 0 && (
                                  <>
                                    <p className="mt-2 font-semibold text-gray-700">
                                      Medicines:
                                    </p>
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
                          const abnormal =
                            dotProps.payload.value < min ||
                            dotProps.payload.value > max;

                          return (
                            <Dot
                              cx={dotProps.cx}
                              cy={dotProps.cy}
                              r={4}
                              fill={abnormal ? "red" : "#2563eb"}
                            />
                          );
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 rounded-lg border bg-blue-50 p-3 text-sm">
                <p className="mb-1 font-semibold text-blue-700">
                  AI Suggestion
                </p>
                <p className="text-gray-700">
                  {latest
                    ? latest.value < min
                      ? "Your level is below normal. Please consult your doctor."
                      : latest.value > max
                      ? "Your level is above normal. Follow prescribed treatment."
                      : "Your readings are stable. Keep following your routine."
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
