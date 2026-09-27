import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getApplication } from "../services/applicationService";

function ApplicationDetails() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      try {
        const data = await getApplication(applicationId);
        setApplication(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="container">
        Loading application...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container">
        Application not found.
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Application Details</h1>

        <p>
          <strong>Application ID:</strong>{" "}
          {application.application_id}
        </p>

        <p>
          <strong>Job ID:</strong>{" "}
          {application.job?.job_id ?? "N/A"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className="status">
            {application.status}
          </span>
        </p>

        <div className="score">
          <h2>Match Score</h2>

          <div className="score-number">
            {application.match_score ?? 0}%
          </div>
        </div>

        <div>
          <h3>Matched Skills</h3>

          <p>
            {application.matched_skills || "None"}
          </p>
        </div>

        <div>
          <h3>Missing Skills</h3>

          <p>
            {application.missing_skills || "None"}
          </p>
        </div>

        <p>
          <strong>Resume Used:</strong>{" "}
          Resume #{application.resume?.resume_id ?? "N/A"}
        </p>

        <Link
          className="button secondary"
          to="/candidate/dashboard"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default ApplicationDetails;