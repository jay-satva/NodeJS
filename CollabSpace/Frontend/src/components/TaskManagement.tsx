import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  AssignmentHistoryItem,
  ApiResponse,
  CommentItem,
  OrganizationMember,
  OrganizationSummary,
  ProjectSummary,
  StoredAuth,
  TagSummary,
  TaskBoard,
  TaskStatus,
  TaskSummary,
} from "../types";

type TaskManagementProps = {
  auth: StoredAuth;
};

const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "ONGOING",
  "DEVELOPMENT_COMPLETED",
  "UNIT_TESTING",
  "QA",
  "QA_COMPLETED",
  "COMPLETED",
];

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  ONGOING: "Ongoing",
  DEVELOPMENT_COMPLETED: "Development completed",
  UNIT_TESTING: "Unit testing",
  QA: "QA",
  QA_COMPLETED: "QA completed",
  COMPLETED: "Completed",
};

const createEmptyBoard = (): TaskBoard => ({
  BACKLOG: [],
  ONGOING: [],
  DEVELOPMENT_COMPLETED: [],
  UNIT_TESTING: [],
  QA: [],
  QA_COMPLETED: [],
  COMPLETED: [],
});

const getNextStatus = (status: TaskStatus): TaskStatus | null => {
  const currentIndex = TASK_STATUSES.indexOf(status);

  if (currentIndex === -1 || currentIndex === TASK_STATUSES.length - 1) {
    return null;
  }

  return TASK_STATUSES[currentIndex + 1];
};

