"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PublicProfile } from "@/components/profile/public-profile";

interface ProfileData {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  backgroundUrl?: string | null;
  backgroundVideo?: string | null;
  backgroundType: string;
  accentColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  effectType: string;
  mouseEffect: string;
  glassOpacity: number;
  neonIntensity: number;
  showVisitorCount: boolean;
  showFollowers: boolean;
  showLikes: boolean;
  musicAutoplay: boolean;
  musicLoop: boolean;
  musicVolume: number;
  viewCount: number;
  likeCount: number;
  followerCount: number;
  socialLinks: Array<{ id: string; platform: string; url: string; label?: string | null }>;
  musicPlaylist: Array<{ id: string; title: string; url: string; artist?: string | null }>;
  isPremium?: boolean;
  premiumBadge?: boolean;
  animatedUsername?: boolean;
}

export function PublicProfileClient({ username }: { username: string }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setProfile)
      .catch(() => setNotFound(true));

    if (session?.user) {
      fetch(`/api/follow?username=${username}`)
        .then((r) => r.json())
        .then((d) => setIsFollowing(d.following))
        .catch(() => {});
    }
  }, [username, session]);

  const handleFollow = async () => {
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setIsFollowing(data.following);
    if (profile) {
      setProfile({
        ...profile,
        followerCount: profile.followerCount + (data.following ? 1 : -1),
      });
    }
  };

  const handleLike = async () => {
    const res = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setIsLiked(data.liked);
    if (profile) {
      setProfile({
        ...profile,
        likeCount: profile.likeCount + (data.liked ? 1 : -1),
      });
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-white/50">Profile not found</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PublicProfile
      profile={profile}
      onFollow={session?.user ? handleFollow : undefined}
      onLike={session?.user ? handleLike : undefined}
      isFollowing={isFollowing}
      isLiked={isLiked}
      showActions={!!session?.user}
    />
  );
}
