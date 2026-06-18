"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_routes_1 = __importDefault(require("./client.routes"));
const employee_routes_1 = __importDefault(require("./employee.routes"));
const leave_routes_1 = __importDefault(require("./leave.routes"));
const project_routes_1 = __importDefault(require("./project.routes"));
const salaryAccount_routes_1 = __importDefault(require("./salaryAccount.routes"));
const apiRouter = (0, express_1.Router)();
apiRouter.use("/employees", employee_routes_1.default);
apiRouter.use("/salary-accounts", salaryAccount_routes_1.default);
apiRouter.use("/leaves", leave_routes_1.default);
apiRouter.use("/clients", client_routes_1.default);
apiRouter.use("/projects", project_routes_1.default);
exports.default = apiRouter;
