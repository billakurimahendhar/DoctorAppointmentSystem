// frontend/src/pages/Doctor/DoctorReports.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function DoctorReports() {
  const doctor = JSON.parse(localStorage.getItem("user")); // logged in doctor
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [diseaseName, setDiseaseName] = useState("");
  const [testType, setTestType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Fetch doctor's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/appointments/doctor/${doctor._id}`
        );
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [doctor._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) {
      return alert("Please select an appointment first.");
    }

    if (!diseaseName || !value || !date) {
      return alert("Disease, Value, and Date are required.");
    }

    try {
      setSubmitting(true);
      const payload = {
        doctorId: doctor._id,
        patientId: selectedAppt.patientId._id,
        appointmentId: selectedAppt._id,
        diseaseName,
        testType,
        value: Number(value),
        unit,
        prescribedMedicines, // will be split in backend
        notes,
        date,
      };

      const res = await axios.post(
        "http://localhost:4000/api/reports/upload",
        payload
      );

      alert(res.data.message || "Report uploaded");
      // reset
      setDiseaseName("");
      setTestType("");
      setValue("");
      setUnit("");
      setPrescribedMedicines("");
      setNotes("");
      setDate("");
    } catch (err) {
      console.error("Upload report error:", err);
      alert(err.response?.data?.message || "Failed to upload report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Upload Patient Test Report
        </h2>

        {/* Appointment selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Select Appointment
          </label>
          <select
            value={selectedAppt?._id || ""}
            onChange={(e) => {
              const appt = appointments.find((a) => a._id === e.target.value);
              setSelectedAppt(appt || null);
            }}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Choose appointment --</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.patientId?.name} — {a.date} @ {a.time}
              </option>
            ))}
          </select>
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Disease Name *
              </label>
              <input
                type="text"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                placeholder="Diabetes, Hypertension, Thyroid..."
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Test Type (optional)
              </label>
              <input
                type="text"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                placeholder="Fasting, PP, HbA1c, Systolic..."
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Value *
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="mg/dL, mmHg..."
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Prescribed Medicines (comma separated)
            </label>
            <input
              type="text"
              value={prescribedMedicines}
              onChange={(e) => setPrescribedMedicines(e.target.value)}
              placeholder="Metformin 500mg, Amlodipine 5mg..."
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full border rounded-lg p-2"
              placeholder="Additional comments or lifestyle advice..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800"
          >
            {submitting ? "Uploading..." : "Upload Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
