import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Studio",
  description: "Estudia aperturas, variantes y análisis de ajedrez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
