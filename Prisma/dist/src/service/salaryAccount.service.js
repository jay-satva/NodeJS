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
const employeeRepository = __importStar(require("../repository/employee.repository"));
const salaryAccountRepository = __importStar(require("../repository/salaryAccount.repository"));
const service_util_1 = require("./service.util");
const ensureEmployeeExists = async (employeeId) => {
    const employee = await employeeRepository.findEmployeeById(employeeId);
    (0, service_util_1.ensureFound)(employee, "Employee not found.");
};
const createSalaryAccount = async (data) => {
    (0, service_util_1.requireFields)([
        ["bank", data.bank],
        ["acctNo", data.acctNo],
        ["employeeId", data.employeeId],
    ]);
    await ensureEmployeeExists(data.employeeId);
    return salaryAccountRepository.createSalaryAccount(data);
};
exports.createSalaryAccount = createSalaryAccount;
const getSalaryAccounts = async () => salaryAccountRepository.findSalaryAccounts();
exports.getSalaryAccounts = getSalaryAccounts;
const getSalaryAccountById = async (salaryAccountId) => {
    const salaryAccount = await salaryAccountRepository.findSalaryAccountById(salaryAccountId);
    return (0, service_util_1.ensureFound)(salaryAccount, "Salary account not found.");
};
exports.getSalaryAccountById = getSalaryAccountById;
const updateSalaryAccount = async (salaryAccountId, data) => {
    await (0, exports.getSalaryAccountById)(salaryAccountId);
    if (data.employeeId) {
        await ensureEmployeeExists(data.employeeId);
    }
    return salaryAccountRepository.updateSalaryAccount(salaryAccountId, data);
};
exports.updateSalaryAccount = updateSalaryAccount;
const deleteSalaryAccount = async (salaryAccountId) => {
    await (0, exports.getSalaryAccountById)(salaryAccountId);
    return salaryAccountRepository.deleteSalaryAccount(salaryAccountId);
};
exports.deleteSalaryAccount = deleteSalaryAccount;
