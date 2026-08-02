import { EXAMS_2026, type Exam } from "@/data/exams";
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
  commonTopics: string[];
};

// Subjects the user does NOT take
const EXCLUDED_SUBJECTS = [
  "geography",
  "tourism",
  "accounting",
  "life sciences",
  "business studies",
  "technical sciences",
  "technical science",
];

/** Detailed guidance based on common patterns in Grade 12 / NSC past papers */
const PAST_PAPER_GUIDANCE: Record<
  string,
  { commonTopics: string[]; advice: string }
> = {
  "English HL": {
    commonTopics: [
      "Essay writing (argumentative / discursive)",
      "Transactional writing (formal letter, report, article, email)",
      "Comprehension & summary",
      "Poetry / novel / drama essay",
      "Language structures & conventions",
    ],
    advice:
      "Paper 1 = comprehension + summary + language. Paper 2 = literature (poetry + novel/drama). Paper 3 = creative + transactional writing. Past papers show that format accuracy and clear structure score highly. Practise full essays under timed conditions and memorise the required formats for letters, reports and articles.",
  },
  "Afrikaans FAL": {
    commonTopics: [
      "Begripstoets (comprehension)",
      "Opsomming (summary)",
      "Taalstrukture",
      "Literatuur (gedigte / roman / drama)",
      "Skryfwerk (opstel + transaksionele teks)",
    ],
    advice:
      "Afrikaans FAL past papers heavily test comprehension, summary and language in Paper 1. Literature and writing come later. Practise writing full transactional texts (brief, e-pos, verslag, artikel) in the correct format and complete recent comprehension papers under time pressure.",
  },
  Mathematics: {
    commonTopics: [
      "Algebra & equations",
      "Functions & graphs",
      "Calculus (differentiation + applications)",
      "Analytical geometry",
      "Trigonometry",
      "Euclidean geometry",
      "Financial maths / probability",
    ],
    advice:
      "Maths P1 repeatedly tests calculus, algebra and functions. P2 focuses on geometry, trigonometry and analytical geometry. The highest-yield activity is full timed past papers followed by careful error analysis. Spend extra time on the sections you consistently get wrong.",
  },
  "Mathematical Literacy": {
    commonTopics: [
      "Finance (interest, budgets, tariffs, inflation)",
      "Measurement & conversions",
      "Maps, plans & scale",
      "Data handling",
      "Probability",
    ],
    advice:
      "Maths Lit past papers are application-heavy. Finance, measurement and data handling appear in almost every paper. Practise full past papers and always show all working – markers award method marks even when the final answer is incorrect.",
  },
  "Technical Maths": {
    commonTopics: [
      "Algebra & equations",
      "Functions & graphs",
      "Trigonometry",
      "Analytical geometry",
      "Mensuration",
      "Technical applications",
    ],
    advice:
      "Technical Maths past papers blend pure maths with technical applications. Prioritise algebra, trigonometry and mensuration. Timed past papers are the best way to build speed and accuracy.",
  },
  "Physical Sciences": {
    commonTopics: [
      "Mechanics (Newton’s laws, momentum, work-energy)",
      "Waves, sound & light",
      "Electricity & magnetism",
      "Matter & materials",
      "Stoichiometry / chemical change",
      "Organic chemistry / rates & energy",
    ],
    advice:
      "Physical Sciences P1 (Physics) and P2 (Chemistry) repeatedly test Newton’s laws, electricity, stoichiometry and organic chemistry. Do full past papers under exam conditions. After each paper, list every question you got wrong and re-study those exact concepts immediately.",
  },
  "Engineering Graphics and Design": {
    commonTopics: [
      "Solid geometry / isometric",
      "Orthographic projection",
      "Sectional views",
      "Assembly drawings",
      "Civil / mechanical drawings",
    ],
    advice:
      "EGD past papers test accuracy, line work and speed. Practise complete past-paper questions (especially isometric, orthographic and sectional views). Time yourself strictly – many learners run out of time on the longer questions.",
  },
  "Mechanical Technology": {
    commonTopics: [
      "Safety & tools",
      "Materials",
      "Forces & calculations",
      "Joining methods",
      "Maintenance",
      "Systems & control",
    ],
    advice:
      "Mechanical Technology past papers combine theory and calculations. Focus on forces, materials and joining methods. Work through recent past papers and make sure you can clearly explain safety and maintenance procedures.",
  },
  "Life Orientation (CAT)": {
    commonTopics: [
      "Development of self",
      "Career choices",
      "Democracy & human rights",
      "Social & environmental responsibility",
      "Study skills",
    ],
    advice:
      "Life Orientation CAT is largely portfolio/task based. Ensure every task is complete, well structured and shows evidence of research and personal reflection. Previous CAT tasks and exemplars are the best guide.",
  },
};

