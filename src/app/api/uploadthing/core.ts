import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.upload.create({
        data: {
          userId: metadata.userId,
          type: "AVATAR",
          url: file.ufsUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type || "image/*",
        },
      });
      await prisma.profile.update({
        where: { userId: metadata.userId },
        data: { avatarUrl: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),

  bannerUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.upload.create({
        data: {
          userId: metadata.userId,
          type: "BANNER",
          url: file.ufsUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type || "image/*",
        },
      });
      await prisma.profile.update({
        where: { userId: metadata.userId },
        data: { bannerUrl: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),

  backgroundUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isVideo = file.type?.startsWith("video/");
      await prisma.upload.create({
        data: {
          userId: metadata.userId,
          type: "BACKGROUND",
          url: file.ufsUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type || "image/*",
        },
      });
      await prisma.profile.update({
        where: { userId: metadata.userId },
        data: isVideo
          ? { backgroundVideo: file.ufsUrl, backgroundType: "VIDEO" }
          : { backgroundUrl: file.ufsUrl, backgroundType: "IMAGE" },
      });
      return { url: file.ufsUrl };
    }),

  musicUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.upload.create({
        data: {
          userId: metadata.userId,
          type: "MUSIC",
          url: file.ufsUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type || "audio/mpeg",
        },
      });
      return { url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
