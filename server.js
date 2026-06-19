/* NSE V17 Mobile Easy GitHub Version - single server file */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ALERT_SECRET = process.env.ALERT_SECRET || 'change-me';
const DATA_FILE = path.join(__dirname, 'signals.json');
const DASHBOARD_HTML = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\" />\n<title>NSE V17 TradingView Alert Bridge</title>\n<link rel=\"manifest\" href=\"/manifest.json\" />\n<style>\n:root{--bg:#f5efe6;--surface:#fffdf8;--card:#fff;--ink:#211514;--muted:#756860;--maroon:#681b29;--maroon2:#8a2c3f;--gold:#c79b43;--green:#12633a;--red:#a93131;--amber:#9a6415;--line:rgba(104,27,41,.13);--shadow:0 10px 24px rgba(60,28,19,.11);--radius:18px}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;background:linear-gradient(180deg,#fffaf1 0%,#f5efe6 55%,#f7f2ea 100%);color:var(--ink)}body{min-height:100vh;padding:0 10px 18px}.app{max-width:520px;margin:0 auto}.topbar{position:sticky;top:0;z-index:10;margin:0 -10px 8px;padding:8px 10px;background:rgba(255,250,242,.96);backdrop-filter:blur(18px);border-bottom:1px solid rgba(104,27,41,.08)}.hero{height:82px;border-radius:0 0 24px 24px;background:linear-gradient(135deg,var(--maroon2),var(--maroon) 58%,#351014);box-shadow:0 10px 26px rgba(104,27,41,.22);padding:12px;color:#fff;position:relative;overflow:hidden}.hero:before{content:\"LIVE\";position:absolute;right:-9px;top:-10px;font-size:58px;font-weight:950;color:rgba(255,255,255,.055);letter-spacing:-2px}.hero h1{font-size:16px;line-height:1.05;margin:0 0 5px;font-weight:950}.hero p{font-size:10.8px;line-height:1.28;margin:0;color:#f4dfbd}.badgeLine{display:flex;gap:5px;margin-top:8px}.badge{font-size:9.5px;line-height:1;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.17);color:#ffe9bb;font-weight:850}.card{background:rgba(255,253,248,.97);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:var(--radius);padding:11px;margin:9px 0}.card h2{font-size:13px;margin:0 0 9px;color:#381a17;display:flex;align-items:center;gap:7px}.dot{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(199,155,67,.14)}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px}.field label{display:block;margin:0 0 4px;font-size:9.5px;font-weight:950;color:var(--muted);text-transform:uppercase;letter-spacing:.35px}.field input,.field textarea,.field select{width:100%;border:1px solid rgba(104,27,41,.15);background:#fff;border-radius:13px;padding:9px;font-size:13px;color:var(--ink);outline:none}.field textarea{min-height:82px;resize:vertical}.btnRow{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.btn{border:0;border-radius:13px;padding:10px 8px;font-weight:950;font-size:12.5px;cursor:pointer;box-shadow:0 7px 15px rgba(104,27,41,.10);min-height:39px}.btnPrimary{background:linear-gradient(135deg,var(--maroon2),var(--maroon));color:#fff}.btnGold{background:linear-gradient(135deg,#e8c878,#b58124);color:#3d1f0f}.btnGhost{background:#fff;color:var(--maroon);border:1px solid rgba(104,27,41,.16)}.btnDanger{background:#fff3f0;color:var(--red);border:1px solid rgba(169,49,49,.16)}.status{border-radius:16px;padding:11px;border:1px solid rgba(104,27,41,.10);background:#f7efe8;text-align:center}.status.green{background:#eaf8ee;color:var(--green);border-color:rgba(18,99,58,.22)}.status.red{background:#fff0ef;color:var(--red);border-color:rgba(169,49,49,.22)}.status.amber{background:#fff7e5;color:var(--amber);border-color:rgba(154,100,21,.22)}.status b{display:block;font-size:16px}.status span{font-size:11px;font-weight:800}.signal{border-radius:17px;border:1px solid rgba(104,27,41,.11);background:#fff;padding:11px;margin:8px 0;box-shadow:0 8px 18px rgba(61,26,18,.07)}.signalTop{display:flex;justify-content:space-between;gap:8px}.symbol{font-size:17px;font-weight:950;color:var(--maroon)}.action{font-size:12px;font-weight:950;border-radius:999px;padding:5px 8px}.action.green{background:#eaf8ee;color:var(--green)}.action.red{background:#fff0ef;color:var(--red)}.action.amber{background:#fff7e5;color:var(--amber)}.meta{font-size:10.5px;color:var(--muted);line-height:1.35;margin-top:2px}.levels{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px}.level{background:#fbf5ed;border:1px solid rgba(104,27,41,.08);border-radius:12px;padding:6px 4px;text-align:center}.level .lab{font-size:8px;color:var(--muted);text-transform:uppercase;font-weight:950}.level .val{font-size:10.8px;font-weight:950;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.reason{font-size:11px;line-height:1.35;color:#493a33;background:#fffaf2;border:1px solid rgba(104,27,41,.08);border-radius:12px;padding:8px;margin-top:8px}.alarmPanel{display:grid;grid-template-columns:1fr 1fr;gap:7px}.bigAlarm{position:fixed;inset:0;background:rgba(104,27,41,.92);z-index:80;color:#fff;display:none;align-items:center;justify-content:center;text-align:center;padding:22px}.bigAlarm.show{display:flex}.bigAlarmBox{max-width:360px}.bigAlarmBox h3{font-size:28px;margin:0 0 8px}.bigAlarmBox p{font-size:14px;line-height:1.45;color:#ffe9bb}.toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(24px);opacity:0;z-index:90;background:#261615;color:#fff;padding:10px 13px;border-radius:15px;font-size:12.5px;font-weight:900;box-shadow:0 12px 28px rgba(0,0,0,.26);transition:.22s}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.small{font-size:10.6px;color:var(--muted);line-height:1.4}.code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;line-height:1.35;white-space:pre-wrap;word-break:break-word;background:#231817;color:#ffe9bb;border-radius:14px;padding:9px;border:1px solid rgba(255,255,255,.08)}.footer{font-size:10.5px;color:var(--muted);text-align:center;line-height:1.4;margin:14px 4px}.blink{animation:blink .8s linear infinite}@keyframes blink{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}\n</style>\n</head>\n<body>\n<div class=\"app\">\n  <div class=\"topbar\"><div class=\"hero\"><h1>NSE Mobile Swing Scanner</h1><p>V17 TradingView Alert Bridge \u00b7 Online live signal receiver</p><div class=\"badgeLine\"><span class=\"badge\">Webhook</span><span class=\"badge\">Loud Alarm</span><span class=\"badge\">Manual Order</span></div></div></div>\n\n  <div class=\"card\">\n    <h2><span class=\"dot\"></span>Live connection</h2>\n    <div id=\"conn\" class=\"status amber\"><b>Connecting...</b><span>Keep this page open for loud alarm.</span></div>\n    <div class=\"alarmPanel\" style=\"margin-top:9px\">\n      <button class=\"btn btnPrimary\" onclick=\"enableAlarm()\">Enable Loud Alarm</button>\n      <button class=\"btn btnGhost\" onclick=\"requestNotify()\">Enable Notification</button>\n      <button class=\"btn btnGold\" onclick=\"testAlarm()\">Test Alarm</button>\n      <button class=\"btn btnDanger\" onclick=\"ackAlarm()\">Stop Alarm</button>\n    </div>\n    <p class=\"small\">Browser sound requires one tap on \u201cEnable Loud Alarm\u201d. Phone vibration works on supported Android browsers.</p>\n  </div>\n\n  <div class=\"card\">\n    <h2><span class=\"dot\"></span>TradingView webhook setup</h2>\n    <div class=\"field\"><label>Webhook URL</label><input id=\"webhookUrl\" readonly /></div>\n    <div class=\"btnRow\"><button class=\"btn btnGhost\" onclick=\"copyWebhook()\">Copy Webhook URL</button><button class=\"btn btnPrimary\" onclick=\"copyTemplate()\">Copy Alert Message</button></div>\n    <p class=\"small\">Create a TradingView alert on your stock chart. Paste the webhook URL and paste the alert message template below.</p>\n    <div id=\"template\" class=\"code\"></div>\n  </div>\n\n  <div class=\"card\">\n    <h2><span class=\"dot\"></span>Alert message generator</h2>\n    <div class=\"grid2\">\n      <div class=\"field\"><label>Symbol</label><input id=\"symbol\" placeholder=\"RELIANCE\" value=\"{{ticker}}\" /></div>\n      <div class=\"field\"><label>Event</label><select id=\"event\"><option>ENTRY</option><option>TARGET</option><option>STOP_LOSS</option></select></div>\n      <div class=\"field\"><label>Entry</label><input id=\"entry\" type=\"number\" step=\"0.05\" placeholder=\"1435\" /></div>\n      <div class=\"field\"><label>No Chase</label><input id=\"noChase\" type=\"number\" step=\"0.05\" placeholder=\"1460\" /></div>\n      <div class=\"field\"><label>Stop Loss</label><input id=\"sl\" type=\"number\" step=\"0.05\" placeholder=\"1405\" /></div>\n      <div class=\"field\"><label>Target</label><input id=\"target\" type=\"number\" step=\"0.05\" placeholder=\"1485\" /></div>\n    </div>\n    <div class=\"btnRow\"><button class=\"btn btnGold\" onclick=\"generateTemplate()\">Generate Template</button><button class=\"btn btnGhost\" onclick=\"sendDemo()\">Send Demo Alert</button></div>\n  </div>\n\n  <div class=\"card\">\n    <h2><span class=\"dot\"></span>Live signals</h2>\n    <div id=\"signals\"><div class=\"small\">No signal received yet.</div></div>\n    <div class=\"btnRow\"><button class=\"btn btnGhost\" onclick=\"loadSignals()\">Refresh</button><button class=\"btn btnDanger\" onclick=\"clearSignals()\">Clear Signals</button></div>\n  </div>\n\n  <div class=\"card\">\n    <h2><span class=\"dot\"></span>Phone-call type alert</h2>\n    <p class=\"small\">The dashboard gives a loud alarm. Actual phone call needs Twilio credentials on server: <b>TWILIO_ACCOUNT_SID</b>, <b>TWILIO_AUTH_TOKEN</b>, <b>TWILIO_FROM_NUMBER</b>, <b>ALERT_PHONE_NUMBER</b>, and <b>ENABLE_PHONE_CALL=true</b>.</p>\n  </div>\n\n  <div class=\"footer\">This tool receives signals only. It does not place orders. Always verify market mood, risk, and order details manually.</div>\n</div>\n\n<div id=\"bigAlarm\" class=\"bigAlarm\"><div class=\"bigAlarmBox\"><h3 id=\"alarmTitle\">LIVE ALERT</h3><p id=\"alarmText\">TradingView signal received.</p><button class=\"btn btnGold\" onclick=\"ackAlarm()\">Acknowledge / Stop Alarm</button></div></div>\n<div id=\"toast\" class=\"toast\"></div>\n\n<script>\nlet audioCtx=null, alarmTimer=null, alarmEnabled=false, notifyEnabled=false, lastSignalId=null;\nconst secret = localStorage.getItem('nseV17Secret') || 'change-me';\n\nfunction init(){\n  if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }\n  document.getElementById('webhookUrl').value = `${location.origin}/api/webhook/tradingview?secret=${encodeURIComponent(secret)}`;\n  generateTemplate();\n  connectEvents();\n  loadSignals();\n}\nfunction toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}\nfunction enableAlarm(){audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)(); alarmEnabled=true; beep(); toast('Loud alarm enabled');}\nfunction requestNotify(){ if(!('Notification' in window)){toast('Notifications not supported');return;} Notification.requestPermission().then(p=>{notifyEnabled=p==='granted';toast(notifyEnabled?'Notifications enabled':'Notification permission not granted')}); }\nfunction beep(){ if(!audioCtx) return; const o=audioCtx.createOscillator(); const g=audioCtx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.12; o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=>{o.stop();},260); }\nfunction startAlarm(signal){\n  document.getElementById('bigAlarm').classList.add('show');\n  document.getElementById('alarmTitle').textContent = signal.decision?.action || 'LIVE ALERT';\n  document.getElementById('alarmText').textContent = `${signal.symbol || ''} | Price: ${signal.price ?? '-'} | ${signal.decision?.reason || ''}`;\n  if(navigator.vibrate) navigator.vibrate([400,180,400,180,800]);\n  if(notifyEnabled && 'Notification' in window && Notification.permission==='granted') new Notification(`NSE Alert: ${signal.symbol}`, { body: `${signal.decision?.action || 'ALERT'} | Price ${signal.price ?? '-'}` });\n  if(alarmEnabled){ clearInterval(alarmTimer); beep(); alarmTimer=setInterval(()=>{beep(); if(navigator.vibrate) navigator.vibrate(250);}, 1200); }\n}\nfunction ackAlarm(){ clearInterval(alarmTimer); alarmTimer=null; document.getElementById('bigAlarm').classList.remove('show'); if(navigator.vibrate) navigator.vibrate(0); }\nfunction testAlarm(){startAlarm({symbol:'TEST',price:123.45,decision:{action:'TEST ALARM',reason:'Alarm test successful.'}})}\nfunction connStatus(tone,title,sub){const c=document.getElementById('conn');c.className='status '+tone;c.innerHTML=`<b>${title}</b><span>${sub}</span>`}\nfunction connectEvents(){\n  try{\n    const ev = new EventSource('/api/events');\n    ev.onopen=()=>connStatus('green','Connected','Waiting for TradingView alerts.');\n    ev.onerror=()=>connStatus('red','Disconnected','Reconnecting automatically...');\n    ev.onmessage=(msg)=>{ const data=JSON.parse(msg.data); if(data.type==='CONNECTED') return; if(data.type==='CLEAR'){loadSignals();return;} receiveSignal(data); };\n  }catch(e){ connStatus('red','Event stream failed','Use refresh button.'); }\n}\nfunction receiveSignal(signal){ if(signal.id && signal.id===lastSignalId) return; lastSignalId=signal.id; renderSignals([signal], true); startAlarm(signal); }\nasync function loadSignals(){ const r=await fetch('/api/signals'); const j=await r.json(); renderSignals(j.signals||[], false); }\nasync function clearSignals(){ await fetch('/api/clear',{method:'POST'}); document.getElementById('signals').innerHTML='<div class=\"small\">No signal received yet.</div>'; toast('Signals cleared'); }\nfunction cls(tone){return tone==='green'?'green':tone==='red'?'red':'amber'}\nfunction renderSignals(list, prepend){\n  const box=document.getElementById('signals'); if(!list.length && !prepend){ box.innerHTML='<div class=\"small\">No signal received yet.</div>'; return; }\n  const html=list.map(s=>signalHtml(s)).join('');\n  if(prepend && box.querySelector('.signal')) box.insertAdjacentHTML('afterbegin', html); else box.innerHTML=html;\n}\nfunction signalHtml(s){const tone=cls(s.decision?.tone);return `<div class=\"signal blink\"><div class=\"signalTop\"><div><div class=\"symbol\">${esc(s.symbol)}</div><div class=\"meta\">${esc(s.displayTime||'')} \u00b7 ${esc(s.source||'TradingView')} \u00b7 ${esc(s.event||'ALERT')}</div></div><div class=\"action ${tone}\">${esc(s.decision?.action||'ALERT')}</div></div><div class=\"levels\"><div class=\"level\"><div class=\"lab\">Price</div><div class=\"val\">${fmt(s.price)}</div></div><div class=\"level\"><div class=\"lab\">Entry</div><div class=\"val\">${fmt(s.entry)}</div></div><div class=\"level\"><div class=\"lab\">No Chase</div><div class=\"val\">${fmt(s.noChase)}</div></div><div class=\"level\"><div class=\"lab\">SL</div><div class=\"val\">${fmt(s.sl)}</div></div></div><div class=\"reason\"><b>Reason:</b> ${esc(s.decision?.reason||'Validate manually.')}<br><b>Manual action:</b> Open broker app, verify price and risk, then place order only if your V16 scanner also allows it.</div></div>`}\nfunction fmt(v){return v==null?'-':'\u20b9'+Number(v).toFixed(2)}\nfunction esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]))}\nfunction getTemplate(){\n  return JSON.stringify({\n    secret: secret,\n    source: 'TradingView',\n    symbol: document.getElementById('symbol').value || '{{ticker}}',\n    event: document.getElementById('event').value,\n    price: '{{close}}',\n    entry: val('entry'),\n    noChase: val('noChase'),\n    sl: val('sl'),\n    target: val('target')\n  }, null, 2);\n}\nfunction val(id){const v=document.getElementById(id).value; return v?Number(v):null}\nfunction generateTemplate(){document.getElementById('template').textContent=getTemplate();}\nasync function copyTemplate(){generateTemplate(); await navigator.clipboard.writeText(getTemplate()); toast('Alert message copied');}\nasync function copyWebhook(){await navigator.clipboard.writeText(document.getElementById('webhookUrl').value); toast('Webhook URL copied');}\nasync function sendDemo(){\n  const payload=JSON.parse(getTemplate().replace('{{close}}','123.45').replace('{{ticker}}','DEMO'));\n  await fetch('/api/webhook/tradingview?secret='+encodeURIComponent(secret),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});\n  toast('Demo alert sent');\n}\ninit();\n</script>\n</body>\n</html>\n";

