# Knowledge Base — TidyNest Online (FICTITIOUS — demo employer)

*Attach this file in the Employer portal. The agent builds the job's skills, assessment, and module from this document. All details are invented for the demo.*

## 1. Company snapshot

- **Business:** TidyNest Online — an online home-goods store (Shopee, Lazada, Facebook Marketplace).
- **Team:** 6 people. The owner approves all prices. One admin packs orders.
- **What the AI does:** drafts product listings and first-draft customer replies.
- **What the human checker does:** the last pair of eyes before a listing is posted or a reply is sent. Nothing goes out unchecked.
- **Hours:** replies within shop hours, 8:00 AM – 8:00 PM, Monday to Saturday.

## 2. Product catalog (extract — prices are the single source of truth)

| SKU | Product | Price | Variants / specs | Common AI error |
|---|---|---|---|---|
| TN-001 | Storage Box 45L | ₱499 | Colors: white, gray, beige; 45 × 32 × 28 cm | Writes ₱449 from an old draft |
| TN-002 | Non-slip Hanger (10 pcs) | ₱199 | Black only; velvet finish | Says "12 pcs" |
| TN-003 | LED Motion Sensor Light | ₱349 | Warm white; USB rechargeable | Claims "solar powered" |
| TN-004 | Bamboo Bath Tray | ₱899 | 70–105 cm extendable | Omits "extendable" |
| TN-005 | Microfiber Mop Set | ₱649 | 1 handle + 3 pads | Says "5 pads" |
| TN-006 | Shoe Rack 4-Tier | ₱799 | Black metal; 80 × 30 × 92 cm | Swaps height and width |
| TN-007 | Vacuum Storage Bag (4 pcs) | ₱399 | 60 × 80 cm | Writes "6 pcs" |
| TN-008 | Kitchen Organizer Rack | ₱1,099 | Stainless; no-drill | Claims "wall-mounted with screws" |
| TN-009 | Foldable Laundry Basket | ₱299 | Gray; 38L | Writes ₱259 (old sale price) |
| TN-010 | Airtight Food Container Set | ₱549 | 6 containers + 6 lids | Says "BPA-free glass" — it is plastic |
| TN-011 | Door Hook Rack | ₱249 | 5 hooks; no-drill | Says "8 hooks" |
| TN-012 | Cable Management Box | ₱329 | White; 32 × 13 × 14 cm | Omits the size entirely |

## 3. Pricing and delivery rules

- Prices in the catalog table above are final. If a draft price differs from the catalog, **the catalog wins** — flag it, never guess.
- Delivery fee: ₱50 within Metro Manila; ₱80 to Luzon provinces; ₱120 to Visayas/Mindanao.
- **Free delivery** for orders ₱1,500 and above (Metro Manila only).
- Vouchers: WELCOME50 = ₱50 off, minimum spend ₱500. No stacking of vouchers.
- Sale prices are valid only when the owner posts them in the shop chat. Old sale prices in drafts (₱449, ₱259) are always errors.

## 4. Listing rules (every listing must have)

1. Title format: `Product Name | Key Spec | TidyNest` — e.g. "Storage Box 45L | 45×32×28 cm | TidyNest".
2. Price in the title area, body, and checkout note must match the catalog **exactly**.
3. Specs must be copied from the catalog — piece counts, sizes, and materials are the most common errors.
4. Never claim a feature the catalog does not state (no "solar", no "glass", no "BPA-free" unless listed).
5. One friendly line in Taglish is welcome; the rest stays clear and factual.

## 5. Reply tone guide

**Voice:** a kind, patient seller — *parang mabait na tindera*. Polite, clear, short. Taglish is welcome.

**Always:**
- Greet ("Kumusta po!") and thank the buyer.
- Acknowledge the problem first before explaining ("Pasensya na po sa abala…").
- Say exactly what happens next and when ("Papadalhan po namin ng kapalit bukas…").
- Use "po" with customers. Keep replies under 4 short sentences.

