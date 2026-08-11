// WebSearch-validated: Greenhouse public boards API https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs (no auth, per-board token)
// ToS: public JSON; rate-cap enforced; WebSearch citation recorded here per active rule.
export async function fetchGreenhouseJobs(boardToken) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Greenhouse ${boardToken} ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map(j=> ({ external_id: String(j.id), title: j.title, url: j.absolute_url, location: j.location?.name||'', posted_at: j.updated_at || new Date().toISOString(), raw: j }));
}
