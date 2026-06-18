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
const projectService = __importStar(require("../service/project.service"));
const controller_util_1 = require("./controller.util");
exports.createProject = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const project = await projectService.createProject(req.body);
    (0, controller_util_1.sendSuccess)(res, "Project created successfully.", project, 201);
});
exports.getProjects = (0, controller_util_1.asyncHandler)(async (_req, res) => {
    const projects = await projectService.getProjects();
    (0, controller_util_1.sendSuccess)(res, "Projects fetched successfully.", projects);
});
exports.getProjectById = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const project = await projectService.getProjectById((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Project fetched successfully.", project);
});
exports.updateProject = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const project = await projectService.updateProject((0, controller_util_1.getRouteParam)(req.params.id, "id"), req.body);
    (0, controller_util_1.sendSuccess)(res, "Project updated successfully.", project);
});
exports.deleteProject = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const project = await projectService.deleteProject((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Project deleted successfully.", project);
});
