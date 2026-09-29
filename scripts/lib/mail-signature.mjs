// The signature and HTML body for mail Greg sends from the webmail. Table
// layout and inline styles only, because mail clients ignore <style> blocks
// and most of modern CSS. No images: a remote logo is blocked by default in
// most clients and an inline one shows up as an attachment, so the mark is set
// in type instead.

const SIGNATURE = {
  name: 'Greg Iteen',
  role: 'Systems engineer · AI agent infrastructure',
  links: [
    ['gregiteen.xyz', 'https://gregiteen.xyz'],
    ['LinkedIn', 'https://www.linkedin.com/in/gregiteen'],
    ['GitHub', 'https://github.com/gregiteen'],
  ],
};

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function signatureText() {
  return `-- \n${SIGNATURE.name}\n${SIGNATURE.role}\n${SIGNATURE.links.map(([, href]) => href).join('\n')}`;
}

export function signatureHtml() {
  const mono = "'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,monospace";
  const sans = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const links = SIGNATURE.links
    .map(([label, href]) => `<a href="${href}" style="color:#ff6a00;text-decoration:none;">${escapeHtml(label)}</a>`)
    .join('<span style="color:#b5b5b0;">&nbsp;&nbsp;/&nbsp;&nbsp;</span>');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-collapse:collapse;">
  <tr>
    <td style="width:3px;background:#ff6a00;padding:0;" width="3"></td>
    <td style="padding:2px 0 2px 16px;">
      <div style="font-family:${sans};font-size:17px;font-weight:900;letter-spacing:-0.3px;line-height:1.1;color:#111111;">${escapeHtml(SIGNATURE.name)}<span style="color:#ff6a00;">.</span></div>
      <div style="font-family:${mono};font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:#6b6b66;padding-top:6px;">${escapeHtml(SIGNATURE.role)}</div>
      <div style="font-family:${mono};font-size:12px;padding-top:10px;">${links}</div>
    </td>
  </tr>
</table>`;
}

/** Plain text as email HTML: escaped, paragraphs kept, links made clickable. */
function textToHtml(text) {
  const linked = escapeHtml(text).replace(/\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" style="color:#ff6a00;">${url}</a>`);
  return linked.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('');
}

/**
 * Builds the text and HTML parts of an outgoing message.
 * @param {{ text: string, pixelUrl?: string }} input
 */
export function composeOutgoing({ text, pixelUrl }) {
  const body = String(text || '').replace(/\r\n/g, '\n').trimEnd();
  const pixel = pixelUrl ? `<img src="${escapeHtml(pixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;">` : '';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;">
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111111;max-width:640px;">
${textToHtml(body)}
${signatureHtml()}
</div>${pixel}</body></html>`;
  return { text: `${body}\n\n${signatureText()}\n`, html };
}
