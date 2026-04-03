import { useContext, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppContext } from "../../context/AppContext";
import api from "../../lib/api";

const normalRanges = {
  diabetes: [70, 140],
  bp: [80, 120],
  hypertension: [80, 120],
  thyroid: [0.5, 5.0],
};

const buildReportPdf = (patientName, report) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("MediConnect Prescription Report", 14, 18);
  doc.setFontSize(11);
  doc.text(`Patient: ${patientName}`, 14, 28);
  doc.text(`Doctor: ${report.doctorName}`, 14, 35);
  doc.text(`Date: ${report.date}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Field", "Value"]],
    body: [
      ["Disease", report.diseaseName],
      ["Test Type", report.testType],
      ["Reading", `${report.value} ${report.unit || ""}`.trim()],
      ["Specialization", report.doctorSpecialization || "-"],
      ["Medicines", report.prescribedMedicines.join(", ") || "-"],
      ["Notes", report.notes || "-"],
    ],
  });

  doc.save(`report-${report.diseaseName}-${report.date}.pdf`);
};

const buildSummaryPdf = (patientName, reports) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("MediConnect Health Summary", 14, 18);
  doc.setFontSize(11);
  doc.text(`Patient: ${patientName}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);

  autoTable(doc, {
    startY: 45,
    head: [["Date", "Disease", "Value", "Doctor", "Medicines"]],
    body: reports.map((report) => [
      report.date,
      report.diseaseName,
      `${report.value} ${report.unit || ""}`.trim(),
      report.doctorName,
      report.prescribedMedicines.join(", ") || "-",
    ]),
  });

  doc.save("health-summary.pdf");
};

export default function HealthReports() {
  const { user } = useContext(AppContext);
  const [groupedReports, setGroupedReports] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get(`/reports/patient/${user._id}`);
        setGroupedReports(data.groupedByDisease || {});
        setReports(data.reports || []);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchReports();
  }, [user?._id]);

  const latestReports = useMemo(
    () => [...reports].sort((a, b) => b.date.localeCompare(a.date)),
    [reports]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading reports...
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        No reports found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Health Reports
              </h1>
            </div>

            <button
              onClick={() =>
                buildSummaryPdf(user?.name || "Patient", latestReports)
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Download full summary
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(groupedReports).map(([disease, diseaseReports]) => {
              
              // ✅ FIX: make each point unique
              const formattedReports = diseaseReports.map((r, i) => ({
                ...r,
                uniqueKey: `${r.date}-${i}`,
              }));

              const [min, max] = normalRanges[disease] || [0, Infinity];
              const latest = diseaseReports[diseaseReports.length - 1];
              const isAbnormal =
                latest?.value < min || latest?.value > max;

              return (
                <div key={disease} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex justify-between">
                    <h2 className="text-lg font-semibold capitalize">
                      {disease}
                    </h2>
                    <span>
                      {isAbnormal ? "Needs attention" : "Stable"}
                    </span>
                  </div>

                  <div className="mt-4 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formattedReports}>
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* ✅ uniqueKey used internally */}
                        <XAxis
                          dataKey="uniqueKey"
                          tickFormatter={(val) => val.split("-")[0]}
                        />

                        <YAxis />
                        
                        {/* ✅ Tooltip with medicines */}
                        <Tooltip
                          labelFormatter={(label) =>
                            label.split("-")[0]
                          }
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const point = payload[0].payload;
                              const abnormal =
                                point.value < min ||
                                point.value > max;

                              return (
                                <div className="bg-white border p-3 rounded shadow">
                                  <p>{label.split("-")[0]}</p>
                                  <p>Value: {point.value}</p>
                                  <p>
                                    {abnormal ? "Abnormal" : "Normal"}
                                  </p>

                                  {point.prescribedMedicines?.length > 0 && (
                                    <ul>
                                      {point.prescribedMedicines.map(
                                        (m, i) => (
                                          <li key={i}>{m}</li>
                                        )
                                      )}
                                    </ul>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Line
                          dataKey="value"
                          stroke="#2563eb"
                          dot={(props) => {
                            const abnormal =
                              props.payload.value < min ||
                              props.payload.value > max;

                            return (
                              <Dot
                                cx={props.cx}
                                cy={props.cy}
                                r={4}
                                fill={abnormal ? "red" : "blue"}
                              />
                            );
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="mt-3 text-sm">
                    Latest: {latest?.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE SAME */}
          <div className="bg-white p-6 rounded-3xl">
            <h2 className="text-xl font-semibold">
              Prescription history
            </h2>

            {latestReports.map((report) => (
              <div key={report._id} className="mt-4 border p-3 rounded">
                <p>{report.diseaseName}</p>
                <p>{report.date}</p>
                <p>
                  Medicines:{" "}
                  {report.prescribedMedicines.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}