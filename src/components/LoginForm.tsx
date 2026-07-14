import React, { useState } from "react";

export interface LoginFormProps {
  onPasswordLogin: (email: string, password: string) => Promise<boolean>;
  onRequestOtp: (email: string) => Promise<boolean>;
  onVerifyOtp: (email: string, code: string) => Promise<"success" | "mfa" | "error">;
  onVerifyTotp: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  mfaRequired: boolean;
  loading: boolean;
  error: string | null;
}

const inputClasses =
  "pmw:accent-ring pmw:mt-[7px] pmw:h-11 pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none";
const primaryButtonClasses =
  "pmw:accent-submit pmw:mt-4 pmw:h-[46px] pmw:rounded-[11px] pmw:border-none pmw:text-[14.5px] pmw:font-bold pmw:text-white pmw:disabled:opacity-50";
const linkButtonClasses =
  "pmw:mt-3 pmw:self-center pmw:border-none pmw:bg-transparent pmw:text-[13px] pmw:font-semibold pmw:text-[var(--accent)] pmw:hover:underline";

type LoginMode = "password" | "otp-request" | "otp-verify" | "totp";

export function LoginForm({
  onPasswordLogin,
  onRequestOtp,
  onVerifyOtp,
  onVerifyTotp,
  mfaRequired,
  loading,
  error,
}: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const openPmButton = (
    <a
      href="https://pm.bojawi.com"
      target="_blank"
      rel="noopener noreferrer"
      className="pmw:mt-3 pmw:flex pmw:h-[46px] pmw:w-full pmw:items-center pmw:justify-center pmw:gap-1.5 pmw:rounded-[11px] pmw:border-none pmw:bg-blue-50 pmw:text-[14.5px] pmw:font-bold pmw:text-blue-600 pmw:hover:bg-blue-100 pmw:hover:text-blue-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
      </svg>
      Open Project Management
    </a>
  );

  if (mode === "totp" || mfaRequired) {
    return (
      <form
        className="pmw:flex pmw:flex-col pmw:px-5 pmw:pb-6 pmw:pt-[22px]"
        onSubmit={(e) => {
          e.preventDefault();
          void onVerifyTotp(totpCode, useBackupCode);
        }}
      >
        <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">
          Two-factor verification
        </h2>
        <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
          {useBackupCode
            ? "Enter one of your backup codes."
            : "Enter the code from your authenticator app."}
        </p>

        <label className="pmw:mt-5 pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
          {useBackupCode ? "Backup code" : "Authenticator code"}
          <input
            type="text"
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            placeholder={useBackupCode ? "xxxx-xxxx" : "123456"}
            className={inputClasses}
          />
        </label>
        {error && <p className="pmw:mt-2 pmw:text-xs pmw:text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={primaryButtonClasses}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        <button
          type="button"
          onClick={() => {
            setUseBackupCode((v) => !v);
            setTotpCode("");
          }}
          className={linkButtonClasses}
        >
          {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
        </button>
      </form>
    );
  }

  if (mode === "otp-request" || mode === "otp-verify") {
    return (
      <form
        className="pmw:flex pmw:flex-col pmw:px-5 pmw:pb-6 pmw:pt-[22px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (mode === "otp-request") {
            void onRequestOtp(email).then((sent) => {
              if (sent) setMode("otp-verify");
            });
          } else {
            void onVerifyOtp(email, otpCode).then((result) => {
              if (result === "mfa") setMode("totp");
            });
          }
        }}
      >
        <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">
          Sign in with a code
        </h2>
        <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
          {mode === "otp-request"
            ? "We'll email you a one-time code."
            : `Enter the code sent to ${email}.`}
        </p>

        {mode === "otp-request" ? (
          <label className="pmw:mt-5 pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={inputClasses}
            />
          </label>
        ) : (
          <label className="pmw:mt-5 pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
            One-time code
            <input
              type="text"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className={inputClasses}
            />
          </label>
        )}

        {error && <p className="pmw:mt-2 pmw:text-xs pmw:text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={primaryButtonClasses}>
          {loading ? "Please wait..." : mode === "otp-request" ? "Send code" : "Verify"}
        </button>
        {mode === "otp-verify" && (
          <button
            type="button"
            onClick={() => void onRequestOtp(email)}
            className={linkButtonClasses}
          >
            Resend code
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setOtpCode("");
          }}
          className={linkButtonClasses}
        >
          Use password instead
        </button>
        {openPmButton}
      </form>
    );
  }

  return (
    <form
      className="pmw:flex pmw:flex-col pmw:px-5 pmw:pb-6 pmw:pt-[22px]"
      onSubmit={(e) => {
        e.preventDefault();
        void onPasswordLogin(email, password);
      }}
    >
      <h2 className="pmw:text-xl pmw:font-extrabold pmw:tracking-tight pmw:text-[#171a22]">Welcome back</h2>
      <p className="pmw:mt-1 pmw:text-[13.5px] pmw:font-medium pmw:text-[#6a7180]">
        Sign in to view and track your requests.
      </p>

      <label className="pmw:mt-5 pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className={inputClasses}
        />
      </label>
      <label className="pmw:mt-3.5 pmw:block pmw:text-xs pmw:font-semibold pmw:text-[#3a3f4a]">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClasses}
        />
      </label>
      {error && <p className="pmw:mt-2 pmw:text-xs pmw:text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className={primaryButtonClasses}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => setMode("otp-request")}
        className={linkButtonClasses}
      >
        Sign in with a one-time code instead
      </button>
      {openPmButton}
    </form>
  );
}
