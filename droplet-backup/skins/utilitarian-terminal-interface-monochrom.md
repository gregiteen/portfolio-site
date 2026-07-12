---
type: page
slug: "skin-utilitarian-terminal-interface-monochrom"
name: "Amber Phosphor Terminal"
title: "Amber Phosphor Terminal — Generated Skin"
description: "AI-generated skin: \"Utilitarian terminal interface, monochrome amber phosphors on pure black, monospace typography, data-dense layouts.\""
timestamp: "2026-07-11T22:13:42.202Z"
sandbox_entry: "designs/utilitarian-terminal-interface-monochrom/index.html"
x_kind: "theme-skin"
x_year: "2026"
x_preview: "/designs/utilitarian-terminal-interface-monochrom/assets/hero.jpg"
x_logo: "/designs/utilitarian-terminal-interface-monochrom/gi-logo-transparent-dark.png"
x_link: "/designs/utilitarian-terminal-interface-monochrom/index.html"
---

---
theme_name: "Amber Phosphor Terminal"
colors:
  bg_pure_black: "#000000"
  amber_phosphor: "#FFB000"
  amber_dim: "#332000"
  amber_mid: "#805800"
typography:
  font_primary: "'IBM Plex Mono', 'Courier New', monospace"
  scale_base: "14px"
  scale_lg: "18px"
  scale_xl: "24px"
  letter_spacing_tracked: "0.12em"
spacing:
  cell_unit: "8px"
borders:
  solid_thin: "1px solid #FFB000"
  dashed_thin: "1px dashed #332000"
---

# DESIGN.md - Amber Phosphor Terminal

## Visual Identity & Mood
The visual system is modeled directly on late-1970s mainframe computer terminals, prioritizing high data density, structural monochrome hierarchy, and physical hardware constraints. By excluding typical modern layouts, the site highlights Greg Iteen's native, raw, low-level technical logic.

## Layout Strategy
Layouts adhere strictly to a monospace grid. Horizontal structural elements are separated with custom ASCII borders instead of random margin padding. Component items read sequentially like data sheets rather than marketing cards, creating an unyielding, professional landscape.

## Touch & Interactive Mechanics
To balance usability with vintage terminal restrictions, all interactive tags have a hidden minimum touch dimension of 44px achieved through transparent borders and absolute cell padding. Hovers are binary and instantaneous; there are no slow, heavy gradients or modern bezier transitions. Elements invert cleanly from amber-on-black to black-on-amber to mimic retro video RAM cell highlighting.
