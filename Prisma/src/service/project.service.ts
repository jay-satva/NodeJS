import * as clientRepository from "../repository/client.repository";
import * as employeeRepository from "../repository/employee.repository";
import * as projectRepository from "../repository/project.repository";
import { CreateProjectInput, UpdateProjectInput } from "../models/model";
import { createHttpError, ensureFound, requireFields } from "./service.util";

const ensureClientExists = async (clientId: string) => {
  const client = await clientRepository.findClientById(clientId);
  ensureFound(client, "Client not found.");
};

const ensureEmployeesExist = async (employeeIds: string[]) => {
  const employees = await Promise.all(
    employeeIds.map((employeeId) =>
      employeeRepository.findEmployeeById(employeeId)
    )
  );

  const missingEmployee = employees.find((employee) => !employee);
  if (missingEmployee !== undefined) {
    throw createHttpError("One or more employees were not found.", 404);
  }
};

export const createProject = async (data: CreateProjectInput) => {
  requireFields([
    ["name", data.name],
    ["description", data.description],
    ["clientId", data.clientId],
  ]);

  await ensureClientExists(data.clientId);
  await ensureEmployeesExist(data.employeeIds ?? []);

  return projectRepository.createProject({
    ...data,
    status: data.status ?? "BACKLOG",
  });
};

export const getProjects = async () => projectRepository.findProjects();

export const getProjectById = async (projectId: string) => {
  const project = await projectRepository.findProjectById(projectId);
  return ensureFound(project, "Project not found.");
};

export const updateProject = async (
  projectId: string,
  data: UpdateProjectInput
) => {
  await getProjectById(projectId);

  if (data.clientId) {
    await ensureClientExists(data.clientId);
  }

  if (data.employeeIds) {
    await ensureEmployeesExist(data.employeeIds);
  }

  return projectRepository.updateProject(projectId, data);
};

export const deleteProject = async (projectId: string) => {
  await getProjectById(projectId);
  return projectRepository.deleteProject(projectId);
};
