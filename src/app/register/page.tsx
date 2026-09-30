import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { callbackUrlSchema } from "@/app/api/auth/schemas";
import { auth } from "@/server/auth";
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

  return <RegisterView callbackUrl={callbackUrlSchema.parse(callbackUrl)} />;
}
