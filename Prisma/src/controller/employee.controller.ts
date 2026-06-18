import { Request, Response } from "express";
import * as employeeService from "../service/employee.service";
import { asyncHandler, getRouteParam, sendSuccess } from "./controller.util";

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployee({
    ...req.body,
    dob: new Date(req.body.dob),
  });

  sendSuccess(res, "Employee created successfully.", employee, 201);
});

export const getEmployees = asyncHandler(async (_req: Request, res: Response) => {
  const employees = await employeeService.getEmployees();
  sendSuccess(res, "Employees fetched successfully.", employees);
});

export const getEmployeeById = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await employeeService.getEmployeeById(
      getRouteParam(req.params.id, "id")
    );
    sendSuccess(res, "Employee fetched successfully.", employee);
  }
);

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = getRouteParam(req.params.id, "id");
  const payload = {
    ...req.body,
    ...(req.body.dob !== undefined ? { dob: new Date(req.body.dob) } : {}),
  };

  const employee = await employeeService.updateEmployee(employeeId, payload);
  sendSuccess(res, "Employee updated successfully.", employee);
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.deleteEmployee(
    getRouteParam(req.params.id, "id")
  );
  sendSuccess(res, "Employee deleted successfully.", employee);
});
