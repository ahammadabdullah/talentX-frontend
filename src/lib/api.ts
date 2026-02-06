import { auth } from "@/lib/auth";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  const token = session?.accessToken;

  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

// Client-side API helper (for use in components)
export async function clientApiCall(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}
