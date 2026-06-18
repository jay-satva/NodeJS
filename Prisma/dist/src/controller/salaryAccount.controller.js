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
exports.deleteSalaryAccount = exports.updateSalaryAccount = exports.getSalaryAccountById = exports.getSalaryAccounts = exports.createSalaryAccount = void 0;
const salaryAccountService = __importStar(require("../service/salaryAccount.service"));
const controller_util_1 = require("./controller.util");
exports.createSalaryAccount = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const salaryAccount = await salaryAccountService.createSalaryAccount({
        ...req.body,
        ...(req.body.openedAt ? { openedAt: new Date(req.body.openedAt) } : {}),
    });
    (0, controller_util_1.sendSuccess)(res, "Salary account created successfully.", salaryAccount, 201);
});
exports.getSalaryAccounts = (0, controller_util_1.asyncHandler)(async (_req, res) => {
    const salaryAccounts = await salaryAccountService.getSalaryAccounts();
    (0, controller_util_1.sendSuccess)(res, "Salary accounts fetched successfully.", salaryAccounts);
});
exports.getSalaryAccountById = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const salaryAccount = await salaryAccountService.getSalaryAccountById((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Salary account fetched successfully.", salaryAccount);
});
exports.updateSalaryAccount = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const salaryAccountId = (0, controller_util_1.getRouteParam)(req.params.id, "id");
    const payload = {
        ...req.body,
        ...(req.body.openedAt !== undefined
            ? { openedAt: new Date(req.body.openedAt) }
            : {}),
    };
    const salaryAccount = await salaryAccountService.updateSalaryAccount(salaryAccountId, payload);
    (0, controller_util_1.sendSuccess)(res, "Salary account updated successfully.", salaryAccount);
});
exports.deleteSalaryAccount = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const salaryAccount = await salaryAccountService.deleteSalaryAccount((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Salary account deleted successfully.", salaryAccount);
});
