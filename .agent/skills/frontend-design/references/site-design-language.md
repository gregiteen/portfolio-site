# This site's design language — repo-specific facts

The SKILL.md body is generic design guidance. These are the constraints and
sources of truth specific to gregiteen.xyz. Verified against the repo 2026-07-17.

## Hard constraints

- **Never Cyberpunk.** No neon-on-dark hacker aesthetics, no glitch effects, no
  cyber anything — as a theme, a palette description, or a prompt to the theme
  generator. This is an explicit owner rule with no exceptions.
- Image-field naming: `*Upload` (e.g. `avatarUpload`), never `*Url`.

## Brand surfaces and their palettes

- **Signed, gi. (e-sign) email wrapper** (`scripts/serve.mjs`, `brandedEmailHtml`):
  dark — background `#060608`, card `#0e0e12`, text `#f0f0ec`, muted `#555555`,
  hairlines `rgba(255,255,255,.06)`. Logo asset: `signedgi-logo-dark.png`
  (served from the site root; `/signedgi-*` paths bypass the auth interceptor —
  see `serve.mjs`).
- **Signing page** (`renderSignPage` in `serve.mjs`): wraps the Documenso signing
  URL with SignedGI branding because Documenso's CSP (`frame-ancestors 'self'`)
  forbids plain iframing on another origin.
- Check any new pairing with `scripts/check-contrast.mjs` — body text below
  4.5:1 fails WCAG AA.

## Where designs actually live

- A theme's **only** source of truth is `designs/<slug>/DESIGN.md`
  (`## section:css` / `## section:layout:<key>` fenced blocks). The build is
  fail-closed: broken/missing sections abort rather than silently falling back —
  that property fixed the "all designs look the same" bug. Don't add fallbacks.
- `designs/` is generated output on the droplet and is rsync-excluded from
  deploys; an empty local `designs/` is normal.
- Generation pipeline details belong to the `generator` skill — read it before
  touching `compile-theme.mjs`.

## Review rule (learned the hard way)

The theme "analyze and improve" cycle runs **before** a design is published, and
both the reviewers and the repairers must see the **actual rendered screenshots**,
not just source code or issue text. Source-only review misses rendered defects;
text-only repair stalls. `subagents/design-review.md` encodes this.
