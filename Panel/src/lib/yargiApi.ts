// Thin client for Yargı REST API
// It calls our FastAPI endpoints mounted under /rest when served by the same server,
// and falls back to relative /api paths if proxied differently.

export type CourtType = 'yargitay' | 'danistay' | 'emsal' | 'bam' | 'aym' | 'sayistay';

export interface YargitaySearchParams {
  query: string;
  chamber?: string; // birimYrgKurulDaire
  startDate?: string; // YYYY-MM-DD (will convert to DD.MM.YYYY)
  endDate?: string;   // YYYY-MM-DD
  pageSize?: number;
}

export interface YargitayDecisionItem {
  id: string;
  daire?: string;
  esasNo?: string;
  kararNo?: string;
  kararTarihi?: string; // DD.MM.YYYY or ISO
  document_url?: string;
}

export interface YargitaySearchResponse {
  decisions: YargitayDecisionItem[];
  total_records: number;
  requested_page: number;
  page_size: number;
}

function toDDMMYYYY(iso?: string): string | undefined {
  if (!iso) return undefined;
  // Expect iso as YYYY-MM-DD
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function apiBase(): string {
  // Prefer same-origin /rest mount; fallback to '' (relative) if not present
  return '/rest';
}

export async function searchYargitay(params: YargitaySearchParams): Promise<YargitaySearchResponse> {
  const body: any = {
    arananKelime: params.query,
    birimYrgKurulDaire: params.chamber ?? '',
    pageSize: Math.max(1, Math.min(params.pageSize ?? 20, 100)),
  };
  const start = toDDMMYYYY(params.startDate);
  const end = toDDMMYYYY(params.endDate);
  if (start) body.baslangicTarihi = start;
  if (end) body.bitisTarihi = end;

  const res = await fetch(`${apiBase()}/api/yargitay/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Yargıtay API error: ${res.status}`);
  return res.json();
}

export async function getYargitayDocumentMarkdown(id: string): Promise<{ markdown: string }> {
  const res = await fetch(`${apiBase()}/api/yargitay/document/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Yargıtay document fetch failed: ${res.status}`);
  return res.json();
}

export interface EmsalSearchParams {
  keyword: string;
  decisionYear?: string;
  pageSize?: number;
}

export interface EmsalDecisionItem {
  id: string;
  court?: string;
  kararNo?: string;
  kararTarihi?: string;
}

export interface EmsalSearchResponse {
  decisions: EmsalDecisionItem[];
  total_records: number;
  requested_page: number;
  page_size: number;
}

export async function searchEmsal(params: EmsalSearchParams): Promise<EmsalSearchResponse> {
  const body: any = {
    keyword: params.keyword,
    results_per_page: Math.max(1, Math.min(params.pageSize ?? 20, 100)),
  };
  if (params.decisionYear) body.decision_year_karar = params.decisionYear;

  const res = await fetch(`${apiBase()}/api/emsal/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Emsal API error: ${res.status}`);
  return res.json();
}

export async function getEmsalDocumentMarkdown(id: string): Promise<{ markdown: string }> {
  const res = await fetch(`${apiBase()}/api/emsal/document/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Emsal document fetch failed: ${res.status}`);
  return res.json();
}

export interface DanistaySearchParams {
  queryAll?: string[]; // AND keywords
  chamber?: string;
  startDate?: string; // YYYY-MM-DD -> DD.MM.YYYY
  endDate?: string;
  pageSize?: number;
}

export interface DanistayDecisionItem {
  id: string;
  daire?: string;
  esas?: string;
  karar?: string;
  kararTarihi?: string;
}

export interface DanistaySearchResponse {
  decisions: DanistayDecisionItem[];
  total_records: number;
  requested_page: number;
  page_size: number;
}

export async function searchDanistay(params: DanistaySearchParams): Promise<DanistaySearchResponse> {
  // prefer detailed when chamber/date filters supplied; else keyword variant
  const hasDetailed = params.chamber || params.startDate || params.endDate;
  if (hasDetailed) {
    const body: any = {
      daire: params.chamber ?? undefined,
      baslangicTarihi: toDDMMYYYY(params.startDate),
      bitisTarihi: toDDMMYYYY(params.endDate),
      pageSize: Math.max(1, Math.min(params.pageSize ?? 20, 100)),
    };
    const res = await fetch(`${apiBase()}/api/danistay/search-detailed`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Danıştay API error: ${res.status}`);
    return res.json();
  } else {
    const body: any = {
      andKelimeler: params.queryAll && params.queryAll.length > 0 ? params.queryAll : [],
      pageSize: Math.max(1, Math.min(params.pageSize ?? 20, 100)),
    };
    const res = await fetch(`${apiBase()}/api/danistay/search-keyword`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Danıştay API error: ${res.status}`);
    return res.json();
  }
}

export async function getDanistayDocumentMarkdown(id: string): Promise<{ markdown: string }> {
  const res = await fetch(`${apiBase()}/api/danistay/document/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Danıştay document fetch failed: ${res.status}`);
  return res.json();
}
