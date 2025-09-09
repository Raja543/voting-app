// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      id: string;
      email: string;
      isAdmin: boolean;
      isWhitelisted: boolean;
    };
  }

  interface User {
    name: string;
    email: string;
    isAdmin: boolean;
    isWhitelisted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    isWhitelisted?: boolean;
  }
}
