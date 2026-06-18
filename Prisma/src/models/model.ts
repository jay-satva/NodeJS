import { LeaveType, ProjectStatus, Role } from "../../generated/prisma";

export interface CreateEmployeeInput {
  email: string;
  name: string;
  contact: string;
  dob: Date;
  address: string;
  gender: string;
  role?: Role;
}

export interface UpdateEmployeeInput {
  email?: string;
  name?: string;
  contact?: string;
  dob?: Date;
  address?: string;
  gender?: string;
  role?: Role;
}

export interface CreateSalaryAccountInput {
  bank: string;
  acctNo: string;
  openedAt?: Date;
  employeeId: string;
}

export interface UpdateSalaryAccountInput {
  bank?: string;
  acctNo?: string;
  openedAt?: Date;
  employeeId?: string;
}

export interface CreateLeaveInput {
  type?: LeaveType;
  reason: string;
  employeeId: string;
}

export interface UpdateLeaveInput {
  type?: LeaveType;
  reason?: string;
  employeeId?: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  contact: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  contact?: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status?: ProjectStatus;
  clientId: string;
  employeeIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  clientId?: string;
  employeeIds?: string[];
}
