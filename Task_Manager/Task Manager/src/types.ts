export interface ApiResponse<T = unknown> {
  responseStatus: 0 | 1;        
  message: string;
  result?: T;
  page?: number;
  totalRecord?: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
}