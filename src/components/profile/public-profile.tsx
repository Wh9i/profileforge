"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  Users,
  Heart,
  Crown,
  ExternalLink,
} from "lucide-react";
import { MusicPlayer } from "./music-player";
import { ParticleBackground, MouseEffectLayer } from "./effects";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string | null;
  icon?: string | null;
}

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
  socialLinks: SocialLink[];
  musicPlaylist: Array<{
    id: string;
    title: string;
    artist?: string | null;
    url: string;
    coverUrl?: string | null;
  }>;
  isPremium?: boolean;
  premiumBadge?: boolean;
  animatedUsername?: boolean;
}

interface PublicProfileProps {
  profile: ProfileData;
  onFollow?: () => void;
  onLike?: () => void;
  isFollowing?: boolean;
  isLiked?: boolean;
  showActions?: boolean;
}

export function PublicProfile({
  profile,
  onFollow,
  onLike,
  isFollowing,
  isLiked,
  showActions = true,
}: PublicProfileProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/profile/${profile.username}`, { method: "POST" }).catch(() => {});
  }, [profile.username]);

  const handleLinkClick = async (linkId: string, url: string) => {
    await fetch("/api/link-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    });
    window.open(url, "_blank");
  };

  const bgStyle: React.CSSProperties = {
    fontFamily: profile.fontFamily,
    color: profile.textColor,
  };

  const cardStyle: React.CSSProperties = {
    background: `rgba(255, 255, 255, ${profile.glassOpacity})`,
    backdropFilter: "blur(20px)",
    border: profile.effectType === "NEON"
      ? `1px solid ${profile.accentColor}${Math.round(profile.neonIntensity * 255).toString(16).padStart(2, "0")}`
      : "1px solid rgba(255,255,255,0.1)",
    boxShadow: profile.effectType === "NEON"
      ? `0 0 30px ${profile.accentColor}40, inset 0 1px 0 rgba(255,255,255,0.1)`
      : profile.effectType === "GLOW"
        ? `0 0 60px ${profile.accentColor}20`
        : undefined,
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>
      {/* Background */}
      {profile.backgroundType === "VIDEO" && profile.backgroundVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
        >
          <source src={profile.backgroundVideo} />
        </video>
      ) : profile.backgroundType === "IMAGE" && profile.backgroundUrl ? (
        <Image
          src={profile.backgroundUrl}
          alt=""
          fill
          className="object-cover z-0"
          priority
        />
      ) : profile.backgroundType === "GRADIENT" ? (
        <div
          className="fixed inset-0 z-0 animated-gradient"
          style={{
            background: `linear-gradient(135deg, ${profile.accentColor}40, ${profile.secondaryColor}30, #030014)`,
          }}
        />
      ) : profile.backgroundType === "PARTICLES" ? (
        <>
          <div className="fixed inset-0 z-0 bg-[#030014]" />
          <ParticleBackground color={profile.accentColor} />
        </>
      ) : (
        <div className="fixed inset-0 z-0" style={{ background: profile.accentColor + "20" }} />
      )}

      <div className="fixed inset-0 bg-black/30 z-[1]" />
      <MouseEffectLayer effect={profile.mouseEffect} color={profile.accentColor} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Banner */}
          {profile.bannerUrl && (
            <div className="relative h-32 rounded-t-2xl overflow-hidden mb-[-48px]">
              <Image src={profile.bannerUrl} alt="" fill className="object-cover" />
            </div>
          )}

          <div className="rounded-2xl p-8" style={cardStyle}>
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName || profile.username}
                    width={96}
                    height={96}
                    className="rounded-full border-2 object-cover"
                    style={{ borderColor: profile.accentColor }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${profile.accentColor}, ${profile.secondaryColor})`,
                    }}
                  >
                    {(profile.displayName || profile.username)[0]?.toUpperCase()}
                  </div>
                )}
                {profile.premiumBadge && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <h1
                className={cn(
                  "text-2xl font-bold mb-1",
                  profile.animatedUsername && "gradient-text animate-shimmer"
                )}
                style={!profile.animatedUsername ? { color: profile.textColor } : undefined}
              >
                {profile.displayName || profile.username}
              </h1>
              <p className="text-sm opacity-50 mb-1">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm opacity-70 mt-2 max-w-xs leading-relaxed">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm opacity-50">
                {profile.showVisitorCount && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {formatNumber(profile.viewCount)}
                  </span>
                )}
                {profile.showFollowers && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {formatNumber(profile.followerCount)}
                  </span>
                )}
                {profile.showLikes && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {formatNumber(profile.likeCount)}
                  </span>
                )}
              </div>

              {/* Actions */}
              {showActions && (onFollow || onLike) && (
                <div className="flex gap-3 mt-4">
                  {onFollow && (
                    <button
                      onClick={onFollow}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: isFollowing ? "rgba(255,255,255,0.1)" : profile.accentColor,
                        color: profile.textColor,
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                  {onLike && (
                    <button
                      onClick={onLike}
                      className="px-4 py-2 rounded-xl text-sm glass transition-all"
                      style={{ color: isLiked ? profile.accentColor : profile.textColor }}
                    >
                      <Heart className={cn("w-4 h-4 inline mr-1", isLiked && "fill-current")} />
                      {isLiked ? "Liked" : "Like"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks.length > 0 && (
              <div className="mt-6 space-y-2">
                {profile.socialLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.02] group"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="font-medium text-sm">
                      {link.label || link.platform}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Music Player */}
          {profile.musicPlaylist.length > 0 && (
            <div className="mt-4">
              <MusicPlayer
                tracks={profile.musicPlaylist}
                autoplay={profile.musicAutoplay}
                loop={profile.musicLoop}
                volume={profile.musicVolume}
                accentColor={profile.accentColor}
              />
            </div>
          )}
        </motion.div>

        <p className="mt-8 text-xs opacity-20">ProfileForge</p>
      </div>
    </div>
  );
}
