import type { RegisterRequest, RegisterResponse } from "@/app/api/register/schemas";
import { api } from "./client";

export const AuthApi = {
  async register(fields: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/register", fields);
    return data;
  },
};
