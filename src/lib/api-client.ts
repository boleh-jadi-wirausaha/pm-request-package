import type { ApiResult } from "../types";

export const DEFAULT_BASE_URL = "https://pm.bojawi.com/api";

export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | null;
  onUnauthorized?: () => void;
}

async function resolve<T>(promise: Promise<Response>, onUnauthorized?: () => void): Promise<ApiResult<T>> {
  try {
    const res = await promise;
    if (res.status === 401) {
      onUnauthorized?.();
      return { error: { message: "Unauthorized", code: 401 } };
    }
    if (!res.ok) {
      return { error: { message: `Request failed: ${res.status}`, code: res.status } };
    }
    const data = (await res.json()) as ApiResult<T>;
    return data;
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export class ApiClient {
  private baseUrl: string;
  private token?: string | null;
  private onUnauthorized?: () => void;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.token = options.token;
    this.onUnauthorized = options.onUnauthorized;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  }

  get<T>(path: string, signal?: AbortSignal): Promise<ApiResult<T>> {
    return resolve<T>(
      fetch(this.url(path), { headers: this.headers(), signal }),
      this.onUnauthorized
    );
  }

  post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
    return resolve<T>(
      fetch(this.url(path), {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
        signal,
      }),
      this.onUnauthorized
    );
  }

  postForm<T>(path: string, formData: FormData, signal?: AbortSignal): Promise<ApiResult<T>> {
    return resolve<T>(
      fetch(this.url(path), {
        method: "POST",
        headers: this.headers(),
        body: formData,
        signal,
      }),
      this.onUnauthorized
    );
  }
}