function getGuidance(subject: string) {
  if (PAST_PAPER_GUIDANCE[subject]) return PAST_PAPER_GUIDANCE[subject];
  for (const key of Object.keys(PAST_PAPER_GUIDANCE)) {
    if (subject.includes(key) || key.includes(subject)) {
      return PAST_PAPER_GUIDANCE[key];
    }
  }
  return {
    commonTopics: ["High-frequency past paper topics", "Exam technique"],
    advice:
      "Work through recent past papers under timed conditions. After each paper, list every question you struggled with and revise those specific topics thoroughly.",
  };
}

export function getRecommendations(limit = 5): StudyRecommendation[] {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = getSessions();

  const recentBySubject: Record<string, number> = {};
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  sessions.forEach((s) => {
    if (new Date(s.start_time).getTime() > threeDaysAgo) {
      recentBySubject[s.subject] = (recentBySubject[s.subject] || 0) + s.duration_minutes;
    }
  });

  const upcoming = EXAMS_2026
    .filter((e) => e.date >= today)
    .filter((e) => !EXCLUDED_SUBJECTS.includes(e.subject.toLowerCase()))
    .map((exam) => {
      const days = daysUntil(exam.date);
      let priority: StudyRecommendation["priority"] = "medium";
      if (days <= 2) priority = "critical";
      else if (days <= 5) priority = "high";

      const guidance = getGuidance(exam.subject);
      const recentMins = recentBySubject[exam.subject] || 0;

      let reason = "";
      let suggestedAction = "";
      let suggestedMinutes = 50;

      if (days === 0) {
        reason = "Exam is TODAY";
        suggestedAction =
          "Light final review only. Skim key formulas / formats and look at 1–2 past paper questions. Do not start anything new. Rest well.";
        suggestedMinutes = 25;
      } else if (days === 1) {
        reason = "Exam is TOMORROW";
        suggestedAction = `Write one full past paper under strict timed conditions, then mark it carefully. Focus extra attention on: ${guidance.commonTopics.slice(0, 3).join(", ")}.`;
        suggestedMinutes = 90;
      } else if (days <= 3) {
        reason = `Only ${days} days left`;
        suggestedAction = `Highest priority right now: timed past papers. ${guidance.advice} Concentrate especially on: ${guidance.commonTopics.slice(0, 4).join(", ")}.`;
        suggestedMinutes = 70;
      } else if (days <= 7) {
        reason = `${days} days left – strong preparation window`;
        suggestedAction = `Mix short content revision with past-paper questions. ${guidance.advice}`;
        suggestedMinutes = 55;
      } else {
        reason = `${days} days left – build strong foundations`;
        suggestedAction = `Focus on the most frequently examined topics and start practising past-paper style questions. High-yield areas: ${guidance.commonTopics.slice(0, 4).join(", ")}.`;
        suggestedMinutes = 45;
      }

      if (recentMins < 25 && days <= 8) {
        reason += " · Little recent practice on this subject";
      }

      return {
        exam,
        priority,
        daysLeft: days,
        reason,
        suggestedAction,
        suggestedMinutes,
        pastPaperFocus: guidance.advice,
        commonTopics: guidance.commonTopics,
      };
    })
    .sort((a, b) => {
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
