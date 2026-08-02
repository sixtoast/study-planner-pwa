import type { StudySession } from "@/types";

const SESSIONS_KEY = "study-planner-sessions";
const PREFS_KEY = "study-planner-prefs";

export type UserPrefs = {
  studyHoursPerDay: number;
  preferredStartTime: string; // "HH:mm"
  preferredEndTime: string;
  subjects: string[]; // subjects the user is actually taking
};

const DEFAULT_PREFS: UserPrefs = {
  studyHoursPerDay: 4,
  preferredStartTime: "09:00",
  preferredEndTime: "17:00",
  subjects: [],
};

export function getSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Omit<StudySession, "id" | "user_id" | "created_at">) {
  const sessions = getSessions();
  const newSession: StudySession = {
    ...session,
    id: crypto.randomUUID(),
    user_id: "local",
    created_at: new Date().toISOString(),
  };
  sessions.unshift(newSession);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 500))); // keep last 500
  return newSession;
}

export function getPrefs(): UserPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Partial<UserPrefs>) {
  const current = getPrefs();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  return updated;
}

export function getTotalMinutesThisWeek(): number {
  const sessions = getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  return sessions
    .filter((s) => new Date(s.start_time) >= startOfWeek)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function getStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  const daysWithStudy = new Set(
    sessions.map((s) => s.start_time.slice(0, 10))
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (daysWithStudy.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}