app.use(cors());
app.use(express.json({ limit: '1mb', type: ['application/json', 'text/plain'] }));
app.use(express.text({ limit: '1mb', type: '*/*' }));
app.use(express.urlencoded({ extended: true }));

let clients = [];
let signals = loadSignals();

function loadSignals() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) { console.error('Failed to load signals:', err.message); }
  return [];
}
function saveSignals() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(signals.slice(0, 200), null, 2)); }
  catch (err) { console.error('Failed to save signals:', err.message); }
}
function nowIndia() { return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }); }
function clean(value) { return String(value || '').trim().replace(/[^A-Za-z0-9_:\-. ]/g, '').slice(0, 60); }
function num(value) { const n = parseFloat(String(value ?? '').replace(/,/g, '')); return Number.isFinite(n) ? n : null; }
function extractNumber(text) {
  if (!text) return null;
  const s = String(text);
  const m = s.match(/(?:price|ltp|close)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i) || s.match(/([0-9]+(?:\.[0-9]+)?)/);
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
function normalizePayload(req) {
  let body = req.body;
  if (typeof body === 'string') {
    const text = body.trim();
    try { body = JSON.parse(text); } catch (_) { body = { raw: text }; }
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
    symbol, event, price, entry, noChase, sl, target, source, decision, raw
  };
}
function broadcast(signal) {
  const payload = `data: ${JSON.stringify(signal)}\n\n`;
  clients.forEach(res => res.write(payload));
}
app.get('/', (req, res) => res.type('html').send(DASHBOARD_HTML));
app.get('/api/health', (req, res) => res.json({ ok: true, version: 'V17 TradingView Alert Bridge - Mobile Easy', time: nowIndia() }));
app.get('/api/signals', (req, res) => res.json({ signals: signals.slice(0, 50) }));
app.post('/api/clear', (req, res) => { signals = []; saveSignals(); broadcast({ type: 'CLEAR', displayTime: nowIndia() }); res.json({ ok: true }); });
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', displayTime: nowIndia() })}\n\n`);
  clients.push(res);
  req.on('close', () => { clients = clients.filter(c => c !== res); });
});
app.post(['/webhook','/api/webhook/tradingview'], async (req, res) => {
  const signal = normalizePayload(req);
  if (ALERT_SECRET !== 'change-me' && signal.secret !== ALERT_SECRET) return res.status(401).json({ ok: false, error: 'Invalid alert secret' });
  delete signal.secret;
  signals.unshift(signal);
  signals = signals.slice(0, 200);
  saveSignals();
  broadcast(signal);
  res.json({ ok: true, received: signal });
});
app.listen(PORT, () => console.log(`NSE V17 Alert Bridge running on port ${PORT}`));
