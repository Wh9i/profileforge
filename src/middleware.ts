import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Инициализируем NextAuth ТОЛЬКО через легкий конфиг без Prisma/Bcrypt
export default NextAuth(authConfig).auth;

export const config = {
  // Этот матчер защищает нужные страницы, не затрагивая статику и API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};