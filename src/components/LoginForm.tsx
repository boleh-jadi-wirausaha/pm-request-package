import React, { useState } from "react";

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="pmw:flex pmw:flex-col pmw:px-5 pmw:pb-6 pmw:pt-[22px]"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(email, password);
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
          className="pmw:accent-ring pmw:mt-[7px] pmw:h-11 pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none"
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
          className="pmw:accent-ring pmw:mt-[7px] pmw:h-11 pmw:w-full pmw:rounded-[11px] pmw:border-[1.5px] pmw:border-[#e2e5ec] pmw:bg-[#fbfbfc] pmw:px-3.5 pmw:text-sm pmw:font-normal pmw:text-[#171a22] pmw:outline-none"
        />
      </label>
      {error && <p className="pmw:mt-2 pmw:text-xs pmw:text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="pmw:accent-submit pmw:mt-4 pmw:h-[46px] pmw:rounded-[11px] pmw:border-none pmw:text-[14.5px] pmw:font-bold pmw:text-white pmw:disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
