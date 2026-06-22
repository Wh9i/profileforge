import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, bannedUsers, premiumUsers, totalViews, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.premium.count({ where: { tier: { not: "FREE" } } }),
      prisma.profile.aggregate({ _sum: { viewCount: true } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { profile: true, premium: true },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    bannedUsers,
    premiumUsers,
    totalViews: totalViews._sum.viewCount || 0,
    recentUsers,
  });
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, action, reason, tier } = await req.json();

  if (action === "ban") {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason, bannedAt: new Date() },
    });
  } else if (action === "unban") {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null, bannedAt: null },
    });
  } else if (action === "premium") {
    await prisma.premium.upsert({
      where: { userId },
      create: {
        userId,
        tier: tier || "PRO",
        premiumBadge: true,
        maxUploads: 50,
        maxMusicTracks: 10,
        advancedAnalytics: true,
      },
      update: {
        tier: tier || "PRO",
        premiumBadge: true,
        maxUploads: 50,
        maxMusicTracks: 10,
        advancedAnalytics: true,
      },
    });
  }

  return NextResponse.json({ success: true });
}
