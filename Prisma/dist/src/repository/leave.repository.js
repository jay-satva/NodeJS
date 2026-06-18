"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeave = exports.updateLeave = exports.findLeaveById = exports.findLeaves = exports.createLeave = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const leaveInclude = {
    employee: true,
};
const createLeave = async (data) => {
    return prisma_1.default.leave.create({
        data,
        include: leaveInclude,
    });
};
exports.createLeave = createLeave;
const findLeaves = async () => {
    return prisma_1.default.leave.findMany({
        include: leaveInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findLeaves = findLeaves;
const findLeaveById = async (leaveId) => {
    return prisma_1.default.leave.findUnique({
        where: { id: leaveId },
        include: leaveInclude,
    });
};
exports.findLeaveById = findLeaveById;
const updateLeave = async (leaveId, data) => {
    return prisma_1.default.leave.update({
        where: { id: leaveId },
        data,
        include: leaveInclude,
    });
};
exports.updateLeave = updateLeave;
const deleteLeave = async (leaveId) => {
    return prisma_1.default.leave.delete({
        where: { id: leaveId },
        include: leaveInclude,
    });
};
exports.deleteLeave = deleteLeave;
