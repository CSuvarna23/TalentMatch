import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getJob } from "../services/jobService";
import { applyForJob } from "../services/applicationService";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await getJob(jobId);
        setJob(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  async function handleApply() {
    try {
      await applyForJob(jobId);

      alert(
        "Application submitted successfully!"
      );

      navigate("/candidate/dashboard");
    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) {
    return (
      <div className="container">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        Job not found.
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{job.job_title}</h1>

        <p>{job.description}</p>

        <p>
          <strong>Location:</strong>{" "}
          {job.location}
        </p>

        <p>
          <strong>Experience:</strong>{" "}
          {job.experience}
        </p>

        <p>
          <strong>Required Skills:</strong>{" "}
          {job.required_skills}
        </p>

        <button
          className="button"
          onClick={handleApply}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

export default JobDetails;