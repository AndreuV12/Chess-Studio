import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { AuthValidationService } from "@/server/services/authValidation.service";
import LoginView from "@/ui/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Iniciar sesión | Chess Studio",
};

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { callbackUrl } = await searchParams;

  return <LoginView callbackUrl={AuthValidationService.getSafeCallbackUrl(callbackUrl)} />;
}
