
const app = document.getElementById('app');
const path = location.pathname.replace(/\/$/,'') || '/';

const status = (label, cls='go') => `<span class="status ${cls}">${label}</span>`;
const btns = () => `<div class="actions"><a class="btn primary" href="/quick-scan">ПРОЙТИ BX QUICK SCAN →</a><a class="btn ghost" href="/sample-report">ПОСМОТРЕТЬ ПРИМЕР X-RAY</a></div>`;
const pageHero = (ey,title,lead) => `<section class="pagehero shell"><div class="crumb">BX / ${ey}</div><div class="eyebrow">${ey}</div><h1>${title}</h1><p class="lead">${lead}</p>${btns()}</section>`;

const problemCards = [
  ['01','Выручка растёт. Денег больше не становится.'],
  ['02','Продажи выполняют план. EBITDA падает.'],
  ['03','Компания прибыльна. Cash заканчивается.'],
  ['04','Маркетинг даёт лиды. Продажи не конвертируют.'],
  ['05','Компания растёт. Собственник становится ограничением.'],
  ['06','Каждый директор объясняет проблему по-разному.']
];

const mapCells = [
  ['Finance','74','good'],['Cash & WC','41','bad'],['Commercial','58','warn'],['Marketing','66','warn'],
  ['Operations','81','good'],['Market','76','good'],['People','63','warn'],['Technology','55','warn'],
  ['Tax','88','good'],['Legal & Risk','72','good'],['Investment','47','bad'],['Execution','61','warn']
];

