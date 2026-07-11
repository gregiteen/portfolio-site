// Shared theme machinery for the SSSS design generator and the site builder.
//
// Contract: the AI generates a *skin* — CSS plus HTML layout templates that use
// {{PLACEHOLDER}} slots. It never writes portfolio copy. The build script fills
// every slot from the vault at build time, so content cannot drift from the
// source of truth no matter what the model outputs.

/** Placeholder contract per layout template. `required` slots must appear. */
export const LAYOUT_SPECS = {
  shell: {
    required: ['{{CONTENT}}'],
    optional: ['{{NAV_LINKS}}', '{{THEME_PILLS}}', '{{SOURCE_PATH}}'],
  },
  home: {
    required: ['{{FEATURED_PROJECTS}}'],
    optional: ['{{HEADLINE}}', '{{TAGLINE}}', '{{INTRO}}', '{{FEATURED_COUNT}}'],
  },
  projects_index: {
    required: ['{{PROJECT_LIST}}'],
    optional: ['{{PROJECT_COUNT}}'],
  },
  designs_index: {
    required: ['{{DESIGN_CARDS}}'],
    optional: ['{{DESIGN_COUNT}}'],
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
const VOID_HTML_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);
const KNOWN_PLACEHOLDERS = new Set(
  Object.values(LAYOUT_SPECS).flatMap((spec) => [...spec.required, ...spec.optional])
    .map((placeholder) => placeholder.slice(2, -2))
);

// Generated logo images are a frequent source of embedded checkerboards,
// illegible marks, and unbounded intrinsic dimensions. The static brand asset
// is verified, copied into every design build, and has a predictable footprint.
// Both verified brand marks: -dark is white text (for dark backgrounds),
// the plain one is black text (for light backgrounds). Themes pick by their
// shell background; both get the same enforced sizing.
const VERIFIED_BRAND_ASSET = 'gi-logo-transparent-dark.png';
const BRAND_ASSET_RE = /gi-logo-transparent(-dark)?\.png/i;
const BRAND_ASSET_CSS = `
/* Release invariant: a generated skin may not let an untrusted logo asset take over the viewport. */
.nav-bar img[src*="gi-logo-transparent"], header img[src*="gi-logo-transparent"],
.nav-bar img[src*="assets/logo"], header img[src*="assets/logo"] {
  display: block;
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
  object-position: left center !important;
}
.verified-brand-mark {
  inline-size: min(11.25rem, 48vw) !important;
  block-size: 3.5rem !important;
  max-inline-size: 100% !important;
  max-block-size: 3.5rem !important;
  object-fit: contain !important;
}
/* build-site emits both navigation layers; generated skins own the custom one. */
.tl-default { display: none !important; }
.tl-custom { display: flex; flex-wrap: wrap; align-items: center; }
`;

/* Motion runtime contract: build-site injects a script that tags content
   sections with .gi-reveal and flips .gi-in as they scroll into view. Themes
   may override the transition; this default guarantees every generated site
   has scroll life even if the theme ignores it. Hidden states live behind
   no-preference so reduced-motion users (and the rendered release audit,
   which emulates reduced motion) always see fully-painted pages. */
const MOTION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .gi-reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); transition-delay: var(--gi-stagger, 0s); }
  .gi-reveal.gi-in { opacity: 1; transform: none; }
}
`;

/**
 * Normalize layout references to the known brand asset and make its rendered
 * size explicit. This is deterministic release hardening, not model judgment.
 */
export function enforceBrandAssetContract(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const layouts = Object.fromEntries(
    Object.entries(payload.layouts || {}).map(([key, html]) => [
      key,
      typeof html !== 'string' ? html : html
        .replace(/<img\b([^>]*\bsrc=(['"])(?:gi-logo-transparent(?:-dark)?\.png|assets\/logo\.png)\2[^>]*)>/gi, (tag, attributes) => {
          if (/\bclass\s*=/.test(attributes)) {
            return `<img${attributes.replace(/class=(['"])([^'"]*)\1/i, (_, quote, classes) => `class=${quote}${classes} verified-brand-mark${quote}`)}>`;
          }
          return `<img class="verified-brand-mark"${attributes}>`;
        }),
    ])
  );
  let css = payload.css;
  if (typeof css === 'string') {
    if (!BRAND_ASSET_RE.test(css)) css = `${css}\n${BRAND_ASSET_CSS}`;
    if (!css.includes('.gi-reveal')) css = `${css}\n${MOTION_CSS}`;
  }
  return { ...payload, css, layouts };
}

