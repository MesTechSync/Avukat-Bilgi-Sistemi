// Lightweight DOM sanitization utilities for safe rendering and insertion
// Uses DOMPurify to strip unsafe tags/attributes. Keep allowed list minimal.

import DOMPurify from 'dompurify';

// Sanitize potentially rich HTML content with a conservative allowlist
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'span', 'div', 'pre', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    RETURN_TRUSTED_TYPE: false
  }) as string;
}

// Sanitize plain text: remove all HTML tags/attrs and normalize whitespace
export function sanitizeText(text: string): string {
  if (text == null) return '';
  const cleaned = DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as string;
  // Normalize odd whitespace characters while preserving intentional newlines
  return cleaned
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // control chars → space
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]/g, ' ') // unicode spaces → space
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\s+$/g, '')
    .replace(/^\s+/g, '');
}

export type { };
