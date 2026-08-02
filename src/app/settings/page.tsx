"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs, type UserPrefs } from "@/lib/storage";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(getPrefs());
  }, []);

  if (!prefs) {
    return <p className="text-slate-400">Loading preferences…</p>;
  }

  const update = (key: keyof UserPrefs, value: string | number) => {
    setPrefs((p) => (p ? { ...p, [key]: value } : p));
    setSaved(false);
  };

  const handleSave = () => {
    if (prefs) {
      savePrefs(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-400">
          Personal study preferences (saved on this device)
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold">Study Preferences</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Daily study hours target
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={prefs.studyHoursPerDay}
              onChange={(e) => update("studyHoursPerDay", Number(e.target.value) || 4)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Preferred start time
            </label>
            <input
              type="time"
              value={prefs.preferredStartTime}
              onChange={(e) => update("preferredStartTime", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Preferred end time
            </label>
            <input
              type="time"
              value={prefs.preferredEndTime}
              onChange={(e) => update("preferredEndTime", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          These settings are used by the auto study calendar to place revision blocks.
        </p>

        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p className="text-sm text-slate-400">
          This is your personal study planner. All data (sessions, preferences, calendar) is stored only on this device. No accounts, no cloud sync, fully private.
        </p>
      </section>
    </div>
  );
}
