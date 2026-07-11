// Renders a proposal as a branded letterhead PDF (Greg's wordmark + contact
// info, header/footer on every page). Used for both the Greg-approval email
// preview and the final client-facing document submitted to Documenso for
// signature.
import PDFDocument from 'pdfkit';

const CONTACT_LINE = 'sales@gregiteen.xyz   ·   gregiteen.xyz   ·   github.com/gregiteen';

export function buildLetterheadPdf({ subject, bodyText, clientName, clientEmail, proposalId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 56, left: 60, right: 60 }, bufferPages: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Letterhead header — text wordmark (matches the site's real dot-accent
    // mark; no logo image, since the only source PNG has an opaque black
    // background that would print as a black box on a white letterhead).
    doc.font('Courier-Bold').fontSize(22).fillColor('#111111').text('greg', { continued: true });
    doc.fillColor('#ff6a00').text('.', { continued: true });
    doc.fillColor('#111111').text('iteen');
    doc.moveDown(0.3);
    doc.font('Courier').fontSize(9).fillColor('#555555').text(CONTACT_LINE);
    doc.moveDown(0.6);
    doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
    doc.moveDown(1);

    // Title block
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111111').text(subject || 'Project Proposal');
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Helvetica').fontSize(9).fillColor('#888888')
      .text(`Prepared for ${clientName || clientEmail || 'Client'} · ${dateStr} · Ref #${proposalId}`);
    doc.moveDown(1.2);

    // Body — minimal markdown cleanup (headings, bold, bullets) since the
    // source is AI-generated markdown, not full prose.
    doc.font('Helvetica').fontSize(11).fillColor('#222222');
    const paragraphs = String(bodyText || '').split(/\n{2,}/);
    for (const para of paragraphs) {
      const heading = para.match(/^#{1,3}\s+(.*)$/);
      if (heading) {
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text(heading[1].replace(/\*\*/g, ''));
        doc.font('Helvetica').fontSize(11).fillColor('#222222');
        continue;
      }
      
      const cleanPara = para.replace(/^[-*]\s+/gm, '•  ').trim();
      if (!cleanPara) continue;

      const parts = cleanPara.split(/(\*\*.*?\*\*)/g);
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const part = parts[i];
        
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          doc.font('Helvetica-Bold').text(part.slice(2, -2), { align: 'left', continued: !isLast });
        } else if (part) {
          doc.font('Helvetica').text(part, { align: 'left', continued: !isLast });
        } else if (isLast) {
          // Empty last part, we just need to end the continued text without adding anything
          doc.text('', { continued: false });
        }
      }
      doc.moveDown(0.6);
    }

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
