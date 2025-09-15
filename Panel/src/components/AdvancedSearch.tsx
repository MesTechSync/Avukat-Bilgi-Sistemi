import React, { useState } from 'react';
import { Search, Filter, Calendar, Building, Scale, BookOpen, Download, Eye, Star } from 'lucide-react';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, time: 0 });
  const [dictationOn, setDictationOn] = useState<boolean>(() => {
    try { return localStorage.getItem('voice_dictation_enabled') === 'true'; } catch { return false; }
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
    { value: 'sayistay', label: 'Sayıştay' }
  ];

  const legalAreas = [
    'İş Hukuku', 'Ticaret Hukuku', 'Medeni Hukuk', 'Ceza Hukuku',
    'İdare Hukuku', 'Vergi Hukuku', 'Aile Hukuku', 'Miras Hukuku',
    'Borçlar Hukuku', 'Eşya Hukuku', 'İcra İflas Hukuku'
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setSearchStats({ total: mockResults.length, time: 0.23 });
      setIsSearching(false);
    }, 1500);
  };

  // Accept voice-driven search query and trigger search
  React.useEffect(() => {
    const onVoiceSearch = (e: Event) => {
      const { detail } = e as CustomEvent;
      const intent = detail?.intent as { action?: string; parameters?: any };
      if (intent?.action === 'SEARCH') {
        const q = intent.parameters?.query as string | undefined;
        if (q && q.trim()) {
          setQuery(q);
          // Defer to ensure input updates before triggering search
          setTimeout(() => handleSearch(), 0);
        }
      }
    };
    window.addEventListener('voice-command', onVoiceSearch as any);
    const onDictation = (e: Event) => {
      if (!dictationOn) return;
      const t = (e as CustomEvent).detail?.transcript as string;
      if (t && t.trim()) setQuery(prev => (prev ? prev + ' ' : '') + t.trim());
    };
    window.addEventListener('voice-dictation', onDictation as any);
    const onToggle = (e: Event) => {
      const en = !!(e as CustomEvent).detail?.enabled;
      setDictationOn(en);
    };
    window.addEventListener('voice-dictation-toggle', onToggle as any);
    return () => {
      window.removeEventListener('voice-command', onVoiceSearch as any);
      window.removeEventListener('voice-dictation', onDictation as any);
      window.removeEventListener('voice-dictation-toggle', onToggle as any);
    };
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">
            Yapay Zeka Destekli İçtihat Arama Motoru
          </h1>
          <p className="text-blue-100 text-lg">
            Milyonlarca karar arasından aradığınızı bulun
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>2.5M+ Karar</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>Tüm Mahkemeler</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>AI Destekli</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hukuki sorunuzu veya aradığınız konuyu yazın... (örn: işten çıkarma tazminatı)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSearching ? 'Aranıyor...' : 'Ara'}
          </button>
          <button
            onClick={() => { const nv = !dictationOn; setDictationOn(nv); try { localStorage.setItem('voice_dictation_enabled', nv ? 'true' : 'false'); } catch {} }}
            className={`px-3 py-3 rounded-lg border ${dictationOn ? 'border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-700`}
            title="Dikte Modu"
          >
            {dictationOn ? 'Dikte: Açık' : 'Dikte: Kapalı'}
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Mahkeme Türü
            </label>
            <select
              value={filters.courtType}
              onChange={(e) => setFilters(prev => ({ ...prev, courtType: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Mahkeme Türü"
              title="Mahkeme Türü"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Scale className="w-4 h-4 inline mr-1" />
              Hukuk Alanı
            </label>
            <select
              value={filters.legalArea}
              onChange={(e) => setFilters(prev => ({ ...prev, legalArea: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Hukuk Alanı"
              title="Hukuk Alanı"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, from: e.target.value }
              }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Başlangıç Tarihi"
              title="Başlangıç Tarihi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, to: e.target.value }
              }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Bitiş Tarihi"
              title="Bitiş Tarihi"
            />
          </div>
        </div>
      </div>

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
              results.map((result) => (
                <div key={result.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Görüntüle" title="Görüntüle">
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
        </div>
      )}

      {/* Search Tips */}
      {results.length === 0 && !isSearching && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Arama İpuçları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Etkili Arama İçin:</h4>
              <ul className="space-y-1">
                <li>• Spesifik terimler kullanın</li>
                <li>• Hukuk alanını belirtin</li>
                <li>• Tarih aralığı ekleyin</li>
                <li>• Mahkeme türünü seçin</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Örnek Aramalar:</h4>
              <ul className="space-y-1">
                <li>• "işten çıkarma tazminatı"</li>
                <li>• "ticari alacak davası"</li>
                <li>• "boşanma nafaka"</li>
                <li>• "trafik kazası tazminat"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}