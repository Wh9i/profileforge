"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  artist?: string | null;
  url: string;
  coverUrl?: string | null;
}

interface MusicPlayerProps {
  tracks: Track[];
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
  accentColor?: string;
}

export function MusicPlayer({
  tracks,
  autoplay = false,
  loop = true,
  volume = 0.5,
  accentColor = "#6366f1",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(volume);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const currentTrack = tracks[currentIndex];

  const setupAnalyser = useCallback(() => {
    if (!audioRef.current || analyser) return;
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audioRef.current);
      const anal = ctx.createAnalyser();
      anal.fftSize = 64;
      source.connect(anal);
      anal.connect(ctx.destination);
      setAnalyser(anal);
    } catch {
      // AudioContext may fail if already connected
    }
  }, [analyser]);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyser) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.6 + (dataArray[i] / 255) * 0.4;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
    };
    draw();
  }, [analyser, accentColor]);

  useEffect(() => {
    if (playing && analyser) drawVisualizer();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, analyser, drawVisualizer]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : vol;
    }
  }, [vol, muted]);

  useEffect(() => {
    if (playing && audioRef.current) {
      setupAnalyser();
      audioRef.current.play().catch(() => setPlaying(false));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [playing, currentIndex, setupAnalyser]);

  const nextTrack = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (loop) {
      setCurrentIndex(0);
    } else {
      setPlaying(false);
    }
  };

  if (!tracks.length || !currentTrack) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 w-full max-w-sm"
    >
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop={tracks.length === 1 && loop}
        onEnded={nextTrack}
      />

      <div className="flex items-center gap-3 mb-3">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white/50 text-xs"
            style={{ background: `${accentColor}33` }}
          >
            ♪
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          {currentTrack.artist && (
            <p className="text-xs text-white/40 truncate">{currentTrack.artist}</p>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} width={280} height={40} className="w-full h-10 rounded-lg mb-3 opacity-80" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: accentColor }}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          {tracks.length > 1 && (
            <button
              onClick={nextTrack}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(!muted)} className="text-white/40 hover:text-white/70">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : vol}
            onChange={(e) => {
              setVol(parseFloat(e.target.value));
              setMuted(false);
            }}
            className="w-20 h-1 accent-brand-500"
          />
        </div>
      </div>
    </motion.div>
  );
}
