import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { spawn } from 'child_process';
import qrcode from 'qrcode';
import pkg from 'whatsapp-web.js';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const { Client, LocalAuth } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory (override any pre-set envs)
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const PORT = Number(process.env.PORT || 5175);
const panelDir = path.resolve(__dirname, '..', 'Panel');
const udfDir = path.resolve(__dirname, '..', 'UDF Dosya Sistemi');
const mevzuatDir = path.resolve(__dirname, '..', 'Mevzuat');
const yargiDir = path.resolve(__dirname, '..', 'Yargı');
const dataDir = path.resolve(__dirname, 'data');

// Feature flags
const ENABLE_FTS = process.env.ENABLE_FTS !== '0'; // use SQLite FTS5 indexer
const ENABLE_OCR = process.env.ENABLE_OCR === '1'; // enable OCR for images (and optionally PDFs if supported)
const ENABLE_PDF_OCR = process.env.ENABLE_PDF_OCR === '1'; // enable OCR for scanned PDFs via pdftoppm+tesseract
const MEILI_URL = process.env.MEILISEARCH_URL || process.env.MEILI_URL || '';
const MEILI_KEY = process.env.MEILISEARCH_API_KEY || process.env.MEILI_MASTER_KEY || process.env.MEILI_KEY || '';
const ENABLE_MEILI = !!MEILI_URL;

async function ensureVenvReady() {
  // Best-effort: verify python & venv presence. We'll not auto-install here to keep startup fast.
  // The PowerShell launcher will prepare venv and deps.
}

function getPythonPath() {
  const pyWin = path.join(udfDir, '.venv', 'Scripts', 'python.exe');
  return pyWin; // assume launcher prepared it
}

