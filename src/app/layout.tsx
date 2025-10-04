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
        {/* Register service worker for better caching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}