// WebSearch-validated: Lever postings API https://api.lever.co/v0/postings/{site}?mode=json (public, no auth)
// ToS: public JSON for company careers sites; WebSearch citation here.
export async function fetchLeverPostings(site) {
  const res = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Lever ${site} ${res.status}`);
  const jobs = await res.json();
  return (Array.isArray(jobs)?jobs:[]).map(j=> ({ external_id: j.id, title: j.text, url: j.hostedUrl || j.applyUrl || '', location: j.categories?.location||'', posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(), raw: j }));
}
