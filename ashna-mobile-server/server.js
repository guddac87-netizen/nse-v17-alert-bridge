const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 10000;
const ASHNA = 'https://api.ashna.ai/v1/api';

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0b1020"><title>Ashna AI Developer</title><style>
*{box-sizing:border-box}body{margin:0;background:#0b1020;color:#eef3ff;font:14px system-ui}.app{max-width:760px;margin:auto;padding:14px 14px 90px}.head{display:flex;gap:10px;align-items:center;margin:5px 0 14px}.logo{width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:grid;place-items:center;font-weight:900}.head h1{margin:0;font-size:18px}.muted{color:#95a3ba}.card{background:#121a2a;border:1px solid #26344c;border-radius:16px;padding:14px;margin:10px 0}.card h2{font-size:13px;margin:0 0 10px}.stack{display:grid;gap:9px}.row{display:flex;gap:8px;align-items:center}.grow{flex:1;min-width:0}.input,.select,.txt{width:100%;background:#09101c;color:#fff;border:1px solid #2d3c56;border-radius:11px;padding:11px}.txt{min-height:110px;resize:vertical}.btn{border:1px solid #34435e;background:#1a263a;color:#fff;border-radius:11px;padding:10px 12px;font-weight:700}.primary{background:linear-gradient(135deg,#7c3aed,#4f46e5);border-color:#7c3aed}.btn:disabled{opacity:.45}.drop{border:1px dashed #435271;border-radius:12px;padding:18px;text-align:center;background:#0b1422}.notice{padding:9px;border:1px solid #2a3a54;border-radius:10px;background:#101827;white-space:pre-wrap}.hidden{display:none!important}.preview{height:480px;border:1px solid #26344c;border-radius:12px;overflow:hidden;background:white}.preview iframe{width:100%;height:100%;border:0}.status{position:fixed;left:0;right:0;bottom:0;background:#0a101cdd;backdrop-filter:blur(12px);border-top:1px solid #26344c;padding:10px 14px}.status>div{max-width:760px;margin:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style></head><body>
<div class="app"><div class="head"><div class="logo">A</div><div><h1>Ashna AI Developer</h1><div class="muted">Upload → tell → build → preview → download</div></div></div>
<section class="card"><h2>1 · CONNECT</h2><div id="c1" class="stack"><input id="key" type="password" class="input" placeholder="Paste Ashna API key"><label class="muted"><input id="remember" type="checkbox" checked> Remember on this device</label><button id="connect" class="btn primary">Connect & Load Models</button></div><div id="c2" class="stack hidden"><div class="row"><div class="notice grow">✓ Connected</div><button id="change" class="btn">Change key</button></div><select id="model" class="select"></select></div></section>
<section class="card"><h2>2 · PROJECT</h2><div id="drop" class="drop"><b>Tap to choose HTML/code file</b><div class="muted">TTUM .html भी चुन सकते हो</div><input id="file" type="file" accept=".html,.htm,.js,.css,.txt,.json" hidden></div><div id="meta" class="notice hidden" style="margin-top:8px"></div><div class="row" style="margin-top:8px"><button id="blank" class="btn grow">＋ New Blank App</button><button id="undo" class="btn" disabled>Undo</button></div></section>
<section class="card"><h2>3 · TELL AI</h2><textarea id="task" class="txt" placeholder="क्या बनाना/बदलना है लिखो या mic दबाकर बोलो"></textarea><div class="row" style="margin-top:8px"><button id="mic" class="btn">🎤</button><button id="build" class="btn primary grow" disabled>▶ BUILD / MODIFY</button></div></section>
<section class="card"><h2>4 · RESULT</h2><div id="out" class="notice">Ready.</div><div class="row" style="margin-top:8px"><button id="refresh" class="btn">↻ Preview</button><button id="download" class="btn primary grow" disabled>Download Updated File</button></div><div class="preview" style="margin-top:8px"><iframe id="frame"></iframe></div></section></div>
<div class="status"><div id="status">Ready</div></div>
<script>
const $=x=>document.getElementById(x), S={key:'',name:'',original:'',current:'',before:''};
const E={key:$('key'),remember:$('remember'),connect:$('connect'),c1:$('c1'),c2:$('c2'),change:$('change'),model:$('model'),drop:$('drop'),file:$('file'),meta:$('meta'),blank:$('blank'),undo:$('undo'),task:$('task'),mic:$('mic'),build:$('build'),out:$('out'),frame:$('frame'),refresh:$('refresh'),download:$('download'),status:$('status')};
function st(t){E.status.textContent=t} function ui(){E.build.disabled=!(S.key&&S.current);E.undo.disabled=!S.before;E.download.disabled=!S.current;E.meta.classList.toggle('hidden',!S.current);if(S.current)E.meta.textContent=S.name+' · '+(new Blob([S.current]).size/1024).toFixed(1)+' KB'}
async function ask(path,opt={}){opt.headers={...(opt.headers||{}),Authorization:'Bearer '+S.key};const r=await fetch(path,opt);const t=await r.text();let j;try{j=JSON.parse(t)}catch{j={raw:t}}if(!r.ok)throw new Error(j?.error?.message||j?.message||('HTTP '+r.status));return j}
async function loadModels(){st('Loading models…');const j=await ask('/api/models');const a=(j.data||j.models||[]).map(x=>typeof x==='string'?x:(x.id||x.name)).filter(Boolean);if(!a.length)throw new Error('No models returned');E.model.innerHTML=[...new Set(a)].map(x=>'<option value="'+String(x).replace(/"/g,'&quot;')+'">'+x+'</option>').join('');st(a.length+' models loaded')}
E.connect.onclick=async()=>{const k=E.key.value.trim();if(!k)return alert('Ashna key paste करो');S.key=k;try{await loadModels();if(E.remember.checked)localStorage.setItem('ashna_key',k);else sessionStorage.setItem('ashna_key',k);E.c1.classList.add('hidden');E.c2.classList.remove('hidden');ui()}catch(e){S.key='';st('Connect failed: '+e.message);alert(e.message)}};
E.change.onclick=()=>{S.key='';localStorage.removeItem('ashna_key');sessionStorage.removeItem('ashna_key');E.c2.classList.add('hidden');E.c1.classList.remove('hidden');ui()};
E.drop.onclick=()=>E.file.click(); E.file.onchange=async()=>{const f=E.file.files[0];if(!f)return;const t=await f.text();S.name=f.name;S.original=t;S.current=t;S.before='';preview();ui();E.out.textContent='File loaded. अब task लिखो/बोलो.';st('Project loaded')};
E.blank.onclick=()=>{S.name='new_app.html';S.original='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New App</title></head><body><h1>New App</h1></body></html>';S.current=S.original;S.before='';preview();ui();st('Blank app ready')};
function extract(s){const f=String.fromCharCode(96).repeat(3),i=s.indexOf(f);if(i<0)return s.trim();const nl=s.indexOf('\n',i+3),start=nl>=0?nl+1:i+3,end=s.indexOf(f,start);return(end>=0?s.slice(start,end):s.slice(start)).trim()}
E.build.onclick=async()=>{const task=E.task.value.trim();if(!task)return alert('क्या बदलना है लिखो या बोलो');S.before=S.current;ui();E.build.disabled=true;st('AI working…');E.out.textContent='AI is reading and editing your file…';const sys='You are a senior coding engineer. Preserve all unrelated working behavior, IDs, handlers, UI and data logic. Make only the requested change. Return ONLY the COMPLETE updated file contents in one code fence. Do not omit sections or use placeholders.';const prompt='TASK:\\n'+task+'\\n\\nFILENAME: '+S.name+'\\n\\nCURRENT COMPLETE FILE:\\n'+S.current;try{const j=await ask('/api/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:E.model.value,messages:[{role:'system',content:sys},{role:'user',content:prompt}],temperature:0.1})});const msg=j.choices?.[0]?.message?.content;if(!msg)throw new Error('Empty model response');const code=extract(typeof msg==='string'?msg:JSON.stringify(msg));if(code.length<Math.min(500,S.current.length*.2))throw new Error('Model returned an incomplete file. Original was kept.');S.current=code;preview();ui();E.out.textContent='✓ Updated file ready. Preview check करो, फिर Download Updated File.';st('Done')}catch(e){S.current=S.before;S.before='';ui();E.out.textContent='Error: '+e.message+'\\n\\nOriginal working file was kept.';st('Error: '+e.message)}};
E.undo.onclick=()=>{if(!S.before)return;S.current=S.before;S.before='';preview();ui();E.out.textContent='Last AI change undone.';st('Undo complete')};
function preview(){if(!S.current)return;E.frame.srcdoc=/\\.html?$/i.test(S.name)?S.current:'<pre style="white-space:pre-wrap;padding:16px">'+S.current.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))+'</pre>'} E.refresh.onclick=preview;
E.download.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([S.current],{type:'text/plain;charset=utf-8'}));a.download=S.name.replace(/(\\.[^.]+)$/,'_AI$1');a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
E.mic.onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return alert('Voice typing Chrome में available नहीं है');const r=new R();r.lang='hi-IN';r.interimResults=true;const base=E.task.value.trim();r.onstart=()=>st('Listening…');r.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;E.task.value=(base?base+' ':'')+t};r.onend=()=>st('Voice captured');r.start()};
(async()=>{const k=localStorage.getItem('ashna_key')||sessionStorage.getItem('ashna_key');if(k){S.key=k;E.key.value=k;try{await loadModels();E.c1.classList.add('hidden');E.c2.classList.remove('hidden')}catch{S.key='';st('Tap Connect to verify key')}}ui()})();
</script></body></html>`;

function send(res, status, body, type='text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(body);
}

const server = http.createServer(async (req,res)=>{
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/' || u.pathname === '/index.html') return send(res,200,html,'text/html; charset=utf-8');
    if (u.pathname === '/health') return send(res,200,'ok');
    if (!u.pathname.startsWith('/api/')) return send(res,404,'Not found');
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return send(res,401,JSON.stringify({error:{message:'Missing API key'}}),'application/json');
    const chunks=[]; let size=0;
    for await (const c of req) { size += c.length; if (size > 25*1024*1024) return send(res,413,JSON.stringify({error:{message:'Request too large'}}),'application/json'); chunks.push(c); }
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const target = ASHNA + u.pathname.slice(4) + u.search;
    const headers = { Authorization: auth, Accept: 'application/json' };
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    const r = await fetch(target,{method:req.method,headers,body: (req.method==='GET'||req.method==='HEAD')?undefined:body,redirect:'follow'});
    const buf = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, {
      'Content-Type': r.headers.get('content-type') || 'application/json',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    });
    res.end(buf);
  } catch (e) {
    send(res,500,JSON.stringify({error:{message:e.message||'Proxy error'}}),'application/json');
  }
});
server.listen(PORT, ()=>console.log('Ashna mobile server listening on '+PORT));
