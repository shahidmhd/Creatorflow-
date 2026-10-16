export type Role = "CREATOR" | "EDITOR" | "ADMIN";

export interface UserSession {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  username: string;
  role: Role;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
const apiBase = cleanApiUrl.endsWith("/api/v1") ? cleanApiUrl : `${cleanApiUrl}/api/v1`;

function responseMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const messages = value.map(responseMessage).filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(" ") : undefined;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return responseMessage(record.error) ?? responseMessage(record.message);
  }
  return undefined;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export const TOKEN_KEY = "reviral-token";
export const LEGACY_TOKEN_KEY = "creatorflow-token";
export const SESSION_KEY = "reviral-session";
export const LEGACY_SESSION_KEY = "creatorflow-session";

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

export function getAuthSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function setAuthData(token: string, session: UserSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = (payload && typeof payload === "object" && "code" in payload) ? String((payload as Record<string, unknown>).code) : undefined;
    const msg = responseMessage(payload) ?? `API request failed: ${response.status}`;
    throw new ApiError(msg, response.status, code, payload);
  }
  
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function authApi<T>(path: string, body: object): Promise<T> {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
