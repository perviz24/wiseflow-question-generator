import DOMPurify from "dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Preserves safe formatting tags (bold, italic, lists, tables, etc.)
 * while removing script tags, event handlers, and dangerous attributes.
 *
 * Use this wrapper for ALL dangerouslySetInnerHTML content.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "blockquote", "pre", "code",
      "sub", "sup", "span", "div",
      "hr", "img",
    ],
    ALLOWED_ATTR: [
      "class", "style", "colspan", "rowspan", "src", "alt", "width", "height",
    ],
  })
}
