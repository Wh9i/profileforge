import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      musicPlaylist: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(profile?.musicPlaylist || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, artist, url, coverUrl, duration } = await req.json();

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: { include: { premium: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const maxTracks = profile.user.premium?.maxMusicTracks || 1;
  const count = await prisma.musicTrack.count({ where: { userId: session.user.id } });

  if (count >= maxTracks) {
    return NextResponse.json(
      { error: `Maximum ${maxTracks} tracks allowed. Upgrade to premium for more.` },
      { status: 403 }
    );
  }

  const track = await prisma.musicTrack.create({
    data: {
      userId: session.user.id,
      profileId: profile.id,
      title,
      artist,
      url,
      coverUrl,
      duration,
      order: count,
    },
  });

  return NextResponse.json(track, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, artist, order, isActive } = await req.json();

  const track = await prisma.musicTrack.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const updated = await prisma.musicTrack.update({
    where: { id },
    data: { title, artist, order, isActive },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  await prisma.musicTrack.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
