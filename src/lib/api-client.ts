// The backend now lives on a separate origin (Render), so every call to it
// needs an absolute URL plus `credentials: "include"` — without that, the
// browser won't send or accept the cross-site session cookie at all.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, { ...options, credentials: "include" });
}
