import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import api from "../../lib/api";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const diseaseCatalog = [
  {
    value: "Diabetes",
    label: "Diabetes",
    testTypes: [
      { value: "HbA1c", label: "HbA1c", units: ["%"] },
      { value: "Fasting Blood Sugar", label: "Fasting Blood Sugar", units: ["mg/dL"] },
      { value: "Postprandial Blood Sugar", label: "Postprandial Blood Sugar", units: ["mg/dL"] },
      { value: "Random Blood Sugar", label: "Random Blood Sugar", units: ["mg/dL"] },
    ],
  },
  {
    value: "BP",
    label: "Blood Pressure",
    testTypes: [
      { value: "Systolic Pressure", label: "Systolic Pressure", units: ["mmHg"] },
      { value: "Diastolic Pressure", label: "Diastolic Pressure", units: ["mmHg"] },
      { value: "Mean Arterial Pressure", label: "Mean Arterial Pressure", units: ["mmHg"] },
    ],
  },
  {
    value: "Hypertension",
    label: "Hypertension",
    testTypes: [
      { value: "Clinic Blood Pressure", label: "Clinic Blood Pressure", units: ["mmHg"] },
      { value: "Home Blood Pressure", label: "Home Blood Pressure", units: ["mmHg"] },
      { value: "Pulse Pressure", label: "Pulse Pressure", units: ["mmHg"] },
    ],
  },
  {
    value: "Thyroid",
    label: "Thyroid",
    testTypes: [
      { value: "TSH", label: "TSH", units: ["uIU/mL"] },
      { value: "T3", label: "T3", units: ["ng/dL"] },
      { value: "T4", label: "T4", units: ["ug/dL"] },
    ],
  },
  {
    value: "Cholesterol",
    label: "Cholesterol",
    testTypes: [
      { value: "Total Cholesterol", label: "Total Cholesterol", units: ["mg/dL"] },
      { value: "HDL", label: "HDL", units: ["mg/dL"] },
      { value: "LDL", label: "LDL", units: ["mg/dL"] },
      { value: "Triglycerides", label: "Triglycerides", units: ["mg/dL"] },
    ],
  },
  {
    value: "Anemia",
    label: "Anemia",
    testTypes: [
      { value: "Hemoglobin", label: "Hemoglobin", units: ["g/dL"] },
      { value: "Ferritin", label: "Ferritin", units: ["ng/mL"] },
      { value: "Serum Iron", label: "Serum Iron", units: ["ug/dL"] },
    ],
  },
  {
    value: "Kidney Disease",
    label: "Kidney Disease",
    testTypes: [
      { value: "Serum Creatinine", label: "Serum Creatinine", units: ["mg/dL"] },
      { value: "Blood Urea", label: "Blood Urea", units: ["mg/dL"] },
      { value: "eGFR", label: "eGFR", units: ["mL/min/1.73m2"] },
    ],
  },
  {
    value: "Liver Disease",
    label: "Liver Disease",
    testTypes: [
      { value: "ALT", label: "ALT", units: ["U/L"] },
      { value: "AST", label: "AST", units: ["U/L"] },
      { value: "Bilirubin", label: "Bilirubin", units: ["mg/dL"] },
    ],
  },
  {
    value: "Asthma",
    label: "Asthma",
    testTypes: [
      { value: "Peak Flow Rate", label: "Peak Flow Rate", units: ["L/min"] },
      { value: "SpO2", label: "SpO2", units: ["%"] },
      { value: "Respiratory Rate", label: "Respiratory Rate", units: ["breaths/min"] },
    ],
  },
  {
    value: "COPD",
    label: "COPD",
    testTypes: [
      { value: "FEV1", label: "FEV1", units: ["%"] },
      { value: "SpO2", label: "SpO2", units: ["%"] },
      { value: "Respiratory Rate", label: "Respiratory Rate", units: ["breaths/min"] },
    ],
  },
  {
    value: "Heart Disease",
    label: "Heart Disease",
    testTypes: [
      { value: "Troponin", label: "Troponin", units: ["ng/mL"] },
      { value: "Heart Rate", label: "Heart Rate", units: ["bpm"] },
      { value: "BNP", label: "BNP", units: ["pg/mL"] },
    ],
  },
  {
    value: "Obesity",
    label: "Obesity",
    testTypes: [
      { value: "BMI", label: "BMI", units: ["kg/m2"] },
      { value: "Waist Circumference", label: "Waist Circumference", units: ["cm"] },
      { value: "Body Fat Percentage", label: "Body Fat Percentage", units: ["%"] },
    ],
  },
  {
    value: "Vitamin D Deficiency",
    label: "Vitamin D Deficiency",
    testTypes: [
      { value: "Vitamin D 25-OH", label: "Vitamin D 25-OH", units: ["ng/mL"] },
      { value: "Calcium", label: "Calcium", units: ["mg/dL"] },
    ],
  },
  {
    value: "Vitamin B12 Deficiency",
    label: "Vitamin B12 Deficiency",
    testTypes: [
      { value: "Vitamin B12", label: "Vitamin B12", units: ["pg/mL"] },
      { value: "MCV", label: "MCV", units: ["fL"] },
    ],
  },
  {
    value: "PCOS",
    label: "PCOS",
    testTypes: [
      { value: "LH", label: "LH", units: ["mIU/mL"] },
      { value: "FSH", label: "FSH", units: ["mIU/mL"] },
      { value: "Testosterone", label: "Testosterone", units: ["ng/dL"] },
    ],
  },
  {
    value: "Arthritis",
    label: "Arthritis",
    testTypes: [
      { value: "ESR", label: "ESR", units: ["mm/hr"] },
      { value: "CRP", label: "CRP", units: ["mg/L"] },
      { value: "Rheumatoid Factor", label: "Rheumatoid Factor", units: ["IU/mL"] },
    ],
  },
  {
    value: "Dengue",
    label: "Dengue",
    testTypes: [
      { value: "Platelet Count", label: "Platelet Count", units: ["cells/uL"] },
      { value: "Hematocrit", label: "Hematocrit", units: ["%"] },
      { value: "NS1 Antigen", label: "NS1 Antigen", units: ["index"] },
    ],
  },
  {
    value: "Malaria",
    label: "Malaria",
    testTypes: [
      { value: "Parasite Count", label: "Parasite Count", units: ["parasites/uL"] },
      { value: "Hemoglobin", label: "Hemoglobin", units: ["g/dL"] },
      { value: "Temperature", label: "Temperature", units: ["F", "C"] },
    ],
  },
  {
    value: "Tuberculosis",
    label: "Tuberculosis",
    testTypes: [
      { value: "ESR", label: "ESR", units: ["mm/hr"] },
      { value: "Sputum Smear Grade", label: "Sputum Smear Grade", units: ["grade"] },
      { value: "Weight", label: "Weight", units: ["kg"] },
    ],
  },
  {
    value: "Typhoid",
    label: "Typhoid",
    testTypes: [
      { value: "Widal Titer", label: "Widal Titer", units: ["titer"] },
      { value: "Temperature", label: "Temperature", units: ["F", "C"] },
      { value: "CRP", label: "CRP", units: ["mg/L"] },
    ],
  },
  {
    value: "COVID-19",
    label: "COVID-19",
    testTypes: [
      { value: "RT-PCR Ct Value", label: "RT-PCR Ct Value", units: ["Ct"] },
      { value: "SpO2", label: "SpO2", units: ["%"] },
      { value: "CRP", label: "CRP", units: ["mg/L"] },
    ],
  },
  {
    value: "Urinary Tract Infection",
    label: "Urinary Tract Infection",
    testTypes: [
      { value: "Urine WBC", label: "Urine WBC", units: ["cells/hpf"] },
      { value: "Urine Culture Count", label: "Urine Culture Count", units: ["CFU/mL"] },
      { value: "Urine Nitrite", label: "Urine Nitrite", units: ["positive/negative"] },
    ],
  },
  {
    value: "Osteoporosis",
    label: "Osteoporosis",
    testTypes: [
      { value: "Bone Mineral Density", label: "Bone Mineral Density", units: ["g/cm2"] },
      { value: "T-Score", label: "T-Score", units: ["score"] },
      { value: "Calcium", label: "Calcium", units: ["mg/dL"] },
    ],
  },
];

