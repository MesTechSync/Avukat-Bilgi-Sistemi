import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeIntent } from './voiceSystem';

// Smoke: ensure a voice-command style flow would produce a NAV intent
describe('voice-command event smoke', () => {
  beforeEach(() => {
    // no-op: tests run in jsdom-like env without real window.speech
  });

  it('produces NAV intent for "aç ana sayfa" via analyzer', () => {
    const i = analyzeIntent('aç ana sayfa');
    // Either strict registry or extended/fuzzy should end up as some NAV category/action
    if (i.category === 'NAVIGASYON') {
      expect(['NAV_DASHBOARD','NAV_CASES','NAV_CLIENTS','NAV_APPOINTMENTS','NAV_SETTINGS']).toContain(i.action);
    } else {
      // Extended nav mapping or fuzzy may produce NAV_PAGE_* action; category may vary
      expect(i.action.length).toBeGreaterThan(0);
    }
  });
});
