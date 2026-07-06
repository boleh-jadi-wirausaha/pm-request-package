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
      className="pmw:flex pmw:flex-col pmw:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(email, password);
      }}
    >
      <h2 className="pmw:text-sm pmw:font-semibold pmw:text-gray-800">Sign in</h2>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm pmw:outline-none pmw:focus:border-blue-500"
        />
      </label>
      <label className="pmw:flex pmw:flex-col pmw:gap-1 pmw:text-xs pmw:text-gray-600">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pmw:rounded pmw:border pmw:border-gray-300 pmw:px-2 pmw:py-1.5 pmw:text-sm pmw:outline-none pmw:focus:border-blue-500"
        />
      </label>
      {error && <p className="pmw:text-xs pmw:text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="pmw:rounded pmw:bg-blue-600 pmw:px-3 pmw:py-1.5 pmw:text-sm pmw:font-medium pmw:text-white pmw:disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
