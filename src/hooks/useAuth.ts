import { useCallback, useEffect, useRef, useState } from "react";
import { ApiClient } from "../lib/api-client";
import type {
  ApiResult,
  LoginResponse,
  OtpRequestDTO,
  OtpVerifyDTO,
  SaasClientConfig,
  SignInRequestDTO,
  UserDTO,
  VerifyTotpDTO,
} from "../types";

function storageKey(organizationId: string): string {
  return `pm-widget:token:${organizationId}`;
}

export interface UseAuthResult {
  token: string | null;
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<"success" | "mfa" | "error">;
  verifyTotp: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
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
  const [mfaRequired, setMfaRequired] = useState(false);
  const preAuthTokenRef = useRef<string | null>(null);

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

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const applyLoginResponse = useCallback(
    (data: LoginResponse) => {
      setToken(data.token);
      setMfaRequired(false);
      preAuthTokenRef.current = null;
      try {
        localStorage.setItem(storageKey(organizationId), data.token);
      } catch {
        // ignore storage failures
      }
    },
    [organizationId]
  );

  const logout = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (activeToken) {
      const client = new ApiClient({ baseUrl, token: activeToken });
      await client.post("/end/auth/logout", {});
    }
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(storageKey(organizationId));
    } catch {
      // ignore storage failures (e.g. blocked in sandboxed iframe)
    }
  }, [organizationId, baseUrl]);

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
      applyLoginResponse(result.data);
      return true;
    },
    [baseUrl, applyLoginResponse]
  );

  const requestOtp = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);
      const client = new ApiClient({ baseUrl });
      const body: OtpRequestDTO = { Email: email };
      const result: ApiResult<string> = await client.post("/end/auth/otp/request", body);
      setLoading(false);
      if (result.error) {
        setError(result.error.message ?? "Failed to send code");
        return false;
      }
      return true;
    },
    [baseUrl]
  );

  const verifyOtp = useCallback(
    async (email: string, code: string) => {
      setLoading(true);
      setError(null);
      const client = new ApiClient({ baseUrl });
      const body: OtpVerifyDTO = { Email: email, Code: code };
      const result: ApiResult<LoginResponse> = await client.post("/end/auth/otp/verify", body);
      setLoading(false);
      if (result.error || !result.data) {
        setError(result.error?.message ?? "Invalid code");
        return "error" as const;
      }
      if (result.data.mfaRequired) {
        preAuthTokenRef.current = result.data.preAuthToken ?? null;
        setMfaRequired(true);
        return "mfa" as const;
      }
      applyLoginResponse(result.data);
      return "success" as const;
    },
    [baseUrl, applyLoginResponse]
  );

  const verifyTotp = useCallback(
    async (code: string, isBackupCode?: boolean) => {
      setLoading(true);
      setError(null);
      const client = new ApiClient({ baseUrl });
      const body: VerifyTotpDTO = {
        PreAuthToken: preAuthTokenRef.current ?? "",
        ...(isBackupCode ? { BackupCode: code } : { Code: code }),
      };
      const result: ApiResult<LoginResponse> = await client.post("/end/auth/verify-totp", body);
      setLoading(false);
      if (result.error || !result.data?.token) {
        setError(result.error?.message ?? "Invalid code");
        return false;
      }
      applyLoginResponse(result.data);
      return true;
    },
    [baseUrl, applyLoginResponse]
  );

  return { token, user, loading, error, mfaRequired, login, requestOtp, verifyOtp, verifyTotp, logout };
}
