"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.findClientById = exports.findClients = exports.createClient = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const clientInclude = {
    projects: {
        include: {
            employees: true,
        },
    },
    _count: {
        select: {
            projects: true,
        },
    },
};
const createClient = async (data) => {
    return prisma_1.default.client.create({
        data,
        include: clientInclude,
    });
};
exports.createClient = createClient;
const findClients = async () => {
    return prisma_1.default.client.findMany({
        include: clientInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findClients = findClients;
const findClientById = async (clientId) => {
    return prisma_1.default.client.findUnique({
        where: { id: clientId },
        include: clientInclude,
    });
};
exports.findClientById = findClientById;
const updateClient = async (clientId, data) => {
    return prisma_1.default.client.update({
        where: { id: clientId },
        data,
        include: clientInclude,
    });
};
exports.updateClient = updateClient;
const deleteClient = async (clientId) => {
    return prisma_1.default.client.delete({
        where: { id: clientId },
        include: clientInclude,
    });
};
exports.deleteClient = deleteClient;
