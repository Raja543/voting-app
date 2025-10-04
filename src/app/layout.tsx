import type { Metadata, Viewport } from "next";
import React from "react";
import ClientLayout from "./clientlayout";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Voting App",
  description: "A simple voting app with Next.js, NextAuth, and MongoDB",
  robots: "index, follow",
  // Preload critical resources
  other: {
    "preload": "/api/posts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Service worker registration removed */}
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}