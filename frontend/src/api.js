const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.text();
  let data = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }
  if (!response.ok)
    throw new Error(
      data?.message || data || "No fue posible completar la operación.",
    );
  return data;
}
