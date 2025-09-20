// Centralized client for Yargı MCP FastAPI backend

export type CourtType = 'yargitay' | 'danistay' | 'bam' | 'aym' | 'sayistay' | 'emsal' | 'istinaf' | 'hukuk';

export interface IctihatFilters {
  courtType?: CourtType | '';
  dateRange?: { from?: string; to?: string };
  legalArea?: string;
}

export interface IctihatResultItem {
  id: string;
  caseNumber?: string;
  courtName?: string;
  courtType?: CourtType | string;
  decisionDate?: string;
  subject?: string;
  content?: string;
  relevanceScore?: number;
  legalAreas?: string[];
  keywords?: string[];
  highlight?: string;
}

// Prefer using Vite dev proxy when VITE_BACKEND_URL is defined (BASE_URL becomes empty, so paths like '/api/...')
const ENV: any = (import.meta as any).env || {};
export const BASE_URL = ENV.VITE_BACKEND_URL ? '' : (ENV.VITE_YARGI_API_URL || 'http://127.0.0.1:9000');
const ENABLE_BEDDESTEN = String(ENV.VITE_ENABLE_BEDDESTEN || '').toLowerCase() === 'true';

// Absolute backend base for diagnostics/pings, bypassing dev middleware
export function getBackendBase(): string {
  return ENV.VITE_BACKEND_URL || ENV.VITE_YARGI_API_URL || 'http://127.0.0.1:9000';
}

