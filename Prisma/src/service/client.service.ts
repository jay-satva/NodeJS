import * as clientRepository from "../repository/client.repository";
import { CreateClientInput, UpdateClientInput } from "../models/model";
import { ensureFound, requireFields } from "./service.util";

export const createClient = async (data: CreateClientInput) => {
  requireFields([
    ["name", data.name],
    ["email", data.email],
    ["contact", data.contact],
  ]);

  return clientRepository.createClient(data);
};

export const getClients = async () => clientRepository.findClients();

export const getClientById = async (clientId: string) => {
  const client = await clientRepository.findClientById(clientId);
  return ensureFound(client, "Client not found.");
};

export const updateClient = async (clientId: string, data: UpdateClientInput) => {
  await getClientById(clientId);
  return clientRepository.updateClient(clientId, data);
};

export const deleteClient = async (clientId: string) => {
  await getClientById(clientId);
  return clientRepository.deleteClient(clientId);
};
