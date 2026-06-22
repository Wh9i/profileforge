import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();

  const targetProfile = await prisma.profile.findUnique({
    where: { username },
    include: { user: true },
  });

  if (!targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetProfile.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetProfile.userId,
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.follow.delete({ where: { id: existing.id } }),
      prisma.profile.update({
        where: { id: targetProfile.id },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ following: false });
  }

  await prisma.$transaction([
    prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetProfile.userId,
      },
    }),
    prisma.profile.update({
      where: { id: targetProfile.id },
      data: { followerCount: { increment: 1 } },
    }),
    prisma.analyticsEvent.create({
      data: {
        userId: targetProfile.userId,
        type: "FOLLOW",
        metadata: { followerId: session.user.id },
      },
    }),
  ]);

  return NextResponse.json({ following: true });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const targetProfile = await prisma.profile.findUnique({
    where: { username },
  });

  if (!targetProfile) {
    return NextResponse.json({ following: false });
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetProfile.userId,
      },
    },
  });

  return NextResponse.json({ following: !!follow });
}
