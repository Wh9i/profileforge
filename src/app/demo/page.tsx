import { PublicProfile } from "@/components/profile/public-profile";

const demoProfile = {
  id: "demo",
  username: "demo",
  displayName: "ProfileForge Demo",
  bio: "This is a demo profile showcasing all ProfileForge features. Create yours today!",
  avatarUrl: undefined,
  bannerUrl: undefined,
  backgroundUrl: undefined,
  backgroundVideo: undefined,
  backgroundType: "GRADIENT",
  accentColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  textColor: "#ffffff",
  fontFamily: "Inter",
  effectType: "NEON",
  mouseEffect: "SPARKLE",
  glassOpacity: 0.12,
  neonIntensity: 0.8,
  showVisitorCount: true,
  showFollowers: true,
  showLikes: true,
  musicAutoplay: false,
  musicLoop: true,
  musicVolume: 0.5,
  viewCount: 12847,
  likeCount: 892,
  followerCount: 2341,
  isPremium: true,
  premiumBadge: true,
  animatedUsername: true,
  socialLinks: [
    { id: "1", platform: "Discord", url: "https://discord.com", label: "Join my Discord" },
    { id: "2", platform: "Twitter", url: "https://twitter.com", label: "Follow on X" },
    { id: "3", platform: "GitHub", url: "https://github.com", label: "GitHub" },
    { id: "4", platform: "Website", url: "https://profileforge.app", label: "My Website" },
  ],
  musicPlaylist: [],
};

export default function DemoPage() {
  return <PublicProfile profile={demoProfile} showActions={false} />;
}
