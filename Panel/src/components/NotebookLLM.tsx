import React, { useCallback, useRef, useState, useEffect } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Copy, Download, Wand2, Sparkles, Key, Settings, History, Star, Bookmark, Filter, Search, Calendar, Clock, User, Tag, Image, Layers, Zap } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { fileProcessingService } from '../services/fileProcessingService';

type ApiResult = { ok: boolean; result?: string; error?: string };

interface AnalysisHistory {
  id: string;
  instruction: string;
  textInput: string;
  files: Array<{ name: string; size: number; type: string }>;
  result: string;
  timestamp: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  wordCount: number;
  processingTime: number;
}

const MAX_FILES = 6;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const units = ['KB','MB','GB'];
  let u = -1; let s = n;
  do { s /= 1024; u++; } while (s >= 1024 && u < units.length - 1);
  return `${s.toFixed(1)} ${units[u]}`;
}

export default function NotebookLLM() {
  const [files, setFiles] = useState<File[]>([]);
  const [instruction, setInstruction] = useState('Bu belgeyi hukuki açıdan analiz et ve önemli noktaları özetle.');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>('AIzaSyDeNAudg6oWG3JLwTXYXGhdspVDrDPGAyk');
  const [showSettings, setShowSettings] = useState(false);
  const [useRealAI, setUseRealAI] = useState(true);
  
  // Yeni özellikler için state'ler
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const [ocrEnabled, setOcrEnabled] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<Array<{file: string, result: string, status: 'success' | 'error'}>>([]);
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  const presets = [
    'Bu sözleşmeyi analiz et ve riskleri belirle',
    'Bu dava dosyasını özetle ve ana noktaları çıkar',
    'Bu belgeyi hukuki açıdan değerlendir',
    'Bu metindeki hukuki terimleri açıkla',
    'Bu sözleşmedeki tarafların hak ve yükümlülüklerini listele',
    'Bu dava sürecindeki önemli tarihleri belirle',
    'Bu belgeyi mahkeme için hazırla',
    'Bu sözleşmedeki eksik maddeleri tespit et',
    'Bu dava dosyasındaki delilleri analiz et',
    'Bu metni resmi hukuki dile çevir'
  ];

  // Gelişmiş kategoriler ve şablonlar
  const categories = {
    'Sözleşme Analizi': [
      'Bu sözleşmeyi analiz et ve riskleri belirle',
      'Sözleşmedeki tarafların hak ve yükümlülüklerini listele',
      'Bu sözleşmedeki eksik maddeleri tespit et',
      'Sözleşme maddelerini hukuki açıdan değerlendir',
      'Bu sözleşmenin fesih şartlarını analiz et'
    ],
    'Dava Dosyası': [
      'Bu dava dosyasını özetle ve ana noktaları çıkar',
      'Bu dava sürecindeki önemli tarihleri belirle',
      'Bu dava dosyasındaki delilleri analiz et',
      'Dava sürecindeki prosedür hatalarını tespit et',
      'Bu dava için strateji önerileri sun'
    ],
    'Hukuki Değerlendirme': [
      'Bu belgeyi hukuki açıdan değerlendir',
      'Bu metindeki hukuki terimleri açıkla',
      'Bu belgeyi mahkeme için hazırla',
      'Hukuki dayanakları ve referansları belirle',
      'Bu metni resmi hukuki dile çevir'
    ],
    'Mevzuat Analizi': [
      'Bu mevzuat metnini analiz et',
      'Mevzuattaki değişiklikleri tespit et',
      'Bu mevzuatın uygulama alanlarını belirle',
      'Mevzuat ile ilgili örnekleri ver',
      'Bu mevzuatın etkilerini değerlendir'
    ],
    'İçtihat İncelemesi': [
      'Bu içtihadı analiz et ve önemli noktaları çıkar',
      'İçtihatın hukuki dayanaklarını belirle',
      'Bu içtihatın uygulanabilirliğini değerlendir',
      'İçtihat ile ilgili benzer kararları bul',
      'Bu içtihatın etkilerini analiz et'
    ]
  };

  // Analiz geçmişini localStorage'dan yükle
  useEffect(() => {
    const savedHistory = localStorage.getItem('notebook-llm-history');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Geçmiş yüklenirken hata:', error);
      }
    }
  }, []);

  // Analiz geçmişini localStorage'a kaydet
  useEffect(() => {
    if (analysisHistory.length > 0) {
      localStorage.setItem('notebook-llm-history', JSON.stringify(analysisHistory));
    }
  }, [analysisHistory]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    // reset input value to allow re-selecting same file
    e.currentTarget.value = '';
  };

  const addFiles = (incoming: File[]) => {
    setErrorMsg('');
    const all = [...files];
    for (const f of incoming) {
      if (!/\.(pdf|docx?|txt)$/i.test(f.name)) { setErrorMsg('Sadece PDF, DOC/DOCX veya TXT yükleyin.'); continue; }
      if (f.size > MAX_FILE_SIZE) { setErrorMsg(`${f.name}: Boyut çok büyük (${formatBytes(f.size)}).`); continue; }
      if (all.length >= MAX_FILES) { setErrorMsg(`En fazla ${MAX_FILES} dosya yüklenebilir.`); break; }
      all.push(f);
    }
    setFiles(all);
  };

  const onDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer?.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };
  const onDragOver: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
  };

  // Analiz geçmişine kaydetme fonksiyonu
  const saveToHistory = (analysisResult: string, processingTime: number) => {
    const newAnalysis: AnalysisHistory = {
      id: Date.now().toString(),
      instruction,
      textInput,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      result: analysisResult,
      timestamp: new Date().toISOString(),
      category: selectedCategory || 'Genel',
      tags: instruction.split(' ').slice(0, 3), // İlk 3 kelimeyi tag olarak al
      isFavorite: false,
      wordCount: analysisResult.split(' ').length,
      processingTime
    };
    
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 49)]); // Son 50 analizi sakla
    setCurrentAnalysisId(newAnalysis.id);
  };

  // Favorilere ekleme/çıkarma
  const toggleFavorite = (id: string) => {
    setAnalysisHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Geçmişten analizi yükleme
  const loadFromHistory = (analysis: AnalysisHistory) => {
    setInstruction(analysis.instruction);
    setTextInput(analysis.textInput);
    setResult(analysis.result);
    setCurrentAnalysisId(analysis.id);
    setSelectedCategory(analysis.category);
  };

  // OCR ve gelişmiş dosya işleme fonksiyonları
  const handleOcrUpload = async (file: File) => {
    if (!ocrEnabled) return null;
    
    try {
      // OCR işlemi simülasyonu (gerçek OCR için Tesseract.js kullanılabilir)
      const ocrResult = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`OCR ile çıkarılan metin:\n\n${file.name} dosyasından metin çıkarıldı.\n\nBu bir simülasyondur. Gerçek OCR için Tesseract.js entegrasyonu gerekir.`);
        }, 2000);
      });
      
      return ocrResult;
    } catch (error) {
      console.error('OCR hatası:', error);
      return null;
    }
  };

  const handleBatchUpload = async (files: File[]) => {
    setBatchFiles(files);
    setBatchResults([]);
    
    for (const file of files) {
      try {
        const content = await fileProcessingService.processFile(file);
        const ocrContent = ocrEnabled ? await handleOcrUpload(file) : null;
        const finalContent = ocrContent || content;
        
        setBatchResults(prev => [...prev, {
          file: file.name,
          result: finalContent,
          status: 'success'
        }]);
      } catch (error) {
        setBatchResults(prev => [...prev, {
          file: file.name,
          result: `Hata: ${error}`,
          status: 'error'
        }]);
      }
    }
  };

  const processBatchAnalysis = async () => {
    if (batchResults.length === 0) return;
    
    setLoading(true);
    try {
      const combinedContent = batchResults
        .filter(r => r.status === 'success')
        .map(r => `Dosya: ${r.file}\nİçerik: ${r.result}\n\n`)
        .join('---\n\n');
      
      const result = await geminiService.analyzeText(instruction, combinedContent);
      setResult(result);
      setShowResult(true);
      
      // Batch analizi geçmişe kaydet
      const batchAnalysis: AnalysisHistory = {
        id: `batch-${Date.now()}`,
        instruction: `[BATCH] ${instruction}`,
        textInput: combinedContent,
        files: batchFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        result: result,
        timestamp: new Date().toISOString(),
        category: 'Batch Analysis',
        tags: ['batch', 'multiple-files'],
        isFavorite: false,
        wordCount: combinedContent.split(' ').length,
        processingTime: Date.now() - processingStartTime
      };
      
      setAnalysisHistory(prev => [batchAnalysis, ...prev.slice(0, 49)]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Batch analiz hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true); 
    setResult(''); 
    setErrorMsg(''); 
    setCopied(false);
    setProcessingStartTime(Date.now());
    
    try {
      // Eğer ne metin ne de dosya yoksa hata ver
      if (!textInput.trim() && files.length === 0) {
        throw new Error('Lütfen metin girin veya dosya yükleyin');
      }
      
      // Eğer talimat yoksa hata ver
      if (!instruction.trim()) {
        throw new Error('Lütfen bir talimat girin');
      }

      // Gerçek AI kullanılıyorsa API key kontrolü
      if (useRealAI && !apiKey.trim()) {
        throw new Error('Gerçek AI kullanmak için Gemini API key girin');
      }

      // Gerçek AI kullanılıyorsa Gemini servisini başlat
      if (useRealAI) {
        if (!geminiService.isInitialized()) {
          geminiService.initialize(apiKey);
        }
      }
      
      console.log('NotebookLLM İşlem Başlatıldı:', {
        instruction,
        textInput: textInput.trim(),
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        useRealAI,
        hasApiKey: !!apiKey.trim()
      });
      
      let analysisResult = '';

      if (useRealAI && geminiService.isInitialized()) {
        // Gerçek Gemini AI kullan
        if (files.length > 0) {
          // Dosya analizi
          const fileContents = [];
          for (const file of files) {
            try {
              const content = await fileProcessingService.extractTextFromFile(file);
              fileContents.push({
                name: file.name,
                content: content
              });
            } catch (error) {
              console.warn(`Dosya ${file.name} işlenemedi:`, error);
              fileContents.push({
                name: file.name,
                content: `Dosya içeriği çıkarılamadı: ${(error as Error).message}`
              });
            }
          }

          if (fileContents.length === 1) {
            analysisResult = await geminiService.analyzeFile(instruction, fileContents[0].content, fileContents[0].name);
          } else {
            analysisResult = await geminiService.analyzeMultipleFiles(instruction, fileContents);
          }
        }

        if (textInput.trim()) {
          if (analysisResult) {
            analysisResult += '\n\n--- METİN ANALİZİ ---\n\n';
          }
          const textAnalysis = await geminiService.analyzeText(instruction, textInput.trim());
          analysisResult += textAnalysis;
        }

        // Sonuç formatla
        analysisResult = `🤖 GERÇEK AI ANALİZ SONUCU (Gemini)\n\n` +
          `📋 Talimat: ${instruction}\n\n` +
          `📊 İşlenen Veri: ${files.length} dosya, ${textInput.trim().length} karakter metin\n\n` +
          `---\n\n${analysisResult}\n\n---\n\n` +
          `✅ Bu sonuç gerçek Gemini AI tarafından üretilmiştir.\n` +
          `🕒 İşlem Süresi: ${Date.now() - Date.now()}ms\n` +
          `🔗 AI Model: Gemini 1.5 Flash`;

      } else {
        // Demo modu kaldırıldı - production için temizlendi
        analysisResult = 'AI servisi aktif değil. Lütfen API anahtarını kontrol edin.';
      }
      
      setResult(analysisResult);
      
      // Analiz geçmişine kaydet
      const processingTime = Date.now() - processingStartTime;
      saveToHistory(analysisResult, processingTime);
      
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      console.error('NotebookLLM hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(()=>setCopied(false), 1500);
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'notebookllm-sonuc.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const chooseFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex-1"></div>
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl md:rounded-2xl shadow-lg">
              <Wand2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 md:p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
                title="Analiz Geçmişi"
              >
                <History className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 md:p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
                title="Ayarlar"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Avukat AI Asistanı
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Hukuki belgelerinizi ve dava dosyalarınızı AI ile analiz edin
          </p>
          <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium ${
              useRealAI 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {useRealAI ? '🤖 Gerçek AI (Gemini)' : '🎭 Demo Modu'}
            </div>
            {useRealAI && (
              <div className="px-2 md:px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800">
                ✅ API Key Tanımlı
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center gap-3 mb-6 text-gray-800 dark:text-gray-200">
              <Key className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-semibold">AI Ayarları</span>
            </div>
            
            <div className="space-y-6">
              {/* AI Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Modu</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {useRealAI ? 'Gerçek Gemini AI kullanılıyor' : 'Demo modu aktif'}
                  </p>
                </div>
                <button
                  onClick={() => setUseRealAI(!useRealAI)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useRealAI ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useRealAI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* API Key Input */}
              {useRealAI && (
                <div>
                  <label htmlFor="api-key" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gemini API Key *
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSyC... (Gemini API key'inizi girin)"
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                    />
                    <button
                      onClick={() => {
                        if (apiKey.trim()) {
                          geminiService.initialize(apiKey);
                          alert('API Key başarıyla ayarlandı!');
                        } else {
                          alert('Lütfen geçerli bir API key girin');
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Kaydet
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 API key'inizi <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a>'dan alabilirsiniz
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Bilgi</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>Demo Modu:</strong> Simüle edilmiş AI yanıtları</p>
                  <p>• <strong>Gerçek AI:</strong> Gemini 1.5 Flash modeli kullanır</p>
                  <p>• <strong>Güvenlik:</strong> API key'iniz tarayıcınızda saklanır</p>
                  <p>• <strong>Desteklenen Dosyalar:</strong> PDF, DOCX, TXT</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis History Panel */}
        {showHistory && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <History className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-semibold">Analiz Geçmişi</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  {analysisHistory.length} analiz
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    showFavoritesOnly 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm"
                >
                  <option value="">Tüm Kategoriler</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Analiz geçmişinde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analysisHistory
                .filter(item => {
                  if (showFavoritesOnly && !item.isFavorite) return false;
                  if (selectedCategory && item.category !== selectedCategory) return false;
                  if (searchQuery && !item.instruction.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })
                .map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                      currentAnalysisId === analysis.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => loadFromHistory(analysis)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">
                          {analysis.instruction}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            {analysis.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(analysis.timestamp).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {analysis.wordCount} kelime
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(analysis.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          analysis.isFavorite 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${analysis.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {analysis.result.substring(0, 150)}...
                    </div>
                  </div>
                ))}
              
              {analysisHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Henüz analiz geçmişi yok</p>
                  <p className="text-sm">İlk analizinizi yapın</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Instruction & Presets */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="flex items-center gap-3 mb-4 text-gray-800 dark:text-gray-200">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold">Hızlı Şablonlar</span>
        </div>
          <div className="flex flex-wrap gap-3 mb-6">
          {presets.map((p, i) => (
              <button 
                key={i} 
                onClick={()=>setInstruction(p)} 
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50 rounded-xl hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
              {p}
            </button>
          ))}
        </div>
          <div>
            <label htmlFor="nbllm-instruction" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              AI Talimatı *
            </label>
            <input 
              id="nbllm-instruction" 
              value={instruction} 
              onChange={(e)=>setInstruction(e.target.value)} 
              placeholder="Örn: Bu yazıyı makaleye çevir, özetle, yazım hatalarını düzelt..." 
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300" 
            />
          </div>
      </div>

      {/* Text & Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center gap-3 mb-4 text-gray-800 dark:text-gray-200">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold">Doğrudan Metin (Opsiyonel)</span>
          </div>
          <label htmlFor="nbllm-text" className="sr-only">Metin</label>
            <textarea 
              id="nbllm-text" 
              value={textInput} 
              onChange={(e)=>setTextInput(e.target.value)} 
              rows={12} 
              placeholder="Metni buraya yapıştırın veya yazın..." 
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 resize-none" 
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {textInput.length} karakter
            </div>
        </div>

        {/* Files card with drag & drop */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-4 text-gray-800 dark:text-gray-200">
              <div className="flex items-center gap-3">
                <UploadCloud className="w-5 h-5 text-teal-600" />
                <span className="text-lg font-semibold">Dosya Yükle (PDF/DOCX/TXT)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBatchMode(!batchMode)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    batchMode 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title="Toplu İşlem Modu"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOcrEnabled(!ocrEnabled)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    ocrEnabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title="OCR Aktif"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>
          <label
            htmlFor="nbllm-files"
            onDrop={onDrop}
            onDragOver={onDragOver}
              className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:border-teal-400"
            aria-label="Dosya yükle alanı"
            title="Dosyaları buraya sürükleyip bırakın veya tıklayın"
          >
              <div className="flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium">Dosyaları buraya bırakın</p>
                  <p className="text-teal-600">veya seçmek için tıklayın</p>
                </div>
                <div className="text-xs text-gray-500">
                  Desteklenen: PDF, DOC/DOCX, TXT<br/>
                  Maks {MAX_FILES} dosya · {formatBytes(MAX_FILE_SIZE)}/dosya
                </div>
            </div>
          </label>
          <input ref={inputRef} id="nbllm-files" aria-label="Dosya yükle" type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={onFileChange} className="hidden" />
            <div className="mt-4 flex justify-center">
              <button 
                onClick={chooseFiles} 
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Dosya Seç
              </button>
          </div>
          {files.length>0 && !batchMode && (
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Yüklenen Dosyalar:</h4>
                <ul className="space-y-2">
              {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/60 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="flex-1 truncate font-medium" title={f.name}>{f.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{formatBytes(f.size)}</span>
                      <button 
                        aria-label="Dosyayı kaldır" 
                        title="Kaldır" 
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                        onClick={()=>removeFile(i)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
              </div>
          )}

          {/* Batch Mode Results */}
          {batchMode && batchResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Toplu İşlem Sonuçları</h4>
                <button
                  onClick={processBatchAnalysis}
                  disabled={batchResults.filter(r => r.status === 'success').length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Analiz Et
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {batchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium text-sm">{result.file}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {result.result.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="text-sm text-red-600 dark:text-red-400">{errorMsg}</div>
              </div>
          )}
        </div>
      </div>

      {/* Actions */}
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={handleSubmit} 
            disabled={loading || (!textInput.trim() && files.length === 0)} 
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI İşliyor...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>AI ile Analiz Et</span>
              </>
            )}
          </button>
          <button 
            onClick={()=>{ setFiles([]); setTextInput(''); setResult(''); setErrorMsg(''); }} 
            className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Temizle
        </button>
      </div>

      {/* Result */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">AI Analiz Sonucu</h3>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={copyResult} 
                disabled={!result} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl" 
                title="Kopyala" 
                aria-label="Sonucu kopyala"
              >
                <Copy className="w-4 h-4" /> 
                {copied ? 'Kopyalandı!' : 'Kopyala'}
            </button>
              <button 
                onClick={downloadResult} 
                disabled={!result} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl" 
                title="İndir" 
                aria-label="Sonucu indir"
              >
                <Download className="w-4 h-4" /> 
                İndir
            </button>
          </div>
        </div>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 min-h-[200px] leading-relaxed">
              {result || (
                <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>AI analiz sonucu burada görünecek</p>
                    <p className="text-xs mt-1">Metin girin veya dosya yükleyin, sonra "AI ile Analiz Et" butonuna tıklayın</p>
                  </div>
                </div>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
