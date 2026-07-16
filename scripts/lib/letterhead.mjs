// Renders a proposal as a branded letterhead PDF (Greg's stamped-ink logo +
// contact info, header/footer on every page). Used for both the Greg-approval
// email preview and the final client-facing document submitted to Documenso
// for signature.
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTACT_LINE = 'sales@gregiteen.xyz   ·   gregiteen.xyz   ·   github.com/gregiteen';

// Black-on-transparent wordmark — safe on white paper. (An earlier version of
// this file typed the wordmark in Courier because only an opaque-black-bg
// logo PNG existed; gi-logo-transparent.png has since been added.)
export const LOGO_PATH = join(__dirname, '..', '..', 'static', 'gi-logo-transparent.png');

// Draws the logo (or falls back to the typed dot-accent wordmark if the PNG
// is ever missing) plus the contact line. Shared with the rate-card PDF so
// all outbound collateral carries the same header.
export function drawLetterheadHeader(doc, { x = 60, y = 56 } = {}) {
  if (existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, x, y, { height: 26 });
    doc.y = y + 26;
  } else {
    doc.font('Courier-Bold').fontSize(22).fillColor('#111111').text('greg', x, y, { continued: true });
    doc.fillColor('#ff6a00').text('.', { continued: true });
    doc.fillColor('#111111').text('iteen');
  }
  doc.font('Courier').fontSize(9).fillColor('#555555').text(CONTACT_LINE, x, doc.y + 6);
  doc.moveDown(0.6);
  doc.moveTo(x, doc.y).lineTo(552, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
  doc.moveDown(1);
}

// The signature block is drawn at a FIXED position on page 1 so the Documenso
// signature field (placed via percentage coordinates in the API) lands exactly
// on the drawn line instead of floating over body text. LETTER = 612×792pt.
const SIG_BLOCK = { labelY: 588, boxTop: 604, lineY: 668, sigX1: 60, sigX2: 300, dateX1: 420, dateX2: 552 };

// Documenso field coords, in percent of page size, matching the drawn box.
export const SIGNATURE_FIELD = {
  pageNumber: 1,
  pageX: Number(((SIG_BLOCK.sigX1 / 612) * 100).toFixed(2)),
  pageY: Number(((SIG_BLOCK.boxTop / 792) * 100).toFixed(2)),
  pageWidth: Number((((SIG_BLOCK.sigX2 - SIG_BLOCK.sigX1) / 612) * 100).toFixed(2)),
  pageHeight: Number((((SIG_BLOCK.lineY - SIG_BLOCK.boxTop) / 792) * 100).toFixed(2)),
};

function drawSignatureBlock(doc) {
  doc.moveTo(60, SIG_BLOCK.labelY - 12).lineTo(552, SIG_BLOCK.labelY - 12).strokeColor('#dddddd').lineWidth(1).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#888888')
    .text('ACCEPTED & AGREED', 60, SIG_BLOCK.labelY, { characterSpacing: 0.5, lineBreak: false });

  doc.moveTo(SIG_BLOCK.sigX1, SIG_BLOCK.lineY).lineTo(SIG_BLOCK.sigX2, SIG_BLOCK.lineY).strokeColor('#111111').lineWidth(0.75).stroke();
  doc.moveTo(SIG_BLOCK.dateX1, SIG_BLOCK.lineY).lineTo(SIG_BLOCK.dateX2, SIG_BLOCK.lineY).strokeColor('#111111').lineWidth(0.75).stroke();

  doc.font('Helvetica').fontSize(8).fillColor('#888888');
  doc.text('Signature', SIG_BLOCK.sigX1, SIG_BLOCK.lineY + 5, { lineBreak: false });
  doc.text('Date', SIG_BLOCK.dateX1, SIG_BLOCK.lineY + 5, { lineBreak: false });
}

export function buildLetterheadPdf({ subject, bodyText, clientName, clientEmail, proposalId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 56, left: 60, right: 60 }, bufferPages: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawLetterheadHeader(doc);

    // Title block
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111111').text(subject || 'Project Proposal', 60, doc.y);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Helvetica').fontSize(9).fillColor('#888888')
      .text(`Prepared for ${clientName || clientEmail || 'Client'} · ${dateStr} · Ref #${proposalId}`);
    doc.moveDown(1.2);

    const proposalUrl = `https://gregiteen.xyz/proposal/${proposalId}`;
    const signaturePageText = `This document serves as the signature page for the project proposal:
${subject || 'Project Proposal'}.

The full interactive proposal, including all project details, scope, and pricing, is hosted securely online at:`;

    doc.font('Helvetica').fontSize(11).fillColor('#333333').text(signaturePageText, {
      width: 492,
      align: 'left',
      lineGap: 4
    });
    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#ff6a00')
      .text(proposalUrl, { width: 492, link: proposalUrl, underline: false });
    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(11).fillColor('#333333').text(
      'By signing below, you are accepting the terms and scope as outlined in the interactive proposal.',
      { width: 492, align: 'left', lineGap: 4 }
    );

    doc.moveDown(1.5);
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666666').text('Please review the web proposal before signing.', {
      width: 492,
      align: 'left'
    });

    // Fixed-position signature block — coordinates mirrored by SIGNATURE_FIELD
    // for Documenso field placement.
    drawSignatureBlock(doc);

    // Footer on every page (must run after content flows, via bufferPages).
    // Writing near the bottom margin makes pdfkit think the content overflows
    // and silently starts a NEW page for the footer text alone — zeroing the
    // bottom margin for this write disables that auto-pagination check.
    const range = doc.bufferedPageRange();
    const footerY = doc.page.height - 40;
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa')
        .text(`greg.iteen · proposal ${proposalId} · page ${i + 1} of ${range.count}`, 60, footerY, { width: 492, align: 'center', lineBreak: false });
      doc.page.margins.bottom = savedBottom;
    }

    doc.end();
  });
}
