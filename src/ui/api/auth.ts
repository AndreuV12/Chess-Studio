import type { LoginRequest, LoginResponse } from "@/app/api/auth/schemas";
import type { RegisterRequest, RegisterResponse } from "@/app/api/register/schemas";
import { api } from "./client";

export const AuthApi = {
  async login(fields: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/login", fields);
    return data;
  },

  async register(fields: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/register", fields);
    return data;
  },
};
