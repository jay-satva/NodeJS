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
exports.deleteClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const clientRepository = __importStar(require("../repository/client.repository"));
const service_util_1 = require("./service.util");
const createClient = async (data) => {
    (0, service_util_1.requireFields)([
        ["name", data.name],
        ["email", data.email],
        ["contact", data.contact],
    ]);
    return clientRepository.createClient(data);
};
exports.createClient = createClient;
const getClients = async () => clientRepository.findClients();
exports.getClients = getClients;
const getClientById = async (clientId) => {
    const client = await clientRepository.findClientById(clientId);
    return (0, service_util_1.ensureFound)(client, "Client not found.");
};
exports.getClientById = getClientById;
const updateClient = async (clientId, data) => {
    await (0, exports.getClientById)(clientId);
    return clientRepository.updateClient(clientId, data);
};
exports.updateClient = updateClient;
const deleteClient = async (clientId) => {
    await (0, exports.getClientById)(clientId);
    return clientRepository.deleteClient(clientId);
};
exports.deleteClient = deleteClient;