function home(){
  app.innerHTML = `
  <section class="hero shell">
    <div>
      <div class="eyebrow">ВИДИМ БИЗНЕС ТАК, КАК ЕГО ДОЛЖЕН ВИДЕТЬ СОБСТВЕННИК</div>
      <h1>Узнайте, где ваш бизнес теряет деньги.</h1>
      <p class="lead">Business X-Ray соединяет финансы, продажи, операции, рынок, людей, налоги и риски в одну экономическую картину — и показывает, какое решение стоит принять первым.</p>
      ${btns()}
      <div class="micro">Предварительный Scan — без регистрации. Финансовый эффект рассчитывается только после получения данных компании.</div>
    </div>
    <div class="panel heroCard">
      <div class="scoreline">
        <div><div class="eyebrow">BX SCORE</div><div class="score">64<small>/100</small></div></div>
        ${status('GO WITH CONDITIONS')}
      </div>
      <div class="metricRows">
        <div class="metricRow"><span>Data confidence</span><b>MEDIUM</b></div>
        <div class="metricRow"><span>Identified EBITDA upside</span><b>₽38–52M</b></div>
        <div class="metricRow"><span>Potential cash release</span><b>₽21–29M</b></div>
        <div class="metricRow"><span>Critical findings</span><b>7</b></div>
      </div>
      <div class="kpis">
        <div class="kpi"><strong class="greenText">+19%</strong><span>possible EBITDA uplift</span></div>
        <div class="kpi"><strong class="amberText">3</strong><span>priority actions</span></div>
        <div class="kpi"><strong>82%</strong><span>top finding confidence</span></div>
      </div>
    </div>
  </section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">01 · ПРОБЛЕМА</div><h2>В бизнесе редко отсутствуют данные.</h2></div>
    <p class="sectionIntro">Обычно отсутствует единая картина. BX связывает разрозненные симптомы с экономикой компании и показывает, где именно уничтожается стоимость.</p></div>
    <div class="cards">${problemCards.map(([n,t])=>`<div class="card problemCard"><div><div class="num">${n}</div><h3>${t}</h3></div><span class="arrow">↗</span></div>`).join('')}</div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">02 · VALUE CHAIN</div><h2>Рост выручки ещё не означает рост стоимости.</h2></div>
    <p class="sectionIntro">Мы отслеживаем, как коммерческие решения проходят через маржу, прибыль, cash и в конечном счёте влияют на стоимость бизнеса.</p></div>
    <div class="chain">
      ${[['Revenue','+10%','up'],['Gross Profit','−2%','flat'],['EBITDA','−8%','down'],['Net Profit','−12%','down'],['Cash Flow','−18%','down'],['Enterprise Value','−25%','down']].map(x=>`<div class="chainItem"><b>${x[0]}</b><div class="delta ${x[2]}">${x[1]}</div></div>`).join('')}
    </div>
    <div class="panel" style="padding:24px;margin-top:14px">
      <div class="eyebrow">ILLUSTRATIVE OPPORTUNITY WATERFALL</div>
      <div class="waterfall" style="margin-top:22px">
        <div class="wfLabel">Current EBITDA</div><div class="wfTrack"><div class="wfBar" style="width:48%">₽118M</div></div>
        <div class="wfLabel">Pricing</div><div class="wfTrack"><div class="wfBar green" style="width:66%">+₽21–31M</div></div>
        <div class="wfLabel">Procurement</div><div class="wfTrack"><div class="wfBar green" style="width:44%">+₽12–17M</div></div>
        <div class="wfLabel">Sales productivity</div><div class="wfTrack"><div class="wfBar green" style="width:52%">+₽14–20M</div></div>
        <div class="wfLabel">Inventory cash</div><div class="wfTrack"><div class="wfBar green" style="width:58%">+₽18–24M Cash</div></div>
      </div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">03 · BUSINESS MAP</div><h2>Просвечиваем всю систему бизнеса.</h2></div>
    <p class="sectionIntro">Не «аудит отдела продаж» и не «финансовый анализ» по отдельности. BX смотрит, как 12 функциональных зон связаны друг с другом и с деньгами.</p></div>
    <div class="businessMap">
      <div class="panel mapPanel">
        <div class="centerValue"><div><div class="eyebrow">NORTH STAR</div><strong>Free Cash Flow</strong></div><div class="goldText">→ Enterprise Value</div></div>
        <div class="mapGrid">${mapCells.map(x=>`<div class="mapCell ${x[2]}"><b>${x[0]}</b><strong>${x[1]}</strong></div>`).join('')}</div>
      </div>
      <div class="sideStack">
        <div class="card"><div class="eyebrow">CRITICAL CONSTRAINT</div><h3>Cash conversion cycle</h3><p>Рост запасов и DSO забирают ликвидность быстрее, чем растёт EBITDA.</p><div class="impact" style="margin-top:24px">₽31–47M cash</div></div>
        <div class="card"><div class="eyebrow">UNKNOWN</div><h3>Нет подтверждённой эластичности цены</h3><p>BX не будет выдавать уверенный pricing recommendation до проверки гипотезы.</p>${status('INSUFFICIENT EVIDENCE','amber')}</div>
        <div class="card"><div class="eyebrow">NEXT BEST ACTION</div><h3>14-дневный pricing pilot</h3><p>Два сегмента. +3% к цене. Kill criterion: conversion decline > 7%.</p></div>
      </div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">04 · EVIDENCE SYSTEM</div><h2>Каждый вывод должен выдержать вопрос: «Откуда вы это знаете?»</h2></div>
    <p class="sectionIntro">BX разделяет факты, расчёты, внешние данные, предположения и экспертное суждение — и показывает уровень уверенности.</p></div>
    <div class="evidence">
      <div class="panel confidence"><div><div class="big">82%</div><div class="eyebrow">CONFIDENCE</div></div></div>
      <div class="card"><div class="eyebrow">FINDING BX-04</div><h3 style="font-size:26px">Высокая доля скидок уничтожает маржу в корпоративном канале.</h3>
        <div class="tags"><span class="tag">FACT</span><span class="tag">CALCULATION</span><span class="tag">CRM DATA</span><span class="tag">ASSUMPTION</span></div>
        <div class="metricRows"><div class="metricRow"><span>Primary evidence</span><b>18,420 deals</b></div><div class="metricRow"><span>Period</span><b>12 months</b></div><div class="metricRow"><span>Owner</span><b>CCO</b></div></div>
      </div>
      <div class="card"><div class="eyebrow">FINANCIAL IMPACT</div><div class="impact" style="margin-top:18px">₽14–19M<br>EBITDA</div><p style="margin-top:18px">Next action: rebuild discount architecture and validate elasticity on two segments.</p></div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">05 · BX PARTNER BOARD</div><h2>Одно решение. Несколько независимых взглядов.</h2></div>
    <p class="sectionIntro">Board не ищет подтверждение идеи собственника. Он атакует гипотезу с разных функциональных позиций до принятия решения.</p></div>
    <div class="boardGrid">
      <div class="panel boardCard"><div class="eyebrow">COMMERCIAL</div><h3>Снизить цену на 8%</h3><div class="vote greenText">FOR · ускорит продажи</div></div>
      <div class="panel boardCard"><div class="eyebrow">CFO</div><h3>Маржа не выдерживает</h3><div class="vote redText">AGAINST · EBITDA dilution</div></div>
      <div class="panel boardCard"><div class="eyebrow">OPERATIONS</div><h3>Capacity уже близок к пределу</h3><div class="vote redText">AGAINST · execution risk</div></div>
      <div class="panel boardCard"><div class="eyebrow">MARKET</div><h3>Цена не главный constraint</h3><div class="vote amberText">CHALLENGE · demand evidence weak</div></div>
      <div class="panel boardCard"><div class="eyebrow">RED TEAM</div><h3>Гипотеза не доказана</h3><div class="vote redText">ATTACK · test before scale</div></div>
      <div class="panel boardCard"><div class="eyebrow">DATA & EVIDENCE</div><h3>Confidence 61%</h3><div class="vote amberText">CONDITION · more evidence needed</div></div>
      <div class="panel decision"><div><div class="eyebrow">INVESTMENT COMMITTEE DECISION</div><strong>PILOT</strong><p>Тест −3% на двух сегментах. Kill criterion: conversion uplift &lt; 12%.</p></div>${status('REVIEW IN 14 DAYS','amber')}</div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">06 · PRODUCT SYSTEM</div><h2>Начать с одного вопроса. Продолжить системой управления бизнесом.</h2></div>
    <p class="sectionIntro">BX развивается от быстрой диагностики к постоянному operating intelligence для собственника.</p></div>
    <div class="productGrid">
      ${[
        ['01','BX Quick Scan','Предварительная картина за несколько минут.','/quick-scan'],
        ['02','Business X-Ray','Полная диагностика, экономика, риски и приоритеты.','/xray'],
        ['03','BX Partner Board','Разбор отдельной инвестиционной или бизнес-гипотезы.','/board'],
        ['04','BX 90','90-дневный execution sprint после диагностики.','/solutions/execution'],
        ['05','BX Operating Partner','Постоянная работа с собственником и топ-командой.','/solutions/operating-partner'],
        ['06','BX Intelligence','Always-on рынок, сигналы и внешние риски.','/intelligence']
      ].map(x=>`<a class="panel product" href="${x[3]}"><small>${x[0]}</small><h3>${x[1]}</h3><p>${x[2]}</p><div class="arrow">Открыть →</div></a>`).join('')}
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">07 · CASE LOGIC</div><h2>Рекомендация важна только тогда, когда понятен её фактический эффект.</h2></div>
    <p class="sectionIntro">В кейсах BX мы отдельно показываем identified, approved, implemented и realized effect — без смешивания прогноза и факта.</p></div>
    <div class="caseStrip">
      <div class="panel caseHero"><div class="eyebrow">ILLUSTRATIVE CASE · INDUSTRIAL COMPANY</div><h3>Рост выручки без роста cash</h3>
        <div class="caseMetrics"><div class="caseMetric"><strong>₽84M</strong><span>identified EBITDA</span></div><div class="caseMetric"><strong>₽47M</strong><span>cash release</span></div><div class="caseMetric"><strong>14 w</strong><span>to first result</span></div></div>
        <div class="actions"><a class="btn ghost" href="/sample-report">ОТКРЫТЬ ДЕМО-КЕЙС →</a></div>
      </div>
      <div class="feed">
        <div class="feedItem"><small>IDENTIFIED</small><h4>Pricing architecture</h4><div class="goldText">₽24–31M EBITDA</div></div>
        <div class="feedItem"><small>IMPLEMENTED</small><h4>Inventory policy</h4><div class="greenText">₽18M cash released</div></div>
        <div class="feedItem"><small>REALIZED</small><h4>Sales productivity</h4><div class="greenText">+11% GP / FTE</div></div>
      </div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">08 · BX INTELLIGENCE</div><h2>Новости заканчиваются не пересказом, а действием.</h2></div>
    <p class="sectionIntro">Каждый материал отвечает: что произошло, кого затронет, какой cash/risk implication и что должен сделать собственник.</p></div>
    <div class="cards">
      <div class="card"><div class="eyebrow">BX SIGNAL</div><h3>Изменение стоимости капитала</h3><p>Что это значит для инвестиционного hurdle rate и M&A.</p></div>
      <div class="card"><div class="eyebrow">BOARD VIEW</div><h3>Новый отраслевой риск</h3><p>Market × CFO × Legal perspective в одном решении.</p></div>
      <div class="card"><div class="eyebrow">INDUSTRY PULSE</div><h3>Спрос, цены, capacity</h3><p>Только показатели, которые меняют решения собственника.</p></div>
    </div>
  </div></section>

  <section class="section tight"><div class="shell">
    <div class="panel" style="padding:34px;display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center">
      <div><div class="eyebrow">START HERE</div><h2 style="margin-top:8px">Не нужен ещё один отчёт. Нужна более качественная следующая ставка.</h2></div>
      <div><p class="sectionIntro">Начните с предварительного Scan. Он не обещает магическую точность — он показывает, где стоит копать глубже.</p>${btns()}</div>
    </div>
  </div></section>`;
}

