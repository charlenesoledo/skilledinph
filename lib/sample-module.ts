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
      skill: R, title: "Basahin nang buo bago sumagot",
      lesson_text:
        "Basahin ang buong mensahe ng customer bago tingnan ang draft na reply. Tanungin ang sarili: ano ba talaga ang tanong? Minsan dalawa ang tanong sa isang mensahe. Tapos i-check kung sinasagot ng reply ang lahat ng iyon. Kapag maganda ang tono pero mali ang sinasagot, hindi pa rin ito pwedeng ipadala.",
      worked_example:
        'Customer: "Magkano po shipping sa Cebu, at ilang araw?" Draft: "Free shipping po sa Metro Manila!" Hindi nasagot ang Cebu at ang bilang ng araw, kaya ipaayos.',
      practice_items: [
        { skill: R, prompt: 'Customer: "Pwede po bang COD?" Draft: "Yes po, pwede ang COD."', choices: ["Tama, i-approve", "Mali, ipaayos"], correct_index: 0 },
        { skill: R, prompt: 'Customer: "May kulay gray po ba at kasya sa 40cm na drawer?" Draft: "Meron po kaming gray!"', choices: ["Kumpleto ang sagot", "Kulang: hindi nasagot ang sukat"], correct_index: 1 },
        { skill: R, prompt: 'Customer: "Paano po mag-return?" Draft: "Salamat po sa pagbili!"', choices: ["I-approve", "Ipaayos, hindi sinagot ang tanong"], correct_index: 1 },
      ],
    },
  ],
  final_test: {
    items: [
      { skill: P, prompt: 'Title: "Bamboo Drawer Organizer ₱499". Body: "₱449 only". Ano ang gagawin?', choices: ["I-approve", "I-flag: magkaiba ang presyo", "Palitan mo mismo ang presyo nang hindi nagtatanong"], correct_index: 1 },
      { skill: P, prompt: 'Title: "Set of 4 Glass Jars". Body: "Makakakuha ka ng 6 na jars". Ano ang mali?', choices: ["Dami kada set", "Tono", "Walang mali"], correct_index: 0 },
      { skill: T, prompt: "Alin ang natural na reply?", choices: ["Hello po! Opo, may stock pa. Gusto n'yo po bang i-reserve?", "Greetings. Stock is presently available for procurement.", "Meron."], correct_index: 0 },
      { skill: T, prompt: 'Draft: "We apologize for the inconvenience this may have caused." Ano ang gagawin?', choices: ["I-approve, magalang naman", "Ipaayos: gawing natural na Taglish", "Burahin at huwag nang sumagot"], correct_index: 1 },
      { skill: R, prompt: 'Customer: "Kailan darating at pwede bang palitan ang kulay?" Draft: "Darating po sa Sabado." Ano ang hatol?', choices: ["Kumpleto", "Kulang: hindi nasagot ang palit-kulay", "Mali ang tono"], correct_index: 1 },
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
