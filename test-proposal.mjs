import { generateDelimitedProposal } from './scripts/serve.mjs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("No GOOGLE_API_KEY");

  const prompt = `CLIENT NEEDS ASSESSMENT:
The client needs a new marketing website.

Write a professional, compelling, and SUPER SPECIFIC project proposal. Include:
1. Executive summary

Return plain text using exactly this delimiter contract. Do NOT put the HTML inside a JSON string and do not wrap the response in a code fence:
SUBJECT: Proposal: [project type] for [company]
---PROPOSAL---
<div class="proposal-html">
the full proposal in rich HTML
</div>
---CLIENT_EMAIL---
a brief, warm email to the client that accompanies the proposal
---END---`;

  try {
    const result = await generateDelimitedProposal(apiKey, prompt);
    console.log("SUBJECT:", result.subject_line);
    console.log("PROPOSAL TEXT:", result.proposal_text.substring(0, 200) + '...');
    console.log("EMAIL:", result.client_email_draft);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
