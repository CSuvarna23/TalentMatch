import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getJobs } from "../services/jobService";
import { getApplicants } from "../services/applicationService";

import { useAuth } from "../context/AuthContext";


function HRDashboard() {

  const { user } = useAuth();

  const [jobs, setJobs] =
    useState([]);

  const [stats, setStats] =
    useState({
      totalJobs : 0,
      applications : 0,
      underReview : 0,
      shortlisted : 0,
    });

  const [loading, setLoading] =
    useState(true);


  async function loadDashboard() {

    try {

      const jobsData =
        await getJobs();


      const jobsWithApplicants =
        await Promise.all(
          jobsData.map(
            async (job) => {

              try {

                const applicants =
                  await getApplicants(
                    job.job_id
                  );

                return {
                  ...job,
                  applicants,
                };

              } catch {

                return {
                  ...job,
                  applicants: [],
                };

              }

            }
          )
        );


      let applications = 0;
      let underReview = 0;
      let shortlisted = 0;


      jobsWithApplicants.forEach(
        (job) => {

          applications +=
            job.applicants.length;

          underReview +=
            job.applicants.filter(
              (a) =>
                a.status ===
                "Under Review"
            ).length;

          shortlisted +=
            job.applicants.filter(
              (a) =>
                a.status ===
                "Shortlisted"
            ).length;

        }
      );


      setJobs(
        jobsWithApplicants
      );


      setStats({
        totalJobs:
          jobsWithApplicants.length,

        applications,

        underReview,

        shortlisted,
      });


    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadDashboard();
  }, []);


  if (loading) {
    return (
      <div className="hr-dashboard">
        <h2>
          Loading dashboard...
        </h2>
      </div>
    );
  }


  return (
    <div className="hr-dashboard">

      <div className="hr-welcome">

        <h1>
          Welcome,{" "}
          {user?.name || "HR"} 👋
        </h1>

        <p>
          Manage your jobs and evaluate
          applicants from one place.
        </p>

      </div>


      <section className="hr-section">

        <h2>
          Recruitment Overview
        </h2>

        <div className="hr-stats">

          <div className="hr-stat-card">
            <span>
              Total Jobs
            </span>
            <strong>
              {stats.totalJobs}
            </strong>
          </div>

          <div className="hr-stat-card">
            <span>
              Applications
            </span>
            <strong>
              {stats.applications}
            </strong>
          </div>

          <div className="hr-stat-card">
            <span>
              Under Review
            </span>
            <strong>
              {stats.underReview}
            </strong>
          </div>

          <div className="hr-stat-card">
            <span>
              Shortlisted
            </span>
            <strong>
              {stats.shortlisted}
            </strong>
          </div>

        </div>

      </section>


      <section className="hr-section">

        <h2>
          Quick Actions
        </h2>

        <Link
          to="/hr/create-job"
          className="hr-create-job-button"
        >
          + Create New Job
        </Link>

      </section>


      <section className="hr-section">

        <div className="hr-section-header">

          <h2>
            Your Job Postings
          </h2>

          <Link
            className="button secondary"
            to="/hr/manage-jobs"
          >
            Manage Jobs
          </Link>

        </div>


        <div className="hr-job-list">

          {jobs.map((job) => {

            const skills =
              Array.isArray(
                job.required_skills
              )
                ? job.required_skills
                : (
                    job.required_skills
                      ?.split(",")
                      .map(
                        (s) =>
                          s.trim()
                      )
                      .filter(Boolean) ||
                    []
                  );


            return (

              <div
                className="hr-job-card"
                key={job.job_id}
              >

                <h3>
                  {job.job_title}
                </h3>


                <p>
                  {job.description}
                </p>


                <div className="hr-job-info">

                  <span>
                    <strong>
                      Location:
                    </strong>{" "}
                    {job.location}
                  </span>

                  <span>
                    <strong>
                      Experience:
                    </strong>{" "}
                    {job.experience}
                  </span>

                </div>


                <div className="hr-required-skills">

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


                <div className="hr-applicant-count">

                  <strong>
                    Applicants:
                  </strong>{" "}

                  {job.applicants.length}

                </div>


                <div className="hr-job-actions">

                  <Link
                    className="button secondary"
                    to={`/hr/jobs/${job.job_id}`}
                  >
                    View Job
                  </Link>


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
                    Edit
                  </Link>

                </div>

              </div>

            );
          })}

        </div>

      </section>

    </div>
  );
}


export default HRDashboard;