function xray(){
  app.innerHTML = pageHero('PRODUCT','Business X-Ray','Полная диагностика компании с позиции собственника и инвестора: где создаётся стоимость, где она уничтожается и какое действие даст максимальный эффект первым.') + `
  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">INPUT → ENGINE → OUTPUT</div><h2>Диагностика превращает разрозненные данные в решение.</h2></div><p class="sectionIntro">BX не ограничивается score. Результат — экономическая карта бизнеса, перечень доказанных проблем и roadmap с owners, сроками и kill criteria.</p></div>
    <div class="cards">
      <div class="card"><div class="eyebrow">INPUT</div><h3>Data room</h3><p>Financials, CRM, sales, marketing, people, operations, contracts, interviews, market.</p></div>
      <div class="card"><div class="eyebrow">ENGINE</div><h3>BX Board + Evidence Layer</h3><p>Независимые функциональные заключения, conflict matrix, Red Team и инвестиционное решение.</p></div>
      <div class="card"><div class="eyebrow">OUTPUT</div><h3>Economic Action Map</h3><p>BX Score, critical findings, opportunity map, risks, 30/90/365 roadmap, expected impact.</p></div>
    </div>
  </div></section>
  <section class="section"><div class="shell">
    <div class="sectionHead"><div><div class="eyebrow">DELIVERY</div><h2>Как проходит X-Ray.</h2></div><p class="sectionIntro">Формат будет зависеть от масштаба и качества данных, но логика всегда одинакова: сначала доказательства, потом выводы.</p></div>
    <div class="timeline">
      ${[
        ['01','Intake & Data Confidence','Фиксируем вопрос собственника, data room и качество исходных данных.'],
        ['02','Functional Diagnostics','CFO, Commercial, Operations, Market, People, Tax, Legal, Investment анализируют компанию независимо.'],
        ['03','Conflict Matrix','Собираем расхождения между функциями, экономикой и управленческой логикой.'],
        ['04','Red Team','Атакуем наиболее привлекательные гипотезы и проверяем downside.'],
        ['05','Investment Committee','GO / GO WITH CONDITIONS / PILOT / HOLD / NO-GO по каждой ключевой ставке.'],
        ['06','90-Day Action Map','Owners, сроки, инвестиции, expected effect, kill criteria и система фактического контроля.']
      ].map(x=>`<div class="timelineStep"><div class="n">${x[0]}</div><div><h3>${x[1]}</h3><p>${x[2]}</p></div></div>`).join('')}
    </div>
  </div></section>`;
}

