import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getApplicants,
  updateApplication,
} from "../services/applicationService";

import { getJob } from "../services/jobService";

import { API_URL } from "../services/api";

function ApplicantDetails() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [jobData, applicantsData] = await Promise.all([
        getJob(jobId),
        getApplicants(jobId),
      ]);

      setJob(jobData);
      setApplicants(applicantsData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [jobId]);

  async function handleStatusChange(applicationId, status) {
    try {
      await updateApplication(applicationId, status);

      alert("Status updated successfully.");

      await loadData();
    } catch (error) {
      alert(error.message);
    }
  }

  async function viewResume(applicationId) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/applications/${applicationId}/resume`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Unable to open resume"
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h2>Loading applicants...</h2>
      </div>
    );
  }

  const chartData = applicants.map((applicant) => ({
    name: applicant.candidate_name || "Candidate",
    score: Number(applicant.match_score || 0),
  }));

  const totalApplicants = applicants.length;

  const underReview = applicants.filter(
    (applicant) =>
      applicant.status === "Under Review"
  ).length;

  const shortlisted = applicants.filter(
    (applicant) =>
      applicant.status === "Shortlisted"
  ).length;

  const rejected = applicants.filter(
    (applicant) =>
      applicant.status === "Rejected"
  ).length;

  return (
    <div className="hr-applicants-page">

      {/* Header */}

      <div className="hr-applicants-header">
        <div>
          <h1>
            {job?.job_title} — Applicants
          </h1>

          <p>
            Review candidates and their match scores.
          </p>
        </div>

        <Link
          className="button secondary"
          to="/hr/manage-jobs"
        >
          Back to Jobs
        </Link>
      </div>


      {/* Statistics */}

      <div className="hr-applicant-stats">

        <div className="hr-stat-card">
          <span>Total Applicants</span>
          <strong>{totalApplicants}</strong>
        </div>

        <div className="hr-stat-card">
          <span>Under Review</span>
          <strong>{underReview}</strong>
        </div>

        <div className="hr-stat-card">
          <span>Shortlisted</span>
          <strong>{shortlisted}</strong>
        </div>

        <div className="hr-stat-card">
          <span>Rejected</span>
          <strong>{rejected}</strong>
        </div>

      </div>


      {applicants.length === 0 ? (

        <div className="hr-empty">
          <h2>No applicants yet</h2>

          <p>
            No candidates have applied for this job.
          </p>
        </div>

      ) : (

        <>

          {/* Chart */}

          <section className="hr-chart-card">

            <h2>
              Match Score by Applicant
            </h2>

            <div className="hr-chart-container">

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 60,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                  />

                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Match Score (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${value}%`
                    }
                  />

                  <Bar
                    dataKey="score"
                    name="Match Score"
                    radius={[5, 5, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </section>


          {/* Applicant Table */}

          <section className="hr-applicant-table-card">

            <h2>
              Applicant List
            </h2>

            <div className="table-wrapper">

              <table className="applicant-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {applicants.map((applicant) => (

                    <tr
                      key={applicant.application_id}
                    >

                      <td>
                        <strong>
                          {applicant.candidate_name}
                        </strong>

                        <small>
                          {applicant.candidate_email}
                        </small>
                      </td>


                      <td>
                        <strong>
                          {applicant.match_score}%
                        </strong>
                      </td>


                      <td>

                        <span
                          className={`status ${
                            applicant.status ===
                            "Shortlisted"
                              ? "status-shortlisted"
                              : applicant.status ===
                                "Rejected"
                              ? "status-rejected"
                              : "status-under-review"
                          }`}
                        >
                          {applicant.status}
                        </span>

                      </td>


                      <td>
                        {applicant.applied_at
                          ? new Date(
                              applicant.applied_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>


                      <td>

                        <div className="applicant-actions">

                          {/* VIEW APPLICANT */}

                          <Link
                            className="button"
                            to={`/hr/jobs/${jobId}/applicants/${applicant.application_id}`}
                          >
                            View Applicant
                          </Link>


                          {/* VIEW RESUME */}

                          <button
                            type="button"
                            className="button secondary"
                            onClick={() =>
                              viewResume(
                                applicant.application_id
                              )
                            }
                          >
                            Resume
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </>

      )}

    </div>
  );
}

export default ApplicantDetails;