function validateCssStructure(css) {
  const errors = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let comment = false;
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    const next = css[i + 1];
    if (comment) {
      if (char === '*' && next === '/') { comment = false; i++; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '*') { comment = true; i++; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth < 0) {
        errors.push('stylesheet has an unmatched closing brace');
        break;
      }
    }
  }
  if (comment) errors.push('stylesheet has an unclosed comment');
  if (quote) errors.push('stylesheet has an unclosed string');
  if (depth > 0) errors.push('stylesheet has unclosed brace(s)');
  return errors;
}

function validateHtmlFragment(template) {
  const errors = [];
  const withoutComments = template.replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const tags = /<\/?([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*)?>/g;
  let match;
  while ((match = tags.exec(withoutComments)) !== null) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    const closing = raw.startsWith('</');
    const selfClosing = raw.endsWith('/>') || VOID_HTML_ELEMENTS.has(tag);
    if (closing) {
      if (stack.at(-1) !== tag) {
        errors.push(`HTML has an unmatched or misnested </${tag}> tag`);
        break;
      }
      stack.pop();
    } else if (!selfClosing) {
      stack.push(tag);
    }
  }
  if (!errors.length && stack.length) {
    errors.push(`HTML has unclosed tag(s): ${stack.map((tag) => `<${tag}>`).join(', ')}`);
  }

  const visibleText = withoutComments
    .replace(/\{\{[A-Z0-9_]+\}\}/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:#\d+|#x[0-9a-f]+|[a-z]+);/gi, '')
    .trim();
  if (/[A-Za-z0-9]/.test(visibleText)) {
    errors.push('HTML contains hardcoded visible text instead of placeholders');
  }
  return errors;
}

/**
 * Validate + normalize a generated theme payload.
 * Returns { errors, warnings, theme }. `errors` are repairable-by-the-model
 * problems; with `strict: false`, layouts that fail their placeholder
 * contract are dropped instead (the build falls back to the default layout).
 */
export function validateThemePayload(payload, { strict = true, requireAllLayouts = false, requireHero = false } = {}) {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== 'object') {
    return { errors: ['payload is not a JSON object'], warnings, theme: null };
  }

  const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim().slice(0, 60) : null;
  if (!name) errors.push('missing "name" (short human-readable theme name)');

  let css = typeof payload.css === 'string' ? payload.css.trim() : '';
  css = css.replace(/^```[a-z]*\n/i, '').replace(/\n?```$/, '');
  css = css.replace(/<\/?style\b[^>]*>/gi, '');
  if (css.length < 80) errors.push('"css" must be a complete stylesheet (got ' + css.length + ' chars)');
  errors.push(...validateCssStructure(css));

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
    if (typeof tpl !== 'string' || !tpl.trim()) {
      if (requireAllLayouts) errors.push(`missing required layout "${key}"`);
      continue;
    }
    const missing = spec.required.filter((ph) => !tpl.includes(ph));
    if (missing.length) {
      const msg = `layout "${key}" is missing required placeholder(s): ${missing.join(', ')}`;
      if (strict) { errors.push(msg); } else { warnings.push(msg + ' — layout dropped'); continue; }
    }
    // Generated layouts are inert markup: no scripts allowed. Strip the whole
    // block (not just neuter the opening tag) — escaping `<script` alone left
    // the JS body as literal visible text on the page. Models sometimes close
    // with a second `<script>` instead of `</script>`, so fall back to
    // stripping to the next `<script` or end-of-string when unclosed.
    let clean = tpl.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    clean = clean.replace(/<script\b[^>]*>[\s\S]*?(?=<script\b|$)/gi, '');
    // Layouts are fragments — build-site.mjs assembles the one real
    // <!doctype>/<html>/<head>/<body> around them. A model that ignores
    // instructions and emits its own document shell here (seen live: a
    // full `<!doctype html><html><head>...</head>...</html>` "shell"
    // layout with no <body> at all) makes build-site.mjs's wrap-in-<body>
    // fallback nest a whole document inside an extra <body> — invalid,
    // visibly broken markup that shipped to real visitors twice before
    // this was caught. Strip any wrapper tags unconditionally so a
    // non-compliant model output can never produce malformed nesting,
    // regardless of what it emits.
    if (/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(clean)) {
      warnings.push(`layout "${key}" contained its own document shell (<!doctype>/<html>/<head>/<body>) — stripped to a fragment`);
      clean = clean.replace(/<!doctype[^>]*>/gi, '');
      clean = clean.replace(/<\/?html[^>]*>/gi, '');
      clean = clean.replace(/<head[^>]*>[\s\S]*?<\/head\s*>/gi, '');
      clean = clean.replace(/<\/?body[^>]*>/gi, '');
      clean = clean.trim();
    }
    const unknownPlaceholders = [...clean.matchAll(/\{\{([^}]+)\}\}/g)]
      .map((match) => match[1])
      .filter((placeholder) => !KNOWN_PLACEHOLDERS.has(placeholder));
    if (unknownPlaceholders.length) {
      const msg = `layout "${key}" uses unknown placeholder(s): ${[...new Set(unknownPlaceholders)].join(', ')}`;
      if (strict) { errors.push(msg); } else { warnings.push(msg + ' — layout dropped'); continue; }
    }
    const markupErrors = validateHtmlFragment(clean);
    if (markupErrors.length) {
      const msg = `layout "${key}" ${markupErrors.join('; ')}`;
      if (strict) { errors.push(msg); } else { warnings.push(msg + ' — layout dropped'); continue; }
    }
    layouts[key] = clean;
  }
  for (const key of Object.keys(rawLayouts)) {
    if (!LAYOUT_SPECS[key]) warnings.push(`unknown layout "${key}" ignored`);
  }

  if (requireHero && !/assets\/hero\.jpg/i.test(css)) {
    errors.push('stylesheet must visibly reference assets/hero.jpg for the home hero');
  }

  return { errors, warnings, theme: errors.length ? null : { name, accent, css, layouts } };
}

