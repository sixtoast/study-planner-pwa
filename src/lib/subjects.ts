/**
 * Subjects the learner actually takes.
 */
export const ACTIVE_SUBJECTS = [
  "English HL",
  "Afrikaans FAL",
  "Engineering Graphics and Design",
  "Mechanical Technology",
  "Life Orientation (CAT)",
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
] as const;

export function isActiveSubject(subject: string): boolean {
  return ACTIVE_SUBJECTS.some(
    (s) => subject === s || subject.startsWith(s)
  );
}

/** Common high-yield topics / past-paper focus for each subject (Grade 12 level) */
export const PAST_PAPER_FOCUS: Record<string, string[]> = {
  "English HL": [
    "Essay writing (argumentative & discursive) – structure, thesis, linking",
    "Comprehension strategies + visual literacy",
    "Poetry: unseen poem technique (diction, imagery, tone, theme)",
    "Literature essay – character, theme, and contextual questions",
    "Transactional writing (letter, article, speech) formats and tone",
  ],
  "Afrikaans FAL": [
    "Begripstoets strategies + woordeskat",
    "Opsomming (summary) technique",
    "Stellen en steun / argumentatiewe opstel",
    "Ongelede gedig – beeldspraak, toon, tema",
    "Transaksionele skryfwerk (brief, artikel, toespraak)",
  ],
  "Engineering Graphics and Design": [
    "Solid geometry & sectional views",
    "Isometric & perspective drawings",
    "Machine drawings & assembly",
    "Loci and interpenetrations",
    "Civil drawings / building drawings basics",
  ],
  "Mechanical Technology": [
    "Safety and tools",
    "Materials and heat treatment",
    "Forces, stress & strain calculations",
    "Joining methods & welding symbols",
    "Maintenance and systems (pneumatics/hydraulics if applicable)",
  ],
  "Life Orientation (CAT)": [
    "Career and study choices + CV / cover letter",
    "Social and environmental responsibility",
    "Democracy, human rights and diversity",
    "Health, wellbeing and decision-making",
    "Physical Education practical component prep",
  ],
  "Mathematics": [
    "Calculus (differentiation + applications – maxima/minima, rates)",
    "Algebra & equations (exponents, logs, surds, remainder theorem)",
    "Analytical Geometry (circles, lines, angles)",
    "Trigonometry (identities, equations, 3D)",
    "Euclidean Geometry (circle geometry theorems)",
    "Financial Maths & Probability",
  ],
  "Mathematical Literacy": [
    "Finance (budgets, interest, inflation, tax, tariffs)",
    "Measurement (perimeter, area, volume, conversions)",
    "Maps, plans and scale",
    "Data handling (graphs, probability, statistics)",
    "Income-expenditure and break-even",
  ],
  "Physical Sciences": [
    "Mechanics (Newton’s laws, momentum, work-energy, projectiles)",
    "Waves, sound & light (Doppler, diffraction, 2D/3D)",
    "Electricity & magnetism (circuits, motors, generators)",
    "Matter & materials (organic chemistry, intermolecular forces)",
    "Chemical change (rates, equilibrium, acids-bases, electrochem)",
  ],
};

export function getFocusTopics(subject: string): string[] {
  for (const key of Object.keys(PAST_PAPER_FOCUS)) {
    if (subject.startsWith(key) || subject === key) {
      return PAST_PAPER_FOCUS[key];
    }
  }
  return ["Core past paper questions and weak areas"];
}
