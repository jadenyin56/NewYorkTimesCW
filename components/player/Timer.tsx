"use client";

import { Pause, Play } from "lucide-react";

export function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Timer({ seconds, paused, onToggle }: { seconds: number; paused: boolean; onToggle: () => void }) {
  return <button type="button" onClick={onToggle} className="flex items-center gap-2 rounded px-2 py-1 font-mono text-sm font-semibold hover:bg-black/5" aria-label={paused ? "Resume timer" : "Pause timer"}>{paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}{formatTime(seconds)}</button>;
}
