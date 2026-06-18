import { Router } from "express";
import * as salaryAccountController from "../controller/salaryAccount.controller";

const salaryAccountRouter = Router();

salaryAccountRouter.post("/", salaryAccountController.createSalaryAccount);
salaryAccountRouter.get("/", salaryAccountController.getSalaryAccounts);
salaryAccountRouter.get("/:id", salaryAccountController.getSalaryAccountById);
salaryAccountRouter.put("/:id", salaryAccountController.updateSalaryAccount);
salaryAccountRouter.delete("/:id", salaryAccountController.deleteSalaryAccount);

export default salaryAccountRouter;
