import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import ChessWorkspace from "@/ui/components/ChessWorkspace/ChessWorkspace";

export default async function Home() {
  const session = await auth();

  // if (!session?.user) {
  //   redirect("/login");
  // }

  return <ChessWorkspace />;
}
