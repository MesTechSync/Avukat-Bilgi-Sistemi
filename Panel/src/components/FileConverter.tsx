import React, { useCallback, useMemo, useState } from 'react';
import { UploadCloud, FileType, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Status = 'idle' | 'uploading' | 'converting' | 'done' | 'error';

const MAX_SIZE_MB = 50;

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const hash = await window.crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return '';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const FileConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  const accept = useMemo(
    () => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    []
  );

  const onSelect = useCallback((f: File | null) => {
    setMessage('');
    if (!f) {
      setFile(null);
      return;
    }
    if (!accept.includes(f.type)) {
      setMessage('Sadece PDF veya DOCX dosyaları desteklenir.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage(`Dosya çok büyük. Maksimum ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  }, [accept]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    onSelect(f ?? null);
  }, [onSelect]);

  const handleBrowse = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    onSelect(f ?? null);
  }, [onSelect]);

  const convert = useCallback(async () => {
    if (!file) return;
    setStatus('uploading');
    setMessage('Yükleniyor...');
    try {
      // First try server-side conversion via backend endpoint (proxied by Vite)
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/convert-udf', { method: 'POST', body: form });
      if (res.ok) {
        setStatus('converting');
        setMessage('Dönüştürülüyor...');
        const blob = await res.blob();
        const outName = file.name.replace(/\.(pdf|docx)$/i, '') + '.udf';
        downloadBlob(blob, outName);
        setStatus('done');
        setMessage('Dönüşüm tamamlandı.');
        return;
      }
      // If backend not available, fall back to client-side placeholder UDF pack
      setStatus('converting');
      setMessage('Sunucu bulunamadı. Yerel paket oluşturuluyor...');
      const buf = await file.arrayBuffer();
      const digest = await sha256(buf);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const udf = {
        version: '1.0',
        source: {
          filename: file.name,
          size: file.size,
          mimetype: file.type,
          sha256: digest,
        },
        created_at: new Date().toISOString(),
        payload: base64,
      };
      const blob = new Blob([JSON.stringify(udf, null, 2)], { type: 'application/json' });
      const outName = file.name.replace(/\.(pdf|docx)$/i, '') + '.udf';
      downloadBlob(blob, outName);
      setStatus('done');
      setMessage('Yerel UDF paketi indirildi.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Dönüşüm sırasında hata oluştu.');
    }
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Dosya Dönüştürücü</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          PDF veya DOCX dosyalarını UDF formatına dönüştürün. Tercihen sunucu tarafında dönüştürme yapılır; sunucu yoksa yerel bir UDF paketi (JSON tabanlı) oluşturulur.
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-xl p-8 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 text-center"
      >
        <UploadCloud className="w-10 h-10 mx-auto text-gray-500 dark:text-gray-400" />
        <p className="mt-3 text-gray-700 dark:text-gray-300">Sürükleyip bırakın veya aşağıdan dosya seçin</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">PDF veya DOCX • Maks {MAX_SIZE_MB} MB</p>
        <div className="mt-4">
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleBrowse}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <FileType className="w-4 h-4" /> Dosya Seç
          </label>
        </div>
      </div>

      {file && (
        <div className="mt-4 p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{file.type || 'dosya'} • {formatBytes(file.size)}</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Kaldır
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={convert}
          disabled={!file || status === 'uploading' || status === 'converting'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60 hover:bg-green-700"
        >
          {status === 'uploading' || status === 'converting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Dönüştür ve İndir
        </button>
        {status === 'error' && (
          <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Hata</span>
        )}
        {message && <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>}
      </div>
    </div>
  );
};

export default FileConverter;
