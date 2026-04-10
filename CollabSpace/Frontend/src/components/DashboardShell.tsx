import { useEffect, useMemo, useState } from "react";
import { OrganizationManagement } from "./OrganizationManagement";
import { ProjectManagement } from "./ProjectManagement";
import { TaskManagement } from "./TaskManagement";
import type {
  ApiResponse,
  OrganizationMember,
  OrganizationSummary,
  StoredAuth,
  ThemeMode,
} from "../types";

type DashboardShellProps = {
  auth: StoredAuth;
  theme: ThemeMode;
  isSidebarCollapsed: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
};

const iconPaths = {
  Overview: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 13.5 12 5l8 8.5M7.5 11.5V19h9v-7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Organizations: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 19h16M6.5 19V8.5L12 5l5.5 3.5V19M9.5 11h.01M14.5 11h.01M9.5 14.5h.01M14.5 14.5h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Projects: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7.5h16M8.5 7.5V5h7v2.5M5.5 7.5h13A1.5 1.5 0 0 1 20 9v8.5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5V9a1.5 1.5 0 0 1 1.5-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Tasks: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 7h10M8 12h10M8 17h10M4.5 7h.01M4.5 12h.01M4.5 17h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Theme: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4.5v2.25M12 17.25v2.25M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M4.5 12h2.25M17.25 12h2.25M6.7 17.3l1.6-1.6M15.7 8.3l1.6-1.6M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
} as const;

const baseNavItems = [
  "Overview",
  "Tasks",
] as const;

type NavItem = (typeof baseNavItems)[number] | "Organizations";
type DashboardNavItem = NavItem | "Projects";

export function DashboardShell({
  auth,
  theme,
  isSidebarCollapsed,
  onToggleTheme,
  onToggleSidebar,
  onLogout,
}: DashboardShellProps) {
  const [activeSection, setActiveSection] = useState<DashboardNavItem>("Overview");
  const [canAccessProjects, setCanAccessProjects] = useState(
    auth.user.globalRole === "SUPER_ADMIN"
  );

  useEffect(() => {
    const checkProjectAccess = async () => {
      if (auth.user.globalRole === "SUPER_ADMIN") {
        setCanAccessProjects(true);
        return;
      }

      try {
        const organizationsResponse = await fetch("/api/organizations", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const organizationsData =
          (await organizationsResponse.json()) as ApiResponse<OrganizationSummary[]>;

        if (
          !organizationsResponse.ok ||
          organizationsData.responseStatus === 0 ||
          !organizationsData.result
        ) {
          setCanAccessProjects(false);
          return;
        }

        const memberResponses = await Promise.all(
          organizationsData.result.map(async (organization) => {
            const response = await fetch(`/api/organizations/${organization.id}/members`, {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            });

            const data = (await response.json()) as ApiResponse<OrganizationMember[]>;

            if (!response.ok || data.responseStatus === 0 || !data.result) {
              return [];
            }

            return data.result;
          })
        );

        const hasManageableOrganization = memberResponses.some((organizationMembers) =>
          organizationMembers.some(
            (member) =>
              member.user.id === auth.user.id &&
              (member.role === "ADMIN" || member.role === "MANAGER")
          )
        );

        setCanAccessProjects(hasManageableOrganization);
      } catch {
        setCanAccessProjects(false);
      }
    };

    void checkProjectAccess();
  }, [auth.token, auth.user.globalRole, auth.user.id]);

  useEffect(() => {
    if (!canAccessProjects && activeSection === "Projects") {
      setActiveSection("Overview");
    }
  }, [activeSection, canAccessProjects]);

  const navItems = useMemo<DashboardNavItem[]>(() => {
    const items: DashboardNavItem[] = ["Overview"];

    if (auth.user.globalRole === "SUPER_ADMIN") {
      items.push("Organizations");
    }

    if (canAccessProjects || auth.user.globalRole === "SUPER_ADMIN") {
      items.push("Projects");
    }

    items.push(...baseNavItems.slice(1));

    return items;
  }, [auth.user.globalRole, canAccessProjects]);

  return (
    <main className={isSidebarCollapsed ? "dashboard is-collapsed" : "dashboard"}>
      <aside
        className={
          isSidebarCollapsed ? "dashboard__sidebar is-collapsed" : "dashboard__sidebar"
        }
      >
        <div className="brand">
          <div className="brand__group">
            <span className="brand__mark">C</span>
            {!isSidebarCollapsed ? <span className="brand__text">CollabSpace</span> : null}
          </div>
          <button className="brand__toggle" type="button" onClick={onToggleSidebar}>
            {isSidebarCollapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={activeSection === item ? "nav__item is-active" : "nav__item"}
              onClick={() => setActiveSection(item)}
            >
              <span className="nav__icon">{iconPaths[item]}</span>
              {!isSidebarCollapsed ? <span>{item}</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboard__main">
        <header className="topbar">
          <div className="topbar__left">
            <div>
              <p className="topbar__eyebrow">{activeSection}</p>
              <h2 className="topbar__title">
                {activeSection === "Overview"
                  ? `Welcome, ${auth.user.name}`
                  : activeSection}
              </h2>
            </div>
          </div>

          <div className="topbar__right">
            <button className="button button--ghost" type="button" onClick={onToggleTheme}>
              <span className="button__icon">{iconPaths.Theme}</span>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            <button className="button button--ghost" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {activeSection === "Overview" ? (
          <>
            <section className="overview">
              <article className="overview__card">
                <p className="overview__label">Name</p>
                <p className="overview__value">{auth.user.name}</p>
              </article>
              <article className="overview__card">
                <p className="overview__label">Email</p>
                <p className="overview__value">{auth.user.email}</p>
              </article>
              <article className="overview__card">
                <p className="overview__label">Role</p>
                <p className="overview__value">{auth.user.globalRole ?? "USER"}</p>
              </article>
            </section>

            <section className="surface">
              <h3 className="surface__title">Overview</h3>
              <p className="surface__text">
                Theme preference and sidebar collapse state are persisted locally, so the app
                keeps your basic layout preferences between reloads.
              </p>
            </section>
          </>
        ) : null}

        {activeSection === "Organizations" && auth.user.globalRole === "SUPER_ADMIN" ? (
          <OrganizationManagement auth={auth} />
        ) : null}

        {activeSection === "Projects" && canAccessProjects ? (
          <ProjectManagement auth={auth} />
        ) : null}

        {activeSection === "Tasks" ? <TaskManagement auth={auth} /> : null}

        {activeSection !== "Overview" &&
        activeSection !== "Projects" &&
        activeSection !== "Tasks" &&
        !(activeSection === "Organizations" && auth.user.globalRole === "SUPER_ADMIN") ? (
          <section className="surface">
            <h3 className="surface__title">{activeSection}</h3>
            <p className="surface__text">
              This section is ready for the next screen implementation.
            </p>
          </section>
        ) : null}
      </section>
    </main>
  );
}
