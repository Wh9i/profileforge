"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    profilePublic: true,
    showOnlineStatus: true,
    allowFollowers: true,
    language: "en",
    timezone: "UTC",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  const save = async () => {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggles = [
    { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates about your profile" },
    { key: "profilePublic", label: "Public Profile", desc: "Allow anyone to view your profile" },
    { key: "showOnlineStatus", label: "Show Online Status", desc: "Display when you're active" },
    { key: "allowFollowers", label: "Allow Followers", desc: "Let others follow your profile" },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-white/50 mt-1">Manage your account preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {toggles.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
                <button
                  onClick={() =>
                    setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings[key] ? "bg-brand-500" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings[key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional</CardTitle>
          </CardHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass text-white focus:outline-none"
              >
                <option value="en" className="bg-gray-900">English</option>
                <option value="es" className="bg-gray-900">Spanish</option>
                <option value="fr" className="bg-gray-900">French</option>
              </select>
            </div>
            <Input
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            />
          </div>
        </Card>

        <Button onClick={save}>{saved ? "Saved!" : "Save Settings"}</Button>
      </div>
    </DashboardLayout>
  );
}