async function start() {
  await ensureVenvReady();

  const app = express();
  // Security & performance
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Basic rate limit for AI endpoint to avoid abuse
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

  // WhatsApp in-process
  let waClient = null;
  let waQr = null;
  let waStatus = 'disconnected';

  function ensureWa() {
    if (waClient) return waClient;
    waClient = new Client({
      authStrategy: new LocalAuth({ clientId: 'panel-wa' }),
      puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });
    waStatus = 'connecting';
    waClient.on('qr', async (qr) => {
      try {
        waQr = await qrcode.toDataURL(qr);
        waStatus = 'qr';
      } catch (e) { console.error(e); }
    });
    waClient.on('ready', () => { waStatus = 'ready'; waQr = null; });
    waClient.on('authenticated', () => { waStatus = 'connecting'; });
    waClient.on('disconnected', () => { waStatus = 'disconnected'; waQr = null; waClient = null; });
    waClient.initialize().catch(err => { console.error('WA init', err); waStatus = 'disconnected'; });
    return waClient;
  }

  app.get('/wa/status', (req, res) => {
    console.log('GET /wa/status ->', waStatus);
    res.json({ status: waStatus });
  });
  app.get('/wa/qr', (req, res) => {
    ensureWa();
    res.json({ qr: waQr, status: waStatus });
  });
  app.post('/wa/logout', async (req, res) => {
    try { if (waClient) { await waClient.logout(); await waClient.destroy(); waClient = null; } } catch {}
    waStatus = 'disconnected'; waQr = null; res.json({ ok: true });
  });

  // WhatsApp: list chats
  app.get('/wa/chats', async (req, res) => {
    try {
      ensureWa();
      if (!waClient || waStatus !== 'ready') {
        return res.status(503).json({ error: 'WhatsApp not ready' });
      }
      // Some accounts may return empty chats just after ready; retry briefly
      let chats = await waClient.getChats();
      if (!Array.isArray(chats) || chats.length === 0) {
        for (let i = 0; i < 4; i++) { // ~2s total
          await new Promise(r => setTimeout(r, 500));
          chats = await waClient.getChats();
          if (Array.isArray(chats) && chats.length > 0) break;
        }
      }
      // Map minimal fields to keep payload light
      const data = chats.map((c) => ({
        id: c.id?._serialized || c.id,
        name: c.name || c.formattedTitle || (c.id?.user ? `+${c.id.user}` : (c.id?._serialized || 'Sohbet')),
        isGroup: !!c.isGroup,
        unreadCount: c.unreadCount ?? 0,
      }));
      res.json({ chats: data });
    } catch (e) {
      console.error('[wa:chats]', e);
      res.status(500).json({ error: 'Failed to get chats' });
    }
  });

  // WhatsApp: fetch messages for chat
  app.get('/wa/messages', async (req, res) => {
    try {
      ensureWa();
      if (!waClient || waStatus !== 'ready') {
        return res.status(503).json({ error: 'WhatsApp not ready' });
      }
      const chatId = req.query.chatId;
      const limit = Math.max(1, Math.min(200, Number(req.query.limit || 50)));
      if (!chatId || typeof chatId !== 'string') {
        return res.status(400).json({ error: 'chatId required' });
      }
      const chat = await waClient.getChatById(chatId);
      const msgs = await chat.fetchMessages({ limit });
      const messages = msgs.map((m) => ({
        id: m.id?._serialized || m.id,
        chatId: chatId,
        from: m.from,
        to: m.to,
        body: m.body,
        fromMe: !!m.fromMe,
        timestamp: (m.timestamp ? m.timestamp * 1000 : Date.now()),
        type: m.type,
        ack: m.ack, // 0-4
      }));
      res.json({ messages });
    } catch (e) {
      console.error('[wa:messages]', e);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // WhatsApp: send message to chatId or phone
  app.post('/wa/send', async (req, res) => {
    try {
      ensureWa();
      if (!waClient || waStatus !== 'ready') {
        return res.status(503).json({ error: 'WhatsApp not ready' });
      }
      const { chatId, to, message } = req.body || {};
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message required' });
      }
      let jid = chatId;
      if (!jid && to) {
        const raw = String(to);
        if (raw.endsWith('@c.us') || raw.endsWith('@g.us')) {
          jid = raw;
        } else {
          const digits = raw.replace(/\D+/g, '');
          if (!digits) return res.status(400).json({ error: 'invalid recipient' });
          jid = `${digits}@c.us`;
        }
      }
      if (!jid) return res.status(400).json({ error: 'chatId or to required' });
      const sent = await waClient.sendMessage(jid, message);
      res.json({ ok: true, id: sent.id?._serialized || sent.id, to: jid });
    } catch (e) {
      console.error('[wa:send]', e);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Health
  app.get('/health', (req, res) => {
    console.log('[req] GET /health');
    res.json({ status: 'ok', service: 'one-port-server' });
  });

  // ------------------------
  // Mevzuat ve İçtihat Arama
  // ------------------------
  const allowedExt = new Set(['.txt', '.md', '.markdown', '.pdf', '.docx', '.doc']);
  // If OCR is enabled, also consider common image types for OCR
  const ocrImageExt = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff']);
  const allowedAllExt = new Set([...allowedExt, ...(ENABLE_OCR ? ocrImageExt : [])]);
  // Allow overriding/adding roots via env LEGAL_ROOTS (comma-separated absolute paths with optional :source suffix)
  // Example: LEGAL_ROOTS=C:\\Data\\Mevzuat:mevzuat,C:\\Data\\Yargi:yargi
  const searchRoots = [];
  searchRoots.push({ root: mevzuatDir, source: 'mevzuat' });
  searchRoots.push({ root: yargiDir, source: 'yargi' });
  const extraRoots = (process.env.LEGAL_ROOTS || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const entry of extraRoots) {
    const [p, src] = entry.split(':');
    if (!p) continue;
    const abs = path.resolve(p);
    searchRoots.push({ root: abs, source: (src || 'yargi').toLowerCase() });
  }
  const fileIndex = new Map(); // key: absPath -> { mtimeMs, size, source }
  const contentCache = new Map(); // key: absPath -> { mtimeMs, text, title }
  let lastIndexTime = 0;

  // Ensure data dir exists
  try { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); } catch {}

  // --- SQLite FTS: lazy-init database and schema ---
  let db = null;
  async function ensureDb() {
    if (!ENABLE_FTS) return null;
    if (db) return db;
    try {
      const mod = await import('better-sqlite3');
      const Database = mod.default || mod;
      const dbPath = path.join(dataDir, 'legal_index.db');
      db = new Database(dbPath);
      // Pragmas for performance/safety
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('temp_store = MEMORY');
      db.pragma("busy_timeout = 5000");
      // Schema
      db.exec(`
        CREATE TABLE IF NOT EXISTS docs (
          id INTEGER PRIMARY KEY,
          path TEXT UNIQUE,
          source TEXT,
          mtimeMs REAL,
          size INTEGER,
          title TEXT
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(
          path, title, content,
          tokenize = 'unicode61'
        );
        CREATE INDEX IF NOT EXISTS idx_docs_source ON docs(source);
        CREATE INDEX IF NOT EXISTS idx_docs_mtime ON docs(mtimeMs);
      `);
      return db;
    } catch (e) {
      console.warn('[fts:init] better-sqlite3 not available or failed to init:', e?.message || e);
      return null;
    }
  }

  // --- Meilisearch (optional) ---
  let meili = null;
  const meiliIndexName = 'legal';
  async function ensureMeili() {
    if (!ENABLE_MEILI) return null;
    if (meili) return meili;
    try {
      const { MeiliSearch } = await import('meilisearch');
      meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY || undefined });
      const index = await meili.getIndex(meiliIndexName).catch(() => meili.createIndex(meiliIndexName, { primaryKey: 'path' }));
      await index.updateSettings({
        searchableAttributes: ['title', 'content', 'path'],
        displayedAttributes: ['path', 'source', 'title', 'snippet'],
        filterableAttributes: ['source'],
        sortableAttributes: ['mtimeMs', 'size'],
        distinctAttribute: 'path'
      });
      return meili;
    } catch (e) {
      console.warn('[meili:init] failed:', e?.message || e);
      return null;
    }
  }

  // Optional OCR for images
  async function ocrImageBuffer(buf, lang = 'tur+eng') {
    if (!ENABLE_OCR) return '';
    try {
      const tmod = await import('tesseract.js');
      const Tesseract = tmod.default || tmod;
      const result = await Tesseract.recognize(buf, lang);
      return (result?.data?.text || '').trim();
    } catch (e) {
      console.warn('[ocr] tesseract.js unavailable or failed:', e?.message || e);
      return '';
    }
  }

  // Optional OCR for scanned PDFs using poppler's pdftoppm
  async function ocrPdfWithPoppler(absPath) {
    if (!ENABLE_OCR || !ENABLE_PDF_OCR) return '';
    try {
      const os = await import('os');
      const fsp = await import('fs');
      const tmpBase = await new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), 'pdfocr-'), (err, folder) => err ? reject(err) : resolve(folder));
      });
      const outPrefix = path.join(tmpBase, 'page');
      // Run: pdftoppm -png -r 180 absPath outPrefix
      await new Promise((resolve, reject) => {
        const p = spawn('pdftoppm', ['-png', '-r', '180', absPath, outPrefix]);
        let err = '';
        p.stderr.on('data', d => err += d.toString());
        p.on('close', (code) => code === 0 ? resolve(0) : reject(new Error('pdftoppm failed: '+code+' '+err)));
      });
      // Collect generated PNGs and OCR sequentially to limit CPU
      const files = fsp.readdirSync(tmpBase).filter(n => /page-\d+\.png$/i.test(n)).sort((a,b)=>{
        const ai = parseInt(a.match(/-(\d+)\.png$/i)[1]);
        const bi = parseInt(b.match(/-(\d+)\.png$/i)[1]);
        return ai - bi;
      });
      let out = '';
      for (const n of files) {
        try {
          const buf = fsp.readFileSync(path.join(tmpBase, n));
          const t = await ocrImageBuffer(buf);
          out += '\n\n' + t;
        } catch {}
      }
      // Cleanup best-effort
      try { files.forEach(n => { try { fsp.unlinkSync(path.join(tmpBase, n)); } catch {} }); fsp.rmdirSync(tmpBase); } catch {}
      return out.trim();
    } catch (e) {
      console.warn('[ocr:pdf] failed or pdftoppm missing:', e?.message || e);
      return '';
    }
  }

  const EXCLUDE_DIR_NAMES = new Set([
    '.git', '.hg', '.svn', '.venv', '__pycache__', 'node_modules', 'dist', 'build', 'out', 'logs',
    '.idea', '.vscode', '.DS_Store', 'yargi_mcp.egg-info', 'mevzuat_mcp.egg-info'
  ]);
  const EXCLUDE_PATH_PARTS = ['site-packages', 'egg-info', 'node_modules', '.venv', '/logs/', '\\logs\\'];
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB safety cap

  async function listFilesRecursive(dir, acc, source, maxCount = 20000) {
    if (!fs.existsSync(dir)) return acc;
    const stack = [dir];
    while (stack.length && acc.length < maxCount) {
      const current = stack.pop();
      let entries = [];
      try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch {}
      for (const e of entries) {
        const p = path.join(current, e.name);
          if (e.isDirectory()) {
            if (EXCLUDE_DIR_NAMES.has(e.name)) continue;
            stack.push(p); continue;
          }
          // Path-based exclusions
          const lowerP = p.toLowerCase();
          if (EXCLUDE_PATH_PARTS.some(part => lowerP.includes(part))) continue;
        const ext = path.extname(e.name).toLowerCase();
        if (!allowedAllExt.has(ext)) continue;
        try {
            const st = fs.statSync(p);
            if (st.size > MAX_FILE_SIZE_BYTES) continue;
            acc.push({ path: p, mtimeMs: st.mtimeMs, size: st.size, source });
        } catch {}
        if (acc.length >= maxCount) break;
      }
    }
    return acc;
  }

  async function ensureIndexed(force = false) {
    const now = Date.now();
    if (!force && now - lastIndexTime < 60_000 && fileIndex.size > 0) return; // refresh at most every 60s
    const files = [];
    await Promise.all(
      searchRoots.map(({ root, source }) => listFilesRecursive(root, files, source).catch(() => files))
    );
    // Normalize into index map
    fileIndex.clear();
    for (const f of files) fileIndex.set(f.path, f);
    lastIndexTime = now;
  }

  async function extractTextFromFile(absPath) {
    try {
      const idx = fileIndex.get(absPath);
      if (!idx) return null;
      const cached = contentCache.get(absPath);
      if (cached && cached.mtimeMs === idx.mtimeMs) return cached;
      const ext = path.extname(absPath).toLowerCase();
      let text = '';
      let title = path.basename(absPath);
      if (ext === '.txt' || ext === '.md' || ext === '.markdown') {
        text = fs.readFileSync(absPath, 'utf8');
        const firstLine = (text.split(/\r?\n/)[0] || '').trim();
        if (firstLine) title = firstLine.slice(0, 200);
      } else if (ext === '.pdf') {
        const buf = fs.readFileSync(absPath);
        const mod = await import('pdf-parse/lib/pdf-parse.js').catch(async () => (await import('pdf-parse')));
        const pdfParse = (mod.default || mod);
        const parsed = await pdfParse(buf);
        text = parsed.text || '';
        // If OCR enabled and parsed text is very short, skip for now (PDF OCR requires extra system deps)
        // Optionally, you can integrate poppler-based rasterization and then run ocrImageBuffer per page.
      } else if (ext === '.docx') {
        const mammoth = await import('mammoth');
        const buf = fs.readFileSync(absPath);
        const result = await mammoth.extractRawText({ buffer: buf });
        text = result.value || '';
      } else if (ext === '.doc') {
        // Legacy .doc is not supported; leave as empty text but keep title
        text = '';
      } else if (ENABLE_OCR && ocrImageExt.has(ext)) {
        // OCR for images
        const buf = fs.readFileSync(absPath);
        text = await ocrImageBuffer(buf);
      }
      // If PDF had little/no text and PDF OCR is enabled, try OCR
      if (ext === '.pdf' && ENABLE_OCR && ENABLE_PDF_OCR) {
        if (!text || text.trim().length < 30) {
          const ocrText = await ocrPdfWithPoppler(absPath);
          if (ocrText) text = ocrText;
        }
      }
      const obj = { mtimeMs: idx.mtimeMs, text, title };
      contentCache.set(absPath, obj);
      // Cap cache size
      if (contentCache.size > 500) {
        const k = contentCache.keys().next().value; contentCache.delete(k);
      }
      return obj;
    } catch (e) {
      console.warn('[legal:extract:error]', absPath, e?.message || e);
      return null;
    }
  }

  function scoreDoc(text, qTerms) {
    if (!text) return 0;
    let s = 0;
    const lower = text.toLowerCase();
    for (const t of qTerms) {
      if (!t) continue;
      // count occurrences up to a limit
      let idx = 0, c = 0;
      while ((idx = lower.indexOf(t, idx)) !== -1 && c < 20) { s += 2; idx += t.length; c++; }
    }
    // length penalty (very long texts get slight penalty)
    s -= Math.max(0, Math.floor(text.length / 200000));
    return s;
  }

  function makeSnippet(text, qTerms, len = 280) {
    if (!text) return '';
    const lower = text.toLowerCase();
    let pos = 0;
    for (const t of qTerms) {
      if (!t) continue;
      const i = lower.indexOf(t);
      if (i !== -1) { pos = Math.max(0, i - Math.floor(len / 4)); break; }
    }
    const snip = text.slice(pos, pos + len).replace(/\s+/g, ' ').trim();
    return snip;
  }

  // --- Indexing job using SQLite FTS5 ---
  const indexState = { running: false, total: 0, indexed: 0, errors: 0, lastRunStart: 0, lastRunEnd: 0 };
  async function indexOneFile(dbh, f) {
    try {
      // Update fileIndex for accurate extract function
      fileIndex.set(f.path, f);
      const data = await extractTextFromFile(f.path);
      const text = data?.text || '';
      const title = data?.title || path.basename(f.path);
      if (dbh) {
        const up = dbh.prepare(`INSERT INTO docs(path, source, mtimeMs, size, title)
          VALUES(?, ?, ?, ?, ?)
          ON CONFLICT(path) DO UPDATE SET source=excluded.source, mtimeMs=excluded.mtimeMs, size=excluded.size, title=excluded.title`);
        up.run(f.path, f.source, f.mtimeMs, f.size, title);
        const row = dbh.prepare('SELECT id FROM docs WHERE path=?').get(f.path);
        const docId = row?.id;
        if (docId) {
          const ins = dbh.prepare('INSERT OR REPLACE INTO fts(rowid, path, title, content) VALUES(?, ?, ?, ?)');
          ins.run(docId, f.path, title, text);
        }
      }
      const meiliClient = await ensureMeili();
      if (meiliClient) {
        const index = await meiliClient.getIndex(meiliIndexName);
        await index.addDocuments([{ path: f.path, source: f.source, mtimeMs: f.mtimeMs, size: f.size, title, content: text }]);
      }
    } catch (e) {
      indexState.errors++;
      console.warn('[fts:indexOne:error]', f.path, e?.message || e);
    }
  }

  async function runFullIndex(force = false) {
    if (!ENABLE_FTS && !ENABLE_MEILI) return { ok: false, reason: 'indexing-disabled' };
    if (indexState.running) return { ok: false, reason: 'already-running' };
    const dbh = await ensureDb();
    // If db is unavailable but Meili enabled, proceed with Meili-only indexing
    indexState.running = true; indexState.total = 0; indexState.indexed = 0; indexState.errors = 0; indexState.lastRunStart = Date.now();
    try {
      const files = [];
      await Promise.all(searchRoots.map(({ root, source }) => listFilesRecursive(root, files, source)));
      indexState.total = files.length;
      // Build a map of existing docs to avoid unnecessary re-extraction
      const stmtGet = dbh ? dbh.prepare('SELECT id, mtimeMs FROM docs WHERE path=?') : null;
      for (const f of files) {
        try {
          const existing = stmtGet ? stmtGet.get(f.path) : null;
          if (!force && existing && Number(existing.mtimeMs) === Number(f.mtimeMs)) {
            // still ensure docs path is present in in-memory index
            fileIndex.set(f.path, f);
            indexState.indexed++;
            continue;
          }
          await indexOneFile(dbh, f);
          indexState.indexed++;
        } catch (e) {
          indexState.errors++;
          console.warn('[fts:index:error]', f.path, e?.message || e);
        }
      }
    } finally {
      indexState.running = false; indexState.lastRunEnd = Date.now();
    }
    return { ok: true };
  }

  // Kick off background indexing shortly after startup
  (async () => {
    if (ENABLE_MEILI) { await ensureMeili().catch(()=>{}); }
    if (ENABLE_FTS) { await ensureDb().catch(()=>{}); }
    setTimeout(() => { runFullIndex(false).catch(()=>{}); }, 1500);
  })();

  // Search endpoint (prefers SQLite FTS when enabled)
  // Optional query param: mode=fts|like|scan (default: fts)
  app.get('/legal/search', aiLimiter, async (req, res) => {
    try {
      const q = (req.query.q || '').toString().trim();
      if (!q) return res.status(400).json({ error: 'q param gerekli' });
      const sourceFilter = (req.query.source || '').toString().toLowerCase(); // '', 'mevzuat', 'yargi'
      const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
      const mode = String(req.query.mode || 'fts').toLowerCase();
      // Prefer Meilisearch if configured
      if (ENABLE_MEILI) {
        const meiliClient = await ensureMeili();
        if (meiliClient) {
          const index = await meiliClient.getIndex(meiliIndexName);
          const params = {
            limit,
            filter: sourceFilter ? [`source = ${JSON.stringify(sourceFilter)}`] : undefined,
            attributesToHighlight: ['title', 'content'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            facets: ['source']
          };
          const sr = await index.search(q, params);
          const rows = (sr.hits || []).map(h => ({
            path: h.path,
            source: h.source,
            title: (h._formatted && h._formatted.title) ? h._formatted.title : h.title,
            snippet: (h._formatted && h._formatted.content) ? h._formatted.content : (h.snippet || ''),
            rank: h._rankingScore || 0
          }));
          const facets = sr.facetDistribution || {};
          res.json({ ok: true, total: sr.estimatedTotalHits || rows.length, facets, results: rows });
          return;
        }
      }
      const dbh = await ensureDb();
      if (dbh && mode !== 'scan') {
        // Use FTS5 with bm25 ranking and snippets with <mark>
        if (mode === 'like') {
          // Debug fallback using LIKE on the FTS content
          const baseSql = `
            SELECT docs.path, docs.source, docs.title,
                   substr(fts.content, max(1, instr(lower(fts.content), lower(?)) - 80), 240) AS snippet,
                   0 AS rank
            FROM fts JOIN docs ON docs.id = fts.rowid
            WHERE lower(fts.content) LIKE '%' || lower(?) || '%'
            ${sourceFilter ? 'AND docs.source = ?' : ''}
            LIMIT ?`;
          const params = sourceFilter ? [q, q, sourceFilter, limit] : [q, q, limit];
          const rows = dbh.prepare(baseSql).all(...params);
          // Facet counts by source
          const facetSql = `SELECT docs.source as source, COUNT(*) as count
                            FROM fts JOIN docs ON docs.id = fts.rowid
                            WHERE lower(fts.content) LIKE '%' || lower(?) || '%'
                            GROUP BY docs.source`;
          const facets = Object.fromEntries(dbh.prepare(facetSql).all(q).map(r => [r.source, r.count]));
          res.json({ ok: true, total: rows.length, facets, results: rows });
          return;
        } else {
          const baseSql = `
            SELECT docs.path, docs.source, docs.title,
                   snippet(fts, 2, '<mark>', '</mark>', ' … ', 10) AS snippet,
                   bm25(fts, 1.2, 0.75) AS rank
            FROM fts JOIN docs ON docs.id = fts.rowid
            WHERE fts MATCH ?
            ${sourceFilter ? 'AND docs.source = ?' : ''}
            ORDER BY rank ASC
            LIMIT ?`;
          const params = sourceFilter ? [q, sourceFilter, limit] : [q, limit];
          let rows = dbh.prepare(baseSql).all(...params);
          // If FTS yields zero, try a LIKE-based fallback automatically
          if (!rows || rows.length === 0) {
            const likeSql = `
              SELECT docs.path, docs.source, docs.title,
                     substr(fts.content, max(1, instr(lower(fts.content), lower(?)) - 80), 240) AS snippet,
                     0 AS rank
              FROM fts JOIN docs ON docs.id = fts.rowid
              WHERE lower(fts.content) LIKE '%' || lower(?) || '%'
              ${sourceFilter ? 'AND docs.source = ?' : ''}
              LIMIT ?`;
            const likeParams = sourceFilter ? [q, q, sourceFilter, limit] : [q, q, limit];
            rows = dbh.prepare(likeSql).all(...likeParams);
          }
          // Facet counts by source (prefer FTS facet; fall back to LIKE facet if needed)
          let facetsRows = dbh.prepare(`SELECT docs.source as source, COUNT(*) as count
                                         FROM fts JOIN docs ON docs.id = fts.rowid
                                         WHERE fts MATCH ?
                                         GROUP BY docs.source`).all(q);
          if (!facetsRows || facetsRows.length === 0) {
            facetsRows = dbh.prepare(`SELECT docs.source as source, COUNT(*) as count
                                       FROM fts JOIN docs ON docs.id = fts.rowid
                                       WHERE lower(fts.content) LIKE '%' || lower(?) || '%'
                                       GROUP BY docs.source`).all(q);
          }
          const facets = Object.fromEntries((facetsRows || []).map(r => [r.source, r.count]));
          res.json({ ok: true, total: rows.length, facets, results: rows });
          return;
        }
      }

      // Fallback: in-memory scan and score
      await ensureIndexed();
      const qTerms = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
      const candidates = [];
      for (const [absPath, meta] of fileIndex) {
        if (sourceFilter && meta.source !== sourceFilter) continue;
        const nameLower = path.basename(absPath).toLowerCase();
        let quick = 0; for (const t of qTerms) if (nameLower.includes(t)) { quick++; }
        candidates.push({ absPath, meta });
        if (candidates.length >= 2000) break;
      }
      const scored = [];
      for (const c of candidates) {
        const data = await extractTextFromFile(c.absPath);
        if (!data || !data.text) continue;
        const score = scoreDoc(data.text, qTerms);
        if (score <= 0) continue;
        const snippet = makeSnippet(data.text, qTerms);
        scored.push({ path: c.absPath, source: c.meta.source, title: data.title, snippet, score });
        if (scored.length >= 200) break;
      }
      scored.sort((a, b) => b.score - a.score);
      res.json({ ok: true, total: scored.length, results: scored.slice(0, limit) });
    } catch (e) {
      console.error('[legal:search]', e);
      res.status(500).json({ error: 'Arama hatası' });
    }
  });

  // Debug: list indexed docs (paths) - safe read-only
  app.get('/legal/list', async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(500, Number(req.query.limit || 100)));
      const dbh = await ensureDb();
      if (dbh) {
        const rows = dbh.prepare('SELECT path, source, title, mtimeMs, size FROM docs ORDER BY mtimeMs DESC LIMIT ?').all(limit);
        return res.json({ ok: true, total: rows.length, results: rows });
      }
      await ensureIndexed();
      const rows = [];
      let i = 0;
      for (const [p, meta] of fileIndex) { rows.push({ path: p, source: meta.source, size: meta.size, mtimeMs: meta.mtimeMs }); if (++i >= limit) break; }
      res.json({ ok: true, total: rows.length, results: rows });
    } catch (e) {
      res.status(500).json({ ok: false, error: 'list error' });
    }
  });

  app.get('/legal/doc', async (req, res) => {
    try {
      const p = (req.query.path || '').toString();
      if (!p) return res.status(400).json({ error: 'path param gerekli' });
      const abs = path.resolve(p);
      // Try Meili first
      if (ENABLE_MEILI) {
        const meiliClient = await ensureMeili();
        if (meiliClient) {
          try {
            const index = await meiliClient.getIndex(meiliIndexName);
            const doc = await index.getDocument(abs);
            if (doc) return res.json({ ok: true, path: doc.path, source: doc.source, title: doc.title, text: doc.content });
          } catch {}
        }
      }
      const dbh = await ensureDb();
      if (dbh) {
        const row = dbh.prepare('SELECT docs.path, docs.source, docs.title, fts.content as text FROM fts JOIN docs ON docs.id = fts.rowid WHERE docs.path = ?').get(abs);
        if (!row) return res.status(404).json({ error: 'Belge dizinde yok' });
        return res.json({ ok: true, path: row.path, source: row.source, title: row.title, text: row.text });
      }
      if (!fileIndex.has(abs)) return res.status(404).json({ error: 'Belge dizinde yok' });
      const data = await extractTextFromFile(abs);
      if (!data) return res.status(500).json({ error: 'Belge okunamadı' });
      res.json({ ok: true, path: abs, title: data.title, text: data.text });
    } catch (e) {
      res.status(500).json({ error: 'Belge hatası' });
    }
  });

  // Index status & control endpoints
  app.get('/legal/index-status', async (req, res) => {
    try {
      const dbh = await ensureDb();
      let counts = { docs: 0, fts: 0 };
      if (dbh) {
        counts.docs = dbh.prepare('SELECT COUNT(*) as c FROM docs').get().c;
        counts.fts = dbh.prepare('SELECT COUNT(*) as c FROM fts').get().c;
      }
      res.json({ ok: true, enableFts: ENABLE_FTS, enableOcr: ENABLE_OCR, enableMeili: ENABLE_MEILI, counts, indexState });
    } catch (e) {
      res.status(500).json({ ok: false, error: 'status error' });
    }
  });
  app.post('/legal/reindex', async (req, res) => {
    try {
      const force = String(req.query.force || req.body?.force || '0') === '1';
      const out = await runFullIndex(!!force);
      if (out?.ok === false && out.reason === 'already-running') {
        return res.status(202).json({ ok: true, message: 'Zaten çalışıyor', indexState });
      }
      res.json({ ok: true, started: true, indexState });
    } catch (e) {
      res.status(500).json({ ok: false, error: 'reindex error' });
    }
  });

  // Minimal HTML page to try search quickly (in case Panel src unavailable)
  app.get('/legal', (req, res) => {
    const html = `<!doctype html>
      <html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Mevzuat ve İçtihat Arama</title>
      <style>
        :root{--muted:#6b7280;--pri:#2563eb}
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;max-width:1200px;margin:20px auto;padding:0 16px}
        input,button,select{font-size:16px}
        .layout{display:grid;grid-template-columns:280px 1fr;gap:16px}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:10px 0}
        .path{color:var(--muted);font-size:12px}
        .row{display:flex;gap:8px;align-items:center;margin:8px 0}
        .facet{font-size:14px;color:var(--muted)}
        mark{background:#fde68a}
        .results{max-height:60vh;overflow:auto}
        .detail pre{white-space:pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
      </style>
      </head><body>
      <h1>Mevzuat ve İçtihat Arama</h1>
      <div class="row">
        <input id="q" placeholder="Arama terimleri" style="flex:1"/>
        <select id="src"><option value="">Tümü</option><option value="mevzuat">Mevzuat</option><option value="yargi">Yargı</option></select>
        <button id="btn">Ara</button>
      </div>
      <div class="layout">
        <aside>
          <div class="card">
            <div><strong>Filtreler</strong></div>
            <div class="facet" id="facets">—</div>
            <div class="row"><button id="reindex">Yeniden İndeksle</button><span id="idxState" class="facet"></span></div>
          </div>
        </aside>
        <main>
          <div id="summary" class="facet"></div>
          <div id="results" class="results"></div>
          <div id="detail" class="card detail" style="display:none"></div>
        </main>
      </div>
  <script>
        const q = document.getElementById('q');
        const src = document.getElementById('src');
        const btn = document.getElementById('btn');
        const results = document.getElementById('results');
        const summary = document.getElementById('summary');
        const detail = document.getElementById('detail');
        const facetsEl = document.getElementById('facets');
        const reindexBtn = document.getElementById('reindex');
        const idxState = document.getElementById('idxState');

        async function refreshStatus(){
          try{
            const r = await fetch('/legal/index-status'); const j = await r.json();
            if(j.ok){ idxState.textContent = j.indexState.running ? 'İndeksleniyor… ' + j.indexState.indexed + '/' + j.indexState.total : 'Hazır'; }
          }catch{}
        }
        setInterval(refreshStatus, 2000); refreshStatus();

        function renderFacets(f){
          if(!f){ facetsEl.textContent='—'; return; }
          const m = ['mevzuat','yargi'].map(function(k){ return {k:k, count:(f[k]||0)}; });
          facetsEl.innerHTML = m.map(function(x){ return x.k+': <strong>'+x.count+'</strong>'; }).join('<br/>' );
        }
        function clearDetail(){ detail.style.display='none'; detail.innerHTML=''; }
        async function showDetail(p){
          const r = await fetch('/legal/doc?path='+encodeURIComponent(p));
          const j = await r.json(); if(!j.ok){ alert('Belge alınamadı'); return; }
          detail.style.display='block';
          const esc = (s)=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
          detail.innerHTML = '<div class=path>'+(j.source||'')+' • '+j.path+'</div>'+
                              '<h3>'+esc(j.title||'Belge')+'</h3>'+
                              '<pre>'+esc(j.text||'')+'</pre>';
          detail.scrollIntoView({behavior:'smooth'});
        }
        async function search(){
          clearDetail(); results.innerHTML = 'Aranıyor…';
          const params = new URLSearchParams({ q: q.value }); if(src.value) params.set('source', src.value);
          const r = await fetch('/legal/search?'+params.toString());
          const j = await r.json(); if(!j.ok){ results.textContent='Hata'; return; }
          summary.textContent = j.total + ' sonuç';
          renderFacets(j.facets);
          results.innerHTML = j.results.map(function(r){
            return '<div class=card>'+
              '<div class=path>'+r.source+' • '+r.path+'</div>'+
              '<div><strong>'+(r.title||'')+'</strong></div>'+
              '<div>'+(r.snippet||'')+'</div>'+
              '<div class=facet><a href="#" data-p="'+r.path+'">Detayı aç</a></div>'+
            '</div>';
          }).join('');
          Array.from(results.querySelectorAll('a[data-p]')).forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); showDetail(a.dataset.p); }); });
        }
        btn.addEventListener('click', (e)=>{e.preventDefault(); search();});
        q.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); search(); }});
        reindexBtn.addEventListener('click', async ()=>{ await fetch('/legal/reindex', {method:'POST'}); refreshStatus(); });
      </script>
      </body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // File upload for UDF convert
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024, files: 6 }, // 15 MB per file, max 6 files
  });
  app.post('/api/convert-udf', upload.single('file'), async (req, res) => {
    try {
      const filename = req.file?.originalname || 'uploaded';
      const lower = filename.toLowerCase();
      if (!lower.endsWith('.docx') && !lower.endsWith('.pdf')) {
        return res.status(415).json({ error: 'Only .docx or .pdf supported' });
      }
      const tmp = await import('os').then(m => m.tmpdir());
      const fs = await import('fs');
      const inPath = path.join(tmp, `${Date.now()}_${filename}`);
      const outPath = inPath.replace(/\.(docx|pdf)$/i, '.udf');
      fs.writeFileSync(inPath, req.file.buffer);
      const py = getPythonPath();
      const cli = path.join(udfDir, 'udf_cli.py');
      const args = [cli, '--in', inPath, '--out', outPath];
      const p = spawn(py, args, { cwd: udfDir });
      let stderr = '';
      p.stderr.on('data', d => stderr += d.toString());
      p.on('close', (code) => {
        try {
          if (code !== 0) {
            console.error('udf_cli failed', code, stderr);
            return res.status(500).json({ error: 'Conversion failed', detail: stderr });
          }
          const stat = fs.statSync(outPath);
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outPath)}"`);
          fs.createReadStream(outPath).pipe(res).on('close', () => {
            try { fs.unlinkSync(inPath); fs.unlinkSync(outPath); } catch {}
          });
        } catch (e) {
          return res.status(500).json({ error: 'Read failed' });
        }
      });
    } catch (e) {
      res.status(500).json({ error: 'Unexpected error' });
    }
  });

  // Notebook LLM: accepts multiple files (+ any field name) + text + instruction
  // Use .any() so we don't depend on a specific multipart field name like 'files' vs 'file'
  const uploadAny = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024, files: 6 },
  });
  app.post('/ai/notebookllm', aiLimiter, uploadAny.any(), async (req, res) => {
    try {
      // Accept common aliases from the client for robustness
      const instruction = (
        req.body?.instruction ||
        req.body?.prompt ||
        req.body?.talimat ||
        req.body?.query ||
        ''
      ).toString();
      let text = (
        req.body?.text ||
        req.body?.content ||
        req.body?.metin ||
        req.body?.body ||
        ''
      ).toString();
      const files = Array.isArray(req.files) ? req.files : [];

      // Also support base64 file payloads when sent as text fields (optional)
      // e.g. fileBase64 or file[] as base64 strings
      const maybeB64 = [];
      const pushIfB64 = (val) => {
        if (!val) return;
        const s = String(val);
        // detect basic base64 (data:...;base64,.... or raw base64)
        const m = s.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          maybeB64.push({ originalname: `upload.${m[1].split('/')[1] || 'bin'}`, buffer: Buffer.from(m[2], 'base64') });
        } else if (/^[A-Za-z0-9+/=\r\n]+$/.test(s) && s.length > 200) {
          try { maybeB64.push({ originalname: 'upload.bin', buffer: Buffer.from(s.replace(/\s+/g, ''), 'base64') }); } catch {}
        }
      };
      if (Array.isArray(req.body?.fileBase64)) req.body.fileBase64.forEach(pushIfB64);
      else pushIfB64(req.body?.fileBase64);
      if (Array.isArray(req.body?.files)) req.body.files.forEach(pushIfB64);

      // Extract text from uploaded files (pdf/doc/docx/txt)
      for (const f of [...files, ...maybeB64]) {
        const name = (f.originalname || '').toLowerCase();
        try {
          if (!f || !f.buffer || !f.buffer.length) continue; // skip empty
          if (name.endsWith('.pdf')) {
            // Import the core file to avoid test-path lookups in some environments
            const mod = await import('pdf-parse/lib/pdf-parse.js').catch(async () => (await import('pdf-parse')));
            const pdfParse = (mod.default || mod);
            const parsed = await pdfParse(f.buffer);
            text += `\n\n---[${f.originalname}]---\n` + (parsed.text || '');
          } else if (name.endsWith('.docx')) {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer: f.buffer });
            text += `\n\n---[${f.originalname}]---\n` + (result.value || '');
          } else if (name.endsWith('.doc')) {
            // Legacy .doc is tricky; we skip or add a note.
            text += `\n\n---[${f.originalname}]---\n( .doc metin çıkarma desteklenmiyor )`;
          } else if (name.endsWith('.txt')) {
            text += `\n\n---[${f.originalname}]---\n` + f.buffer.toString('utf8');
          } else {
            // Unknown extension: best-effort UTF-8 decode
            text += `\n\n---[${f.originalname || 'dosya'}]---\n` + f.buffer.toString('utf8');
          }
        } catch (e) {
          console.warn('[ai:notebookllm:extract]', f.originalname, e);
        }
      }

      // Cap total content length to protect model and runtime
      const MAX_CHARS = 200_000; // ~200k chars cap
      if (text && text.length > MAX_CHARS) {
        text = text.slice(0, MAX_CHARS) + `\n\n[Not: içerik ${text.length - MAX_CHARS} karakter nedeniyle kesildi]`;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback summary when no API key is set
        const feedback = [
          `Talimat: ${instruction || '—'}`,
          `Metin uzunluğu: ${text ? text.length : 0}`,
          `Gemini API anahtarı ayarlı değil. Lütfen server/.env içinde GEMINI_API_KEY değerini girin.`
        ].join('\n');
        return res.json({ ok: true, result: feedback });
      }

      // If no usable content gathered, return helpful guidance instead of calling the model
      if (!text || !text.trim()) {
        return res.status(400).json({ ok: false, error: 'İşlenecek içerik bulunamadı. Lütfen PDF/DOCX/TXT dosyası yükleyin veya metin girin.' });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Choose a capable text model (adjust as needed)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = [
        'Aşağıdaki talimata göre sağlanan içeriği işle. Türkçe ve doğrudan yanıtla.',
        'Boş içerik uyarıları veya "üzgünüm" gibi ifadeler kullanma; elindeki metin üzerinden en iyi sonucu üret.',
        '',
        `Talimat: ${instruction || '—'}`,
        '',
        'İçerik:',
        text || '(içerik yok)'
      ].join('\n');

      const resp = await model.generateContent(prompt);
      const out = resp.response?.text?.() || resp.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      res.json({ ok: true, result: out || '(boş çıktı)' });
    } catch (e) {
      console.error('[ai:notebookllm]', e);
      res.status(500).json({ ok: false, error: 'NotebookLLM işleminde hata oluştu.' });
    }
  });

  const ENABLE_VITE = process.env.ENABLE_VITE !== '0';
  if (ENABLE_VITE) {
    // Vite in middleware mode for React panel
    const vite = await createViteServer({
      root: panelDir,
      base: '/',
      server: {
        middlewareMode: true,
        hmr: { port: 0 }, // pick a free random port to avoid 24678 collisions
        host: process.env.HOST || '0.0.0.0',
      },
      css: { postcss: path.join(panelDir, 'postcss.config.cjs') },
    });
    // Only forward non-API routes to Vite (so /wa, /api, /health return JSON and are not shadowed)
    app.use((req, res, next) => {
      const url = req.url || '';
      if (url.startsWith('/wa') || url.startsWith('/api') || url === '/health') {
        return next();
      }
      res.setHeader('Cache-Control', 'no-store');
      return vite.middlewares(req, res, next);
    });
  } else {
    // Serve built static assets from Panel/dist with SPA fallback
    const distDir = path.join(panelDir, 'dist');
    if (fs.existsSync(distDir)) {
      app.use((req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/wa') || url.startsWith('/api') || url === '/health') return next();
        return next();
      });
      app.use(express.static(distDir, { index: false, extensions: ['html'] }));
      app.get('*', (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/wa') || url.startsWith('/api') || url === '/health') return next();
        res.sendFile(path.join(distDir, 'index.html'));
      });
      console.log('[static] Serving Panel from', distDir);
    } else {
      app.get('/', (req, res) => res.send('<html><body><h1>Panel build not found</h1><p>Please run "npm run build" in Panel folder or enable Vite (ENABLE_VITE=1).</p></body></html>'));
    }
  }

  const HOST = process.env.HOST || '0.0.0.0'; // default to IPv4 all interfaces
  const server = app.listen(PORT, HOST, () => {
    const addr = server.address();
    console.log(`One-port dev server on http://${HOST}:${PORT}`);
    console.log('[server:address]', addr);
    // Optionally open default browser on startup
    if (process.env.OPEN_BROWSER === '1') {
      try {
        const urlToOpen = `http://${HOST}:${PORT}`;
        const args = process.platform === 'win32'
          ? ['cmd', ['/c', 'start', '', urlToOpen]]
          : process.platform === 'darwin'
            ? ['open', [urlToOpen]]
            : ['xdg-open', [urlToOpen]];
        const proc = spawn(args[0], args[1], { stdio: 'ignore', detached: true });
        proc.unref();
      } catch (e) {
        console.warn('[open-browser] failed:', e?.message || e);
      }
    }
    // Self-ping to verify loopback connectivity
    (async () => {
      try {
        const http = await import('node:http');
        // Prefer HOST for self-ping when it's a loopback hostname; fallback to 127.0.0.1
        const loopHost = (HOST === 'localhost' || HOST === '127.0.0.1') ? HOST : '127.0.0.1';
        const url = `http://${loopHost}:${PORT}/health`;
        const req = http.get(url, (r) => {
          let data = '';
          r.on('data', (c) => (data += c));
          r.on('end', () => {
            console.log('[self-ping] status', r.statusCode, 'body', data);
          });
        });
        req.on('error', (e) => console.error('[self-ping:error]', e.message));
      } catch (e) {
        console.error('[self-ping:init-error]', e);
      }
    })();
  });

  // Extra visibility to catch unexpected shutdowns/errors
  server.on('error', (err) => {
    console.error('[server:error]', err);
  });
  server.on('close', () => {
    console.warn('[server:close] HTTP server closed.');
  });

  process.on('uncaughtException', (err) => {
    console.error('[process:uncaughtException]', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[process:unhandledRejection]', reason);
  });
  // Log common termination signals and exit codes
  const sigs = ['SIGINT', 'SIGTERM'];
  if (process.platform !== 'win32') sigs.push('SIGHUP');
  sigs.forEach(sig => {
    try { process.on(sig, () => { console.warn(`[process:signal] ${sig} received, shutting down...`); try { server.close(()=>process.exit(0)); } catch {} setTimeout(()=>process.exit(0), 500).unref(); }); } catch {}
  });
  process.on('exit', (code) => { console.warn('[process:exit] code', code); });

  // Heartbeat to keep event loop active and provide liveness signal in logs
  setInterval(() => {
    try {
      console.debug('[heartbeat] alive');
    } catch {}
  }, 5000);
}

start().catch((e) => {
  console.error('[start:error]', e);
});