export function TaskManagement({ auth }: TaskManagementProps) {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [board, setBoard] = useState<TaskBoard>(createEmptyBoard());
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistoryItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentMessage, setEditingCommentMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssigneeIds, setNewTaskAssigneeIds] = useState<string[]>([]);
  const [newTaskTagIds, setNewTaskTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingAssigneeIds, setEditingAssigneeIds] = useState<string[]>([]);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);
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

  const canManageTasks =
    auth.user.globalRole === "SUPER_ADMIN" ||
    selectedMembership?.role === "ADMIN" ||
    selectedMembership?.role === "MANAGER";

  const flattenedTasks = useMemo(
    () => TASK_STATUSES.flatMap((status) => board[status]),
    [board]
  );

  const selectedTask =
    flattenedTasks.find((task) => task.id === selectedTaskId) ?? null;

  const assignedTasks = flattenedTasks.filter((task) =>
    task.assignedToIds.includes(auth.user.id)
  );

  const boardCounts = useMemo(
    () =>
      TASK_STATUSES.map((status) => ({
        status,
        count: board[status].length,
      })),
    [board]
  );

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const toggleTagId = (currentIds: string[], tagId: string) => {
    if (currentIds.includes(tagId)) {
      return currentIds.filter((id) => id !== tagId);
    }

    return [...currentIds, tagId];
  };

  const toggleAssigneeId = (currentIds: string[], userId: string) => {
    if (currentIds.includes(userId)) {
      return currentIds.filter((id) => id !== userId);
    }

    return [...currentIds, userId];
  };

  const canUpdateTaskStatus = (task: TaskSummary) => {
    if (auth.user.globalRole === "SUPER_ADMIN" || canManageTasks) {
      return true;
    }

    return task.assignedToIds.includes(auth.user.id);
  };

  const loadOrganizations = async () => {
    const response = await fetch("/api/organizations", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const data = (await response.json()) as ApiResponse<OrganizationSummary[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load organizations.");
    }

    const organizationsResult = data.result;

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

  const loadOrganizationWorkspace = async (organizationId: string) => {
    if (!organizationId) {
      setProjects([]);
      setMembers([]);
      setTags([]);
      setSelectedProjectId("");
      return;
    }

    const [projectsResponse, membersResponse, tagsResponse] = await Promise.all([
      fetch(`/api/organizations/${organizationId}/projects`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }),
      fetch(`/api/organizations/${organizationId}/members`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }),
      fetch(`/api/organizations/${organizationId}/tags`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }),
    ]);

    const projectsData = (await projectsResponse.json()) as ApiResponse<ProjectSummary[]>;
    const membersData = (await membersResponse.json()) as ApiResponse<OrganizationMember[]>;
    const tagsData = (await tagsResponse.json()) as ApiResponse<TagSummary[]>;

    if (!projectsResponse.ok || projectsData.responseStatus === 0 || !projectsData.result) {
      throw new Error(projectsData.message || "Failed to load projects.");
    }

    if (!membersResponse.ok || membersData.responseStatus === 0 || !membersData.result) {
      throw new Error(membersData.message || "Failed to load members.");
    }

    if (!tagsResponse.ok || tagsData.responseStatus === 0 || !tagsData.result) {
      throw new Error(tagsData.message || "Failed to load tags.");
    }

    const activeProjects = projectsData.result.filter((project) => !project.archived);

    setProjects(activeProjects);
    setMembers(membersData.result);
    setTags(tagsData.result);
    setSelectedProjectId((currentValue) => {
      if (currentValue && activeProjects.some((project) => project.id === currentValue)) {
        return currentValue;
      }

      return activeProjects[0]?.id ?? "";
    });
  };

  const loadBoard = async (organizationId: string, projectId: string) => {
    if (!organizationId || !projectId) {
      setBoard(createEmptyBoard());
      setSelectedTaskId("");
      setAssignmentHistory([]);
      setComments([]);
      return;
    }

    const response = await fetch(
      `/api/organizations/${organizationId}/projects/${projectId}/tasks/board`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const data = (await response.json()) as ApiResponse<TaskBoard>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load task board.");
    }

    const boardResult = data.result;

    setBoard(boardResult);
    setSelectedTaskId((currentValue) => {
      if (
        currentValue &&
        TASK_STATUSES.some((status) =>
          boardResult[status].some((task) => task.id === currentValue)
        )
      ) {
        return currentValue;
      }

      return TASK_STATUSES.flatMap((status) => boardResult[status])[0]?.id ?? "";
    });
  };

  const refreshBoard = async () => {
    if (!selectedOrganizationId || !selectedProjectId) {
      return;
    }

    await loadBoard(selectedOrganizationId, selectedProjectId);
  };

  const loadAssignmentHistory = async (taskId: string) => {
    if (!selectedOrganizationId || !selectedProjectId || !taskId) {
      setAssignmentHistory([]);
      return;
    }

    const response = await fetch(
      `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}/assignment-history`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const data = (await response.json()) as ApiResponse<AssignmentHistoryItem[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load assignment history.");
    }

    setAssignmentHistory(data.result);
  };

  const loadComments = async (taskId: string) => {
    if (!selectedOrganizationId || !selectedProjectId || !taskId) {
      setComments([]);
      return;
    }

    const response = await fetch(
      `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}/comments`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const data = (await response.json()) as ApiResponse<CommentItem[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load comments.");
    }

    setComments(data.result);
  };

  const refreshTags = async () => {
    if (!selectedOrganizationId) {
      return;
    }

    const response = await fetch(`/api/organizations/${selectedOrganizationId}/tags`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const data = (await response.json()) as ApiResponse<TagSummary[]>;

    if (!response.ok || data.responseStatus === 0 || !data.result) {
      throw new Error(data.message || "Failed to load tags.");
    }

    setTags(data.result);
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
      clearMessages();
      setIsLoading(true);

      try {
        await loadOrganizationWorkspace(selectedOrganizationId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load task workspace."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [selectedOrganizationId]);

  useEffect(() => {
    const load = async () => {
      clearMessages();
      setIsLoading(true);

      try {
        await loadBoard(selectedOrganizationId, selectedProjectId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load task board."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [selectedOrganizationId, selectedProjectId]);

  useEffect(() => {
    if (!selectedTask) {
      setEditingTitle("");
      setEditingDescription("");
      setEditingAssigneeIds([]);
      setEditingTagIds([]);
      setAssignmentHistory([]);
      setComments([]);
      setEditingCommentId("");
      setEditingCommentMessage("");
      return;
    }

    setEditingTitle(selectedTask.title);
    setEditingDescription(selectedTask.description);
    setEditingAssigneeIds(selectedTask.assignedToIds);
    setEditingTagIds(selectedTask.tags.map((tag) => tag.id));
  }, [selectedTask]);

  useEffect(() => {
    const load = async () => {
      if (!selectedTaskId) {
        setAssignmentHistory([]);
        return;
      }

      try {
        await Promise.all([loadAssignmentHistory(selectedTaskId), loadComments(selectedTaskId)]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load task history."
        );
      }
    };

    void load();
  }, [selectedOrganizationId, selectedProjectId, selectedTaskId]);

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: newTaskTitle,
            description: newTaskDescription,
            assignedToIds: newTaskAssigneeIds,
            tagIds: newTaskTagIds,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<TaskSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to create task.");
      }

      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskAssigneeIds([]);
      setNewTaskTagIds([]);
      setSuccessMessage("Task created successfully.");
      await refreshBoard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            title: editingTitle,
            description: editingDescription,
            assignedToIds: editingAssigneeIds,
            tagIds: editingTagIds,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<TaskSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to update task.");
      }

      setSuccessMessage("Task updated successfully.");
      await refreshBoard();
      setSelectedTaskId(taskId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceTask = async (task: TaskSummary) => {
    const nextStatus = getNextStatus(task.status);

    if (!nextStatus) {
      return;
    }

    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${task.id}/status`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<TaskSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to update task status.");
      }

      setSuccessMessage(`Task moved to ${TASK_STATUS_LABELS[nextStatus]}.`);
      await refreshBoard();
      setSelectedTaskId(task.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update task status."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse<TaskSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to archive task.");
      }

      setSuccessMessage("Task archived successfully.");
      await refreshBoard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to archive task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/organizations/${selectedOrganizationId}/tags`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: newTagName,
        }),
      });

      const data = (await response.json()) as ApiResponse<TagSummary>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to create tag.");
      }

      setNewTagName("");
      setSuccessMessage("Tag created successfully.");
      await refreshTags();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create tag.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${selectedTask.id}/comments`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            message: newCommentMessage,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<CommentItem>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to add comment.");
      }

      setNewCommentMessage("");
      setSuccessMessage("Comment added successfully.");
      await loadComments(selectedTask.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add comment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!selectedTask) {
      return;
    }

    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${selectedTask.id}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            message: editingCommentMessage,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse<CommentItem>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to update comment.");
      }

      setEditingCommentId("");
      setEditingCommentMessage("");
      setSuccessMessage("Comment updated successfully.");
      await loadComments(selectedTask.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update comment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) {
      return;
    }

    clearMessages();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${selectedTask.id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse<CommentItem>;

      if (!response.ok || data.responseStatus === 0) {
        throw new Error(data.message || "Failed to delete comment.");
      }

      setSuccessMessage("Comment deleted successfully.");
      await loadComments(selectedTask.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete comment.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="management">
      <div className="management__header">
        <div>
          <p className="topbar__eyebrow">Tasks</p>
          <h3 className="surface__title">Task board</h3>
          <p className="surface__text">
            Tasks follow a strict workflow. Members can move only their assigned tasks,
            while admins, managers, and super admins can manage the full board.
          </p>
        </div>
        {(errorMessage || successMessage) ? (
          <div className="management__messages">
            {errorMessage ? <p className="message message--error">{errorMessage}</p> : null}
            {successMessage ? <p className="message message--success">{successMessage}</p> : null}
          </div>
        ) : null}
      </div>

      <section className="surface">
        <div className="management__grid management__grid--compact">
          <label className="field">
            <span>
              Organization
              <span className="field__required"> *</span>
            </span>
            <select
              className="field__select"
              value={selectedOrganizationId}
              onChange={(event) => setSelectedOrganizationId(event.target.value)}
              disabled={!organizations.length}
            >
              {!organizations.length ? <option value="">No organizations</option> : null}
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>
              Project
              <span className="field__required"> *</span>
            </span>
            <select
              className="field__select"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={!projects.length}
            >
              {!projects.length ? <option value="">No active projects</option> : null}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overview overview--compact">
        <article className="overview__card">
          <p className="overview__label">Organizations</p>
          <p className="overview__value">{organizations.length}</p>
        </article>
        <article className="overview__card">
          <p className="overview__label">Projects</p>
          <p className="overview__value">{projects.length}</p>
        </article>
        <article className="overview__card">
          <p className="overview__label">Tasks in board</p>
          <p className="overview__value">{flattenedTasks.length}</p>
        </article>
        <article className="overview__card">
          <p className="overview__label">Assigned to you</p>
          <p className="overview__value">{assignedTasks.length}</p>
        </article>
      </section>

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Status overview</h4>
          <p className="surface__text">
            {isLoading ? "Loading board..." : "Grouped in a single board response"}
          </p>
        </div>

        <div className="status-grid">
          {boardCounts.map(({ status, count }) => (
            <div key={status} className="status-card">
              <p className="overview__label">{TASK_STATUS_LABELS[status]}</p>
              <p className="overview__value">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {canManageTasks ? (
        <section className="surface">
          <h4 className="surface__subtitle">Create task</h4>
          <form className="auth-form" onSubmit={handleCreateTask}>
            <label className="field">
              <span>
                Title
                <span className="field__required"> *</span>
              </span>
              <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Task title"
              />
            </label>

            <label className="field">
              <span>
                Description
                <span className="field__required"> *</span>
              </span>
              <input
                value={newTaskDescription}
                onChange={(event) => setNewTaskDescription(event.target.value)}
                placeholder="Short task description"
              />
            </label>

            <label className="field">
              <span>Assign to</span>
              <div className="selection-grid">
                {members.map((member) => (
                  <button
                    key={member.user.id}
                    className={
                      newTaskAssigneeIds.includes(member.user.id)
                        ? "tag-chip is-selected"
                        : "tag-chip"
                    }
                    type="button"
                    onClick={() =>
                      setNewTaskAssigneeIds((currentIds) =>
                        toggleAssigneeId(currentIds, member.user.id)
                      )
                    }
                  >
                    {member.user.name} ({member.role})
                  </button>
                ))}
              </div>
            </label>

            {tags.length ? (
              <div className="field">
                <span>Tags</span>
                <div className="tag-picker">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={
                        newTaskTagIds.includes(tag.id)
                          ? "tag-chip is-selected"
                          : "tag-chip"
                      }
                      type="button"
                      onClick={() =>
                        setNewTaskTagIds((currentIds) => toggleTagId(currentIds, tag.id))
                      }
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              className="button button--primary"
              type="submit"
              disabled={isSaving || !selectedProjectId}
            >
              {isSaving ? "Saving..." : "Create task"}
            </button>
          </form>
        </section>
      ) : null}

      {canManageTasks ? (
        <section className="surface">
          <h4 className="surface__subtitle">Tags</h4>
          <form className="auth-form" onSubmit={handleCreateTag}>
            <label className="field">
              <span>
                Create tag
                <span className="field__required"> *</span>
              </span>
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="New organization tag"
              />
            </label>
            <button
              className="button button--primary"
              type="submit"
              disabled={isSaving || !selectedOrganizationId}
            >
              {isSaving ? "Saving..." : "Add tag"}
            </button>
          </form>

          {tags.length ? (
            <div className="tag-picker task-tags-section">
              {tags.map((tag) => (
                <span key={tag.id} className="tag-chip">
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="surface__text">No tags created for this organization yet.</p>
          )}
        </section>
      ) : null}

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Task list</h4>
          <p className="surface__text">
            Every task in this project stays visible here so it can be reviewed and reassigned.
          </p>
        </div>

        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assignees</th>
                <th>Tags</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {flattenedTasks.map((task) => (
                <tr
                  key={task.id}
                  className={task.id === selectedTaskId ? "is-selected" : ""}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <td>{task.title}</td>
                  <td>{TASK_STATUS_LABELS[task.status]}</td>
                  <td>
                    {task.assignees.length
                      ? task.assignees.map((assignee) => assignee.name).join(", ")
                      : "Unassigned"}
                  </td>
                  <td>{task.tags.length ? task.tags.map((tag) => tag.name).join(", ") : "-"}</td>
                  <td>{new Date(task.updatedAt).toLocaleDateString()}</td>
                  <td className="table__actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {assignedTasks.length ? (
        <section className="surface">
          <div className="management__section-header">
            <h4 className="surface__subtitle">Assigned to you</h4>
            <p className="surface__text">Only your assigned tasks can be moved by you.</p>
          </div>

          <div className="task-list">
            {assignedTasks.map((task) => {
              const nextStatus = getNextStatus(task.status);

              return (
                <article key={task.id} className="task-list__item">
                  <div>
                    <p className="task-card__title">{task.title}</p>
                    <p className="surface__text">{TASK_STATUS_LABELS[task.status]}</p>
                  </div>
                  <div className="task-list__actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      View
                    </button>
                    {nextStatus && canUpdateTaskStatus(task) ? (
                      <button
                        className="button button--primary"
                        type="button"
                        onClick={() => void handleAdvanceTask(task)}
                        disabled={isSaving}
                      >
                        Move to {TASK_STATUS_LABELS[nextStatus]}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Board</h4>
          <p className="surface__text">
            Tasks are grouped by status in one backend call for this project.
          </p>
        </div>

        <div className="task-board-shell">
          <div className="task-board">
            {TASK_STATUSES.map((status) => (
              <section key={status} className="task-column">
                <header className="task-column__header">
                  <p className="overview__label">{TASK_STATUS_LABELS[status]}</p>
                  <span className="task-column__count">{board[status].length}</span>
                </header>

                <div className="task-column__body">
                  {board[status].length ? (
                    board[status].map((task) => {
                      const nextStatus = getNextStatus(task.status);

                      return (
                        <article
                          key={task.id}
                          className={
                            selectedTaskId === task.id ? "task-card is-selected" : "task-card"
                          }
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="task-card__top">
                            <p className="task-card__title">{task.title}</p>
                            <span className="task-card__status">
                              {TASK_STATUS_LABELS[task.status]}
                            </span>
                          </div>

                          <p className="task-card__description">{task.description}</p>
                          <p className="task-card__meta">
                            {task.assignees.length
                              ? `Assigned to ${task.assignees
                                  .map((assignee) => assignee.name)
                                  .join(", ")}`
                              : "Unassigned"}
                          </p>

                          {task.tags.length ? (
                            <div className="tag-list">
                              {task.tags.map((tag) => (
                                <span key={tag.id} className="tag-chip">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {nextStatus && canUpdateTaskStatus(task) ? (
                            <button
                              className="text-button"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleAdvanceTask(task);
                              }}
                            >
                              Move to {TASK_STATUS_LABELS[nextStatus]}
                            </button>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <div className="task-column__empty">No tasks in this stage.</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="management__section-header">
          <h4 className="surface__subtitle">Task details</h4>
          <p className="surface__text">
            {selectedTask ? "Review or update the selected task." : "Select a task from the board."}
          </p>
        </div>

        {selectedTask ? (
          <>
            {canManageTasks ? (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleUpdateTask(selectedTask.id);
                }}
              >
              <label className="field">
                <span>Title</span>
                <input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Description</span>
                <input
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                />
              </label>

                <label className="field">
                  <span>Assigned to</span>
                  <div className="selection-grid">
                    {members.map((member) => (
                      <button
                        key={member.user.id}
                        className={
                          editingAssigneeIds.includes(member.user.id)
                            ? "tag-chip is-selected"
                            : "tag-chip"
                        }
                        type="button"
                        onClick={() =>
                          setEditingAssigneeIds((currentIds) =>
                            toggleAssigneeId(currentIds, member.user.id)
                          )
                        }
                      >
                        {member.user.name} ({member.role})
                      </button>
                    ))}
                  </div>
                </label>

              {tags.length ? (
                <div className="field">
                  <span>Tags</span>
                  <div className="tag-picker">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        className={
                          editingTagIds.includes(tag.id) ? "tag-chip is-selected" : "tag-chip"
                        }
                        type="button"
                        onClick={() =>
                          setEditingTagIds((currentIds) => toggleTagId(currentIds, tag.id))
                        }
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="task-detail__meta">
                <p className="surface__text">
                  Created {new Date(selectedTask.createdAt).toLocaleDateString()}
                </p>
                <p className="surface__text">
                  Updated {new Date(selectedTask.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="task-detail__actions">
                <button className="button button--primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save task"}
                </button>
                <button
                  className="button button--danger"
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleArchiveTask(selectedTask.id)}
                >
                  Archive task
                </button>
              </div>

              </form>
            ) : (
              <div className="details-list">
                <div>
                  <dt>Title</dt>
                  <dd>{selectedTask.title}</dd>
                </div>
                <div>
                  <dt>Description</dt>
                  <dd>{selectedTask.description}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{TASK_STATUS_LABELS[selectedTask.status]}</dd>
                </div>
                <div>
                  <dt>Assigned to</dt>
                  <dd>
                    {selectedTask.assignees.length
                      ? selectedTask.assignees.map((assignee) => assignee.name).join(", ")
                      : "Unassigned"}
                  </dd>
                </div>
              </div>
            )}

            <div className="assignment-history">
              <h5 className="surface__subtitle">Assignment history</h5>
              {assignmentHistory.length ? (
                <div className="assignment-history__list">
                  {assignmentHistory.map((item) => (
                    <article key={item.id} className="assignment-history__item">
                      <p className="surface__text">
                        {item.previousUser?.name ?? "Unassigned"} to{" "}
                        {item.newUser?.name ?? "Unassigned"}
                      </p>
                      <p className="muted">{new Date(item.timeOfChange).toLocaleString()}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="surface__text">No assignment changes recorded yet.</p>
              )}
            </div>

            <div className="comments-section">
              <div className="management__section-header">
                <h5 className="surface__subtitle">Comments</h5>
                <p className="surface__text">Project members can collaborate here.</p>
              </div>

              <form className="auth-form" onSubmit={handleCreateComment}>
                <label className="field">
                  <span>
                    Add comment
                    <span className="field__required"> *</span>
                  </span>
                  <input
                    value={newCommentMessage}
                    onChange={(event) => setNewCommentMessage(event.target.value)}
                    placeholder="Write a short comment"
                  />
                </label>
                <button className="button button--primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Add comment"}
                </button>
              </form>

              {comments.length ? (
                <div className="comments-list">
                  {comments.map((comment) => {
                    const canManageComment =
                      auth.user.globalRole === "SUPER_ADMIN" ||
                      canManageTasks ||
                      comment.user.id === auth.user.id;

                    return (
                      <article key={comment.id} className="comment-item">
                        <div className="comment-item__header">
                          <div>
                            <p className="task-card__title">{comment.user.name}</p>
                            <p className="muted">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {canManageComment ? (
                            <div className="task-list__actions">
                              {editingCommentId === comment.id ? (
                                <button
                                  className="text-button"
                                  type="button"
                                  onClick={() => void handleUpdateComment(comment.id)}
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  className="text-button"
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentMessage(comment.message);
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                className="text-button"
                                type="button"
                                onClick={() => void handleDeleteComment(comment.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {editingCommentId === comment.id ? (
                          <input
                            value={editingCommentMessage}
                            onChange={(event) => setEditingCommentMessage(event.target.value)}
                          />
                        ) : (
                          <p className="surface__text">{comment.message}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="surface__text">No comments yet for this task.</p>
              )}
            </div>
          </>
        ) : (
          <p className="surface__text">No task selected yet.</p>
        )}
      </section>
    </section>
  );
}
