import * as employeeRepository from "../repository/employee.repository";
import * as leaveRepository from "../repository/leave.repository";
import { CreateLeaveInput, UpdateLeaveInput } from "../models/model";
import { ensureFound, requireFields } from "./service.util";

const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await employeeRepository.findEmployeeById(employeeId);
  ensureFound(employee, "Employee not found.");
};

export const createLeave = async (data: CreateLeaveInput) => {
  requireFields([
    ["reason", data.reason],
    ["employeeId", data.employeeId],
  ]);

  await ensureEmployeeExists(data.employeeId);
  return leaveRepository.createLeave({
    ...data,
    type: data.type ?? "UNPAID",
  });
};

export const getLeaves = async () => leaveRepository.findLeaves();

export const getLeaveById = async (leaveId: string) => {
  const leave = await leaveRepository.findLeaveById(leaveId);
  return ensureFound(leave, "Leave not found.");
};

export const updateLeave = async (leaveId: string, data: UpdateLeaveInput) => {
  await getLeaveById(leaveId);

  if (data.employeeId) {
    await ensureEmployeeExists(data.employeeId);
  }

  return leaveRepository.updateLeave(leaveId, data);
};

export const deleteLeave = async (leaveId: string) => {
  await getLeaveById(leaveId);
  return leaveRepository.deleteLeave(leaveId);
};
