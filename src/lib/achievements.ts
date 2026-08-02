import { getSessions, getStreak, getTotalMinutesThisWeek } from "./storage";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  unlocked: boolean;
  unlockedAt?: string;
};

const ACHIEVEMENTS_KEY = "study-planner-achievements";

const ALL_ACHIEVEMENTS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "first-session",
    title: "First Steps",
    description: "Complete your first Pomodoro session",
    icon: "🎯",
  },
  {
    id: "streak-3",
    title: "On a Roll",
    description: "Study 3 days in a row",
    icon: "🔥",
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Study 7 days in a row",
    icon: "💪",
  },
  {
    id: "streak-14",
    title: "Unstoppable",
    description: "Study 14 days in a row",
    icon: "🏆",
  },
  {
    id: "hours-5",
    title: "Getting Serious",
    description: "Log 5 total hours of study",
    icon: "📚",
  },
  {
    id: "hours-20",
    title: "Dedicated",
    description: "Log 20 total hours of study",
    icon: "🧠",
  },
  {
    id: "hours-50",
    title: "Exam Machine",
    description: "Log 50 total hours of study",
    icon: "⚡",
  },
  {
    id: "sessions-10",
    title: "Consistent",
    description: "Complete 10 Pomodoro sessions",
    icon: "✅",
  },
  {
    id: "sessions-50",
    title: "Grinder",
    description: "Complete 50 Pomodoro sessions",
    icon: "💎",
  },
  {
    id: "week-10h",
    title: "Big Week",
    description: "Study 10+ hours in one week",
    icon: "🌟",
  },
];

export function getAchievements(): Achievement[] {
  if (typeof window === "undefined") {
    return ALL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));
  }

  let unlockedMap: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) unlockedMap = JSON.parse(raw);
  } catch {}

  // Check current progress and unlock new ones
  const sessions = getSessions();
  const streak = getStreak();
  const totalMins = sessions.reduce((s, x) => s + x.duration_minutes, 0);
  const totalHours = totalMins / 60;
  const weekMins = getTotalMinutesThisWeek();
  const weekHours = weekMins / 60;

  const checks: Record<string, boolean> = {
    "first-session": sessions.length >= 1,
    "streak-3": streak >= 3,
    "streak-7": streak >= 7,
    "streak-14": streak >= 14,
    "hours-5": totalHours >= 5,
    "hours-20": totalHours >= 20,
    "hours-50": totalHours >= 50,
    "sessions-10": sessions.length >= 10,
    "sessions-50": sessions.length >= 50,
    "week-10h": weekHours >= 10,
  };

  const result: Achievement[] = ALL_ACHIEVEMENTS.map((a) => {
    const already = !!unlockedMap[a.id];
    const shouldUnlock = checks[a.id] || already;

    if (shouldUnlock && !already) {
      unlockedMap[a.id] = new Date().toISOString();
    }

    return {
      ...a,
      unlocked: shouldUnlock,
      unlockedAt: unlockedMap[a.id],
    };
  });

  // Save any newly unlocked
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedMap));

  return result;
}

export function getUnlockedCount(): number {
  return getAchievements().filter((a) => a.unlocked).length;
}
