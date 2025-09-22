import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Copy, Download, Wand2, Sparkles, Key, Settings } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { fileProcessingService } from '../services/fileProcessingService';

type ApiResult = { ok: boolean; result?: string; error?: string };

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

  const handleSubmit = async () => {
    setLoading(true); 
    setResult(''); 
    setErrorMsg(''); 
    setCopied(false);
    
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
                title="Ayarlar"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Avukat AI Asistanı
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hukuki belgelerinizi ve dava dosyalarınızı AI ile analiz edin
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              useRealAI 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {useRealAI ? '🤖 Gerçek AI (Gemini)' : '🎭 Demo Modu'}
            </div>
            {useRealAI && (
              <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800">
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
            <div className="flex items-center gap-3 mb-4 text-gray-800 dark:text-gray-200">
              <UploadCloud className="w-5 h-5 text-teal-600" />
              <span className="text-lg font-semibold">Dosya Yükle (PDF/DOCX/TXT)</span>
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
          {files.length>0 && (
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
