// Built-in Module Builder output for the sample job (spec Section 9): 3 sections, each with one short
// Taglish lesson, one worked example from the employer's good/bad examples, and 3 keyed practice items.
// Final test: 5 keyed items. Proposed passing score: 80.
import type { KeyedItem } from "./types";

type SectionDraft = { skill: string; title: string; lesson_text: string; worked_example: string; practice_items: KeyedItem[] };
const P = "Price & Detail Accuracy", T = "Taglish Tone Judgment", R = "Prompt Judgment";

export const SAMPLE_MODULE: {
  sections: SectionDraft[]; final_test: { items: KeyedItem[]; rubric: string[] }; proposed_passing_score: number;
} = {
  sections: [
    {
      skill: P, title: "Presyo at detalye: tatlong beses i-check",
      lesson_text:
        "Mabilis magsulat ang AI, pero madalas itong magkamali sa presyo. Bago mo i-approve ang listing, i-check ang presyo sa tatlong lugar: sa title, sa body, at sa variant. Dapat pareho lahat. Sunod, i-check ang pangalan ng produkto, sukat, kulay, at dami kada set. Kapag may isang hindi tugma, huwag i-approve. I-flag at isulat kung ano mismo ang mali, para maayos agad.",
      worked_example:
        'Title: "Bamboo Drawer Organizer, ₱499". Body: "Sale price ₱449 lang!" Hindi tugma ang ₱499 at ₱449, kaya FLAG. Isulat: "Magkaiba ang presyo sa title at body."',
      practice_items: [
        { skill: P, prompt: 'Title: "Linen Storage Basket ₱350". Body: "₱350, set of 2". Variant: "₱350". Ano ang gagawin mo?', choices: ["I-approve, tugma ang presyo", "I-flag, mali ang presyo"], correct_index: 0 },
        { skill: P, prompt: 'Title: "Kawayan Dish Rack, 2-tier". Body: "Matibay na 3-tier rack". Ano ang mali?', choices: ["Presyo", "Bilang ng tier", "Walang mali"], correct_index: 1 },
        { skill: P, prompt: 'Title: "₱280". Body: "₱208". Ano ang tamang gawin?', choices: ["Piliin ang mas mura at i-post", "I-flag at ipa-confirm ang tamang presyo", "I-approve na lang"], correct_index: 1 },
      ],
    },
    {
      skill: T, title: "Natural na Taglish: parang totoong tindera",
      lesson_text:
        'Ang magandang reply ay parang kausap mo ang isang mabait na seller: magalang, malinaw, at maikli. Iwasan ang matigas na English na parang sulat ng opisina. Iwasan din ang sobrang lalim na Tagalog. Gamitin ang "po" nang natural, sagutin agad ang tanong, at sabihin ang susunod na hakbang. Kapag binasa mo nang malakas at parang hindi sasabihin ng totoong tao, ipaayos.',
      worked_example:
        'Matigas: "We regret to inform you that the item is currently unavailable." Natural: "Hi po! Pasensya na, out of stock pa po ito ngayon. May bagong dating po sa Friday."',
      practice_items: [
        { skill: T, prompt: 'Alin ang mas natural na reply sa "Available pa po?"', choices: ["Yes po, available pa! Ilan po ang kukunin n'yo?", "Affirmative. The said item remains in stock."], correct_index: 0 },
        { skill: T, prompt: "Alin ang dapat ipaayos?", choices: ["Salamat po sa order! Ipapadala namin bukas.", "Kindly be advised that your parcel shall be dispatched."], correct_index: 1 },
        { skill: T, prompt: "Late ang delivery. Alin ang pinakamagandang reply?", choices: ["Hindi namin kasalanan iyon.", "Pasensya na po sa abala! Na-check ko po, darating na bukas.", "Your concern has been noted."], correct_index: 1 },
      ],
    },
    {
      skill: R, title: "Malinaw na utos sa AI: sabihin kung ano, para kanino, at gaano kahaba",
      lesson_text:
        "Ang AI ay sumusunod lang sa utos mo, kaya kapag malabo ang utos, malabo rin ang lalabas. Ang malinaw na instruction ay may tatlong bahagi: ano ang isusulat, para kanino, at gaano kahaba o anong format. Isama rin ang mga detalyeng hindi dapat baguhin, gaya ng presyo at sukat. Kapag kulang ang isa sa mga ito, mas malamang na magkamali ang draft.",
      worked_example:
        'Malabo: "Gawan mo ng description ang basket." Malinaw: "Sumulat ng 3-pangungusap na product description sa natural na Taglish para sa Bamboo Laundry Basket, ₱650, 45 × 35 cm. Huwag baguhin ang presyo at sukat." Ang pangalawa ang pipiliin.',
      practice_items: [
        { skill: R, prompt: "Alin ang mas malinaw na utos sa AI?", choices: ['"Ayusin mo ito."', '"Gawing natural na Taglish ang reply na ito, 2 pangungusap lang, at huwag baguhin ang presyo."'], correct_index: 1 },
        { skill: R, prompt: 'Utos: "Sumulat ng product description para sa Glass Jar Set." Ano ang kulang?', choices: ["Walang kulang", "Haba, para kanino, at ang presyo at dami kada set"], correct_index: 1 },
        { skill: R, prompt: 'Utos: "Sumulat ng 3-pangungusap na description sa Taglish para sa Cotton Pillow Cover, ₱180, 45 × 45 cm. Huwag baguhin ang presyo." Ano ang hatol?', choices: ["Malinaw, gamitin", "Malabo, ipaayos"], correct_index: 0 },
      ],
    },
  ],
  final_test: {
    items: [
      { skill: P, prompt: 'Title: "Bamboo Drawer Organizer ₱499". Body: "₱449 only". Ano ang gagawin?', choices: ["I-approve", "I-flag: magkaiba ang presyo", "Palitan mo mismo ang presyo nang hindi nagtatanong"], correct_index: 1 },
      { skill: P, prompt: 'Title: "Set of 4 Glass Jars". Body: "Makakakuha ka ng 6 na jars". Ano ang mali?', choices: ["Dami kada set", "Tono", "Walang mali"], correct_index: 0 },
      { skill: T, prompt: "Alin ang natural na reply?", choices: ["Hello po! Opo, may stock pa. Gusto n'yo po bang i-reserve?", "Greetings. Stock is presently available for procurement.", "Meron."], correct_index: 0 },
      { skill: T, prompt: 'Draft: "We apologize for the inconvenience this may have caused." Ano ang gagawin?', choices: ["I-approve, magalang naman", "Ipaayos: gawing natural na Taglish", "Burahin at huwag nang sumagot"], correct_index: 1 },
      { skill: R, prompt: "Alin ang pinakamalinaw na utos sa AI para sa product description ng Ceramic Mug Set?", choices: ['"Gawan mo ng description."', '"Sumulat ng 3-pangungusap na description sa natural na Taglish para sa Ceramic Mug Set, ₱399, 4 piraso. Huwag baguhin ang presyo."', '"Description ng mug, gandahan mo."'], correct_index: 1 },
    ],
    rubric: [
      "Price matches in the title, body, and variant",
      "Product name, size, and count are correct",
      "Reply sounds like natural Taglish",
      "Reply answers every question the customer asked",
    ],
  },
  proposed_passing_score: 80,
};
