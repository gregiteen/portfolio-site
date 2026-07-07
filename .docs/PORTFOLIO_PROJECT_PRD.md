# Portfolio Site — Product Requirements Document

## What This Is

An AI-powered interactive portfolio and lead generation engine for Greg Iteen. Visitors arrive at a splash page, choose a design style, verify their email, and the site generates a bespoke visual skin of Greg's portfolio on the fly. The generated design is a full standalone build — not a CSS toggle — and the flipper lets visitors swap between generated designs by loading entirely different HTML builds of the same page via View Transitions.

The design generation gimmick is the hook. It captures visitor emails, demonstrates technical capability, and funnels prospects toward an AI-powered client needs assessment (CNA) that generates proposals.

## The Visitor Journey

### 1. Splash Page (`static/splash.html`)
- Visitor enters a design style prompt (freeform text or preset chips)
- Visitor enters their email address
- Optional opt-in for drip campaign
- Hits "Generate & Enter"
- **Generation starts IMMEDIATELY on submit** — the verification process is the mandatory delay that buys time for generation to complete
- Server sends a 6-digit verification code to their email
- Visitor info is enriched via cookies, browser data, and any other available methods — more context to include when emailing Greg

### 2. Email Verification (`static/verify.html`)
- Visitor enters the verification code
- On success: `gi_auth` cookie is set (30-day TTL)
- By this time, the generation should be complete (or nearly complete)
- **Home page loads in their bespoke generated design**

### 3. Email Notification to Greg
- **If visitor does NOT proceed to CNA:** Greg is emailed immediately with enriched visitor info
- **If visitor DOES proceed to CNA:** Email is held until CNA is complete and proposal is generated, so Greg receives the full picture (visitor info + needs analysis + proposal)

### 4. Portfolio Experience
- The site renders Greg's real portfolio content (projects, about, contact, designs) in the visitor's generated visual skin
- **Flipper bar** at the top: visitor can flip through all available generated designs. Each flip loads a completely different standalone HTML build of the current page via `fetch()` + `document.startViewTransition()`
- **CNA banners** on all pages: persistent call-to-action driving prospects to the needs assessment form
- **NO generator form anywhere in the portfolio** — generation ONLY happens via the splash page

### 5. AI-Powered CNA Form
- Separate page accessible from banners on every page
- Interactive AI-driven conversation that conducts a client needs analysis
- Analyzes the prospect's needs against Greg's services, pricing ranges, timelines, and budget
- On completion: AI generates a proposal (PDF) using a prompt
- Proposal is sent to Greg for approval (not auto-sent)
- **Feedback loop via email**: Greg reviews, provides feedback to AI, proposal iterates until finalized
- Greg sends finalized proposal via open-source DocuSign alternative

### 6. Backend / Nurturing
- Cookie-based session persistence
- Visitor profiles tracked in vault
- Enriched visitor data (cookies, browser info, any available signals)
- Email drip campaigns for lead nurturing

---

## Design Generation Pipeline

### Critical Timing: Generation Starts on Submit, Not Verification
The verification process IS the generation buffer. When the visitor hits "Generate & Enter":
1. Server kicks off theme generation immediately
2. Server sends verification code to visitor's email
3. Visitor goes to their email, finds the code, enters it — this takes 30-90 seconds
4. By the time verification completes, generation should be done (or home page should be ready via lazy loading)

### Required Pipeline

#### Phase 1: Planning (Automated, No Manual Review)
1. LLM receives the style prompt + `baseContext` (which includes the frontend-design SKILL.md)
2. LLM produces a design plan: color palette, typography, layout strategy, interactive elements
3. **Review gate**: LLM analyzes and improves its own plan before proceeding
4. LLM produces image generation prompts

#### Phase 2: Generation (Maximum Parallelization)
1. **Immediately parallel**: Image generation (logo, favicon, hero, portrait) kicks off
2. **First priority**: CSS + shell + home layout → **build and serve home immediately** (lazy load)
3. **Parallel batch**: remaining layout templates generated concurrently
4. **Review gate**: LLM reviews CSS + layouts for consistency with the plan

