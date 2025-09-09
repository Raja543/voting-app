import type { Metadata } from "next";
import React from "react";
import ClientLayout from "./clientlayout";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Voting App",
  description: "A simple voting app with Next.js, NextAuth, and MongoDB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}