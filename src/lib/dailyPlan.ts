import { EXAMS_2026, getExamDisplayName } from "@/data/exams";
import { isActiveSubject, getFocusTopics } from "./subjects";
import { addDays, format, parseISO, differenceInCalendarDays } from "date-fns";

export type DailyTask = {
  subject: string;
  examName: string;
  examDate: string;
  focus: string;
  action: string;
  minutes: number;
  priority: "critical" | "high" | "medium";
};

export type DayPlan = {
  date: string;
  dayLabel: string;
  isBreak: boolean;
  breakReason?: string;
  tasks: DailyTask[];
  totalMinutes: number;
};

/** Higher number = start earlier and get more sessions */
function getDifficultyWeight(subject: string): number {
  const s = subject.toLowerCase();
  if (s.includes("mathematics") && !s.includes("literacy")) return 5; // Pure Maths
  if (s.includes("physical sciences")) return 5;
  if (s.includes("engineering graphics") || s.includes("egd")) return 4;
  if (s.includes("technical maths")) return 4;
  if (s.includes("mechanical")) return 3;
  if (s.includes("english")) return 3;
  if (s.includes("afrikaans")) return 3;
  if (s.includes("mathematical literacy")) return 2;
  if (s.includes("life orientation")) return 1;
  return 2;
}

function buildAction(
  examName: string,
  focus: string,
  daysLeft: number,
  sessionNumber: number
): string {
  if (daysLeft <= 1) {
    return `Final prep for ${examName}. Spend 20 min on a mixed set of past-paper questions that test ${focus}. Then spend 10 min reviewing only the formulas/key points you still hesitate on. Stop and rest.`;
  }
  if (daysLeft <= 3) {
    return `Timed past-paper session for ${examName}: complete a full section (or full paper if short) focused on ${focus}. Use real exam timing. Immediately mark with the memo, write every mistake in a notebook, and re-do the incorrect questions until clean.`;
  }
  if (daysLeft <= 7) {
    if (sessionNumber % 2 === 0) {
      return `Past-paper drill on ${focus}: select 5–7 questions from recent NSC/prelim papers. Time yourself (approx 6–8 min per question). Mark at once and correct every error using the official method.`;
    }
    return `Active practice on ${focus} for ${examName}: 12 min reviewing the exact method/steps, then immediately complete 5 past-paper questions under light time pressure. Mark and fix gaps.`;
  }
  // More than a week away – still concrete
  if (sessionNumber % 3 === 0) {
    return `Introduce ${focus} with past papers: review core steps for 10–12 min, then attempt 4 past-paper questions. Study how the memo awards marks so you know what examiners look for.`;
  }
  return `Master ${focus}: write a 5-line summary of the key method in your own words, then complete 5 past-paper questions. Check answers and note anything still unclear for next session.`;
}

