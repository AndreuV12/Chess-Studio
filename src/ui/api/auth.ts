import type { RegisterFields, RegistrationResponse } from "@/types/auth.types";
import { api } from "./client";

export const AuthApi = {
  async register(fields: RegisterFields): Promise<RegistrationResponse> {
    const { data } = await api.post<RegistrationResponse>("/register", fields);
    return data;
  },
};