// Scans for the closing brace matching the '{' at `start` by tracking depth
// and respecting string literals — unlike lastIndexOf('}'), a stray extra
// '}' some models tack on after an otherwise-complete object won't get
// pulled in. Returns -1 if no balanced close is found (e.g. a stray quote
// elsewhere in the object fooled the string tracker).
function findBalancedEnd(s, start) {
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// Closes an object the model stopped emitting mid-way (observed live with
// finishReason STOP, not MAX_TOKENS — the model just never emitted a closing
// brace) by tracking open strings/braces/brackets from `start` to the end of
// the output and appending whatever's needed to close them, in reverse order.
function closeIncompleteJson(s) {
  let inString = false, escaped = false;
  const stack = [];
  for (const ch of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }
  let repaired = s;
  if (inString) repaired += '"';
  while (stack.length) repaired += stack.pop();
  return repaired;
}

// Attempts increasingly aggressive repairs of near-valid JSON. Beyond
// trailing commas, models occasionally splice a single stray character into
// otherwise well-formed output (e.g. an extra '"' right after a boolean
// literal). V8 reports the offending offset in its error message; deleting
// that character and retrying — bounded so genuinely broken input still
// throws — heals these without guessing at every possible corruption.
function parseWithRepairs(s) {
  try {
    return JSON.parse(s);
  } catch (err) {
    try {
      return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      let current = s;
      for (let i = 0; i < 5; i++) {
        try {
          return JSON.parse(current);
        } catch (repairErr) {
          const m = /position (\d+)/.exec(repairErr.message);
          const pos = m ? Number(m[1]) : -1;
          if (pos < 0 || pos >= current.length) {
            throw new Error(`could not parse JSON from model output: ${String(err)}`);
          }
          current = current.slice(0, pos) + current.slice(pos + 1);
        }
      }
      throw new Error(`could not parse JSON from model output: ${String(err)}`);
    }
  }
}

/**
 * Pull the first JSON object out of raw model output. Handles code fences,
 * leading prose, trailing junk, and a bounded set of single-character model
 * glitches. Throws with a useful message on failure.
 */
export function extractJson(raw) {
  let s = String(raw).trim();
  const fence = s.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  if (start < 0) throw new Error('no JSON object found in model output');

  const balancedEnd = findBalancedEnd(s, start);
  const lastEnd = s.lastIndexOf('}');
  const candidates = [...new Set([balancedEnd, lastEnd])].filter((end) => end > start);

  let lastError;
  for (const end of candidates) {
    try {
      return parseWithRepairs(s.slice(start, end + 1));
    } catch (err) {
      lastError = err;
    }
  }
  // No closing brace anywhere (or every candidate still failed): the model
  // may have stopped mid-object. Try auto-closing whatever's left open.
  try {
    return parseWithRepairs(closeIncompleteJson(s.slice(start)));
  } catch (err) {
    // Consistent contract: return a parsed object or throw. Silently
    // returning undefined here made callers crash later on `undefined.x`
    // (e.g. improve-theme reading `.score`) instead of skipping gracefully.
    throw lastError || err;
  }
}
