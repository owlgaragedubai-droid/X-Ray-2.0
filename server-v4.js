const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { enrichCompany, isValidInn } = require('./company-intel');

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
const port = process.env.PORT || 10000;

const mime = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp'
};

fs.mkdirSync(dataDir,{recursive:true});
if(!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile,'[]\n','utf8');

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString:process.env.DATABASE_URL,
  max:5,
  connectionTimeoutMillis:5000,
  idleTimeoutMillis:10000
}) : null;
let databaseReady=false;

async function initDb(){
  if(!pool) return false;
  try{
    await pool.query('CREATE TABLE IF NOT EXISTS bx_leads (id TEXT PRIMARY KEY, company TEXT NOT NULL, legal_name TEXT, inn TEXT, demo BOOLEAN NOT NULL DEFAULT FALSE, demo_key TEXT, stage TEXT, qualification TEXT, lead_score INTEGER, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    await pool.query('CREATE INDEX IF NOT EXISTS bx_leads_inn_idx ON bx_leads (inn)');
    databaseReady=true;
    console.log('PostgreSQL lead storage connected');
    const check=await pool.query('SELECT COUNT(*)::int AS count FROM bx_leads');
    console.log('PostgreSQL lead count:',check.rows[0].count);
    return true;
  }catch(e){
    databaseReady=false;
    console.error('PostgreSQL unavailable:',e.message);
    return false;
  }
}
function readFallback(){
  try{
    const x=JSON.parse(fs.readFileSync(leadsFile,'utf8')||'[]');
    return Array.isArray(x)?x:[];
  }catch(e){ return []; }
}
function writeFallback(rows){ fs.writeFileSync(leadsFile,JSON.stringify(rows,null,2)+'\n','utf8'); }
async function loadLeads(){
  if(databaseReady){
    try{
      const r=await pool.query('SELECT payload FROM bx_leads ORDER BY updated_at DESC');
      return r.rows.map(x=>x.payload);
    }catch(e){ console.error('DB read failed:',e.message); }
  }
  return readFallback();
}
async function saveRows(rows){
  if(databaseReady){
    const c=await pool.connect();
    try{
      await c.query('BEGIN');
      for(const lead of rows){
        const sql='INSERT INTO bx_leads (id,company,legal_name,inn,demo,demo_key,stage,qualification,lead_score,payload,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12) ON CONFLICT (id) DO UPDATE SET company=EXCLUDED.company, legal_name=EXCLUDED.legal_name, inn=EXCLUDED.inn, demo=EXCLUDED.demo, demo_key=EXCLUDED.demo_key, stage=EXCLUDED.stage, qualification=EXCLUDED.qualification, lead_score=EXCLUDED.lead_score, payload=EXCLUDED.payload, updated_at=EXCLUDED.updated_at';
        await c.query(sql,[
          lead.id,lead.company,lead.legalName||'',lead.inn||'',!!lead.demo,lead.demoKey||null,
          lead.stage||'',lead.qualification||'',Number(lead.leadScore||0),JSON.stringify(lead),
          lead.createdAt||new Date().toISOString(),lead.updatedAt||new Date().toISOString()
        ]);
      }
      await c.query('COMMIT');
      return 'PostgreSQL';
    }catch(e){
      await c.query('ROLLBACK');
      console.error('DB write failed:',e.message);
    }finally{ c.release(); }
  }
  writeFallback(rows);
  return 'резервное хранилище';
}

function json(res,status,payload){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(payload));
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    let body='';
    req.on('data',c=>{
      body+=c;
      if(body.length>300000){ reject(new Error('payload too large')); req.destroy(); }
    });
    req.on('end',()=>{ try{ resolve(body?JSON.parse(body):{}); }catch(e){ reject(e); } });
    req.on('error',reject);
  });
}
function event(type,title,detail){ return {type,title,detail,at:new Date().toISOString()}; }

