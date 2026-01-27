"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {isAuthPage ? children : <div className="md:pl-64">{children}</div>}
    </SessionProvider>
  );
}