"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs, type UserPrefs } from "@/lib/storage";
import {
  getNotifPrefs,
  saveNotifPrefs,
  requestNotificationPermission,
  canNotify,
  type NotifPrefs,
} from "@/lib/notifications";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs | null>(null);
  const [saved, setSaved] = useState(false);
  const [notifStatus, setNotifStatus] = useState("");

  useEffect(() => {
    setPrefs(getPrefs());
    setNotifPrefs(getNotifPrefs());
  }, []);

  if (!prefs || !notifPrefs) {
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

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      const updated = saveNotifPrefs({ enabled: true });
      setNotifPrefs(updated);
      setNotifStatus("Notifications enabled!");
    } else {
      setNotifStatus("Permission denied. Enable notifications in your phone settings.");
    }
  };

  const toggleNotif = (key: keyof NotifPrefs, value: boolean | string) => {
    const updated = saveNotifPrefs({ [key]: value });
    setNotifPrefs(updated);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-400">
          Personal study preferences (saved on this device)
        </p>
      </div>

      {/* Study Preferences */}
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

      {/* Notifications */}
      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold">Notifications</h2>

        {!canNotify() && !notifPrefs.enabled ? (
          <div>
            <p className="text-sm text-slate-400 mb-3">
              Get reminders for upcoming exams and daily study sessions.
            </p>
            <button
              onClick={enableNotifications}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              Enable Notifications
            </button>
            {notifStatus && (
              <p className="mt-2 text-sm text-amber-300">{notifStatus}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm">Exam reminders (1–2 days before)</span>
              <input
                type="checkbox"
                checked={notifPrefs.examReminders}
                onChange={(e) => toggleNotif("examReminders", e.target.checked)}
                className="h-4 w-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm">Daily study reminder</span>
              <input
                type="checkbox"
                checked={notifPrefs.dailyReminder}
                onChange={(e) => toggleNotif("dailyReminder", e.target.checked)}
                className="h-4 w-4 rounded"
              />
            </label>

            {notifPrefs.dailyReminder && (
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Daily reminder time
                </label>
                <input
                  type="time"
                  value={notifPrefs.dailyTime}
                  onChange={(e) => toggleNotif("dailyTime", e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            )}

            <p className="text-xs text-slate-500">
              Notifications appear when you open the app (and if your phone allows background alerts).
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p className="text-sm text-slate-400">
          This is your personal study planner. All data is stored only on this device. No accounts, fully private.
        </p>
      </section>
    </div>
  );
}
