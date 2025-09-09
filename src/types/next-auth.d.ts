// // src/types/next-auth.d.ts
// import { DefaultSession, DefaultUser } from "next-auth";
// import { JWT as DefaultJWT } from "next-auth/jwt";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name: string;
//       email: string;
//       isAdmin: boolean;
//       isWhitelisted: boolean;
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     id: string;
//     name: string;
//     email: string;
//     isAdmin: boolean;
//     isWhitelisted: boolean;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT extends DefaultJWT {
//     id: string;
//     name: string;
//     email: string;
//     isAdmin: boolean;
//     isWhitelisted: boolean;
//   }
// }


import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
      isWhitelisted: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isWhitelisted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    isAdmin?: boolean;
    isWhitelisted?: boolean;
  }
}

