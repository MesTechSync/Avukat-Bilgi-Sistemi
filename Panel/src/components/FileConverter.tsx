import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// CLEAN MINIMAL FileConverter COMPONENT (single definition/export)

const FileConverter: React.FC = () => {
  type UiState = 'idle' | 'uploading' | 'converting' | 'ready' | 'error';
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UiState>('idle');
  const [message, setMessage] = useState('Bir PDF veya DOCX dosyası seçin');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
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
      await simulate(500);
      setState('converting');
      setMessage('Dönüştürülüyor...');
      await simulate(1000);
      const udfName = file.name.replace(/\.(pdf|docx?)$/i, '') + '.udf';
      const content = `DEMO UDF DOSYASI\nKaynak: ${file.name}\nOluşturma: ${new Date().toISOString()}\nBoyut: ${file.size} bayt\n---\nBu dosya demo modunda üretildi.`;
      const blob = new Blob([content], { type: 'text/plain' });
      setResultBlob(blob);
      setResultName(udfName);
      setState('ready');
      setMessage('Dönüştürme tamamlandı');
    } catch (e) {
      console.error(e);
      setState('error');
      setMessage('Dönüştürme hatası');
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
  };

  const statusIcon = {
    idle: <FileText className="text-gray-500" />,
    uploading: <Loader className="animate-spin text-blue-500" />,
    converting: <Loader className="animate-spin text-blue-500" />,
    ready: <CheckCircle className="text-green-500" />,
    error: <AlertCircle className="text-red-500" />
  }[state];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" />
          Dosya Dönüştürücü (Demo)
        </h2>
        <div className="space-y-4">
          <div>
            <input
              id="fc-input"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="fc-input"
              className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition"
            >
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium">PDF veya DOCX seç</p>
              <p className="text-gray-500 text-xs">Demo dönüştürme • 50MB sınırı</p>
            </label>
          </div>

          {file && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Dosya:</span>
                <span className="text-gray-600 truncate max-w-[60%] text-right">{file.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Boyut:</span>
                <span className="text-gray-600">{(file.size/1024/1024).toFixed(2)} MB</span>
              </div>
            </div>
          )}

          <div className={`flex items-center gap-3 p-3 rounded border text-sm transition select-none
            ${state === 'error' ? 'border-red-300 bg-red-50 text-red-700' : ''}
            ${state === 'ready' ? 'border-green-300 bg-green-50 text-green-700' : ''}
            ${(state === 'idle' || state === 'uploading' || state === 'converting') ? 'border-gray-200 bg-gray-50 text-gray-700' : ''}
          `}>
            {statusIcon}
            <span>{message}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={!file || state === 'uploading' || state === 'converting'}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              {(state === 'uploading' || state === 'converting') ? <Loader className="animate-spin" /> : <FileText />}
              Dönüştür
            </button>
            <button
              onClick={handleDownload}
              disabled={!resultBlob || state !== 'ready'}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 text-white py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
            >
              <Download />
              İndir
            </button>
            <button
              onClick={reset}
              className="px-4 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
            >
              Sıfırla
            </button>
          </div>

          {state === 'ready' && resultBlob && (
            <div className="text-xs text-gray-500">
              Çıktı hazır: {resultName} (≈ {(resultBlob.size/1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
