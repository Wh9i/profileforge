import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = subDays(new Date(), days);

  const [views, uniqueVisitors, linkClicks, events, profile] = await Promise.all([
    prisma.profileView.count({
      where: {
        profile: { userId: session.user.id },
        createdAt: { gte: since },
      },
    }),
    prisma.profileView.groupBy({
      by: ["ipHash"],
      where: {
        profile: { userId: session.user.id },
        createdAt: { gte: since },
        ipHash: { not: null },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        userId: session.user.id,
        type: "LINK_CLICK",
        createdAt: { gte: since },
      },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: since },
      },
      select: {
        type: true,
        country: true,
        device: true,
        browser: true,
        createdAt: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { viewCount: true, followerCount: true, likeCount: true },
    }),
  ]);

  const dailyGrowth: { date: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const nextDay = startOfDay(subDays(new Date(), i - 1));
    const count = events.filter(
      (e) => e.createdAt >= day && e.createdAt < nextDay
    ).length;
    dailyGrowth.push({
      date: day.toISOString().split("T")[0],
      views: count,
    });
  }

  const devices = events.reduce(
    (acc, e) => {
      const d = e.device || "unknown";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const countries = events.reduce(
    (acc, e) => {
      const c = e.country || "unknown";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    totalViews: profile?.viewCount || 0,
    periodViews: views,
    uniqueVisitors: uniqueVisitors.length,
    linkClicks,
    followers: profile?.followerCount || 0,
    likes: profile?.likeCount || 0,
    dailyGrowth,
    devices,
    countries,
  });
}