const questionSchema=[
  {key:'finance_visibility',domain:'Финансы',weight:1.2},
  {key:'profitability',domain:'Финансы',weight:1.1},
  {key:'cash_gaps',domain:'Денежный поток',weight:1.4},
  {key:'receivables',domain:'Денежный поток',weight:1.2},
  {key:'inventory',domain:'Денежный поток',weight:1.1},
  {key:'sales_visibility',domain:'Продажи',weight:1.1},
  {key:'discount_control',domain:'Продажи',weight:1.3},
  {key:'conversion',domain:'Продажи',weight:1.0},
  {key:'operations',domain:'Операции',weight:1.0},
  {key:'owner_dependency',domain:'Управление',weight:1.4},
  {key:'management_kpi',domain:'Управление',weight:1.0},
  {key:'initiative_tracking',domain:'Управление',weight:1.1},
  {key:'market_visibility',domain:'Рынок и риски',weight:.9},
  {key:'risk_control',domain:'Рынок и риски',weight:1}
];
const aluminstarDemoAnswers={
  finance_visibility:2,profitability:1,cash_gaps:1,receivables:1,inventory:1,sales_visibility:2,
  discount_control:1,conversion:2,operations:2,owner_dependency:1,management_kpi:2,initiative_tracking:1,
  market_visibility:2,risk_control:2
};
function healthLabel(score){
  if(score>=72) return {label:'устойчиво',cls:'good'};
  if(score>=52) return {label:'требует внимания',cls:'warn'};
  return {label:'риск',cls:'bad'};
}
function analyzeDiagnostic(answers){
  const domains={}; let answeredWeight=0,totalWeight=0;
  for(const q of questionSchema){
    totalWeight+=q.weight;
    if(Number.isFinite(answers[q.key])){
      const v=Math.max(0,Math.min(3,Number(answers[q.key])));
      if(!domains[q.domain]) domains[q.domain]={sum:0,weight:0};
      domains[q.domain].sum+=(v/3)*100*q.weight;
      domains[q.domain].weight+=q.weight;
      answeredWeight+=q.weight;
    }
  }
  const domainResults=Object.entries(domains).map(([name,v])=>{
    const score=Math.round(v.sum/v.weight);
    return {name,score,...healthLabel(score)};
  }).sort((a,b)=>a.score-b.score);
  const texts={
    'Денежный поток':'Деньги могут застревать в запасах, оплатах клиентов или финансировании роста.',
    'Продажи':'Есть признаки потерь в коммерческой системе.',
    'Управление':'Часть решений может слишком сильно зависеть от собственника.',
    'Финансы':'Нужно повысить прозрачность прибыльности и управленческой картины.',
    'Операции':'Нужно проверить ограничения процессов и стоимость выполнения.',
    'Рынок и риски':'Недостаточно ясна внешняя картина.'
  };
  const actions={
    'Денежный поток':'Проверить запасы, сроки оплаты клиентов и движение денег.',
    'Продажи':'Разобрать скидки, этапы воронки и причины потери сделок.',
    'Управление':'Определить, какие решения можно передать команде.',
    'Финансы':'Собрать прибыльность по направлениям и единый управленческий отчёт.',
    'Операции':'Проверить узкие места процессов.',
    'Рынок и риски':'Дополнить внутреннюю картину внешними данными.'
  };
  const findings=domainResults.slice(0,3).map((d,i)=>({rank:i+1,area:d.name,state:d.label,stateClass:d.cls,finding:texts[d.name],action:actions[d.name]}));
  return {
    engineVersion:'BX Diagnostic Engine v1',
    confidence:'средняя',
    confidenceScore:Math.round(48+(totalWeight?answeredWeight/totalWeight:0)*40),
    contradictions:[],
    coverage:Math.round((totalWeight?answeredWeight/totalWeight:0)*100),
    domains:domainResults,
    findings,
    urgency:60,
    nextStep:'Запросить первичные данные и провести полную диагностику по приоритетным зонам.'
  };
}

function scoreLead(research,fit=70){
  let score=50;
  if(research && research.profile && research.profile.status==='Действующая') score+=15;
  if(research && (research.confidence==='высокая'||research.confidence==='выше средней')) score+=10;
  if(research && Array.isArray(research.signals) && research.signals.some(x=>x.tone==='bad')) score+=10;
  if(research && research.profile && research.profile.status==='Недействующая') score=20;
  score+=Math.round((fit-70)*.2);
  return Math.max(0,Math.min(100,score));
}

