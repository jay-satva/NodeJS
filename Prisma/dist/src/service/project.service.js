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
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const clientRepository = __importStar(require("../repository/client.repository"));
const employeeRepository = __importStar(require("../repository/employee.repository"));
const projectRepository = __importStar(require("../repository/project.repository"));
const service_util_1 = require("./service.util");
const ensureClientExists = async (clientId) => {
    const client = await clientRepository.findClientById(clientId);
    (0, service_util_1.ensureFound)(client, "Client not found.");
};
const ensureEmployeesExist = async (employeeIds) => {
    const employees = await Promise.all(employeeIds.map((employeeId) => employeeRepository.findEmployeeById(employeeId)));
    const missingEmployee = employees.find((employee) => !employee);
    if (missingEmployee !== undefined) {
        throw (0, service_util_1.createHttpError)("One or more employees were not found.", 404);
    }
};
const createProject = async (data) => {
    (0, service_util_1.requireFields)([
        ["name", data.name],
        ["description", data.description],
        ["clientId", data.clientId],
    ]);
    await ensureClientExists(data.clientId);
    await ensureEmployeesExist(data.employeeIds ?? []);
    return projectRepository.createProject({
        ...data,
        status: data.status ?? "BACKLOG",
    });
};
exports.createProject = createProject;
const getProjects = async () => projectRepository.findProjects();
exports.getProjects = getProjects;
const getProjectById = async (projectId) => {
    const project = await projectRepository.findProjectById(projectId);
    return (0, service_util_1.ensureFound)(project, "Project not found.");
};
exports.getProjectById = getProjectById;
const updateProject = async (projectId, data) => {
    await (0, exports.getProjectById)(projectId);
    if (data.clientId) {
        await ensureClientExists(data.clientId);
    }
    if (data.employeeIds) {
        await ensureEmployeesExist(data.employeeIds);
    }
    return projectRepository.updateProject(projectId, data);
};
exports.updateProject = updateProject;
const deleteProject = async (projectId) => {
    await (0, exports.getProjectById)(projectId);
    return projectRepository.deleteProject(projectId);
};
exports.deleteProject = deleteProject;
