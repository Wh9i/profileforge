import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
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
    ...authConfig.providers,
  ],
  callbacks: {
    ...authConfig.callbacks,
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
      const updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session });

      if (process.env.NEXT_RUNTIME === "edge") {
        return updatedToken; 
      }
      
      const dbUser = await prisma.user.findUnique({
        where: { id: updatedToken.id as string },
        include: { profile: true },
      });

      if (dbUser) {
        updatedToken.role = dbUser.role;
        updatedToken.username = dbUser.profile?.username;
      }

      return updatedToken;
    },
  },
});