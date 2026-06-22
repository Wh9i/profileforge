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
  });

  if (!targetProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (targetProfile.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot like your own profile" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_profileId: {
        userId: session.user.id,
        profileId: targetProfile.id,
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.profile.update({
        where: { id: targetProfile.id },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.like.create({
      data: {
        userId: session.user.id,
        profileId: targetProfile.id,
      },
    }),
    prisma.profile.update({
      where: { id: targetProfile.id },
      data: { likeCount: { increment: 1 } },
    }),
    prisma.analyticsEvent.create({
      data: {
        userId: targetProfile.userId,
        type: "LIKE",
        metadata: { likerId: session.user.id },
      },
    }),
  ]);

  return NextResponse.json({ liked: true });
}
