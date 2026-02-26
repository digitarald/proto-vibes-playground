import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proto Vibes Playground",
  description:
    "A curated collection of standalone prototypes. Browse, explore, and build.",
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
