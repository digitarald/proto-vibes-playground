import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        {children}
        <Script id="figma-capture-loader" strategy="afterInteractive">
          {`
            if (window.location.hash.includes('figmacapture=')) {
              const script = document.createElement('script');
              script.src = 'https://mcp.figma.com/mcp/html-to-design/capture.js';
              script.async = true;
              document.head.appendChild(script);
            }
          `}
        </Script>
      </body>
    </html>
  );
}
