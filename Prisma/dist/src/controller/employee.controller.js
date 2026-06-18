"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const employeeService = __importStar(require("../service/employee.service"));
const controller_util_1 = require("./controller.util");
exports.createEmployee = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const employee = await employeeService.createEmployee({
        ...req.body,
        dob: new Date(req.body.dob),
    });
    (0, controller_util_1.sendSuccess)(res, "Employee created successfully.", employee, 201);
});
exports.getEmployees = (0, controller_util_1.asyncHandler)(async (_req, res) => {
    const employees = await employeeService.getEmployees();
    (0, controller_util_1.sendSuccess)(res, "Employees fetched successfully.", employees);
});
exports.getEmployeeById = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const employee = await employeeService.getEmployeeById((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Employee fetched successfully.", employee);
});
exports.updateEmployee = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const employeeId = (0, controller_util_1.getRouteParam)(req.params.id, "id");
    const payload = {
        ...req.body,
        ...(req.body.dob !== undefined ? { dob: new Date(req.body.dob) } : {}),
    };
    const employee = await employeeService.updateEmployee(employeeId, payload);
    (0, controller_util_1.sendSuccess)(res, "Employee updated successfully.", employee);
});
exports.deleteEmployee = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const employee = await employeeService.deleteEmployee((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Employee deleted successfully.", employee);
});
