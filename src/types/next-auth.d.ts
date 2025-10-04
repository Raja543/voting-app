import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username?: string;
      image?: string;
      isAdmin: boolean;
      isWhitelisted: boolean;
      isEmailVerified: boolean;
      provider: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    username?: string;
    image?: string;
    isAdmin: boolean;
    isWhitelisted: boolean;
    isEmailVerified: boolean;
    provider: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    name: string;
    email: string;
    username?: string;
    image?: string;
    isAdmin: boolean;
    isWhitelisted: boolean;
    isEmailVerified: boolean;
    provider: string;
  }
}
