---
name: "Greg Iteen — Brand"
accent: "#ff6a00"
style: "Stamped wordmark, black & white, one accent color"
site:
  name: "Cyanotype specimen sheet"
  colors:
    ink: "#061f3a"
    ink-2: "#0a2c50"
    line: "rgba(156,199,232,0.22)"
    paper: "#eaf3fa"
    dim: "#8fb0cb"
    signal: "#ff6a00"
  typography:
    display: "Anybody (variable width 50-150, weight 100-900)"
    body: "Hanken Grotesk 400/500/600"
    mono: "Martian Mono 300-600, uppercase labels"
  spacing:
    gutter: "clamp(20px, 5vw, 72px)"
    max-width: "1320px"
  motion:
    hero: "Per-glyph width sweep on load; glyph width answers the pointer afterwards"
    field: "Registration crosses displaced by the pointer, spring home, and leave orange traces while displaced"
    reveal: "Diagrams draw their strokes on scroll; sections rise once"
    reduced: "prefers-reduced-motion removes all of it; the page is complete without it"

---

# Brand Design System

The canonical visual identity for gregiteen.xyz and everything under the
brand — the portfolio, the mail client, proposal/signing pages, PDFs. This
supersedes any ad-hoc palette a given page invented on its own (several
pages drifted to a red `#e22b22` accent that doesn't match the real
logo — see "History" below).

## Logo

The wordmark is `greg.iteen`, lowercase, set in a hand-stamped/typewriter
slab-serif with visible ink texture — not a clean geometric sans. The
accent is a single inked dot standing in for the domain's `.` between
`greg` and `iteen`.

Source files, all in `static/`:

| File | Text | Dot | Background | Use |
|---|---|---|---|---|
| `gi-logo.png` / `gi-logo-dark.png` (identical) | white | orange | solid black | Dark pages where a rectangular logo block is fine (e.g. email headers) |
| `gi-logo-light.png` | black | orange | solid white | Light pages, same constraint |
| `gi-logo-wb.png` | white | — (mono) | solid black | Dark pages, monochrome-only contexts |
| `gi-logo-bw.png` | black | — (mono) | solid white | Light pages, monochrome-only contexts |
| `gi-logo-transparent.png` | black | orange | transparent | **Preferred for light backgrounds** — drops onto any light surface |
| `gi-logo-transparent-dark.png` | white | orange | transparent | **Preferred for dark backgrounds** — drops onto any dark surface (this is the one splash/verify/consult/sign/webmail use) |

Default to a transparent variant unless you specifically need a hard-edged
logo block. Never recolor the wordmark or dot programmatically (e.g. CSS
`filter: invert()`) when a purpose-made variant already exists — that was
a shortcut taken early on and produced a flattened, less legible mark.

### Favicon

The wordmark doesn't work as a favicon (too wide, illegible at 16–32px).
Use the square `g.i` monogram instead — same stamped serif, same orange
dot, in `assets/`: `favicon.png`/`favicon-dark.png` (identical, white+orange
on black — the default), `favicon-light.png` (black+orange on white),
`favicon-bw.png`/`favicon-wb.png` (monochrome). Every page should link
`assets/favicon.png` (absolute `https://gregiteen.xyz/assets/favicon.png`
from `mail.gregiteen.xyz`, which can't reach the main site's own static
routes).

## Color

Two neutrals, one accent. That's the whole palette — resist adding a
second accent color.

| Token | Value | Use |
|---|---|---|
| `--black` | `#0a0a0a` | Primary background |
| `--white` | `#f5f5f3` | Primary foreground / text |
| `--accent` | `#ff6a00` | The one color — CTAs, links, active states, the logo dot. Sampled directly from the logo file, not eyeballed. |
| `--gray` | `rgba(245,245,243,.55)` | Secondary text |
| `--faint` | `rgba(245,245,243,.22)` | Placeholder text, disabled states |
| `--line` | `rgba(245,245,243,.28)` | Borders, dividers |

