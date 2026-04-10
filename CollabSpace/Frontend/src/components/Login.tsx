import { useState } from "react";
import type { FormEvent } from "react";
import type { ApiResponse, LoginResult, StoredAuth } from "../types";
import { PasswordField } from "./PasswordField";

type LoginProps = {
  onAuthenticated: (auth: StoredAuth) => void;
  successMessage?: string;
  onSwitchToSignup: () => void;
};

export function Login({
  onAuthenticated,
  successMessage,
  onSwitchToSignup,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as ApiResponse<LoginResult>;

      if (!response.ok || data.responseStatus === 0 || !data.result) {
        throw new Error(data.message || "Login failed.");
      }

      onAuthenticated({
        token: data.result.token,
        user: data.result.user,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>
          Email
          <span className="field__required"> *</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="jay@gmail.com"
          autoComplete="email"
        />
      </label>

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter password"
        autoComplete="current-password"
        required
      />

      {successMessage ? (
        <p className="message message--success">{successMessage}</p>
      ) : null}
      {errorMessage ? <p className="message message--error">{errorMessage}</p> : null}

      <p className="auth-link">
        Don&apos;t have an account?{" "}
        <button type="button" className="text-button" onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>

      <button className="button button--primary" type="submit" disabled={isSubmitting}
      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {isSubmitting ? "Please wait" : "Login"}
      </button>
    </form>
  );
}
