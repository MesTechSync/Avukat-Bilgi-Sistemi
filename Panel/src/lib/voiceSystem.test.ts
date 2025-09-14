import { describe, it, expect } from 'vitest';
import { analyzeIntent } from './voiceSystem';

describe('analyzeIntent', () => {
  it('detects dark mode', () => {
  expect(analyzeIntent('karanlık mod')).toEqual({ category: 'GORUNUM', action: 'DARK_MODE', parameters: {} });
  expect(analyzeIntent('gece modu')).toEqual({ category: 'GORUNUM', action: 'DARK_MODE', parameters: {} });
  });

  it('detects light mode', () => {
  expect(analyzeIntent('aydınlık mod')).toEqual({ category: 'GORUNUM', action: 'LIGHT_MODE', parameters: {} });
  expect(analyzeIntent('gündüz modu')).toEqual({ category: 'GORUNUM', action: 'LIGHT_MODE', parameters: {} });
  });

  it('navigates to tabs', () => {
  expect(analyzeIntent('ana sayfa')).toEqual({ category: 'NAVIGASYON', action: 'NAV_DASHBOARD', parameters: {} });
  expect(analyzeIntent('dava dosyaları')).toEqual({ category: 'NAVIGASYON', action: 'NAV_CASES', parameters: {} });
  expect(analyzeIntent('müvekkiller')).toEqual({ category: 'NAVIGASYON', action: 'NAV_CLIENTS', parameters: {} });
  expect(analyzeIntent('takvim')).toEqual({ category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', parameters: {} });
  expect(analyzeIntent('ayarlar')).toEqual({ category: 'NAVIGASYON', action: 'NAV_SETTINGS', parameters: {} });
  });

  it('parses search with query after "ara"', () => {
  expect(analyzeIntent('ara nafaka')).toEqual({ category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: { query: 'nafaka' } });
  });

  it('parses search when phrase contains "arama yap"', () => {
  const res = analyzeIntent('arama yap boşanma davası');
    expect(res.category).toBe('ARAMA_SORGULAMA');
    expect(res.action).toBe('SEARCH');
  });

  it('returns empty intent for unknown input', () => {
  expect(analyzeIntent('lorem ipsum')).toEqual({ category: '', action: '', parameters: {} });
  });
});
