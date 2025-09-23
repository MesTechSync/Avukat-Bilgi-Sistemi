import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, FileUp, X, Download, Copy, CheckCircle, AlertCircle, Clock, Brain, FileText, Users, Target, BarChart3, Heart } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat, type IctihatFilters, type MevzuatFilters } from '../lib/yargiApi';

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
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'ictihat' | 'mevzuat'>('ictihat');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'ok' | 'degraded' | 'down'>('unknown');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
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
  
  // AI Duygu Analizi State'leri
  const [emotionText, setEmotionText] = useState('');
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [emotionResults, setEmotionResults] = useState<any>(null);
  
  // Sesli Komutlar State'leri
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceCommandHistory, setVoiceCommandHistory] = useState<Array<{command: string, time: string, status: string}>>([]);
  const [currentVoiceCommand, setCurrentVoiceCommand] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceCommands, setVoiceCommands] = useState([
    { command: 'velayet ara', action: 'search', params: { query: 'velayet', type: 'ictihat' } },
    { command: 'iş hukuku', action: 'search', params: { query: 'iş hukuku', type: 'ictihat' } },
    { command: 'boşanma kararları', action: 'search', params: { query: 'boşanma', type: 'ictihat' } },
    { command: 'analitik aç', action: 'navigate', params: { tab: 'analytics' } },
    { command: 'duygu analizi', action: 'navigate', params: { tab: 'emotion' } },
    { command: 'zaman çizelgesi', action: 'navigate', params: { tab: 'timeline' } },
    { command: 'arama sayfası', action: 'navigate', params: { tab: 'search' } }
  ]);

  const { isListening, startDictation, stopDictation, interimText, error: dictationError } = useDictation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    return suggestions.slice(0, 8);
  };

  // Arama geçmişini kaydet
  const saveSearchHistory = (searchQuery: string, searchType: string, resultCount: number) => {
    const newEntry = {
      query: searchQuery,
      type: searchType,
      date: new Date().toLocaleDateString('tr-TR'),
      results: resultCount
    };
    
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 9)];
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Trend analizi
  const analyzeTrends = (results: SearchResult[]) => {
    const trends: {[key: string]: number} = {};
    
    results.forEach(result => {
      result.legalAreas.forEach(area => {
        trends[area] = (trends[area] || 0) + 1;
      });
    });
    
    const trendArray = Object.entries(trends)
      .map(([trend, count]) => ({ trend, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setTrendAnalysis(trendArray);
  };

  // AI özetleme
  const generateAiSummary = async (results: SearchResult[]) => {
    if (results.length === 0) return;
    
    try {
      // Simüle edilmiş AI özeti
      const summary = `
        📊 **Arama Sonuçları Analizi**
        
        **Ana Konular:** ${results[0]?.legalAreas.join(', ') || 'Genel'}
        **Toplam Sonuç:** ${results.length} karar/mevzuat
        
        **Mahkeme Dağılımı:**
        ${Object.entries(results.reduce((acc, r) => {
          acc[r.courtName] = (acc[r.courtName] || 0) + 1;
          return acc;
        }, {} as {[key: string]: number}))
        .map(([court, count]) => `- ${court}: ${count} karar`).join('\n')}
        
        **Önemli Hükümler:**
        - Son kararlar güncel hukuki yaklaşımları yansıtıyor
        - Mahkeme tutumları tutarlı görünüyor
        - Pratik uygulamalar için rehber niteliğinde
        
        **Pratik Öneriler:**
        - Benzer davalarda bu kararları referans alabilirsiniz
        - Güncel mevzuat değişikliklerini takip edin
        - Mahkeme içtihatlarını dikkate alın
      `;
      
      setAiSummary(summary);
    } catch (error) {
      console.error('AI özetleme hatası:', error);
    }
  };

  const mockResults: SearchResult[] = [
    // İçtihat Verileri
    {
      id: 'ictihat-001',
      caseNumber: '2024/1234',
      courtName: 'Yargıtay 2. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-01-15',
      subject: 'İş Sözleşmesi Feshi ve Tazminat',
      content: 'İşverenin haklı nedenle fesih hakkının kullanılması durumunda, işçinin kıdem tazminatına hak kazanamayacağına dair karar.',
      relevanceScore: 95,
      legalAreas: ['İş Hukuku'],
      keywords: ['iş sözleşmesi', 'fesih', 'tazminat', 'haklı neden'],
      highlight: 'İşverenin haklı nedenle fesih hakkının kullanılması durumunda, işçinin kıdem tazminatına hak kazanamayacağı'
    },
    {
      id: 'ictihat-002',
      caseNumber: '2024/5678',
      courtName: 'Yargıtay 3. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-02-20',
      subject: 'Ticari İşlerde Faiz Hesaplaması',
      content: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanmasına dair usul ve esaslar.',
      relevanceScore: 88,
      legalAreas: ['Ticaret Hukuku'],
      keywords: ['ticari iş', 'faiz', 'hesaplama', 'oran'],
      highlight: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanmasına dair usul ve esaslar'
    },
    {
      id: 'ictihat-003',
      caseNumber: '2024/9012',
      courtName: 'Danıştay 6. Daire',
      courtType: 'danistay',
      decisionDate: '2024-03-10',
      subject: 'İdari İşlemlerde Yetki',
      content: 'İdari makamların yetki sınırları ve işlemlerin hukuka uygunluğunun denetimi.',
      relevanceScore: 92,
      legalAreas: ['İdare Hukuku'],
      keywords: ['idari işlem', 'yetki', 'denetim', 'hukuka uygunluk'],
      highlight: 'İdari makamların yetki sınırları ve işlemlerin hukuka uygunluğunun denetimi'
    },
    {
      id: 'ictihat-004',
      caseNumber: '2024/3456',
      courtName: 'Yargıtay 1. Ceza Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-04-05',
      subject: 'Ceza Hukukunda Kusur',
      content: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi kriterleri.',
      relevanceScore: 90,
      legalAreas: ['Ceza Hukuku'],
      keywords: ['kusur', 'sorumluluk', 'ceza hukuku', 'kriter'],
      highlight: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi kriterleri'
    },
    {
      id: 'ictihat-005',
      caseNumber: '2024/7890',
      courtName: 'Yargıtay 4. Hukuk Dairesi',
      courtType: 'yargitay',
      decisionDate: '2024-05-12',
      subject: 'Aile Hukukunda Velayet',
      content: 'Boşanma sonrası çocukların velayetinin belirlenmesi ve velayet değişikliği şartları.',
      relevanceScore: 87,
      legalAreas: ['Aile Hukuku'],
      keywords: ['velayet', 'boşanma', 'çocuk', 'velayet değişikliği'],
      highlight: 'Boşanma sonrası çocukların velayetinin belirlenmesi ve velayet değişikliği şartları'
    },
    // Mevzuat Verileri
    {
      id: 'mevzuat-001',
      caseNumber: 'TMK-609',
      courtName: 'Türk Medeni Kanunu',
      courtType: 'mevzuat',
      decisionDate: '2001-11-22',
      subject: 'Sözleşme Hukuku Genel Hükümler',
      content: 'Sözleşmelerin kurulması, geçerliliği ve ifasına dair genel hükümler.',
      relevanceScore: 98,
      legalAreas: ['Medeni Hukuk', 'Borçlar Hukuku'],
      keywords: ['sözleşme', 'kurulma', 'geçerlilik', 'ifa'],
      highlight: 'Sözleşmelerin kurulması, geçerliliği ve ifasına dair genel hükümler'
    },
    {
      id: 'mevzuat-002',
      caseNumber: 'İK-17',
      courtName: 'İş Kanunu',
      courtType: 'mevzuat',
      decisionDate: '2003-06-10',
      subject: 'İş Sözleşmesi Türleri',
      content: 'Belirsiz süreli, belirli süreli ve deneme süreli iş sözleşmelerinin özellikleri.',
      relevanceScore: 94,
      legalAreas: ['İş Hukuku'],
      keywords: ['iş sözleşmesi', 'belirsiz süreli', 'belirli süreli', 'deneme süreli'],
      highlight: 'Belirsiz süreli, belirli süreli ve deneme süreli iş sözleşmelerinin özellikleri'
    },
    {
      id: 'mevzuat-003',
      caseNumber: 'TCK-26',
      courtName: 'Türk Ceza Kanunu',
      courtType: 'mevzuat',
      decisionDate: '2004-09-26',
      subject: 'Ceza Hukukunda Kusur',
      content: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi esasları.',
      relevanceScore: 96,
      legalAreas: ['Ceza Hukuku'],
      keywords: ['kusur', 'sorumluluk', 'ceza hukuku', 'esaslar'],
      highlight: 'Ceza hukukunda kusur unsuru ve sorumluluğun belirlenmesi esasları'
    },
    {
      id: 'mevzuat-004',
      caseNumber: 'TTK-125',
      courtName: 'Türk Ticaret Kanunu',
      courtType: 'mevzuat',
      decisionDate: '2011-01-14',
      subject: 'Ticari İşlerde Faiz',
      content: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanması kuralları.',
      relevanceScore: 91,
      legalAreas: ['Ticaret Hukuku'],
      keywords: ['ticari iş', 'faiz', 'oran', 'hesaplama'],
      highlight: 'Ticari işlerde faiz oranının belirlenmesi ve hesaplanması kuralları'
    },
    {
      id: 'mevzuat-005',
      caseNumber: 'İİK-68',
      courtName: 'İcra ve İflas Kanunu',
      courtType: 'mevzuat',
      decisionDate: '2004-06-09',
      subject: 'İcra Takibi Usulleri',
      content: 'İcra takibinin başlatılması, yürütülmesi ve sonuçlandırılması usulleri.',
      relevanceScore: 89,
      legalAreas: ['İcra İflas Hukuku'],
      keywords: ['icra takibi', 'usul', 'başlatma', 'yürütme'],
      highlight: 'İcra takibinin başlatılması, yürütülmesi ve sonuçlandırılması usulleri'
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

  const legalAreas = [
    'İş Hukuku', 'Ticaret Hukuku', 'Medeni Hukuk', 'Ceza Hukuku',
    'İdare Hukuku', 'Vergi Hukuku', 'Aile Hukuku', 'Miras Hukuku',
    'Borçlar Hukuku', 'Eşya Hukuku', 'İcra İflas Hukuku'
  ];

  const dateRanges = [
    { value: '', label: 'Tümü' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' }
  ];

  // Backend health check
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET'
        });
        if (response.ok) {
          setBackendStatus('ok');
        } else {
          setBackendStatus('degraded');
        }
      } catch (error) {
        setBackendStatus('down');
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // File processing
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reject(new Error('Desteklenmeyen dosya formatı'));
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const content = await extractTextFromFile(file);
      setUploadedFileName(file.name);
      setUploadedFileContent(content);
      setQuery(content.substring(0, 200));
    } catch (error) {
      console.error('Dosya işleme hatası:', error);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName(null);
    setUploadedFileContent(null);
    setQuery('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      let searchResults: SearchResult[] = [];
      
      if (searchType === 'ictihat') {
        try {
          // Sistemin kendi İçtihat API'sini kullan
          const ictihatFilters: IctihatFilters = {
            courtType: selectedCourt as any || 'yargitay',
            dateRange: dateRange ? {
              from: `${dateRange}-01-01`,
              to: `${dateRange}-12-31`
            } : undefined,
            legalArea: selectedArea || undefined
          };

          const ictihatResults = await searchIctihat(query, ictihatFilters);
          
          // İçtihat sonuçlarını SearchResult formatına çevir
          searchResults = ictihatResults.map(result => ({
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
          
          console.log('✅ Sistem İçtihat API başarılı:', searchResults.length, 'sonuç');
        } catch (apiError) {
          console.log('⚠️ Sistem İçtihat API hatası:', apiError);
          
          // API hatası durumunda boş sonuç döndür
          searchResults = [];
        }
      } else {
        try {
          // Sistemin kendi Mevzuat API'sini kullan
        const mevzuatFilters: MevzuatFilters = {
            category: selectedArea || undefined,
            institution: selectedCourt || undefined,
            dateRange: dateRange ? {
              from: `${dateRange}-01-01`,
              to: `${dateRange}-12-31`
            } : undefined,
          page: 1,
          per_page: 20
        };

        const mevzuatResults = await searchMevzuat(query, mevzuatFilters);
        
          // Mevzuat sonuçlarını SearchResult formatına çevir
          searchResults = mevzuatResults.map(result => ({
            id: result.id,
            caseNumber: result.title || '',
            courtName: result.institution || '',
          courtType: 'mevzuat',
            decisionDate: result.publishDate || '',
            subject: result.title || '',
            content: result.content || '',
            relevanceScore: result.relevanceScore || 0,
            legalAreas: result.category ? [result.category] : [],
          keywords: [],
            highlight: result.highlight || ''
          }));
          
          console.log('✅ Sistem Mevzuat API başarılı:', searchResults.length, 'sonuç');
        } catch (apiError) {
          console.log('⚠️ Sistem Mevzuat API hatası:', apiError);
          
          // API hatası durumunda boş sonuç döndür
          searchResults = [];
        }
      }

      // 🚀 Gelişmiş Özellikler
      setSearchResults(searchResults);
      
      // Arama geçmişini kaydet
      saveSearchHistory(query, searchType, searchResults.length);
      
      // Trend analizi yap
      analyzeTrends(searchResults);
      
      // AI özetleme başlat
      generateAiSummary(searchResults);
      
      // Önerileri gizle
      setShowSuggestions(false);
      
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResult = (result: SearchResult) => {
    setSelectedResult(result);
    setShowResultDetail(true);
  };

  // 🚀 Gelişmiş Özellikler - Event Handlers
  const handleQueryChange = (value: string) => {
    setQuery(value);
    
    if (value.length >= 2) {
      const suggestions = getSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  // Favori mahkeme yönetimi
  const toggleFavoriteCourt = (court: string) => {
    if (favoriteCourts.includes(court)) {
      setFavoriteCourts(favoriteCourts.filter(c => c !== court));
    } else {
      setFavoriteCourts([...favoriteCourts, court]);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // 🎤 Sesli Komut İşleme
  const processVoiceCommand = (text: string) => {
    const normalizedText = text.toLowerCase().trim();
    setRecognizedText(text);
    setVoiceStatus('processing');

    // Komut eşleştirme
    const matchedCommand = voiceCommands.find(cmd => 
      normalizedText.includes(cmd.command.toLowerCase())
    );

    if (matchedCommand) {
      setCurrentVoiceCommand(matchedCommand.command);
      
      // Komut işleme
      if (matchedCommand.action === 'search') {
        setQuery(matchedCommand.params.query);
        setSearchType(matchedCommand.params.type);
      handleSearch();
        setVoiceStatus('success');
      } else if (matchedCommand.action === 'navigate') {
        setActiveTab(matchedCommand.params.tab);
        setVoiceStatus('success');
      }

      // Geçmişe ekle
      const newCommand = {
        command: matchedCommand.command,
        time: new Date().toLocaleTimeString('tr-TR'),
        status: 'success'
      };
      setVoiceCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]);
    } else {
      setVoiceError('Komut tanınmadı. Desteklenen komutları kontrol edin.');
      setVoiceStatus('error');
      
      const newCommand = {
        command: text,
        time: new Date().toLocaleTimeString('tr-TR'),
        status: 'error'
      };
      setVoiceCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]);
    }

    // 3 saniye sonra durumu sıfırla
    setTimeout(() => {
      setVoiceStatus('idle');
      setVoiceError(null);
      setRecognizedText('');
    }, 3000);
  };

  const startVoiceCommand = () => {
    setVoiceStatus('listening');
    setVoiceError(null);
    setRecognizedText('');
    startDictation();
  };

  const stopVoiceCommand = () => {
    setVoiceStatus('idle');
    stopDictation();
    
    if (interimText.trim()) {
      processVoiceCommand(interimText);
    }
  };

  // LocalStorage'dan verileri yükle
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Arama geçmişi yüklenemedi:', error);
      }
    }
  }, []);

  const closeResultDetail = () => {
    setShowResultDetail(false);
    setSelectedResult(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  };

  const downloadResult = (result: SearchResult) => {
    const content = `${result.subject}\n\n${result.content}\n\nMahkeme: ${result.courtName}\nKarar Tarihi: ${result.decisionDate}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.caseNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg md:rounded-xl shadow-lg">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              İçtihat & Mevzuat
            </h1>
            <div className="flex items-center gap-1 md:gap-2">
              {backendStatus === 'ok' && <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />}
              {backendStatus === 'degraded' && <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />}
              {backendStatus === 'down' && <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />}
              {backendStatus === 'unknown' && <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
              </div>
                      </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg">
            Hukuki araştırma ve içtihat arama sistemi
          </p>
                  </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'search', label: 'Akıllı Arama', icon: Search },
                { id: 'timeline', label: 'Zaman Çizelgesi', icon: Clock },
                { id: 'analytics', label: 'Analitik', icon: BarChart3 },
                { id: 'emotion', label: 'Duygu Analizi', icon: Heart },
                { id: 'voice', label: 'Sesli Komutlar', icon: Mic }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                          <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                          </button>
                );
              })}
                      </div>
                    </div>
                  </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <>
        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl p-3 md:p-6 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => {
                  if (query.length >= 2) {
                    const suggestions = getSearchSuggestions(query);
                    setSearchSuggestions(suggestions);
                    setShowSuggestions(suggestions.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Arama terimi girin... (örn: velayet, iş sözleşmesi, borç)"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
              />
              
              {/* 🚀 Akıllı Arama Önerileri */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                          <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      {suggestion}
                          </button>
                        ))}
                      </div>
              )}
                    </div>
            <div className="flex gap-2 md:gap-4">
                          <button
                onClick={isListening ? stopDictation : startDictation}
                className={`px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                          </button>
              <label className="px-3 md:px-4 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-xl cursor-pointer transition-all">
                <FileUp className="w-4 h-4 md:w-5 md:h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
                          <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg md:rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">{isLoading ? 'Aranıyor...' : 'Ara'}</span>
                          </button>
                      </div>
                    </div>

          {/* File Upload Info */}
          {uploadedFileName && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">{uploadedFileName}</p>
                    {isProcessingFile && <p className="text-sm text-blue-600 dark:text-blue-400">İşleniyor...</p>}
                      </div>
                    </div>
                          <button
                  onClick={clearUploadedFile}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                  </div>
              {uploadedFileContent && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {uploadedFileContent.substring(0, 300)}...
                  </p>
                </div>
              )}
          </div>
        )}

          {/* 🚀 Arama Geçmişi */}
          {searchHistory.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Son Aramalar:</span>
            <button
                  onClick={clearSearchHistory}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
                  Temizle
            </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((search, index) => (
            <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search.query)}
                    className="px-3 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
                  >
                    {search.query}
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({search.results} sonuç)
                    </span>
            </button>
                ))}
          </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arama Türü
            </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'ictihat' | 'mevzuat')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="ictihat">İçtihat</option>
                <option value="mevzuat">Mevzuat</option>
              </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mahkeme
            </label>
            <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tümü</option>
              {courtTypes.map(court => (
                  <option key={court.value} value={court.value}>{court.label}</option>
              ))}
            </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hukuk Alanı
            </label>
            <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tümü</option>
              {legalAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarih Aralığı
            </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
                      </div>
                        </div>
          </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Arama Sonuçları ({searchResults.length})
            </h2>
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleViewResult(result)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {result.subject}
                  </h3>
                      <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                      {result.relevanceScore}%
                    </span>
          </div>
                    </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <p><strong>Mahkeme:</strong> {result.courtName}</p>
                  <p><strong>Karar No:</strong> {result.caseNumber}</p>
                  <p><strong>Tarih:</strong> {result.decisionDate}</p>
                  </div>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                  {result.content.substring(0, 200)}...
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.legalAreas.map(area => (
                    <span key={area} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                      {area}
                    </span>
              ))}
            </div>
            </div>
            ))}
          </div>
        )}

        {/* 🚀 Gelişmiş Analiz Paneli */}
        {searchResults.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Analizi */}
            {trendAnalysis.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  📊 Trend Analizi
                </h3>
                <div className="space-y-3">
                  {trendAnalysis.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{trend.trend}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(trend.count / trendAnalysis[0].count) * 100}%` }}
                          ></div>
      </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                          {trend.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Özet */}
            {aiSummary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    🤖 AI Analizi
                  </h3>
                  <button
                    onClick={() => setShowAiSummary(!showAiSummary)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {showAiSummary ? 'Gizle' : 'Göster'}
                  </button>
                </div>
                {showAiSummary && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                      {aiSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      )}

        {/* Result Detail Modal */}
        {showResultDetail && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
              <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {selectedResult.subject}
                </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Mahkeme:</strong> {selectedResult.courtName}</p>
                      <p><strong>Karar No:</strong> {selectedResult.caseNumber}</p>
                      <p><strong>Tarih:</strong> {selectedResult.decisionDate}</p>
              </div>
              </div>
                  <button
                    onClick={closeResultDetail}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedResult.content}
                  </p>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Hukuk Alanları</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.legalAreas.map(area => (
                      <span key={area} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Anahtar Kelimeler</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.keywords.map(keyword => (
                      <span key={keyword} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                        {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => copyToClipboard(selectedResult.content)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={() => downloadResult(selectedResult)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
          </div>
            </div>
        </div>
      )}
          </>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Hukuki Zaman Çizelgesi
                </h3>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    onChange={() => {
                      // Filtreleme mantığı
                    }}
                  >
                    <option value="all">Tüm Alanlar</option>
                    <option value="medeni">Medeni Hukuk</option>
                    <option value="ceza">Ceza Hukuku</option>
                    <option value="is">İş Hukuku</option>
                    <option value="idare">İdare Hukuku</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Filtrele
                  </button>
                </div>
              </div>

              {/* Timeline Events */}
              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    date: '2024-01-15',
                    title: 'Yeni İş Kanunu Değişiklikleri',
                    type: 'mevzuat',
                    area: 'İş Hukuku',
                    description: 'İş sözleşmelerinde yeni düzenlemeler ve işçi hakları güncellemeleri',
                    impact: 'high',
                    status: 'active'
                  },
                  {
                    id: 2,
                    date: '2024-02-20',
                    title: 'Yargıtay 1. Hukuk Dairesi Kararı',
                    type: 'ictihat',
                    area: 'Medeni Hukuk',
                    description: 'Sözleşme hukukunda kusur sorumluluğu ile ilgili önemli karar',
                    impact: 'medium',
                    status: 'active'
                  },
                  {
                    id: 3,
                    date: '2024-03-10',
                    title: 'Danıştay 6. Daire Kararı',
                    type: 'ictihat',
                    area: 'İdare Hukuku',
                    description: 'İdari işlemlerde yetki sınırları ve denetim kriterleri',
                    impact: 'high',
                    status: 'active'
                  },
                  {
                    id: 4,
                    date: '2024-04-05',
                    title: 'Ceza Hukuku Değişiklikleri',
                    type: 'mevzuat',
                    area: 'Ceza Hukuku',
                    description: 'Ceza hukukunda kusur unsuru ve sorumluluk kriterleri güncellemeleri',
                    impact: 'high',
                    status: 'active'
                  },
                  {
                    id: 5,
                    date: '2024-05-12',
                    title: 'Aile Hukuku Yeni Düzenlemeler',
                    type: 'mevzuat',
                    area: 'Aile Hukuku',
                    description: 'Velayet ve boşanma süreçlerinde yeni düzenlemeler',
                    impact: 'medium',
                    status: 'active'
                  }
                ].map((event) => (
                  <div key={event.id} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.type === 'mevzuat' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.type === 'mevzuat' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {event.type === 'mevzuat' ? 'Mevzuat' : 'İçtihat'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.impact === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {event.impact === 'high' ? 'Yüksek Etki' : 'Orta Etki'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
                        <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Alan: {event.area}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-green-600 dark:text-green-400">Aktif</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {/* Timeline Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Mevzuat</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Değişiklik</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">İçtihat</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">2</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Karar</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-3 h-3 text-purple-500" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Toplam</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Olay</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Arama Analitiği
                </h3>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                    <option value="7">Son 7 Gün</option>
                    <option value="30">Son 30 Gün</option>
                    <option value="90">Son 3 Ay</option>
                    <option value="365">Son 1 Yıl</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Güncelle
                  </button>
            </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Toplam Arama</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">+12% bu ay</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Bulunan Sonuç</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">8,934</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+8% bu ay</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Ortalama Süre</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.3s</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">-15% bu ay</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Başarı Oranı</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">94%</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">+3% bu ay</p>
                </div>
              </div>

              {/* Search Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">En Popüler Arama Terimleri</h4>
                  <div className="space-y-3">
                    {[
                      { term: 'velayet', count: 234, trend: 'up' },
                      { term: 'iş sözleşmesi', count: 189, trend: 'up' },
                      { term: 'boşanma', count: 156, trend: 'down' },
                      { term: 'kira sözleşmesi', count: 143, trend: 'up' },
                      { term: 'tazminat', count: 128, trend: 'stable' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">#{index + 1}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.term}</span>
                    </div>
                      <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            item.trend === 'up' ? 'bg-green-500' : 
                            item.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Hukuk Alanları Dağılımı</h4>
                  <div className="space-y-3">
                    {[
                      { area: 'Medeni Hukuk', percentage: 35, color: 'bg-blue-500' },
                      { area: 'İş Hukuku', percentage: 28, color: 'bg-green-500' },
                      { area: 'Ceza Hukuku', percentage: 20, color: 'bg-red-500' },
                      { area: 'İdare Hukuku', percentage: 12, color: 'bg-purple-500' },
                      { area: 'Diğer', percentage: 5, color: 'bg-gray-500' }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.area}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                  </div>
                </div>
              ))}
                  </div>
                </div>
            </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Performans Metrikleri</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arama Hızı</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">2.3s</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Hızlı</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Doğruluk</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">94%</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Yüksek</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı Memnuniyeti</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">4.8/5</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Mükemmel</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

        {/* AI Duygu Analizi Tab */}
        {activeTab === 'emotion' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  AI Duygu Analizi
                </h3>
              <div className="flex gap-2">
                  <button 
                    onClick={() => setIsAnalyzingEmotion(true)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Analiz Et
                </button>
                </div>
              </div>

              {/* Emotion Analysis Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Analiz Edilecek Metin
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                  value={emotionText}
                  onChange={(e) => setEmotionText(e.target.value)}
                  placeholder="Müvekkil ifadesi, tanık beyanı veya herhangi bir metin girin..."
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{emotionText.length}/1000 karakter</span>
                  <button 
                    onClick={() => {
                      if (emotionText.trim()) {
                        setIsAnalyzingEmotion(true);
                        // Simüle edilmiş analiz
                        setTimeout(() => {
                          setEmotionResults({
                            positive: 65,
                            neutral: 25,
                            negative: 10,
                            confidence: 85,
                            stress: 'Orta',
                            sincerity: 'Yüksek',
                            consistency: 'Yüksek'
                          });
                          setIsAnalyzingEmotion(false);
                        }, 2000);
                      }
                    }}
                    disabled={!emotionText.trim() || isAnalyzingEmotion}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                  >
                    {isAnalyzingEmotion ? 'Analiz Ediliyor...' : 'Analiz Başlat'}
                </button>
              </div>
              </div>

              {/* Emotion Analysis Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Duygu Dağılımı</h4>
                  <div className="space-y-3">
                    {[
                      { emotion: 'Pozitif', percentage: emotionResults?.positive || 0, color: 'bg-green-500' },
                      { emotion: 'Nötr', percentage: emotionResults?.neutral || 0, color: 'bg-gray-500' },
                      { emotion: 'Negatif', percentage: emotionResults?.negative || 0, color: 'bg-red-500' }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.emotion}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
            </div>
          </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Detaylı Analiz</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Güven Seviyesi', value: emotionResults?.confidence ? `${emotionResults.confidence}%` : '0%', color: 'text-green-600' },
                      { label: 'Stres Seviyesi', value: emotionResults?.stress || 'Bilinmiyor', color: 'text-yellow-600' },
                      { label: 'Samimiyet', value: emotionResults?.sincerity || 'Bilinmiyor', color: 'text-green-600' },
                      { label: 'Tutarlılık', value: emotionResults?.consistency || 'Bilinmiyor', color: 'text-green-600' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                        <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-pink-600" />
                  AI İçgörüleri
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Metin genel olarak pozitif bir ton taşıyor. Müvekkil güven verici bir ifade kullanmış.
                </p>
              </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Stres seviyesi orta düzeyde, bu durum normal bir hukuki süreç için beklenebilir.
                    </p>
                    </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tutarlılık yüksek, bu ifadenin güvenilirliğini artırıyor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Analysis */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Örnek Analizler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Müvekkil İfadesi',
                      text: 'Bu durum beni çok üzüyor, adalet istiyorum...',
                      emotion: 'Negatif',
                      confidence: '85%'
                    },
                    {
                      title: 'Tanık Beyanı',
                      text: 'Olayı net bir şekilde hatırlıyorum, kesinlikle...',
                      emotion: 'Pozitif',
                      confidence: '92%'
                    }
                  ].map((sample, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">{sample.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">"{sample.text}"</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sample.emotion === 'Pozitif' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {sample.emotion}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Güven: {sample.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sesli Komutlar Tab */}
        {activeTab === 'voice' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  🎤 Akıllı Sesli Komutlar
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={voiceStatus === 'listening' ? stopVoiceCommand : startVoiceCommand}
                    disabled={voiceStatus === 'processing'}
                    className={`px-6 py-3 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      voiceStatus === 'listening' 
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                        : voiceStatus === 'processing'
                        ? 'bg-yellow-600 text-white cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    {voiceStatus === 'listening' ? 'Durdur' : 
                     voiceStatus === 'processing' ? 'İşleniyor...' : 
                     'Başlat'}
                      </button>
                    </div>
                  </div>

              {/* Voice Commands Status */}
              <div className="mb-8">
                <div className={`p-6 rounded-lg transition-all ${
                  voiceStatus === 'listening' ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' :
                  voiceStatus === 'processing' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' :
                  voiceStatus === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
                  voiceStatus === 'error' ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      voiceStatus === 'listening' ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' :
                      voiceStatus === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 animate-spin' :
                      voiceStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      voiceStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Mic className={`w-8 h-8 ${
                        voiceStatus === 'listening' ? 'text-red-600 dark:text-red-400' :
                        voiceStatus === 'processing' ? 'text-yellow-600 dark:text-yellow-400' :
                        voiceStatus === 'success' ? 'text-green-600 dark:text-green-400' :
                        voiceStatus === 'error' ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                        {voiceStatus === 'listening' ? '🎤 Dinleniyor...' :
                         voiceStatus === 'processing' ? '⚡ İşleniyor...' :
                         voiceStatus === 'success' ? '✅ Başarılı!' :
                         voiceStatus === 'error' ? '❌ Hata!' :
                         '🎯 Hazır'}
                  </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {voiceStatus === 'listening' ? 'Komutunuzu net bir şekilde söyleyin...' :
                         voiceStatus === 'processing' ? 'Komutunuz analiz ediliyor...' :
                         voiceStatus === 'success' ? 'Komut başarıyla işlendi!' :
                         voiceStatus === 'error' ? voiceError || 'Bir hata oluştu' :
                         'Mikrofonu başlatmak için butona tıklayın'}
                      </p>
                      {recognizedText && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Tanınan metin:</strong> "{recognizedText}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Commands List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    🔍 Arama Komutları
                  </h4>
                  <div className="space-y-3">
                    {voiceCommands.filter(cmd => cmd.action === 'search').map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            "{item.command}"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.params.query} araması yapar
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setQuery(item.params.query);
                            setSearchType(item.params.type);
                            handleSearch();
                          }}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs transition-colors"
                        >
                          Test Et
                        </button>
                      </div>
                      ))}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    🧭 Navigasyon Komutları
                  </h4>
                  <div className="space-y-3">
                    {voiceCommands.filter(cmd => cmd.action === 'navigate').map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            "{item.command}"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.params.tab} tab'ına geçer
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveTab(item.params.tab)}
                          className="px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs transition-colors"
                        >
                          Test Et
                        </button>
                      </div>
                      ))}
                    </div>
                  </div>
                </div>

              {/* Voice Commands History */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    📋 Komut Geçmişi
                  </h4>
                  <button 
                    onClick={() => setVoiceCommandHistory([])}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors"
                  >
                    Temizle
                  </button>
          </div>
                <div className="space-y-3">
                  {voiceCommandHistory.length > 0 ? voiceCommandHistory.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      item.status === 'success' 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            "{item.command}"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.time}
                          </p>
            </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {item.status === 'success' ? '✅ Başarılı' : '❌ Hata'}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">Henüz komut geçmişi yok</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        İlk sesli komutunuzu söyleyerek başlayın
                      </p>
        </div>
      )}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  ⚙️ Sesli Komut Ayarları
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🌍 Dil
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500">
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🔊 Ses Hassasiyeti
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="70"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Düşük</span>
                      <span>Yüksek</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="autoStart" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <label htmlFor="autoStart" className="text-sm text-gray-700 dark:text-gray-300">
                      Sayfa açıldığında otomatik başlat
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="soundFeedback" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                    <label htmlFor="soundFeedback" className="text-sm text-gray-700 dark:text-gray-300">
                      Ses geri bildirimi
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="visualFeedback" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                    <label htmlFor="visualFeedback" className="text-sm text-gray-700 dark:text-gray-300">
                      Görsel geri bildirim
                    </label>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 İpuçları</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Komutları net ve yavaş söyleyin</li>
                    <li>• Arka plan gürültüsünü azaltın</li>
                    <li>• Mikrofonu ağzınızdan 15-20 cm uzakta tutun</li>
                    <li>• Desteklenen komutları "Test Et" butonuyla deneyin</li>
                  </ul>
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
