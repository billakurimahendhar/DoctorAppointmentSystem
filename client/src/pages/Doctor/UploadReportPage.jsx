import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

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
    date: new Date().toISOString().slice(0, 10),
  });

  const handleUpload = async () => {
  try {
    await axios.post("http://localhost:4000/api/reports/upload", {
      doctorId: doctor._id,
      patientId: appointment.patientId._id,
      appointmentId: appointment._id,
      diseaseName: report.diseaseName,
      testType: report.testType,
      value: Number(report.value),
      unit: report.unit,
      prescribedMedicines: report.prescribedMedicines
        ? report.prescribedMedicines.split(",").map((m) => m.trim())
        : [],
      notes: report.notes,
      date: report.date,
    });

    alert("✅ Disease report saved. Add another if needed.");

    // 🔥 RESET FORM PROPERLY
    setReport({
      diseaseName: "",
      testType: "",
      value: "",
      unit: "",
      prescribedMedicines: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    alert("Error uploading report");
  }
};


  const finishAppointment = async () => {
    await axios.put(`http://localhost:4000/api/appointments/complete/${appointment._id}`);
    navigate("/doctor-home");
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Upload Patient Report</h2>

      <select
        value={report.diseaseName}
        onChange={(e) => setReport({ ...report, diseaseName: e.target.value })}
        className="border p-2 w-full mb-3"
      >
        <option value="">Select Disease</option>
        <option value="Diabetes">Diabetes</option>
        <option value="BP">Blood Pressure</option>
        <option value="Thyroid">Thyroid</option>
        <option value="Cholesterol">Cholesterol</option>
      </select>

      <input placeholder="Test Type" className="border p-2 w-full mb-3"
        value={report.testType} onChange={(e) => setReport({ ...report, testType: e.target.value })} />

      <input placeholder="Value" type="number" className="border p-2 w-full mb-3"
        value={report.value} onChange={(e) => setReport({ ...report, value: e.target.value })} />

      <input placeholder="Unit" className="border p-2 w-full mb-3"
        value={report.unit} onChange={(e) => setReport({ ...report, unit: e.target.value })} />

      <input placeholder="Medicines (comma separated)" className="border p-2 w-full mb-3"
        value={report.prescribedMedicines} onChange={(e) => setReport({ ...report, prescribedMedicines: e.target.value })} />

      <textarea placeholder="Notes" className="border p-2 w-full mb-3"
        value={report.notes} onChange={(e) => setReport({ ...report, notes: e.target.value })} />

      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
        Save Disease Report
      </button>

      <button onClick={finishAppointment} className="bg-green-600 text-white px-4 py-2 rounded">
        Finish Appointment
      </button>
    </div>
  );
}
