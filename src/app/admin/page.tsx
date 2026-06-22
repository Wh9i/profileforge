"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Ban,
  Crown,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  bannedUsers: number;
  premiumUsers: number;
  totalViews: number;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  isBanned: boolean;
  role: string;
  createdAt: string;
  profile: { username: string; viewCount: number } | null;
  premium: { tier: string } | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);

  const load = () => {
    fetch("/api/admin").then((r) => r.json()).then(setStats).catch(console.error);
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const adminAction = async (userId: string, action: string, extra?: Record<string, string>) => {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, ...extra }),
    });
    load();
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users },
        { label: "Banned", value: stats.bannedUsers, icon: Ban },
        { label: "Premium", value: stats.premiumUsers, icon: Crown },
        { label: "Total Views", value: stats.totalViews, icon: Eye },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-white/50 mt-1">Manage users and platform analytics</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <s.icon className="w-5 h-5 text-brand-400" />
                  <div>
                    <p className="text-sm text-white/50">{s.label}</p>
                    <p className="text-xl font-bold">{formatNumber(s.value)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Username</th>
                  <th className="text-left py-3 px-2">Views</th>
                  <th className="text-left py-3 px-2">Tier</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-2">
                      <p className="font-medium">{user.name || "—"}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </td>
                    <td className="py-3 px-2 text-white/60">
                      {user.profile?.username || "—"}
                    </td>
                    <td className="py-3 px-2">
                      {formatNumber(user.profile?.viewCount || 0)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-brand-500/20 text-brand-400">
                        {user.premium?.tier || "FREE"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {user.isBanned ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <XCircle className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right space-x-1">
                      {user.isBanned ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => adminAction(user.id, "unban")}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            adminAction(user.id, "ban", { reason: "Admin action" })
                          }
                        >
                          Ban
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => adminAction(user.id, "premium", { tier: "PRO" })}
                      >
                        <Crown className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
