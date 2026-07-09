import { getWebmailSettings } from '../runtime-store.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function unfoldIcs(icsString) {
  return icsString.replace(/\r?\n[ \t]/g, '');
}

function parseIcsEvents(icsString) {
  const unfolded = unfoldIcs(icsString);
  const lines = unfolded.split(/\r?\n/);
  
  const events = [];
  let currentEvent = null;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      const match = line.match(/^([A-Z0-9-]+)(?:;[^:]+)?:(.*)$/);
      if (match) {
        const key = match[1];
        const val = match[2];
        currentEvent[key] = val;
      }
    }
  }
  
  return events;
}

function formatIsoDate(icsDate) {
  if (!icsDate) return null;
  const match = icsDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}${match[7] || 'Z'}`;
  }
  const matchDate = icsDate.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (matchDate) {
    return `${matchDate[1]}-${matchDate[2]}-${matchDate[3]}T00:00:00Z`;
  }
  return icsDate;
}

export async function syncCalendarFeeds(calendarDir) {
  const settings = await getWebmailSettings();
  if (!settings || !settings.calendar_feeds || !settings.calendar_feeds.length) {
    return;
  }
  
  for (const feedUrl of settings.calendar_feeds) {
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        console.error(`[Calendar] Failed to fetch feed ${feedUrl}: ${response.status}`);
        continue;
      }
      
      const icsData = await response.text();
      const events = parseIcsEvents(icsData);
      
      await mkdir(calendarDir, { recursive: true });
      
      for (const ev of events) {
        if (!ev.UID) continue;
        
        const safeId = ev.UID.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
        const filePath = join(calendarDir, `${safeId}.md`);
        
        const frontmatter = {
          type: 'calendar_event',
          event_id: ev.UID,
          summary: ev.SUMMARY || 'Busy',
          dtstart: formatIsoDate(ev.DTSTART),
          dtend: formatIsoDate(ev.DTEND),
          location: ev.LOCATION || '',
          status: ev.STATUS || 'CONFIRMED'
        };
        
        const description = (ev.DESCRIPTION || '').replace(/\\n/g, '\n').replace(/\\,/g, ',');
        
        const content = [
          '---',
          `type: "calendar_event"`,
          `event_id: ${JSON.stringify(frontmatter.event_id)}`,
          `summary: ${JSON.stringify(frontmatter.summary)}`,
          `dtstart: ${JSON.stringify(frontmatter.dtstart)}`,
          `dtend: ${JSON.stringify(frontmatter.dtend)}`,
          `location: ${JSON.stringify(frontmatter.location)}`,
          `status: ${JSON.stringify(frontmatter.status)}`,
          '---',
          '',
          description
        ].join('\n');
        
        await writeFile(filePath, content, 'utf8');
      }
      console.log(`[Calendar] Synced ${events.length} events from ${feedUrl}`);
    } catch (e) {
      console.error(`[Calendar] Error syncing ${feedUrl}:`, e.message);
    }
  }
}

export function startCalendarPoller(calendarDir, intervalMs = 15 * 60 * 1000) {
  console.log('[Calendar] Poller daemon started, syncing every 15 minutes.');
  syncCalendarFeeds(calendarDir).catch(e => console.error('[Calendar] Initial sync failed:', e.message));
  setInterval(() => {
    syncCalendarFeeds(calendarDir).catch(e => console.error('[Calendar] Sync failed:', e.message));
  }, intervalMs);
}
