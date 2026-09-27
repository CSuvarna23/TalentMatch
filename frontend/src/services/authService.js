import { apiRequest } from "./api";

export async function registerUser(userData) {
  return await apiRequest("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

export async function loginUser(email, password) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  localStorage.setItem("token", response.access_token);

  return response;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    return await apiRequest("/auth/me");
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
}