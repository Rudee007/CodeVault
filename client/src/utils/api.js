const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Helper to parse JSON responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "API Error");
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

// Wrapper for fetch GET requests with auth token
export async function getRequest(endpoint, token) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(res);
}

// Wrapper for fetch POST/PUT/DELETE requests
export async function sendRequest(endpoint, method, data, token) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
