// api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});
