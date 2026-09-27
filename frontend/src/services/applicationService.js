import { apiRequest } from "./api";

export async function applyForJob(jobId) {
  return await apiRequest(
    `/applications/jobs/${jobId}/apply`,
    {
      method: "POST",
    }
  );
}

export async function getMyApplications() {
  return await apiRequest(
    "/applications/me"
  );
}

export async function getApplication(
  applicationId
) {
  return await apiRequest(
    `/applications/${applicationId}`
  );
}

export async function getApplicants(jobId) {
  return await apiRequest(
    `/jobs/${jobId}/applicants`
  );
}

export async function getApplicantDetails(
  jobId,
  applicationId
) {
  return await apiRequest(
    `/jobs/${jobId}/applicants/${applicationId}`
  );
}

export async function updateApplication(
  applicationId,
  status
) {
  return await apiRequest(
    `/applications/${applicationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );
}