import { describe, it, expect } from 'vitest';
import { analyzeIntent } from './voiceSystem';

describe('list actions mapping', () => {
  it('maps "davalar filtrele" to FILTER with page cases', () => {
    const i = analyzeIntent('davalar filtrele');
    expect(i).toMatchObject({ category: 'LIST', action: 'FILTER', parameters: { page: 'cases' } });
  });
  it('maps "müvekkiller sıralama yap" to SORT with page clients', () => {
    const i = analyzeIntent('müvekkiller sıralama yap');
    expect(i).toMatchObject({ category: 'LIST', action: 'SORT', parameters: { page: 'clients' } });
  });
});
