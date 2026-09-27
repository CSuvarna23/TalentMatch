import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getApplicantDetails,
  updateApplication,
} from "../services/applicationService";

import { API_URL } from "../services/api";


function HRApplicantDetails() {

  const {
    jobId,
    applicationId,
  } = useParams();

  const navigate = useNavigate();

  const [applicant, setApplicant] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [status, setStatus] =
    useState("Under Review");


  async function loadApplicant() {

    try {

      const data =
        await getApplicantDetails(
          jobId,
          applicationId
        );

      setApplicant(data);

      setStatus(
        data.status || "Under Review"
      );

    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadApplicant();
  }, [jobId, applicationId]);


  async function handleUpdateStatus() {

    try {

      await updateApplication(
        applicationId,
        status
      );

      alert(
        "Application status updated successfully."
      );

      await loadApplicant();

    } catch (error) {

      alert(error.message);

    }
  }


  async function viewResume() {

    try {

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/applications/${applicationId}/resume`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {

        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
          "Unable to open resume"
        );

      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      window.open(
        url,
        "_blank"
      );

    } catch (error) {

      alert(error.message);

    }
  }


  if (loading) {

    return (
      <div className="container">
        <h2>
          Loading applicant...
        </h2>
      </div>
    );

  }


  if (!applicant) {

    return (
      <div className="container">
        <h2>
          Applicant not found.
        </h2>
      </div>
    );

  }


  return (

    <div className="hr-applicant-details">

      {/* Header */}

      <div className="hr-detail-header">

        <div>

          <h1>
            Applicant Details
          </h1>

          <p>
            Review candidate information
            and application details.
          </p>

        </div>


        <button
          className="button secondary"
          onClick={() =>
            navigate(
              `/hr/jobs/${jobId}/applicants`
            )
          }
        >
          Back to Applicants
        </button>

      </div>


      {/* Candidate */}

      <div className="hr-detail-card">

        <h2>
          Candidate
        </h2>

        <div className="hr-detail-grid">

          <div>

            <span>
              Name
            </span>

            <strong>
              {applicant.candidate_name ||
                applicant.candidate?.name ||
                "Not available"}
            </strong>

          </div>


          <div>

            <span>
              Email
            </span>

            <strong>
              {applicant.candidate_email ||
                applicant.candidate?.email ||
                "Not available"}
            </strong>

          </div>


          <div>

            <span>
              Applied For
            </span>

            <strong>
              {applicant.job?.job_title ||
                applicant.job_title ||
                "Not available"}
            </strong>

          </div>


          <div>

            <span>
              Applied On
            </span>

            <strong>
              {applicant.applied_at
                ? new Date(
                    applicant.applied_at
                  ).toLocaleDateString()
                : "-"}
            </strong>

          </div>

        </div>

      </div>


      {/* Match Score */}

      <div className="hr-detail-card">

        <h2>
          Match Score
        </h2>

        <div className="applicant-score">

          {applicant.match_score ?? 0}%

        </div>

      </div>


      {/* Resume */}

      <div className="hr-detail-card">

        <h2>
          Resume
        </h2>

        <div className="resume-used">

          <span className="resume-icon">
            📄
          </span>

          <div>

            <strong>
              {applicant.resume?.file_name ||
                applicant.file_name ||
                "Resume"}
            </strong>

            <p>
              Resume submitted with this
              application.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="button"
          onClick={viewResume}
        >
          View Resume
        </button>

      </div>


      {/* Skills */}

      <div className="hr-detail-card">

        <h2>
          Skills Analysis
        </h2>


        <div className="skills-analysis">

          {/* Matched Skills */}

          <div>

            <h3>
              Matched Skills
            </h3>

            {applicant.matched_skills?.length ? (

              <div className="analysis-skills">

                {applicant.matched_skills.map(
                  (skill, index) => (

                    <span
                      className="matched-skill"
                      key={index}
                    >
                      ✓ {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p>
                No matched skills.
              </p>

            )}

          </div>


          {/* Missing Skills */}

          <div>

            <h3>
              Missing Skills
            </h3>

            {applicant.missing_skills?.length ? (

              <div className="analysis-skills">

                {applicant.missing_skills.map(
                  (skill, index) => (

                    <span
                      className="missing-skill"
                      key={index}
                    >
                      ✗ {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p>
                No missing skills.
              </p>

            )}

          </div>

        </div>

      </div>


      {/* Status */}

      <div className="hr-detail-card">

        <h2>
          Application Status
        </h2>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >

          <option value="Under Review">
            Under Review
          </option>

          <option value="Shortlisted">
            Shortlisted
          </option>

          <option value="Rejected">
            Rejected
          </option>

        </select>


        <button
          type="button"
          className="button"
          onClick={
            handleUpdateStatus
          }
        >
          Update Status
        </button>

      </div>

    </div>

  );
}


export default HRApplicantDetails;