"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Eye,
  Users,
  Heart,
  ExternalLink,
  Palette,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface DashboardData {
  viewCount: number;
  followerCount: number;
  likeCount: number;
  username: string;
  displayName?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<{ periodViews: number; uniqueVisitors: number; linkClicks: number } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error);
    fetch("/api/analytics?days=7")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, []);

  const stats = [
    { label: "Total Views", value: profile?.viewCount || 0, icon: Eye, color: "text-brand-400" },
    { label: "Followers", value: profile?.followerCount || 0, icon: Users, color: "text-purple-400" },
    { label: "Likes", value: profile?.likeCount || 0, icon: Heart, color: "text-pink-400" },
    { label: "Link Clicks", value: analytics?.linkClicks || 0, icon: ArrowUpRight, color: "text-green-400" },
  ];

  const quickActions = [
    { href: "/editor", label: "Customize Profile", icon: Palette, desc: "Colors, effects, backgrounds" },
    { href: "/analytics", label: "View Analytics", icon: BarChart3, desc: "Track your growth" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </motion.h1>
          <p className="text-white/50 mt-1">Here&apos;s how your profile is performing</p>
        </div>

        {profile?.username && (
          <Card glow className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">Your profile URL</p>
              <p className="text-lg font-mono text-brand-400">
                profileforge.app/{profile.username}
              </p>
            </div>
            <Link href={`/${profile.username}`} target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-4 h-4" />
                View Profile
              </Button>
            </Link>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{formatNumber(stat.value)}</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                {analytics && stat.label === "Total Views" && (
                  <p className="text-xs text-white/30 mt-2">
                    {analytics.periodViews} views this week · {analytics.uniqueVisitors} unique
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:bg-white/[0.07] transition-colors cursor-pointer group h-full">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-500/20 group-hover:neon-glow transition-shadow">
                    <action.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <CardTitle>{action.label}</CardTitle>
                    <CardDescription>{action.desc}</CardDescription>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
