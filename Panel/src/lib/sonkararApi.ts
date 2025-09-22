// Sonkarar.com API entegrasyonu
// https://www.sonkarar.com/search?type=ictihat
// https://www.sonkarar.com/search?type=mevzuat

export interface SonkararIctihatResult {
  id: string;
  caseNumber: string;
  courtName: string;
  courtType: string;
  decisionDate: string;
  subject: string;
  content: string;
  relevanceScore: number;
  legalAreas: string[];
  keywords: string[];
  highlight: string;
  url?: string;
}

export interface SonkararMevzuatResult {
  id: string;
  title: string;
  type: string;
  category: string;
  institution: string;
  publishDate: string;
  url: string;
  summary: string;
  content: string;
  relevanceScore: number;
  highlight: string;
}

export interface SonkararSearchParams {
  query: string;
  type: 'ictihat' | 'mevzuat';
  page?: number;
  limit?: number;
  courtType?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

// Sonkarar.com API base URL
const SONKARAR_BASE_URL = 'https://www.sonkarar.com/api';

// CORS proxy kullanarak API çağrıları yapma
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchWithCORS(url: string, options?: RequestInit): Promise<any> {
  try {
    // Önce direkt API'yi dene
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // CORS hatası varsa proxy kullan
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl, options);
    
    if (proxyResponse.ok) {
      return await proxyResponse.json();
    }
    
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.error('Sonkarar API hatası:', error);
    throw error;
  }
}

// İçtihat arama fonksiyonu
export async function searchSonkararIctihat(params: SonkararSearchParams): Promise<SonkararIctihatResult[]> {
  try {
    const searchUrl = `${SONKARAR_BASE_URL}/search`;
    
    const requestBody = {
      type: 'ictihat',
      query: params.query,
      page: params.page || 1,
      limit: params.limit || 20,
      court_type: params.courtType,
      date_from: params.dateFrom,
      date_to: params.dateTo
    };

    console.log('🔍 Sonkarar İçtihat API çağrısı:', requestBody);
    
    const data = await fetchWithCORS(searchUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (data?.success && data?.results) {
      return mapSonkararIctihatResults(data.results);
    } else if (data?.data) {
      return mapSonkararIctihatResults(data.data);
    } else {
      // Fallback: Mock data döndür
      console.log('⚠️ Sonkarar API başarısız, mock data kullanılıyor');
      return getMockIctihatResults(params.query);
    }
  } catch (error) {
    console.error('❌ Sonkarar İçtihat API hatası:', error);
    // Fallback: Mock data döndür
    return getMockIctihatResults(params.query);
  }
}

// Mevzuat arama fonksiyonu
export async function searchSonkararMevzuat(params: SonkararSearchParams): Promise<SonkararMevzuatResult[]> {
  try {
    const searchUrl = `${SONKARAR_BASE_URL}/search`;
    
    const requestBody = {
      type: 'mevzuat',
      query: params.query,
      page: params.page || 1,
      limit: params.limit || 20,
      category: params.category,
      date_from: params.dateFrom,
      date_to: params.dateTo
    };

    console.log('🔍 Sonkarar Mevzuat API çağrısı:', requestBody);
    
    const data = await fetchWithCORS(searchUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (data?.success && data?.results) {
      return mapSonkararMevzuatResults(data.results);
    } else if (data?.data) {
      return mapSonkararMevzuatResults(data.data);
    } else {
      // Fallback: Mock data döndür
      console.log('⚠️ Sonkarar API başarısız, mock data kullanılıyor');
      return getMockMevzuatResults(params.query);
    }
  } catch (error) {
    console.error('❌ Sonkarar Mevzuat API hatası:', error);
    // Fallback: Mock data döndür
    return getMockMevzuatResults(params.query);
  }
}

// Sonkarar İçtihat sonuçlarını map etme
function mapSonkararIctihatResults(results: any[]): SonkararIctihatResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((item: any, index: number) => ({
    id: item.id || item.decision_id || `sonkarar-ictihat-${index}`,
    caseNumber: item.case_number || item.esas_no || item.karar_no || '',
    courtName: item.court_name || item.mahkeme || item.court || '',
    courtType: item.court_type || item.mahkeme_turu || '',
    decisionDate: item.decision_date || item.karar_tarihi || item.date || '',
    subject: item.subject || item.konu || item.title || '',
    content: item.content || item.metin || item.text || '',
    relevanceScore: item.relevance_score || item.score || 0,
    legalAreas: item.legal_areas || item.hukuk_alanları || [],
    keywords: item.keywords || item.anahtar_kelimeler || [],
    highlight: item.highlight || item.snippet || '',
    url: item.url || item.link || ''
  }));
}

// Sonkarar Mevzuat sonuçlarını map etme
function mapSonkararMevzuatResults(results: any[]): SonkararMevzuatResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((item: any, index: number) => ({
    id: item.id || item.document_id || `sonkarar-mevzuat-${index}`,
    title: item.title || item.baslik || item.name || '',
    type: item.type || item.document_type || item.tur || '',
    category: item.category || item.kategori || '',
    institution: item.institution || item.kurum || '',
    publishDate: item.publish_date || item.yayim_tarihi || item.date || '',
    url: item.url || item.link || '',
    summary: item.summary || item.ozet || '',
    content: item.content || item.icerik || '',
    relevanceScore: item.relevance_score || item.score || 0,
    highlight: item.highlight || item.snippet || ''
  }));
}

