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
      // 1. Если это момент логина, сохраняем данные в токен
      if (user) {
        token.id = user.id!;
        token.role = user.role || "USER";
      }

      // 2. Если прилетело обновление сессии с клиента
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // 3. Если мы в Edge-окружении (мидлварь), сразу возвращаем токен без работы с БД
      if (process.env.NEXT_RUNTIME === "edge") {
        return token; 
      }
      
      // 4. ЖЕЛЕЗНАЯ ЗАЩИТА: Если id нет, не делаем запрос к Prisma, чтобы избежать ошибки 500
      if (!token?.id) {
        return token;
      }

      // 5. Безопасный запрос к базе данных
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { profile: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.profile?.username;
        }
      } catch (error) {
        console.error("Ошибка запроса к БД в колбэке JWT:", error);
      }

      return token;
    },
  },
});