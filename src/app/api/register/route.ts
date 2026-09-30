import { NextResponse } from "next/server";
import { ApiValidationService } from "@/server/services/apiValidation.service";
import { AuthenticationService } from "@/server/services/authentication.service";
import { registerRequestSchema, type RegisterResponse } from "./schemas";

export async function POST(request: Request) {
  const { data, errorResponse } = await ApiValidationService.validateJson(registerRequestSchema, request);
  if (errorResponse) return errorResponse;

  const result = await AuthenticationService.register(
    {
      name: data.name,
      email: data.email,
    },
    data.password,
  );

  if (!result.success) {
    return NextResponse.json({ error: "Ya existe una cuenta con este correo electrónico." }, { status: 409 });
  }

  return NextResponse.json<RegisterResponse>(
    {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    },
    { status: 201 },
  );
}