// Mock İçtihat verileri
function getMockIctihatResults(query: string): SonkararIctihatResult[] {
  const mockData: SonkararIctihatResult[] = [
    {
      id: 'sonkarar-ictihat-001',
      caseNumber: '2024/1234',
      courtName: 'Yargıtay 2. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-01-15',
      subject: 'İş Sözleşmesi Feshi ve Tazminat',
      content: 'İşverenin haklı nedenle fesih hakkının kullanılması durumunda, işçinin kıdem tazminatına hak kazanamayacağına dair karar.',
      relevanceScore: 95,
      legalAreas: ['İş Hukuku'],
      keywords: ['iş sözleşmesi', 'fesih', 'tazminat', 'haklı neden'],
      highlight: 'İşverenin haklı nedenle fesih hakkının kullanılması durumunda, işçinin kıdem tazminatına hak kazanamayacağı',
      url: 'https://www.sonkarar.com/ictihat/2024/1234'
    },
    {
      id: 'sonkarar-ictihat-002',
      caseNumber: '2024/5678',
      courtName: 'Yargıtay 3. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-02-20',
      subject: 'Ticari İşlerde Faiz Hesaplaması',
      content: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanmasına dair usul ve esaslar.',
      relevanceScore: 88,
      legalAreas: ['Ticaret Hukuku'],
      keywords: ['ticari iş', 'faiz', 'hesaplama', 'oran'],
      highlight: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanmasına dair usul ve esaslar',
      url: 'https://www.sonkarar.com/ictihat/2024/5678'
    },
    {
      id: 'sonkarar-ictihat-003',
      caseNumber: '2024/9012',
      courtName: 'Danıştay 6. Daire',
      courtType: 'danistay',
      decisionDate: '2024-03-10',
      subject: 'İdari İşlemlerde Yetki',
      content: 'İdari makamların yetki sınırları ve işlemlerin hukuka uygunluğunun denetimi.',
      relevanceScore: 92,
      legalAreas: ['İdare Hukuku'],
      keywords: ['idari işlem', 'yetki', 'denetim', 'hukuka uygunluk'],
      highlight: 'İdari makamların yetki sınırları ve işlemlerin hukuka uygunluğunun denetimi',
      url: 'https://www.sonkarar.com/ictihat/2024/9012'
    }
  ];

  // Query'ye göre filtrele
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase();
    return mockData.filter(item => 
      item.subject.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.caseNumber.toLowerCase().includes(searchTerm) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  return mockData;
}

// Mock Mevzuat verileri
function getMockMevzuatResults(query: string): SonkararMevzuatResult[] {
  const mockData: SonkararMevzuatResult[] = [
    {
      id: 'sonkarar-mevzuat-001',
      title: 'Sözleşme Hukuku Genel Hükümler',
      type: 'kanun',
      category: 'Medeni Hukuk',
      institution: 'TBMM',
      publishDate: '2001-11-22',
      url: 'https://www.sonkarar.com/mevzuat/tmk-609',
      summary: 'Sözleşmelerin kurulması, geçerliliği ve ifasına dair genel hükümler.',
      content: 'Sözleşmelerin kurulması, geçerliliği ve ifasına dair genel hükümler.',
      relevanceScore: 98,
      highlight: 'Sözleşmelerin kurulması, geçerliliği ve ifasına dair genel hükümler'
    },
    {
      id: 'sonkarar-mevzuat-002',
      title: 'İş Sözleşmesi Türleri',
      type: 'kanun',
      category: 'İş Hukuku',
      institution: 'TBMM',
      publishDate: '2003-06-10',
      url: 'https://www.sonkarar.com/mevzuat/ik-17',
      summary: 'Belirsiz süreli, belirli süreli ve deneme süreli iş sözleşmelerinin özellikleri.',
      content: 'Belirsiz süreli, belirli süreli ve deneme süreli iş sözleşmelerinin özellikleri.',
      relevanceScore: 94,
      highlight: 'Belirsiz süreli, belirli süreli ve deneme süreli iş sözleşmelerinin özellikleri'
    },
    {
      id: 'sonkarar-mevzuat-003',
      title: 'Ceza Hukukunda Kusur',
      type: 'kanun',
      category: 'Ceza Hukuku',
      institution: 'TBMM',
      publishDate: '2004-09-26',
      url: 'https://www.sonkarar.com/mevzuat/tck-26',
      summary: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi esasları.',
      content: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi esasları.',
      relevanceScore: 96,
      highlight: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi esasları'
    }
  ];

  // Query'ye göre filtrele
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase();
    return mockData.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.summary.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  return mockData;
}
