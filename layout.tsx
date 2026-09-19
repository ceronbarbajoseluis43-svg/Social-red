import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Swingers",
  description: "Plataforma social con feed en tiempo real, construida con Next.js y Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
