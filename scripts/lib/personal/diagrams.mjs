/**
 * Inline SVG diagrams for the ideas. Strokes use pathLength="1" so the
 * page script can draw them on scroll with a single dash animation. Labels are
 * the real artifacts the systems produce (file names, extensions), not decoration.
 */
const T = (x, y, s, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="dg-t">${s}</text>`;

export const DIAGRAMS = {
  // Markdown document -> validated operation -> committed file plus audit line.
  files: `<svg viewBox="0 0 360 220" role="img" aria-label="A Markdown document becomes a validated operation, then a committed file with an audit line">
  <g class="dg" fill="none" stroke="currentColor" stroke-width="1.4">
    <path pathLength="1" d="M20 30h96v150H20z"/>
    <path pathLength="1" d="M32 52h48M32 66h64M32 80h40" />
    <path pathLength="1" d="M32 106h72M32 120h68M32 134h72M32 148h52" opacity=".55"/>
    <path pathLength="1" d="M126 105h34"/><path pathLength="1" d="M154 99l6 6-6 6"/>
    <path pathLength="1" d="M168 70h62v70h-62z"/>
    <path pathLength="1" d="M180 90h38M180 104h38M180 118h24" opacity=".55"/>
    <path pathLength="1" d="M238 105h34"/><path pathLength="1" d="M266 99l6 6-6 6"/>
    <path pathLength="1" d="M280 30h64v150h-64z"/>
    <path pathLength="1" d="M290 52h44M290 66h44M290 80h30" />
    <path pathLength="1" d="M290 150h44" stroke="#ff6a00"/>
    <path pathLength="1" d="M290 162h44" stroke="#ff6a00" opacity=".5"/>
  </g>
  ${T(20, 202, 'note.md')}${T(168, 202, 'operation')}${T(280, 202, 'committed')}
</svg>`,

  // Many documents collapse into one .ucw bundle.
  bundle: `<svg viewBox="0 0 360 220" role="img" aria-label="Many documents collapse into a single .ucw bundle">
  <g class="dg" fill="none" stroke="currentColor" stroke-width="1.4">
    <path pathLength="1" d="M20 24h70v30H20z"/><path pathLength="1" d="M34 70h70v30H34z"/><path pathLength="1" d="M20 116h70v30H20z"/><path pathLength="1" d="M34 162h70v30H34z"/>
    <path pathLength="1" d="M90 39C150 39 150 110 214 110"/><path pathLength="1" d="M104 85C158 85 160 110 214 110"/>
    <path pathLength="1" d="M90 131C150 131 160 110 214 110"/><path pathLength="1" d="M104 177C160 177 160 110 214 110"/>
    <path pathLength="1" d="M214 70h126v80H214z" stroke="#ff6a00"/>
    <path pathLength="1" d="M230 92h94M230 106h94M230 120h60" opacity=".6"/>
  </g>
  ${T(277, 172, '.ucw', 'middle')}${T(20, 208, 'documents')}
</svg>`,

  // A repeated multi-step procedure becomes one named verb, listed in the instructions.
  verbs: `<svg viewBox="0 0 360 220" role="img" aria-label="A repeated procedure of several steps becomes one named command, which the instruction files list">
  <g class="dg" fill="none" stroke="currentColor" stroke-width="1.4">
    <path pathLength="1" d="M20 40h84v22H20z"/><path pathLength="1" d="M20 84h84v22H20z" opacity=".75"/><path pathLength="1" d="M20 128h84v22H20z" opacity=".5"/>
    <path pathLength="1" d="M62 62v22M62 106v22" opacity=".55"/>
    <path pathLength="1" d="M114 40c14 0 14 55 28 55M114 150c14 0 14-55 28-55"/>
    <path pathLength="1" d="M148 76h84v38h-84z" stroke="#ff6a00"/>
    <path pathLength="1" d="M240 95h26"/><path pathLength="1" d="M260 89l6 6-6 6"/>
    <path pathLength="1" d="M274 40h66v110h-66z"/>
    <path pathLength="1" d="M284 58h46M284 72h46M284 86h30" opacity=".55"/>
    <path pathLength="1" d="M284 104h46" stroke="#ff6a00"/>
  </g>
  ${T(20, 174, 'procedure')}${T(190, 132, 'verb', 'middle')}${T(274, 174, 'instructions')}
</svg>`,

  // One vault compiles into each agent's instruction file.
  memory: `<svg viewBox="0 0 360 220" role="img" aria-label="One vault of rules compiles into CLAUDE.md, AGENTS.md and GEMINI.md">
  <g class="dg" fill="none" stroke="currentColor" stroke-width="1.4">
    <circle pathLength="1" cx="62" cy="110" r="38" stroke="#ff6a00"/>
    <circle pathLength="1" cx="62" cy="110" r="22" opacity=".5"/>
    <path pathLength="1" d="M100 110C160 110 170 40 226 40"/><path pathLength="1" d="M100 110h126"/><path pathLength="1" d="M100 110C160 110 170 180 226 180"/>
    <path pathLength="1" d="M226 26h114v28H226z"/><path pathLength="1" d="M226 96h114v28H226z"/><path pathLength="1" d="M226 166h114v28H226z"/>
  </g>
  ${T(62, 114, 'vault', 'middle')}${T(240, 44, 'CLAUDE.md')}${T(240, 114, 'AGENTS.md')}${T(240, 184, 'GEMINI.md')}
</svg>`,
};
