import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { AuthValidationService } from "@/server/services/authValidation.service";
import RegisterView from "@/ui/components/auth/RegisterView";

export const metadata: Metadata = {
  title: "Registrarse | Chess Studio",
};

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { callbackUrl } = await searchParams;

  return <RegisterView callbackUrl={AuthValidationService.getSafeCallbackUrl(callbackUrl)} />;
}