function board(){
  app.innerHTML = pageHero('BX PARTNER BOARD','Решение должно пережить конфликт.','BX Board собирает несколько независимых функциональных позиций, затем запускает Red Team и только после этого формирует решение для собственника.') + `
  <section class="section"><div class="shell"><div class="boardGrid">
    ${['Managing Partner','CFO','Commercial','Operations','Market Intelligence','Tax & Accounting','People & Organization','Investment & M&A','Data & Evidence','Legal & Regulatory','Delivery PMO','Red Team / Auditor'].map((x,i)=>`<div class="panel boardCard"><div class="eyebrow">AGENT ${String(i+1).padStart(2,'0')}</div><h3>${x}</h3><p class="muted">${i===11?'Ищет причины отказаться от идеи и атакует слабые допущения.':'Формирует независимую позицию в пределах своей функции.'}</p></div>`).join('')}
    <div class="panel decision"><div><div class="eyebrow">BOARD OUTPUT</div><strong>GO / PILOT / HOLD</strong><p>Решение всегда сопровождается условиями, evidence, owners и критериями пересмотра.</p></div>${status('BOARD PROTOCOL','green')}</div>
  </div></div></section>`;
}

function cases(){
  app.innerHTML = pageHero('CASES','Результат нельзя смешивать с прогнозом.','В каждом кейсе BX отдельно фиксирует identified, approved, implemented и realized effect — чтобы собственник видел, что действительно произошло.') + `
  <section class="section"><div class="shell">
    <div class="cards">
      ${[
        ['Industrial','Cash trapped in inventory','₽31–47M','PILOT'],
        ['B2B Services','Discount leakage','₽14–19M EBITDA','GO'],
        ['Retail','Low-performing SKU architecture','₽22–34M GP','GO WITH CONDITIONS'],
        ['Fitness','Sales productivity','+17% GP / FTE','PILOT'],
        ['Distribution','Working capital','−11 days CCC','GO'],
        ['Owner-led company','Management bottleneck','3 decisions delegated','HOLD → PILOT']
      ].map(x=>`<div class="card problemCard"><div><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3><div class="impact" style="font-size:22px;margin-top:15px">${x[2]}</div></div><div class="conflictLine">${status(x[3],x[3]==='GO'?'green':'amber')}</div></div>`).join('')}
    </div>
  </div></section>`;
}

