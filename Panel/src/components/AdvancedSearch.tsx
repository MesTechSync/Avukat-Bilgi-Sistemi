import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, FileUp, X, Download, Copy, CheckCircle, AlertCircle, Clock, Brain, FileText, Users, Target, BarChart3, Heart, Calendar, TrendingUp, Zap, Shield, Globe, BookOpen, Scale, Gavel } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat, searchYargitayReal, searchMevzuatReal, searchUyapEmsal, type IctihatFilters, type MevzuatFilters } from '../lib/yargiApi';

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
  // 🔍 Ana Arama State'leri
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'ictihat' | 'mevzuat' | 'uyap'>('ictihat');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'ok' | 'degraded' | 'down'>('unknown');
  
  // 📁 Dosya Yükleme State'leri
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  // 📋 Sonuç Detay State'leri
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showResultDetail, setShowResultDetail] = useState(false);
  
  // 🚀 Gelişmiş Özellikler
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favoriteCourts, setFavoriteCourts] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{query: string, type: string, date: string, results: number}>>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<{trend: string, count: number}[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showAiSummary, setShowAiSummary] = useState(false);

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
  const [selectedTimelinePeriod, setSelectedTimelinePeriod] = useState('all');
  
  // 🧠 AI Duygu Analizi State'leri
  const [emotionText, setEmotionText] = useState('');
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [emotionResults, setEmotionResults] = useState<{
    emotions: Array<{emotion: string, score: number}>;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  } | null>(null);
  
  // 🎤 Akıllı Sesli Komutlar State'leri
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceCommandHistory, setVoiceCommandHistory] = useState<Array<{
    command: string;
    time: string;
    status: 'success' | 'error';
    result?: string;
  }>>([]);
  const [currentVoiceCommand, setCurrentVoiceCommand] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');

  const { isListening, startDictation, stopDictation, interimText, error: dictationError } = useDictation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      let results: SearchResult[] = [];
      
      if (searchType === 'ictihat') {
        const ictihatResults = await searchIctihat(query, {
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
        const mevzuatResults = await searchMevzuat(query, {
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
          keywords: [query],
          highlight: result.highlight || ''
        }));
      }
      
      setSearchResults(results);
      
      // Arama geçmişine ekle
      setSearchHistory(prev => [{
        query,
        type: searchType,
        date: new Date().toISOString(),
        results: results.length
      }, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sesli komut işleme
  const processVoiceCommand = (text: string) => {
    const normalizedText = text.toLowerCase().trim();
    
    for (const cmd of voiceCommands) {
      if (normalizedText.includes(cmd.command.toLowerCase())) {
        if (cmd.action === 'search') {
          setQuery(cmd.params.query);
          setSearchType(cmd.params.type as any);
          handleSearch();
        } else if (cmd.action === 'navigate') {
          setActiveTab(cmd.params.tab as any);
        }
        
        setVoiceCommandHistory(prev => [{
          command: cmd.command,
          time: new Date().toLocaleTimeString(),
          status: 'success',
          result: `${cmd.action} işlemi gerçekleştirildi`
        }, ...prev.slice(0, 9)]);
        
        return;
      }
    }
    
    setVoiceCommandHistory(prev => [{
      command: text,
      time: new Date().toLocaleTimeString(),
      status: 'error',
      result: 'Komut tanınmadı'
    }, ...prev.slice(0, 9)]);
  };

  // Sesli komut başlatma
  const startVoiceCommand = () => {
    setIsVoiceListening(true);
    setVoiceStatus('listening');
    startDictation();
  };

  // Sesli komut durdurma
  const stopVoiceCommand = () => {
    setIsVoiceListening(false);
    setVoiceStatus('processing');
    stopDictation();
    
    if (interimText) {
      setRecognizedText(interimText);
      processVoiceCommand(interimText);
      setVoiceStatus('success');
    } else {
      setVoiceStatus('error');
      setVoiceError('Ses algılanamadı');
    }
  };

  // Duygu analizi
  const analyzeEmotion = async () => {
    if (!emotionText.trim()) return;
    
    setIsAnalyzingEmotion(true);
    try {
      // Simüle edilmiş duygu analizi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        confidence
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                İçtihat & Mevzuat
              </h1>
              <p className="text-gray-600 mt-2">
                Gerçek Yargıtay, UYAP Emsal ve Mevzuat verilerine erişim
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                backendStatus === 'ok' ? 'bg-green-500' : 
                backendStatus === 'degraded' ? 'bg-yellow-500' : 
                backendStatus === 'down' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {backendStatus === 'ok' ? 'Sistem Aktif' : 
                 backendStatus === 'degraded' ? 'Kısmi Hizmet' : 
                 backendStatus === 'down' ? 'Sistem Kapalı' : 'Durum Bilinmiyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'search', label: '🔍 Akıllı Arama', icon: Search },
              { id: 'timeline', label: '📅 Hukuki Zaman Çizelgesi', icon: Calendar },
              { id: 'analytics', label: '📊 Analitik', icon: BarChart3 },
              { id: 'emotion', label: '🧠 AI Duygu Analizi', icon: Brain },
              { id: 'voice', label: '🎤 Sesli Komutlar', icon: Mic }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* Search Form */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Arama terimi girin..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !query.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{isLoading ? 'Aranıyor...' : 'Ara'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ictihat">İçtihat</option>
                  <option value="mevzuat">Mevzuat</option>
                  <option value="uyap">UYAP Emsal</option>
                </select>

                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Mahkemeler</option>
                  <option value="yargitay">Yargıtay</option>
                  <option value="danistay">Danıştay</option>
                  <option value="uyap">UYAP Emsal</option>
                </select>

                <input
                  type="date"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Arama Sonuçları ({searchResults.length})
                </h3>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedResult(result);
                      setShowResultDetail(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{result.subject}</h4>
                      <span className="text-sm text-gray-500">{result.decisionDate}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{result.courtName}</p>
                    <p className="text-gray-700 text-sm">{result.content.substring(0, 200)}...</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.legalAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Hukuki Zaman Çizelgesi</h3>
            <div className="space-y-4">
              {timelineData.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item.importance === 'high' ? 'bg-red-500' :
                    item.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      item.type === 'law' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'court' ? 'bg-green-100 text-green-800' :
                      item.type === 'legislation' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.type === 'law' ? 'Kanun' :
                       item.type === 'court' ? 'Mahkeme' :
                       item.type === 'legislation' ? 'Mevzuat' : 'İçtihat'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analitik</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Toplam Arama</h4>
                <p className="text-2xl font-bold text-blue-600">{searchHistory.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Başarılı Sonuç</h4>
                <p className="text-2xl font-bold text-green-600">
                  {searchHistory.reduce((sum, item) => sum + item.results, 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Aktif Kullanıcı</h4>
                <p className="text-2xl font-bold text-purple-600">1</p>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Analysis Tab */}
        {activeTab === 'emotion' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Duygu Analizi</h3>
            <div className="mb-4">
              <textarea
                value={emotionText}
                onChange={(e) => setEmotionText(e.target.value)}
                placeholder="Analiz edilecek metni girin..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              />
              <button
                onClick={analyzeEmotion}
                disabled={isAnalyzingEmotion || !emotionText.trim()}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>{isAnalyzingEmotion ? 'Analiz Ediliyor...' : 'Analiz Et'}</span>
              </button>
            </div>

            {emotionResults && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Genel Sentiment</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      emotionResults.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      emotionResults.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emotionResults.sentiment === 'positive' ? 'Pozitif' :
                       emotionResults.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                    </span>
                    <span className="text-sm text-gray-600">
                      Güven: %{Math.round(emotionResults.confidence * 100)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Duygu Dağılımı</h4>
                  <div className="space-y-2">
                    {emotionResults.emotions.map((emotion, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="w-20 text-sm text-gray-600">{emotion.emotion}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${emotion.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-sm text-gray-600">%{Math.round(emotion.score * 100)}</span>
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Akıllı Sesli Komutlar</h3>
            
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={isVoiceListening ? stopVoiceCommand : startVoiceCommand}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                    isVoiceListening
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isVoiceListening ? 'Durdur' : 'Başlat'}</span>
                </button>
                
                <div className={`px-3 py-1 rounded-full text-sm ${
                  voiceStatus === 'listening' ? 'bg-green-100 text-green-800' :
                  voiceStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  voiceStatus === 'success' ? 'bg-blue-100 text-blue-800' :
                  voiceStatus === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {voiceStatus === 'listening' ? 'Dinleniyor...' :
                   voiceStatus === 'processing' ? 'İşleniyor...' :
                   voiceStatus === 'success' ? 'Başarılı' :
                   voiceStatus === 'error' ? 'Hata' : 'Hazır'}
                </div>
              </div>

              {recognizedText && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Tanınan Metin:</p>
                  <p className="font-medium">{recognizedText}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Mevcut Komutlar</h4>
                <div className="space-y-2">
                  {voiceCommands.map((cmd, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{cmd.command}</span>
                      <button
                        onClick={() => processVoiceCommand(cmd.command)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
                      >
                        Test Et
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Komut Geçmişi</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {voiceCommandHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.command}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'success' ? 'Başarılı' : 'Hata'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Detail Modal */}
        {showResultDetail && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedResult.subject}</h3>
                  <button
                    onClick={() => setShowResultDetail(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mahkeme</p>
                      <p className="font-medium">{selectedResult.courtName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Karar Tarihi</p>
                      <p className="font-medium">{selectedResult.decisionDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Karar Numarası</p>
                      <p className="font-medium">{selectedResult.caseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Relevans Skoru</p>
                      <p className="font-medium">%{Math.round(selectedResult.relevanceScore * 100)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">İçerik</p>
                    <p className="text-gray-700 leading-relaxed">{selectedResult.content}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Hukuki Alanlar</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.legalAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>İndir</span>
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                      <Copy className="w-4 h-4" />
                      <span>Kopyala</span>
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
