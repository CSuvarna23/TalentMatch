import { useEffect, useState } from "react";

import JobCard from "../components/JobCard";

import {
  getJobs,
} from "../services/jobService";

import {
  getMyApplications,
  applyForJob,
} from "../services/applicationService";


function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showFilters, setShowFilters] = useState(true);

  const [location, setLocation] = useState("");
  const [userExperience, setUserExperience] = useState("");

  const [selectedSkills, setSelectedSkills] = useState([]);


  // =========================
  // Load jobs + applications
  // =========================

  useEffect(() => {
    async function loadData() {
      try {
        const [
          jobsData,
          applicationsData,
        ] = await Promise.all([
          getJobs(),
          getMyApplications(),
        ]);

        setJobs(jobsData);
        setApplications(applicationsData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);


  // =========================
  // Search
  // =========================

  function handleSearch(e) {
    e.preventDefault();

    setSearchQuery(
      searchText.trim()
    );
  }


  // =========================
  // Apply for job
  // =========================

  async function handleApply(jobId) {
    try {
      await applyForJob(jobId);

      alert(
        "Application submitted successfully!"
      );

      const updatedApplications =
        await getMyApplications();

      setApplications(
        updatedApplications
      );

    } catch (error) {
      alert(error.message);
    }
  }


  // =========================
  // Skills from job postings
  // =========================

  const availableSkills = [
    ...new Set(
      jobs.flatMap((job) => {

        if (Array.isArray(job.required_skills)) {
          return job.required_skills;
        }

        if (typeof job.required_skills === "string") {
          return job.required_skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
        }

        return [];
      })
    ),
  ].sort();


  // =========================
  // Skill checkbox
  // =========================

  function handleSkillChange(skill) {
    setSelectedSkills((currentSkills) => {

      if (currentSkills.includes(skill)) {
        return currentSkills.filter(
          (item) => item !== skill
        );
      }

      return [
        ...currentSkills,
        skill,
      ];
    });
  }


  // =========================
  // Experience filter
  // =========================

  function getMinimumExperience(
    experienceText
  ) {
    if (!experienceText) {
      return 0;
    }

    const match =
      experienceText.match(
        /(\d+(?:\.\d+)?)/
      );

    if (!match) {
      return 0;
    }

    return Number(match[1]);
  }


  function matchesExperience(
    jobExperience
  ) {
    // No experience entered
    if (!userExperience) {
      return true;
    }

    const userYears =
      Number(userExperience);

    if (
      Number.isNaN(userYears)
    ) {
      return true;
    }

    const requiredYears =
      getMinimumExperience(
        jobExperience
      );

    /*
      Example:

      Job: "1+ years"
      User: 2 years

      2 >= 1
      => MATCH
    */

    return (
      userYears >= requiredYears
    );
  }


  // =========================
  // Check applied
  // =========================

  function hasApplied(jobId) {
    return applications.some(
      (application) =>
        application.job_id === jobId ||
        application.job?.job_id === jobId
    );
  }


  // =========================
  // Filter jobs
  // =========================

  const filteredJobs =
    jobs.filter((job) => {

      const search =
        searchQuery.toLowerCase();


      // Search
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
        job.company_name
          ?.toLowerCase()
          .includes(search) ||
        job.description
          ?.toLowerCase()
          .includes(search) ||
        skillsText
          .toLowerCase()
          .includes(search);


      // Location
      const matchesLocation =
        !location ||
        job.location
          ?.toLowerCase()
          .includes(
            location.toLowerCase()
          );


      // Experience
      const matchesExp =
        matchesExperience(
          job.experience
        );


      // Skills
      const jobSkills =
        Array.isArray(
          job.required_skills
        )
          ? job.required_skills
          : (
              job.required_skills
                ? job.required_skills
                    .split(",")
                    .map(
                      (skill) =>
                        skill.trim()
                    )
                : []
            );


      /*
        If multiple skills are selected,
        the job must contain ALL selected
        skills.
      */

      const matchesSkills =
        selectedSkills.every(
          (selectedSkill) =>
            jobSkills.some(
              (jobSkill) =>
                jobSkill
                  .toLowerCase()
                  .trim() ===
                selectedSkill
                  .toLowerCase()
                  .trim()
            )
        );


      return (
        matchesSearch &&
        matchesLocation &&
        matchesExp &&
        matchesSkills
      );
    });


  // =========================
  // Clear filters
  // =========================

  function clearFilters() {
    setLocation("");
    setUserExperience("");
    setSelectedSkills([]);

    setSearchText("");
    setSearchQuery("");
  }


  // =========================
  // Loading
  // =========================

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

      {/* =========================
          Header
      ========================= */}

      <div className="candidate-welcome">

        <h1>
          Job Postings
        </h1>

        <p>
          Browse and search available
          job opportunities.
        </p>

      </div>


      {error && (
        <div className="error">
          {error}
        </div>
      )}


      {/* =========================
          Search
      ========================= */}

      <form
        className="jobs-search"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search jobs, companies or skills..."
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
        />

        <button
          type="submit"
          className="button"
        >
          Search
        </button>

      </form>


      {/* =========================
          Filter button
      ========================= */}

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


      {/* =========================
          Main layout
      ========================= */}

      <div className="jobs-layout">


        {/* =========================
            LEFT FILTER
        ========================= */}

        {showFilters && (
          <aside className="jobs-filter-panel">

            <div className="filter-header">

              <h2>
                Filter Jobs
              </h2>

            </div>


            {/* Location */}

            <div className="filter-group">

              <label>
                Location
              </label>

              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              />

            </div>


            {/* Experience */}

            <div className="filter-group">

              <label>
                Your Experience
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2"
                value={userExperience}
                onChange={(e) =>
                  setUserExperience(
                    e.target.value
                  )
                }
              />

              <small className="filter-help">
                Enter your years of experience.
                A job requiring 1+ years will
                match if you have 1 year or more.
              </small>

            </div>


            {/* Skills */}

            <div className="filter-group">

              <label>
                Skills
              </label>


              <div className="skills-checkbox-list">

                {availableSkills.length === 0 ? (
                  <p className="no-skills">
                    No skills available
                  </p>
                ) : (

                  availableSkills.map(
                    (skill) => (

                      <label
                        className="skill-checkbox"
                        key={skill}
                      >

                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(
                            skill
                          )}
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
                  )

                )}

              </div>

            </div>


            {/* Clear */}

            <button
              type="button"
              className="button secondary clear-filter-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </aside>
        )}


        {/* =========================
            JOB RESULTS
        ========================= */}

        <main className="jobs-results">

          <div className="jobs-results-header">

            <h2>
              Available Jobs
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
                Try changing your
                search or filters.
              </p>

              <button
                className="button secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="job-grid">

              {filteredJobs.map(
                (job) => (

                  <JobCard
                    key={job.job_id}
                    job={job}
                    hasApplied={hasApplied(
                      job.job_id
                    )}
                    onApply={handleApply}
                  />

                )
              )}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default Jobs;