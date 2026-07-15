export const DIRECTOR_EXEMPLARS = `
**Example 1: Valid YAML Token Structure (SYNTAX ONLY - DO NOT COPY STYLE)**
OUTPUT:
\`\`\`yaml
tokens:
  color:
    bg: '#0F0F0F'
    text: '#F4F4F0'
    accent: '#FF3300'
  typography:
    display: '"Unbounded", sans-serif'   # exists on fonts.google.com — mandatory property of any family you choose
    body: '"Manrope", sans-serif'
  spacing:
    section_y: 'clamp(80px, 10vw, 160px)'
    grid_gap: '1px'
  layout:
    max_width: '100vw'
\`\`\`
**Example 2: Valid YAML Layout Architecture (SYNTAX ONLY - DO NOT COPY STYLE. Your brief demands DIFFERENT font families than either example — pick faces from fonts.google.com that no other brief would choose.)**
OUTPUT:
\`\`\`yaml
tokens:
  color:
    bg: '#EBE9E1'
    text: '#1C1C1A'
    accent: '#5A554A'
  typography:
    display: '"Instrument Serif", serif'  # exists on fonts.google.com
    body: '"Outfit", sans-serif'
  spacing:
    section_y: 'clamp(120px, 15vw, 240px)'
    grid_gap: 'clamp(20px, 4vw, 40px)'
  layout:
    max_width: '1440px'
\`\`\`
`;

export const CSS_MECHANICS = {
  scroll_driven_animations: `**Example (Technical Toolkit: Scroll-Driven Animations)**\nPROMPT (User Input): THIS SECTION'S JOB: Add scroll-driven reveals to elements.\nOUTPUT (Your Response):\n{"css": "@supports (animation-timeline: scroll()) { .scroll-reveal { opacity: 0; transform: translateY(40px) scale(0.98); animation: reveal linear both; animation-timeline: view(); animation-range: entry 10% cover 30%; } } @keyframes reveal { to { opacity: 1; transform: translateY(0) scale(1); } }"}`,
  kinetic_hover: `**Example (Technical Toolkit: Kinetic Hover & Fluid Masking)**\nPROMPT (User Input): THIS SECTION'S JOB: Create high-end kinetic hover states for image cards.\nOUTPUT (Your Response):\n{"css": ".fluid-mask { overflow: hidden; clip-path: inset(0 round var(--radius)); transition: clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1); } .hover-trigger:hover .fluid-mask { clip-path: inset(2% round var(--radius-lg)); } .fluid-mask img { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); } .hover-trigger:hover .fluid-mask img { transform: scale(1.05); }"}`,
  glassmorphism_noise: `**Example (Technical Toolkit: Glassmorphism & Structural CSS Noise)**\nPROMPT (User Input): THIS SECTION'S JOB: Create a tactile, premium glassmorphism container with physical texture.\nOUTPUT (Your Response):\n{"css": ".glass-panel { background: rgba(var(--bg-rgb), 0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(var(--text-rgb), 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); position: relative; } .glass-panel::after { content: ''; position: absolute; inset: 0; background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/%3E%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\" opacity=\\"0.04\\"/%3E%3C/svg%3E'); pointer-events: none; z-index: 10; }"}`
};

export const LAYOUT_EXEMPLARS = `
**Example 1 (For Layout: 'shell' - SHOWS CORRECT PLACEHOLDER INJECTION)**
PROMPT (User Input):
This "shell" layout MUST contain these exact placeholder(s): {{CONTENT}}
Optional placeholder(s): {{NAV_LINKS}}, {{THEME_PILLS}}, {{SOURCE_PATH}}
OUTPUT (Your Response):
{"html": "<div class=\\"frame\\"><nav class=\\"global-nav\\">{{NAV_LINKS}}</nav><main class=\\"main-content-flow\\">{{CONTENT}}</main><footer class=\\"global-footer\\">{{THEME_PILLS}}</footer></div>"}
**Example 2 (For Layout: 'home' - SHOWS CORRECT PLACEHOLDER INJECTION)**
PROMPT (User Input):
This "home" layout MUST contain these exact placeholder(s): {{FEATURED_PROJECTS}}
Optional placeholder(s): {{HEADLINE}}, {{TAGLINE}}, {{INTRO}}
OUTPUT (Your Response):
{"html": "<section class=\\"home-container\\"><header class=\\"hero\\"><h1 class=\\"display kinetic-hover\\">{{HEADLINE}}</h1><p class=\\"lede\\">{{TAGLINE}}</p><div class=\\"prose\\">{{INTRO}}</div></header><div class=\\"grid precision-border-top\\">{{FEATURED_PROJECTS}}</div></section>"}
**Example 3 (For Layout: 'projects_index' - SHOWS CORRECT PLACEHOLDER INJECTION)**
PROMPT (User Input):
This "projects_index" layout MUST contain these exact placeholder(s): {{PROJECT_LIST}}
Optional placeholder(s): {{PROJECT_COUNT}}
OUTPUT (Your Response):
{"html": "<div class=\\"editorial-wrapper\\"><h2 class=\\"section-title\\">Selected Works ({{PROJECT_COUNT}})</h2><div class=\\"asymmetric-grid scroll-reveal\\">{{PROJECT_LIST}}</div></div>"}
**Example 4 (For Layout: 'project_item' - SHOWS CORRECT PLACEHOLDER INJECTION)**
PROMPT (User Input):
This "project_item" layout MUST contain these exact placeholder(s): {{NAME}}, {{URL}}
Optional placeholder(s): {{DESCRIPTION}}, {{YEAR}}, {{TECH_BADGES}}, {{LOGO}}, {{INDEX}}, {{REPO_URL}}
OUTPUT (Your Response):
{"html": "<article class=\\"project-card hover-preview-trigger\\"><figure class=\\"project-image fluid-mask\\">{{LOGO}}</figure><div class=\\"project-meta\\"><a href=\\"{{URL}}\\" class=\\"project-link\\"><h3 class=\\"project-title\\">{{NAME}}</h3></a><p class=\\"project-desc\\">{{DESCRIPTION}}</p><span class=\\"project-date mono-tag\\">{{YEAR}}</span><div class=\\"badges\\">{{TECH_BADGES}}</div></div></article>"}
`;
