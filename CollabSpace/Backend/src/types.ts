import type { GlobalRole } from "../generated/prisma";

export interface ApiResponse<T = unknown> {
  responseStatus: 0 | 1;        
  message: string;
  result?: T;
  page?: number;
  totalRecord?: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  globalRole: GlobalRole;
}
