import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function PasswordField({
  label,
  value,
  placeholder,
  autoComplete,
  onChange,
  required = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = useId();

  return (
    <label className="field" htmlFor={inputId}>
      <span>
        {label}
        {required ? <span className="field__required"> *</span> : null}
      </span>
      <div className="password-field">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 3l18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10.7 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18.7 18.7 0 0 1-4 4.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M6 7.1C3.6 8.7 2 12 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.5-.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9.9 9.9A3 3 0 0 0 14.1 14.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}
