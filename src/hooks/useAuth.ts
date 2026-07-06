import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type { ApiResult, LoginResponse, SaasClientConfig, SignInRequestDTO, UserDTO } from "../types";

function storageKey(organizationId: string): string {
  return `pm-widget:token:${organizationId}`;
}

export interface UseAuthResult {
  token: string | null;
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(config: SaasClientConfig): UseAuthResult {
  const { organizationId, baseUrl } = config;
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey(organizationId));
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(
    async (activeToken: string) => {
      const client = new ApiClient({ baseUrl, token: activeToken });
      const result: ApiResult<UserDTO> = await client.get("/end/auth/me");
      if (result.data) setUser(result.data);
    },
    [baseUrl]
  );

  useEffect(() => {
    if (token) fetchUser(token);
  }, [token, fetchUser]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(storageKey(organizationId));
    } catch {
      // ignore storage failures (e.g. blocked in sandboxed iframe)
    }
  }, [organizationId]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      const client = new ApiClient({ baseUrl });
      const body: SignInRequestDTO = { Email: email, Password: password };
      const result: ApiResult<LoginResponse> = await client.post("/end/auth/signIn", body);
      setLoading(false);
      if (result.error || !result.data?.token) {
        setError(result.error?.message ?? "Login failed");
        return false;
      }
      setToken(result.data.token);
      try {
        localStorage.setItem(storageKey(organizationId), result.data.token);
      } catch {
        // ignore storage failures
      }
      return true;
    },
    [baseUrl, organizationId]
  );

  return { token, user, loading, error, login, logout };
}
