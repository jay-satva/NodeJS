"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.findEmployeeById = exports.findEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const employeeInclude = {
    salaryAcct: true,
    leaves: true,
    projects: {
        include: {
            client: true,
        },
    },
    _count: {
        select: {
            leaves: true,
            projects: true,
        },
    },
};
const createEmployee = async (data) => {
    return prisma_1.default.employee.create({
        data,
        include: employeeInclude,
    });
};
exports.createEmployee = createEmployee;
const findEmployees = async () => {
    return prisma_1.default.employee.findMany({
        include: employeeInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findEmployees = findEmployees;
const findEmployeeById = async (employeeId) => {
    return prisma_1.default.employee.findUnique({
        where: { id: employeeId },
        include: employeeInclude,
    });
};
exports.findEmployeeById = findEmployeeById;
const updateEmployee = async (employeeId, data) => {
    return prisma_1.default.employee.update({
        where: { id: employeeId },
        data,
        include: employeeInclude,
    });
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (employeeId) => {
    return prisma_1.default.employee.delete({
        where: { id: employeeId },
        include: employeeInclude,
    });
};
exports.deleteEmployee = deleteEmployee;
