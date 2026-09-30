import { AuthenticationService } from "@/server/services/authentication.service";

export async function POST(request: Request) {
  let data: unknown;

  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "La solicitud no contiene un JSON válido." }, { status: 400 });
  }

  const result = await AuthenticationService.register(data);

  if (!result.success) {
    if (result.reason === "EMAIL_ALREADY_EXISTS") {
      return Response.json({ error: "Ya existe una cuenta con este correo electrónico." }, { status: 409 });
    }

    return Response.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  }

  return Response.json({ user: result.user }, { status: 201 });
}
