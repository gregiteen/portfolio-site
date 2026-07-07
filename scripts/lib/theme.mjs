// Shared theme machinery for the SSSS design generator and the site builder.
//
// Contract: the AI generates a *skin* — CSS plus HTML layout templates that use
// {{PLACEHOLDER}} slots. It never writes portfolio copy. The build script fills
// every slot from the vault at build time, so content cannot drift from the
// source of truth no matter what the model outputs.

/** Placeholder contract per layout template. `required` slots must appear. */
export const LAYOUT_SPECS = {
  home: {
    required: ['{{FEATURED_PROJECTS}}'],
    optional: ['{{HEADLINE}}', '{{TAGLINE}}', '{{INTRO}}', '{{FEATURED_COUNT}}', '{{GENERATOR_FORM}}'],
  },
  projects_index: {
    required: ['{{PROJECT_LIST}}'],
    optional: ['{{PROJECT_COUNT}}'],
  },
  designs_index: {
    required: ['{{DESIGN_CARDS}}'],
    optional: ['{{DESIGN_COUNT}}', '{{GENERATOR_FORM}}'],
  },
  project_detail: {
    required: ['{{NAME}}', '{{CONTENT}}'],
    optional: ['{{DESCRIPTION}}', '{{ROLE}}', '{{YEAR}}', '{{TECH_BADGES}}', '{{REPO_LINK}}', '{{PROJECT_LINK}}', '{{LOGO}}', '{{SOURCE_PATH}}', '{{BACKLINK}}'],
  },
  design_detail: {
    required: ['{{NAME}}', '{{CONTENT}}'],
    optional: ['{{DESCRIPTION}}', '{{CLIENT}}', '{{ROLE}}', '{{YEAR}}', '{{TAG_BADGES}}', '{{PREVIEW}}', '{{LINK_URL}}', '{{SOURCE_PATH}}', '{{BACKLINK}}'],
  },
  page: {
    required: ['{{NAME}}', '{{CONTENT}}'],
    optional: ['{{SOURCE_PATH}}'],
  },
  project_item: {
    required: ['{{NAME}}', '{{URL}}'],
    optional: ['{{DESCRIPTION}}', '{{YEAR}}', '{{TECH_BADGES}}', '{{LOGO}}', '{{INDEX}}', '{{REPO_URL}}'],
  },
  design_item: {
    required: ['{{NAME}}', '{{URL}}'],
    optional: ['{{DESCRIPTION}}', '{{YEAR}}', '{{CLIENT}}', '{{TAG_BADGES}}', '{{PREVIEW}}'],
  },
  nav_item: {
    required: ['{{NAV_URL}}', '{{NAV_NAME}}'],
    optional: ['{{NAV_ACTIVE_CLASS}}'],
  },
};

/**
 * Parse a nested YAML map under `key` from raw frontmatter text.
 * The canonical @ssss/cli parser returns nested maps as `{}` placeholders
 * (registry validation only needs presence), so theme token maps must be
 * recovered from the raw document here.
 */
export function parseNestedMap(rawContent, key) {
  const map = {};
  const lines = rawContent.split('\n');
  const start = lines.findIndex((l) => l === `${key}:` || l.startsWith(`${key}: `));
  if (start < 0) return map;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) break; // dedent → map ended
    const m = line.match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) break;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    map[m[1]] = v;
  }
  return map;
}

/**
 * Extract `## section:<name>` fenced code blocks from a Markdown body.
 * This is how generated CSS/HTML is stored in the theme vault doc — plain
 * fenced blocks survive the standard SSSS parser untouched, unlike YAML
 * block scalars which needed a bespoke (and fragile) parser.
 */
export function extractSections(body) {
  const sections = {};
  const re = /^##\s+section:([a-z0-9_:-]+)\s*\n+```[a-zA-Z]*\n([\s\S]*?)\n```/gm;
  let m;
  while ((m = re.exec(body)) !== null) sections[m[1]] = m[2];
  return sections;
}

/** Serialize theme metadata + sections into an SSSS page document. */
export function serializeThemeDoc(meta, sections) {
  const fm = Object.entries(meta)
    .map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`)
    .join('\n');
  const blocks = Object.entries(sections)
    .filter(([, content]) => typeof content === 'string' && content.trim())
    .map(([name, content]) => {
      const lang = name === 'css' ? 'css' : 'html';
      // Fences inside content would truncate the block on re-parse.
      const safe = content.replace(/```/g, '');
      return `## section:${name}\n\n\`\`\`${lang}\n${safe}\n\`\`\``;
    })
    .join('\n\n');
  return `---\ntype: page\n${fm}\n---\n\nBespoke generated theme. CSS and layout templates live in the fenced sections below; all copy is injected from the vault at build time.\n\n${blocks}\n`;
}

/**
 * Scope a generated stylesheet so it only applies while the custom theme is
 * active. `:root`/`html` map onto `html[data-theme="custom"]`; everything
 * else gets a descendant prefix. Keyframes/font-face/imports pass through;
 * grouping at-rules (@media/@supports/@container/@layer) recurse.
 */
