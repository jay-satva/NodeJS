import * as employeeRepository from "../repository/employee.repository";
import { CreateEmployeeInput, UpdateEmployeeInput } from "../models/model";
import { ensureFound, requireFields } from "./service.util";

export const createEmployee = async (data: CreateEmployeeInput) => {
  requireFields([
    ["email", data.email],
    ["name", data.name],
    ["contact", data.contact],
    ["dob", data.dob],
    ["address", data.address],
    ["gender", data.gender],
  ]);

  return employeeRepository.createEmployee({
    ...data,
    role: data.role ?? "EMPLOYEE",
  });
};

export const getEmployees = async () => employeeRepository.findEmployees();

export const getEmployeeById = async (employeeId: string) => {
  const employee = await employeeRepository.findEmployeeById(employeeId);
  return ensureFound(employee, "Employee not found.");
};

export const updateEmployee = async (
  employeeId: string,
  data: UpdateEmployeeInput
) => {
  await getEmployeeById(employeeId);
  return employeeRepository.updateEmployee(employeeId, data);
};

export const deleteEmployee = async (employeeId: string) => {
  await getEmployeeById(employeeId);
  return employeeRepository.deleteEmployee(employeeId);
};
