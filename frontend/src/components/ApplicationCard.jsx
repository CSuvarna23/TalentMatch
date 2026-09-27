import { Link } from "react-router-dom";

function ApplicationCard({ application }) {
  const statusClass =
    application.status === "Shortlisted"
      ? "status-shortlisted"
      : application.status === "Under Review"
      ? "status-under-review"
      : application.status === "Rejected"
      ? "status-rejected"
      : "";

  return (
    <div className="application-card">

      <div className="application-card-header">

        <div>
          <h3 className="application-job-title">
            {application.job_title ||
              application.job?.job_title ||
              `Application #${application.application_id}`}
          </h3>

          {application.job?.company_name && (
            <p className="application-company">
              {application.job.company_name}
            </p>
          )}
        </div>

        <span className={`status ${statusClass}`}>
          {application.status}
        </span>

      </div>

      <div className="application-details">

        <div>
          <span className="application-detail-label">
            Application ID
          </span>

          <span className="application-detail-value">
            #{application.application_id}
          </span>
        </div>

        <div>
          <span className="application-detail-label">
            Match Score
          </span>

          <span className="application-detail-value">
            {application.match_score ?? 0}%
          </span>
        </div>

      </div>

      <div className="application-card-actions">

        <Link
          className="button secondary"
          to={`/applications/${application.application_id}`}
        >
          View Application
        </Link>

      </div>

    </div>
  );
}

export default ApplicationCard;