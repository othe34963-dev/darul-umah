import { useApp } from "@/context/AppContext";

// Utility function to make authenticated API calls
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("du_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("du_token");
      localStorage.removeItem("du_role");
      window.location.href = "/login";
      return;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// Hook to get authenticated fetch function
export const useAuthenticatedFetch = () => {
  const { user } = useApp();
  
  return async (url: string, options: RequestInit = {}) => {
    return makeAuthenticatedRequest(url, options);
  };
};
