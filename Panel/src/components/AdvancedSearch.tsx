import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mic, MicOff, X, Download, Copy, CheckCircle, AlertCircle, Clock, Brain, FileText, Users, Target, BarChart3, Heart, Calendar, TrendingUp, BookOpen, Scale, Gavel, Sun, Moon, Sparkles } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat } from '../lib/yargiApi';
import { useTheme } from '../contexts/ThemeContext';
import { geminiService } from '../services/geminiService';

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
  highlight: string;
}

const AdvancedSearch: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Ana Arama State'leri
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'ictihat' | 'mevzuat' | 'uyap'>('ictihat');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [backendStatus] = useState<'unknown' | 'ok' | 'degraded' | 'down'>('unknown');

  // Sonuç Detay State'leri
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showResultDetail, setShowResultDetail] = useState(false);
  
  // Gelişmiş Özellikler
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Array<{query: string, type: string, date: string, results: number}>>([]);

  // Tab State'leri
  const [activeTab, setActiveTab] = useState<'search' | 'timeline' | 'analytics' | 'emotion'>('search');
  
  // Sesli Arama State'leri
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const { isListening, startDictation, stopDictation, interimText, error: dictationError } = useDictation();

  // Zaman Çizelgesi State'leri
  const [timelineData, setTimelineData] = useState<Array<{
    date: string;
    title: string;
    description: string;
    type: 'law' | 'court' | 'legislation' | 'case';
    importance: 'high' | 'medium' | 'low';
  }>>([]);

  // Duygu Analizi State'leri
  const [emotionText, setEmotionText] = useState('');
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [emotionResults, setEmotionResults] = useState<{
    emotions: Array<{ emotion: string; score: number }>;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    insights: string;
  } | null>(null);

  // Sesli Komut State'leri
  const [voiceCommandHistory, setVoiceCommandHistory] = useState<Array<{
    command: string;
    time: string;
    status: 'success' | 'error';
    result: string;
  }>>([]);

  // Yapay Zeka State'leri
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  // Akıllı Arama Özellikleri
  const searchSuggestionsData = {
    'iş': ['iş sözleşmesi', 'iş sözleşmesi feshi', 'iş hukuku', 'işçi hakları', 'işveren yükümlülükleri'],
    'velayet': ['velayet değişikliği', 'velayet şartları', 'velayet hakkı', 'velayet davası', 'velayet tazminatı'],
    'borç': ['borç sözleşmesi', 'borç ödeme', 'borç faizi', 'borç taksitlendirme', 'borç silme'],
    'ceza': ['ceza hukuku', 'ceza davası', 'ceza tazminatı', 'ceza indirimi', 'ceza erteleme'],
    'ticaret': ['ticaret hukuku', 'ticaret sözleşmesi', 'ticaret davası', 'ticaret sicili', 'ticaret şirketi'],
    'aile': ['aile hukuku', 'aile davası', 'aile mahkemesi', 'aile danışmanlığı', 'aile koruması'],
    'sözleşme': ['sözleşme hukuku', 'sözleşme feshi', 'sözleşme ihlali', 'sözleşme tazminatı', 'sözleşme geçersizliği'],
    'tazminat': ['tazminat davası', 'tazminat hesaplama', 'tazminat türleri', 'tazminat miktarı', 'tazminat ödeme'],
    'nafaka': ['nafaka davası', 'nafaka miktarı', 'nafaka artırımı', 'nafaka azaltımı', 'nafaka ödeme'],
    'boşanma': ['boşanma davası', 'boşanma süreci', 'boşanma şartları', 'boşanma tazminatı', 'boşanma anlaşması']
  };

  // Akıllı arama önerileri
  const getSearchSuggestions = useCallback((input: string) => {
    if (input.length < 2) return [];
    
    const suggestions: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Doğrudan eşleşme
    Object.entries(searchSuggestionsData).forEach(([key, values]) => {
      if (key.includes(inputLower)) {
        suggestions.push(...values);
      }
      values.forEach(value => {
        if (value.includes(inputLower) && !suggestions.includes(value)) {
          suggestions.push(value);
        }
      });
    });
    
    return suggestions.slice(0, 5);
  }, []);

  // Arama fonksiyonu
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      let results: SearchResult[] = [];
      
      if (searchType === 'ictihat') {
        const ictihatResults = await searchIctihat(searchTerm, {
          courtType: selectedCourt as any,
          dateRange: dateRange ? { from: dateRange, to: dateRange } : undefined,
          legalArea: ''
        });
        results = ictihatResults.map(result => ({
          id: result.id,
          caseNumber: result.caseNumber || '',
          courtName: result.courtName || '',
          courtType: result.courtType || '',
          decisionDate: result.decisionDate || '',
          subject: result.subject || '',
          content: result.content || '',
          relevanceScore: result.relevanceScore || 0,
          legalAreas: result.legalAreas || [],
          keywords: result.keywords || [],
          highlight: result.highlight || ''
        }));
      } else if (searchType === 'mevzuat') {
        const mevzuatResults = await searchMevzuat(searchTerm, {
          category: '',
          dateRange: dateRange ? { from: dateRange, to: dateRange } : undefined
        });
        results = mevzuatResults.map(result => ({
          id: result.id,
          caseNumber: result.title || '',
          courtName: result.institution || '',
          courtType: 'mevzuat',
          decisionDate: result.publishDate || '',
          subject: result.title || '',
          content: result.content || '',
          relevanceScore: result.relevanceScore || 0,
          legalAreas: [result.category || ''],
          keywords: [searchTerm],
          highlight: result.highlight || ''
        }));
      }
      
      setSearchResults(results);
      
      // Yapay zeka analizi geçici olarak devre dışı
      // if (results.length > 0) {
      //   analyzeWithAI(results, searchTerm);
      // }
      
      // Arama geçmişine ekle
      setSearchHistory(prev => [{
        query: searchTerm,
        type: searchType,
        date: new Date().toLocaleDateString('tr-TR'),
        results: results.length
      }, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, selectedCourt, dateRange]);

  // Sesli arama başlatma
  const startVoiceSearch = useCallback(() => {
    setIsVoiceListening(true);
    setVoiceStatus('listening');
    setRecognizedText('');
        startDictation();
  }, [startDictation]);

  // Sesli arama durdurma
  const stopVoiceSearch = useCallback(() => {
    setIsVoiceListening(false);
    setVoiceStatus('processing');
        stopDictation();
  }, [stopDictation]);

  // Duygu analizi
  const analyzeEmotion = useCallback(async () => {
    if (!emotionText.trim()) return;
    
    setIsAnalyzingEmotion(true);
    try {
      // Simüle edilmiş duygu analizi
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      const emotions = [
        { emotion: 'Mutluluk', score: Math.random() * 0.8 + 0.2 },
        { emotion: 'Üzüntü', score: Math.random() * 0.6 + 0.1 },
        { emotion: 'Öfke', score: Math.random() * 0.4 + 0.1 },
        { emotion: 'Korku', score: Math.random() * 0.3 + 0.1 },
        { emotion: 'Şaşkınlık', score: Math.random() * 0.5 + 0.1 }
      ];
      
      const sentiment = emotions[0].score > 0.5 ? 'positive' : emotions[1].score > 0.5 ? 'negative' : 'neutral';
      const confidence = Math.max(...emotions.map(e => e.score));
      
      setEmotionResults({
        emotions: emotions.sort((a, b) => b.score - a.score),
        sentiment,
        confidence,
        insights: 'Bu metin genel olarak nötr bir duygusal ton taşımaktadır. Hukuki terminoloji kullanımı profesyonel bir yaklaşım sergilemektedir.'
      });
    } catch (error) {
      console.error('Duygu analizi hatası:', error);
    } finally {
      setIsAnalyzingEmotion(false);
    }
  }, [emotionText]);

  // Yapay zeka analizi
  const analyzeWithAI = useCallback(async (searchResults: SearchResult[], query: string) => {
    if (searchResults.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const resultsText = searchResults.map(result => 
        `${result.courtName} - ${result.subject}\n${result.content.substring(0, 500)}...`
      ).join('\n\n');

      const analysis = await geminiService.analyzeText(
        `Aşağıdaki hukuki arama sonuçlarını analiz et ve "${query}" konusunda kapsamlı bir değerlendirme yap. Sonuçları kategorize et, önemli noktaları vurgula ve pratik öneriler sun.`,
        `Arama Terimi: ${query}\n\nSonuçlar:\n${resultsText}`
      );
      
      setAiAnalysis(analysis);
      setShowAiAnalysis(true);
    } catch (error) {
      console.error('AI analizi hatası:', error);
      setAiAnalysis('AI analizi yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Sesli arama sonucu işleme
  useEffect(() => {
    if (interimText && interimText.trim()) {
      setRecognizedText(interimText);
      setQuery(interimText);
      setVoiceStatus('success');
      
      // Otomatik arama yap
      const timer = setTimeout(() => {
        handleSearch(interimText);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [interimText, handleSearch]);

  // Sesli arama hatası işleme
  useEffect(() => {
    if (dictationError) {
      setVoiceStatus('error');
      setIsVoiceListening(false);
    }
  }, [dictationError]);

  // Zaman çizelgesi verilerini yükle
  useEffect(() => {
    const timelineData = [
      {
        date: '2024-01-15',
        title: 'Yeni İş Kanunu Değişiklikleri',
        description: 'İş Kanunu\'nda önemli değişiklikler yapıldı',
        type: 'law' as const,
        importance: 'high' as const
      },
      {
        date: '2024-02-20',
        title: 'Yargıtay Boşanma Kararı',
        description: 'Yargıtay\'dan önemli boşanma kararı',
        type: 'court' as const,
        importance: 'medium' as const
      },
      {
        date: '2024-03-10',
        title: 'Mevzuat Güncellemesi',
        description: 'Mevzuat sisteminde güncellemeler',
        type: 'legislation' as const,
        importance: 'low' as const
      }
    ];
    setTimelineData(timelineData);
  }, []);

  // Input değişikliklerinde önerileri güncelle
  useEffect(() => {
    if (query.length >= 2) {
      const suggestions = getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, getSearchSuggestions]);

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? 'from-cyan-400 via-blue-500 to-purple-600' 
                    : 'from-slate-800 via-blue-700 to-indigo-600'
                }`}>
                  İçtihat & Mevzuat
                </h1>
                <p className={`text-lg mt-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  AI Destekli Hukuki Araştırma Platformu
                </p>
                <div className={`h-1 w-32 bg-gradient-to-r rounded-full mt-3 ${
                  isDarkMode 
                    ? 'from-cyan-400 to-blue-500' 
                    : 'from-blue-500 to-indigo-500'
                }`}></div>
        </div>
                <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
                    : 'bg-white/50 hover:bg-white/70 text-slate-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
              </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  backendStatus === 'ok' ? 'bg-emerald-500' : 
                  backendStatus === 'degraded' ? 'bg-amber-500' : 
                  backendStatus === 'down' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  {backendStatus === 'ok' ? 'Sistem Aktif' : 
                   backendStatus === 'degraded' ? 'Kısmi Hizmet' : 
                   backendStatus === 'down' ? 'Sistem Kapalı' : 'Durum Bilinmiyor'}
                </span>
              </div>
            </div>
                      </div>
                    </div>
                  </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className={`backdrop-blur-sm rounded-2xl p-2 shadow-xl border ${
          isDarkMode 
            ? 'bg-gray-800/70 border-gray-700/50' 
            : 'bg-white/70 border-white/20'
        }`}>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'search', label: 'Akıllı Arama', icon: Search, color: 'blue' },
              { id: 'timeline', label: 'Hukuki Zaman Çizelgesi', icon: Calendar, color: 'emerald' },
              { id: 'analytics', label: 'Analitik', icon: BarChart3, color: 'purple' },
              { id: 'emotion', label: 'AI Duygu Analizi', icon: Brain, color: 'rose' }
            ].map(tab => (
                          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105 ${
                        isDarkMode ? 'shadow-cyan-500/25' : ''
                      }`
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md' 
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-800 hover:shadow-md'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : isDarkMode 
                      ? 'text-gray-400 group-hover:text-gray-200' 
                      : 'text-slate-500 group-hover:text-slate-700'
                }`} />
                <span className="hidden sm:inline font-medium">{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="space-y-8">
            {/* Search Input */}
            <div className="relative">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hukuki konunuzu arayın..."
                    className={`w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                      isDarkMode 
                        ? 'border-gray-600 focus:ring-cyan-500/20 focus:border-cyan-500 bg-gray-700/50 text-white placeholder-gray-400' 
                        : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && (
                    <div className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-sm rounded-xl border shadow-xl z-10 overflow-hidden ${
                      isDarkMode 
                        ? 'bg-gray-800/95 border-gray-600' 
                        : 'bg-white/95 border-slate-200'
                    }`}>
                      {searchSuggestions.map((suggestion, index) => (
                          <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className={`w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors duration-200 font-medium ${
                            isDarkMode 
                              ? 'hover:bg-gray-700 text-gray-300 border-gray-600' 
                              : 'hover:bg-blue-50 text-slate-700 border-slate-100'
                          }`}
                        >
                          <Search className={`inline w-4 h-4 mr-2 ${
                            isDarkMode ? 'text-cyan-500' : 'text-blue-500'
                          }`} />
                          {suggestion}
                          </button>
                        ))}
                      </div>
                  )}
                    </div>

                {/* Voice Search Button */}
                          <button
                  onClick={isVoiceListening ? stopVoiceSearch : startVoiceSearch}
                  className={`px-4 py-4 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    isVoiceListening 
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700' 
                      : isDarkMode
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="hidden sm:inline">
                    {isVoiceListening ? 'Durdur' : 'Sesli Ara'}
                  </span>
                          </button>
                
                          <button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !query.trim()}
                  className={`px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Aranıyor...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Ara</span>
                    </>
                  )}
                          </button>
                    </div>

              {/* Voice Recognition Text */}
              {recognizedText && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' 
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm font-medium">Tanınan Metin:</span>
                      </div>
                  <p className="mt-1 text-sm">{recognizedText}</p>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Arama Türü</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                    isDarkMode 
                      ? 'border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-700/50 text-white' 
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800'
                  }`}
                >
                  <option value="ictihat">İçtihat</option>
                  <option value="mevzuat">Mevzuat</option>
                  <option value="uyap">UYAP Emsal</option>
                </select>
      </div>

              <div className="relative">
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Mahkeme</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                    isDarkMode 
                      ? 'border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-700/50 text-white' 
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800'
                  }`}
                >
                  <option value="">Tüm Mahkemeler</option>
                  <option value="yargitay">Yargıtay</option>
                  <option value="danistay">Danıştay</option>
                  <option value="uyap">UYAP Emsal</option>
                </select>
          </div>

              <div className="relative">
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>Tarih</label>
            <input
                  type="date"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                    isDarkMode 
                      ? 'border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-700/50 text-white' 
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Arama Sonuçları
                  </h3>
                  <div className={`px-4 py-2 rounded-full font-semibold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    {searchResults.length} Sonuç
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => {
                        setSelectedResult(result);
                        setShowResultDetail(true);
                      }}
                      className={`group backdrop-blur-sm border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                        isDarkMode 
                          ? 'bg-gray-700/60 border-gray-600 hover:border-cyan-400 hover:shadow-cyan-500/25' 
                          : 'bg-white/60 border-slate-200 hover:border-blue-400 hover:shadow-blue-500/25'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className={`text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors ${
                            isDarkMode ? 'text-white group-hover:text-cyan-400' : 'text-slate-800'
                          }`}>
                            {result.subject}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`flex items-center space-x-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-slate-500'
                            }`}>
                              <Gavel className="w-4 h-4" />
                              <span>{result.courtName}</span>
                            </span>
                            <span className={`flex items-center space-x-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-slate-500'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              <span>{result.decisionDate}</span>
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.relevanceScore > 0.8 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : result.relevanceScore > 0.6 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          %{Math.round(result.relevanceScore * 100)} İlgili
                        </div>
                      </div>

                      <p className={`mb-4 leading-relaxed whitespace-pre-line ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>
                        {result.content.substring(0, 800)}...
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {result.legalAreas.map((area, areaIndex) => (
                          <span
                            key={areaIndex}
                            className={`px-3 py-1 text-sm rounded-full font-medium border ${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30' 
                                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {area}
                          </span>
                        ))}
                      </div>

                      <div className={`mt-4 pt-4 border-t ${
                        isDarkMode ? 'border-gray-600' : 'border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center space-x-2 ${
                            isDarkMode ? 'text-gray-500' : 'text-slate-500'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Detayları görüntülemek için tıklayın</span>
          </div>
                          <div className={`flex items-center space-x-1 group-hover:transition-colors ${
                            isDarkMode 
                              ? 'text-cyan-400 group-hover:text-cyan-300' 
                              : 'text-blue-600 group-hover:text-blue-700'
                          }`}>
                            <span className="text-sm font-medium">Detay</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
        </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yapay Zeka Analizi */}
            {(isAnalyzing || showAiAnalysis) && (
              <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-purple-700/50' 
                  : 'bg-gradient-to-br from-purple-50/80 to-blue-50/80 border-purple-200/50'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        AI Hukuki Analiz
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        Yapay zeka destekli sonuç değerlendirmesi
                      </p>
                    </div>
                  </div>
          <button
                    onClick={() => setShowAiAnalysis(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
          </button>
        </div>

                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        AI analiz yapıyor...
          </span>
                    </div>
                    <p className={`mt-2 text-sm ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      Sonuçlar analiz ediliyor ve öneriler hazırlanıyor
                    </p>
                  </div>
                ) : (
                  <div className={`prose prose-lg max-w-none ${
                    isDarkMode 
                      ? 'prose-invert text-gray-300' 
                      : 'text-slate-700'
                  }`}>
                    <div className={`p-6 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-white/50 border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {aiAnalysis}
                      </div>
                    </div>
                  </div>
          )}
        </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Hukuki Zaman Çizelgesi
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Son hukuki gelişmeler ve önemli kararlar
            </p>
          </div>

          <div className="space-y-6">
            {timelineData.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    item.type === 'law' ? 'bg-blue-500' :
                    item.type === 'court' ? 'bg-green-500' :
                    item.type === 'legislation' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}>
                    {item.type === 'law' ? <BookOpen className="w-6 h-6 text-white" /> :
                     item.type === 'court' ? <Gavel className="w-6 h-6 text-white" /> :
                     item.type === 'legislation' ? <FileText className="w-6 h-6 text-white" /> :
                     <Scale className="w-6 h-6 text-white" />}
          </div>

                  <div className={`ml-6 flex-1 backdrop-blur-sm border rounded-xl p-6 ${
                    isDarkMode 
                      ? 'bg-gray-700/60 border-gray-600' 
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {item.title}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.importance === 'high' ? 'bg-red-100 text-red-800' :
                        item.importance === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.importance === 'high' ? 'Yüksek Önem' :
                         item.importance === 'medium' ? 'Orta Önem' : 'Düşük Önem'}
          </span>
          </div>

                    <p className={`leading-relaxed mb-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        item.type === 'law' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'court' ? 'bg-green-100 text-green-800' :
                        item.type === 'legislation' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.type === 'law' ? '📜 Kanun' :
                         item.type === 'court' ? '⚖️ Mahkeme' :
                         item.type === 'legislation' ? '📋 Mevzuat' : '🏛️ İçtihat'}
                      </span>
                      
                      <div className={`flex items-center space-x-2 ${
                        isDarkMode ? 'text-gray-500' : 'text-slate-500'
                      }`}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Analitik Dashboard
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Arama trendleri ve istatistikler
            </p>
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trend Analysis */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
              isDarkMode 
                ? 'bg-gray-700/60 border-gray-600' 
                : 'bg-white/60 border-slate-200'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Trend Analizi</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold mb-1">2.547</div>
                  <div className="text-purple-100">Toplam Arama</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm text-purple-100">Bu Ay</span>
                </div>
              </div>
          </div>

            {/* Recent Searches */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
              isDarkMode 
                ? 'bg-gray-700/60 border-gray-600' 
                : 'bg-white/60 border-slate-200'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Son Aramalar</h3>
              <div className="space-y-4">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-600/50 border-gray-500' 
                      : 'bg-white/50 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
          <div>
                        <p className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>{search.query}</p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-slate-600'
                        }`}>{search.type} • {search.date}</p>
          </div>
          </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{search.results}</p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>sonuç</p>
      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emotion Analysis Tab */}
      {activeTab === 'emotion' && (
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
          isDarkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              AI Duygu Analizi
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Hukuki metinlerin duygusal tonunu analiz edin
            </p>
          </div>

          <div className="space-y-6">
            {/* Input Area */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Analiz edilecek metin:
              </label>
              <textarea
                value={emotionText}
                onChange={(e) => setEmotionText(e.target.value)}
                placeholder="Analiz etmek istediğiniz hukuki metni buraya yazın..."
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium resize-none ${
                  isDarkMode 
                    ? 'border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-700/50 text-white placeholder-gray-400' 
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800 placeholder-slate-400'
                }`}
              />
                  <button
                onClick={analyzeEmotion}
                disabled={!emotionText.trim() || isAnalyzingEmotion}
                className={`px-8 py-3 rounded-xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                }`}
              >
                {isAnalyzingEmotion ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analiz Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Analiz Et</span>
                  </>
                )}
              </button>
                      </div>

            {/* Results */}
            {emotionResults && (
              <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
                isDarkMode 
                  ? 'bg-gray-700/60 border-gray-600' 
                  : 'bg-white/60 border-slate-200'
              }`}>
                <h3 className={`text-xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Analiz Sonuçları</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emotions */}
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>Duygular</h4>
                    <div className="space-y-3">
                      {emotionResults.emotions.map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>
                            {emotion.emotion}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000"
                                style={{ width: `${emotion.score * 100}%` }}
                              ></div>
                        </div>
                            <span className={`text-sm font-bold ${
                              isDarkMode ? 'text-gray-400' : 'text-slate-600'
                            }`}>
                              {Math.round(emotion.score * 100)}%
                            </span>
                      </div>
                    </div>
                      ))}
            </div>
                  </div>

                  {/* Sentiment */}
                  <div>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>Genel Duygu</h4>
                    <div className={`p-4 rounded-xl text-center ${
                      emotionResults.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                      emotionResults.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="text-2xl font-bold mb-2">
                        {emotionResults.sentiment === 'positive' ? '😊 Pozitif' :
                         emotionResults.sentiment === 'negative' ? '😔 Negatif' : '😐 Nötr'}
                    </div>
                      <div className="text-sm">
                        Güven: %{Math.round(emotionResults.confidence * 100)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>AI İçgörüleri</h4>
                  <p className={`leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    {emotionResults.insights}
                  </p>
            </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Detail Modal */}
      {showResultDetail && selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm rounded-2xl shadow-2xl border ${
            isDarkMode 
              ? 'bg-gray-800/95 border-gray-700/50' 
              : 'bg-white/95 border-white/20'
          }`}>
            <div className="sticky top-0 p-6 border-b backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Karar Detayları
                </h2>
              <button
                  onClick={() => setShowResultDetail(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-slate-600'
                  }`}
                >
                  <X className="w-6 h-6" />
              </button>
            </div>
        </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {selectedResult.subject}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      Mahkeme
              </div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {selectedResult.courtName}
              </div>
            </div>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      Karar Tarihi
          </div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {selectedResult.decisionDate}
              </div>
                    </div>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      Dava Numarası
                      </div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {selectedResult.caseNumber}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'
                  }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      İlgililik Oranı
                    </div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      %{Math.round(selectedResult.relevanceScore * 100)}
                    </div>
                  </div>
                    </div>
                  </div>

              <div>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Karar İçeriği
                  </h4>
                <div className={`p-6 rounded-lg border leading-relaxed ${
                  isDarkMode 
                    ? 'bg-gray-700/30 border-gray-600 text-gray-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {selectedResult.content}
                </div>
              </div>

              <div>
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Hukuki Alanlar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.legalAreas.map((area, index) => (
                        <span
                          key={index}
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30' 
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200'
                      }`}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(selectedResult.content)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Kopyala</span>
                </button>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([selectedResult.content], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `${selectedResult.caseNumber}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </button>
                    </div>
                  </div>
                </div>
            </div>
          )}
    </div>
  );
};

export default AdvancedSearch;