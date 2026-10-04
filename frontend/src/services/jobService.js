import { apiRequest } from "./api";


// Get active jobs
export async function getJobs(includeDisabled = false) {
  const query = includeDisabled
    ? "?include_disabled=true"
    : "";

  return await apiRequest(`/jobs/${query}`);
}


export async function getRecommendedJobs() {
  return await apiRequest("/jobs/recommended");
}


export async function getJobMatches() {
  return await apiRequest(
    "/jobs/recommended?include_applied=true"
  );
}


// Get one job
export async function getJob(jobId) {
  return await apiRequest(`/jobs/${jobId}`);
}


// Create job
export async function createJob(jobData) {
  const params = new URLSearchParams();

  params.append(
    "job_title",
    jobData.job_title
  );

  params.append(
    "category",
    jobData.category
  );

  params.append(
    "description",
    jobData.description
  );

  params.append(
    "required_skills",
    jobData.required_skills
  );

  params.append(
    "experience",
    jobData.experience
  );

  params.append(
    "location",
    jobData.location
  );

  return await apiRequest(
    `/jobs/?${params.toString()}`,
    {
      method: "POST",
    }
  );
}


// Update job
export async function updateJob(
  jobId,
  jobData
) {
  return await apiRequest(
    `/jobs/${jobId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_title: jobData.job_title,
        category: jobData.category,
        description: jobData.description,
        required_skills:
          jobData.required_skills,
        experience:
          jobData.experience,
        location:
          jobData.location,
      }),
    }
  );
}


// Disable job
export async function disableJob(
  jobId
) {
  return await apiRequest(
    `/jobs/${jobId}/disable`,
    {
      method: "PATCH",
    }
  );
}