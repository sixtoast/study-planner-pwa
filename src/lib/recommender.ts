import { EXAMS_2026, getExamDisplayName, type Exam } from "@/data/exams";
import { daysUntil } from "./utils";
import { getSessions } from "./storage";

export type StudyRecommendation = {
  exam: Exam;
  priority: "critical" | "high" | "medium";
  daysLeft: number;
  reason: string;
  suggestedAction: string;
  suggestedMinutes: number;
  pastPaperFocus: string;
};

/**
 * Smart recommender: tells the learner exactly what to study right now,
 * prioritising exams that are closest, and emphasising past-paper practice
 * (the most effective Grade 12 preparation method).
 */
export function getRecommendations(limit = 5): StudyRecommendation[] {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = getSessions();

  // How much time already spent on each subject recently
  const recentBySubject: Record<string, number> = {};
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  sessions.forEach((s) => {
    if (new Date(s.start_time).getTime() > threeDaysAgo) {
      recentBySubject[s.subject] = (recentBySubject[s.subject] || 0) + s.duration_minutes;
    }
  });

  const upcoming = EXAMS_2026
    .filter((e) => e.date >= today)
    .map((exam) => {
      const days = daysUntil(exam.date);
      let priority: StudyRecommendation["priority"] = "medium";
      if (days <= 2) priority = "critical";
      else if (days <= 5) priority = "high";

      const recentMins = recentBySubject[exam.subject] || 0;

      let reason = "";
      let suggestedAction = "";
      let suggestedMinutes = 45;
      let pastPaperFocus = "";

      if (days === 0) {
        reason = "Exam is TODAY";
        suggestedAction = "Light review only – formulas, key definitions, and one quick past paper question. Rest your mind.";
        suggestedMinutes = 30;
        pastPaperFocus = "Quick scan of 1–2 past paper questions (do not start a full paper).";
      } else if (days === 1) {
        reason = "Exam is TOMORROW";
        suggestedAction = "Full past paper under timed conditions, then mark it and review mistakes.";
        suggestedMinutes = 90;
        pastPaperFocus = "Write one full past paper (most recent prelim or final if possible) under exam conditions.";
      } else if (days <= 3) {
        reason = `Only ${days} days left`;
        suggestedAction = "Focus on past papers and weak topics. Timed practice is the highest-value activity now.";
        suggestedMinutes = 60;
        pastPaperFocus = "Do at least one full past paper section or a full paper if time allows.";
      } else if (days <= 7) {
        reason = `${days} days left – solid preparation window`;
        suggestedAction = "Mix content revision with past paper questions. Identify weak areas.";
        suggestedMinutes = 50;
        pastPaperFocus = "Past paper questions on the topics you find hardest.";
      } else {
        reason = `${days} days left – build foundations`;
        suggestedAction = "Revise core content and start introducing past paper style questions.";
        suggestedMinutes = 45;
        pastPaperFocus = "Practice selected past paper questions after revising the theory.";
      }

      // Boost priority if the learner has not studied this subject recently
      if (recentMins < 30 && days <= 7) {
        reason += " · You haven’t practised this subject much in the last 3 days";
      }

      return {
        exam,
        priority,
        daysLeft: days,
        reason,
        suggestedAction,
        suggestedMinutes,
        pastPaperFocus,
      };
    })
    .sort((a, b) => {
      // Critical first, then by days left, then by least recent study
      const pOrder = { critical: 0, high: 1, medium: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return a.daysLeft - b.daysLeft;
    });

  return upcoming.slice(0, limit);
}

export function getTopRecommendation(): StudyRecommendation | null {
  const recs = getRecommendations(1);
  return recs[0] || null;
}
