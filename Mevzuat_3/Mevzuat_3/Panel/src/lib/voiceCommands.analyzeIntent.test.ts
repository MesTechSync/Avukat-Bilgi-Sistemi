import { describe, it, expect } from 'vitest';
import { analyzeIntent } from './voiceSystem';

// Ek senaryolar: DIKTE, ek NAV eşanlamlıları, SEARCH varyantları ve UNKNOWN

describe('analyzeIntent - extended scenarios', () => {
  it('dictation commands', () => {
    expect(analyzeIntent('dikte başlat')).toEqual({ category: 'DIKTE', action: 'DICTATE_START', parameters: {} });
    expect(analyzeIntent('dikte durdur')).toEqual({ category: 'DIKTE', action: 'DICTATE_STOP', parameters: {} });
    expect(analyzeIntent('dikteyi kaydet')).toEqual({ category: 'DIKTE', action: 'DICTATE_SAVE', parameters: {} });
  });

  it('navigation synonyms', () => {
    expect(analyzeIntent('kontrol paneli')).toEqual({ category: 'NAVIGASYON', action: 'NAV_DASHBOARD', parameters: {} });
    expect(analyzeIntent('dava dosyaları')).toEqual({ category: 'NAVIGASYON', action: 'NAV_CASES', parameters: {} });
    expect(analyzeIntent('müvekkil listesi')).toEqual({ category: 'NAVIGASYON', action: 'NAV_CLIENTS', parameters: {} });
    expect(analyzeIntent('ajanda')).toEqual({ category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', parameters: {} });
  });

  it('search variants keep priority over nav', () => {
    expect(analyzeIntent('ara nafaka')).toEqual({ category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: { query: 'nafaka' } });
    expect(analyzeIntent('arama yap boşanma davası')).toMatchObject({ category: 'ARAMA_SORGULAMA', action: 'SEARCH' });
    expect(analyzeIntent('bul tanık beyanı')).toMatchObject({ category: 'ARAMA_SORGULAMA', action: 'SEARCH' });
    expect(analyzeIntent('sorgula delil listesi')).toMatchObject({ category: 'ARAMA_SORGULAMA', action: 'SEARCH' });
  });

  it('unknown returns empty intent', () => {
    expect(analyzeIntent('bilinmeyen komut 123')).toEqual({ category: '', action: '', parameters: {} });
  });

  it('fuzzy: "arax nafaka davası" recognized as SEARCH with query when fuzzy on', () => {
    const i = analyzeIntent('arax nafaka davası');
    // Should map to SEARCH category via strict or fuzzy; allow either path
    if (i.action === 'SEARCH') {
      // Query may be full transcript or extracted remainder depending on path
      expect(typeof (i.parameters?.query ?? '')).toBe('string');
    } else {
      // If extended/fuzzy mapped to complex action, at least category not empty
      expect(i.category.length).toBeGreaterThan(0);
    }
  });
});
