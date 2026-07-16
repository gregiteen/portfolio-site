// Renders vault/runtime/config/rate-card.md as a branded, marketing-ready
// PDF — same letterhead system as proposals (see scripts/lib/letterhead.mjs)
// so it reads as one consistent brand. Re-run any time the rate card
// changes: `node scripts/generate-rate-card-pdf.mjs`.
//
// The vault doc is the sole source of truth for figures — this script only
// parses and lays it out, never hardcodes numbers, so the PDF can't drift
// from what the proposal generator actually quotes.
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { drawLetterheadHeader } from './lib/letterhead.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const RATE_CARD_PATH = join(root, 'vault', 'runtime', 'config', 'rate-card.md');
const OUT_PATH = join(root, 'static', 'rate-card.pdf');

function parseRateCard(raw) {
  const body = raw.replace(/^---[\s\S]*?---\s*/, ''); // strip YAML frontmatter

  // Only the explicitly client-facing `Tagline:` line is printed. The
  // `Positioning:` note is internal pricing strategy and must never appear
  // on the PDF a client downloads.
  const tagline = /Tagline:\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/u.exec(body)?.[1]
    ?.replace(/\n/g, ' ').trim() || '';

  const hourly = /\*\*Hourly rate:\*\*\s*([^\n(]+)\s*(?:\(([^)]*)\))?/.exec(body);
  const retainer = /\*\*Retainer:\*\*\s*([^\n(]+)\s*(?:\(([^)]*)\))?/.exec(body);

  const rows = [];
  const tableMatch = /\|\s*Category\s*\|[^\n]*\n\|[-\s|]+\n([\s\S]*?)(?:\n\n|\n##|$)/.exec(body);
  if (tableMatch) {
    for (const line of tableMatch[1].trim().split('\n')) {
      const cells = line.split('|').map((c) => c.trim()).filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
      if (cells.length >= 3) rows.push({ category: cells[0], range: cells[1], notes: cells[2] });
    }
  }

  return {
    tagline,
    hourly: { amount: hourly?.[1]?.trim() || '', note: hourly?.[2]?.trim() || '' },
    retainer: { amount: retainer?.[1]?.trim() || '', note: retainer?.[2]?.trim() || '' },
    rows,
  };
}

function drawFooter(doc, pageNum, pageCount) {
  const footerY = doc.page.height - 40;
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.font('Helvetica').fontSize(8).fillColor('#aaaaaa')
    .text(`greg.iteen · rate card · page ${pageNum} of ${pageCount}`, 60, footerY, { width: 492, align: 'center', lineBreak: false });
  doc.page.margins.bottom = savedBottom;
}

async function build() {
  const raw = await readFile(RATE_CARD_PATH, 'utf8');
  const { tagline, hourly, retainer, rows } = parseRateCard(raw);

  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 56, bottom: 56, left: 60, right: 60 }, bufferPages: true });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  drawLetterheadHeader(doc);

  doc.font('Helvetica-Bold').fontSize(20).fillColor('#111111').text('Rate Card', 60, doc.y);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.font('Helvetica').fontSize(9).fillColor('#888888').text(`Effective ${dateStr}`);
  doc.moveDown(0.8);
  if (tagline) {
    doc.font('Helvetica-Oblique').fontSize(10.5).fillColor('#444444').text(tagline, 60, doc.y, { width: 492, align: 'left' });
    doc.moveDown(1);
  }

  // Baseline — two stat blocks side by side
  const statTop = doc.y;
  const statWidth = 232;
  doc.font('Helvetica').fontSize(8.5).fillColor('#888888').text('HOURLY RATE', 60, statTop, { characterSpacing: 0.5 });
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111').text(hourly.amount, 60, statTop + 13);
  if (hourly.note) doc.font('Helvetica').fontSize(8.5).fillColor('#888888').text(hourly.note, 60, doc.y + 2, { width: statWidth });

  doc.font('Helvetica').fontSize(8.5).fillColor('#888888').text('RETAINER', 60 + statWidth + 28, statTop, { characterSpacing: 0.5 });
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111').text(retainer.amount, 60 + statWidth + 28, statTop + 13);
  if (retainer.note) doc.font('Helvetica').fontSize(8.5).fillColor('#888888').text(retainer.note, 60 + statWidth + 28, doc.y + 2, { width: statWidth });

  doc.y = Math.max(doc.y, statTop + 70);
  doc.moveDown(0.6);
  doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
  doc.moveDown(1);

  // Price bands table — x=60 passed explicitly; pdfkit otherwise continues at
  // whatever x the previous absolute-positioned write left behind.
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#111111').text('Price bands by service category', 60, doc.y);
  doc.moveDown(0.6);

  const colX = { category: 60, range: 220, notes: 320 };
  const colW = { category: 150, range: 90, notes: 232 };

  const headY = doc.y;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#888888');
  doc.text('CATEGORY', colX.category, headY, { width: colW.category, characterSpacing: 0.3 });
  doc.text('RANGE', colX.range, headY, { width: colW.range, characterSpacing: 0.3 });
  doc.text('NOTES', colX.notes, headY, { width: colW.notes, characterSpacing: 0.3 });
  doc.y = headY + doc.currentLineHeight();
  doc.moveDown(0.5);
  doc.moveTo(60, doc.y).lineTo(552, doc.y).strokeColor('#dddddd').lineWidth(0.75).stroke();
  doc.moveDown(0.5);

  const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom;

  for (const row of rows) {
    doc.font('Helvetica').fontSize(9.5);
    const notesHeight = doc.heightOfString(row.notes, { width: colW.notes });
    const rowHeight = Math.max(16, notesHeight);

    if (doc.y + rowHeight > PAGE_BOTTOM) {
      doc.addPage();
      doc.y = doc.page.margins.top;
    }

    const rowTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111111').text(row.category, colX.category, rowTop, { width: colW.category });
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#ff6a00').text(row.range, colX.range, rowTop, { width: colW.range });
    doc.font('Helvetica').fontSize(9.5).fillColor('#555555').text(row.notes, colX.notes, rowTop, { width: colW.notes });

    doc.y = rowTop + rowHeight + 10;
    doc.moveTo(60, doc.y - 5).lineTo(552, doc.y - 5).strokeColor('#eeeeee').lineWidth(0.5).stroke();
  }

  // Footer on every buffered page
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    drawFooter(doc, i + 1, range.count);
  }

  doc.end();
  const buffer = await done;
  await writeFile(OUT_PATH, buffer);
  console.log(`Rate card PDF written -> ${OUT_PATH} (${(buffer.length / 1024).toFixed(1)} KB, ${rows.length} categories)`);
}

build().catch((e) => {
  console.error('Rate card PDF generation failed:', e);
  process.exit(1);
});
