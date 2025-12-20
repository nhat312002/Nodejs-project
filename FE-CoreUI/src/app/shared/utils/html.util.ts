export function _stripHtml(html: string | undefined | null): string {
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

export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';

  // 1. Create a temporary DOM element
  const tmp = document.createElement('DIV');

  // 2. Inject the HTML. The browser automatically parses entities here.
  // We replace block tags with spaces first to prevent words sticking together.
  // e.g. <p>Hello</p><p>World</p> -> "Hello World" instead of "HelloWorld"
  const spacedHtml = html
    .replace(/<\/p>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/div>/gi, ' ');

  tmp.innerHTML = spacedHtml;

  // 3. Extract the text content (Decoded)
  let text = tmp.textContent || tmp.innerText || '';

  // 4. Clean up extra spaces and limit length
  text = text.replace(/\s+/g, ' ').trim();

  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}
