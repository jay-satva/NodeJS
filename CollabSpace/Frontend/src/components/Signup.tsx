import { useState } from "react";
import type { FormEvent } from "react";
import type { ApiResponse, RegisterResult } from "../types";
import { PasswordField } from "./PasswordField";

type SignupProps = {
  onSignedUp: () => void;
  onSwitchToLogin: () => void;
};

export function Signup({ onSignedUp, onSwitchToLogin }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = (await response.json()) as ApiResponse<RegisterResult>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Signup failed.");
      }

      setName("");
      setEmail("");
      setPassword("");
      onSignedUp();
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
          Name
          <span className="field__required"> *</span>
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jay"
          autoComplete="name"
        />
      </label>

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
        placeholder="Use 8+ chars, number, special char"
        autoComplete="new-password"
        required
      />

      {errorMessage ? <p className="message message--error">{errorMessage}</p> : null}

      <p className="auth-link">
        Already have an account?{" "}
        <button type="button" className="text-button" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>

      <button className="button button--primary" type="submit" disabled={isSubmitting} 
      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {isSubmitting ? "Please wait" : "Create account"}
      </button>
    </form>
  );
}
