"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicProfile } from "@/components/profile/public-profile";
import { UploadButton } from "@/lib/uploadthing";

interface Profile {
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
  backgroundVideo?: string;
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
  socialLinks: Array<{ id: string; platform: string; url: string; label?: string }>;
  musicPlaylist: Array<{ id: string; title: string; url: string; artist?: string }>;
}

const FONTS = ["Inter", "Georgia", "Courier New", "Impact", "Comic Sans MS"];
const EFFECTS = ["NONE", "GLASS", "NEON", "GLOW"];
const MOUSE_EFFECTS = ["NONE", "TRAIL", "SPARKLE", "RIPPLE"];
const BACKGROUNDS = ["SOLID", "GRADIENT", "IMAGE", "VIDEO", "PARTICLES"];

export default function EditorPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "", url: "" });

  const loadProfile = useCallback(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (field: string, value: unknown) => {
    setProfile((p) => (p ? { ...p, [field]: value } : p));
    setSaved(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: profile.displayName,
        bio: profile.bio,
        accentColor: profile.accentColor,
        secondaryColor: profile.secondaryColor,
        textColor: profile.textColor,
        fontFamily: profile.fontFamily,
        backgroundType: profile.backgroundType,
        effectType: profile.effectType,
        mouseEffect: profile.mouseEffect,
        glassOpacity: profile.glassOpacity,
        neonIntensity: profile.neonIntensity,
        showVisitorCount: profile.showVisitorCount,
        showFollowers: profile.showFollowers,
        showLikes: profile.showLikes,
        musicAutoplay: profile.musicAutoplay,
        musicLoop: profile.musicLoop,
        musicVolume: profile.musicVolume,
      }),
    });
    setSaving(false);
    setSaved(true);
  };

  const addLink = async () => {
    if (!newLink.platform || !newLink.url) return;
    await fetch("/api/social-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });
    setNewLink({ platform: "", url: "" });
    loadProfile();
  };

  const deleteLink = async (id: string) => {
    await fetch("/api/social-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadProfile();
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-48" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile Editor</h1>
          <p className="text-white/50 mt-1">Customize every detail of your page</p>
        </div>
        <Button onClick={saveProfile} loading={saving}>
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={profile.displayName || ""}
                onChange={(e) => updateField("displayName", e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Bio</label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload avatar, banner, and background</CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-3">
              <UploadButton
                endpoint="avatarUploader"
                onClientUploadComplete={() => loadProfile()}
                appearance={{
                  button: "bg-brand-500/20 text-brand-400 px-4 py-2 rounded-xl text-sm ut-uploading:opacity-50",
                  allowedContent: "hidden",
                }}
                content={{ button: () => <><Upload className="w-4 h-4 inline mr-1" />Avatar</> }}
              />
              <UploadButton
                endpoint="bannerUploader"
                onClientUploadComplete={() => loadProfile()}
                appearance={{
                  button: "bg-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-sm",
                  allowedContent: "hidden",
                }}
                content={{ button: () => <><Upload className="w-4 h-4 inline mr-1" />Banner</> }}
              />
              <UploadButton
                endpoint="backgroundUploader"
                onClientUploadComplete={() => loadProfile()}
                appearance={{
                  button: "bg-pink-500/20 text-pink-400 px-4 py-2 rounded-xl text-sm",
                  allowedContent: "hidden",
                }}
                content={{ button: () => <><Upload className="w-4 h-4 inline mr-1" />Background</> }}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Accent", field: "accentColor" },
                  { label: "Secondary", field: "secondaryColor" },
                  { label: "Text", field: "textColor" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs text-white/50 mb-1">{label}</label>
                    <input
                      type="color"
                      value={(profile as Record<string, string>)[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                ))}
              </div>

              {[
                { label: "Font", field: "fontFamily", options: FONTS },
                { label: "Effect", field: "effectType", options: EFFECTS },
                { label: "Mouse Effect", field: "mouseEffect", options: MOUSE_EFFECTS },
                { label: "Background", field: "backgroundType", options: BACKGROUNDS },
              ].map(({ label, field, options }) => (
                <div key={field}>
                  <label className="block text-sm text-white/70 mb-1.5">{label}</label>
                  <select
                    value={(profile as Record<string, string>)[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    {options.map((o) => (
                      <option key={o} value={o} className="bg-gray-900">{o}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="block text-sm text-white/70 mb-1.5">
                Glass Opacity: {(profile?.glassOpacity ?? 0.5).toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={profile.glassOpacity}
                  onChange={(e) => updateField("glassOpacity", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {profile.socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                  <span className="flex-1 text-sm">{link.label || link.platform}</span>
                  <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Platform"
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                />
                <Input
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <Button onClick={addLink} size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <div className="rounded-xl overflow-hidden border border-white/10 h-[600px] relative">
              <div className="absolute inset-0 overflow-auto scale-[0.85] origin-top">
                <PublicProfile profile={profile} showActions={false} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
