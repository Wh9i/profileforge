import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      socialLinks: {
        where: { isVisible: true },
        orderBy: { order: "asc" },
      },
      theme: true,
      musicPlaylist: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      user: {
        select: {
          premium: true,
          isBanned: true,
        },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!profile || !profile.isPublic || profile.user.isBanned) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...profile,
    user: undefined,
    isPremium: profile.user.premium?.tier !== "FREE",
    premiumBadge: profile.user.premium?.premiumBadge,
    animatedUsername: profile.user.premium?.animatedUsername,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: { user: true },
  });

  if (!profile || profile.user.isBanned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const ipHash = hashIp(ip);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingView = await prisma.profileView.findFirst({
    where: {
      profileId: profile.id,
      ipHash,
      createdAt: { gte: oneDayAgo },
    },
  });

  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Firefox")
      ? "Firefox"
      : userAgent.includes("Safari")
        ? "Safari"
        : "Other";

  if (!existingView) {
    await prisma.$transaction([
      prisma.profileView.create({
        data: {
          profileId: profile.id,
          ipHash,
          device,
          browser,
          referrer: req.headers.get("referer") || undefined,
        },
      }),
      prisma.profile.update({
        where: { id: profile.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.analyticsEvent.create({
        data: {
          userId: profile.userId,
          type: "PROFILE_VIEW",
          device,
          browser,
          metadata: { username },
        },
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
