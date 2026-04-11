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

const REPORT_TIME_ZONE = "Asia/Kolkata";

const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: REPORT_TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: REPORT_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseReportDate = (report) => parseDateValue(report?.date) || parseDateValue(report?.createdAt);
const parseReportCreatedAt = (report) => parseDateValue(report?.createdAt);

const getReportDisplayDate = (report) => {
  const parsedDate = parseReportDate(report);
  return parsedDate ? fullDateFormatter.format(parsedDate) : report?.date || "-";
};

const getReportDisplayTime = (report) => {
  if (report?.appointmentTime) {
    return report.appointmentTime;
  }

  const createdAt = parseReportCreatedAt(report);
  return createdAt ? timeFormatter.format(createdAt) : "";
};

const getReportDisplayDateTime = (report) => {
  const dateLabel = getReportDisplayDate(report);
  const timeLabel = getReportDisplayTime(report);
  return timeLabel ? `${dateLabel}, ${timeLabel}` : dateLabel;
};

const getReportAxisLabel = (report) => {
  const dateLabel = getReportDisplayDate(report);
  const timeLabel = getReportDisplayTime(report);

  return timeLabel ? `${dateLabel}, ${timeLabel}` : dateLabel;
};

const getReportSortValue = (report) => {
  const createdAt = parseReportCreatedAt(report);

  if (createdAt) {
    return createdAt.getTime();
  }

  const parsedDate = parseReportDate(report);
  return parsedDate ? parsedDate.getTime() : 0;
};

const buildReportPdf = (patientName, report) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("MediConnect Prescription Report", 14, 18);
  doc.setFontSize(11);
  doc.text(`Patient: ${patientName}`, 14, 28);
  doc.text(`Doctor: ${report.doctorName}`, 14, 35);
  doc.text(`Recorded: ${getReportDisplayDateTime(report)}`, 14, 42);

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
      getReportDisplayDateTime(report),
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

    if (user?._id) {
      fetchReports();
    }
  }, [user?._id]);

  const latestReports = useMemo(
    () => [...reports].sort((a, b) => getReportSortValue(b) - getReportSortValue(a)),
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
              onClick={() => buildSummaryPdf(user?.name || "Patient", latestReports)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Download full summary
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(groupedReports).map(([disease, diseaseReports]) => {
              const formattedReports = diseaseReports.map((report, index) => ({
                ...report,
                chartKey: report._id || `${report.date}-${index}`,
                axisLabel: getReportAxisLabel(report),
                exactDateTime: getReportDisplayDateTime(report),
              }));

              const reportLabelMap = new Map(
                formattedReports.map((report) => [report.chartKey, report])
              );

              const [min, max] = normalRanges[disease] || [0, Infinity];
              const latest = formattedReports[formattedReports.length - 1];
              const isAbnormal = latest?.value < min || latest?.value > max;

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
                        <XAxis
                          dataKey="chartKey"
                          tick={{ fontSize: 10 }}
                          height={72}
                          angle={-20}
                          textAnchor="end"
                          tickFormatter={(value) =>
                            reportLabelMap.get(value)?.axisLabel || ""
                          }
                        />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const point = payload[0].payload;
                              const abnormal = point.value < min || point.value > max;

                              return (
                                <div className="rounded border bg-white p-3 shadow">
                                  <p>{point.exactDateTime}</p>
                                  <p>
                                    Value: {point.value} {point.unit || ""}
                                  </p>
                                  <p>{abnormal ? "Abnormal" : "Normal"}</p>

                                  {point.prescribedMedicines?.length > 0 && (
                                    <ul>
                                      {point.prescribedMedicines.map((medicine, index) => (
                                        <li key={index}>{medicine}</li>
                                      ))}
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
                              props.payload.value < min || props.payload.value > max;

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

                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      Latest: {latest?.value} {latest?.unit || ""}
                    </p>
                    <p className="text-slate-500">
                      Recorded: {latest ? latest.exactDateTime : "-"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl bg-white p-6">
            <h2 className="text-xl font-semibold">
              Prescription history
            </h2>

            {latestReports.map((report) => (
              <div key={report._id} className="mt-4 rounded border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p>{report.diseaseName}</p>
                    <p className="text-sm text-slate-500">
                      {getReportDisplayDateTime(report)}
                    </p>
                  </div>
                  <button
                    onClick={() => buildReportPdf(user?.name || "Patient", report)}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white"
                  >
                    PDF
                  </button>
                </div>
                <p className="mt-2 text-sm">
                  Medicines: {report.prescribedMedicines.join(", ") || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
