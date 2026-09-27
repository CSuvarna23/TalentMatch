import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getJob } from "../services/jobService";


function HRJobDetails() {
  const { jobId } = useParams();

  const [job, setJob] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    async function loadJob() {
      try {
        const data =
          await getJob(jobId);

        setJob(data);

      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);


  if (loading) {
    return (
      <div className="container">
        <h2>
          Loading job...
        </h2>
      </div>
    );
  }


  if (!job) {
    return (
      <div className="container">
        <h2>
          Job not found.
        </h2>
      </div>
    );
  }


  const skills =
    Array.isArray(
      job.required_skills
    )
      ? job.required_skills
      : (
          job.required_skills
            ?.split(",")
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(Boolean) || []
        );


  return (
    <div className="container">

      <div className="card">

        <h1>
          {job.job_title}
        </h1>

        <p>
          {job.description}
        </p>


        <p>
          <strong>
            Location:
          </strong>{" "}
          {job.location}
        </p>


        <p>
          <strong>
            Experience:
          </strong>{" "}
          {job.experience}
        </p>


        <div>
          <strong>
            Required Skills:
          </strong>

          <div className="hr-skill-list">

            {skills.map(
              (skill, index) => (
                <span
                  className="hr-skill-tag"
                  key={index}
                >
                  {skill}
                </span>
              )
            )}

          </div>
        </div>


        <div
          className="button-row"
        >

          <Link
            className="button"
            to={`/hr/jobs/${job.job_id}/applicants`}
          >
            View Applicants
          </Link>


          <Link
            className="button secondary"
            to={`/hr/jobs/${job.job_id}/edit`}
          >
            Edit Job
          </Link>


          <Link
            className="button secondary"
            to="/hr/manage-jobs"
          >
            Back to Jobs
          </Link>

        </div>

      </div>

    </div>
  );
}

export default HRJobDetails;