const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
const port = process.env.PORT || 10000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, '[]\n', 'utf8');

const questionSchema = [
  { key:'finance_visibility', domain:'Финансы', weight:1.2 },
  { key:'profitability', domain:'Финансы', weight:1.1 },
  { key:'cash_gaps', domain:'Денежный поток', weight:1.4 },
  { key:'receivables', domain:'Денежный поток', weight:1.2 },
  { key:'inventory', domain:'Денежный поток', weight:1.1 },
  { key:'sales_visibility', domain:'Продажи', weight:1.1 },
  { key:'discount_control', domain:'Продажи', weight:1.3 },
  { key:'conversion', domain:'Продажи', weight:1.0 },
  { key:'operations', domain:'Операции', weight:1.0 },
  { key:'owner_dependency', domain:'Управление', weight:1.4 },
  { key:'management_kpi', domain:'Управление', weight:1.0 },
  { key:'initiative_tracking', domain:'Управление', weight:1.1 },
  { key:'market_visibility', domain:'Рынок и риски', weight:0.9 },
  { key:'risk_control', domain:'Рынок и риски', weight:1.0 }
];

const aluminstarDemoAnswers = {
  finance_visibility:2,
  profitability:1,
  cash_gaps:1,
  receivables:1,
  inventory:1,
  sales_visibility:2,
  discount_control:1,
  conversion:2,
  operations:2,
  owner_dependency:1,
  management_kpi:2,
  initiative_tracking:1,
  market_visibility:2,
  risk_control:2
};

function json(res, code, payload){
  res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(payload));
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    let body='';
    req.on('data', chunk=>{
      body += chunk;
      if(body.length > 250000){ reject(new Error('payload too large')); req.destroy(); }
    });
    req.on('end', ()=>{
      try{ resolve(body ? JSON.parse(body) : {}); } catch(e){ reject(e); }
    });
    req.on('error', reject);
  });
}

