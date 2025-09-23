import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  BookOpen, 
  Gavel, 
  FileText, 
  Users, 
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Share2,
  Star,
  History,
  Zap,
  Target,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  Eye,
  MessageSquare
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'keyword' | 'phrase' | 'concept' | 'case' | 'law';
  popularity: number;
  category: string;
  relatedTerms: string[];
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'ictihat' | 'mevzuat' | 'karar' | 'kanun' | 'yönetmelik';
  court: string;
  date: string;
  relevanceScore: number;
  citationCount: number;
  tags: string[];
  summary: string;
  keyPoints: string[];
  relatedCases: string[];
  legalArea: string;
  importance: 'high' | 'medium' | 'low';
}

interface SearchAnalytics {
  totalResults: number;
  searchTime: number;
  categories: Array<{name: string, count: number}>;
  courts: Array<{name: string, count: number}>;
  timeRange: Array<{year: string, count: number}>;
  legalAreas: Array<{area: string, count: number}>;
}

const SmartLegalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    court: 'all',
    dateRange: 'all',
    legalArea: 'all',
    importance: 'all'
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations' | 'importance'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showAiInsights, setShowAiInsights] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Akıllı arama önerileri
  const smartSuggestions: SearchSuggestion[] = [
    {
      id: 'suggestion-1',
      text: 'velayet değişikliği',
      type: 'concept',
      popularity: 95,
      category: 'Aile Hukuku',
      relatedTerms: ['velayet', 'çocuk', 'boşanma', 'nafaka']
    },
    {
      id: 'suggestion-2',
      text: 'iş sözleşmesi feshi',
      type: 'concept',
      popularity: 88,
      category: 'İş Hukuku',
      relatedTerms: ['iş sözleşmesi', 'fesih', 'haksız fesih', 'tazminat']
    },
    {
      id: 'suggestion-3',
      text: 'borçlar kanunu 6098',
      type: 'law',
      popularity: 92,
      category: 'Borçlar Hukuku',
      relatedTerms: ['borç', 'sözleşme', 'tazminat', 'ifa']
    },
    {
      id: 'suggestion-4',
      text: 'Yargıtay 2. Hukuk Dairesi',
      type: 'court',
      popularity: 85,
      category: 'Yargıtay',
      relatedTerms: ['Yargıtay', '2. Hukuk', 'karar', 'içtihat']
    }
  ];

  // Arama önerilerini filtrele
  useEffect(() => {
    if (query.length >= 2) {
      const filtered = smartSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.relatedTerms.some(term => 
          term.toLowerCase().includes(query.toLowerCase())
        )
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  // Akıllı arama fonksiyonu
  const performSmartSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setShowSuggestions(false);
    
    // Arama geçmişine ekle
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
    
    // Simüle edilmiş akıllı arama
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: SearchResult[] = [
      {
        id: 'result-1',
        title: 'Velayet Değişikliği - Yargıtay 2. Hukuk Dairesi 2024/1234',
        content: 'Velayet değişikliği talebinin değerlendirilmesinde çocuğun yüksek yararı ilkesi esas alınmalıdır. Velayet değişikliği için somut olayın özelliklerine göre değerlendirme yapılmalıdır.',
        type: 'ictihat',
        court: 'Yargıtay 2. Hukuk Dairesi',
        date: '2024-01-15',
        relevanceScore: 98,
        citationCount: 45,
        tags: ['velayet', 'çocuk', 'aile hukuku', 'yüksek yarar'],
        summary: 'Velayet değişikliği kararlarında çocuğun yüksek yararı ilkesinin uygulanması',
        keyPoints: [
          'Çocuğun yüksek yararı ilkesi',
          'Somut olayın özellikleri',
          'Velayet değişikliği şartları'
        ],
        relatedCases: ['2023/5678', '2023/9012', '2024/3456'],
        legalArea: 'Aile Hukuku',
        importance: 'high'
      },
      {
        id: 'result-2',
        title: 'İş Sözleşmesi Feshi - Yargıtay 9. Hukuk Dairesi 2024/5678',
        content: 'İş sözleşmesinin feshi halinde işçinin hakları ve işverenin yükümlülükleri. Haksız fesih durumunda tazminat hesaplaması.',
        type: 'ictihat',
        court: 'Yargıtay 9. Hukuk Dairesi',
        date: '2024-01-10',
        relevanceScore: 95,
        citationCount: 32,
        tags: ['iş sözleşmesi', 'fesih', 'haksız fesih', 'tazminat'],
        summary: 'İş sözleşmesi feshi ve haksız fesih tazminatı',
        keyPoints: [
          'İş sözleşmesi feshi şartları',
          'Haksız fesih tazminatı',
          'İşçi hakları'
        ],
        relatedCases: ['2023/7890', '2024/1234', '2024/2345'],
        legalArea: 'İş Hukuku',
        importance: 'high'
      },
      {
        id: 'result-3',
        title: 'Borçlar Kanunu 6098 - Sözleşme Hukuku',
        content: 'Borçlar Kanunu 6098 sayılı kanunun sözleşme hukuku ile ilgili maddeleri. Sözleşmenin kurulması, ifası ve sona ermesi.',
        type: 'mevzuat',
        court: 'TBMM',
        date: '2011-07-01',
        relevanceScore: 92,
        citationCount: 156,
        tags: ['borçlar kanunu', 'sözleşme', 'ifa', 'sona erme'],
        summary: 'Borçlar Kanunu sözleşme hukuku hükümleri',
        keyPoints: [
          'Sözleşmenin kurulması',
          'Sözleşmenin ifası',
          'Sözleşmenin sona ermesi'
        ],
        relatedCases: ['2024/3456', '2024/4567', '2024/5678'],
        legalArea: 'Borçlar Hukuku',
        importance: 'high'
      }
    ];
    
    // Filtreleme
    let filteredResults = results;
    if (filters.type !== 'all') {
      filteredResults = filteredResults.filter(result => result.type === filters.type);
    }
    if (filters.court !== 'all') {
      filteredResults = filteredResults.filter(result => result.court.includes(filters.court));
    }
    if (filters.legalArea !== 'all') {
      filteredResults = filteredResults.filter(result => result.legalArea === filters.legalArea);
    }
    
    // Sıralama
    filteredResults.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'citations':
          return b.citationCount - a.citationCount;
        case 'importance':
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importance] - importanceOrder[a.importance];
        default:
          return 0;
      }
    });
    
    setSearchResults(filteredResults);
    
    // Arama analitiği
    const analytics: SearchAnalytics = {
      totalResults: filteredResults.length,
      searchTime: 1.2,
      categories: [
        { name: 'İçtihat', count: filteredResults.filter(r => r.type === 'ictihat').length },
        { name: 'Mevzuat', count: filteredResults.filter(r => r.type === 'mevzuat').length }
      ],
      courts: [
        { name: 'Yargıtay', count: filteredResults.filter(r => r.court.includes('Yargıtay')).length },
        { name: 'TBMM', count: filteredResults.filter(r => r.court === 'TBMM').length }
      ],
      timeRange: [
        { year: '2024', count: filteredResults.filter(r => r.date.startsWith('2024')).length },
        { year: '2023', count: filteredResults.filter(r => r.date.startsWith('2023')).length }
      ],
      legalAreas: [
        { area: 'Aile Hukuku', count: filteredResults.filter(r => r.legalArea === 'Aile Hukuku').length },
        { area: 'İş Hukuku', count: filteredResults.filter(r => r.legalArea === 'İş Hukuku').length },
        { area: 'Borçlar Hukuku', count: filteredResults.filter(r => r.legalArea === 'Borçlar Hukuku').length }
      ]
    };
    
    setSearchAnalytics(analytics);
    
    // AI İçgörüleri
    const insights = [
      `"${searchQuery}" araması için ${filteredResults.length} sonuç bulundu`,
      `En çok atıf alan karar: ${filteredResults[0]?.title}`,
      `Son 1 yılda bu konuda ${analytics.timeRange[0]?.count || 0} yeni karar verilmiş`,
      `Bu konuda en aktif mahkeme: ${analytics.courts[0]?.name || 'Bilinmiyor'}`
    ];
    
    setAiInsights(insights);
    setIsSearching(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    performSmartSearch(suggestion.text);
  };

  const handleSearch = () => {
    if (query.trim()) {
      performSmartSearch(query.trim());
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ictihat': return <Gavel className="w-4 h-4" />;
      case 'mevzuat': return <BookOpen className="w-4 h-4" />;
      case 'karar': return <FileText className="w-4 h-4" />;
      case 'kanun': return <BookOpen className="w-4 h-4" />;
      case 'yönetmelik': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ictihat': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'mevzuat': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'karar': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'kanun': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'yönetmelik': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Akıllı Hukuki Arama
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            AI destekli semantik arama ile hukuki içerikleri bulun
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="relative">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Hukuki arama terimi girin... (örn: velayet değişikliği, iş sözleşmesi feshi)"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {/* Akıllı Öneriler */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">
                                {suggestion.text}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {suggestion.category} • {suggestion.type}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                %{suggestion.popularity}
                              </span>
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isSearching}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {isSearching ? 'Aranıyor...' : 'Ara'}
                </button>
              </div>
            </div>

            {/* Arama Geçmişi */}
            {searchHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Son Aramalar:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(historyItem);
                        performSmartSearch(historyItem);
                      }}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        {searchResults.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Tüm Türler</option>
                    <option value="ictihat">İçtihat</option>
                    <option value="mevzuat">Mevzuat</option>
                    <option value="karar">Karar</option>
                  </select>
                  
                  <select
                    value={filters.court}
                    onChange={(e) => setFilters(prev => ({ ...prev, court: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Tüm Mahkemeler</option>
                    <option value="Yargıtay">Yargıtay</option>
                    <option value="TBMM">TBMM</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="relevance">İlgililik</option>
                    <option value="date">Tarih</option>
                    <option value="citations">Atıf Sayısı</option>
                    <option value="importance">Önem</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI İçgörüleri
                </h3>
                <button
                  onClick={() => setShowAiInsights(!showAiInsights)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {showAiInsights ? 'Gizle' : 'Göster'}
                </button>
              </div>
              {showAiInsights && (
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Arama Sonuçları ({searchResults.length})
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm">
                    <Download className="w-4 h-4 inline mr-1" />
                    İndir
                  </button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-sm">
                    <Share2 className="w-4 h-4 inline mr-1" />
                    Paylaş
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          {result.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {result.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(result.type)}`}>
                          {getTypeIcon(result.type)}
                          {result.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getImportanceColor(result.importance)}`}>
                          {result.importance}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Gavel className="w-4 h-4" />
                        <span>{result.court}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{result.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{result.citationCount} atıf</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Anahtar Noktalar:</h5>
                      <ul className="space-y-1">
                        {result.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          İlgililik: %{result.relevanceScore}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Analytics */}
        {searchAnalytics && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Arama Analitiği
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {searchAnalytics.totalResults}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Sonuç</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {searchAnalytics.searchTime}s
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Arama Süresi</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {searchAnalytics.categories[0]?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">İçtihat</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {searchAnalytics.categories[1]?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mevzuat</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartLegalSearch;
