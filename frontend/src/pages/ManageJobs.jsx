import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  getJobs,
  disableJob,
} from "../services/jobService";

import {
  getApplicants,
} from "../services/applicationService";


function ManageJobs() {

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchText, setSearchText] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(true);

  const [location, setLocation] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [selectedSkills, setSelectedSkills] =
    useState([]);

  const [applicantCounts, setApplicantCounts] =
    useState({});


  async function loadJobs() {

    try {

      const jobsData =
        await getJobs(true);

      setJobs(jobsData);


      const counts = {};

      await Promise.all(
        jobsData.map(
          async (job) => {

            try {

              const applicants =
                await getApplicants(
                  job.job_id
                );

              counts[job.job_id] =
                applicants.length;

            } catch {

              counts[job.job_id] = 0;

            }

          }
        )
      );

      setApplicantCounts(counts);

    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadJobs();
  }, []);


  function handleSearch(e) {

    e.preventDefault();

    setSearchQuery(
      searchText.trim()
    );
  }


  const availableSkills = [
    ...new Set(
      jobs.flatMap((job) => {

        if (
          Array.isArray(
            job.required_skills
          )
        ) {
          return job.required_skills;
        }

        return (
          job.required_skills
            ?.split(",")
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(Boolean) || []
        );

      })
    ),
  ].sort();


  function handleSkillChange(skill) {

    setSelectedSkills(
      (current) => {

        if (
          current.includes(skill)
        ) {

          return current.filter(
            (item) =>
              item !== skill
          );

        }

        return [
          ...current,
          skill,
        ];

      }
    );
  }


  function getRequiredYears(
    text
  ) {

    const match =
      text?.match(
        /(\d+(?:\.\d+)?)/
      );

    return match
      ? Number(match[1])
      : 0;
  }


  const filteredJobs =
    jobs.filter((job) => {

      const search =
        searchQuery.toLowerCase();


      const skillsText =
        Array.isArray(
          job.required_skills
        )
          ? job.required_skills.join(" ")
          : job.required_skills || "";


      const matchesSearch =
        !search ||
        job.job_title
          ?.toLowerCase()
          .includes(search) ||
        job.description
          ?.toLowerCase()
          .includes(search) ||
        job.location
          ?.toLowerCase()
          .includes(search) ||
        skillsText
          .toLowerCase()
          .includes(search);


      const matchesLocation =
        !location ||
        job.location
          ?.toLowerCase()
          .includes(
            location.toLowerCase()
          );


      const requiredYears =
        getRequiredYears(
          job.experience
        );


      const userYears =
        experience
          ? Number(experience)
          : null;


      const matchesExperience =
        userYears === null ||
        Number.isNaN(userYears) ||
        userYears >= requiredYears;


      const jobSkills =
        Array.isArray(
          job.required_skills
        )
          ? job.required_skills
          : (
              job.required_skills
                ?.split(",")
                .map(
                  (s) => s.trim()
                )
                .filter(Boolean) ||
              []
            );


      const matchesSkills =
        selectedSkills.every(
          (selected) =>
            jobSkills.some(
              (jobSkill) =>
                jobSkill
                  .toLowerCase() ===
                selected
                  .toLowerCase()
            )
        );


      return (
        matchesSearch &&
        matchesLocation &&
        matchesExperience &&
        matchesSkills
      );

    });


  function clearFilters() {

    setSearchText("");
    setSearchQuery("");
    setLocation("");
    setExperience("");
    setSelectedSkills([]);

  }


  async function handleDisable(
    jobId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure u want to disable the job"
      );


    if (!confirmed) {
      return;
    }


    try {

      await disableJob(jobId);

      alert(
        "Job disabled successfully."
      );

      setJobs(
        (current) =>
          current.filter(
            (job) =>
              job.job_id !== jobId
          )
      );

    } catch (error) {

      alert(error.message);

    }
  }


  if (loading) {
    return (
      <div className="container">
        <h2>
          Loading jobs...
        </h2>
      </div>
    );
  }


  return (
    <div className="candidate-dashboard">

      <div className="candidate-welcome">

        <h1>
          Manage Jobs
        </h1>

        <p>
          Search, filter and manage
          your job postings.
        </p>

      </div>


      {/* Search */}

      <form
        className="jobs-search"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search jobs, locations or skills..."
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
        />

        <button
          className="button"
          type="submit"
        >
          Search
        </button>

      </form>


      {/* Filter button */}

      <button
        className="filter-toggle-button"
        onClick={() =>
          setShowFilters(
            !showFilters
          )
        }
      >
        ☰{" "}
        {showFilters
          ? "Hide Filters"
          : "Show Filters"}
      </button>


      <div className="jobs-layout">

        {/* Filters */}

        {showFilters && (

          <aside className="jobs-filter-panel">

            <div className="filter-header">

              <h2>
                Filter Jobs
              </h2>

            </div>


            <div className="filter-group">

              <label>
                Location
              </label>

              <input
                placeholder="e.g. Bangalore"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="filter-group">

              <label>
                Experience
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2"
                value={experience}
                onChange={(e) =>
                  setExperience(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="filter-group">

              <label>
                Skills
              </label>

              <div className="skills-checkbox-list">

                {availableSkills.map(
                  (skill) => (

                    <label
                      className="skill-checkbox"
                      key={skill}
                    >

                      <input
                        type="checkbox"
                        checked={
                          selectedSkills.includes(
                            skill
                          )
                        }
                        onChange={() =>
                          handleSkillChange(
                            skill
                          )
                        }
                      />

                      <span>
                        {skill}
                      </span>

                    </label>

                  )
                )}

              </div>

            </div>


            <button
              className="button secondary clear-filter-button"
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </aside>

        )}


        {/* Jobs */}

        <main className="jobs-results">

          <div className="jobs-results-header">

            <h2>
              Your Job Postings
            </h2>

            <span>
              {filteredJobs.length} job
              {filteredJobs.length !== 1
                ? "s"
                : ""}
            </span>

          </div>


          {filteredJobs.length === 0 ? (

            <div className="no-jobs">

              <h3>
                No jobs found
              </h3>

              <p>
                Try changing your filters.
              </p>

            </div>

          ) : (

            <div className="hr-job-list">

              {filteredJobs.map(
                (job) => {

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

                        {applicantCounts[
                          job.job_id
                        ] || 0}

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


                        <button
                          className="button danger"
                          onClick={() =>
                            handleDisable(
                              job.job_id
                            )
                          }
                          disabled={job.is_active === false}
                        >
                          {job.is_active === false
                            ? "Disabled"
                            : "Disable"}
                        </button>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}


export default ManageJobs;