// Built-in, keyed assessment items for the sample job (spec Section 9): 6 mini-tasks, one correct answer each.
import type { KeyedItem } from "./types";

export const SAMPLE_ASSESSMENT_ITEMS: KeyedItem[] = [
  { skill: "Price & Detail Accuracy", prompt: 'Title: "Bamboo Drawer Organizer ₱499". Body: "Sale price ₱449 lang!" Ano ang mali?',
    choices: ["Magkaiba ang presyo sa title at body", "Mali ang pangalan ng produkto", "Walang mali"], correct_index: 0 },
  { skill: "Price & Detail Accuracy", prompt: 'Title: "Set of 4 Glass Jars". Body: "Makakakuha ka ng 6 na jars." Ano ang mali?',
    choices: ["Presyo", "Dami kada set", "Walang mali"], correct_index: 1 },
  { skill: "Taglish Tone Judgment", prompt: 'Customer: "Available pa po?" Alin ang mas natural na reply?',
    choices: ["Affirmative. The said item remains in stock.", "Yes po, available pa! Ilan po ang kukunin n'yo?"], correct_index: 1 },
  { skill: "Taglish Tone Judgment", prompt: "Alin sa mga reply ang dapat ipaayos?",
    choices: ["Salamat po sa order! Ipapadala namin bukas.", "Kindly be advised that your parcel shall be dispatched."], correct_index: 1 },
  { skill: "Prompt Judgment", prompt: "Alin ang mas malinaw na utos sa AI para sa product description?",
    choices: ['"Sumulat ng 3-pangungusap na description sa Taglish para sa Bamboo Basket, ₱650. Huwag baguhin ang presyo."', '"Gawan mo ng description."'], correct_index: 0 },
  { skill: "Prompt Judgment", prompt: 'Utos sa AI: "Sumulat ng description para sa Pillow Cover." Ano ang kulang?',
    choices: ["Walang kulang", "Haba, tono, at ang presyo at sukat na hindi dapat baguhin", "Pangalan ng customer"], correct_index: 1 },
];