function readLeads(){
  try{
    const parsed = JSON.parse(fs.readFileSync(leadsFile,'utf8') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){
    return [];
  }
}

function writeLeads(leads){
  fs.writeFileSync(leadsFile, JSON.stringify(leads,null,2)+'\n','utf8');
}

function healthLabel(score){
  if(score >= 72) return {label:'устойчиво', cls:'good'};
  if(score >= 52) return {label:'требует внимания', cls:'warn'};
  return {label:'риск', cls:'bad'};
}

function analyzeDiagnostic(answers){
  const domains = {};
  let answeredWeight = 0;
  let totalWeight = 0;

  for(const q of questionSchema){
    totalWeight += q.weight;
    if(Number.isFinite(answers[q.key])){
      const v = Math.max(0,Math.min(3,Number(answers[q.key])));
      if(!domains[q.domain]) domains[q.domain] = {sum:0,weight:0};
      domains[q.domain].sum += (v/3)*100*q.weight;
      domains[q.domain].weight += q.weight;
      answeredWeight += q.weight;
    }
  }

  const domainResults = Object.entries(domains).map(([name,v])=>{
    const score = Math.round(v.sum/v.weight);
    return {name, score, ...healthLabel(score)};
  }).sort((a,b)=>a.score-b.score);

  const contradictions = [];
  if((answers.finance_visibility ?? 3) <= 1 && (answers.profitability ?? 0) >= 3){
    contradictions.push('Заявлена высокая точность оценки прибыльности при слабой прозрачности финансовых данных.');
  }
  if((answers.cash_gaps ?? 3) <= 1 && (answers.inventory ?? 3) >= 3 && (answers.receivables ?? 3) >= 3){
    contradictions.push('Частая нехватка денег не объясняется ответами по запасам и оплатам клиентов.');
  }
  if((answers.owner_dependency ?? 3) <= 1 && (answers.initiative_tracking ?? 0) >= 3){
    contradictions.push('Высокая зависимость от собственника сочетается с заявленной зрелой системой исполнения.');
  }

  const coverage = totalWeight ? answeredWeight/totalWeight : 0;
  const confidenceScore = Math.max(35,Math.min(92,Math.round(48 + coverage*40 - contradictions.length*9)));
  const confidence = confidenceScore >= 80 ? 'высокая' : confidenceScore >= 62 ? 'средняя' : 'низкая';

  const top = domainResults.slice(0,3);
  const findings = top.map((d,i)=>{
    const texts = {
      'Денежный поток':'Деньги могут застревать в запасах, оплатах клиентов или текущем финансировании роста.',
      'Продажи':'Есть признаки потерь в коммерческой системе: прозрачности воронки, скидках или конверсии.',
      'Управление':'Часть решений и изменений может слишком сильно зависеть от собственника и отдельных руководителей.',
      'Финансы':'Нужно повысить прозрачность прибыльности по направлениям и качества управленческой картины.',
      'Операции':'Есть смысл проверить ограничения процессов, загрузку и стоимость выполнения заказов.',
      'Рынок и риски':'Недостаточно ясна внешняя картина: спрос, конкуренция и ключевые риски.'
    };
    const actions = {
      'Денежный поток':'Проверить запасы, сроки оплаты клиентов и движение денег по основным направлениям.',
      'Продажи':'Разобрать скидки, этапы воронки и причины потери сделок.',
      'Управление':'Определить, какие решения можно передать команде и где нужны чёткие границы ответственности.',
      'Финансы':'Собрать прибыльность по направлениям и единый управленческий отчёт.',
      'Операции':'Проверить узкие места процессов и стоимость выполнения типовых заказов.',
      'Рынок и риски':'Дополнить внутреннюю картину внешними данными и сценариями.'
    };
    return {
      rank:i+1,
      area:d.name,
      state:d.label,
      stateClass:d.cls,
      finding:texts[d.name],
      action:actions[d.name]
    };
  });

  const riskCount = domainResults.filter(x=>x.cls==='bad').length;
  const warnCount = domainResults.filter(x=>x.cls==='warn').length;
  const urgency = Math.min(100, 45 + riskCount*22 + warnCount*8);

  return {
    engineVersion:'BX Diagnostic Engine v1',
    confidence,
    confidenceScore,
    contradictions,
    coverage:Math.round(coverage*100),
    domains:domainResults,
    findings,
    urgency,
    nextStep:'Запросить первичные данные и провести полную диагностику по приоритетным зонам.'
  };
}

function companyKey(value){
  return String(value||'').toLowerCase().replace(/[^a-zа-яё0-9]+/gi,'').slice(0,120);
}

function leadScore({fit=70,urgency=60,size=70,engagement=70}){
  return Math.round(fit*.45 + urgency*.25 + size*.15 + engagement*.15);
}

function makeEvent(type, title, detail){
  return {type,title,detail,at:new Date().toISOString()};
}

function seedDemoLead(){
  const leads = readLeads();
  if(leads.some(x=>x.demoKey==='aluminstar')) return;
  const diagnostic = analyzeDiagnostic(aluminstarDemoAnswers);
  const score = leadScore({fit:92,urgency:diagnostic.urgency,size:90,engagement:85});
  const now = new Date().toISOString();
  leads.unshift({
    id:'BX-DEMO-ALUM-001',
    demo:true,
    demoKey:'aluminstar',
    company:'Aluminstar',
    legalName:'ООО «Завод СПК Звезда»',
    source:'Рейтинг потенциальных клиентов BX → персональная диагностика',
    sourceType:'Целевой список',
    rank:1,
    fitScore:92,
    leadScore:score,
    qualification:score>=85?'A — высокий приоритет':'B — приоритет',
    stage:'Новая заявка',
    request:'Полная диагностика бизнеса',
    contactRole:'Собственник / руководитель',
    note:'Демонстрационный сценарий. Не является фактом реального обращения компании.',
    createdAt:now,
    updatedAt:now,
    diagnostic,
    events:[
      makeEvent('target','Компания отобрана в целевой список','Первое место в текущем рейтинге потенциальных клиентов.'),
      makeEvent('visit','Открыта персональная диагностическая страница','Источник сохранён в карточке лида.'),
      makeEvent('diagnostic','Диагностика завершена','К результату прикреплены приоритетные зоны и уровень уверенности.'),
      makeEvent('lead','Заявка создана','Система проверила дубликаты и присвоила квалификацию.'),
      makeEvent('stored','Лид сохранён','Карточка доступна во внутреннем кабинете BX.')
    ]
  });
  writeLeads(leads);
}

seedDemoLead();

async function api(req,res,urlPath){
  if(urlPath === '/api/diagnostic' && req.method === 'POST'){
    try{
      const body = await readBody(req);
      const answers = body.profile === 'aluminstar-demo' ? aluminstarDemoAnswers : (body.answers || {});
      const result = analyzeDiagnostic(answers);
      return json(res,200,{
        ok:true,
        sessionId:'DX-'+Date.now().toString(36).toUpperCase(),
        profile:body.profile || 'custom',
        result
      });
    }catch(e){
      return json(res,400,{ok:false,error:'Не удалось обработать диагностические ответы.'});
    }
  }

  if(urlPath === '/api/leads' && req.method === 'GET'){
    const leads = readLeads().filter(x=>x.demo===true);
    return json(res,200,{ok:true,storage:process.env.DATABASE_URL?'PostgreSQL':'серверное демо-хранилище',leads});
  }

  if(urlPath === '/api/leads' && req.method === 'POST'){
    try{
      const body = await readBody(req);
      const company = String(body.company || '').trim();
      if(!company) return json(res,400,{ok:false,error:'Не указана компания.'});

      const leads = readLeads();
      const key = companyKey(body.legalName || company);
      let lead = leads.find(x=>companyKey(x.legalName || x.company)===key && x.demo===true);
      const diagnostic = body.diagnostic && body.diagnostic.findings ? body.diagnostic : analyzeDiagnostic(aluminstarDemoAnswers);
      const fit = Number(body.fitScore || 70);
      const score = leadScore({fit,urgency:diagnostic.urgency || 60,size:Number(body.sizeScore || 70),engagement:100});
      const now = new Date().toISOString();

      if(lead){
        lead.updatedAt = now;
        lead.request = body.request || lead.request;
        lead.stage = 'Новая заявка';
        lead.leadScore = score;
        lead.qualification = score>=85?'A — высокий приоритет':'B — приоритет';
        lead.diagnostic = diagnostic;
        lead.events = lead.events || [];
        lead.events.push(makeEvent('application','Получена новая заявка','Повторная заявка объединена с существующей карточкой компании.'));
        lead.events.push(makeEvent('dedupe','Проверка дубликатов завершена','Новая карточка не создана — история компании сохранена в одном профиле.'));
      }else{
        lead = {
          id:'BX-'+Date.now().toString(36).toUpperCase(),
          demo:true,
          company,
          legalName:body.legalName || '',
          source:body.source || 'Сайт BX',
          sourceType:body.sourceType || 'Сайт',
          rank:Number(body.rank || 0) || null,
          fitScore:fit,
          leadScore:score,
          qualification:score>=85?'A — высокий приоритет':'B — приоритет',
          stage:'Новая заявка',
          request:body.request || 'Полная диагностика бизнеса',
          contactRole:body.contactRole || 'Представитель компании',
          note:'Демонстрационный лид. Не хранит реальные персональные контакты.',
          createdAt:now,
          updatedAt:now,
          diagnostic,
          events:[
            makeEvent('application','Получена заявка','Форма прошла серверную проверку.'),
            makeEvent('dedupe','Проверка дубликатов завершена','Совпадений не найдено.'),
            makeEvent('qualification','Лид квалифицирован',`Присвоен приоритет ${score>=85?'A':'B'}.`),
            makeEvent('stored','Лид сохранён','Карточка создана во внутренней базе BX.')
          ]
        };
        leads.unshift(lead);
      }

      writeLeads(leads);
      return json(res,200,{ok:true,storage:process.env.DATABASE_URL?'PostgreSQL':'серверное демо-хранилище',lead});
    }catch(e){
      return json(res,400,{ok:false,error:'Не удалось сохранить заявку.'});
    }
  }

  return false;
}

http.createServer(async (req,res)=>{
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if(urlPath === '/health'){
    return json(res,200,{ok:true,service:'business-xray',version:'v3.1',diagnosticEngine:'v1'});
  }

  if(urlPath.startsWith('/api/')){
    const handled = await api(req,res,urlPath);
    if(handled !== false) return;
    return json(res,404,{ok:false,error:'Маршрут не найден.'});
  }

  const requested = path.normalize(path.join(publicDir, urlPath));
  const isSafe = requested.startsWith(publicDir);
  if(isSafe && fs.existsSync(requested) && fs.statSync(requested).isFile()){
    const ext = path.extname(requested).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=120'
    });
    return fs.createReadStream(requested).pipe(res);
  }

  const index = path.join(publicDir, 'index.html');
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  fs.createReadStream(index).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('Business X-Ray v3.1 listening on',port));
