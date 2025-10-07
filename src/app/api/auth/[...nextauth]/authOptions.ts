import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          isWhitelisted: user.isWhitelisted,
          isAdmin: user.isAdmin,
          isEmailVerified: user.isEmailVerified,
          provider: user.provider,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      try {
        if (!account || account.provider === "credentials") {
          return true;
        }

        const email =
          user.email ||
          (profile as any)?.data?.email ||
          (profile as any)?.email;

        if (!email) {
          console.log("[NextAuth] Deny sign-in: missing email", { user, account, profile });
          return false;
        }

        let existingUser = await User.findOne({ email: email.toLowerCase() });

        if (!existingUser) {
          existingUser = await User.create({
            name:
              user.name ||
              (profile as any)?.data?.name ||
              (profile as any)?.name ||
              "",
            email: email.toLowerCase(),
            image: user.image,
            provider: account.provider,
            providerId: user.id,
            isEmailVerified: account.provider === "google",
            isWhitelisted: false,
            lastLogin: new Date(),
            ...(account.provider === "twitter" && profile && {
              username: (profile as any)?.data?.username,
              bio: (profile as any)?.data?.description,
              socialLinks: {
                twitter: `https://twitter.com/${(profile as any)?.data?.username}`,
              },
            }),
          });
          console.log("[NextAuth] Created new OAuth user:", existingUser.email);
        } else {
          await User.findByIdAndUpdate(existingUser._id, {
            lastLogin: new Date(),
            image: user.image,
            ...(existingUser.provider === "credentials" && {
              provider: account.provider,
              providerId: user.id,
            }),
          });
          console.log("[NextAuth] Updated existing user:", existingUser.email);
        }

        return true;
      } catch (error) {
        console.error("[NextAuth] Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.username = dbUser.username;
          token.image = dbUser.image;
          token.isAdmin = dbUser.isAdmin;
          token.isWhitelisted = dbUser.isWhitelisted;
          token.isEmailVerified = dbUser.isEmailVerified;
          token.provider = dbUser.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.image = token.image as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isWhitelisted = token.isWhitelisted as boolean;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export { authOptions };
