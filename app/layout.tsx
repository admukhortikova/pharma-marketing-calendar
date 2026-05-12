import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaMarketing — Календарь маркетинговых кампаний",
  description: "Планирование и управление маркетинговыми кампаниями фармацевтической компании с AI-поддержкой",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
