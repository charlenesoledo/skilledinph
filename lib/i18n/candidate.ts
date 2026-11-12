// Every interface string on the candidate pages, in two locales.
// "tl" = the existing Taglish strings, copied exactly. "en" = plain, warm English.
// {name}-style placeholders are filled at render time, so both locales build whole sentences.
// Numbers, names, peso amounts, scores and dates are passed in as values and render the same in both.
// Module lesson content (lessons, examples, practice and test questions) is the employer's job content
// and is not in this file: it shows in its own language in both modes.

export type Locale = "tl" | "en";
export const LOCALES: Locale[] = ["tl", "en"];
export const DEFAULT_LOCALE: Locale = "tl";

const tl = {
  // Header: the line under the brand tagline on candidate pages
  taglineClarifier: "Matuto ng kulang mo. Ipasa ang test ng employer. Sa'yo ang trabaho.",

  // Journey steps
  journeyLabel: "Ang daan mo papunta sa trabaho",
  journeyAssessment: "Assessment",
  journeyGap: "Ang kulang mo",
  journeyModule: "Module",
  journeyTest: "Final test",
  journeyOffer: "Offer",
  journeySkipped: "hindi na kailangan",
  journeyDone: "tapos na",

  // Candidate home
  noCandidate: "Walang candidate dito.",
  loadSamples: "I-load ang sample data",
  greeting: "Kumusta, {name}!",
  noOpenJobs: "Wala pang bukas na job para sa'yo ngayon.",
  pay: "Sahod",
  perDayLong: "kada araw",
  noAssessment: "Wala ka pang assessment para sa job na ito. Maiikling task lang ito, hindi written exam.",
  ready: "Handa ka na!",
  readyBody: "Naabot mo ang lahat ng target ng employer. Hindi mo na kailangan ng module.",
  yourGap: "Ang kulang mo",
  yourModule: "Ang module mo: ~{hours} hours",
  moduleLocked: "Naka-lock pa ang module",
  moduleLockedBody: "Hinihintay pa ang approval ng employer. Hindi pa ito mabubuksan hangga't hindi aprubado.",
  moduleApproved: "Aprubado na ng employer ang module. {count} section lang ang para sa'yo.",
  startModule: "Simulan ang module",
  result: "Resulta",
  passMarkShort: "pasado: {pass}",
  resultSaved: "Naka-save ang resulta mo.",
  resultFallback: "Nakuha mo ang {score} sa final test. Pasado: {pass}.",
  acceptOffer: "Tanggapin ang offer",
  accepted: "Tinanggap mo na ang offer. Welcome sa team!",
  waitlistNote:
    "Puno na ang {slots} slots para sa job na ito, kaya nasa waitlist ka. Hindi pa ito garantisado. Sasabihan ka namin kapag may nabakanteng slot.",
  notYetTitle: "May daan para sa'yo",
  notYetLead: "Sa ngayon, mga ~{hours} oras pa ang kailangang aralin para sa job na ito, kaya uunahin muna natin ang",
  notYetTrack: "Foundational Track",
  notYetTail: ": mga basic na aralin sa pagbasa at pag-check ng detalye.",
  notYetAfter: "Pagkatapos noon, babalikan natin ang mga job na tulad nito. Naka-save ang resulta mo.",

  // Module section
  backToModule: "← Bumalik sa module",
  example: "Halimbawa",
  sectionDone: "Tapos mo na ang section na ito.",
  finishSection: "Tapos na ako dito",
  practiceLabel: "Practice {n}.",
  correct: "Tama!",
  tryAgain: "Subukan ulit. Tingnan ang naka-berde.",

  // Final test
  back: "← Bumalik",
  finalTest: "Final test",
  testIntro: "{count} tanong. Pasado: {pass}, itinakda ng employer.",
  questionN: "Tanong {n}",
  submitAnswers: "Ipasa ang sagot",

  // Module path
  step: "Hakbang {x} sa {y}",
  sectionsDone: "{done} sa {total} section ang tapos",
  next: "Susunod",
  done: "Tapos na ✓",
  open: "Buksan",
  practiceAgain: "Balikan para mag-practice",
  locked: "Naka-lock",
  hours: "{hours} hours",
  practice: "Practice",
  startTest: "Simulan ang final test",
  retakeTest: "Mag-retake ng final test",
  testLocked: "Final test: tapusin muna ang {left} section",

  // Offer Promise
  verified: "Verified",
  verifiedHint: "Kinumpirma ng employer ang sahod para sa job na ito",
  payPerDay: "₱{pay}/araw",
  startsOn: "simula {date}",
  guarantee: "Garantisado: ipasa ang approved test ng {employer} at sa'yo na ang offer.",
  seatsFullNote: "Puno na ang slots ngayon. Kapag pumasa ka, mapupunta ka sa waitlist at hindi pa ito garantisado.",
  noFees: "Hindi ka kailanman magbabayad para sa training o sa job na ito.",
  jobOfferFrom: "Job offer mula sa {employer}",
  waitlistFrom: "Waitlist mula sa {employer}",
  stampGuaranteed: "GUARANTEED",
  stampWaitlist: "NOT GUARANTEED · WAITLIST",
  perDay: "/ araw",
  start: "Simula: {date}",
  slotsFilled: "slots ang napunan",
  slotsFilledLabel: "Slots: {taken} sa {slots} ang napunan",
  payLabel: "₱{pay} kada araw",
  noApplication: "Walang application. Walang interview.",
  awardedTo: "Para kay {name}",
  passed: "Pumasa sa {test}",
  testFinal: "Final test · {job}",
  testAssessment: "Assessment · {job}",
  datePassed: "Petsa: {date}",

  // Final-test result message (EN mode rebuilds it from the stored result; TL shows the agent's message)
  resultPassedMsg: "Nakuha mo ang {score}. Tama ang {correct} sa {total} na tanong, at pasado ito sa itinakda ng employer na {pass}. Ang galing! Susunod: ang job offer mo.",
  resultFailedMsg: "Nakuha mo ang {score}. Tama ang {correct} sa {total} na tanong; {pass} ang kailangan ng employer. Kaunti na lang! Mag-practice muna tayo sa: {skills}.",
  resultRetakeLeft: "May isa ka pang retake pagkatapos mong balikan ang mga ito.",
  resultNoRetake: "Naka-save ang progress mo, at ituturo ka namin sa susunod na bagay na job para sa'yo.",

  // How we measured your skills
  skillCheckTitle: "Paano namin nasukat ang skills mo",
  skillCheckSub: "Sinagutan mo ito nang sumali ka sa pool. Walang pangalan, litrato, o lokasyon sa pag-score.",
  checkTaskLabel: "Task",
  checkResultLabel: "Resulta",
  checkTaskPrice: "I-check ang sample listing na ito: may mali sa presyo, sukat, at delivery fee. Hanapin ang mga ito.",
  checkTaskTone: "Piliin ang reply na ipapadala ng friendly na seller sa buyer na hindi masaya (3 pagpipilian).",
  checkTaskPrompt: "Piliin ang pinakamalinaw na instruction para sa AI helper na susulat ng product description (3 pagpipilian).",
  checkFound: "Nahanap ang {n} sa 3 mali",
  checkCorrect: "Tama ang napili",
  checkNotYet: "Hindi pa tama ang napili",
  checkScore: "Score: {score} sa 100",
  checkChip: "{score} · target {target}",

  // Course card and the other cards in the same slot
  courseTitle: "Ang kurso mo",
  courseMeta: "~{hours} oras · {count} section",
  courseProgress: "{done} sa {total} section ang tapos",
  courseParts: "Lesson · Example · {n} practice",
  courseMinutes: "~{min} minuto",
  courseTestPassed: "Final test: pasado ✓",
  readyCourse: "Hindi mo na kailangan ng kurso — pasado ka na sa lahat ng target ng job na ito.",
  foundTopic1: "Maingat na pagbasa ng product details",
  foundTopic2: "Numero at presyo",
  foundTopic3: "Friendly na Taglish replies",
  foundTopic4: "Pagsunod sa step-by-step na instructions",
  foundHours: "{h} oras",
  foundTotal: "Kabuuan: ~{h} oras",
  foundNote: "Naka-save ang resulta mo. Pag handa ka na, dito ka magsisimula.",
} as const;

