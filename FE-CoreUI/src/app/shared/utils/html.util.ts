export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';

  // 1. Replace block tags with spaces (to prevent words sticking together)
  let text = html.replace(/<\/p>|<br\s*\/?>/gi, ' ');

  // 2. Remove all HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 3. Decode basic entities
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

  // 4. Trim and limit length
  text = text.trim();
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}
