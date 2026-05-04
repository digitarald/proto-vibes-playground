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
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
