"use client";

import { useEffect, useState } from "react";
import { Music, Upload, Trash2, Play, Pause } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/lib/uploadthing";

interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  isActive: boolean;
  order: number;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrack, setNewTrack] = useState({ title: "", artist: "", url: "" });

  const loadTracks = () => {
    fetch("/api/music")
      .then((r) => r.json())
      .then(setTracks)
      .catch(console.error);
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const addTrack = async () => {
    if (!newTrack.title || !newTrack.url) return;
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrack),
    });
    setNewTrack({ title: "", artist: "", url: "" });
    loadTracks();
  };

  const deleteTrack = async (id: string) => {
    await fetch("/api/music", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadTracks();
  };

  const toggleActive = async (track: Track) => {
    await fetch("/api/music", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: track.id, isActive: !track.isActive }),
    });
    loadTracks();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Music</h1>
          <p className="text-white/50 mt-1">Manage your profile playlist</p>
        </div>

        <Card glow>
          <CardHeader>
            <CardTitle>Upload Music</CardTitle>
            <CardDescription>MP3 files up to 16MB. Premium users get more tracks.</CardDescription>
          </CardHeader>
          <UploadButton
            endpoint="musicUploader"
            onClientUploadComplete={(res) => {
              const file = res[0];
              setNewTrack({
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "",
                url: file.url,
              });
            }}
            appearance={{
              button: "bg-brand-500/20 text-brand-400 px-6 py-3 rounded-xl w-full ut-uploading:opacity-50",
              allowedContent: "text-white/30 text-sm mt-2",
            }}
            content={{
              button: () => (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" /> Upload MP3
                </span>
              ),
            }}
          />
        </Card>

        {(newTrack.url || tracks.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Add Track Details</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Title"
                value={newTrack.title}
                onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
              />
              <Input
                label="Artist (optional)"
                value={newTrack.artist}
                onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
              />
              {newTrack.url && (
                <Button onClick={addTrack} className="w-full">
                  <Music className="w-4 h-4" /> Add to Playlist
                </Button>
              )}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Playlist ({tracks.length})</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3"
              >
                <button
                  onClick={() => toggleActive(track)}
                  className={`p-2 rounded-lg ${track.isActive ? "text-brand-400" : "text-white/30"}`}
                >
                  {track.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  {track.artist && (
                    <p className="text-xs text-white/40 truncate">{track.artist}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteTrack(track.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tracks.length === 0 && (
              <p className="text-center text-white/30 py-8">No tracks yet. Upload your first song!</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
