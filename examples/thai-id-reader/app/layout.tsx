import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thai ID Card Reader",
  description: "Thai national ID card reader kiosk utility",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
