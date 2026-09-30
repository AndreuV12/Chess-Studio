import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import ChessWorkspace from "@/ui/components/ChessWorkspace/ChessWorkspace";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  return (
    <ChessWorkspace
      user={{
        name: session.user.name ?? null,
        email: session.user.email,
      }}
    />
  );
}
