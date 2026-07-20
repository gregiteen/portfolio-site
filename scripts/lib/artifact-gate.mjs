// Deterministic pre-review artifact gate for generated themes.
//
// The vision review board costs 4-6 paid model calls per cycle; this gate
// catches the class of defect that is objectively detectable from markup —
// leaked template/JSON syntax rendered as visible text — before a single
// screenshot is taken. (A stray `" }` text node in the project_item template
// once survived 19 vision-review passes; this scan finds it in milliseconds.)
//
// Dependency-free by design, like the rest of the SSSS toolchain: text nodes
// are extracted with regexes, not an HTML parser. That is fine here because
// the inputs are our own generated templates and built pages, and the scan is
// deliberately conservative — a segment must consist ONLY of structural
// punctuation to be flagged, so real copy never matches.

const COMMENTS = /<!--[\s\S]*?-->/g;
const NON_VISIBLE_BLOCKS = /<(script|style|pre|code|template)\b[^>]*>[\s\S]*?<\/\1>/gi;

// Tag boundaries become this separator so each text NODE stays one segment;
// a plain space would shred nodes into words and break multi-char checks.
const NODE_SEP = '\u0000';

/** Visible text nodes of an HTML string, one segment per node. */
export function visibleTextSegments(html) {
  return String(html || '')
    .replace(COMMENTS, NODE_SEP)
    .replace(NON_VISIBLE_BLOCKS, NODE_SEP)
    .replace(/<[^>]*>/g, NODE_SEP)
    .split(NODE_SEP)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

// A short text node made purely of structural punctuation, containing at
// least one brace/bracket: `" }`, `"},`, `{`, `}]` — template/JSON debris.
const looksLikeSyntaxDebris = (segment) =>
  segment.length <= 12
  && /[{}[\]]/.test(segment)
  && /^["'{}[\],:;\s]+$/.test(segment);

const UNRESOLVED_PLACEHOLDER = /\{\{\s*[A-Z0-9_]+\s*\}\}/;

function scanSegments(segments, { allowPlaceholders }) {
  const findings = [];
  for (const segment of segments) {
    if (looksLikeSyntaxDebris(segment)) {
      findings.push(`stray template/JSON syntax rendered as visible text: '${segment}'`);
    } else if (segment.includes('```')) {
      findings.push(`markdown fence leaked into visible text: '${segment.slice(0, 60)}'`);
    } else if (!allowPlaceholders && UNRESOLVED_PLACEHOLDER.test(segment)) {
      findings.push(`unresolved template placeholder in visible text: '${segment.slice(0, 60)}'`);
    }
  }
  return findings;
}

/**
 * Scan candidate layout TEMPLATES (pre-fill). `{{PLACEHOLDER}}` slots are the
 * templating contract and therefore legal; debris and fences are not.
 * Returns review-board-shaped issues: [{ target, issue, severity }].
 */
export function scanLayoutSources(layouts = {}) {
  const issues = [];
  for (const [target, html] of Object.entries(layouts)) {
    for (const finding of scanSegments(visibleTextSegments(html), { allowPlaceholders: true })) {
      issues.push({
        target,
        severity: 'blocking',
        issue: `[mechanical gate] In the "${target}" layout template, ${finding}. Remove the leaked syntax from the template markup — it renders as broken page content.`,
      });
    }
  }
  return issues;
}

/**
 * Scan a BUILT page (post-fill), where an unresolved `{{...}}` is also a bug.
 * `target` is the layout slot repairs should aim at for this page.
 */
export function scanBuiltHtml(html, target, pageLabel = target) {
  const issues = [];
  for (const finding of scanSegments(visibleTextSegments(html), { allowPlaceholders: false })) {
    issues.push({
      target,
      severity: 'blocking',
      issue: `[mechanical gate] On the built "${pageLabel}" page, ${finding}. If the string is not present in the "${target}" layout itself, it originates in an item template this page embeds.`,
    });
  }
  return issues;
}