export type StringKey = keyof typeof tl;

const en: Record<StringKey, string> = {
  taglineClarifier: "Learn only what you still need. Pass the employer's test. The job is yours.",

  journeyLabel: "Your path to the job",
  journeyAssessment: "Assessment",
  journeyGap: "Your gap",
  journeyModule: "Module",
  journeyTest: "Final test",
  journeyOffer: "Offer",
  journeySkipped: "not needed",
  journeyDone: "done",

  // Candidate home
  noCandidate: "There is no candidate here.",
  loadSamples: "Load the sample data",
  greeting: "Hello, {name}!",
  noOpenJobs: "There are no open jobs for you right now.",
  pay: "Pay",
  perDayLong: "per day",
  noAssessment: "You don't have an assessment for this job yet. It is a few short tasks, not a written exam.",
  ready: "You're ready!",
  readyBody: "You met all of the employer's targets. You don't need a module.",
  yourGap: "What you still need",
  yourModule: "Your module: ~{hours} hours",
  moduleLocked: "The module is still locked",
  moduleLockedBody: "We are waiting for the employer to approve it. You can open it once it is approved.",
  moduleApproved: "The employer approved the module. Only {count} sections are for you.",
  startModule: "Start the module",
  result: "Result",
  passMarkShort: "pass mark: {pass}",
  resultSaved: "Your result is saved.",
  resultFallback: "You scored {score} on the final test. Pass mark: {pass}.",
  acceptOffer: "Accept the offer",
  accepted: "You accepted the offer. Welcome to the team!",
  waitlistNote:
    "All {slots} slots for this job are filled, so you are on the waitlist. This is not guaranteed yet. We will tell you when a slot opens up.",
  notYetTitle: "There is a path for you",
  notYetLead: "Right now, you need about ~{hours} more hours of learning for this job, so we will start with the",
  notYetTrack: "Foundational Track",
  notYetTail: ": basic lessons in reading and checking details.",
  notYetAfter: "After that, we will come back to jobs like this one. Your result is saved.",

  // Module section
  backToModule: "← Back to the module",
  example: "Example",
  sectionDone: "You finished this section.",
  finishSection: "I'm done with this",
  practiceLabel: "Practice {n}.",
  correct: "Correct!",
  tryAgain: "Try again. Look at the green answer.",

  // Final test
  back: "← Back",
  finalTest: "Final test",
  testIntro: "{count} questions. Pass mark: {pass}, set by the employer.",
  questionN: "Question {n}",
  submitAnswers: "Submit my answers",

  // Module path
  step: "Step {x} of {y}",
  sectionsDone: "{done} of {total} sections done",
  next: "Next",
  done: "Done ✓",
  open: "Open",
  practiceAgain: "Go back and practice",
  locked: "Locked",
  hours: "{hours} hours",
  practice: "Practice",
  startTest: "Start the final test",
  retakeTest: "Retake the final test",
  testLocked: "Final test: finish your sections first ({left} left)",

  // Offer Promise
  verified: "Verified",
  verifiedHint: "The employer confirmed the pay for this job",
  payPerDay: "₱{pay}/day",
  startsOn: "starts {date}",
  guarantee: "Guaranteed: pass {employer}'s approved test and the offer is yours.",
  seatsFullNote: "All slots are filled right now. If you pass, you go on the waitlist, and that is not guaranteed yet.",
  noFees: "You never pay for training or for this job.",
  jobOfferFrom: "Job offer from {employer}",
  waitlistFrom: "Waitlist from {employer}",
  stampGuaranteed: "GUARANTEED",
  stampWaitlist: "NOT GUARANTEED · WAITLIST",
  perDay: "/ day",
  start: "Starts: {date}",
  slotsFilled: "slots filled",
  slotsFilledLabel: "Slots: {taken} of {slots} filled",
  payLabel: "₱{pay} per day",
  noApplication: "No application. No interview.",
  awardedTo: "For {name}",
  passed: "Passed the {test}",
  testFinal: "Final test · {job}",
  testAssessment: "Assessment · {job}",
  datePassed: "Date: {date}",

  resultPassedMsg: "You scored {score}. You answered {correct} of {total} questions correctly, above the employer's passing score of {pass}. Great work! Next: your job offer.",
  resultFailedMsg: "You scored {score}. You answered {correct} of {total} questions correctly; the employer needs {pass}. Almost there! Let's practice these first: {skills}.",
  resultRetakeLeft: "You have one more retake after you review these.",
  resultNoRetake: "Your progress is saved, and we will point you to the next job that fits you.",

  skillCheckTitle: "How we measured your skills",
  skillCheckSub: "You answered these when you joined the pool. Scoring uses no name, photo, or location.",
  checkTaskLabel: "Task",
  checkResultLabel: "Result",
  checkTaskPrice: "Check this sample listing: the price, size, and delivery fee contain errors. Find them.",
  checkTaskTone: "Choose the reply a friendly seller would send to an unhappy buyer (3 choices).",
  checkTaskPrompt: "Pick the clearest instruction to give an AI helper for writing a product description (3 choices).",
  checkFound: "Found {n} of 3 errors",
  checkCorrect: "Correct choice",
  checkNotYet: "Not the right choice yet",
  checkScore: "Score: {score} of 100",
  checkChip: "{score} · target {target}",

  courseTitle: "Your course",
  courseMeta: "~{hours} hours · {count} sections",
  courseProgress: "{done} of {total} sections done",
  courseParts: "Lesson · Example · {n} practice",
  courseMinutes: "~{min} min",
  courseTestPassed: "Final test: passed ✓",
  readyCourse: "You don't need a course — you already meet every target for this job.",
  foundTopic1: "Reading product details carefully",
  foundTopic2: "Numbers and prices",
  foundTopic3: "Friendly Taglish replies",
  foundTopic4: "Following step-by-step instructions",
  foundHours: "{h}h",
  foundTotal: "Total: ~{h} hours",
  foundNote: "Your result is saved. When you're ready, you start here.",
};

export const STRINGS: Record<Locale, Record<StringKey, string>> = { tl, en };

export type Values = Record<string, string | number>;
export function translate(locale: Locale, key: StringKey, values: Values = {}): string {
  return STRINGS[locale][key].replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
