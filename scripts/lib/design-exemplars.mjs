export const DIRECTOR_EXEMPLARS = `
**Example 1: 2026 Tactile Brutalism & Precision**
OUTPUT:
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

**Example 2: 2026 High-Fashion Editorial & Storytelling**
OUTPUT:
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
`;

export const CSS_EXEMPLARS = `
**Example 1 (For CSS section: 'layout')**
PROMPT (User Input):
THIS SECTION'S JOB: Structural scaffolding: header/nav/footer, page containers/wrappers, and the grid/column systems. Style ONLY the layout-group classes the contract assigns.
OUTPUT (Your Response):
{"css": ".frame { width: 100vw; min-height: 100vh; background: var(--bg); color: var(--text); display: grid; grid-template-columns: 1fr; position: relative; } @media (min-width: 768px) { .frame { grid-template-columns: 320px 1fr; border-left: 1px solid var(--text); } } .asymmetric-grid { display: grid; grid-template-columns: 1fr; gap: var(--grid_gap); } @media (min-width: 1024px) { .asymmetric-grid { grid-template-columns: repeat(3, 1fr); } }"}

**Example 2 (For CSS section: 'base')**
PROMPT (User Input):
THIS SECTION'S JOB: Reset, box-sizing, html/body, base typography (headings, paragraphs, lists), links, images, and any global element defaults. Reference tokens via var(--…).
OUTPUT (Your Response):
{"css": "*, *::before, *::after { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-body); -webkit-font-smoothing: antialiased; } h1.display { font-family: var(--font-display); font-size: clamp(4rem, 12vw, 11rem); line-height: 0.82; letter-spacing: -0.05em; text-transform: uppercase; margin: 0; padding-bottom: var(--space-lg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); } h1.display:hover { transform: skewX(-5deg) scale(1.02); color: var(--accent); } p.lede { font-family: var(--font-body); font-size: clamp(1.2rem, 2.5vw, 1.8rem); max-width: 40ch; line-height: 1.3; }"}
`;

export const LAYOUT_EXEMPLARS = `
**Example 1 (For Layout: 'shell')**
PROMPT (User Input):
This "shell" layout MUST contain these exact placeholder(s): {{CONTENT}}
Optional placeholder(s): {{NAV_LINKS}}, {{THEME_PILLS}}, {{SOURCE_PATH}}
OUTPUT (Your Response):
{"html": "<div class=\\"frame\\"><nav class=\\"global-nav\\">{{NAV_LINKS}}</nav><main class=\\"main-content-flow\\">{{CONTENT}}</main><footer class=\\"global-footer\\">{{THEME_PILLS}}</footer></div>"}

**Example 2 (For Layout: 'home')**
PROMPT (User Input):
This "home" layout MUST contain these exact placeholder(s): {{FEATURED_PROJECTS}}
Optional placeholder(s): {{HEADLINE}}, {{TAGLINE}}, {{INTRO}}
OUTPUT (Your Response):
{"html": "<section class=\\"home-container\\"><header class=\\"hero\\"><h1 class=\\"display kinetic-hover\\">{{HEADLINE}}</h1><p class=\\"lede\\">{{TAGLINE}}</p><div class=\\"prose\\">{{INTRO}}</div></header><div class=\\"grid precision-border-top\\">{{FEATURED_PROJECTS}}</div></section>"}

**Example 3 (For Layout: 'projects_index')**
PROMPT (User Input):
This "projects_index" layout MUST contain these exact placeholder(s): {{PROJECT_LIST}}
Optional placeholder(s): {{PROJECT_COUNT}}
OUTPUT (Your Response):
{"html": "<div class=\\"editorial-wrapper\\"><h2 class=\\"section-title\\">Selected Works ({{PROJECT_COUNT}})</h2><div class=\\"asymmetric-grid scroll-reveal\\">{{PROJECT_LIST}}</div></div>"}

**Example 4 (For Layout: 'project_item')**
PROMPT (User Input):
This "project_item" layout MUST contain these exact placeholder(s): {{NAME}}, {{URL}}
Optional placeholder(s): {{DESCRIPTION}}, {{YEAR}}, {{TECH_BADGES}}, {{LOGO}}, {{INDEX}}, {{REPO_URL}}
OUTPUT (Your Response):
{"html": "<article class=\\"project-card hover-preview-trigger\\"><figure class=\\"project-image fluid-mask\\">{{LOGO}}</figure><div class=\\"project-meta\\"><a href=\\"{{URL}}\\" class=\\"project-link\\"><h3 class=\\"project-title\\">{{NAME}}</h3></a><p class=\\"project-desc\\">{{DESCRIPTION}}</p><span class=\\"project-date mono-tag\\">{{YEAR}}</span><div class=\\"badges\\">{{TECH_BADGES}}</div></div></article>"}
`;
