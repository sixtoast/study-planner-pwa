/**
 * Subjects the learner actually takes.
 */
export const ACTIVE_SUBJECTS = [
  "English HL",
  "Afrikaans FAL",
  "Engineering Graphics and Design",
  "Mechanical Technology",
  "Mathematics",
  "Physical Sciences",
] as const;

export function isActiveSubject(subject: string): boolean {
  return ACTIVE_SUBJECTS.some(
    (s) => subject === s || subject.startsWith(s)
  );
}

/**
 * High-yield final exam topics based on typical NSC / past-paper patterns.
 * Ordered roughly by frequency and importance.
 */
export const PAST_PAPER_FOCUS: Record<string, string[]> = {
  "English HL": [
    "P3 Essay writing (argumentative & discursive) – structure, thesis, linking devices",
    "P3 Transactional writing (formal letter, article, speech, report) – formats and tone",
    "P1 Comprehension strategies + visual literacy + summary",
    "P1 Language structures & conventions (editing, rewriting)",
    "P2 Poetry: unseen poem technique (diction, imagery, tone, theme, structure)",
    "P2 Literature essay – character, theme, and contextual questions (set works)",
  ],
  "Afrikaans FAL": [
    "P3 Stellen en steun / argumentatiewe opstel – struktuur en bewyse",
    "P3 Transaksionele skryfwerk (brief, artikel, toespraak, verslag) – formate",
    "P1 Begripstoets strategies + woordeskat + opsomming",
    "P1 Taalstrukture en -konvensies",
    "P2 Ongelede gedig – beeldspraak, toon, tema, struktuur",
    "P2 Literatuur opstel – karakter, tema, kontekstuele vrae (voorgeskrewe werke)",
  ],
  "Engineering Graphics and Design": [
    "Solid geometry & sectional views (P1/P2)",
    "Isometric & perspective drawings",
    "Machine drawings & assembly drawings",
    "Loci and interpenetrations",
    "Civil / building drawings basics",
    "Orthographic projection accuracy and line work",
  ],
  "Mechanical Technology": [
    "Safety and tools (theory + application)",
    "Materials and heat treatment",
    "Forces, stress & strain calculations",
    "Joining methods & welding symbols",
    "Maintenance and systems (pneumatics/hydraulics if in your curriculum)",
  ],
  "Mathematics": [
    "Calculus (differentiation + applications – maxima/minima, rates of change)",
    "Algebra & equations (exponents, logs, surds, remainder/factor theorem)",
    "Analytical Geometry (circles, lines, angles, tangents)",
    "Trigonometry (identities, equations, 2D/3D problems)",
    "Euclidean Geometry (circle geometry theorems and proofs)",
    "Financial Maths & Probability",
  ],
  "Physical Sciences": [
    // Physics-heavy (P1)
    "Mechanics – Newton’s laws, momentum, work-energy theorem, projectiles",
    "Waves, sound & light – Doppler effect, diffraction, 2D/3D wave problems",
    "Electricity & magnetism – circuits, motors, generators, electromagnetic induction",
    // Chemistry-heavy (P2)
    "Matter & materials – organic chemistry (reactions, functional groups), intermolecular forces",
    "Chemical change – rates of reaction, chemical equilibrium, acids-bases, electrochemistry",
    "Stoichiometry and quantitative chemistry calculations",
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
