import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const verification = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { include: { profile: true } } },
    });

    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { id: verification.id } }),
    ]);

    if (verification.user.profile) {
      await sendWelcomeEmail(
        verification.user.email,
        verification.user.profile.username
      );
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