Light-mode surfaces (PDFs, printed material) invert this: white
background, near-black text (`#111111`), same orange accent.

## Typography

- **Display / body:** Archivo (400/500/600) and Archivo Black for headlines.
- **Labels, mono accents, metadata:** IBM Plex Mono (400/500), uppercase,
  letter-spacing ~0.1–0.28em for small labels.
- **Print (PDF letterhead):** Courier-Bold for the wordmark echo (`greg.iteen`
  set in monospace to survive a font-less PDF context), Helvetica for body copy.

This pairing — a geometric grotesk for scale, a monospace for detail — is
established across the site (`static/consult.html`, `/sign/:id`, the
webmail app) and should stay the load-bearing type system. The stamped
serif lives only in the logo mark itself; it isn't a body/heading font.

## Voice

Direct, technical, a little dry. Copy reads like documentation, not sales
copy — headlines state what's true ("Your access code", "Design it your
way") rather than what's exciting.

## Where this applies

Every surface a client or visitor touches should read as one brand:

- `static/splash.html`, `static/verify.html` — the auth entry points
- `static/consult.html` — the intake/proposal funnel
- `/sign/:proposalId` (`scripts/serve.mjs`) — the branded handoff to Documenso
- `mail.gregiteen.xyz` (`scripts/lib/webmail-ui.mjs`) — the webmail client
- Proposal PDFs (`scripts/lib/letterhead.mjs`) and the rate card PDF
  (`scripts/generate-rate-card-pdf.mjs`)
- Documenso's own branding settings (logo, colors, site link — configured
  in its admin UI, not in this repo, but should match this doc)

The per-visitor AI-generated design layers under `designs/*/DESIGN.md` are
a different, deliberately separate system — those are demos of the site's
own generative-design capability, not the Greg Iteen brand itself, and
should keep varying freely.

## History

This file previously documented a "Bauhaus Minimalist" theme (red
`#E22B22`, `-apple-system` sans) that was never actually the brand — it
was an early default skin's auto-generated design spec that got left at
the repo root and then copied by hand into a few pages (`consult.html`,
the sign wrapper, webmail) without checking it against the real logo
files. Rewritten to match the actual authored brand mark.

## Personal site (2026-09)

The public site at gregiteen.xyz is a set of specimen sheets on cyanotype paper. The reference is engineering documentation, chosen because the work is specifications and file formats: deep prussian ground, pale drafting linework, registration crosses in a grid.

**Why this and not the usual answers.** A dark page with one acid accent and a warm cream serif page are the two defaults. This uses a single ink colour and the brand's own orange dot (from the `greg.iteen` wordmark) as the only signal: it marks live sites, the traces the pointer leaves, and the ends of the diagrams. Orange never appears as decoration.

**Type.** Anybody is a variable-width grotesque. Width is the design's instrument: the headline is set letter by letter and each glyph widens as the pointer approaches, then relaxes. Hanken Grotesk carries the body; Martian Mono sets the labels and every fact that is a date, status or command.

**Motion, one idea.** The background field is memory made visible: marks are pushed off their positions and always return to them. That is what the projects do with data. Everything else is quiet: hairline rules, diagrams that draw once, an image of each deployed site that follows the pointer over its row.

**Structure is information.** No numbered markers, because nothing here is a sequence. Rows carry facts: host, HTTP status and the date it was checked, year, role, stack.

**Copy.** Dry, exact, unhyped. No emoji, no product-marketing verbs, no claims that were not checked. Licences and metrics appear only where they are true and dated.

**Rules for changes.** Mobile-first CSS with `min-width` queries only; 44px minimum targets; every animation has a `prefers-reduced-motion` fallback; content comes from vault documents (`x_kind`: `idea`, `deployed-site`, `open-source`, `project`, `section`); tests in `test/personal-render.test.mjs` enforce the copy and link rules.

