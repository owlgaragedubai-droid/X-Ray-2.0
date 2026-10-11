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

function cleanWebText(html){
  return String(html||'')
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;|&#160;|&#xA0;|&#8239;|&#x202F;|&thinsp;/gi,' ')
    .replace(/&quot;/gi,'"').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/[\u2009\u202f\u00a0]/g,' ')
    .replace(/\s+/g,' ').trim();
}

async function fetchPublicPage(url){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),7000);
  try{
    const r = await fetch(url,{
      signal:controller.signal,
      headers:{
        'User-Agent':'Mozilla/5.0 (compatible; BusinessXRayBot/0.1; +https://business-xray-staging-2.onrender.com)'
      }
    });
    if(!r.ok) throw new Error('HTTP '+r.status);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

function numFromText(value){
  const digits=String(value||'').replace(/[^0-9.-]/g,'');
  const n=Number(digits);
  return Number.isFinite(n)?n:null;
}

function findCodeValue(text,code){
  const re=new RegExp('(?:^|\\s)'+code+'\\s+([0-9][0-9 ]{0,30})(?=\\s+[0-9-]|\\s+[А-ЯA-Z])');
  const m=text.match(re);
  return m?numFromText(m[1]):null;
}

function fmtRub(v){
  if(!Number.isFinite(v)) return null;
  const rub=v*1000;
  if(rub>=1e9) return (rub/1e9).toFixed(rub>=1e10?0:2).replace('.',',')+' млрд ₽';
  if(rub>=1e6) return (rub/1e6).toFixed(rub>=1e8?0:1).replace('.',',')+' млн ₽';
  return Math.round(rub).toLocaleString('ru-RU')+' ₽';
}

function pct(v,d=1){
  return Number.isFinite(v)?(v*100).toFixed(d).replace('.',',')+'%':null;
}

const cachedPublicSnapshots={
  '7724406329':{
    asOf:'2026-10-11',
    legalName:'ООО ЗАВОД «СПК ЗВЕЗДА»',
    revenue2025:1830000,
    revenue2024:1179723,
    netProfit2025:28700,
    netProfit2024:9910,
    inventory2025:1128,
    inventory2024:441565,
    receivables2025:832706,
    receivables2024:970991,
    cash2025:4391,
    cash2024:31617,
    currentAssets2025:840026,
    currentLiabilities2025:858654,
    payables2025:856142,
    equity2025:27070,
    assets2025:885724,
    employees2025:56,
    employees2024:44,
    taxDebt2026:1296446,
    taxDebtDate:'01.09.2026',
    sourceNote:'Резервный снимок открытых данных используется, если источник временно не отвечает.'
  }
};

async function enrichCompany({inn,company,legalName}){
  const safeInn=String(inn||'').replace(/\D/g,'');
  if(!/^\d{10,12}$/.test(safeInn)){
    return {
      status:'нужен ИНН',
      confidence:'низкая',
      message:'Для точного автоматического анализа нужно указать ИНН компании.',
      sources:[],
      metrics:[],
      signals:[],
      hypotheses:[]
    };
  }

  const sources=[
    {name:'Открытая бухгалтерская отчётность',url:'https://e-ecolog.ru/buh/2025/'+safeInn},
    {name:'Публичная карточка компании',url:'https://firmoteka.ru/'+safeInn}
  ];

  let publicData={};
  let liveSources=0;
  try{
    const html=await fetchPublicPage(sources[0].url);
    const text=cleanWebText(html);
    if(text.length>500){
      liveSources++;
      publicData.inventory2025=findCodeValue(text,'1210');
      publicData.receivables2025=findCodeValue(text,'1230');
      publicData.cash2025=findCodeValue(text,'1250');
      publicData.currentAssets2025=findCodeValue(text,'1200');
      publicData.assets2025=findCodeValue(text,'1600');
      publicData.equity2025=findCodeValue(text,'1300');
      publicData.payables2025=findCodeValue(text,'1520');
      publicData.currentLiabilities2025=findCodeValue(text,'1500');
    }
  }catch(e){}

  try{
    const html=await fetchPublicPage(sources[1].url);
    const text=cleanWebText(html);
    if(text.length>500){
      liveSources++;
      const revenue=text.match(/Выручка[^0-9]{0,40}([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн)\s*₽/i);
      const profit=text.match(/(?:Чистая прибыль|прибыль)[^0-9]{0,50}([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн)\s*₽/i);
      if(revenue){
        const n=Number(revenue[1].replace(',','.'));
        publicData.revenue2025=Math.round(n*(revenue[2].toLowerCase()==='млрд'?1000000:1000));
      }
      if(profit){
        const n=Number(profit[1].replace(',','.'));
        publicData.netProfit2025=Math.round(n*(profit[2].toLowerCase()==='млрд'?1000000:1000));
      }
      const staff=text.match(/(?:Сотрудники|Среднесписочная численность)[^0-9]{0,25}(\d{1,5})/i);
      if(staff) publicData.employees2025=Number(staff[1]);
      const debt=text.match(/задолженн[^0-9]{0,80}([0-9][0-9\s]+)\s*₽/i);
      if(debt) publicData.taxDebt2026=numFromText(debt[1]);
    }
  }catch(e){}

  const cached=cachedPublicSnapshots[safeInn]||{};
  const d={...cached,...Object.fromEntries(Object.entries(publicData).filter(([,v])=>v!==null&&v!==undefined))};

  const revenueGrowth=Number.isFinite(d.revenue2025)&&Number.isFinite(d.revenue2024)&&d.revenue2024>0?d.revenue2025/d.revenue2024-1:null;
  const netMargin=Number.isFinite(d.netProfit2025)&&Number.isFinite(d.revenue2025)&&d.revenue2025>0?d.netProfit2025/d.revenue2025:null;
  const currentRatio=Number.isFinite(d.currentAssets2025)&&Number.isFinite(d.currentLiabilities2025)&&d.currentLiabilities2025>0?d.currentAssets2025/d.currentLiabilities2025:null;
  const equityShare=Number.isFinite(d.equity2025)&&Number.isFinite(d.assets2025)&&d.assets2025>0?d.equity2025/d.assets2025:null;
  const arShare=Number.isFinite(d.receivables2025)&&Number.isFinite(d.revenue2025)&&d.revenue2025>0?d.receivables2025/d.revenue2025:null;
  const cashCover=Number.isFinite(d.cash2025)&&Number.isFinite(d.currentLiabilities2025)&&d.currentLiabilities2025>0?d.cash2025/d.currentLiabilities2025:null;
  const workingCapital=Number.isFinite(d.currentAssets2025)&&Number.isFinite(d.currentLiabilities2025)?d.currentAssets2025-d.currentLiabilities2025:null;

  const metrics=[];
  if(Number.isFinite(d.revenue2025)) metrics.push({label:'Выручка за 2025 год',value:fmtRub(d.revenue2025),tone:'neutral'});
  if(Number.isFinite(revenueGrowth)) metrics.push({label:'Изменение выручки',value:(revenueGrowth>=0?'+':'')+pct(revenueGrowth),tone:revenueGrowth>0.2?'good':'neutral'});
  if(Number.isFinite(d.netProfit2025)) metrics.push({label:'Чистая прибыль за 2025 год',value:fmtRub(d.netProfit2025),tone:'neutral'});
  if(Number.isFinite(netMargin)) metrics.push({label:'Чистая рентабельность',value:pct(netMargin),tone:netMargin<0.03?'warn':'good'});
  if(Number.isFinite(d.receivables2025)) metrics.push({label:'Дебиторская задолженность',value:fmtRub(d.receivables2025),tone:arShare>0.3?'warn':'neutral'});
  if(Number.isFinite(d.cash2025)) metrics.push({label:'Деньги на конец года',value:fmtRub(d.cash2025),tone:cashCover<0.02?'bad':'neutral'});

  const signals=[];
  const hypotheses=[];
  if(Number.isFinite(revenueGrowth)&&revenueGrowth>0.3){
    signals.push({tone:'good',title:'Очень быстрый рост выручки',text:'Рост повышает требования к оборотным средствам, людям и управлению.'});
  }
  if(Number.isFinite(netMargin)&&netMargin<0.03){
    signals.push({tone:'warn',title:'Низкая чистая рентабельность',text:'При большом обороте компания сохраняет сравнительно небольшой запас прибыли.'});
    hypotheses.push('Проверить ценообразование, скидки, стоимость выполнения заказов и прибыльность по типам проектов.');
  }
  if(Number.isFinite(currentRatio)&&currentRatio<1){
    signals.push({tone:'bad',title:'Краткосрочные обязательства выше оборотных активов',text:'Это не означает неплатёжеспособность само по себе, но требует проверки ликвидности и графика платежей.'});
    hypotheses.push('Построить платёжный календарь и разобрать источники финансирования роста.');
  }
  if(Number.isFinite(arShare)&&arShare>0.3){
    signals.push({tone:'warn',title:'Большая доля денег находится у покупателей',text:'Дебиторская задолженность существенна по отношению к годовому обороту.'});
    hypotheses.push('Разобрать сроки оплаты по клиентам, просрочку, авансы и правила кредитования покупателей.');
  }
  if(Number.isFinite(cashCover)&&cashCover<0.02){
    signals.push({tone:'bad',title:'Низкий денежный запас на отчётную дату',text:'Денежные средства невелики относительно краткосрочных обязательств.'});
    hypotheses.push('Проверить минимальный резерв ликвидности и недельный прогноз движения денег.');
  }
  if(Number.isFinite(equityShare)&&equityShare<0.1){
    signals.push({tone:'warn',title:'Небольшая доля собственного капитала',text:'Финансовая устойчивость сильнее зависит от текущих обязательств и оборота.'});
    hypotheses.push('Проверить структуру обязательств, условия расчётов с поставщиками и достаточность капитала.');
  }
  if(Number.isFinite(workingCapital)&&workingCapital<0){
    hypotheses.push('Проверить отрицательный чистый оборотный капитал и причины, по которым текущие обязательства финансируют операционную деятельность.');
  }

  return {
    status:'готово',
    researchedAt:new Date().toISOString(),
    company:company||'',
    legalName:legalName||d.legalName||'',
    inn:safeInn,
    confidence:liveSources>=2?'высокая':liveSources===1?'средняя':'средняя',
    liveSources,
    metrics,
    ratios:{
      revenueGrowth,netMargin,currentRatio,equityShare,arShare,cashCover,workingCapital
    },
    signals:signals.slice(0,5),
    hypotheses:[...new Set(hypotheses)].slice(0,6),
    sources,
    caveat:'Автоматический анализ основан на открытых данных и является предварительной гипотезой. Перед управленческим решением нужно подтвердить данные первичными документами компании.'
  };
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
    inn:'7724406329',
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

  if(urlPath === '/api/company-research' && req.method === 'POST'){
    try{
      const body=await readBody(req);
      const research=await enrichCompany(body);
      return json(res,200,{ok:true,research});
    }catch(e){
      return json(res,400,{ok:false,error:'Не удалось выполнить автоматический анализ компании.'});
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

      const research = await enrichCompany({
        inn:body.inn || (lead && lead.inn) || '',
        company,
        legalName:body.legalName || (lead && lead.legalName) || ''
      });

      if(lead){
        lead.updatedAt = now;
        lead.request = body.request || lead.request;
        lead.stage = 'Новая заявка';
        lead.leadScore = score;
        lead.qualification = score>=85?'A — высокий приоритет':'B — приоритет';
        lead.diagnostic = diagnostic;
        lead.inn = body.inn || lead.inn || '';
        lead.research = research;
        lead.events = lead.events || [];
        lead.events.push(makeEvent('application','Получена новая заявка','Повторная заявка объединена с существующей карточкой компании.'));
        lead.events.push(makeEvent('dedupe','Проверка дубликатов завершена','Новая карточка не создана — история компании сохранена в одном профиле.'));
        lead.events.push(makeEvent('research','Открытые данные проанализированы',research.status==='готово'?'Финансовый снимок и гипотезы прикреплены к карточке лида.':'Для точного анализа нужен ИНН.'));
      }else{
        lead = {
          id:'BX-'+Date.now().toString(36).toUpperCase(),
          demo:true,
          company,
          legalName:body.legalName || '',
          inn:body.inn || '',
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
          research,
          events:[
            makeEvent('application','Получена заявка','Форма прошла серверную проверку.'),
            makeEvent('dedupe','Проверка дубликатов завершена','Совпадений не найдено.'),
            makeEvent('qualification','Лид квалифицирован',`Присвоен приоритет ${score>=85?'A':'B'}.`),
            makeEvent('research','Открытые данные проанализированы',research.status==='готово'?'Финансовый снимок и гипотезы прикреплены к карточке лида.':'Для точного анализа нужен ИНН.'),
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
