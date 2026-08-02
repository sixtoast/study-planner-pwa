"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

const PRESETS = [
  { label: "Pomodoro", minutes: 25 },
  { label: "Short Break", minutes: 5 },
  { label: "Long Break", minutes: 15 },
  { label: "Deep Work", minutes: 50 },
];

export default function TimerPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setCompletedSessions((c) => c + 1);
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(selectedPreset.minutes * 60);
  }, [selectedPreset]);

  const selectPreset = (preset: (typeof PRESETS)[0]) => {
    setSelectedPreset(preset);
    setIsRunning(false);
    setSecondsLeft(preset.minutes * 60);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress =
    ((selectedPreset.minutes * 60 - secondsLeft) /
      (selectedPreset.minutes * 60)) *
    100;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="mt-1 text-slate-400">
          Focus deeply. Sessions are logged when you connect Supabase.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => selectPreset(p)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedPreset.label === p.label
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {p.label} ({p.minutes}m)
          </button>
        ))}
      </div>

      <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
          <p className="mt-1 text-sm text-slate-400">{selectedPreset.label}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={reset} className="rounded-full bg-slate-800 p-3 text-slate-300 hover:bg-slate-700" title="Reset">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="rounded-full bg-blue-600 p-5 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
        >
          {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </button>
        <button onClick={() => selectPreset(PRESETS[1])} className="rounded-full bg-slate-800 p-3 text-slate-300 hover:bg-slate-700" title="Short break">
          <Coffee className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">What are you studying?</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Mathematics P1 – Calculus"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
        <p className="text-sm text-slate-400">
          Sessions completed this visit: <span className="font-semibold text-white">{completedSessions}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Connect Supabase in Settings to permanently log sessions & build stats.
        </p>
      </div>
    </div>
  );
}
