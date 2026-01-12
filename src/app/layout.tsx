import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyBooking - Réservation de Salles",
  description: "Application de réservation de salles de réunion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 flex flex-col">{children}</body>
    </html>
  );
}
