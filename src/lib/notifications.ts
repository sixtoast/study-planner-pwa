import { getUpcomingExams, getExamDisplayName } from "@/data/exams";
import { daysUntil } from "@/lib/utils";

const NOTIF_PREFS_KEY = "study-planner-notif-prefs";

export type NotifPrefs = {
  enabled: boolean;
  dailyReminder: boolean;
  examReminders: boolean;
  dailyTime: string; // "HH:mm"
};

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  enabled: false,
  dailyReminder: true,
  examReminders: true,
  dailyTime: "08:00",
};

export function getNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    return raw ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) } : DEFAULT_NOTIF_PREFS;
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

export function saveNotifPrefs(prefs: Partial<NotifPrefs>) {
  const current = getNotifPrefs();
  const updated = { ...current, ...prefs };
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
  return updated;
}

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

/** Show a simple notification */
export function showNotification(title: string, body: string, tag?: string) {
  if (!canNotify()) return;

  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      tag: tag || "study-planner",
      requireInteraction: false,
    });
  } catch (e) {
    console.warn("Notification failed", e);
  }
}

/** Check for exams in the next 2 days and notify if needed */
export function checkExamReminders() {
  const prefs = getNotifPrefs();
  if (!prefs.enabled || !prefs.examReminders || !canNotify()) return;

  const upcoming = getUpcomingExams(5);
  const today = new Date().toISOString().slice(0, 10);

  // Avoid spamming: only notify once per exam per day
  const notifiedKey = `notif-exam-${today}`;
  const already = localStorage.getItem(notifiedKey);
  const notifiedSet = already ? new Set(JSON.parse(already)) : new Set<string>();

  for (const exam of upcoming) {
    const days = daysUntil(exam.date);
    if (days < 0 || days > 2) continue;
    if (notifiedSet.has(exam.id)) continue;

    let message = "";
    if (days === 0) {
      message = `${getExamDisplayName(exam)} is TODAY at ${exam.startTime}. Good luck!`;
    } else if (days === 1) {
      message = `${getExamDisplayName(exam)} is TOMORROW at ${exam.startTime}. Final revision time.`;
    } else {
      message = `${getExamDisplayName(exam)} is in ${days} days (${exam.date}).`;
    }

    showNotification("Exam Reminder", message, `exam-${exam.id}`);
    notifiedSet.add(exam.id);
  }

  localStorage.setItem(notifiedKey, JSON.stringify([...notifiedSet]));
}

/** Daily study reminder (called when app opens around the preferred time) */
export function checkDailyReminder() {
  const prefs = getNotifPrefs();
  if (!prefs.enabled || !prefs.dailyReminder || !canNotify()) return;

  const now = new Date();
  const [h, m] = prefs.dailyTime.split(":").map(Number);
  const reminderTime = new Date();
  reminderTime.setHours(h, m, 0, 0);

  // Only show if we're within ~30 minutes after the reminder time
  const diffMs = now.getTime() - reminderTime.getTime();
  if (diffMs < 0 || diffMs > 30 * 60 * 1000) return;

  const todayKey = `daily-reminder-${now.toISOString().slice(0, 10)}`;
  if (localStorage.getItem(todayKey)) return; // already shown today

  showNotification(
    "Time to study!",
    "Your daily study session is waiting. Open the Pomodoro timer and get started.",
    "daily-reminder"
  );
  localStorage.setItem(todayKey, "1");
}
