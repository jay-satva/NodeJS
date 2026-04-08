import * as userRepo from "../repository/user.repository";

export const getAllUsers = async () => {
  return userRepo.getUsers();
};