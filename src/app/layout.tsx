import type { Metadata, Viewport } from "next";
import React from "react";
import ClientLayout from "./clientlayout";
import "../styles/globals.css";
import { Fragment_Mono } from "next/font/google";

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Voting App",
  description: "A simple voting app with Next.js, NextAuth, and MongoDB",
  robots: "index, follow",
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
    <html lang="en" className={fragmentMono.className}>
      <head></head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}