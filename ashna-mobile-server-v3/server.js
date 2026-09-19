const http = require('http');
const { URLSearchParams } = require('url');
const PORT = process.env.PORT || 10000;
const ASHNA = 'https://api.ashna.ai/v1/api';

function esc(s){return String(s||'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
function page(msg='') {
  return `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ashna Diagnostic</title><body style="font:16px system-ui;padding:20px;max-width:760px;margin:auto;background:#0b1020;color:#eef3ff"><h2>Ashna Full Diagnostic</h2><p>Server-side test: models → AI reply → code edit.</p><form method="post" action="/diag"><p><input name="key" type="password" placeholder="API key" required style="width:100%;padding:12px"></p><p><input name="model" value="ashna-x1" placeholder="Model ID" style="width:100%;padding:12px"></p><button type="submit" style="padding:12px 18px">Run full test</button></form><pre style="white-space:pre-wrap;background:#121a2a;padding:12px;border-radius:10px">${esc(msg)}</pre></body>`;
}
function send(res,status,body,type='text/html; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});res.end(body)}
async function upstream(path,key,opts={}){
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),45000);
  try{
    const r=await fetch(ASHNA+path,{...opts,headers:{...(opts.headers||{}),Authorization:'Bearer '+key,Accept:'application/json'},signal:ctrl.signal});
    const text=await r.text(); let json; try{json=JSON.parse(text)}catch{json={raw:text}};
    if(!r.ok) throw new Error(`HTTP ${r.status}: `+(json?.error?.message||json?.message||text.slice(0,300)));
    return json;
  } finally { clearTimeout(timer); }
}
function getMsg(j){return j?.choices?.[0]?.message?.content||'';}
function extractCode(s){s=String(s||'').trim(); const m=s.match(/```(?:html)?\s*([\s\S]*?)```/i); return (m?m[1]:s).trim();}
const server=http.createServer(async(req,res)=>{
  try{
    if(req.method==='GET' && req.url==='/') return send(res,200,page());
    if(req.method==='GET' && req.url==='/health') return send(res,200,'ok','text/plain');
    if(req.method==='POST' && req.url==='/diag'){
      const chunks=[]; for await(const c of req) chunks.push(c); const p=new URLSearchParams(Buffer.concat(chunks).toString());
      const key=(p.get('key')||'').trim(); const requested=(p.get('model')||'').trim();
      if(!key) return send(res,400,page('FAIL: missing key'));
      let models, ids=[];
      try{ models=await upstream('/models',key); ids=(models.data||models.models||[]).map(x=>typeof x==='string'?x:(x.id||x.name)).filter(Boolean); }
      catch(e){ return send(res,200,page('MODELS FAIL: '+e.message)); }
      const model = requested || ids[0] || 'ashna-x1';
      let ping;
      try{ ping=await upstream('/chat/completions',key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'user',content:'Reply with exactly OK'}],temperature:0,max_tokens:16})}); }
      catch(e){ return send(res,200,page(`MODELS OK: ${ids.length}\nMODEL USED: ${model}\nAI PING FAIL: ${e.message}`)); }
      const pingMsg=String(getMsg(ping)).trim();
      const original='<!doctype html><html><body><h1>OLD</h1><p id="keep">Keep me</p></body></html>';
      const editPrompt=`Return ONLY the complete updated HTML file in one code fence. Change ONLY the h1 text from OLD to WORKING. Preserve everything else exactly.\n\nFILE:\n${original}`;
      let edit;
      try{ edit=await upstream('/chat/completions',key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'user',content:editPrompt}],temperature:0,max_tokens:500})}); }
      catch(e){ return send(res,200,page(`MODELS OK: ${ids.length}\nAI PING OK: ${pingMsg}\nFILE EDIT FAIL: ${e.message}`)); }
      const edited=extractCode(getMsg(edit));
      const editOK=edited.includes('<h1>WORKING</h1>') && edited.includes('<p id="keep">Keep me</p>') && !edited.includes('<h1>OLD</h1>');
      return send(res,200,page(`MODELS OK: ${ids.length}\nMODEL USED: ${model}\nAI PING: ${pingMsg}\nFILE EDIT: ${editOK?'PASS':'FAIL'}\nEDITED FILE: ${edited}\nFIRST MODELS: ${ids.slice(0,10).join(', ')}`));
    }
    send(res,404,'not found','text/plain');
  } catch(e){ send(res,500,page('SERVER FAIL: '+(e.message||String(e)))); }
});
server.listen(PORT,()=>console.log('full diagnostic listening',PORT));
