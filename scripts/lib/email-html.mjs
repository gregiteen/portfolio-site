// Prepares a received HTML email for display inside the webmail's sandboxed
// iframe. Remote content is blocked by a Content-Security-Policy written into
// the document itself, so nothing the sender embeds (images, CSS url(), fonts)
// is fetched until Greg asks for images. Tracking pixels are removed outright,
// even when images are shown, because loading one tells the sender the
// message was opened. Inline cid: images are resolved from the message's own
// attachments and always display.

const PIXEL_SRC = [
  /\/(open|opened|track|tracking|pixel|beacon|wf\/open|trk|o)(\.gif|\.png|\/|\?|$)/i,
  /[?&](open|track|pixel)=/i,
  /(list-manage\.com\/track|sendgrid\.net\/wf|mandrillapp\.com\/track|hubspot(links)?\.com|mailtrack\.io|mixmax\.com|yesware\.com|streak\.com|superhuman\.com|mailchimp\.com\/track|sparkpostmail\.com|mailgun\.org\/o|customer\.io\/e\/o|awstrack\.me|emltrk\.com|bananatag|getnotify|pixel\.)/i,
];

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : null;
}

const tiny = (v) => v != null && /^\s*[0-3](px)?\s*$/i.test(String(v));

/** True when an <img> tag looks like an open-tracking pixel. */
export function isTrackingPixel(tag) {
  const src = attr(tag, 'src') || '';
  if (/^(data|cid):/i.test(src)) return false;
  const style = (attr(tag, 'style') || '').toLowerCase();
  if (tiny(attr(tag, 'width')) || tiny(attr(tag, 'height'))) return true;
  if (/(^|;)\s*(width|height|max-width|max-height)\s*:\s*[0-3](px)?\s*(;|$|!)/.test(style)) return true;
  if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(\.0+)?\s*(;|$)/.test(style)) return true;
  return PIXEL_SRC.some((re) => re.test(src));
}

const REMOTE_REF = /(?:\ssrc\s*=\s*["']?\s*https?:|\sbackground\s*=\s*["']?\s*https?:|url\(\s*["']?\s*https?:|\ssrcset\s*=\s*["']?\s*https?:)/gi;

/**
 * @param {string} html
 * @param {{ showRemote?: boolean, attachments?: Array<{contentId?: string, cid?: string, contentType?: string, content?: Buffer}> }} options
 * @returns {{ html: string, remoteCount: number, pixelCount: number }}
 */
export function prepareEmailHtml(html, { showRemote = false, attachments = [] } = {}) {
  let out = String(html || '');
  let pixelCount = 0;

  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    if (isTrackingPixel(tag)) { pixelCount += 1; return ''; }
    return tag;
  });

  const inline = new Map();
  for (const a of attachments) {
    const id = String(a.contentId || a.cid || '').replace(/^<|>$/g, '');
    if (id && a.content) inline.set(id.toLowerCase(), `data:${a.contentType || 'application/octet-stream'};base64,${Buffer.from(a.content).toString('base64')}`);
  }
  out = out.replace(/(["'(])cid:([^"')\s]+)/gi, (whole, lead, id) => {
    const uri = inline.get(decodeURIComponent(id).toLowerCase());
    return uri ? `${lead}${uri}` : whole;
  });

  const remoteCount = (out.match(REMOTE_REF) || []).length;
  const imgSrc = showRemote ? 'data: https: http:' : 'data:';
  const csp = `default-src 'none'; img-src ${imgSrc}; style-src 'unsafe-inline'${showRemote ? ' https:' : ''}; font-src data:${showRemote ? ' https:' : ''}; form-action 'none'; base-uri 'none'`;
  const head = `<meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><base target="_blank">`;
  out = /<head[^>]*>/i.test(out) ? out.replace(/<head[^>]*>/i, (m) => `${m}${head}`) : `${head}${out}`;
  return { html: out, remoteCount, pixelCount };
}
