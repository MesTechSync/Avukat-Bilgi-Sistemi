import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, Copy, Download, Wand2, Sparkles } from 'lucide-react';

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
  const [instruction, setInstruction] = useState('Bu dosyayı oku ve kısa bir özet çıkar.');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const presets = [
    'Bu yazıyı bir makaleye çevir',
    'Bu dosyadaki yazım hatalarını düzelt',
    'Metni özetle (en fazla 10 madde)',
    'Resmî üslupta tekrar yaz',
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
    setLoading(true); setResult(''); setErrorMsg(''); setCopied(false);
    try {
      const form = new FormData();
      if (instruction) form.append('instruction', instruction);
      if (textInput.trim()) form.append('text', textInput.trim());
      files.forEach((f) => form.append('files', f, f.name));
      const r = await fetch('/ai/notebookllm', { method: 'POST', body: form });
      const j: ApiResult = await r.json().catch(()=>({ ok:false, error:'Yanıt çözümlenemedi' }));
      if (!r.ok || !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setResult(j.result || '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Instruction & Presets */}
      <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg border border-white/20 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-200">
          <Wand2 className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium">Hızlı Şablonlar</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {presets.map((p, i) => (
            <button key={i} onClick={()=>setInstruction(p)} className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50">
              {p}
            </button>
          ))}
        </div>
        <label htmlFor="nbllm-instruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Talimat</label>
        <input id="nbllm-instruction" value={instruction} onChange={(e)=>setInstruction(e.target.value)} placeholder="Örn: Bu yazıyı makaleye çevir" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />
      </div>

      {/* Text & Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text card */}
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg border border-white/20 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Doğrudan Metin (opsiyonel)</span>
          </div>
          <label htmlFor="nbllm-text" className="sr-only">Metin</label>
          <textarea id="nbllm-text" value={textInput} onChange={(e)=>setTextInput(e.target.value)} rows={9} placeholder="Veya metni buraya yapıştırın" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />
        </div>

        {/* Files card with drag & drop */}
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg border border-white/20 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
            <UploadCloud className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium">Dosya Yükle (PDF/DOCX/TXT)</span>
          </div>
          <label
            htmlFor="nbllm-files"
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="block border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Dosya yükle alanı"
            title="Dosyaları buraya sürükleyip bırakın veya tıklayın"
          >
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <UploadCloud className="w-6 h-6 text-teal-600" />
              <span>Dosyaları buraya bırakın ya da <span className="text-teal-600">seçmek için tıklayın</span></span>
              <span className="text-xs text-gray-500">Desteklenen: PDF, DOC/DOCX, TXT · Maks {MAX_FILES} dosya · {formatBytes(MAX_FILE_SIZE)}/dosya</span>
            </div>
          </label>
          <input ref={inputRef} id="nbllm-files" aria-label="Dosya yükle" type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={onFileChange} className="hidden" />
          <div className="mt-2 flex justify-end">
            <button onClick={chooseFiles} className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded">Dosya Seç</button>
          </div>
          {files.length>0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded p-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 truncate" title={f.name}>{f.name}</span>
                  <span className="text-xs text-gray-500">{formatBytes(f.size)}</span>
                  <button aria-label="Dosyayı kaldır" title="Kaldır" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={()=>removeFile(i)}>
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errorMsg && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMsg}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {loading ? 'İşleniyor…' : 'Çalıştır'}
        </button>
        <button onClick={()=>{ setFiles([]); setTextInput(''); setResult(''); setErrorMsg(''); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">Temizle</button>
      </div>

      {/* Result */}
      <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg border border-white/20 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Sonuç</div>
          <div className="flex items-center gap-2">
            <button onClick={copyResult} disabled={!result} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50" title="Kopyala" aria-label="Sonucu kopyala">
              <Copy className="w-3.5 h-3.5" /> {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
            <button onClick={downloadResult} disabled={!result} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50" title="İndir" aria-label="Sonucu indir">
              <Download className="w-3.5 h-3.5" /> İndir
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 min-h-[120px]">{result || '—'}</pre>
      </div>
    </div>
  );
}
