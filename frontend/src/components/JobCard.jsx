import { Link } from "react-router-dom";

function JobCard({ job, onApply, hasApplied = false }) {
  return (
    <div className="job-card">

      <h3 className="job-title">
        {job.job_title}
      </h3>

      {job.company_name && (
        <p className="job-company">
          {job.company_name}
        </p>
      )}

      <div className="job-info">
        <span>
          <strong>Location:</strong>{" "}
          {job.location}
        </span>

        <span>
          <strong>Experience:</strong>{" "}
          {job.experience}
        </span>
      </div>

      {job.description && (
        <p>
          {job.description}
        </p>
      )}

      {job.required_skills && (
        <div className="job-skills">
          {Array.isArray(job.required_skills)
            ? job.required_skills.map((skill, index) => (
                <span
                  className="job-skill"
                  key={index}
                >
                  {skill}
                </span>
              ))
            : (
              <span className="job-skill">
                {job.required_skills}
              </span>
            )}
        </div>
      )}

      <div className="job-card-actions">

        <Link
          className="button secondary"
          to={`/jobs/${job.job_id}`}
        >
          View Details
        </Link>

        {onApply && (
          <button
            className={`button ${
              hasApplied ? "applied-button" : ""
            }`}
            onClick={() =>
              !hasApplied && onApply(job.job_id)
            }
            disabled={hasApplied}
          >
            {hasApplied ? "Applied " : "Apply Now"}
          </button>
        )}

      </div>

    </div>
  );
}

export default JobCard;