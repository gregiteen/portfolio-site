// Documenso (open-source, self-hostable DocuSign alternative — documenso.com)
// integration: submits the letterhead PDF for client e-signature and returns
// the signing link. Gated on DOCUMENSO_BASE_URL + DOCUMENSO_API_KEY; if either
// is unset, callers get `null` back and fall back to a plain PDF attachment
// with no signature workflow — same optional-integration pattern as
// GOOGLE_API_KEY elsewhere in this codebase.
//
// Unlike DocuSeal (whose self-hosted API is paywalled behind a Pro license —
// verified live, `/submissions/pdf` returns 404 "available in Pro Edition"
// even on a self-hosted instance), Documenso's public API is genuinely free
// on a self-hosted deploy. Confirmed empirically end-to-end 2026-07-09:
// create -> upload -> add signature field -> send -> signing page renders
// the real PDF with a working signature UI.
//
// Self-hosted Documenso requires S3-compatible storage for the API upload
// flow (local filesystem storage only supports the web UI). This droplet
// runs its own MinIO container for that rather than paying for a cloud
// bucket. Documenso's presigned upload URLs echo back whatever host is in
// NEXT_PRIVATE_UPLOAD_ENDPOINT, and that host must be reachable both by the
// Documenso container (Docker network) and by this Node process (runs
// directly on the droplet host, not in Docker) — so MinIO is bound to the
// droplet's private VPC IP rather than 127.0.0.1 or the Docker-internal
// hostname, and NOT exposed publicly (default-deny ufw, no rule for 9000).

const FIELD_TYPE = 'SIGNATURE';

export async function createSigningRequest({ pdfBuffer, filename, clientEmail, clientName, subject, proposalId }) {
  const baseUrl = process.env.DOCUMENSO_BASE_URL || '';
  const apiKey = process.env.DOCUMENSO_API_KEY || '';
  if (!baseUrl || !apiKey) {
    console.warn('[Documenso] DOCUMENSO_BASE_URL/DOCUMENSO_API_KEY not set — sending the PDF as a plain attachment with no signature link.');
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const createRes = await fetch(new URL('/api/v1/documents', baseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: filename || `${subject || 'Proposal'}.pdf`,
      recipients: [{ name: clientName || clientEmail, email: clientEmail, role: 'SIGNER' }],
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Documenso create-document error ${createRes.status}: ${(await createRes.text()).slice(0, 300)}`);
  }
  const created = await createRes.json();
  const { uploadUrl, documentId, recipients } = created;
  const recipientId = recipients?.[0]?.recipientId;
  const signingUrl = recipients?.[0]?.signingUrl || null;
  if (!uploadUrl || !documentId || !recipientId) {
    throw new Error(`Documenso create-document response missing uploadUrl/documentId/recipientId: ${JSON.stringify(created).slice(0, 300)}`);
  }

  const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: pdfBuffer });
  if (!uploadRes.ok) {
    throw new Error(`Documenso PDF upload error ${uploadRes.status}: ${(await uploadRes.text()).slice(0, 300)}`);
  }

  const fieldRes = await fetch(new URL(`/api/v1/documents/${documentId}/fields`, baseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      recipientId,
      type: FIELD_TYPE,
      pageNumber: 1,
      pageX: 20,
      pageY: 20,
      pageWidth: 30,
      pageHeight: 8,
    }),
  });
  if (!fieldRes.ok) {
    throw new Error(`Documenso add-field error ${fieldRes.status}: ${(await fieldRes.text()).slice(0, 300)}`);
  }

  const sendRes = await fetch(new URL(`/api/v1/documents/${documentId}/send`, baseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  if (!sendRes.ok) {
    throw new Error(`Documenso send-document error ${sendRes.status}: ${(await sendRes.text()).slice(0, 300)}`);
  }

  return { signingUrl, submissionId: documentId };
}