#### Phase 3: Holistic Review (Automated)
1. All layouts assembled → LLM reviews the full design holistically
2. Scores quality, checks for inconsistencies, fixes issues
3. Final build of all remaining pages

### Continuous Improvement (Cron)
- Daily job runs on **ALL** existing generated designs (not one at a time)
- LLM analyzes, scores, and generates an improved version of each
- If improved version scores higher, swap it in
- Stop iterating on a design once it hits a quality plateau
- Model rotation (Gemini, Claude, etc.) for fresh aesthetic perspectives
- Visitors can return to see how their generated design evolves

### Portfolio Promotion
- After the automated improvement process has run and a design reaches its optimal state, Greg can promote it to the portfolio (appears on Designs index alongside real client work)
- This is a real feature to be implemented now — not deferred

---

## Content Architecture

### Real Portfolio Content (Vault)

| Page | Vault Source | Output |
|------|-------------|--------|
| Home | `vault/pages/home.md` | `index.html` |
| About | `vault/pages/about.md` | `about.html` |
| Contact | `vault/pages/contact.md` | `contact.html` |
| Projects Index | *(derived)* | `projects.html` |
| Designs Index | *(derived)* | `designs.html` |
| Project Detail | `vault/pages/projects/*.md` | `projects/{slug}.html` |
| Design Detail | `vault/pages/designs/*.md` | `designs/{slug}.html` |

### Projects

| Project | Featured | Tech |
|---------|----------|------|
| SSSS | Yes | Node.js, Open spec, Zero-dep |
| Total Recall | Yes | Node.js, Local embeddings, REST API, ssss |
| UltraChat | Yes | TypeScript, Express, Supabase, ssss |
| festech.live | Yes | Python, Flask, Automation |

### Portfolio Designs (Real Client Work — `vault/pages/designs/`)

| Project | Client | Year |
|---------|--------|------|
| Nostalgia | Nostalgia Festival | 2026 |
| High Stakes Field Day | Sessions by Slim | 2026 |

### Theme Skins (AI-Generated — NOT Portfolio)
AI-generated visual skins live in their **own separate folder** — NOT in `vault/pages/designs/`. They must NEVER appear on the Designs index. They are standalone builds accessible via the flipper only.

---

## The Core Contract

> The AI generates **structure** (CSS + HTML templates with `{{PLACEHOLDER}}` slots). The build script injects **content** (from the vault). These concerns must never cross.

---

## Known Bugs / Missing Features

### Bugs (P0)
1. **Theme skins in wrong folder** — AI-generated themes are written to `vault/pages/designs/` alongside real portfolio work. They need their own separate folder.
2. **Hardcoded fake marketing block** — `compile-theme.mjs` line 402 appends fake "Infrastructure Consultation Offer" to every DESIGN.md.
3. **Existing generated themes must be deleted** — Clean slate. All current AI-generated designs removed.
4. **Generator form on designs page** — The `{{GENERATOR_FORM}}` placeholder exists in the designs_index layout. Generation should ONLY happen via splash page.

### Pipeline Improvements (P1)
5. **No planning review gate** — Planning is a single LLM call with no self-critique loop.
6. **Sequential generation** — Layout templates generated in series. Should be parallelized.
7. **No lazy loading** — All pages must finish before any are served.
8. **Generation doesn't start on submit** — Should start immediately when visitor submits the splash form, not after verification.

### New Features (P2-P3)
9. **No continuous improvement cron** — Daily improvement of ALL designs not implemented.
10. **No CNA form** — AI-powered needs assessment not built.
11. **No proposal generation** — PDF generation and approval workflow not built.
12. **No portfolio promotion workflow** — No way to promote mature designs to portfolio.
13. **No visitor enrichment** — Cookie/browser data not collected for enriched visitor emails.
