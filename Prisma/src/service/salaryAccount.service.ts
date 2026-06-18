import * as employeeRepository from "../repository/employee.repository";
import * as salaryAccountRepository from "../repository/salaryAccount.repository";
import {
  CreateSalaryAccountInput,
  UpdateSalaryAccountInput,
} from "../models/model";
import { ensureFound, requireFields } from "./service.util";

const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await employeeRepository.findEmployeeById(employeeId);
  ensureFound(employee, "Employee not found.");
};

export const createSalaryAccount = async (data: CreateSalaryAccountInput) => {
  requireFields([
    ["bank", data.bank],
    ["acctNo", data.acctNo],
    ["employeeId", data.employeeId],
  ]);

  await ensureEmployeeExists(data.employeeId);
  return salaryAccountRepository.createSalaryAccount(data);
};

export const getSalaryAccounts = async () =>
  salaryAccountRepository.findSalaryAccounts();

export const getSalaryAccountById = async (salaryAccountId: string) => {
  const salaryAccount = await salaryAccountRepository.findSalaryAccountById(
    salaryAccountId
  );
  return ensureFound(salaryAccount, "Salary account not found.");
};

export const updateSalaryAccount = async (
  salaryAccountId: string,
  data: UpdateSalaryAccountInput
) => {
  await getSalaryAccountById(salaryAccountId);

  if (data.employeeId) {
    await ensureEmployeeExists(data.employeeId);
  }

  return salaryAccountRepository.updateSalaryAccount(salaryAccountId, data);
};

export const deleteSalaryAccount = async (salaryAccountId: string) => {
  await getSalaryAccountById(salaryAccountId);
  return salaryAccountRepository.deleteSalaryAccount(salaryAccountId);
};
