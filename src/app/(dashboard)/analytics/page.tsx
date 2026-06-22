"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Eye, Users, MousePointer, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface AnalyticsData {
  totalViews: number;
  periodViews: number;
  uniqueVisitors: number;
  linkClicks: number;
  followers: number;
  likes: number;
  dailyGrowth: { date: string; views: number }[];
  devices: Record<string, number>;
  countries: Record<string, number>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [days]);

  const deviceData = data
    ? Object.entries(data.devices).map(([name, value]) => ({ name, value }))
    : [];

  const stats = data
    ? [
        { label: "Total Views", value: data.totalViews, icon: Eye },
        { label: "Period Views", value: data.periodViews, icon: TrendingUp },
        { label: "Unique Visitors", value: data.uniqueVisitors, icon: Users },
        { label: "Link Clicks", value: data.linkClicks, icon: MousePointer },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-white/50 mt-1">Track your profile performance</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 rounded-xl glass text-sm focus:outline-none"
          >
            <option value={7} className="bg-gray-900">Last 7 days</option>
            <option value={30} className="bg-gray-900">Last 30 days</option>
            <option value={90} className="bg-gray-900">Last 90 days</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-500/20">
                    <stat.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">{stat.label}</p>
                    <p className="text-xl font-bold">{formatNumber(stat.value)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Growth</CardTitle>
            </CardHeader>
            <div className="h-64">
              {data?.dailyGrowth && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyGrowth}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#6366f1"
                      fill="url(#colorViews)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <div className="h-64">
              {deviceData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
