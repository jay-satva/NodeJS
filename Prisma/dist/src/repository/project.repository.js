"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.findProjectById = exports.findProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const projectInclude = {
    client: true,
    employees: true,
    _count: {
        select: {
            employees: true,
        },
    },
};
const createProject = async (data) => {
    const { employeeIds = [], ...projectData } = data;
    return prisma_1.default.project.create({
        data: {
            ...projectData,
            employees: employeeIds.length
                ? {
                    connect: employeeIds.map((id) => ({ id })),
                }
                : undefined,
        },
        include: projectInclude,
    });
};
exports.createProject = createProject;
const findProjects = async () => {
    return prisma_1.default.project.findMany({
        include: projectInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.findProjects = findProjects;
const findProjectById = async (projectId) => {
    return prisma_1.default.project.findUnique({
        where: { id: projectId },
        include: projectInclude,
    });
};
exports.findProjectById = findProjectById;
const updateProject = async (projectId, data) => {
    const { employeeIds, ...projectData } = data;
    return prisma_1.default.project.update({
        where: { id: projectId },
        data: {
            ...projectData,
            ...(employeeIds !== undefined
                ? {
                    employees: {
                        set: employeeIds.map((id) => ({ id })),
                    },
                }
                : {}),
        },
        include: projectInclude,
    });
};
exports.updateProject = updateProject;
const deleteProject = async (projectId) => {
    return prisma_1.default.project.delete({
        where: { id: projectId },
        include: projectInclude,
    });
};
exports.deleteProject = deleteProject;
