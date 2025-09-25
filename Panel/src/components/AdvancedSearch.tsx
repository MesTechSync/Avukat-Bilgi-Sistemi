import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mic, MicOff, X, Download, Copy, CheckCircle, AlertCircle, Clock, Brain, FileText, Users, Target, BarChart3, Heart, Calendar, TrendingUp, BookOpen, Scale, Gavel } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat } from '../lib/yargiApi';
import { useTheme } from '../contexts/ThemeContext';

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

  // 🔍 Ana Arama State'leri
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'ictihat' | 'mevzuat' | 'uyap'>('ictihat');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedArea] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [backendStatus] = useState<'unknown' | 'ok' | 'degraded' | 'down'>('unknown');

  // 📁 Dosya Yükleme State'leri (Kullanılmıyor)
  // const [uploadedFileName] = useState<string | null>(null);
  // const [uploadedFileContent] = useState<string | null>(null);
  // const [isProcessingFile] = useState(false);
  
  // 📋 Sonuç Detay State'leri
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showResultDetail, setShowResultDetail] = useState(false);
  
  // 🚀 Gelişmiş Özellikler
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [favoriteCourts] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{query: string, type: string, date: string, results: number}>>([]);
  // const [trendAnalysis] = useState<{trend: string, count: number}[]>([]);
  // const [aiSummary] = useState<string>('');
  // const [showAiSummary] = useState(false);

  // 🚀 Yeni Özellikler
  const [activeTab, setActiveTab] = useState<'search' | 'timeline' | 'analytics' | 'emotion' | 'voice'>('search');
  
  // 📅 Hukuki Zaman Çizelgesi State'leri
  const [timelineData, setTimelineData] = useState<Array<{
    date: string;
    title: string;
    description: string;
    type: 'law' | 'court' | 'legislation' | 'precedent';
    importance: 'high' | 'medium' | 'low';
  }>>([]);
  // const [selectedTimelinePeriod] = useState('all');
  
  // 🧠 AI Duygu Analizi State'leri
  const [emotionText, setEmotionText] = useState('');
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [emotionResults, setEmotionResults] = useState<{
    emotions: Array<{emotion: string, score: number}>;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    insights?: string;
  } | null>(null);
  
  // 🎤 Sesli Arama State'leri
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceCommandHistory, setVoiceCommandHistory] = useState<Array<{
    command: string;
    time: string;
    status: 'success' | 'error';
    result?: string;
  }>>([]);

  const { startDictation, stopDictation, interimText, error: dictationError } = useDictation();

  // 🎤 Akıllı Sesli Komutlar
  const voiceCommands = [
    { command: 'velayet ara', action: 'search', params: { query: 'velayet', type: 'ictihat' } },
    { command: 'iş hukuku', action: 'search', params: { query: 'iş hukuku', type: 'ictihat' } },
    { command: 'boşanma kararları', action: 'search', params: { query: 'boşanma', type: 'ictihat' } },
    { command: 'uyap emsal', action: 'search', params: { query: '', type: 'uyap' } },
    { command: 'yargıtay kararları', action: 'search', params: { query: '', type: 'yargitay' } },
    { command: 'mevzuat ara', action: 'search', params: { query: '', type: 'mevzuat' } },
    { command: 'zaman çizelgesi', action: 'navigate', params: { tab: 'timeline' } },
    { command: 'duygu analizi', action: 'navigate', params: { tab: 'emotion' } },
    { command: 'analitik aç', action: 'navigate', params: { tab: 'analytics' } },
    { command: 'arama sayfası', action: 'navigate', params: { tab: 'search' } }
  ];

  // 🚀 Akıllı Arama Özellikleri
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
  const getSearchSuggestions = (input: string) => {
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
  };

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
          legalArea: selectedArea
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
          category: selectedArea,
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
      
      // Arama geçmişine ekle
      setSearchHistory(prev => [{
        query: searchTerm,
        type: searchType,
        date: new Date().toISOString(),
        results: results.length
      }, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, selectedCourt, dateRange, selectedArea]);

  // Sesli arama başlatma
  const startVoiceSearch = () => {
    setIsVoiceListening(true);
    setVoiceStatus('listening');
    setRecognizedText('');
    startDictation();
  };

  // Sesli arama durdurma
  const stopVoiceSearch = () => {
    setIsVoiceListening(false);
    setVoiceStatus('processing');
    stopDictation();
  };

  // Sesli komut başlatma
  const startVoiceCommand = () => {
    setIsVoiceListening(true);
    setVoiceStatus('listening');
    setRecognizedText('');
    startDictation();
  };

  // Sesli komut durdurma
  const stopVoiceCommand = () => {
    setIsVoiceListening(false);
    setVoiceStatus('processing');
    stopDictation();
  };

  // Sesli komut işleme
  const processVoiceCommand = (command: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR');
    
    // Komut geçmişine ekle
    setVoiceCommandHistory(prev => [...prev, {
      command,
      time: timeString,
      status: 'success',
      result: 'Komut başarıyla işlendi'
    }]);
    
    // Komut işleme mantığı burada olacak
    console.log('Processing voice command:', command);
  };

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

  // Duygu analizi
  const analyzeEmotion = async () => {
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
  };

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
  }, [query]);

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <h1 className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent mb-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-600'
              }`}>
                İçtihat & Mevzuat
              </h1>
              <p className={`text-lg font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Türkiye'nin En Kapsamlı Hukuki Veri Merkezi
              </p>
              <div className={`absolute -bottom-2 left-0 w-24 h-1 rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}></div>
        </div>
            <div className="flex items-center space-x-3">
              {/* Gece Modu Toggle */}
                <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
                </button>
              
              <div className={`backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-white/20'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    backendStatus === 'ok' ? 'bg-emerald-500 animate-pulse' : 
                    backendStatus === 'degraded' ? 'bg-amber-500 animate-pulse' : 
                    backendStatus === 'down' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
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
          <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 mb-8 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-white/20'
          }`}>
            {/* Search Form */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Hukuki Veri Arama</h2>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>Yargıtay, UYAP Emsal ve Mevzuat verilerinde arama yapın</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Arama terimi girin... (örn: velayet, iş hukuku, boşanma)"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                        isDarkMode 
                          ? 'border-gray-600 focus:ring-cyan-500/20 focus:border-cyan-500 bg-gray-700/50 text-white placeholder-gray-400' 
                          : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  {showSuggestions && (
                    <div className={`absolute top-full left-0 right-0 backdrop-blur-sm border rounded-xl shadow-2xl z-10 mt-2 overflow-hidden ${
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

                {/* Sesli Arama Butonu */}
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

              {/* Sesli Arama Durumu */}
              {recognizedText && (
                <div className={`mb-4 p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <p className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                  }`}>Tanınan Metin:</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>{recognizedText}</p>
                    </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Veri Kaynağı</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-300 backdrop-blur-sm font-medium ${
                      isDarkMode 
                        ? 'border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-700/50 text-white' 
                        : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 text-slate-800'
                    }`}
                  >
                    <option value="ictihat">🏛️ İçtihat (Yargıtay)</option>
                    <option value="mevzuat">📜 Mevzuat</option>
                    <option value="uyap">⚖️ UYAP Emsal</option>
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
                  </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Arama Sonuçları
                  </h3>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full font-semibold">
                    {searchResults.length} Sonuç
                </div>
            </div>
                
                <div className="grid gap-6">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className={`group backdrop-blur-sm border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                        isDarkMode 
                          ? 'bg-gray-700/60 border-gray-600 hover:border-cyan-400 hover:shadow-cyan-500/25' 
                          : 'bg-white/60 border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedResult(result);
                        setShowResultDetail(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-2 transition-colors ${
                            isDarkMode 
                              ? 'text-white group-hover:text-cyan-400' 
                              : 'text-slate-800 group-hover:text-blue-700'
                          }`}>
                            {result.subject}
                          </h4>
                          <div className={`flex items-center space-x-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-slate-600'
                          }`}>
                            <div className="flex items-center space-x-1">
                              <Scale className={`w-4 h-4 ${
                                isDarkMode ? 'text-cyan-500' : 'text-blue-500'
                              }`} />
                              <span className="font-medium">{result.courtName}</span>
          </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className={`w-4 h-4 ${
                                isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                              }`} />
                              <span>{result.decisionDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className={`w-4 h-4 ${
                                isDarkMode ? 'text-purple-400' : 'text-purple-500'
                              }`} />
                              <span>{result.caseNumber}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          %{Math.round(result.relevanceScore * 100)}
                        </div>
      </div>

                      <p className={`leading-relaxed mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>
                        {result.content.length > 800 ? result.content.substring(0, 800) + '...' : result.content}
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
              }`}>Hukuki Zaman Çizelgesi</h2>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Türk hukukundaki önemli gelişmeleri kronolojik sırayla takip edin</p>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className={`absolute left-8 top-0 bottom-0 w-0.5 rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500' 
                  : 'bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500'
              }`}></div>
              
              <div className="space-y-8">
                {timelineData.map((item, index) => (
                  <div key={index} className="relative flex items-start space-x-6">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                      item.importance === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                      item.importance === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                      'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}>
                      {item.type === 'law' ? <BookOpen className="w-8 h-8 text-white" /> :
                       item.type === 'court' ? <Gavel className="w-8 h-8 text-white" /> :
                       item.type === 'legislation' ? <FileText className="w-8 h-8 text-white" /> :
                       <Scale className="w-8 h-8 text-white" />}
                    </div>
                    
                    {/* Content Card */}
                    <div className={`flex-1 backdrop-blur-sm border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'bg-gray-700/60 border-gray-600 hover:border-cyan-400 hover:shadow-cyan-500/25' 
                        : 'bg-white/60 border-slate-200 hover:border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>{item.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}>{item.date}</span>
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            item.importance === 'high' ? 'bg-red-100 text-red-800' :
                            item.importance === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.importance === 'high' ? 'Yüksek Önem' :
                             item.importance === 'medium' ? 'Orta Önem' : 'Düşük Önem'}
                          </span>
          </div>
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
                          <span className="text-sm">Hukuki Gelişme</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              }`}>Analitik Dashboard</h2>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Sistem kullanım istatistikleri ve performans metrikleri</p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">Toplam Arama</p>
                    <p className="text-3xl font-bold">{searchHistory.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm text-blue-100">Bu ay</span>
                </div>
          </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-sm font-medium">Başarılı Sonuç</p>
                    <p className="text-3xl font-bold">
                      {searchHistory.reduce((sum, item) => sum + item.results, 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm text-emerald-100">Toplam bulunan</span>
                </div>
          </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">Aktif Kullanıcı</p>
                    <p className="text-3xl font-bold">1</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm text-purple-100">Şu anda</span>
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
              }`}>AI Duygu Analizi</h2>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Metinlerin duygusal içeriğini analiz edin ve sentiment tespiti yapın</p>
            </div>
            
            <div className="mb-8">
              <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
                isDarkMode 
                  ? 'bg-gray-700/60 border-gray-600' 
                  : 'bg-white/60 border-slate-200'
              }`}>
                <label className={`block text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-slate-700'
                }`}>Analiz Edilecek Metin</label>
                <textarea
                  value={emotionText}
                  onChange={(e) => setEmotionText(e.target.value)}
                  placeholder="Analiz edilecek metni buraya girin... (örn: mahkeme kararı, dilekçe, sözleşme metni)"
                  className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-offset-2 transition-all duration-300 backdrop-blur-sm font-medium h-32 resize-none ${
                    isDarkMode 
                      ? 'bg-gray-600/50 border-gray-500 text-white placeholder-gray-400 focus:ring-rose-500/20 focus:border-rose-500' 
                      : 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-rose-500/20 focus:border-rose-500'
                  }`}
                />
                  <button
                  onClick={analyzeEmotion}
                  disabled={isAnalyzingEmotion || !emotionText.trim()}
                  className="mt-6 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isAnalyzingEmotion ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analiz Ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Duygu Analizi Yap</span>
                    </>
                  )}
                </button>
                      </div>
                        </div>

            {emotionResults && (
              <div className="space-y-8">
                {/* Sentiment Overview */}
                <div className={`rounded-2xl p-6 border ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-gray-500' 
                    : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>Genel Sentiment</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        emotionResults.sentiment === 'positive' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                        emotionResults.sentiment === 'negative' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        'bg-gradient-to-r from-slate-500 to-gray-500'
                      }`}>
                        {emotionResults.sentiment === 'positive' ? <Heart className="w-8 h-8 text-white" /> :
                         emotionResults.sentiment === 'negative' ? <AlertCircle className="w-8 h-8 text-white" /> :
                         <Target className="w-8 h-8 text-white" />}
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          {emotionResults.sentiment === 'positive' ? 'Pozitif' :
                           emotionResults.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                        </h4>
                        <p className={`${
                          isDarkMode ? 'text-gray-300' : 'text-slate-600'
                        }`}>Genel duygusal ton</p>
                    </div>
            </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>%{Math.round(emotionResults.confidence * 100)}</p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>Güven Skoru</p>
                    </div>
                  </div>
                </div>

                {/* Emotion Distribution */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  isDarkMode 
                    ? 'bg-gray-700/60 border-gray-600' 
                    : 'bg-white/60 border-slate-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>Duygu Dağılımı</h3>
                  <div className="space-y-4">
                    {emotionResults.emotions.map((emotion, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`w-24 text-sm font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-slate-700'
                        }`}>{emotion.emotion}</div>
                        <div className={`flex-1 rounded-full h-3 overflow-hidden ${
                          isDarkMode ? 'bg-gray-600' : 'bg-slate-200'
                        }`}>
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${emotion.score * 100}%` }}
                          ></div>
                    </div>
                        <div className="w-16 text-right">
                          <span className={`text-sm font-bold ${
                            isDarkMode ? 'text-white' : 'text-slate-800'
                          }`}>%{Math.round(emotion.score * 100)}</span>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
            </div>
            )}
          </div>
        )}

        {/* Voice Commands Tab */}
        {activeTab === 'voice' && (
          <div className={`backdrop-blur-sm rounded-2xl shadow-2xl border p-8 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Akıllı Sesli Komutlar</h2>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>Sesli komutlarla sistemi kontrol edin ve hızlı arama yapın</p>
            </div>
            
            {/* Voice Control */}
            <div className={`backdrop-blur-sm rounded-2xl p-8 border mb-8 ${
              isDarkMode 
                ? 'bg-gray-700/60 border-gray-600' 
                : 'bg-white/60 border-slate-200'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg ${
                  isVoiceListening 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}>
                  {isVoiceListening ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {isVoiceListening ? 'Dinleniyor...' : 'Sesli Komut Hazır'}
                </h3>
                <p className={`mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  {isVoiceListening ? 'Komutunuzu söyleyin' : 'Başlat butonuna basarak sesli komutları kullanabilirsiniz'}
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                    onClick={isVoiceListening ? stopVoiceCommand : startVoiceCommand}
                    className={`px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                      isVoiceListening
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isVoiceListening ? 'Durdur' : 'Başlat'}</span>
              </button>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    voiceStatus === 'listening' ? 'bg-emerald-100 text-emerald-800' :
                    voiceStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                    voiceStatus === 'success' ? 'bg-blue-100 text-blue-800' :
                    voiceStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {voiceStatus === 'listening' ? '🎤 Dinleniyor' :
                     voiceStatus === 'processing' ? '⚙️ İşleniyor' :
                     voiceStatus === 'success' ? '✅ Başarılı' :
                     voiceStatus === 'error' ? '❌ Hata' : '🔘 Hazır'}
            </div>
        </div>

                {recognizedText && (
                  <div className={`rounded-xl p-4 border ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                    }`}>Tanınan Metin:</p>
                    <p className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{recognizedText}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commands and History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Commands */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
                isDarkMode 
                  ? 'bg-gray-700/60 border-gray-600' 
                  : 'bg-white/60 border-slate-200'
              }`}>
                <h3 className={`text-xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Mevcut Komutlar</h3>
                <div className="space-y-3">
                  {voiceCommands.map((cmd, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-600/50 border-gray-500' 
                        : 'bg-white/50 border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>{cmd.command}</span>
                      </div>
                      <button
                        onClick={() => processVoiceCommand(cmd.command)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                      >
                        Test Et
                </button>
              </div>
                  ))}
            </div>
          </div>

              {/* Command History */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
                isDarkMode 
                  ? 'bg-gray-700/60 border-gray-600' 
                  : 'bg-white/60 border-slate-200'
              }`}>
                <h3 className={`text-xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Komut Geçmişi</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {voiceCommandHistory.length === 0 ? (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      <Mic className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-500' : 'text-slate-300'
                      }`} />
                      <p>Henüz komut geçmişi yok</p>
                      <p className="text-sm">Sesli komutları kullanmaya başlayın</p>
              </div>
            ) : (
                    voiceCommandHistory.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-gray-600/50 border-gray-500' 
                          : 'bg-white/50 border-slate-200'
                      }`}>
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-slate-800'
                          }`}>{item.command}</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-slate-600'
                          }`}>{item.time}</p>
                          {item.result && (
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-500' : 'text-slate-500'
                            }`}>{item.result}</p>
                          )}
                    </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'success' ? '✅' : '❌'}
                      </div>
                    </div>
                    ))
                  )}
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Detail Modal */}
        {showResultDetail && selectedResult && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`backdrop-blur-sm rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${
              isDarkMode 
                ? 'bg-gray-800/95 border-gray-700/50' 
                : 'bg-white/95 border-white/20'
            }`}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{selectedResult.subject}</h3>
                    <div className={`flex items-center space-x-4 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <Scale className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{selectedResult.courtName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>{selectedResult.decisionDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span>{selectedResult.caseNumber}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResultDetail(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Relevans Skoru */}
                  <div className={`rounded-xl p-4 border ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30' 
                      : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>Relevans Skoru</h4>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-slate-600'
                        }`}>Arama terimiyle uyumluluk</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-600">%{Math.round(selectedResult.relevanceScore * 100)}</p>
                        <div className={`w-24 rounded-full h-2 mt-2 ${
                          isDarkMode ? 'bg-gray-600' : 'bg-slate-200'
                        }`}>
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            style={{ width: `${selectedResult.relevanceScore * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* İçerik */}
                  <div className={`backdrop-blur-sm rounded-xl p-6 border ${
                    isDarkMode 
                      ? 'bg-gray-700/60 border-gray-600' 
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>İçerik</h4>
                    <p className={`leading-relaxed text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>{selectedResult.content}</p>
                  </div>
                  
                  {/* Hukuki Alanlar */}
                  <div className={`backdrop-blur-sm rounded-xl p-6 border ${
                    isDarkMode 
                      ? 'bg-gray-700/60 border-gray-600' 
                      : 'bg-white/60 border-slate-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>Hukuki Alanlar</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedResult.legalAreas.map((area, index) => (
                        <span
                          key={index}
                          className={`px-4 py-2 text-sm rounded-full font-medium border ${
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
                  
                  {/* Aksiyon Butonları */}
                  <div className={`flex space-x-4 pt-6 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-slate-200'
                  }`}>
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Download className="w-5 h-5" />
                      <span>PDF Olarak İndir</span>
                    </button>
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-xl hover:from-slate-700 hover:to-gray-700 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Copy className="w-5 h-5" />
                      <span>Panoya Kopyala</span>
                    </button>
                  </div>
                </div>
          </div>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
