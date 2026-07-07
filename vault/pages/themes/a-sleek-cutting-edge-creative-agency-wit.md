---
type: page
slug: "design-a-sleek-cutting-edge-creative-agency-wit"
name: "Agency Brutalist"
title: "Agency Brutalist — Design Spec"
description: "AI-generated design: \"A sleek, cutting-edge creative agency with deep dark mode aesthetics, neon green accents, bold brutalist typography, and stark high-contrast layouts. The vibe is mysterious, high-end, and rebellious.\""
timestamp: "2026-07-07T07:10:44.955Z"
sandbox_entry: "designs/a-sleek-cutting-edge-creative-agency-wit/index.html"
x_kind: "design"
x_year: "2026"
x_role: "AI-Generated Theme"
x_client: "Portfolio Generator"
x_tags:
  - "AI Generated"
  - "Theme"
x_preview: "/designs/a-sleek-cutting-edge-creative-agency-wit/assets/hero.jpg"
x_logo: "/designs/a-sleek-cutting-edge-creative-agency-wit/assets/logo.png"
x_link: "/designs/a-sleek-cutting-edge-creative-agency-wit/index.html"
---

---
colors:
  bg: "#090A0C"
  bg_elevated: "#121418"
  bg_deep: "#050607"
  accent: "#00FF55"
  accent_dim: "rgba(0, 255, 85, 0.08)"
  border: "#22262B"
  text_primary: "#FFFFFF"
  text_muted: "#8E96A0"
typography:
  display_stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  code_stack: "ui-monospace, SFMono-Regular, 'SF Pro Mono', Menlo, Monaco, Consolas, monospace"
  sizes:
    display: "2.5rem"
    meta: "0.75rem"
    body: "0.95rem"
spacing:
  grid_unit: "8px"
  touch_target: "44px"
---

# DESIGN.md (Agency Brutalist Visual Specification)

## 1. Architectural Intent
This visual identity is designed for Greg Iteen, a systems engineer building file-native AI software. It rejects standard SaaS gradients, warm rounded cards, and generic decorative iconography in favor of an austere, high-contrast digital ledger aesthetic. The typography is brutally structured using a strict grid layout, razor-thin borders, and neon-green accents reminiscent of physical terminal instruments.

## 2. Layout Strategy (Mobile-First)
- **Mobile Base Layer**: A single-column grid with strict vertical borders. No overlapping layers or excessive margins. Standard interactive elements expand to fill the horizontal bounds to maximize the touch-target surface areas.
- **Desktop Scale-up (min-width: 768px)**: Expands into asymmetric multi-column splits. The layouts partition system metadata and primary documentation cleanly into logical columns separated by precise border rules.
- **Borders**: All primary sections are divided by exact `1px solid var(--border)` rules, reinforcing a CAD-like blueprints feeling.

## 3. Typography & Voice
- **Typography**: Large-scale titles use tracking compression (`letter-spacing: -0.04em`) and maximum weight to form visual architectural blocks. Metadata and utility labels use a monospace system stack to represent code paths and direct file-system attributes.
- **Copy Tone**: Severely professional, analytical, and highly technical. Entirely devoid of marketese, buzzwords, or expressive emojis. Every label refers strictly to technical artifacts, file structures, or performance outputs.

## 4. Interactive Micro-dynamics
- Interactive states do not use standard scale transforms. Instead, hover triggers a binary state change: an instant inverted background block or a neon-green monospace cursor symbol injection. These sharp micro-animations mirror the instant execution of local terminal commands.
