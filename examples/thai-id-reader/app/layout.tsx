import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thai ID Reader",
  description: "Minimal SolId Reader Thai ID card example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
