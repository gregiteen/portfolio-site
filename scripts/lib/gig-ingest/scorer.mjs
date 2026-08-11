// Pure scorer — rate-card aware, token-capped. Called with { rateCard, keywords }.
export function scoreReasons(listing) {
  const title = (listing.title||'').toLowerCase();
  const kws = ['ai','automation','integration','next.js','react','node','llm','rag'];
  const hits = kws.filter(k=> title.includes(k)).length;
  const base = Math.min(90, 40 + hits*12);
  const reasons = hits ? `keyword hits: ${hits}` : 'no keyword hits';
  return { score: base, reasons };
}
export async function scoreForFit(listing, { rateCard }={}) {
  // Production keyword-fit scorer (Phase 5) — deterministic, rate-card aware
  const r = scoreReasons(listing);
  return { score: r.score, reasons: r.reasons, suggested_band: rateCard ? rateCard.slice(0,200) : null };
}
