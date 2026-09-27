import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import CandidateDashboard from "./pages/CandidateDashboard";
import Jobs from "./pages/Jobs.jsx";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import ApplicationDetails from "./pages/ApplicationDetails";

import HRDashboard from "./pages/HRDashboard";
import CreateJob from "./pages/CreateJob";
import ManageJobs from "./pages/ManageJobs";
import ApplicantDetails from "./pages/ApplicantDetails";
import HRApplicantDetails from "./pages/HRApplicantDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            CANDIDATE ROUTES
        ========================= */}

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute role="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="candidate">
              <Jobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute role="candidate">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute role="candidate">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            <ProtectedRoute role="candidate">
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications/:applicationId"
          element={
            <ProtectedRoute role="candidate">
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />


        {/* =========================
            HR ROUTES
        ========================= */}

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute role="hr">
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/create-job"
          element={
            <ProtectedRoute role="hr">
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/manage-jobs"
          element={
            <ProtectedRoute role="hr">
              <ManageJobs />
            </ProtectedRoute>
          }
        />

        {/* HR Applicants */}
        <Route
          path="/hr/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="hr">
              <ApplicantDetails />
            </ProtectedRoute>
          }
        />

        {/* HR Applicant Details */}
        <Route
          path="/hr/jobs/:jobId/applicants/:applicationId"
          element={
            <ProtectedRoute role="hr">
              <HRApplicantDetails />
            </ProtectedRoute>
          }
        />

        {/* HR Profile */}
        <Route
          path="/hr/profile"
          element={
            <ProtectedRoute role="hr">
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================
            UNKNOWN ROUTE
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;