export function scopeCss(css, scope = '[data-theme="custom"]') {
  const rootSel = `html${scope}`;
  const out = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    // Skip whitespace and comments between rules.
    if (/\s/.test(css[i])) { i++; continue; }
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    const braceIdx = css.indexOf('{', i);
    const semiIdx = css.indexOf(';', i);
    // Statement at-rule (e.g. @import, @charset) or trailing junk.
    if (braceIdx < 0 || (semiIdx >= 0 && semiIdx < braceIdx)) {
      const end = semiIdx < 0 ? n : semiIdx + 1;
      out.push(css.slice(i, end).trim());
      i = end;
      continue;
    }
    const prelude = css.slice(i, braceIdx).trim();
    // Find the matching closing brace.
    let depth = 1;
    let j = braceIdx + 1;
    while (j < n && depth > 0) {
      if (css.startsWith('/*', j)) { const e = css.indexOf('*/', j + 2); j = e < 0 ? n : e + 2; continue; }
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const inner = css.slice(braceIdx + 1, j - 1);
    if (prelude.startsWith('@')) {
      const name = prelude.slice(1).split(/[\s(]/)[0].toLowerCase();
      if (['media', 'supports', 'container', 'layer'].includes(name)) {
        out.push(`${prelude} {\n${scopeCss(inner, scope)}\n}`);
      } else {
        // @keyframes, @font-face, @property, @page … pass through unscoped.
        out.push(`${prelude} {${inner}}`);
      }
    } else {
      const scoped = prelude
        .split(',')
        .map((sel) => {
          const s = sel.trim();
          if (!s) return s;
          if (/^(:root|html)(?![\w-])/.test(s)) return s.replace(/^(:root|html)/, rootSel);
          return `${rootSel} ${s}`;
        })
        .join(', ');
      out.push(`${scoped} {${inner}}`);
    }
    i = j;
  }
  return out.join('\n');
}

/** Fill {{PLACEHOLDER}} slots. Unknown slots become '' so junk never renders. */
export function fillTemplate(template, vars) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key] ?? '') : ''
  );
}

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;

/**
 * Validate + normalize a generated theme payload.
 * Returns { errors, warnings, theme }. `errors` are repairable-by-the-model
 * problems; with `strict: false`, layouts that fail their placeholder
 * contract are dropped instead (the build falls back to the default layout).
 */
export function validateThemePayload(payload, { strict = true } = {}) {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== 'object') {
    return { errors: ['payload is not a JSON object'], warnings, theme: null };
  }

  const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim().slice(0, 60) : null;
  if (!name) errors.push('missing "name" (short human-readable theme name)');

  let css = typeof payload.css === 'string' ? payload.css.trim() : '';
  css = css.replace(/^```[a-z]*\n/i, '').replace(/\n?```$/, '');
  css = css.replace(/<\/style/gi, '');
  if (css.length < 80) errors.push('"css" must be a complete stylesheet (got ' + css.length + ' chars)');

  let accent = typeof payload.accent === 'string' && HEX_RE.test(payload.accent) ? payload.accent.match(HEX_RE)[0] : null;
  if (!accent) {
    const fromCss = css.match(HEX_RE);
    if (fromCss) { accent = fromCss[0]; warnings.push('no valid "accent"; using first color found in css'); }
    else { accent = '#888888'; warnings.push('no accent color found; defaulting to grey'); }
  }

  const layouts = {};
  const rawLayouts = payload.layouts && typeof payload.layouts === 'object' ? payload.layouts : {};
  for (const [key, spec] of Object.entries(LAYOUT_SPECS)) {
    const tpl = rawLayouts[key];
    if (typeof tpl !== 'string' || !tpl.trim()) continue; // layouts are optional
    const missing = spec.required.filter((ph) => !tpl.includes(ph));
    if (missing.length) {
      const msg = `layout "${key}" is missing required placeholder(s): ${missing.join(', ')}`;
      if (strict) { errors.push(msg); } else { warnings.push(msg + ' — layout dropped'); continue; }
    }
    // Generated layouts are inert markup: no scripts allowed.
    layouts[key] = tpl.replace(/<\s*\/?\s*script/gi, '&lt;script');
  }
  for (const key of Object.keys(rawLayouts)) {
    if (!LAYOUT_SPECS[key]) warnings.push(`unknown layout "${key}" ignored`);
  }

  return { errors, warnings, theme: errors.length ? null : { name, accent, css, layouts } };
}

/**
 * Pull the first JSON object out of raw model output. Handles code fences,
 * leading prose, and trailing junk. Throws with a useful message on failure.
 */
export function extractJson(raw) {
  let s = String(raw).trim();
  const fence = s.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON object found in model output');
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch (err) {
    // One common failure: trailing commas.
    try {
      return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      console.error('Failed to parse theme tokens file:', String(err));
    }
  }
}
