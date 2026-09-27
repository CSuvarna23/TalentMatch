import { apiRequest, API_URL } from "./api";

export async function uploadResume(file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/resume/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Resume upload failed");
  }

  return data;
}

export async function getCurrentResume() {
  return await apiRequest("/resume/current");
}

export async function getResumeUrl(resumeId) {
  return `${API_URL}/resume/${resumeId}/view`;
}

export async function viewResume(resumeId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/resume/${resumeId}/view`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to view resume");
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  window.open(url, "_blank");
}