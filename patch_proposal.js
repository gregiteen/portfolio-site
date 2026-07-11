import fs from 'fs';
let code = fs.readFileSync('scripts/serve.mjs', 'utf8');

// 1. Update the AI Prompt to generate HTML
code = code.replace(
  'Use rich formatting in your Markdown (e.g., bolding, lists, nested bullet points) so it looks highly structured and detailed.',
  'Use rich, beautiful HTML (e.g., semantic tags, styled tables, CSS infographics, charts, and inline styles) so it looks highly structured and detailed, like a modern PRD.'
);

code = code.replace(
  /Return plain Markdown using exactly this delimiter contract.*?the full proposal in clean Markdown/s,
  'Return plain text using exactly this delimiter contract. Do NOT put the HTML inside a JSON string and do not wrap the response in a code fence:\nSUBJECT: Proposal: [project type] for [company]\n---PROPOSAL---\n<div class="proposal-html">\nthe full proposal in rich HTML\n</div>'
);

// 2. Add the /proposal/:id route
const routeSnippet = `
  // ── Branded proposal HTML page ──
  if (urlPath.startsWith('/proposal/') && req.method === 'GET') {
    const proposalId = urlPath.slice('/proposal/'.length).replace(/\\/+$/, '');
    const thread = proposalThreads.get(proposalId);
    if (!thread) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      return res.end('<h1>Proposal not found</h1>');
    }
    const html = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>\${escapeHtml(thread.proposal.subject_line || 'Proposal')}</title>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px; background: #f9f9f9; }
  .proposal-html { background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  h1, h2, h3 { color: #111; margin-top: 1.5em; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
  th { background-color: #f5f5f5; }
  a { color: #ff6a00; text-decoration: none; }
  .cta { display: inline-block; background: #ff6a00; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 30px; }
</style>
</head>
<body>
  \${thread.proposal.proposal_text}
  <div style="margin-top: 40px; text-align: center;">
    <a class="cta" href="/sign/\${proposalId}">Proceed to Signing &rarr;</a>
  </div>
</body>
</html>\`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
`;

code = code.replace('  // ── Branded proposal-signing handoff page ──', routeSnippet + '\n  // ── Branded proposal-signing handoff page ──');

// 3. Update the email body to link to the web proposal instead of injecting the raw text
code = code.replace(
  'const clientEmailText = `${thread.proposal.client_email_draft}${signingBlock}\\n${\'─\'.repeat(40)}\\n\\n${thread.proposal.proposal_text}\\n\\n— Greg Iteen\\ngregiteen.xyz`;',
  'const webUrl = `${SITE_URL}/proposal/${proposalId}`;\n  const clientEmailText = `${thread.proposal.client_email_draft}\\n\\nView your interactive proposal here: ${webUrl}${signingBlock}\\n\\n— Greg Iteen\\ngregiteen.xyz`;'
);

fs.writeFileSync('scripts/serve.mjs', code);
console.log('scripts/serve.mjs updated');
