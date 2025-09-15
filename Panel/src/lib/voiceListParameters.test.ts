import { describe, it, expect } from 'vitest';
import { analyzeIntent } from './voiceSystem';

describe('list parameters extraction', () => {
  it('extracts case status when filtering cases', () => {
    const i = analyzeIntent('davaları filtrele devam ediyor');
    expect(i).toMatchObject({
      category: 'LIST',
      action: 'FILTER',
      parameters: { page: 'cases', filter: { status: 'Devam Ediyor' } }
    });
  });

  it('extracts sort by name asc on clients', () => {
    const i = analyzeIntent('müvekkilleri artan sırala isim');
    expect(i).toMatchObject({
      category: 'LIST',
      action: 'SORT',
      parameters: { page: 'clients', sort: { by: 'name', dir: 'asc' } }
    });
  });

  it('sets sort by name desc on clients when azalan', () => {
    const i = analyzeIntent('müvekkilleri azalan sırala');
    expect(i).toMatchObject({
      category: 'LIST',
      action: 'SORT',
      parameters: { page: 'clients', sort: { by: 'name', dir: 'desc' } }
    });
  });

  it('extracts case priority when mentioned', () => {
    const i = analyzeIntent('davaları filtrele acil');
    expect(i).toMatchObject({
      category: 'LIST',
      action: 'FILTER',
      parameters: { page: 'cases', filter: { priority: 'Acil' } }
    });
  });

  it('extracts case type when mentioned', () => {
    const i = analyzeIntent('davaları filtrele iş');
    expect(i).toMatchObject({
      category: 'LIST',
      action: 'FILTER',
      parameters: { page: 'cases', filter: { case_type: 'İş Hukuku' } }
    });
  });
});