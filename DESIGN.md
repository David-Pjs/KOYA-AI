# Koya AI — Design System

Warm, light, scholarly. The feeling of a well-made Nigerian school textbook and a senior teacher's marking pen, built with the restraint of a senior product designer. Light theme always (a classroom in daylight, a phone held in the hand). Texture and warmth are earned, never decorative.

## Color strategy: Committed

Cream paper is the field. Deep forest green carries identity and every primary action. Terracotta is the single warm accent reserved for human, active, "this is the moment" beats and the severity scale. Neutrals are warm-tinted, never gray-blue. Never `#000` / `#fff`.

OKLCH is the source of truth. Hex shown for reference only.

### Paper & ink (warm neutrals)
- `--paper`        oklch(96.5% 0.012 83)   /* #F7F3EA  main background */
- `--paper-raised` oklch(99% 0.008 83)     /* #FEFCF7  cards, inputs   */
- `--paper-sunk`   oklch(93.5% 0.014 80)   /* #ECE6D9  wells, tracks   */
- `--line`         oklch(88% 0.014 78)     /* #E0D8C8  hairlines       */
- `--ink`          oklch(24% 0.012 70)     /* #211C16  primary text    */
- `--ink-2`        oklch(44% 0.014 70)     /* #6B6155  secondary text  */
- `--ink-3`        oklch(60% 0.014 72)     /* #9A9082  muted / labels  */

### Forest green (identity + primary action)
- `--green`        oklch(38% 0.062 158)    /* #1B4332  primary         */
- `--green-deep`   oklch(31% 0.055 158)    /* #143427  hover / header   */
- `--green-ink`    oklch(27% 0.05 158)     /* on-paper green text       */
- `--green-wash`   oklch(94% 0.025 158)    /* #E7F0EA  green tint bg    */
- `--green-line`   oklch(85% 0.04 158)     /* green hairline            */

### Terracotta (the warm accent — used sparingly)
- `--terra`        oklch(60% 0.14 47)      /* #BF5B36  accent / active  */
- `--terra-deep`   oklch(52% 0.14 45)      /* pressed                   */
- `--terra-wash`   oklch(93% 0.04 60)      /* #F6E9DD  accent tint bg   */

### Severity scale (diagnosis only — semantic, not decorative)
- `--crit`   oklch(52% 0.16 33)   /* clay red    — most of the class lost */
- `--concern`oklch(64% 0.13 62)   /* ochre/amber — a real chunk struggling */
- `--ok`     oklch(48% 0.08 158)  /* forest      — manageable             */
- each has a `-wash` tint background at ~93% L.

Color rules: green is the brand and the verbs. Terracotta is feeling and focus, never more than ~10% of any screen except by deliberate intent on the reveal. Severity colors appear only where they carry meaning (counts, groups, the gap).

## Typography

- Display: **Fraunces** (opsz, SOFT, WONK axes on — characterful, slightly humane, not a cold serif). Headlines, the landing line, the diagnosis headline, big counts.
- Body / UI: **Plus Jakarta Sans**. Labels, buttons, inputs, paragraphs.
- Numbers in the diagnosis and counts use Fraunces at large optical size — numbers are characters here.

Scale (ratio ~1.25–1.3, clamp for fluid):
- display-xl  clamp(2.6rem, 1.4rem + 5vw, 4.6rem)   Fraunces 600, tracking -0.025em, line 1.05
- display-l   clamp(2rem, 1.3rem + 3vw, 3rem)
- title       1.5rem / 1.2
- body-l      1.125rem / 1.65   (reading copy, cap 68ch)
- body        1rem / 1.6
- label       0.75rem / 1, weight 700, tracking 0.08em, UPPERCASE, color --ink-3
- mono-ish counts: Fraunces 600, tabular-nums

Hierarchy comes from scale + weight contrast, not from boxing everything.

## Layout & space

- Reading column max 680px; the board questions and the reveal can break wider with intent.
- Spacing rhythm is varied, not uniform: section gaps breathe (clamp 2.5–5rem), in-component gaps are tight.
- Hairline rules (`--line`) and generous negative space do the structural work. Cards only where a thing is genuinely a discrete object (a question, a group). No nested cards. No card grid of identical tiles.
- A faint paper grain over `--paper` (SVG noise, ~3% opacity) gives the textbook warmth. One subtle hand-drawn underline (terracotta) under the key landing word — earned, used once.

## Motion (the reveal is the emotional peak)

- Ease-out only, exponential (cubic-bezier(0.16, 1, 0.3, 1)). No bounce.
- Entrances: 16px rise + fade, 450ms, staggered for lists.
- The diagnosis reveal is a sequence, not a page swap: Koya "reads the papers" (a short, honest scanning beat showing it working across the 5 questions), then the dominant count *counts up* in Fraunces and lands, then the root-gap line writes in, then the three groups settle in. This beat is the demo.
- Never animate layout properties; transform/opacity/clip-path only.

## Components

- **Button (primary):** solid `--green`, paper-colored text, no shadow, firm radius (12px), confident padding. Hover → `--green-deep`, 150ms.
- **Button (quiet):** paper-raised, `--green` text, `--line` border.
- **Count stepper:** large tap targets (≥44px), the number in Fraunces, border + wash shifts to the live severity color as a value is entered.
- **Question object:** paper-raised, full hairline border (never a side stripe), a leading numeral in a green disc, two small meta chips (skill tested / prerequisite source).
- **Group card (Foundation/Core/Advanced):** the count is the hero in Fraunces, severity-colored; description and the one activity beneath; activity expandable.
- **Severity bar:** track is `--paper-sunk`, fill is the semantic severity color, width animates.

## Absolute bans (this product specifically)

- No fake trust stats, ever (no "% passed WAEC", no "10,000 teachers"). The product has no users yet; pretending is disqualifying per the brief's own honesty.
- No blue/purple gradients, no glassmorphism, no hero-metric template, no identical card grids, no side-stripe accents, no gradient text, no em dashes, no exclamation-mark hype.
- No assumption of student devices or classroom internet anywhere in the UI copy or flow.
