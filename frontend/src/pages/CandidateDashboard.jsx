import { useEffect, useState } from "react";

import {
  getJobs,
  getRecommendedJobs,
  getJobMatches,
} from "../services/jobService";

import { useAuth } from "../context/AuthContext";
import {
  getMyApplications,
  applyForJob,
} from "../services/applicationService";

import {
  uploadResume,
  getCurrentResume,
  viewResume,
} from "../services/resumeService";

import JobCard from "../components/JobCard";
import ApplicationCard from "../components/ApplicationCard";

function CandidateDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendationError, setRecommendationError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadData(predictedCategory = "") {
    try {
      const [jobsData, applicationsData] =
        await Promise.all([
          getJobs(),
          getMyApplications(),
        ]);

      setJobs(jobsData);
      setApplications(applicationsData);

      try {
        const resumeData =
          await getCurrentResume();

        setResume({
          ...resumeData,
          predicted_category:
            predictedCategory || resumeData.predicted_category,
        });

        try {
          const [jobMatches, recommendations] =
            await Promise.all([
              getJobMatches(),
              getRecommendedJobs(),
            ]);

          setJobs(jobMatches);
          setRecommendedJobs(recommendations);
          setRecommendationError("");
        } catch (error) {
          setRecommendedJobs([]);
          setRecommendationError(error.message);
        }
      } catch {
        setResume(null);
        setRecommendedJobs([]);
        setRecommendationError("");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleApply(jobId) {
    try {
      await applyForJob(jobId);

      alert("Application submitted successfully!");

      const updated =
        await getMyApplications();

      setApplications(updated);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    try {
      setUploading(true);

      const uploadData = await uploadResume(file);

      alert("Resume uploaded successfully!");

      await loadData(uploadData.predicted_category);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  // Application statissume.retics
  const appliedCount = applications.length;

  const shortlistedCount =
    applications.filter(
      (app) => app.status === "Shortlisted"
    ).length;

  const underReviewCount =
    applications.filter(
      (app) => app.status === "Under Review"
    ).length;

  const rejectedCount =
    applications.filter(
      (app) => app.status === "Rejected"
    ).length;

  return (
    <div className="candidate-dashboard dashboard-shell">
    <div className="dashboard-top">

      {/* Welcome */}
      <div className="candidate-welcome">
        <h1>Welcome, {user.name}</h1>
        <p>
          Manage your applications, resume and job
          opportunities.
        </p>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* My Applications */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          My Applications
        </h2>

        <div className="application-stats">

          <div className="application-stat">
            <span className="application-stat-label">
              Applied Jobs
            </span>
            <span className="application-stat-number">
              {appliedCount}
            </span>
          </div>

          <div className="application-stat">
            <span className="application-stat-label">
              Shortlisted
            </span>
            <span className="application-stat-number">
              {shortlistedCount}
            </span>
          </div>

          <div className="application-stat">
            <span className="application-stat-label">
              Under Review
            </span>
            <span className="application-stat-number">
              {underReviewCount}
            </span>
          </div>

          <div className="application-stat">
            <span className="application-stat-label">
              Rejected
            </span>
            <span className="application-stat-number">
              {rejectedCount}
            </span>
          </div>

        </div>
      </section>

      {/* My Resume */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          My Resume
        </h2>

        <div className="resume-card">

          {resume ? (
            <>
              <div className="resume-header">

                <div className="resume-icon">
                  📄
                </div>

                <div>
                  <div className="resume-name">
                    {resume.file_name}
                  </div>

                  {resume.predicted_category && (
                    <div className="resume-category">
                      Predicted category: {resume.predicted_category}
                    </div>
                  )}
                </div>

              </div>

              {resume.skills &&
                resume.skills.length > 0 && (
                  <div className="resume-skills">

                    <div className="resume-skills-title">
                      Skills
                    </div>

                    <div className="skill-list">
                      {resume.skills.map(
                        (skill, index) => (
                          <span
                            className="skill-tag"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

              <div className="resume-actions">

                <button
                  className="button secondary"
                  onClick={() =>
                    viewResume(resume.resume_id)
                  }
                >
                  View Resume
                </button>

                <label className="button">
                  Re-upload Resume

                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    hidden
                  />
                </label>

              </div>

              {uploading && (
                <p>Uploading...</p>
              )}
            </>
          ) : (
            <>
              <p>
                You have not uploaded a resume yet.
              </p>

              <div className="resume-actions">

                <label className="button">
                  Upload Resume

                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    hidden
                  />
                </label>

              </div>

              {uploading && (
                <p>Uploading...</p>
              )}
            </>
          )}

        </div>
      </section>

      </div>

      <div className="dashboard-scroll-content">

      {recommendedJobs.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Recommended Jobs
          </h2>

          <div className="job-grid">
            {recommendedJobs.slice(0, 5).map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onApply={handleApply}
                hasApplied={applications.some(
                  (application) =>
                    application.job_id === job.job_id ||
                    application.job?.job_id === job.job_id
                )}
              />
            ))}
          </div>
        </section>
      )}

      {recommendationError && (
        <div className="error">
          Recommendations unavailable: {recommendationError}
        </div>
      )}

      {/* Job Postings */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          Job Postings
        </h2>

        {jobs.length === 0 ? (
          <p>No jobs available.</p>
        ) : (
          <div className="job-grid">

            {jobs.map((job) => (
              <JobCard
  key={job.job_id}
  job={job}
  onApply={handleApply}
  hasApplied={applications.some(
    (application) =>
      application.job_id === job.job_id ||
      application.job?.job_id === job.job_id
  )}
/>
            ))}

          </div>
        )}
      </section>

      {/* Application Details */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          Application History
        </h2>

        {applications.length === 0 ? (
          <p>
            You haven't applied for any jobs yet.
          </p>
        ) : (
          <div className="application-list">

            {applications.map(
              (application) => (
                <ApplicationCard
                  key={
                    application.application_id
                  }
                  application={application}
                />
              )
            )}

          </div>
        )}
      </section>

      </div>
    </div>
  );
}

export default CandidateDashboard;