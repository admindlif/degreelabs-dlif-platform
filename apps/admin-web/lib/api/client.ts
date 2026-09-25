const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

const TOKEN_KEY = "dlif_admin_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export async function adminApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

  const path = normalizedEndpoint.startsWith("/api/v1")
    ? normalizedEndpoint
    : `/api/v1${normalizedEndpoint}`;

  const url = `${base}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorData: any = null;

    try {
      errorData = await res.json();
    } catch {
      // Response may not contain JSON
    }

    const message =
      errorData?.detail ||
      `Admin API Request failed with status ${res.status}`;

    throw new Error(message);
  }

  // DELETE endpoints usually return HTTP 204 with an empty body.
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}