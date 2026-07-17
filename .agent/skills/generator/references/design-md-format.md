# DESIGN.md format — verified against scripts/lib/theme.mjs

Source: `extractSections()` and `serializeThemeDoc()` in `scripts/lib/theme.mjs` (read those two functions directly before changing anything here — this is a summary of a ~50-line contract, not the full thing).

## Why fenced blocks, not YAML block scalars

The code comment on `extractSections()` is explicit: fenced code blocks were chosen because they "survive the standard SSSS parser untouched, unlike YAML block scalars which needed a bespoke (and fragile) parser." Don't reintroduce a YAML-block-scalar-based format for generated CSS/HTML — that was already tried and abandoned.

## Exact structure

```
---
type: page
<other frontmatter keys>
---

Bespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.

## section:css

​```css
<generated CSS>
​```

## section:layout:home

​```html
<generated layout HTML>
​```

## section:layout:projects_index

​```html
...
​```
```

## Parsing contract (`extractSections`)

Regex: `^##\s+section:([a-z0-9_:-]+)\s*\n+```[a-zA-Z]*\n([\s\S]*?)\n```` (multiline). Practical implications:

- The section name must match `[a-z0-9_:-]+` — no uppercase, no spaces. `css` and `layout:<key>` (where `<key>` is one of the `LAYOUT_SPECS` keys, e.g. `home`, `projects_index`) are the only names actually produced/consumed.
- The heading line must start with exactly `## section:` — not `### section:`, not `##section:` (no space).
- The fence's language tag is ignored by the parser (`[a-zA-Z]*` matches anything) but `serializeThemeDoc()` always writes `css` for the css section and `html` for every layout section.
- Content is captured non-greedily up to the *first* closing ` ``` ` on its own line — which is exactly why `serializeThemeDoc()` strips any triple-backtick sequences out of generated content before writing (`content.replace(/```/g, '')`). If you ever hand-edit a `DESIGN.md`, do not paste content containing its own triple-backtick fences without the same stripping, or the section will silently truncate at the first nested fence.

## Serialization contract (`serializeThemeDoc`)

- Frontmatter values are `JSON.stringify`'d as strings — even for non-string-looking values — so every frontmatter value round-trips as a quoted string.
- Sections are filtered to only those with non-empty string content — an empty or missing layout section is simply omitted, not written as an empty block. This matters for `validateThemePayload`'s "all layouts required" strict check downstream: a missing key and an empty-string key are not distinguishable after serialization.

## If you're debugging a corrupted/truncated DESIGN.md

1. Check for nested triple-backtick fences in the generated content that weren't stripped (see above).
2. Check the section name matches the parser's character class exactly.
3. Check the heading uses `##` (exactly two hashes) with `section:` immediately after (no space before the colon).
