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
exports.deleteLeave = exports.updateLeave = exports.getLeaveById = exports.getLeaves = exports.createLeave = void 0;
const leaveService = __importStar(require("../service/leave.service"));
const controller_util_1 = require("./controller.util");
exports.createLeave = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.createLeave(req.body);
    (0, controller_util_1.sendSuccess)(res, "Leave created successfully.", leave, 201);
});
exports.getLeaves = (0, controller_util_1.asyncHandler)(async (_req, res) => {
    const leaves = await leaveService.getLeaves();
    (0, controller_util_1.sendSuccess)(res, "Leaves fetched successfully.", leaves);
});
exports.getLeaveById = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.getLeaveById((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Leave fetched successfully.", leave);
});
exports.updateLeave = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.updateLeave((0, controller_util_1.getRouteParam)(req.params.id, "id"), req.body);
    (0, controller_util_1.sendSuccess)(res, "Leave updated successfully.", leave);
});
exports.deleteLeave = (0, controller_util_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.deleteLeave((0, controller_util_1.getRouteParam)(req.params.id, "id"));
    (0, controller_util_1.sendSuccess)(res, "Leave deleted successfully.", leave);
});
