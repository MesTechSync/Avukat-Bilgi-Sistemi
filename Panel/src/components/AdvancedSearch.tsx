import React, { useEffect, useState } from 'react';
import { Search, Filter, Calendar, Building, Scale, BookOpen, Download, Eye, Star, Gavel, FileText, X, FileUp } from 'lucide-react';
import { searchIctihat, searchMevzuat, MevzuatFilters } from '../lib/yargiApi';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';

interface SearchFilters {
  courtType: string;
  dateRange: { from: string; to: string };
  legalArea: string;
  decisionType: string;
  keywords: string[];
}

interface SearchResult {
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
  highlight?: string;
}

import { getBackendBase } from '../lib/yargiApi';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    courtType: '',
    dateRange: { from: '', to: '' },
    legalArea: '',
    decisionType: '',
    keywords: []
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, time: 0 });
  const [sort, setSort] = useState<{ by: 'date' | 'relevance'; dir: 'asc' | 'desc' } | null>(null);
  const [showAllMevzuat, setShowAllMevzuat] = useState(false);
  // Tips panel state (expanded, more content at once)
  const [showTips, setShowTips] = useState(true);
  // New: search bar UI state
  const [mode, setMode] = useState<'ictihat' | 'mevzuat'>('ictihat');
  const [showFilters, setShowFilters] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'ok' | 'degraded' | 'down'>('unknown');

  // Dikte hook'u
  const {
    isListening: isDictating,
    isSupported: isDictationSupported,
    interimText: dictationInterimText,
    error: dictationError,
    startDictation,
    stopDictation,
    clearDictation
  } = useDictation({
    onResult: (text) => {
      setQuery(prev => prev + (prev ? ' ' : '') + text);
      clearDictation();
    },
    onError: (error) => {
      console.error('Dikte hatası:', error);
    },
    continuous: false,
    interimResults: true
  });

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      caseNumber: '2023/1234',
      courtName: 'Yargıtay 4. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2023-06-15',
      subject: 'İş Sözleşmesinin Feshi ve Tazminat',
      content: 'İşçinin haklı sebep olmaksızın işten çıkarılması durumunda...',
      relevanceScore: 95,
      legalAreas: ['İş Hukuku', 'Tazminat'],
      keywords: ['işten çıkarma', 'tazminat', 'haklı sebep'],
      highlight: 'İşçinin haklı sebep olmaksızın işten çıkarılması durumunda kıdem ve ihbar tazminatı...'
    },
    {
      id: '2',
      caseNumber: '2023/5678',
      courtName: 'Danıştay 5. Dairesi',
      courtType: 'danistay',
      decisionDate: '2023-08-22',
      subject: 'İdari İşlemin İptali',
      content: 'İdari işlemin hukuka aykırılığı nedeniyle iptali...',
      relevanceScore: 87,
      legalAreas: ['İdare Hukuku'],
      keywords: ['idari işlem', 'iptal', 'hukuka aykırılık'],
      highlight: 'İdari işlemin hukuka aykırılığı nedeniyle iptali talep edilmiş...'
    },
    {
      id: '3',
      caseNumber: '2023/9012',
      courtName: 'İstanbul BAM 15. Hukuk Dairesi',
      courtType: 'bam',
      decisionDate: '2023-09-03',
      subject: 'Ticari Alacak Davası',
      content: 'Ticari sözleşmeden doğan alacağın tahsili...',
      relevanceScore: 82,
      legalAreas: ['Ticaret Hukuku', 'Borçlar Hukuku'],
      keywords: ['ticari alacak', 'sözleşme', 'tahsil'],
      highlight: 'Ticari sözleşmeden doğan alacağın tahsili için açılan davada...'
    }
  ];

  const courtTypes = [
    { value: 'yargitay', label: 'Yargıtay' },
    { value: 'danistay', label: 'Danıştay' },
    { value: 'bam', label: 'Bölge Adliye Mahkemesi' },
    { value: 'aym', label: 'Anayasa Mahkemesi' },
    { value: 'sayistay', label: 'Sayıştay' },
    { value: 'emsal', label: 'UYAP Emsal' },
    { value: 'istinaf', label: 'İstinaf Mahkemeleri' },
    { value: 'hukuk', label: 'Hukuk Mahkemeleri' }
  ];
  // Legal areas options
  const legalAreas = [
    'İş Hukuku', 'Ticaret Hukuku', 'Medeni Hukuk', 'Ceza Hukuku',
    'İdare Hukuku', 'Vergi Hukuku', 'Aile Hukuku', 'Miras Hukuku',
    'Borçlar Hukuku', 'Eşya Hukuku', 'İcra İflas Hukuku'
  ];

  // Helper: quick date range
  const setQuickDateRange = (months: number) => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setFilters(prev => ({ ...prev, dateRange: { from: fmt(from), to: fmt(to) } }));
  };

  // Backend readiness check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getBackendBase();
        const health = await fetch(`${base}/health`).then(r => r.ok ? 'ok' : 'bad').catch(() => 'bad');
        if (health !== 'ok') {
          if (!cancelled) setBackendStatus('down');
          return;
        }
        const db = await fetch(`${base}/api/databases`, { method: 'GET' }).then(r => r.ok ? 'ok' : 'bad').catch(() => 'bad');
        if (!cancelled) setBackendStatus(db === 'ok' ? 'ok' : 'degraded');
      } catch {
        if (!cancelled) setBackendStatus('down');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Search handler (real search for İçtihat; mock for Mevzuat for now)
  // Ses komutları için event listener
  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent) => {
      const { query, searchType } = event.detail;
      if (query) {
        setQuery(query);
        
        // Arama tipine göre modu ayarla
        if (searchType) {
          if (searchType === 'yargitay' || searchType === 'danistay' || searchType === 'emsal' || 
              searchType === 'bedesten' || searchType === 'istinaf' || searchType === 'hukuk') {
            setMode('ictihat');
          } else if (searchType === 'kanun' || searchType === 'yonetmelik' || 
                     searchType === 'kararname' || searchType === 'genelge') {
            setMode('mevzuat');
          }
        }
        
        // Arama yap
        handleSearch();
      }
    };

    const handleDictateStart = () => {
      if (isDictationSupported) {
        startDictation();
      }
    };

    const handleDictateStop = () => {
      if (isDictating) {
        stopDictation();
      }
    };

    window.addEventListener('voice-search', handleVoiceSearch as EventListener);
    window.addEventListener('dictate-start', handleDictateStart);
    window.addEventListener('dictate-stop', handleDictateStop);
    // Deep voice actions from App.tsx
    const handleDeep = (e: Event) => {
      const intent = (e as CustomEvent).detail?.intent as { action?: string; parameters?: any };
      if (!intent) return;
      switch (intent.action) {
        case 'SEARCH_SET_MODE':
          if (intent.parameters?.mode === 'ictihat' || intent.parameters?.mode === 'mevzuat') {
            setMode(intent.parameters.mode);
          }
          break;
        case 'SEARCH_SET_COURT':
          if (typeof intent.parameters?.courtType === 'string') {
            setFilters(prev => ({ ...prev, courtType: intent.parameters.courtType }));
          }
          break;
        case 'SEARCH_SET_LEGAL_AREA':
          if (typeof intent.parameters?.legalArea === 'string') {
            setFilters(prev => ({ ...prev, legalArea: intent.parameters.legalArea }));
          }
          break;
        case 'SEARCH_SET_DATE_RANGE':
          if (typeof intent.parameters?.months === 'number') {
            setQuickDateRange(intent.parameters.months);
          }
          break;
        case 'SEARCH_TOGGLE_FILTERS':
          setShowFilters(s => !s);
          break;
        case 'SEARCH_SORT':
          if (intent.parameters?.by && intent.parameters?.dir) {
            setSort({ by: intent.parameters.by, dir: intent.parameters.dir });
            // Re-run search if we already have results
            setTimeout(() => handleSearch(), 0);
          }
          break;
        case 'SEARCH_RUN':
          if (typeof intent.parameters?.query === 'string' && intent.parameters.query) setQuery(intent.parameters.query);
          setPage(1);
          setTimeout(() => handleSearch(), 0);
          break;
        case 'SEARCH_PAGE_NEXT':
          setPage(p => p + 1);
          break;
        case 'SEARCH_PAGE_PREV':
          setPage(p => Math.max(1, p - 1));
          break;
        case 'SEARCH_OPEN_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) setSelectedIndex(idx);
          break;
        }
      }
    };
    window.addEventListener('advanced-search-action', handleDeep);
    
    return () => {
      window.removeEventListener('voice-search', handleVoiceSearch as EventListener);
      window.removeEventListener('dictate-start', handleDictateStart);
      window.removeEventListener('dictate-stop', handleDictateStop);
      window.removeEventListener('advanced-search-action', handleDeep);
    };
  }, [isDictationSupported, isDictating, startDictation, stopDictation]);

  const handleSearch = async () => {
    setErrorMsg(null);
    setIsSearching(true);

    const t0 = performance.now();
    try {
      if (mode === 'ictihat') {
        // Map local filters to API filters
        const apiFilters = {
          courtType: (filters.courtType || 'yargitay') as any,
          dateRange: {
            from: filters.dateRange.from || undefined,
            to: filters.dateRange.to || undefined
          },
          legalArea: filters.legalArea || undefined
        };

        const data = await searchIctihat(query, apiFilters);
        const mapped: SearchResult[] = (data || []).map((r: any) => ({
          id: r.id,
          caseNumber: r.caseNumber || '',
          courtName: r.courtName || '',
          courtType: r.courtType || (filters.courtType || ''),
          decisionDate: r.decisionDate || '',
          subject: r.subject || '',
          content: r.content || '',
          relevanceScore: r.relevanceScore || 0,
          legalAreas: r.legalAreas || [],
          keywords: r.keywords || [],
          highlight: r.highlight
        }));

        const t1 = performance.now();
        // Apply sort if requested
        const sorted = [...mapped];
        if (sort?.by === 'date') {
          sorted.sort((a, b) => (new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime()) * (sort.dir === 'asc' ? 1 : -1));
        } else if (sort?.by === 'relevance') {
          sorted.sort((a, b) => (a.relevanceScore - b.relevanceScore) * (sort.dir === 'asc' ? 1 : -1));
        }
        setResults(sorted);
        setSearchStats({ total: mapped.length, time: Number(((t1 - t0) / 1000).toFixed(2)) });
      } else {
        // Mevzuat search - now connected to real backend
        const mevzuatFilters: MevzuatFilters = {
          category: filters.legalArea || undefined,
          institution: undefined,
          dateRange: {
            from: filters.dateRange.from || undefined,
            to: filters.dateRange.to || undefined
          },
          page: 1,
          per_page: 20
        };

        const mevzuatResults = await searchMevzuat(query, mevzuatFilters);
        
        // Map mevzuat results to SearchResult format
        const mapped: SearchResult[] = mevzuatResults.map((r: any) => ({
          id: r.id,
          caseNumber: r.type || 'Mevzuat',
          courtName: r.institution || 'Resmi Gazete',
          courtType: 'mevzuat',
          decisionDate: r.publishDate || '',
          subject: r.title || '',
          content: r.summary || r.content || '',
          relevanceScore: r.relevanceScore || 0,
          legalAreas: r.category ? [r.category] : [],
          keywords: [],
          highlight: r.highlight
        }));

        const t1 = performance.now();
        const sorted2 = [...mapped];
        if (sort?.by === 'date') {
          sorted2.sort((a, b) => (new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime()) * (sort.dir === 'asc' ? 1 : -1));
        } else if (sort?.by === 'relevance') {
          sorted2.sort((a, b) => (a.relevanceScore - b.relevanceScore) * (sort.dir === 'asc' ? 1 : -1));
        }
        setResults(sorted2);
        setSearchStats({ total: mapped.length, time: Number(((t1 - t0) / 1000).toFixed(2)) });
      }
    } catch (err: any) {
      const msg = err?.message || 'Arama sırasında bir hata oluştu';
      setErrorMsg(msg);
      // Artık demo fallback kullanmıyoruz; gerçek hatayı gösteriyoruz
      setResults([]);
      const t1 = performance.now();
      setSearchStats({ total: 0, time: Number(((t1 - t0) / 1000).toFixed(2)) });
    } finally {
      setIsSearching(false);
    }
  };

  // Enter to search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearching && query.trim()) {
      handleSearch();
    }
  };

  const getCourtTypeColor = (courtType: string) => {
    const colors = {
      yargitay: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      danistay: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      bam: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      aym: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sayistay: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[courtType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-5 rounded-lg">
        <div className="max-w-6xl mx-auto" />
        {/* Expanded tips panel */}
        <div className="absolute right-4 top-4">
          <span className="text-xs px-2 py-1 rounded-md border border-white/25 bg-white/10 backdrop-blur-md">
            Backend: {backendStatus === 'ok' ? 'Hazır' : backendStatus === 'degraded' ? 'Kısıtlı' : backendStatus === 'down' ? 'Kapalı' : 'Yoklanıyor'}
          </span>
        </div>
        {results.length === 0 && !isSearching && (
          <div className="mt-2">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100/90">Arama İpuçları</span>
                <button
                  onClick={() => setShowTips(v => !v)}
                  className="text-xs px-2 py-1 rounded-md bg-white/15 border border-white/25 hover:bg-white/25 transition-colors"
                  title={showTips ? 'İpuçlarını gizle' : 'İpuçlarını göster'}
                >
                  {showTips ? 'Gizle' : 'Göster'}
                </button>
              </div>
              {showTips && (
                <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* İçtihat odaklı - Enhanced */}
                  <div className="rounded-lg border border-white/25 bg-white/10 backdrop-blur-md p-3">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      İçtihatlarda Etkili Arama
                    </p>
                    <ul className="text-sm text-blue-50/95 space-y-1.5">
                      <li>• <strong>Daire ve karar numarası:</strong> "9. HD 2019/7021"</li>
                      <li>• <strong>Hukuk alanı + mahkeme:</strong> "İş Hukuku + Yargıtay"</li>
                      <li>• <strong>Tarih aralığı:</strong> Son 6 ay, 1 yıl gibi</li>
                      <li>• <strong>Anahtar kelimeler:</strong> Virgülle ayırın</li>
                      <li>• <strong>Tırnak içinde:</strong> "tam ifade" araması</li>
                    </ul>
                    <div className="mt-3">
                      <div className="text-xs text-blue-100/80 mb-1">Popüler İçtihat Konuları:</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'işten çıkarma tazminatı',
                          'ticari alacak davası', 
                          'boşanma nafaka',
                          'trafik kazası tazminat',
                          'kira artış oranı',
                          'mortgage kredisi',
                          'sigorta tazminatı',
                          'miras paylaşımı'
                        ].map((ex, i) => (
                          <button
                            key={i}
                            onClick={() => { setMode('ictihat'); setQuery(ex); setTimeout(() => handleSearch(), 0); }}
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-600/60 hover:bg-blue-600/80 border border-white/20 transition-colors"
                            title={`Örnek arama: ${ex}`}
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mevzuat odaklı - Enhanced */}
                  <div className="rounded-lg border border-white/25 bg-white/10 backdrop-blur-md p-3">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Mevzuatta Hızlı Gezinme
                    </p>
                    <ul className="text-sm text-blue-50/95 space-y-1.5">
                      <li>• <strong>Kanun numarası:</strong> "5510 sayılı kanun"</li>
                      <li>• <strong>Madde araması:</strong> "md.15", "Madde 15"</li>
                      <li>• <strong>Kategori seçimi:</strong> Kanun, Yönetmelik, Tebliğ</li>
                      <li>• <strong>Güncel mevzuat:</strong> Son değişiklikleri takip edin</li>
                      <li>• <strong>İlgili düzenlemeler:</strong> Alt mevzuatları kontrol edin</li>
                    </ul>
                    <div className="mt-3">
                      <div className="text-xs text-blue-100/80 mb-1">Mevzuat Kategorileri:</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { query: 'Medeni Kanun', cat: 'kanun' },
                          { query: 'İş Kanunu', cat: 'kanun' },
                          { query: 'Ticaret Kanunu', cat: 'kanun' },
                          { query: 'Borçlar Kanunu', cat: 'kanun' },
                          { query: 'Vergi Usul Kanunu', cat: 'kanun' },
                          { query: 'Sosyal Sigorta', cat: 'yönetmelik' }
                        ].map((item, i) => (
                          <button
                            key={i}
                            onClick={() => { 
                              setMode('mevzuat'); 
                              setQuery(item.query);
                              setFilters(prev => ({ ...prev, legalArea: item.cat }));
                              setTimeout(() => handleSearch(), 0); 
                            }}
                            className="text-xs px-2 py-0.5 rounded-full bg-purple-600/60 hover:bg-purple-600/80 border border-white/20 transition-colors"
                            title={`${item.cat}: ${item.query}`}
                          >
                            {item.query}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hızlı Filtreler ve Arama Teknikleri - Enhanced */}
                  <div className="rounded-lg border border-white/25 bg-white/10 backdrop-blur-md p-3">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Gelişmiş Arama Teknikleri
                    </p>
                    
                    {/* Hukuk Alanları */}
                    <div className="mb-3">
                      <div className="text-xs text-blue-50/95 mb-1">Hukuk Alanları:</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'İş Hukuku', 'Ticaret Hukuku', 'Ceza Hukuku', 'Aile Hukuku',
                          'İdare Hukuku', 'Vergi Hukuku', 'Borçlar Hukuku', 'Eşya Hukuku'
                        ].map((area, i) => (
                          <button
                            key={i}
                            onClick={() => setFilters(prev => ({ ...prev, legalArea: area }))}
                            className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/60 hover:bg-indigo-600/80 border border-white/20 transition-colors"
                            title={`Hukuk Alanı: ${area}`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mahkeme Türleri */}
                    <div className="mb-3">
                      <div className="text-xs text-blue-50/95 mb-1">Mahkeme Türleri:</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { key: 'yargitay', label: 'Yargıtay' },
                          { key: 'danistay', label: 'Danıştay' },
                          { key: 'bam', label: 'BAM' },
                          { key: 'aym', label: 'AYM' }
                        ].map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setFilters(prev => ({ ...prev, courtType: c.key }))}
                            className="text-xs px-2 py-0.5 rounded-full bg-teal-600/60 hover:bg-teal-600/80 border border-white/20 transition-colors"
                            title={`Mahkeme: ${c.label}`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hızlı Tarih Aralıkları */}
                    <div>
                      <div className="text-xs text-blue-50/95 mb-1">Hızlı Tarih:</div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { m: 1, label: '1 Ay' },
                          { m: 3, label: '3 Ay' },
                          { m: 6, label: '6 Ay' },
                          { m: 12, label: '1 Yıl' },
                          { m: 24, label: '2 Yıl' }
                        ].map((r, i) => (
                          <button
                            key={i}
                            onClick={() => setQuickDateRange(r.m)}
                            className="text-xs px-2 py-0.5 rounded-full bg-amber-600/60 hover:bg-amber-600/80 border border-white/20 transition-colors"
                            title={`Son ${r.label}`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Arama Operatörleri */}
                    <div className="mt-3 pt-2 border-t border-white/20">
                      <div className="text-xs text-blue-100/80 mb-1">Arama Operatörleri:</div>
                      <div className="text-xs text-blue-50/90 space-y-0.5">
                        <div>• <strong>"tam ifade"</strong> - Tırnak içinde tam eşleşme</div>
                        <div>• <strong>kelime1 AND kelime2</strong> - Her ikisi de olmalı</div>
                        <div>• <strong>kelime1 OR kelime2</strong> - Birinden biri olmalı</div>
                        <div>• <strong>-kelime</strong> - Bu kelimeyi hariç tut</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar (pill) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="rounded-xl md:rounded-full border border-blue-300/70 dark:border-blue-700/60 bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row md:items-center">
          {/* Tabs */}
          <div className="flex w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setMode('ictihat')}
              title="İçtihat araması"
              className={`px-4 py-2.5 text-sm flex items-center gap-2 ${mode==='ictihat' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <Gavel className="w-4 h-4" />
              İçtihat
            </button>
            <div className="w-px h-6 bg-blue-200/70 dark:bg-blue-800/60 self-center hidden md:block" />
            <button
              onClick={() => setMode('mevzuat')}
              title="Mevzuat araması"
              className={`px-4 py-2.5 text-sm flex items-center gap-2 ${mode==='mevzuat' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <BookOpen className="w-4 h-4" />
              Mevzuat
            </button>
          </div>

          {/* Input + actions */}
          <div className="flex-1 w-full flex flex-wrap md:flex-nowrap items-center gap-2 pl-3 pr-2">
            <Search className="w-5 h-5 text-blue-500" />
            <input
              type="text"
              value={query + (dictationInterimText ? ' ' + dictationInterimText : '')}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hangi konuda bilgi arıyorsunuz?"
              className="flex-1 min-w-0 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 py-2"
              title="Arama"
            />
            {query && (
              <button onClick={() => setQuery('')} title="Temizle" className="p-1 rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 shrink-0">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {/* Dikte butonu */}
            <DictationButton
              isListening={isDictating}
              isSupported={isDictationSupported}
              onStart={startDictation}
              onStop={stopDictation}
              size="sm"
              title="Sesli arama"
            />

            {/* File upload */}
            <label className="p-1 rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 cursor-pointer shrink-0" title="Belge yükleyerek ara">
              <input aria-label="Belge yükle" title="Belge yükle" type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploadedFileName(f.name);
                if (f.type.startsWith('text/')) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const txt = (reader.result as string) || '';
                    setQuery(txt.slice(0, 200));
                  };
                  reader.readAsText(f, 'utf-8');
                } else {
                  // For non-text, just hint file name in query
                  setQuery(prev => prev || `Belge: ${f.name}`);
                }
              }} />
              <FileUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </label>

            <div className="w-px h-6 bg-blue-200/70 dark:bg-blue-800/60 self-center hidden md:block" />

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              title="Filtrele"
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded-md shrink-0"
            >
              <Filter className="w-4 h-4" />
              Filtrele
            </button>

            {/* Search */}
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              title="Ara"
              className="ml-2 h-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hidden md:inline-flex"
            >
              {isSearching ? (
                <span>Aranıyor...</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Search className="w-5 h-5" /> Ara</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search button */}
        <div className="mt-2 md:hidden">
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            title="Ara"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span>Aranıyor...</span>
            ) : (
              <span className="inline-flex items-center gap-2 justify-center"><Search className="w-5 h-5" /> Ara</span>
            )}
          </button>
        </div>

        {/* Mode chip */}
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {mode === 'ictihat' ? <Gavel className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {mode === 'ictihat' ? 'İçtihat Araması' : 'Mevzuat Araması'}
          </span>
          {uploadedFileName && (
            <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">Belge: {uploadedFileName}</span>
          )}
        </div>

        {/* Advanced Filters (toggle) */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label htmlFor="courtTypeSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Mahkeme Türü
            </label>
            <select
              id="courtTypeSelect"
              value={filters.courtType}
              onChange={(e) => setFilters(prev => ({ ...prev, courtType: e.target.value }))}
              title="Mahkeme Türü"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tümü</option>
              {courtTypes.map(court => (
                <option key={court.value} value={court.value}>
                  {court.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="legalAreaSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Scale className="w-4 h-4 inline mr-1" />
              Hukuk Alanı
            </label>
            <select
              id="legalAreaSelect"
              value={filters.legalArea}
              onChange={(e) => setFilters(prev => ({ ...prev, legalArea: e.target.value }))}
              title="Hukuk Alanı"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tümü</option>
              {legalAreas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateFromInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              id="dateFromInput"
              value={filters.dateRange.from}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, from: e.target.value }
              }))}
              title="Başlangıç Tarihi"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="dateToInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Bitiş Tarihi
            </label>
            <input
              type="date"
              id="dateToInput"
              value={filters.dateRange.to}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, to: e.target.value }
              }))}
              title="Bitiş Tarihi"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200 p-3">
          {errorMsg}
        </div>
      )}

      {/* Landing Sections: İçtihatlar + Mevzuatlar (shown when idle) */}
      {results.length === 0 && !isSearching && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* İçtihatlar */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <header className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">İçtihatlar</h2>
              <p className="text-gray-600 dark:text-gray-300">Yargıtay, Danıştay ve diğer mahkeme kararlarına erişebilir, güncel ve arşiv kararları üzerinde arama yapabilirsiniz.</p>
            </header>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mahkeme Kararları</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Yargıtay Kararları',
                  count: '9.402.326 kayıt',
                  desc: 'Temyiz incelemesinde en üst derece mahkemesi kararları',
                  icon: Gavel,
                  badge: 'Yargıtay',
                  court: 'yargitay'
                },
                {
                  title: 'Danıştay Kararları',
                  count: '304.261 kayıt',
                  desc: 'İdari davalarda son inceleme merci kararları',
                  icon: Scale,
                  badge: 'Danıştay',
                  court: 'danistay'
                },
                {
                  title: 'Bölge Adliye Mahkemesi Kararları',
                  count: '190.030 kayıt',
                  desc: 'İstinaf incelemesine tabi kararlar',
                  icon: Building,
                  badge: 'BAM',
                  court: 'bam'
                },
                {
                  title: 'Kanun Yararına Bozma Kararları',
                  count: '1.341 kayıt',
                  desc: 'Kanun yararına bozma yoluna konu kararlar',
                  icon: Gavel,
                  badge: 'KYB',
                  court: ''
                },
                {
                  title: 'Asliye Ticaret Mahkemesi Kararları',
                  count: '18.423 kayıt',
                  desc: 'Ticari uyuşmazlıklara ilişkin kararlar',
                  icon: Building,
                  badge: 'ATM',
                  court: ''
                },
                {
                  title: 'Fikri Sinai Haklar Mahkemesi Kararları',
                  count: '9.847 kayıt',
                  desc: 'Fikri ve sınai mülkiyet hukukuna ilişkin kararlar',
                  icon: Star,
                  badge: 'FSHM',
                  court: ''
                }
              ].map((c, idx) => {
                const Icon = c.icon as any;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setMode('ictihat');
                      if (c.court) {
                        setFilters(prev => ({ ...prev, courtType: c.court! }));
                      }
                      // Trigger a demo search using current query or a generic keyword
                      if (!query.trim()) setQuery(c.title);
                      setTimeout(() => handleSearch(), 0);
                    }}
                    className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors min-h-[104px]"
                    title={c.title}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-gray-900 dark:text-white truncate">{c.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{c.badge}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{c.count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mevzuatlar */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <header className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mevzuatlar</h2>
              <p className="text-gray-600 dark:text-gray-300">Tüm güncel kanun, yönetmelik ve diğer resmi mevzuatlara buradan erişebilirsiniz.</p>
            </header>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mevzuat Kategorileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Kanunlar', count: '914 kayıt', updated: '23.08.2025' },
                { title: 'Cumhurbaşkanı Kararnameleri', count: '56 kayıt', updated: '24.08.2025' },
                { title: 'Bakanlar Kurulu Yönetmelikleri', count: '155 kayıt', updated: '06.04.2025' },
                { title: 'Cumhurbaşkanlığı Yönetmelikleri', count: '162 kayıt', updated: '23.08.2025' },
                { title: 'Cumhurbaşkanı Kararları', count: '3.665 kayıt', updated: '10.09.2025' },
                { title: 'Cumhurbaşkanlığı Genelgeleri', count: '29 kayıt', updated: '07.04.2025' },
                { title: 'Kanun Hükmünde Kararnameler', count: '63 kayıt', updated: '08.04.2025' },
                { title: 'Tüzükler', count: '110 kayıt', updated: '08.04.2025' },
                { title: 'Kurum ve Kuruluş Yönetmelikleri', count: '202 kayıt', updated: '07.05.2025' },
                { title: 'Üniversite Yönetmelikleri', count: '3.175 kayıt', updated: '10.09.2025' },
                { title: 'Tebliğler', count: '262 kayıt', updated: '10.09.2025' },
                { title: 'Mülga Mevzuat', count: '123 kayıt', updated: '15.04.2025' }
              ].slice(0, showAllMevzuat ? undefined : 8).map((m, idx) => (
                <div
                  key={idx}
                  className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors min-h-[104px]"
                  title={`${m.title} • ${m.count}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900 dark:text-white truncate">{m.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{m.count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Güncellenme: {m.updated}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-4">
              <button
                onClick={() => setShowAllMevzuat(v => !v)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                title="Tüm mevzuat türlerini listele"
              >
                {showAllMevzuat ? 'Daha Az Göster' : 'Tüm Mevzuatlar'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Search Results */}
      {(results.length > 0 || isSearching) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Results Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Arama Sonuçları
                </h3>
                {!isSearching && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {searchStats.total} sonuç bulundu ({searchStats.time} saniye)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  Filtrele
                </button>
                <button className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4" />
                  Dışa Aktar
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Milyonlarca karar arasında arama yapılıyor...
                </p>
              </div>
            ) : (
              results.slice((page - 1) * pageSize, page * pageSize).map((result, idx) => (
                <div key={result.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIndex === idx + 1 ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCourtTypeColor(result.courtType)}`}>
                        {result.courtName}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.caseNumber}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(result.decisionDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          %{result.relevanceScore}
                        </span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Görüntüle">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {result.subject}
                  </h4>

                  {result.highlight && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {result.highlight}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1">
                      {result.legalAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          {!isSearching && results.length > pageSize && (
            <div className="flex items-center justify-center gap-3 p-3 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Önceki</button>
              <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {page} / {Math.ceil(results.length / pageSize)}</span>
              <button onClick={() => setPage(p => Math.min(Math.ceil(results.length / pageSize), p + 1))} disabled={page >= Math.ceil(results.length / pageSize)} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Sonraki</button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Search Tips removed; tips are shown as animated ticker in header */}
    </div>
  );
}