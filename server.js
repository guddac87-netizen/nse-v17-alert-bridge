/*
  NSE Mobile Swing Scanner V17 - TradingView Alert Bridge
  ------------------------------------------------------
  Purpose:
  - Receive TradingView webhook alerts online
  - Show live signal on mobile dashboard
  - Trigger loud browser alarm / vibration / notification
  - Optional Telegram alert
  - Optional Twilio phone-call alert

  IMPORTANT:
  - This bridge does NOT place orders.
  - Trading decision remains manual.
  - Use with your V16 scanner levels: Entry, No Chase, SL, Target.
*/

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ALERT_SECRET = process.env.ALERT_SECRET || 'change-me';
const DATA_FILE = path.join(__dirname, 'signals.json');

app.use(cors());
app.use(express.json({ limit: '1mb', type: ['application/json', 'text/plain'] }));
app.use(express.text({ limit: '1mb', type: '*/*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let clients = [];
let signals = loadSignals();

function loadSignals() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load signals:', err.message);
  }
  return [];
}

function saveSignals() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(signals.slice(0, 200), null, 2));
  } catch (err) {
    console.error('Failed to save signals:', err.message);
  }
}

function nowIndia() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
}

function normalizePayload(req) {
  let body = req.body;

  if (typeof body === 'string') {
    const text = body.trim();
    try {
      body = JSON.parse(text);
    } catch (_) {
      // Accept plain text alerts too.
      body = { raw: text };
    }
  }

  if (!body || typeof body !== 'object') body = {};

  const qSecret = req.query.secret || req.headers['x-alert-secret'];
  const incomingSecret = body.secret || qSecret || '';

  const symbol = clean(body.symbol || body.ticker || body.sym || extractSymbol(body.raw) || 'UNKNOWN');
  const event = clean(body.event || body.action || body.type || extractEvent(body.raw) || 'ALERT').toUpperCase();
  const price = num(body.price || body.ltp || body.close || extractNumber(body.raw));
  const entry = num(body.entry || body.entryAbove || body.entry_above);
  const noChase = num(body.noChase || body.no_chase || body.noChaseAbove || body.no_chase_above);
  const sl = num(body.sl || body.stopLoss || body.stop_loss);
  const target = num(body.target || body.target1 || body.t1);
  const source = clean(body.source || 'TradingView');
  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

  const decision = decide(event, price, entry, noChase, sl);

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    receivedAt: new Date().toISOString(),
    displayTime: nowIndia(),
    secret: incomingSecret,
    symbol,
    event,
    price,
    entry,
    noChase,
    sl,
    target,
    source,
    decision,
    raw
  };
}

function clean(value) {
  return String(value || '').trim().replace(/[^A-Za-z0-9_:\-. ]/g, '').slice(0, 60);
}

function num(value) {
  const n = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function extractNumber(text) {
  if (!text) return null;
  const m = String(text).match(/(?:price|ltp|close)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i) || String(text).match(/([0-9]+(?:\.[0-9]+)?)/);
  return m ? m[1] : null;
}

function extractSymbol(text) {
  if (!text) return null;
  const m = String(text).match(/(?:NSE:)?([A-Z0-9_]{2,20})/);
  return m ? m[1] : null;
}

function extractEvent(text) {
  if (!text) return null;
  const upper = String(text).toUpperCase();
  if (upper.includes('TARGET')) return 'TARGET';
  if (upper.includes('STOP') || upper.includes('SL')) return 'STOP_LOSS';
  if (upper.includes('ENTRY') || upper.includes('BUY')) return 'ENTRY';
  return 'ALERT';
}

function decide(event, price, entry, noChase, sl) {
  const ev = String(event || '').toUpperCase();
  if (ev.includes('STOP') || ev.includes('SL')) return { action: 'SETUP CANCELLED', tone: 'red', reason: 'Stop-loss alert received.' };
  if (ev.includes('TARGET')) return { action: 'TARGET ALERT', tone: 'green', reason: 'Target alert received. Review profit booking.' };
  if (price != null && sl != null && price <= sl) return { action: 'SETUP CANCELLED', tone: 'red', reason: 'Price is at or below stop-loss level.' };
  if (price != null && noChase != null && price > noChase) return { action: 'NO CHASE', tone: 'red', reason: 'Price is above the safe no-chase zone.' };
  if (price != null && entry != null && price >= entry) return { action: 'TRADE ALLOWED', tone: 'green', reason: 'Price is in the valid entry zone. Check market mood and risk before order.' };
  if (price != null && entry != null && price < entry) return { action: 'WAIT', tone: 'amber', reason: 'Price is still below entry level.' };
  return { action: 'LIVE ALERT', tone: 'amber', reason: 'TradingView alert received. Validate levels before action.' };
}

function broadcast(signal) {
  const payload = `data: ${JSON.stringify(signal)}\n\n`;
  clients.forEach(res => res.write(payload));
}

async function notifyTelegram(signal) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const text = `🚨 NSE V17 Alert\n${signal.symbol} | ${signal.decision.action}\nPrice: ${signal.price ?? '-'}\nEntry: ${signal.entry ?? '-'} | No Chase: ${signal.noChase ?? '-'} | SL: ${signal.sl ?? '-'}\n${signal.decision.reason}\n${signal.displayTime}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (err) {
    console.error('Telegram alert failed:', err.message);
  }
}

async function notifyTwilioCall(signal) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.ALERT_PHONE_NUMBER;
  const shouldCall = String(process.env.ENABLE_PHONE_CALL || '').toLowerCase() === 'true';
  if (!shouldCall || !sid || !auth || !from || !to) return;

  const message = `NSE alert. ${signal.symbol}. ${signal.decision.action}. Price ${signal.price || 'not available'}. Check your scanner before placing any order.`;
  const twiml = `<Response><Say voice="alice">${escapeXml(message)}</Say><Pause length="1"/><Say voice="alice">Repeat. ${escapeXml(message)}</Say></Response>`;

  try {
    const body = new URLSearchParams({ To: to, From: from, Twiml: twiml });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${auth}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    if (!res.ok) console.error('Twilio call failed:', res.status, await res.text());
  } catch (err) {
    console.error('Twilio call error:', err.message);
  }
}

function escapeXml(s) {
  return String(s).replace(/[<>&'\"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: 'V17 TradingView Alert Bridge', time: nowIndia() });
});

app.get('/api/signals', (req, res) => {
  res.json({ signals: signals.slice(0, 50) });
});

app.post('/api/clear', (req, res) => {
  signals = [];
  saveSignals();
  broadcast({ type: 'CLEAR', displayTime: nowIndia() });
  res.json({ ok: true });
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', displayTime: nowIndia() })}\n\n`);
  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

app.post('/api/webhook/tradingview', async (req, res) => {
  const signal = normalizePayload(req);

  if (ALERT_SECRET !== 'change-me' && signal.secret !== ALERT_SECRET) {
    return res.status(401).json({ ok: false, error: 'Invalid alert secret' });
  }

  delete signal.secret;
  signals.unshift(signal);
  signals = signals.slice(0, 200);
  saveSignals();
  broadcast(signal);

  // Loud dashboard alarm happens in browser. These are optional external alerts.
  notifyTelegram(signal);
  notifyTwilioCall(signal);

  res.json({ ok: true, received: signal });
});

app.listen(PORT, () => {
  console.log(`NSE V17 Alert Bridge running on http://localhost:${PORT}`);
});
