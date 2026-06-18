import { Request, Response } from "express";
import * as salaryAccountService from "../service/salaryAccount.service";
import { asyncHandler, getRouteParam, sendSuccess } from "./controller.util";

export const createSalaryAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const salaryAccount = await salaryAccountService.createSalaryAccount({
      ...req.body,
      ...(req.body.openedAt ? { openedAt: new Date(req.body.openedAt) } : {}),
    });

    sendSuccess(
      res,
      "Salary account created successfully.",
      salaryAccount,
      201
    );
  }
);

export const getSalaryAccounts = asyncHandler(
  async (_req: Request, res: Response) => {
    const salaryAccounts = await salaryAccountService.getSalaryAccounts();
    sendSuccess(
      res,
      "Salary accounts fetched successfully.",
      salaryAccounts
    );
  }
);

export const getSalaryAccountById = asyncHandler(
  async (req: Request, res: Response) => {
    const salaryAccount = await salaryAccountService.getSalaryAccountById(
      getRouteParam(req.params.id, "id")
    );
    sendSuccess(res, "Salary account fetched successfully.", salaryAccount);
  }
);

export const updateSalaryAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const salaryAccountId = getRouteParam(req.params.id, "id");
    const payload = {
      ...req.body,
      ...(req.body.openedAt !== undefined
        ? { openedAt: new Date(req.body.openedAt) }
        : {}),
    };

    const salaryAccount = await salaryAccountService.updateSalaryAccount(
      salaryAccountId,
      payload
    );

    sendSuccess(res, "Salary account updated successfully.", salaryAccount);
  }
);

export const deleteSalaryAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const salaryAccount = await salaryAccountService.deleteSalaryAccount(
      getRouteParam(req.params.id, "id")
    );
    sendSuccess(res, "Salary account deleted successfully.", salaryAccount);
  }
);
