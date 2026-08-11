// Upwork: no stable public JSON without OAuth; RSS is ToS-limited. This module only enables RSS where ToS permits; otherwise returns [].
// WebSearch required before enabling a real feed — see gig-sources.md. Placeholder until validated.
export async function fetchUpworkJobs(feedUrl) {
  if (!feedUrl) return [];
  const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Upwork RSS ${res.status}`);
  const xml = await res.text();
  // minimal RSS item parse — id/title/link/pubDate
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,50);
  return items.map(m=> {
    const b = m[1];
    const t = (b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)||b.match(/<title>([\s\S]*?)<\/title>/))?.[1]||'Untitled';
    const l = b.match(/<link>([\s\S]*?)<\/link>/)?.[1]||'';
    const p = b.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]|| new Date().toISOString();
    const guid = b.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]|| l || t;
    return { external_id: guid.slice(0,80), title: t.trim(), url: l.trim(), posted_at: new Date(p).toISOString(), raw: { guid, xmlLen: xml.length } };
  });
}
