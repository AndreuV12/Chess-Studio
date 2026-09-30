import Image from "next/image";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-100 px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 [background-image:linear-gradient(45deg,#e4e4e7_25%,transparent_25%),linear-gradient(-45deg,#e4e4e7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e4e4e7_75%),linear-gradient(-45deg,transparent_75%,#e4e4e7_75%)] [background-position:0_0,0_16px,16px_-16px,-16px_0] [background-size:32px_32px]"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 p-2 shadow-sm ring-1 ring-blue-100">
            <Image src="/logo.png" alt="Chess Studio" width={72} height={72} priority className="h-full w-full object-contain" />
          </div>
          <p className="mt-4 text-sm font-semibold tracking-[0.2em] text-blue-700 uppercase">Chess Studio</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
