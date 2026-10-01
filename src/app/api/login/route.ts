import { AuthError, CredentialsSignin } from "next-auth";
import { NextResponse } from "next/server";
import { loginRequestSchema, type LoginResponse } from "@/app/api/auth/schemas";
import { signIn } from "@/server/auth";
import { ApiValidationService } from "@/server/services/apiValidation.service";

export async function POST(request: Request) {
  const { data, errorResponse } = await ApiValidationService.validateJson(loginRequestSchema, request);
  if (errorResponse) return errorResponse;

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      redirectTo: "/",
    });

    return NextResponse.json<LoginResponse>({ authenticated: true });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return NextResponse.json({ error: "El correo o la contraseña no son correctos." }, { status: 401 });
    }

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "No se ha podido iniciar sesión." }, { status: 500 });
    }

    throw error;
  }
}
