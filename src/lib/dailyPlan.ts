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
  // More than a week away
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

    const relevant = myExams.filter((e) => {
      const d = differenceInCalendarDays(parseISO(e.date), current);
      return d >= 0 && d <= 14;
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
        breakReason: "Exam day – light review of formula/definition sheet only if needed, then rest and sleep early",
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
        breakReason: "Scheduled recovery day – optional light review of one weak topic or complete rest",
        tasks: [],
        totalMinutes: 0,
      });
      continue;
    }

    const tasks: DailyTask[] = [];
    let remaining = hasExamTomorrow ? 55 : maxMinutes;

    const sorted = [...relevant].sort((a, b) => {
      const da = differenceInCalendarDays(parseISO(a.date), current);
      const db = differenceInCalendarDays(parseISO(b.date), current);
      if (da !== db) return da - db;
      return (attention[a.id] || 0) - (attention[b.id] || 0);
    });

    for (const exam of sorted) {
      if (remaining < 30) break;

      const daysLeft = differenceInCalendarDays(parseISO(exam.date), current);
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
      } else {
        minutes = Math.min(45, remaining);
        priority = "medium";
      }

      tasks.push({
        subject: exam.subject,
        examName: getExamDisplayName(exam),
        examDate: exam.date,
        focus,
        action: buildAction(getExamDisplayName(exam), focus, daysLeft, sessionNumber),
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
