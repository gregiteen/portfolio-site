/**
 * Produces the short reading experience shown while a private portfolio is
 * being prepared.  Copy comes only from canonical vault pages; this keeps the
 * waiting screen aligned with the portfolio instead of inventing biography.
 */
function plainText(markdown) {
  return String(markdown || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function section(markdown, heading) {
  const match = String(markdown || '').match(new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  return plainText(match?.[1]);
}

export function createWaitingProfile(pages) {
  const home = pages.find((page) => page.data?.slug === 'home');
  const about = pages.find((page) => page.data?.slug === 'about');
  const background = plainText(home?.body);
  const perspective = section(about?.body, 'Who I am');
  const approach = section(about?.body, 'How I work');
  const toolbox = section(about?.body, 'Toolbox');

  return {
    sections: [
      { label: 'Background', title: home?.data?.x_headline || 'Builder of local software', copy: background },
      { label: 'Working approach', title: 'How the work gets made', copy: approach },
      { label: 'Development depth', title: 'Tools and systems', copy: toolbox },
      { label: 'Perspective', title: 'Why local systems matter', copy: perspective },
    ].filter((item) => item.copy),
  };
}
