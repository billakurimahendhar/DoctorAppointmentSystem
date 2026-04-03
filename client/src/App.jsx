// client/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import Layout from "./components/Layout";
// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import Home from "./pages/Home";

// Doctor Pages
import DoctorHome from "./pages/Doctor/DoctorHome";
import AvailabilityManager from "./pages/Doctor/AvailabilityManager";
import DoctorSlots from "./pages/Doctor/DoctorSlots"; // 🔁 renamed
import DoctorReports from "./pages/Doctor/DoctorReports";
import DoctorCourses from "./pages/Doctor/DoctorCourses";
import UploadReportPage from "./pages/Doctor/UploadReportPage";

import DoctorList from "./pages/Patient/DoctorList";
import DoctorDirectory from "./pages/Patient/DoctorDirectory";

// Patient Pages
import PatientHome from "./pages/Patient/PatientHome";
import PatientReports from "./pages/Patient/PatientReports";
import HealthReports from "./pages/Patient/HealthReports";
import PatientCourses from "./pages/Patient/PatientCourses";
import DoctorBookingSlots from "./pages/Patient/DoctorBookingSlots";
import DoctorSlotsPatient from "./pages/Patient/DoctorSlots"; // 🔁 renamed
import DocAppointments from "./pages/Doctor/DocAppointments";
import PHome from "./pages/Patient/PHome";
import DoctorProfileDetails from "./pages/Patient/DoctorProfileDetails";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import PatientTimeline from "./pages/Patient/PatientTimeline";
import MedicalTimeline from "./pages/Patient/MedicalTimeline";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/Admin/AdminDashboard";



import DoctorDashboard from "./pages/DoctorDashboard";


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
         <Navigate to="/doctor-dashboard" />
      ) : user.role === "admin" ? (
        <Navigate to="/admin-dashboard" />
      ) : (
        <Navigate to="/patient-home" />
    )
  }
/>

        <Route
  path="/login"
  element={
    !user ? (
      <Login />
    ) : user.role === "doctor" ? (
      <Navigate to="/doctor-dashboard" />
    ) : user.role === "admin" ? (
      <Navigate to="/admin-dashboard" />
    ) : (
      <Navigate to="/patient-home" />
    )
  }
/>
        <Route
          path="/register"
          element={
            !user ? (
              <Register />
            ) : user.role === "doctor" ? (
              <Navigate to="/doctor-dashboard" />
            ) : user.role === "admin" ? (
              <Navigate to="/admin-dashboard" />
            ) : (
              <Navigate to="/patient-home" />
            )
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* 👨‍⚕️ Doctor */}
        <Route path="/doctor-home" element={<ProtectedRoute allowedRole="doctor"><DoctorHome /></ProtectedRoute>} />
        <Route path="/doctor-slots" element={<ProtectedRoute allowedRole="doctor"><AvailabilityManager /></ProtectedRoute>} />
        <Route path="/doctor-reports" element={<ProtectedRoute allowedRole="doctor"><DoctorReports /></ProtectedRoute>} />
        <Route path="/doctor-courses" element={<ProtectedRoute allowedRole="doctor"><DoctorCourses /></ProtectedRoute>} />
        <Route path="/doctor/upload-report/:appointmentId" element={<ProtectedRoute allowedRole="doctor"><UploadReportPage /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DocAppointments /></ProtectedRoute>} />
       
        {/* 🧑 Patient */}
        <Route path="/patient-home" element={<ProtectedRoute allowedRole="patient"><PHome /></ProtectedRoute>} />
        <Route path="/patient-appointments" element={<ProtectedRoute allowedRole="patient"><PatientAppointments /></ProtectedRoute>} />
        <Route path="/patient-reports" element={<ProtectedRoute allowedRole="patient"><HealthReports /></ProtectedRoute>} />
        <Route path="/patient-courses" element={<ProtectedRoute allowedRole="patient"><PatientCourses /></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute allowedRole="patient"><DoctorBookingSlots /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute allowedRole="patient"><PHome /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowedRole="patient"><DoctorDirectory /></ProtectedRoute>} />
        <Route path="/doctor-profile/:id" element={<ProtectedRoute allowedRole="patient"><DoctorProfileDetails /></ProtectedRoute>} />
        <Route path="/patient-timeline" element={<ProtectedRoute allowedRole="patient"><MedicalTimeline /></ProtectedRoute>} />
        
          {/* 🩺 Doctor Dashboard */}
          <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRole={user?.role}><Notifications /></ProtectedRoute>} />

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    
    </Router>
  );
}
