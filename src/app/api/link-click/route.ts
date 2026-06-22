import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { linkId } = await req.json();

  const link = await prisma.socialLink.findUnique({
    where: { id: linkId },
    include: { profile: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.socialLink.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    }),
    prisma.analyticsEvent.create({
      data: {
        userId: link.profile.userId,
        type: "LINK_CLICK",
        metadata: { linkId, platform: link.platform },
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
