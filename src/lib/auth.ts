import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      username?: string;
    };
  }

  interface User {
    role?: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    username?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { profile: true },
        });

        if (!user || !user.password) return null;
        if (user.isBanned) return null;
        //if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(process.env.AUTH_DISCORD_ID
      ? [
          Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET!,
          }),
        ]
      : []),
    ...(process.env.AUTH_GOOGLE_ID
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    ...(process.env.AUTH_GITHUB_ID
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { profile: true },
        });
        if (existing?.isBanned) return false;

        if (existing && !existing.profile) {
          const base = user.email!.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
          let uniqueUsername = base;
          let counter = 1;
          while (
            await prisma.profile.findUnique({ where: { username: uniqueUsername } })
          ) {
            uniqueUsername = `${base}${counter++}`;
          }

          await prisma.user.update({
            where: { id: existing.id },
            data: {
              emailVerified: new Date(),
              profile: {
                create: {
                  username: uniqueUsername,
                  displayName: user.name,
                  avatarUrl: user.image,
                  theme: { create: {} },
                },
              },
              settings: { create: {} },
              premium: { create: {} },
            },
          });
        } else if (existing && !existing.emailVerified) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date() },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role || "USER";
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      if (process.env.NEXT_RUNTIME === "edge") {
        return token; 
      }
      
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        include: { profile: true },
      });

      if (dbUser) {
        token.role = dbUser.role;
        token.username = dbUser.profile?.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
});
