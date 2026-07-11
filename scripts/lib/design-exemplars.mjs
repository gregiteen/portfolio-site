export const DIRECTOR_EXEMPLARS = `
### EXEMPLAR 1: "2026 Tactile Brutalism & Precision"
\`\`\`yaml
tokens:
  color:
    bg: '#0F0F0F'
    text: '#F4F4F0'
    accent: '#FF3300'
  typography:
    display: '"PP Neue Montreal", "Helvetica Neue", sans-serif'
    body: '"JetBrains Mono", monospace'
  spacing:
    section_y: 'clamp(80px, 10vw, 160px)'
    grid_gap: '1px'
  layout:
    max_width: '100vw'
\`\`\`
**Design Rationale:**
Reflecting the July 2026 shift toward "Tactile Brutalism" and engineered precision. We are avoiding the homogenized, soft, blurry UI typical of low-end AI generators. The layout relies on a strict, visible 1px grid structure (using borders as structural architecture). Typography is massive, acting as the interface itself rather than just content. Performance is paramount: we use CSS noise and grain instead of heavy 3D assets to create a human-crafted, tactile feel.

### EXEMPLAR 2: "2026 High-Fashion Editorial & Storytelling"
\`\`\`yaml
tokens:
  color:
    bg: '#EBE9E1'
    text: '#1C1C1A'
    accent: '#5A554A'
  typography:
    display: '"Ogg", "Playfair Display", serif'
    body: '"Inter", sans-serif'
  spacing:
    section_y: 'clamp(120px, 15vw, 240px)'
    grid_gap: 'clamp(20px, 4vw, 40px)'
  layout:
    max_width: '1440px'
\`\`\`
**Design Rationale:**
Driven by the 2026 trend of human-centric storytelling to counter AI saturation. This design relies on dramatic, emotional whitespace and high-contrast typography. The hero section eschews traditional photography in favor of kinetic, viewport-scaled typography that serves as the brand narrative. Micro-interactions and hover states are gamified and purposeful, guiding the user through a cinematic vertical scroll journey.
`;

export const CSS_EXEMPLARS = `
### EXEMPLAR 1: 2026 Tactile Brutalism (Structural Grid & CSS Textures)
\`\`\`css
.frame {
  width: 100vw;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  display: grid;
  grid-template-columns: 1fr;
  /* CSS Texture: subtle noise overlay for tactile feel */
  position: relative;
}
.frame::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.04"/%3E%3C/svg%3E');
  pointer-events: none;
  z-index: 9999;
}
@media (min-width: 768px) {
  .frame {
    grid-template-columns: 320px 1fr;
    /* 1px Solid Borders for Engineered Precision */
    border-left: 1px solid var(--text);
  }
}
\`\`\`

### EXEMPLAR 2: Typography as Interface (Viewport Scaled & Kinetic)
\`\`\`css
h1.display {
  font-family: var(--font-display);
  /* Massive, viewport-scaled typography replacing traditional hero imagery */
  font-size: clamp(4rem, 12vw, 11rem);
  line-height: 0.82;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0;
  padding-bottom: var(--space-lg);
  /* Hover-triggered macro-animation */
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
h1.display:hover {
  transform: skewX(-5deg) scale(1.02);
  color: var(--accent);
}
p.lede {
  font-family: var(--font-body);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  max-width: 40ch;
  line-height: 1.3;
}
\`\`\`
`;

export const LAYOUT_EXEMPLARS = `
### EXEMPLAR 1: The "Home" Layout (2026 Tactile Brutalism)
{"html":"<section class=\\"frame\\"><header class=\\"hero\\"><h1 class=\\"display kinetic-hover\\">{{HEADLINE}}</h1><p class=\\"lede\\">{{TAGLINE}}</p><div class=\\"prose\\">{{INTRO}}</div></header><div class=\\"grid precision-border-top\\">{{FEATURED_PROJECTS}}</div></section>"}
*Note: Uses Semantic HTML (Machine Experience MX optimized). Typography is the focal point. Zero hardcoded copy.*

### EXEMPLAR 2: The "Projects Index" Layout (Cinematic Vertical Scroll)
{"html":"<div class=\\"editorial-wrapper\\"><h2 class=\\"section-title\\">Selected Works</h2><div class=\\"asymmetric-grid scroll-reveal\\">{{PROJECT_LIST}}</div></div>"}
*Note: The list of projects is wrapped in a neutral \`.asymmetric-grid\` container to support 2026-style organic, human-centric layouts.*

### EXEMPLAR 3: The "Project Item" Layout (Hover-Triggered Gamification)
{"html":"<article class=\\"project-card hover-preview-trigger\\"><figure class=\\"project-image fluid-mask\\">{{PREVIEW}}</figure><div class=\\"project-meta\\"><h3 class=\\"project-title\\">{{TITLE}}</h3><span class=\\"project-date mono-tag\\">{{DATE}}</span></div></article>"}
*Note: Uses \`<article>\` and \`<figure>\` for semantic MX parsing. Classes imply modern hover-triggered previews and fluid masking.*
`;
