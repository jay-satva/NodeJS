"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalaryAccount = exports.updateSalaryAccount = exports.findSalaryAccountById = exports.findSalaryAccounts = exports.createSalaryAccount = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const salaryInclude = {
    employee: true,
};
const createSalaryAccount = async (data) => {
    return prisma_1.default.salaryAcct.create({
        data,
        include: salaryInclude,
    });
};
exports.createSalaryAccount = createSalaryAccount;
const findSalaryAccounts = async () => {
    return prisma_1.default.salaryAcct.findMany({
        include: salaryInclude,
        orderBy: {
            openedAt: "desc",
        },
    });
};
exports.findSalaryAccounts = findSalaryAccounts;
const findSalaryAccountById = async (salaryAccountId) => {
    return prisma_1.default.salaryAcct.findUnique({
        where: { id: salaryAccountId },
        include: salaryInclude,
    });
};
exports.findSalaryAccountById = findSalaryAccountById;
const updateSalaryAccount = async (salaryAccountId, data) => {
    return prisma_1.default.salaryAcct.update({
        where: { id: salaryAccountId },
        data,
        include: salaryInclude,
    });
};
exports.updateSalaryAccount = updateSalaryAccount;
const deleteSalaryAccount = async (salaryAccountId) => {
    return prisma_1.default.salaryAcct.delete({
        where: { id: salaryAccountId },
        include: salaryInclude,
    });
};
exports.deleteSalaryAccount = deleteSalaryAccount;