function intelligence(){
  app.innerHTML = pageHero('BX INTELLIGENCE','Информация становится полезной только тогда, когда меняет решение.','BX Intelligence превращает новости, рыночные сдвиги и внешние риски в owner-level implications: деньги, риск, opportunity и recommended action.') + `
  <section class="section"><div class="shell"><div class="cards">
    ${[
      ['BX Signal','Короткий сигнал: что изменилось и почему это нельзя игнорировать.'],
      ['BX Radar','Сдвиги спроса, цен, capacity, регуляторики и конкуренции.'],
      ['BX Research','Глубокое исследование с evidence и экономическими выводами.'],
      ['BX Board View','Независимые позиции Board по одному событию.'],
      ['Industry Pulse','Отраслевой health-check с ключевыми метриками.'],
      ['CEO Brief','Еженедельная executive-сводка: что требует решения.']
    ].map(x=>`<div class="card problemCard"><div><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3></div><span class="arrow">↗</span></div>`).join('')}
  </div></div></section>`;
}

function methodology(){
  app.innerHTML = pageHero('METHODOLOGY','Уверенность должна быть доказуемой.','BX разделяет типы данных, маркирует uncertainty и заставляет каждый значимый вывод иметь источник, расчёт, owner и экономический смысл.') + `
  <section class="section"><div class="shell">
    <div class="cards">
      ${[
        ['FACT','Подтверждено первичным источником компании.'],
        ['CALCULATION','Получено формулой из известных данных.'],
        ['EXTERNAL DATA','Внешний рынок, исследования, публичные базы.'],
        ['ASSUMPTION','Явно обозначенное допущение, требующее проверки.'],
        ['EXPERT JUDGMENT','Профессиональная интерпретация, не маскируемая под факт.'],
        ['UNKNOWN','Данных недостаточно. Решение требует дополнительной проверки.']
      ].map(x=>`<div class="card"><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3></div>`).join('')}
    </div>
  </div></section>`;
}

