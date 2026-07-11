---
type: page
slug: "skin-archival-constructivism-warm-paper-ink-b"
name: "Archival Constructivism"
title: "Archival Constructivism — Generated Skin"
description: "AI-generated skin: \"Archival constructivism: warm paper, ink-black display serif, letterpress texture, editorial grid with bold red-orange accents\""
timestamp: "2026-07-11T04:02:44.516Z"
sandbox_entry: "designs/archival-constructivism-warm-paper-ink-b/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/archival-constructivism-warm-paper-ink-b/assets/hero.jpg"
x_logo: "/designs/archival-constructivism-warm-paper-ink-b/gi-logo-transparent-dark.png"
x_link: "/designs/archival-constructivism-warm-paper-ink-b/index.html"
---

---
bg-paper: "#F4F0EA"
text-carbon: "#0F0F0F"
text-muted: "#5A5854"
accent-red: "#E34234"
font-display: "'Playfair Display', Georgia, serif"
font-sans: "'Univers', -apple-system, sans-serif"
font-mono: "'SF Mono', Monaco, monospace"
grid-gap: "1.5rem"
border-thick: "3px solid #0F0F0F"
border-thin: "1px solid #0F0F0F"
transition-snappy: "0.15s cubic-bezier(0.25, 1, 0.5, 1)"
---

# DESIGN.md

## Visual Identity & Mood
The visual landscape of Greg Iteen's portfolio rejects transient modern UI trends in favor of Archival Constructivism. This system grounds modern local AI architecture in the tactical, historical permanence of printed broadsheets, editorial grids, and letterpress ink. The primary canvas is a heavy, raw unbleached paper background (#F4F0EA) paired with high-carbon black typography and highlighted by a singular, authoritative red-orange accent (#E34234). Solid lines replace soft shadows, and rigid alignments replace organic shapes.

## Mobile-First Architecture
- **Responsive Strategy**: Single-column vertical stacks are configured as the baseline mobile layout. Complex multi-column grid layouts activate strictly via @media (min-width: 768px) and refine at @media (min-width: 1200px).
- **Touch Target Integrity**: All interactive items, including menu nav links and portfolio metadata buttons, are designed with a minimum clickable surface area of 44x44px. Generous top/bottom padding preserves structural grid alignment while ensuring fluid mobile interaction.

## Typography & Visual Hierarchy
Headlines command immediate attention, rendered in an uncompromisingly sharp display serif (such as Playfair Display) which replicates the physical bleeding of wet ink on raw paper. Secondary information, tabular project indexes, and technical tags adopt a clean, structural sans-serif (such as Univers) or raw monospaced system font block. Grid structures are clearly defined with physical solid rules, organizing content like an index system.

## Motion & Kinetics
- **Letterpress Hover Mechanic**: All primary buttons and cards use a custom CSS animation: upon hover or focus, the card offsets -2px on the X and Y axes while generating a flat, deep carbon black drop shadow, simulating a physical letterpress print plate being released from paper.
- **Ink-Roll Reveal**: Elements with the `.gi-reveal` class utilize a hardware-accelerated clip-path vertical sweep, shifting from `clip-path: inset(100% 0% 0% 0%)` to `clip-path: inset(0% 0% 0% 0%)` upon entering the viewport to evoke the visual of structural printing presses.
- **Interactive Underlines**: Links inside editorial text build a solid underline that expands from zero-width to 100% from left-to-right using a crisp, high-velocity transition.
