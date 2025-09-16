import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHTML } from './sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags and scripts', () => {
    const input = '<img src=x onerror=alert(1)>hello<script>alert(2)</script>';
    const out = sanitizeText(input);
    expect(out).toContain('hello');
    expect(out).not.toContain('<img');
    expect(out).not.toContain('script');
    expect(out).not.toContain('onerror');
  });
});

describe('sanitizeHTML', () => {
  it('allows basic formatting but strips dangerous attributes', () => {
    const input = '<b title="ok">bold</b><a href="javascript:alert(1)">x</a>';
    const out = sanitizeHTML(input);
    expect(out).toContain('<b');
    expect(out).toContain('bold');
    expect(out).not.toContain('javascript:');
  });
});