export function generateDailyTimetable(options?: {
  maxMinutesPerDay?: number;
  startDate?: string;
}): DayPlan[] {
  const maxMinutes = options?.maxMinutesPerDay ?? 180;
  const start = options?.startDate ?? format(new Date(), "yyyy-MM-dd");
  const startDate = parseISO(start);

  const myExams = EXAMS_2026
    .filter((e) => isActiveSubject(e.subject) && e.date >= start)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (myExams.length === 0) return [];

  const lastExamDate = parseISO(myExams[myExams.length - 1].date);
  const totalDays = differenceInCalendarDays(lastExamDate, startDate) + 1;

  const plans: DayPlan[] = [];
  const attention: Record<string, number> = {};
  myExams.forEach((e) => (attention[e.id] = 0));

  for (let i = 0; i < totalDays; i++) {
    const current = addDays(startDate, i);
    const dateStr = format(current, "yyyy-MM-dd");
    const dayLabel = format(current, "EEEE d MMM");

    // Consider ALL remaining exams (not just 14 days)
    // but give higher weight once they are inside the 10–14 day window
    const remainingExams = myExams.filter((e) => {
      const d = differenceInCalendarDays(parseISO(e.date), current);
      return d >= 0;
    });

    const isExamDay = myExams.some((e) => e.date === dateStr);
    const hasExamTomorrow = myExams.some(
      (e) => differenceInCalendarDays(parseISO(e.date), current) === 1
    );
    const isScheduledBreak = i > 0 && i % 6 === 0;

    if (isExamDay) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason:
          "Exam day – light review of formula/definition sheet only if needed, then rest and sleep early",
        tasks: [],
        totalMinutes: 0,
      });
      continue;
    }

    if (isScheduledBreak && !hasExamTomorrow) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason:
          "Scheduled recovery day – optional light review of one weak topic or complete rest",
        tasks: [],
        totalMinutes: 0,
      });
      continue;
    }

    const tasks: DailyTask[] = [];
    let remaining = hasExamTomorrow ? 55 : maxMinutes;

    // Smart sort:
    // 1. Critical exams (≤3 days) first
    // 2. Then exams that are within 10 days and still have low attention (force early coverage)
    // 3. Then higher difficulty subjects
    // 4. Then least attention overall
    const sorted = [...remainingExams].sort((a, b) => {
      const da = differenceInCalendarDays(parseISO(a.date), current);
      const db = differenceInCalendarDays(parseISO(b.date), current);

      const aCritical = da <= 3 ? 0 : 1;
      const bCritical = db <= 3 ? 0 : 1;
      if (aCritical !== bCritical) return aCritical - bCritical;

      // Force subjects that are ≤10 days away and have almost no sessions yet
      const aNeedsEarly = da <= 10 && (attention[a.id] || 0) < 2 ? 0 : 1;
      const bNeedsEarly = db <= 10 && (attention[b.id] || 0) < 2 ? 0 : 1;
      if (aNeedsEarly !== bNeedsEarly) return aNeedsEarly - bNeedsEarly;

      // Prefer harder subjects when both are still far
      const diffA = getDifficultyWeight(a.subject);
      const diffB = getDifficultyWeight(b.subject);
      if (diffA !== diffB) return diffB - diffA;

      // Then least attention
      const attA = attention[a.id] || 0;
      const attB = attention[b.id] || 0;
      if (attA !== attB) return attA - attB;

      // Finally closest exam
      return da - db;
    });

    for (const exam of sorted) {
      if (remaining < 30) break;

      const daysLeft = differenceInCalendarDays(parseISO(exam.date), current);

      // Don't schedule very early for easy subjects (save time for hard ones)
      const weight = getDifficultyWeight(exam.subject);
      if (daysLeft > 14 && weight <= 2 && (attention[exam.id] || 0) >= 1) {
        continue; // LO etc. don't need many early sessions
      }

      // Hard subjects must start getting sessions once inside 12 days
      // (even if other exams are closer)
      if (daysLeft > 18 && weight >= 4 && (attention[exam.id] || 0) >= 2) {
        continue; // already gave them early attention
      }

      const topics = getFocusTopics(exam.subject);
      const topicIndex = (attention[exam.id] || 0) % topics.length;
      const focus = topics[topicIndex];
      const sessionNumber = attention[exam.id] || 0;

      let minutes = 45;
      let priority: DailyTask["priority"] = "medium";

      if (daysLeft <= 1) {
        minutes = Math.min(40, remaining);
        priority = "critical";
      } else if (daysLeft <= 3) {
        minutes = Math.min(65, remaining);
        priority = "critical";
      } else if (daysLeft <= 7) {
        minutes = Math.min(55, remaining);
        priority = "high";
      } else if (daysLeft <= 12 && weight >= 4) {
        // Hard subjects get solid sessions even 8–12 days out
        minutes = Math.min(50, remaining);
        priority = "high";
      } else {
        minutes = Math.min(45, remaining);
        priority = "medium";
      }

      tasks.push({
        subject: exam.subject,
        examName: getExamDisplayName(exam),
        examDate: exam.date,
        focus,
        action: buildAction(
          getExamDisplayName(exam),
          focus,
          daysLeft,
          sessionNumber
        ),
        minutes,
        priority,
      });

      attention[exam.id] = (attention[exam.id] || 0) + 1;
      remaining -= minutes;
    }

    if (tasks.length === 0) {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: true,
        breakReason: "Light day – optional review or rest",
        tasks: [],
        totalMinutes: 0,
      });
    } else {
      plans.push({
        date: dateStr,
        dayLabel,
        isBreak: false,
        tasks,
        totalMinutes: tasks.reduce((s, t) => s + t.minutes, 0),
      });
    }
  }

  return plans;
}