**Never:**
- ALL CAPS (it reads as shouting).
- Blame the buyer ("kasalanan niyo po kasi…") — never, even if true.
- Promise a refund or replacement before checking the order (see Escalation).
- Ask for payment outside the platform, or for GCash to a personal number.
- Reply in stiff, textbook English.

**Templates:**
- *Late delivery:* "Kumusta po! Pasensya na po sa delay. Na-check ko po — nasa courier na ang parcel ninyo at inaasahang darating bukas. Mag-message po ako ulit pag out for delivery na. Salamat po sa paghihintay!"
- *Damaged item:* "Kumusta po! Naku, pasensya na po sa sira. Paki-send po ng litrato ng item dito, at aayusin po namin ang kapalit o refund ayon sa inyong gusto. Salamat po sa pag-report agad."
- *Out of stock:* "Kumusta po! Ubos na po ang [variant] ngayon. May restock po sa [day]. Gusto niyo po bang i-reserve ko, o may ibang kulay po kayong gusto?"

## 6. Workflow SOP (the checker's place in the pipeline)

1. AI drafts listing/reply → 2. **Checker verifies against this KB** → 3. Owner spot-checks 1 in 10 → 4. Post/send → 5. Checker logs any error found in the Error Log sheet.
- Turnaround: listings within 2 hours; replies within 1 hour during shop hours.
- If the checker is unsure about a price or a promise: **do not send** — escalate (Section 7).

## 7. Escalation rules

Escalate to the owner (do not decide alone) when:
- The buyer asks for a refund above ₱500.
- The buyer claims the wrong item was delivered.
- A price in any system disagrees with this catalog.
- The buyer is threatening or abusive (stay kind, stop, escalate).

## 8. Quality rubric — what a good checker catches

| Check | Pass looks like |
|---|---|
| Price accuracy | Every price matches the catalog; totals add up (₱ and fees) |
| Detail accuracy | Piece counts, sizes, materials copied exactly from the catalog |
| No invented claims | Nothing promised that the catalog/KB does not state |
| Tone | Warm Taglish, "po", next step stated, under 4 sentences |
| Safety | No outside-platform payment, no personal data shared, escalations followed |

## 9. Worked examples

**GOOD listing (TN-001):** "Storage Box 45L | 45×32×28 cm | TidyNest — ₱499. Stackable, with lid. Colors: white, gray, beige." ✔ price, size, variants all match.

**BAD listing (TN-001):** "Storage Box SALE ₱449!!! 6 pcs available, glass material" ✘ old price, wrong claim, shouting. (Three errors: price, "glass", tone.)

**GOOD reply (damaged TN-005):** uses the damaged-item template, asks for a photo, offers replacement or refund. ✔

**BAD reply:** "SIR YAN PO ANG PINADALA NAMIN BAKA KAYO PO ANG NAKASIRA" ✘ caps, blame, no next step. (Three errors: caps, blame, no solution.)

## 10. FAQ (for checkers)

1. *Buyer asks "last price?"* — Prices are fixed; offer WELCOME50 if their order is ₱500+.
2. *Buyer wants COD* — Yes, COD is available on Shopee/Lazada checkouts.
3. *Item arrives broken* — Photo first, then replacement or refund (owner approves if above ₱500).
4. *Buyer gave the wrong address* — If not yet shipped, update it; if shipped, escalate.
5. *Wholesale inquiry (20+ pcs)* — Escalate to the owner for a quote.
6. *Buyer asks if TN-010 is glass* — No, it is plastic. Never say glass.
7. *Delivery to Cebu* — Visayas rate ₱120; no free delivery outside Metro Manila.
8. *Two vouchers* — Not allowed; apply the bigger one.
9. *Buyer wants to pay via personal GCash* — Never. Platform checkout only.
10. *AI draft looks perfect* — Check the numbers anyway. Numbers are where the AI fails.