function radarSVG(values){
  const labels=['Finance','Cash','Sales','Ops','People','Market'];
  const cx=160,cy=160,R=115,n=6;
  const pts = values.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const r=R*v/100;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]});
  const rings=[25,50,75,100].map(k=>{const p=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const r=R*k/100;return (cx+Math.cos(a)*r)+','+(cy+Math.sin(a)*r)}).join(' ');return `<polygon points="${p}" fill="none" stroke="#21323c" stroke-width="1"/>`}).join('');
  const axes=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*R}" y2="${cy+Math.sin(a)*R}" stroke="#21323c"/>`}).join('');
  const lbl=labels.map((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return `<text x="${cx+Math.cos(a)*(R+27)}" y="${cy+Math.sin(a)*(R+27)}" fill="#8fa0aa" font-size="10" text-anchor="middle" dominant-baseline="middle">${l}</text>`}).join('');
  return `<svg viewBox="0 0 320 320" width="320" height="320">${rings}${axes}<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="rgba(216,180,106,.18)" stroke="#d8b46a" stroke-width="2"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#f0d79a"/>`).join('')}${lbl}</svg>`;
}

const scanQuestions = [
  ['Что сейчас беспокоит больше всего?',['Прибыль','Cash','Продажи','Рост'],[1,0,1,2]],
  ['Как меняется выручка?',['Снижается','Стабильна','Растёт <15%','Растёт >15%'],[0,1,2,3]],
  ['Как часто возникают кассовые разрывы?',['Часто','Иногда','Редко','Нет'],[0,1,2,3]],
  ['Есть управленческий P&L по направлениям?',['Нет','Редко','Ежемесячно','Онлайн'],[0,1,2,3]],
  ['Собственник нужен в большинстве решений?',['Да','Часто','Иногда','Нет'],[0,1,2,3]],
  ['CRM позволяет видеть полную воронку?',['Нет','Частично','В основном','Да'],[0,1,2,3]],
  ['Есть KPI, связанные с экономическим результатом?',['Нет','У отдельных функций','У большинства','Да, сквозные'],[0,1,2,3]],
  ['Есть единый список приоритетных инициатив?',['Нет','Есть, но без owners','Есть owners','Есть owners + effect tracking'],[0,1,2,3]]
];
let scanStep=0, scanAnswers=[];

function scan(){
  scanStep=0;scanAnswers=[];drawScan();
}
function drawScan(){
  if(scanStep>=scanQuestions.length) return scanResult();
  const [q,opts] = scanQuestions[scanStep];
  app.innerHTML = `<section class="scanWrap">
    <div class="scanHead"><div><div class="eyebrow">BX QUICK SCAN</div><div class="muted">Предварительная диагностика</div></div><b>${scanStep+1} / ${scanQuestions.length}</b></div>
    <div class="progress"><i style="width:${(scanStep/scanQuestions.length)*100}%"></i></div>
    <div class="question">${q}</div>
    <div class="options">${opts.map((o,i)=>`<div class="option" data-i="${i}">${o}<small>0${i+1}</small></div>`).join('')}</div>
    <div class="scanControls"><button class="btn ghost" id="back" ${scanStep===0?'disabled':''}>← НАЗАД</button><button class="btn primary" id="next">ДАЛЕЕ →</button></div>
    <div class="micro">Quick Scan не рассчитывает денежный эффект без первичных данных компании.</div>
  </section>`;
  document.querySelectorAll('.option').forEach(el=>el.onclick=()=>{document.querySelectorAll('.option').forEach(x=>x.classList.remove('on'));el.classList.add('on')});
  document.getElementById('next').onclick=()=>{const e=document.querySelector('.option.on');if(!e)return alert('Выберите вариант');scanAnswers[scanStep]=+e.dataset.i;scanStep++;drawScan()};
  document.getElementById('back').onclick=()=>{if(scanStep>0){scanStep--;drawScan()}};
}
function scanResult(){
  const points=scanAnswers.map((a,i)=>scanQuestions[i][2][a]);
  const avg=points.reduce((a,b)=>a+b,0)/(points.length*3);
  const score=Math.round(42+avg*39);
  const vals=[
    Math.min(90,48+points[3]*11),
    Math.min(90,38+points[2]*13),
    Math.min(90,43+points[5]*12),
    Math.min(90,52+points[6]*9),
    Math.min(90,39+points[4]*12),
    Math.min(90,55+points[1]*8)
  ];
  app.innerHTML = `<section class="scanWrap" style="width:min(1080px,calc(100% - 40px))">
    <div class="eyebrow">PRELIMINARY BX RESULT</div>
    <div class="resultHero" style="margin-top:18px">
      <div class="panel resultScore"><div class="eyebrow">BX SCORE</div><div class="score">${score}<small>/100</small></div>${status('DATA CONFIDENCE: LOW','amber')}
        <div class="metricRows"><div class="metricRow"><span>Primary constraint</span><b>Cash conversion</b></div><div class="metricRow"><span>Secondary</span><b>Owner dependency</b></div><div class="metricRow"><span>Next step</span><b>Evidence collection</b></div></div>
      </div>
      <div class="panel radar">${radarSVG(vals)}</div>
    </div>
    <div class="resultGrid" style="margin-top:12px">
      <div class="panel resultMetric"><div class="eyebrow">CASH</div><strong class="redText">ATTENTION</strong><p class="muted">Нужно проверить CCC, DSO, запасы и cash conversion.</p></div>
      <div class="panel resultMetric"><div class="eyebrow">COMMERCIAL</div><strong class="amberText">REVIEW</strong><p class="muted">Проверить pricing, discount leakage и sales productivity.</p></div>
      <div class="panel resultMetric"><div class="eyebrow">MANAGEMENT</div><strong class="amberText">REVIEW</strong><p class="muted">Оценить owner dependency и качество decision system.</p></div>
      <div class="panel resultMetric"><div class="eyebrow">FINANCIAL EFFECT</div><strong>NOT CALCULATED</strong><p class="muted">Без финансовых данных BX не имитирует точность.</p></div>
    </div>
    <div class="actions"><a class="btn primary" href="/sample-report">ПОСМОТРЕТЬ ПОЛНЫЙ X-RAY →</a><a class="btn ghost" href="/quick-scan">ПРОЙТИ СНОВА</a></div>
  </section>`;
}

function report(){
  app.innerHTML = pageHero('SAMPLE REPORT','Industrial Company · Demo X-Ray','Демонстрационная версия отчёта. Все цифры вымышлены и нужны только для показа структуры результата.') + `
  <section class="section"><div class="shell">
    <div class="reportTop">
      <div class="panel reportScore"><div class="scoreline"><div><div class="eyebrow">BX SCORE</div><div class="score">58<small>/100</small></div></div>${status('GO WITH CONDITIONS')}</div>
        <div class="metricRows"><div class="metricRow"><span>Revenue</span><b>₽1.84B</b></div><div class="metricRow"><span>EBITDA</span><b>₽119M</b></div><div class="metricRow"><span>EBITDA margin</span><b>6.5%</b></div><div class="metricRow"><span>Data confidence</span><b>74%</b></div></div>
      </div>
      <div class="panel radar">${radarSVG([74,41,58,81,63,76])}</div>
    </div>
    <div class="panel" style="padding:24px;margin-top:14px;overflow:auto">
      <div class="eyebrow">TOP FINDINGS</div>
      <table class="reportTable"><thead><tr><th>Finding</th><th>Evidence</th><th>Potential</th><th>Investment</th><th>Decision</th></tr></thead><tbody>
      <tr><td>Pricing architecture</td><td>High / 86%</td><td>₽24–31M EBITDA</td><td>₽2–4M</td><td>GO</td></tr>
      <tr><td>Inventory policy</td><td>High / 91%</td><td>₽31–47M Cash</td><td>₽1–2M</td><td>PILOT</td></tr>
      <tr><td>Sales productivity</td><td>Med / 72%</td><td>₽18–27M EBITDA</td><td>₽4–6M</td><td>GO WITH CONDITIONS</td></tr>
      <tr><td>Low-performing SKU</td><td>Med / 68%</td><td>₽7–10M EBITDA</td><td>Minimal</td><td>PILOT</td></tr>
      </tbody></table>
    </div>
    <div class="twoCol" style="margin-top:14px">
      <div class="card"><div class="eyebrow">90-DAY PRIORITY</div><h3>Pricing + Inventory</h3><p>Два направления дают лучший баланс expected value / speed / execution risk.</p></div>
      <div class="card"><div class="eyebrow">CONDITION</div><h3>Validate elasticity first</h3><p>Перед масштабированием pricing change провести контролируемый двухсегментный pilot.</p></div>
    </div>
  </div></section>`;
}

function portal(){
  app.innerHTML = `<div class="portalShell">
    <aside class="portalSide"><b>BX / OWNER PORTAL</b><a class="active">Overview</a><a>Value map</a><a>Findings</a><a>Board decisions</a><a>Initiatives</a><a>Risks</a><a>Documents</a><a href="/">← Public site</a></aside>
    <main class="portalMain">
      <div class="portalTop"><div><div class="eyebrow">INDUSTRIAL COMPANY · DEMO</div><h1>Owner Overview</h1></div>${status('LAST REVIEW · 08 OCT','green')}</div>
      <div class="portalMetrics">
        <div class="panel portalMetric"><span class="muted">BX Score</span><strong>68/100</strong><small class="greenText">+7 vs previous</small></div>
        <div class="panel portalMetric"><span class="muted">Identified</span><strong>₽84M</strong><small>EBITDA opportunity</small></div>
        <div class="panel portalMetric"><span class="muted">Realized</span><strong class="greenText">₽27M</strong><small>verified effect</small></div>
        <div class="panel portalMetric"><span class="muted">Open decisions</span><strong>3</strong><small class="amberText">1 blocked</small></div>
      </div>
      <div class="healthGrid">
        <div class="panel" style="padding:22px"><div class="eyebrow">BUSINESS HEALTH</div><div class="healthList" style="margin-top:22px">
          ${[['Finance',74],['Commercial',58],['Operations',81],['Cash',49],['People',63],['Market',76]].map(x=>`<div class="healthRow"><span>${x[0]}</span><div class="bar"><i style="width:${x[1]}%"></i></div><b>${x[1]}</b></div>`).join('')}
        </div></div>
        <div class="panel" style="padding:22px"><div class="eyebrow">VALUE TRACKER</div><div class="metricRows">
          <div class="metricRow"><span>Identified</span><b>₽84M</b></div><div class="metricRow"><span>Approved</span><b>₽63M</b></div><div class="metricRow"><span>Implementation</span><b>₽48M</b></div><div class="metricRow"><span>Realized</span><b class="greenText">₽27M</b></div>
        </div><div class="progress" style="margin-top:18px"><i style="width:32%"></i></div></div>
      </div>
      <div class="panel" style="padding:22px;margin-top:12px;overflow:auto"><div class="eyebrow">BENEFITS TRACKER</div><table class="initiativeTable"><thead><tr><th>Initiative</th><th>Baseline</th><th>Target</th><th>Potential</th><th>Realized</th><th>Owner</th></tr></thead><tbody>
        <tr><td>Pricing</td><td>21% GM</td><td>24%</td><td>₽31M</td><td class="greenText">₽12M</td><td>CCO</td></tr>
        <tr><td>Inventory</td><td>97 days</td><td>70</td><td>₽28M Cash</td><td class="greenText">₽9M</td><td>COO</td></tr>
        <tr><td>Conversion</td><td>18%</td><td>23%</td><td>₽19M</td><td class="greenText">₽4M</td><td>Sales</td></tr>
      </tbody></table></div>
    </main>
  </div>`;
}

function solution(slug){
  const names={
    growth:['Growth','Рост, который увеличивает стоимость, а не только оборот.'],
    profit:['Profit','Где именно теряется маржа и какие действия меняют EBITDA.'],
    cash:['Cash','Working capital, CCC, DSO, inventory и cash conversion.'],
    sales:['Sales','Pricing, conversion, productivity и экономика коммерческой функции.'],
    operations:['Operations','Capacity, cost-to-serve, throughput и операционные ограничения.'],
    turnaround:['Turnaround','Приоритет ликвидности, survival horizon и быстрые решения.'],
    investment:['Investment','Expected value, downside, capital required и decision criteria.'],
    execution:['BX 90','90-дневный execution sprint после X-Ray.'],
    'operating-partner':['BX Operating Partner','Постоянная decision intelligence для собственника.']
  };
  const x=names[slug]||['BX Solution','Диагностика проблемы через экономику, риск и реализуемость.'];
  app.innerHTML=pageHero('SOLUTION',x[0],x[1])+`<section class="section"><div class="shell"><div class="cards">
    <div class="card"><div class="eyebrow">01</div><h3>Baseline</h3><p>Что происходит сейчас и чему можно доверять.</p></div>
    <div class="card"><div class="eyebrow">02</div><h3>Economic impact</h3><p>Как проблема проходит через EBITDA, cash и enterprise value.</p></div>
    <div class="card"><div class="eyebrow">03</div><h3>Decision</h3><p>Что делать первым, сколько это стоит и когда прекращать гипотезу.</p></div>
  </div></div></section>`;
}

const routes = {
  '/':home,'/xray':xray,'/board':board,'/cases':cases,'/intelligence':intelligence,
  '/methodology':methodology,'/quick-scan':scan,'/sample-report':report,'/portal-demo':portal
};
if(routes[path]) routes[path]();
else if(path.startsWith('/solutions/')) solution(path.split('/').pop());
else app.innerHTML=pageHero('STAGING','Страница в разработке','Маршрут уже зарезервирован в архитектуре BX.');