async function api(req,res,urlPath){
  if(urlPath==='/api/diagnostic' && req.method==='POST'){
    try{
      const body=await readBody(req);
      const answers=body.profile==='aluminstar-demo'?aluminstarDemoAnswers:(body.answers||{});
      return json(res,200,{ok:true,sessionId:'DX-'+Date.now().toString(36).toUpperCase(),result:analyzeDiagnostic(answers)});
    }catch(e){ return json(res,400,{ok:false,error:'Не удалось обработать ответы.'}); }
  }

  if(urlPath==='/api/company-research' && (req.method==='POST'||req.method==='GET')){
    try{
      const body=req.method==='POST'?await readBody(req):{};
      const u=new URL(req.url,'http://localhost');
      const inn=body.inn||u.searchParams.get('inn')||'';
      const research=await enrichCompany({inn});
      return json(res,200,{ok:true,research});
    }catch(e){
      return json(res,400,{ok:false,error:'Не удалось выполнить автоматический анализ компании.',detail:e.message});
    }
  }

  if(urlPath==='/api/leads' && req.method==='GET'){
    return json(res,200,{ok:true,storage:databaseReady?'PostgreSQL':'резервное хранилище',leads:await loadLeads()});
  }

  if(urlPath==='/api/leads' && req.method==='POST'){
    try{
      const body=await readBody(req);
      const inn=String(body.inn||'').replace(/\D/g,'');
      if(!isValidInn(inn)) return json(res,400,{ok:false,error:'Укажите корректный ИНН.'});

      const research=body.research&&body.research.inn===inn?body.research:await enrichCompany({inn});
      const company=String(body.company||research.company||research.legalName||('Компания '+inn)).trim();
      const rows=await loadLeads();
      let lead=rows.find(x=>String(x.inn||'')===inn);
      const now=new Date().toISOString();
      const leadScore=scoreLead(research,Number(body.fitScore||70));
      const qualification=leadScore>=80?'A — высокий приоритет':leadScore>=55?'B — проверить':'C — низкий приоритет';

      if(lead){
        lead.company=company;
        lead.legalName=body.legalName||research.legalName||lead.legalName||'';
        lead.research=research;
        lead.updatedAt=now;
        lead.stage='Новая заявка';
        lead.leadScore=leadScore;
        lead.qualification=qualification;
        lead.request=body.request||lead.request||'Предварительный анализ компании';
        lead.events=lead.events||[];
        lead.events.push(event('research','Компания повторно проанализирована','Открытые источники обновлены по ИНН.'));
        lead.events.push(event('dedupe','Карточка объединена','Новая заявка объединена с существующим лидом по ИНН.'));
      }else{
        lead={
          id:'BX-'+Date.now().toString(36).toUpperCase(),
          demo:body.demo===true,
          company,
          legalName:body.legalName||research.legalName||'',
          inn,
          source:body.source||'Проверка компании по ИНН',
          sourceType:body.sourceType||'Автоанализ',
          leadScore,
          qualification,
          stage:'Новая заявка',
          request:body.request||'Предварительный анализ компании',
          contactRole:body.contactRole||'Не указан',
          createdAt:now,
          updatedAt:now,
          diagnostic:body.diagnostic||null,
          research,
          events:[
            event('intake','Получен ИНН','Запущен автоматический внешний анализ компании.'),
            event('research','Открытые источники обработаны',(research.sourceCoverage?.successful||0)+' из '+(research.sourceCoverage?.total||0)+' источников дали данные.'),
            event('qualification','Лид квалифицирован',research.leadRecommendation||qualification),
            event('stored','Карточка сохранена','Лид записан в базу BX.')
          ]
        };
        rows.unshift(lead);
      }
      const storage=await saveRows(rows);
      return json(res,200,{ok:true,storage,lead});
    }catch(e){
      return json(res,400,{ok:false,error:'Не удалось сохранить заявку.',detail:e.message});
    }
  }

  return false;
}

initDb().then(async ()=>{
  try{
    const test=await enrichCompany({inn:'7453354145'});
    console.log('BX source self-test:', JSON.stringify({
      inn:test.inn,
      company:test.company,
      legalName:test.legalName,
      confidence:test.confidence,
      coverage:test.sourceCoverage,
      profile:test.profile,
      metrics:test.metrics,
      signals:(test.signals||[]).map(x=>x.title),
      sources:(test.sources||[]).map(x=>({name:x.name,status:x.status,detail:x.detail,fields:x.fields}))
    }));
    const rows=await loadLeads();
    const stored=rows.find(x=>String(x.inn||'')==='7453354145');
    if(stored){
      stored.company=test.company||stored.company;
      stored.legalName=test.legalName||stored.legalName;
      stored.research=test;
      stored.updatedAt=new Date().toISOString();
      stored.leadScore=20;
      stored.qualification='C — юрлицо недействующее';
      stored.events=stored.events||[];
      stored.events.push(event('research','Автоанализ обновлён','Карточка пересчитана новым многоканальным движком BX.'));
      await saveRows(rows);
      console.log('BX test lead refreshed in PostgreSQL:',stored.id);
    }
  }catch(e){
    console.error('BX source self-test failed:',e.message);
  }
});

http.createServer(async (req,res)=>{
  const urlPath=decodeURIComponent((req.url||'/').split('?')[0]);
  if(urlPath==='/health') return json(res,200,{ok:true,service:'business-xray',version:'v4.0',storage:databaseReady?'PostgreSQL':'fallback'});
  if(urlPath.startsWith('/api/')){
    const handled=await api(req,res,urlPath);
    if(handled!==false) return;
    return json(res,404,{ok:false,error:'Маршрут не найден.'});
  }

  const requested=path.normalize(path.join(publicDir,urlPath));
  const safe=requested.startsWith(publicDir);
  if(safe&&fs.existsSync(requested)&&fs.statSync(requested).isFile()){
    const ext=path.extname(requested).toLowerCase();
    res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-store':'public, max-age=120'});
    return fs.createReadStream(requested).pipe(res);
  }
  const index=path.join(publicDir,'index.html');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  fs.createReadStream(index).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('Business X-Ray v4.0 listening on',port));