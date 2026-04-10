import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  ApiResponse,
  OrganizationMember,
  OrganizationSummary,
  ProjectSummary,
  StoredAuth,
} from "../types";

type ProjectManagementProps = {
  auth: StoredAuth;
};

export function ProjectManagement({ auth }: ProjectManagementProps) {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingProjectTitle, setEditingProjectTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    }),
    [auth.token]
  );

  const selectedMembership =
    members.find((member) => member.user.id === auth.user.id) ?? null;

  const canManageProjects =
    auth.user.globalRole === "SUPER_ADMIN" ||
    selectedMembership?.role === "ADMIN" ||
    selectedMembership?.role === "MANAGER";

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const getManageableOrganizations = async () => {
    const response = await fetch("/api/organizations", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const data = (await response.json()) as ApiResponse<OrganizationSummary[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load organizations.");
    }

    if (auth.user.globalRole === "SUPER_ADMIN") {
      return data.result;
    }

    const organizationsWithMembers = await Promise.all(
      data.result.map(async (organization) => {
        const membersResponse = await fetch(`/api/organizations/${organization.id}/members`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const membersData =
          (await membersResponse.json()) as ApiResponse<OrganizationMember[]>;

        if (!membersResponse.ok || membersData.responseStatus === 0 || !membersData.result) {
          return null;
        }

        const membership = membersData.result.find((member) => member.user.id === auth.user.id);

        if (!membership || (membership.role !== "ADMIN" && membership.role !== "MANAGER")) {
          return null;
        }

        return organization;
      })
    );

    return organizationsWithMembers.filter(
      (organization): organization is OrganizationSummary => organization !== null
    );
  };

  const loadOrganizations = async () => {
    const organizationsResult = await getManageableOrganizations();

    setOrganizations(organizationsResult);
    setSelectedOrganizationId((currentValue) => {
      if (
        currentValue &&
        organizationsResult.some((organization) => organization.id === currentValue)
      ) {
        return currentValue;
      }

      return organizationsResult[0]?.id ?? "";
    });
  };

  const loadMembersAndProjects = async (organizationId: string) => {
    if (!organizationId) {
      setMembers([]);
      setProjects([]);
      return;
    }

    const [membersResponse, projectsResponse] = await Promise.all([
      fetch(`/api/organizations/${organizationId}/members`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }),
      fetch(`/api/organizations/${organizationId}/projects`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }),
    ]);

    const membersData = (await membersResponse.json()) as ApiResponse<OrganizationMember[]>;
    const projectsData = (await projectsResponse.json()) as ApiResponse<ProjectSummary[]>;

    if (!membersResponse.ok || membersData.responseStatus === 0 || !membersData.result) {
      throw new Error(membersData.message || "Failed to load members.");
    }

    if (!projectsResponse.ok || projectsData.responseStatus === 0 || !projectsData.result) {
      throw new Error(projectsData.message || "Failed to load projects.");
    }

    setMembers(membersData.result);
    setProjects(projectsData.result);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        await loadOrganizations();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load organizations."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!selectedOrganizationId) {
        setMembers([]);
        setProjects([]);
        return;
      }

      setIsLoading(true);

      try {
        await loadMembersAndProjects(selectedOrganizationId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load project data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [selectedOrganizationId]);

  const refreshCurrentOrganization = async () => {
    if (!selectedOrganizationId) {
      return;
    }

    await Promise.all([loadOrganizations(), loadMembersAndProjects(selectedOrganizationId)]);
  };

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/organizations/${selectedOrganizationId}/projects`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: newProjectTitle,
        }),
      });

      const data = (await response.json()) as ApiResponse<ProjectSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to create project.");
      }

      setNewProjectTitle("");
      setSuccessMessage("Project created successfully.");
      await refreshCurrentOrganization();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create project."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${projectId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            title: editingProjectTitle,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<ProjectSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to update project.");
      }

      setEditingProjectId("");
      setEditingProjectTitle("");
      setSuccessMessage("Project updated successfully.");
      await refreshCurrentOrganization();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update project."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    clearMessages();

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse<ProjectSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to archive project.");
      }

      setSuccessMessage("Project archived successfully.");
      await refreshCurrentOrganization();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to archive project."
      );
    }
  };

  return (
    <section className="management">
      <div className="management__header">
        <div>
          <p className="topbar__eyebrow">Projects</p>
          <h3 className="surface__title">Project management</h3>
        </div>
        {(errorMessage || successMessage) ? (
          <div className="management__messages">
            {errorMessage ? <p className="message message--error">{errorMessage}</p> : null}
            {successMessage ? <p className="message message--success">{successMessage}</p> : null}
          </div>
        ) : null}
      </div>

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Organization</h4>
          <p className="surface__text">
            {isLoading ? "Loading..." : `${projects.length} projects`}
          </p>
        </div>

        <label className="field">
          <span>
            Select organization
            <span className="field__required"> *</span>
          </span>
          <select
            className="field__select"
            value={selectedOrganizationId}
            onChange={(event) => setSelectedOrganizationId(event.target.value)}
            disabled={!organizations.length}
          >
            {!organizations.length ? <option value="">No accessible organizations</option> : null}
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {!canManageProjects ? (
        <section className="surface">
          <h4 className="surface__subtitle">Access</h4>
          <p className="surface__text">
            You do not have access to the project management page for this organization.
            Only super admins, organization admins, and managers can use it.
          </p>
        </section>
      ) : (
        <>
          <section className="surface">
            <h4 className="surface__subtitle">Create project</h4>
            <form className="auth-form" onSubmit={handleCreateProject}>
              <label className="field">
                <span>
                  Project title
                  <span className="field__required"> *</span>
                </span>
                <input
                  value={newProjectTitle}
                  onChange={(event) => setNewProjectTitle(event.target.value)}
                  placeholder="New project name"
                />
              </label>

              <button
                className="button button--primary"
                type="submit"
                disabled={isSaving || !selectedOrganizationId}
              >
                {isSaving ? "Saving..." : "Create project"}
              </button>
            </form>
          </section>

          <section className="surface">
            <div className="management__section-header">
              <h4 className="surface__subtitle">Projects</h4>
              <p className="surface__text">{projects.length} total</p>
            </div>

            <div className="table-shell">
              <table className="table">
                <thead>
                  <tr>
                    <th>Project name</th>
                    <th>Creator</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        {editingProjectId === project.id ? (
                          <input
                            className="table__input"
                            value={editingProjectTitle}
                            onChange={(event) => setEditingProjectTitle(event.target.value)}
                          />
                        ) : (
                          project.title
                        )}
                      </td>
                      <td>{project.creator.name}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                      <td>{project.archived ? "Archived" : "Active"}</td>
                      <td className="table__actions">
                        {editingProjectId === project.id ? (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => void handleUpdateProject(project.id)}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => {
                              setEditingProjectId(project.id);
                              setEditingProjectTitle(project.title);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {!project.archived ? (
                          <button
                            className="button button--danger"
                            type="button"
                            onClick={() => void handleArchiveProject(project.id)}
                          >
                            Archive
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
