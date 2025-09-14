import express from 'express';
import qrcode from 'qrcode';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const app = express();
const port = process.env.PORT || 8020;

let client = null;
let lastQr = null;
let status = 'disconnected';

function ensureClient() {
  if (client) return client;
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'panel-wa' }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });
  status = 'connecting';

  client.on('qr', async (qr) => {
    try {
      lastQr = await qrcode.toDataURL(qr);
      status = 'qr';
    } catch (e) {
      console.error('QR encoding error', e);
    }
  });
  client.on('ready', () => {
    status = 'ready';
    lastQr = null;
    console.log('WhatsApp ready');
  });
  client.on('authenticated', () => {
    status = 'connecting';
  });
  client.on('disconnected', (reason) => {
    console.warn('WhatsApp disconnected', reason);
    status = 'disconnected';
    lastQr = null;
  });

  client.initialize().catch(err => {
    console.error('WA init error', err);
    status = 'disconnected';
  });
  return client;
}

app.get('/wa/status', (req, res) => {
  res.json({ status });
});

app.get('/wa/qr', async (req, res) => {
  ensureClient();
  if (!lastQr) {
    return res.json({ qr: null, status });
  }
  return res.json({ qr: lastQr, status });
});

app.post('/wa/logout', async (req, res) => {
  try {
    if (client) {
      await client.logout();
      await client.destroy();
      client = null;
    }
  } catch {}
  status = 'disconnected';
  lastQr = null;
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`WhatsApp service listening on ${port}`);
});
