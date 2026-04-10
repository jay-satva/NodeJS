import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  AccountUser,
  ApiResponse,
  OrganizationMember,
  OrganizationSummary,
  StoredAuth,
} from "../types";

type OrganizationManagementProps = {
  auth: StoredAuth;
};

type AssignMemberPayload = {
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
};

const EMPTY_ASSIGNMENT: AssignMemberPayload = {
  email: "",
  role: "USER",
};

export function OrganizationManagement({ auth }: OrganizationManagementProps) {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [assignment, setAssignment] = useState<AssignMemberPayload>(EMPTY_ASSIGNMENT);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const [isAssigningMember, setIsAssigningMember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    }),
    [auth.token]
  );

  const selectedOrganization =
    organizations.find((organization) => organization.id === selectedOrganizationId) ?? null;

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const loadOrganizations = async (nextSelectedOrganizationId?: string) => {
    setIsLoadingOrganizations(true);

    try {
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = (await response.json()) as ApiResponse<OrganizationSummary[]>;

      if (!response.ok || data.responseStatus === 0 || !data.result) {
        throw new Error(data.message || "Failed to load organizations.");
      }

      setOrganizations(data.result);

      const fallbackId =
        nextSelectedOrganizationId ??
        selectedOrganizationId ??
        data.result[0]?.id ??
        "";

      const nextSelection = data.result.some((item) => item.id === fallbackId)
        ? fallbackId
        : data.result[0]?.id ?? "";

      setSelectedOrganizationId(nextSelection);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load organizations."
      );
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const loadUsers = async () => {
    const response = await fetch("/api/organizations/users", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const data = (await response.json()) as ApiResponse<AccountUser[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load users.");
    }

    setUsers(data.result);
  };

  const loadMembers = async (organizationId: string) => {
    if (!organizationId) {
      setMembers([]);
      return;
    }

    setIsLoadingMembers(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = (await response.json()) as ApiResponse<OrganizationMember[]>;

      if (!response.ok || data.responseStatus === 0 || !data.result) {
        throw new Error(data.message || "Failed to load members.");
      }

      setMembers(data.result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load members."
      );
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadOrganizations(), loadUsers()]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load data."
        );
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setMembers([]);
      return;
    }

    void loadMembers(selectedOrganizationId);
  }, [selectedOrganizationId]);

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setIsCreatingOrganization(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: newOrganizationName,
        }),
      });

      const data = (await response.json()) as ApiResponse<OrganizationSummary>;

      if (!response.ok || data.responseStatus === 0 || !data.result) {
        throw new Error(data.message || "Failed to create organization.");
      }

      setNewOrganizationName("");
      setSuccessMessage("Organization created successfully.");
      await loadOrganizations(data.result.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create organization."
      );
    } finally {
      setIsCreatingOrganization(false);
    }
  };

  const handleAssignMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOrganizationId) {
      setErrorMessage("Select an organization first.");
      return;
    }

    clearMessages();
    setIsAssigningMember(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/members`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(assignment),
        }
      );

      const data = (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to assign member.");
      }

      setAssignment(EMPTY_ASSIGNMENT);
      setSuccessMessage("Member assigned successfully.");
      await Promise.all([
        loadOrganizations(selectedOrganizationId),
        loadMembers(selectedOrganizationId),
        loadUsers(),
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to assign member."
      );
    } finally {
      setIsAssigningMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedOrganizationId) {
      return;
    }

    clearMessages();

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to remove member.");
      }

      setSuccessMessage("Member removed successfully.");
      await Promise.all([
        loadOrganizations(selectedOrganizationId),
        loadMembers(selectedOrganizationId),
        loadUsers(),
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to remove member."
      );
    }
  };

  return (
    <section className="management">
      <div className="management__header">
        <div>
          <p className="topbar__eyebrow">Super Admin</p>
          <h3 className="surface__title">Organizations</h3>
        </div>
        {(errorMessage || successMessage) ? (
          <div className="management__messages">
            {errorMessage ? <p className="message message--error">{errorMessage}</p> : null}
            {successMessage ? <p className="message message--success">{successMessage}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="management__grid">
        <section className="surface">
          <h4 className="surface__subtitle">Create organization</h4>
          <form className="auth-form" onSubmit={handleCreateOrganization}>
            <label className="field">
              <span>
                Name
                <span className="field__required"> *</span>
              </span>
              <input
                value={newOrganizationName}
                onChange={(event) => setNewOrganizationName(event.target.value)}
                placeholder="Acme Labs"
              />
            </label>

            <button
              className="button button--primary"
              type="submit"
              disabled={isCreatingOrganization}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              {isCreatingOrganization ? "Creating..." : "Create organization"}
            </button>
          </form>
        </section>

        <section className="surface">
          <h4 className="surface__subtitle">Assign member</h4>
          <form className="auth-form" onSubmit={handleAssignMember}>
            <label className="field">
              <span>
                User email
                <span className="field__required"> *</span>
              </span>
              <input
                list="organization-user-emails"
                value={assignment.email}
                onChange={(event) =>
                  setAssignment((currentValue) => ({
                    ...currentValue,
                    email: event.target.value,
                  }))
                }
                placeholder="Enter user email"
              />
            </label>
            <datalist id="organization-user-emails">
              {users.map((user) => (
                <option key={user.email} value={user.email} />
              ))}
            </datalist>

            <label className="field">
              <span>
                Role
                <span className="field__required"> *</span>
              </span>
              <select
                className="field__select"
                value={assignment.role}
                onChange={(event) =>
                  setAssignment((currentValue) => ({
                    ...currentValue,
                    role: event.target.value as AssignMemberPayload["role"],
                  }))
                }
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            <button
              className="button button--primary"
              type="submit"
              disabled={isAssigningMember || !selectedOrganizationId}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              {isAssigningMember ? "Assigning..." : "Assign member"}
            </button>
          </form>
        </section>
      </div>

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Organization list</h4>
          <p className="surface__text">
            {isLoadingOrganizations ? "Loading organizations..." : `${organizations.length} organizations`}
          </p>
        </div>

        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Members</th>
                <th>Projects</th>
                <th>Tags</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((organization) => (
                <tr
                  key={organization.id}
                  className={
                    organization.id === selectedOrganizationId ? "is-selected" : ""
                  }
                  onClick={() => setSelectedOrganizationId(organization.id)}
                >
                  <td>{organization.name}</td>
                  <td>{organization._count.members}</td>
                  <td>{organization._count.projects}</td>
                  <td>{organization._count.tags}</td>
                  <td>{new Date(organization.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="management__grid">
        <section className="surface">
          <h4 className="surface__subtitle">Organization details</h4>
          {selectedOrganization ? (
            <dl className="details-list">
              <div>
                <dt>Name</dt>
                <dd>{selectedOrganization.name}</dd>
              </div>
              <div>
                <dt>Id</dt>
                <dd className="details-list__mono">{selectedOrganization.id}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(selectedOrganization.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Members</dt>
                <dd>{selectedOrganization._count.members}</dd>
              </div>
            </dl>
          ) : (
            <p className="surface__text">Select an organization to view details.</p>
          )}
        </section>

        <section className="surface">
          <div className="management__section-header">
            <h4 className="surface__subtitle">Members</h4>
            <p className="surface__text">
              {isLoadingMembers ? "Loading members..." : `${members.length} members`}
            </p>
          </div>

          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Org role</th>
                  <th>Global role</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.user.id}>
                    <td>{member.user.name}</td>
                    <td>{member.user.email}</td>
                    <td>{member.role}</td>
                    <td>{member.user.globalRole ?? "USER"}</td>
                    <td className="table__actions">
                      <button
                        className="button button--danger"
                        type="button"
                        onClick={() => handleRemoveMember(member.user.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">All users</h4>
          <p className="surface__text">{users.length} registered users</p>
        </div>

        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Global role</th>
                <th>Organizations</th>
                <th>Projects</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.globalRole ?? "USER"}</td>
                  <td>{user._count.orgMembers}</td>
                  <td>{user._count.createdProjects}</td>
                  <td>{user._count.taskAssignments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
