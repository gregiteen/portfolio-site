# Portfolio Site — Development Plan

## Priority Order

### P0: Fix Existing Bugs + Clean Slate

#### 1. Delete all existing AI-generated designs
**What:** Remove all AI-generated theme files from `vault/pages/designs/` (keep only `nostalgia.md` and `high-stakes-field-day.md`). Remove all generated design directories from `designs/`. Clean slate.
**Verify:** `vault/pages/designs/` contains only `nostalgia.md` and `high-stakes-field-day.md`. `designs/` is empty or only contains manually created work.

#### 2. Create separate folder for generated theme skins
**What:** Generated themes should write to a new location (e.g., `vault/pages/skins/` or a non-vault location entirely) — NOT `vault/pages/designs/`. Update `compile-theme.mjs` to write to the new location.
**Verify:** New theme generation writes to the new folder, not `vault/pages/designs/`

#### 3. Update build-site.mjs to handle theme skins separately
**What:** The build script must never include theme skins on the Designs index page. Theme skins are only accessible via the flipper and their standalone URLs.
**Verify:** Designs index only shows Nostalgia + HSFD

#### 4. Remove fake marketing block
**File:** `scripts/compile-theme.mjs` line 402
**What:** Delete the hardcoded "Infrastructure Consultation Offer" + fake emails appended to every DESIGN.md
**Verify:** Generate a test theme, confirm no fake copy

#### 5. Remove generator form from designs page
**What:** The `{{GENERATOR_FORM}}` placeholder should not be used on the designs_index layout. Generation ONLY happens via splash page.
**Verify:** Designs page has no generation form

#### 6. Verify LLM prompt fix
**What:** Audit the most recently generated theme layouts for fake hardcoded copy
**Verify:** Layouts use `{{PLACEHOLDER}}` variables, not hardcoded text

---

### P1: Improve Generation Pipeline

#### 7. Generation starts on splash form submit (not verification)
**File:** `scripts/serve.mjs`
**What:** When `/api/send-code` is called, immediately kick off `compile-theme.mjs` in background alongside sending the verification code. The verification delay IS the generation buffer.
**Verify:** Theme generation begins the moment the visitor hits "Generate & Enter"

#### 8. Add planning review gate
**File:** `scripts/compile-theme.mjs`
**What:** After Pass 1 planning, add a second LLM call to analyze and improve the plan before any code generation begins.
**Verify:** Plan quality improves measurably

#### 9. Parallelize layout generation
**File:** `scripts/compile-theme.mjs`
**What:** After CSS + Home, run remaining layout passes concurrently via `Promise.all()`
**Verify:** Generation time drops significantly

#### 10. Lazy load home page
**File:** `scripts/compile-theme.mjs` + `scripts/serve.mjs`
**What:** Build and serve home page as soon as CSS + shell + home layout are ready. Continue remaining layouts in background.
**Verify:** Home page available within ~40s

#### 11. Strengthen holistic review (Pass 5)
**File:** `scripts/compile-theme.mjs`
**What:** Score design 1-10, check placeholder compliance, fix inconsistencies
**Verify:** Cleaner output quality

---

### P2: Continuous Improvement + Promotion

#### 12. Create `improve-theme.mjs`
**What:** Script that loads a theme, sends it to LLM for critique, generates improved version, swaps in if better
**Verify:** Run on one theme, confirm improvement

#### 13. Daily cron on ALL designs
**What:** Daily job runs `improve-theme.mjs` on every existing generated design, not just one
**Verify:** All designs show improvement over multiple days

#### 14. Model rotation
**What:** Alternate between Gemini, Claude, etc. for fresh perspectives
**Verify:** Different models produce different improvements

#### 15. Portfolio promotion workflow
**What:** Greg can flag a mature optimized design for promotion to the real portfolio. The design then appears on the Designs index alongside Nostalgia and HSFD.
**Verify:** Promoted design appears on Designs index with proper metadata

---

### P3: CNA + Proposals + Visitor Enrichment

#### 16. Visitor enrichment
**What:** Collect cookie data, browser info, and any available signals about the visitor. Include enriched data in emails to Greg.
**Verify:** Visitor emails contain richer context

#### 17. Email timing logic
**What:** If visitor does NOT do CNA → email Greg immediately on verification. If visitor DOES start CNA → hold email until CNA is complete and proposal is generated.
**Verify:** Both paths work correctly

#### 18. CNA form page + banners
**What:** AI-powered interactive needs assessment page. CNA banners on all portfolio pages.
**Verify:** Prospect can complete full CNA conversation

#### 19. Proposal PDF generation
**What:** AI generates PDF proposal from CNA data
**Verify:** Professional, accurate PDF output

#### 20. Proposal feedback loop
**What:** Proposal sent to Greg via email. Greg provides feedback to AI via email. AI iterates proposal until finalized.
**Verify:** Multi-round feedback produces polished final proposal

#### 21. Proposal delivery via DocuSign alternative
**What:** Greg sends finalized proposal via open-source DocuSign
**Verify:** Client receives and can sign
