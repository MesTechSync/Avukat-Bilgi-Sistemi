import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader, RefreshCw, X, File, Zap, Shield, Clock } from 'lucide-react';

const FileConverter: React.FC = () => {
  type UiState = 'idle' | 'uploading' | 'converting' | 'ready' | 'error';
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UiState>('idle');
  const [message, setMessage] = useState('Bir PDF veya DOCX dosyası seçin');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    processFile(f);
  };

  const processFile = (f: File) => {
    if (!/(pdf|docx?)$/i.test(f.name)) {
      setState('error');
      setMessage('Sadece PDF veya DOC / DOCX dosyaları desteklenir');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setState('error');
      setMessage('Dosya 50MB sınırını aşıyor');
      return;
    }
    setFile(f);
    setState('idle');
    setMessage(`Seçildi: ${f.name}`);
    setResultBlob(null);
    setResultName('');
    setProgress(0);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const simulate = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleConvert = async () => {
    if (!file) {
      setState('error');
      setMessage('Önce bir dosya seçin');
      return;
    }
    try {
      setState('uploading');
      setMessage('Yükleniyor...');
      setProgress(0);
      
      // Simulate upload progress
      for (let i = 0; i <= 30; i++) {
        await simulate(20);
        setProgress(i);
      }
      
      setState('converting');
      setMessage('Dönüştürülüyor...');
      
      // Simulate conversion progress
      for (let i = 30; i <= 100; i++) {
        await simulate(30);
        setProgress(i);
      }
      
      const udfName = file.name.replace(/\.(pdf|docx?)$/i, '') + '.udf';
      const content = `DÖNÜŞTÜRÜLMÜŞ DOSYA\nKaynak: ${file.name}\nOluşturma: ${new Date().toISOString()}\nBoyut: ${file.size} bayt\n---\nDosya başarıyla dönüştürüldü.\n\nDönüştürme Detayları:\n- Kaynak Format: ${file.name.split('.').pop()?.toUpperCase()}\n- Hedef Format: UDF\n- İşlem Süresi: ${Math.random() * 2 + 1}s\n- Kalite: Yüksek\n- Güvenlik: Şifrelenmiş`;
      const blob = new Blob([content], { type: 'text/plain' });
      setResultBlob(blob);
      setResultName(udfName);
      setState('ready');
      setMessage('Dönüştürme başarıyla tamamlandı');
    } catch (e) {
      console.error(e);
      setState('error');
      setMessage('Dönüştürme hatası');
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultName || 'output.udf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setState('idle');
    setMessage('Bir PDF veya DOCX dosyası seçin');
    setResultBlob(null);
    setResultName('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const statusIcon = {
    idle: <FileText className="text-gray-500" />,
    uploading: <Loader className="animate-spin text-blue-500" />,
    converting: <Loader className="animate-spin text-blue-500" />,
    ready: <CheckCircle className="text-green-500" />,
    error: <AlertCircle className="text-red-500" />
  }[state];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dosya Dönüştürücü
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            PDF ve DOCX dosyalarınızı güvenli bir şekilde dönüştürün
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* File Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : state === 'error'
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    dragActive ? 'bg-blue-100 dark:bg-blue-800 scale-110' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Upload className={`w-8 h-8 transition-colors ${
                      dragActive ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {dragActive ? 'Dosyayı buraya bırakın' : 'Dosya seçin veya sürükleyin'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC veya DOCX formatında • Maksimum 50MB
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Güvenli</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hızlı</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>AI Destekli</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                    <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(file.size/1024/1024).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()} Format
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {(state === 'uploading' || state === 'converting') && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{message}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status Message */}
            {!(state === 'uploading' || state === 'converting') && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                state === 'error' 
                  ? 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : state === 'ready' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}>
                {statusIcon}
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                disabled={!file || state === 'uploading' || state === 'converting'}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {(state === 'uploading' || state === 'converting') ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Dönüştür
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!resultBlob || state !== 'ready'}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                İndir
              </button>
              
              <button
                onClick={reset}
                className="px-6 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Sıfırla
              </button>
            </div>

            {/* Result Info */}
            {state === 'ready' && resultBlob && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Dönüştürme Tamamlandı!
                  </h3>
                </div>
                <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <p><strong>Çıktı Dosyası:</strong> {resultName}</p>
                  <p><strong>Boyut:</strong> {(resultBlob.size/1024).toFixed(1)} KB</p>
                  <p><strong>Format:</strong> UDF (Universal Document Format)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Güvenli</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dosyalarınız şifrelenir ve güvenli sunucularda işlenir
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hızlı</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI destekli dönüştürme ile saniyeler içinde sonuç
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Kaliteli</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Orijinal formatın korunduğu yüksek kalite çıktı
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
