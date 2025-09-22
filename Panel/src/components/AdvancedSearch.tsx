import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, FileUp, X, Download, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat } from '../lib/yargiApi';

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

  const { isListening, startListening, stopListening, transcript, error: dictationError } = useDictation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockResults: SearchResult[] = [];

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
          method: 'GET',
          timeout: 5000 
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
          searchResults = await searchIctihat(query);
          console.log('✅ İçtihat API başarılı:', searchResults.length, 'sonuç');
        } catch (apiError) {
          console.log('⚠️ İçtihat API hatası, mock data kullanılıyor:', apiError);
          
          // Mock data ile devam et
          searchResults = mockResults.filter(result => 
            result.subject.toLowerCase().includes(query.toLowerCase()) ||
            result.content.toLowerCase().includes(query.toLowerCase()) ||
            result.caseNumber.toLowerCase().includes(query.toLowerCase())
          );
        }
      } else {
        try {
          searchResults = await searchMevzuat(query);
          console.log('✅ Mevzuat API başarılı:', searchResults.length, 'sonuç');
        } catch (apiError) {
          console.log('⚠️ Mevzuat API hatası, mock data kullanılıyor:', apiError);
          searchResults = [];
        }
      }

      setSearchResults(searchResults);
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

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl p-3 md:p-6 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Arama terimi girin..."
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
              />
            </div>
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
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
      </div>
    </div>
  );
};

export default AdvancedSearch;
