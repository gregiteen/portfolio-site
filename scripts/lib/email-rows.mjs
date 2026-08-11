// Shared enrichment-row rendering for the two owner-facing emails:
// notifyOwner()'s visitor-arrival alert (serve.mjs) and the
// generation-complete digest (delivery.mjs). Extracted so the two emails
// cannot drift apart — GENERATION_DELIVERY_PIPELINE Phase 1.

export function parseUserAgent(ua) {
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown browser';
  const os = ua.match(/(Mac OS X|Windows NT|Linux|Android|iOS)[\s\d._]*/)?.[0] || 'Unknown OS';
  return { browser, os };
}

export function enrichmentRow(k, v, mono = false) {
  return `
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a8a88;padding:9px 16px 9px 0;white-space:nowrap;vertical-align:top;">${k}</td>
        <td style="font-family:${mono ? "'Courier New',Courier,monospace" : "'Helvetica Neue',Helvetica,Arial,sans-serif"};font-size:13px;color:#f5f5f3;padding:9px 0;">${v}</td>
      </tr>`;
}

/**
 * The full visitor-enrichment block used by notifyOwner(): the base info
 * table, the optional CNA assessment table, and the raw-UA footer. Returns
 * the exact bodyHtml the arrival email has always sent.
 */
export function renderVisitorEnrichmentHtml(info, ts) {
  const ua = info.userAgent || 'Unknown';
  const { browser, os } = parseUserAgent(ua);
  const row = enrichmentRow;
  return `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2a2a;">
        ${row('Email', `<strong>${info.email}</strong>`)}
        ${row('Style', info.style)}
        ${row('Time', ts, true)}
        ${row('IP', info.ip, true)}
        ${row('Browser', browser)}
        ${row('OS', os)}
        ${info.screen ? row('Screen', info.screen, true) : ''}
        ${info.timezone ? row('Timezone', info.timezone) : ''}
        ${info.language ? row('Language', info.language) : ''}
        ${info.referrer ? row('Referrer', info.referrer, true) : ''}
        ${info.platform ? row('Platform', info.platform) : ''}
        ${row('Touch', info.touch ? 'Yes' : 'No')}
      </table>
      ${info.cnaAssessment ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e22b22;margin-top:20px;">
        <tr><td colspan="2" style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e22b22;padding:14px 0 8px;">CNA Assessment</td></tr>
        ${Object.entries(info.cnaAssessment).map(([k, v]) => row(k.replace(/_/g, ' '), v)).join('')}
      </table>` : ''}
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.6;color:#555;margin:20px 0 0;word-break:break-all;">${ua}</p>`;
}
