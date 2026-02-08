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
          `http://localhost:4000/api/reports/patient/${patient._id}`
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
      <div className="h-screen flex items-center justify-center text-blue-600 text-lg font-semibold">
        Loading reports...
      </div>
    );

  if (!Object.keys(groupedReports).length)
    return (
      <div className="h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        No reports found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-12">
        My Health Reports 📊
      </h1>

      {/* 🔥 TWO CARDS PER ROW */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-700 capitalize">
                  {disease}
                </h2>
                <span className={`text-sm font-semibold ${status.color}`}>
                  {status.text}
                </span>
              </div>

              {/* SMALL GRAPH */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />

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

              {/* AI SUGGESTION */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border text-sm">
                <p className="font-semibold text-blue-700 mb-1">
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
