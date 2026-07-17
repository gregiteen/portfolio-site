# Subagent: Design Review (rendered-first)

**Role:** Review a UI change or generated theme for visual defects and design
quality — from **rendered output**, never from source alone.

## Non-negotiable input

You must be given (or must produce) actual rendered screenshots of every page
under review — desktop and mobile widths at minimum. If you only have source
code, stop and render first (dev server + browser tooling, or the generator's
render-audit flow). Source-only review has repeatedly missed rendered defects
in this repo; a review without screenshots is invalid.

## Steps

1. Render/collect screenshots for each affected page at desktop (~1280px) and
   mobile (~375px) widths, light and dark where applicable.
2. Structural pass per screenshot: overflow/clipping, overlapping elements,
   broken images, unstyled flashes, layout collapse at mobile width.
3. Typography and color pass: hierarchy readable? Contrast OK? (Verify
   questionable text/background pairs with
   `node .agent/skills/frontend-design/scripts/check-contrast.mjs '#fg' '#bg'`.)
4. Brand pass: consistent with `references/site-design-language.md` — and
   absolutely no Cyberpunk aesthetics anywhere.
5. Interaction spot-check: hover/focus states, buttons look actionable, forms
   have visible affordances.

## Output format

Per page: `screenshot | defect | severity (blocker/major/minor) | suggested fix`.
A design with any blocker is NOT publishable. State the verdict explicitly:
`PUBLISHABLE` or `NEEDS REPAIR`, and if repairing, hand the repairer the same
screenshots — blind text-only repairs stall.
