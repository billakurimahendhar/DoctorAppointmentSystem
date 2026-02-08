// client/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";

// Doctor Pages
import DoctorHome from "./pages/Doctor/DoctorHome";
import DoctorSlotsDoctor from "./pages/Doctor/DoctorSlots"; // 🔁 renamed
import DoctorReports from "./pages/Doctor/DoctorReports";
import DoctorCourses from "./pages/Doctor/DoctorCourses";
import UploadReportPage from "./pages/Doctor/UploadReportPage";

import DoctorList from "./pages/Patient/DoctorList";

// Patient Pages
import PatientHome from "./pages/Patient/PatientHome";
import PatientReports from "./pages/Patient/PatientReports";
import PatientCourses from "./pages/Patient/PatientCourses";
import DoctorSlotsPatient from "./pages/Patient/DoctorSlots"; // 🔁 renamed
import DocAppointments from "./pages/Doctor/DocAppointments";
import PHome from "./pages/Patient/PHome";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import PatientTimeline from "./pages/Patient/PatientTimeLine";




export default function App() {
  const { user, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-700">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* 🌍 Public */}
        <Route
         path="/"
        element={
       !user ? (
         <Home />
       ) : user.role === "doctor" ? (
         <Navigate to="/doctor-home" />
      ) : (
        <Navigate to="/patient-home" />
    )
  }
/>

        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}-home`} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}-home`} />} />

        {/* 👨‍⚕️ Doctor */}
        <Route path="/doctor-home" element={<ProtectedRoute allowedRole="doctor"><DoctorHome /></ProtectedRoute>} />
        <Route path="/doctor-slots" element={<ProtectedRoute allowedRole="doctor"><DoctorSlotsDoctor /></ProtectedRoute>} />
        <Route path="/doctor-reports" element={<ProtectedRoute allowedRole="doctor"><DoctorReports /></ProtectedRoute>} />
        <Route path="/doctor-courses" element={<ProtectedRoute allowedRole="doctor"><DoctorCourses /></ProtectedRoute>} />
        <Route path="/doctor/upload-report/:appointmentId" element={<ProtectedRoute allowedRole="doctor"><UploadReportPage /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<DocAppointments />} />
        {/* 🧑 Patient */}
        <Route path="/patient-home" element={<ProtectedRoute allowedRole="patient"><PHome /></ProtectedRoute>} />
        <Route path="/patient-reports" element={<ProtectedRoute allowedRole="patient"><PatientReports /></ProtectedRoute>} />
        <Route path="/patient-courses" element={<ProtectedRoute allowedRole="patient"><PatientCourses /></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute allowedRole="patient"><DoctorSlotsPatient /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute allowedRole="patient"><PHome /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowedRole="patient"><DoctorList /></ProtectedRoute>} />
        <Route path="/doctor-profile/:id" element={<ProtectedRoute allowedRole="patient"><DoctorProfile /></ProtectedRoute>} />
        <Route path="/patient-timeline" element={<ProtectedRoute allowedRole="patient"><PatientTimeline /></ProtectedRoute>} />
        
      

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
