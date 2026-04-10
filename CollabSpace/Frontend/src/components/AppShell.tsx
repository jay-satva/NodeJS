import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { Login } from "./Login";
import { Signup } from "./Signup";
import "./app-shell.css";
import type { AuthMode, StoredAuth, ThemeMode } from "../types";

type AuthViewProps = {
  onAuthenticated: (auth: StoredAuth) => void;
};

const AUTH_STORAGE_KEY = "collabspace_auth";
const THEME_STORAGE_KEY = "collabspace_theme";
const SIDEBAR_STORAGE_KEY = "collabspace_sidebar_collapsed";

const readJsonStorage = <T,>(key: string): T | null => {
  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const getInitialTheme = (): ThemeMode => {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const AuthView = ({ onAuthenticated }: AuthViewProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-card__eyebrow">CollabSpace</p>
          <h1 className="auth-card__title">
            {mode === "login" ? "Login" : "Create account"}
          </h1>
          <p className="auth-card__subtitle">
            Minimal access screen connected to your backend.
          </p>
        </header>

        {mode === "login" ? (
          <Login
            onAuthenticated={onAuthenticated}
            successMessage={successMessage}
            onSwitchToSignup={() => {
              setMode("signup");
              setSuccessMessage("");
            }}
          />
        ) : (
          <Signup
            onSignedUp={() => {
              setMode("login");
              setSuccessMessage("Account created. You can log in now.");
            }}
            onSwitchToLogin={() => {
              setMode("login");
              setSuccessMessage("");
            }}
          />
        )}
      </section>
    </main>
  );
};

export function AppShell() {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    setAuth(readJsonStorage<StoredAuth>(AUTH_STORAGE_KEY));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  const authenticatedUser = useMemo(() => auth?.user ?? null, [auth]);

  const handleAuthenticated = (nextAuth: StoredAuth) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  };

  if (!auth || !authenticatedUser) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <DashboardShell
      auth={auth}
      theme={theme}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleTheme={() =>
        setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))
      }
      onToggleSidebar={() =>
        setIsSidebarCollapsed((currentValue) => !currentValue)
      }
      onLogout={handleLogout}
    />
  );
}