export default function UploadReportPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("user"));
  const appointment = state?.appointment;

  const [report, setReport] = useState({
    diseaseName: "",
    testType: "",
    value: "",
    unit: "",
    prescribedMedicines: "",
    notes: "",
    date: getTodayDate(),
  });

  const selectedDisease = useMemo(
    () => diseaseCatalog.find((disease) => disease.value === report.diseaseName),
    [report.diseaseName]
  );

  const availableTestTypes = selectedDisease?.testTypes || [];

  const selectedTestType = useMemo(
    () => availableTestTypes.find((testType) => testType.value === report.testType),
    [availableTestTypes, report.testType]
  );

  const availableUnits = selectedTestType?.units || [];

  const handleDiseaseChange = (event) => {
    const nextDisease = event.target.value;

    setReport((current) => ({
      ...current,
      diseaseName: nextDisease,
      testType: "",
      unit: "",
    }));
  };

  const handleTestTypeChange = (event) => {
    const nextTestType = event.target.value;
    const nextSelectedDisease = diseaseCatalog.find(
      (disease) => disease.value === report.diseaseName
    );
    const nextSelectedTestType = nextSelectedDisease?.testTypes.find(
      (testType) => testType.value === nextTestType
    );

    setReport((current) => ({
      ...current,
      testType: nextTestType,
      unit: nextSelectedTestType?.units[0] || "",
    }));
  };

  const handleUpload = async () => {
    if (!report.diseaseName || !report.testType || !report.unit) {
      alert("Please select a disease, test type, and unit.");
      return;
    }

    try {
      await api.post("/reports/upload", {
        doctorId: doctor._id,
        patientId: appointment.patientId._id,
        appointmentId: appointment._id,
        diseaseName: report.diseaseName,
        testType: report.testType,
        value: Number(report.value),
        unit: report.unit,
        prescribedMedicines: report.prescribedMedicines
          ? report.prescribedMedicines.split(",").map((medicine) => medicine.trim())
          : [],
        notes: report.notes,
        date: report.date,
      });

      alert("Disease report saved. Add another if needed.");

      setReport({
        diseaseName: "",
        testType: "",
        value: "",
        unit: "",
        prescribedMedicines: "",
        notes: "",
        date: getTodayDate(),
      });
    } catch (error) {
      console.error(error);
      alert("Error uploading report");
    }
  };

  const finishAppointment = async () => {
    await api.put(`/appointments/complete/${appointment._id}`);
    navigate("/doctor-home");
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl space-y-5">
        {appointment && (
          <div className="surface-card">
            <p className="text-sm font-medium text-slate-500">Patient</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {appointment.patientId?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Appointment on {appointment.date} at {appointment.time}
            </p>
          </div>
        )}

        <div className="surface-card space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Upload Patient Report</h2>

          <select
            value={report.diseaseName}
            onChange={handleDiseaseChange}
            className="w-full rounded-xl border p-3"
          >
            <option value="">Select Disease</option>
            {diseaseCatalog.map((disease) => (
              <option key={disease.value} value={disease.value}>
                {disease.label}
              </option>
            ))}
          </select>

          <select
            value={report.testType}
            onChange={handleTestTypeChange}
            className="w-full rounded-xl border p-3"
            disabled={!report.diseaseName}
          >
            <option value="">Select Test Type</option>
            {availableTestTypes.map((testType) => (
              <option key={testType.value} value={testType.value}>
                {testType.label}
              </option>
            ))}
          </select>

          <select
            value={report.unit}
            onChange={(event) =>
              setReport((current) => ({ ...current, unit: event.target.value }))
            }
            className="w-full rounded-xl border p-3"
            disabled={!report.testType}
          >
            <option value="">Select Unit</option>
            {availableUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>

          <input
            placeholder="Value"
            type="number"
            className="w-full rounded-xl border p-3"
            value={report.value}
            onChange={(event) =>
              setReport((current) => ({ ...current, value: event.target.value }))
            }
          />

          <input
            placeholder="Medicines (comma separated)"
            className="w-full rounded-xl border p-3"
            value={report.prescribedMedicines}
            onChange={(event) =>
              setReport((current) => ({
                ...current,
                prescribedMedicines: event.target.value,
              }))
            }
          />

          <textarea
            placeholder="Notes"
            className="min-h-32 w-full rounded-xl border p-3"
            value={report.notes}
            onChange={(event) =>
              setReport((current) => ({ ...current, notes: event.target.value }))
            }
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleUpload}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white sm:w-auto"
            >
              Save Disease Report
            </button>

            <button
              onClick={finishAppointment}
              className="w-full rounded-xl bg-green-600 px-4 py-3 text-white sm:w-auto"
            >
              Finish Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
