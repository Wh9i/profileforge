import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@profileforge.app";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const username = "admin";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", emailVerified: new Date() },
    create: {
      name: "Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      profile: {
        create: {
          username,
          displayName: "Admin",
          theme: { create: {} },
        },
      },
      settings: { create: {} },
      premium: {
        create: {
          tier: "ELITE",
          premiumBadge: true,
          animatedUsername: true,
          advancedAnalytics: true,
          maxUploads: 100,
          maxMusicTracks: 20,
        },
      },
    },
  });

  console.log(`Admin user ready: ${user.email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