function convertDateToISO(date?: string): string | undefined {
  if (!date) return undefined;
  // Accept YYYY-MM-DD and append T00:00:00.000Z for Bedesten endpoints
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00.000Z`;
  }
  return date;
}

async function post<T>(path: string, body: any): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`API ${path} failed: ${res.status} ${text?.slice(0, 200)}`);
    if (typeof window !== 'undefined') {
      console.error('[yargiApi] POST failed', { url, status: res.status, body, text });
    }
    throw err;
  }
  return res.json();
}

// Parsers are defensive due to varying shapes from backend tools
function mapGenericListToResults(list: any[], fallbackCourt: CourtType | string): IctihatResultItem[] {
  return (list || []).map((r: any, idx: number) => {
    // Enhanced field mapping for all court types
    const date = r.decision_date || r.kararTarihi || r.date || r.DecisionDate || r.karar_tarihi || 
                 r.karar_tar || r.tarih || r.audit_date || r.inceleme_tarihi;
    
    const subject = r.subject || r.konu || r.summary || r.ozet || r.title || r.baslik || 
                   r.karar_ozeti || r.decision_summary || r.audit_subject || r.denetim_konusu;
    
    const caseNo = r.case_number || r.esas_karar || r.esasKarar || r.kararNo || r.karar_no || 
                  r.dava_no || r.file_no || r.audit_no || r.denetim_no || r.rapor_no;
    
    // Court-specific naming
    let court = r.court_name || r.mahkeme || r.court || r.kurum || r.kurul || fallbackCourt;
    if (fallbackCourt === 'aym') court = court || 'Anayasa Mahkemesi';
    if (fallbackCourt === 'sayistay') court = court || 'Sayıştay';
    if (fallbackCourt === 'emsal') court = court || 'UYAP Emsal';
    if (fallbackCourt === 'istinaf') court = court || 'İstinaf Mahkemesi';
    if (fallbackCourt === 'hukuk') court = court || 'Hukuk Mahkemesi';
    
    return {
      id: String(r.id ?? r.document_id ?? r.decision_id ?? r.karar_id ?? r._id ?? 
                r.audit_id ?? r.denetim_id ?? r.rapor_id ?? idx + 1),
      caseNumber: caseNo ? String(caseNo) : undefined,
      courtName: court ? String(court) : undefined,
      courtType: (r.courtType as CourtType) || (fallbackCourt as CourtType),
      decisionDate: date ? String(date) : undefined,
      subject: subject ? String(subject) : undefined,
      content: r.content || r.metin || r.text || r.icerik || r.full_text || r.tam_metin ||
              r.decision_text || r.karar_metni || r.audit_text || r.denetim_metni,
      relevanceScore: r.score || r.relevance || r.skor || undefined,
      legalAreas: r.areas || r.legalAreas || r.hukuk_alanları || r.kategoriler || [],
      keywords: r.keywords || r.etiketler || r.tags || r.anahtar_kelimeler || [],
      highlight: r.highlight || r.snippet || r.vurgu || r.ozet || undefined
    };
  });
}

export async function searchIctihat(query: string, filters: IctihatFilters): Promise<IctihatResultItem[]> {
  const court = (filters.courtType || 'yargitay') as CourtType;
  const fromISO = convertDateToISO(filters.dateRange?.from);
  const toISOv = convertDateToISO(filters.dateRange?.to);

  // Backend GÜNCEL: /api/databases'e göre mevcut tools: ["search_yargitay", "search_yargitay_bedesten"]
  // Artık search_yargitay_detailed YOK! Bu yüzden normal /api/yargitay/search endpoint'i çalışmalı
  if (court === 'yargitay') {
    // Primary: /api/yargitay/search artık search_yargitay tool'unu çağırıyor (detailed değil)
    // SCHEMA FIX: pageSize kullan, sayfa/sayfaBoyutu değil
    const primaryBody: any = { arananKelime: query, pageSize: 10 };
    if (fromISO) primaryBody.baslangicTarihi = fromISO;
    if (toISOv) primaryBody.bitisTarihi = toISOv;
    
    let data: any;
    try {
      console.log('🔍 Yargıtay Primary API (search_yargitay tool):', primaryBody);
      data = await post('/api/yargitay/search', primaryBody);
    } catch (e) {
      // Fallback: Bedesten API
      if (ENABLE_BEDDESTEN) {
        console.log('⚠️ Primary başarısız, Bedesten API deneniyor...');
        const fallbackBody: any = { phrase: query, pageSize: 10 };
        if (fromISO) fallbackBody.kararTarihiStart = fromISO;
        if (toISOv) fallbackBody.kararTarihiEnd = toISOv;
        data = await post('/api/yargitay/search-bedesten', fallbackBody);
      } else {
        throw e;
      }
    }
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'yargitay');
  }

  if (court === 'danistay') {
    // Primary: /api/danistay/search-keyword - SCHEMA FIX: pageSize kullan, page değil
    let data: any;
    try {
      console.log('🔍 Danıştay Primary API (search_danistay_keyword tool)');
      data = await post('/api/danistay/search-keyword', { 
        andKelimeler: [query], 
        pageSize: 10 
      });
    } catch (e1) {
      if (ENABLE_BEDDESTEN) {
        console.log('⚠️ Danıştay primary başarısız, Bedesten API deneniyor...');
        const fallbackBody: any = { phrase: query, pageSize: 10 };
        if (fromISO) fallbackBody.kararTarihiStart = fromISO;
        if (toISOv) fallbackBody.kararTarihiEnd = toISOv;
        data = await post('/api/danistay/search-bedesten', fallbackBody);
      } else {
        throw e1;
      }
    }
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'danistay');
  }

  if (court === 'aym') {
    console.log('🔍 AYM formatı deneniyor');
    const data = await post('/api/aym/search', { 
      arananKelime: query, 
      pageSize: 10,
      decision_type: filters.legalArea || undefined
    });
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'aym');
  }

  if (court === 'sayistay') {
    console.log('🔍 Sayıştay formatı deneniyor');
    const data = await post('/api/sayistay/search', { 
      arananKelime: query, 
      pageSize: 10,
      audit_type: filters.legalArea || undefined
    });
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'sayistay');
  }

  if (court === 'emsal') {
    console.log('🔍 UYAP Emsal formatı deneniyor');
    const data = await post('/api/emsal/search', { 
      arananKelime: query, 
      resultsPerPage: 10,
      courtType: 'all'
    });
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'emsal');
  }

  if (court === 'istinaf') {
    console.log('🔍 İstinaf formatı deneniyor');
    const data = await post('/api/istinaf/search', { 
      arananKelime: query, 
      pageSize: 10,
      courtRegion: filters.legalArea || undefined
    });
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'istinaf');
  }

  if (court === 'hukuk') {
    console.log('🔍 Hukuk Mahkemeleri formatı deneniyor');
    const data = await post('/api/hukuk/search', { 
      arananKelime: query, 
      pageSize: 10,
      courtLocation: filters.legalArea || undefined
    });
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'hukuk');
  }

  if (court === 'bam') {
    // İstinaf endpoint'i test edildi - doğru payload formatını bul
    console.log('🔍 İstinaf-Hukuk API test ediliyor...');
    
    // Birkaç farklı format dene
    const formats = [
      { phrase: query, pageSize: 10 },  // Bedesten format
      { arananKelime: query, pageSize: 10 },  // Yargıtay format  
      { keywords: [query], pageSize: 10 }  // Keywords format
    ];
    
    let data: any;
    let success = false;
    
    for (const body of formats) {
      try {
        console.log('🔍 İstinaf format deneniyor:', body);
        data = await post('/api/istinaf-hukuk/search', body);
        success = true;
        break;
      } catch (e) {
        console.log('⚠️ İstinaf format başarısız:', body);
        // Continue to next format
      }
    }
    
    if (!success) {
      throw new Error('İstinaf-Hukuk endpoint hiçbir payload format ile çalışmıyor');
    }
    
    const list = data?.results || data?.decisions || data?.items || [];
    return mapGenericListToResults(list, 'bam');
  }

  // Default: try Yargıtay as a sensible default
  return searchIctihat(query, { ...filters, courtType: 'yargitay' });
}

// ============================================
// MEVZUAT API FUNCTIONS
// ============================================

export interface MevzuatFilters {
  category?: string;
  institution?: string;
  dateRange?: { from?: string; to?: string };
  page?: number;
  per_page?: number;
}

export interface MevzuatResultItem {
  id: string;
  title?: string;
  type?: string;
  category?: string;
  institution?: string;
  publishDate?: string;
  url?: string;
  summary?: string;
  content?: string;
  relevanceScore?: number;
  highlight?: string;
}

export async function searchMevzuat(query: string, filters: MevzuatFilters = {}): Promise<MevzuatResultItem[]> {
  if (!query?.trim()) {
    throw new Error('Arama terimi gerekli');
  }

  try {
    const body = {
      query: query.trim(),
      category: filters.category || '',
      institution: filters.institution || '',
      start_date: filters.dateRange?.from || null,
      end_date: filters.dateRange?.to || null,
      page: filters.page || 1,
      per_page: filters.per_page || 20
    };

    console.log('🔍 Mevzuat araması başlatılıyor:', body);
    const data = await post<any>('/api/mevzuat/search', body);
    
    if (data?.success && data?.data) {
      const results = data.data.results || data.data.documents || data.data || [];
      return mapMevzuatResults(results);
    } else if (data?.error_code) {
      throw new Error(data.message || 'Mevzuat araması başarısız');
    } else {
      return mapMevzuatResults(data || []);
    }
  } catch (error: any) {
    console.error('❌ Mevzuat arama hatası:', error);
    throw new Error(error?.message || 'Mevzuat araması sırasında hata oluştu');
  }
}

function mapMevzuatResults(results: any[]): MevzuatResultItem[] {
  if (!Array.isArray(results)) {
    console.warn('⚠️ Mevzuat sonuçları dizi değil:', results);
    return [];
  }

  return results.map((item: any, index: number) => ({
    id: item.id || item.document_id || `mevzuat-${index}`,
    title: item.title || item.name || item.baslik || 'Başlık bulunamadı',
    type: item.type || item.document_type || item.tur || '',
    category: item.category || item.kategori || '',
    institution: item.institution || item.kurum || '',
    publishDate: item.publish_date || item.yayim_tarihi || item.date || '',
    url: item.url || item.link || '',
    summary: item.summary || item.ozet || item.content?.substring(0, 200) || '',
    content: item.content || item.icerik || '',
    relevanceScore: item.relevance_score || item.score || 0,
    highlight: item.highlight || item.excerpt || ''
  }));
}

export async function getMevzuatArticleTree(documentId: string): Promise<any> {
  if (!documentId?.trim()) {
    throw new Error('Doküman ID gerekli');
  }

  try {
    const data = await fetch(`${BASE_URL}/api/mevzuat/article/${documentId}`)
      .then(res => res.json());
    
    if (data?.success) {
      return data.data;
    } else {
      throw new Error(data?.message || 'Madde ağacı alınamadı');
    }
  } catch (error: any) {
    console.error('❌ Madde ağacı hatası:', error);
    throw new Error(error?.message || 'Madde ağacı alınırken hata oluştu');
  }
}

export async function getMevzuatArticleContent(documentId: string, articleId: string): Promise<any> {
  if (!documentId?.trim() || !articleId?.trim()) {
    throw new Error('Doküman ID ve Madde ID gerekli');
  }

  try {
    const data = await fetch(`${BASE_URL}/api/mevzuat/content/${documentId}/${articleId}`)
      .then(res => res.json());
    
    if (data?.success) {
      return data.data;
    } else {
      throw new Error(data?.message || 'Madde içeriği alınamadı');
    }
  } catch (error: any) {
    console.error('❌ Madde içeriği hatası:', error);
    throw new Error(error?.message || 'Madde içeriği alınırken hata oluştu');
  }
}
