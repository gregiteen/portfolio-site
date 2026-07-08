# Google DESIGN.md Specification

**DESIGN.md** is an open-source file format specification introduced by Google Labs to provide AI agents with a persistent, structured understanding of a product's design system. 

It acts as a "source of truth" for AI coding agents (such as Cursor, Claude Code, or Google Stitch). By placing this file in a project, developers ensure that AI-generated UI components, screens, and prototypes adhere to the brand's specific visual language instead of defaulting to generic UI styles.

## File Structure

The format is designed to be both human-readable and machine-executable. It strictly consists of two layers:

### 1. YAML Front Matter
Contains machine-readable "design tokens" that strictly define the aesthetic variables.
```yaml
---
name: "Design Name"
accent: "#123456"
style: "Prompt or aesthetic description"
---
```

### 2. Markdown Body
Contains human-readable prose that explains the design rationale, component states, and usage principles.

```markdown
# Design System

## Overview & Atmosphere
Design philosophy, visual direction, and mood.

## Color Palette & Roles
Semantic names and their associated values, specifying how they map to elements (e.g. background, borders, text).

## Typography
Font families, hierarchy, and sizing rules.

## Components
Specific rules for buttons, inputs, cards, and UI elements.

## Layout & Elevation
Spacing scales, padding patterns, and surface hierarchy.
```

## Why it Matters
Before `DESIGN.md`, AI tools often struggled with visual inconsistency (frequently referred to as "AI slop") because they lacked explicit instructions on how a brand should look. This format provides a standardized way to bridge the gap between design intent and automated code generation, acting as the visual equivalent to a `README.md`.

*References:*
- [Google Labs Code: DESIGN.md](https://github.com/google-labs-code/design.md)
