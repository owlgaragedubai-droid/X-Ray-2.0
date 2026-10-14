const app = document.getElementById('app');
const path = location.pathname.replace(/\/$/,'') || '/';

const state = (label, cls='warn') => `<span class="state ${cls}">${label}</span>`;
const status = (label, cls='analysis') => `<span class="statusLabel ${cls}">${label}</span>`;
const actions = (primaryHref='/company-check.html', primaryLabel='ПРОВЕРИТЬ КОМПАНИЮ', secondaryHref='/products', secondaryLabel='ПОСМОТРЕТЬ ПРОДУКТЫ') => `
  <div class="actions">
    <a class="btn primary" href="${primaryHref}">${primaryLabel} →</a>
    <a class="btn ghost" href="${secondaryHref}">${secondaryLabel}</a>
  </div>`;
const pageHero = (section,title,lead,extra='') => `
  <section class="pageHero shell">
    <div class="crumb"><a href="/">BX</a> / ${section}</div>
    <div class="eyebrow">${section}</div>
    <h1>${title}</h1>
    <p class="lead">${lead}</p>
    ${extra}
  </section>`;
const scopeList = items => `<div class="projectScope">${items.map(x=>`<div><i></i><span>${x}</span></div>`).join('')}</div>`;

const projects = [
  {
    slug:'sssr',
    name:'С.С.С.Р.',
    type:'Сеть фитнес-клубов',
    title:'Антикризисный X-Ray и маркетинговая стратегия 2027',
    status:'Аналитический проект',
    cls:'analysis',
    summary:'Карта экономики сети, слабых и сильных клубов, расходов, маркетинга, персональных тренировок, корпоративных продаж и 90-дневного контура внедрения.',
    tasks:['Нормализация экономики по каждому объекту','Сравнение сильных и слабых клубов','Маркетинговая стратегия по 26 объектам','Реестр решений и контроль подтверждённого эффекта'],
    caveat:'Рассчитанный потенциал не является реализованным эффектом до подтверждения финансовым контуром и внедрения.'
  },
  {
    slug:'nfs',
    name:'НФС',
    type:'Национальное фитнес-сообщество',
    title:'Модель отраслевой платформы: данные, поставщики и управление',
    status:'Публичный X-Ray',
    cls:'analysis',
    summary:'Разбор НФС и связанного коммерческого контура: влияние, данные, образование, мероприятия, поставщики, монетизация и границы между общественной миссией и бизнесом.',
    tasks:['Карта экосистемы НФС и Fit Hit','Модель отраслевой платформы данных','Проверка правовых и налоговых границ','100-дневный пилот трёх коммерческих продуктов'],
    caveat:'Выводы основаны на открытых данных и требуют внутреннего финансового и юридического Data Room.'
  },
  {
    slug:'fiton',
    name:'Fiton Store',
    type:'B2B-фитнес-оборудование',
    title:'Восстановление продаж, Sales Radar и продуктовая экономика',
    status:'Действующий проект собственника',
    cls:'active',
    summary:'Рынок, целевые компании, открытия и реконструкции клубов, тендеры, линейка оборудования, сервисные продукты и коммерческая система Fiton / Power Trend.',
    tasks:['Sales Radar по новым объектам и переоснащению','База целевых B2B-компаний и ЛПР','Анализ продуктовой линейки и цен','Сервисный прайс и дополнительные продукты'],
    caveat:'Коммерческий результат должен подтверждаться фактически полученными заказами, а не количеством найденных лидов.'
  },
  {
    slug:'bx',
    name:'BX',
    type:'Собственный продукт',
    title:'Система решений собственника: сайт, Совет BX и Boardroom',
    status:'Пилот',
    cls:'pilot',
    summary:'Создание продукта диагностики бизнеса: Совет из 12 функций, независимая проверка, реестр решений, анализ компаний по ИНН, CRM и ежедневный BX-радар.',
    tasks:['Продуктовая архитектура Business X-Ray','Совет BX и независимая проверка','Boardroom, реестр решений и контроль эффекта','Проверка компаний по ИНН и квалификация лидов'],
    caveat:'Продукт находится на стадии проверки спроса: задача — провести первые два платных пилота до масштабирования команды.'
  }
];

function setMeta(title, description){
  document.title = title;
  const m = document.querySelector('meta[name="description"]');
  if(m) m.setAttribute('content',description);
}

function home(){
  setMeta('BX — система решений собственника','Диагностика бизнеса, независимая проверка гипотез и управляемое внедрение решений собственника.');
  app.innerHTML = `
    <section class="hero shell">
      <div>
        <div class="eyebrow">СИСТЕМА РЕШЕНИЙ СОБСТВЕННИКА</div>
        <h1>Не ещё один отчёт. Более качественное следующее решение.</h1>
        <p class="lead">BX соединяет данные, экономику, рынок, людей и риски в одну понятную картину — а затем заставляет идею пройти независимую проверку до того, как собственник вложит деньги и репутацию.</p>
        ${actions('/company-check.html','ПРОВЕРИТЬ КОМПАНИЮ','/about','УЗНАТЬ, КАК УСТРОЕН BX')}
        <div class="micro">Сначала доказательства. Потом вывод. Потом действие.</div>
      </div>
      <div class="panel heroMark">
        <div class="scanLine"></div>
        <div class="heroMarkTop"><strong>Бизнес становится понятным, когда видна связь решений с деньгами.</strong><span>BX / 2026</span></div>
        <div class="heroOrbit">
          <div class="orbitCenter">РЕШЕНИЕ<br>СОБСТВЕННИКА</div>
          <span class="orbitNode o1">Финансы</span><span class="orbitNode o2">Продажи</span><span class="orbitNode o3">Операции</span><span class="orbitNode o4">Люди</span><span class="orbitNode o5">Рынок</span>
        </div>
        <div class="heroMarkBottom"><div><b>Данные</b><span>что действительно известно</span></div><div><b>Конфликт</b><span>где функции не согласны</span></div><div><b>Действие</b><span>что делать первым</span></div></div>
      </div>
    </section>

    <section class="section"><div class="shell">
      <div class="sectionHead"><div><div class="eyebrow">ЧТО ТАКОЕ BX</div><h2>Партнёр собственника в сложных решениях.</h2></div><p class="sectionIntro">Мы не подменяем руководителей и не продаём универсальные рецепты. Мы помогаем увидеть систему бизнеса, проверить гипотезу и собрать маршрут исполнения.</p></div>
      <div class="productGrid">
        <a class="panel productCard" href="/xray"><div class="n">01</div><h3>Полная диагностика</h3><p>Где создаётся и теряется стоимость, что подтверждено данными и какое решение приоритетно.</p><span class="arrow">Открыть продукт →</span></a>
        <a class="panel productCard" href="/board"><div class="n">02</div><h3>Совет BX</h3><p>Независимые позиции финансов, продаж, операций, рынка, права, людей и критического контура.</p><span class="arrow">Как работает Совет →</span></a>
        <a class="panel productCard" href="/solutions/execution"><div class="n">03</div><h3>90 дней изменений</h3><p>Владельцы, сроки, условия, контроль эффекта и регулярные решения собственника.</p><span class="arrow">Посмотреть формат →</span></a>
        <a class="panel productCard" href="/tools"><div class="n">04</div><h3>Цифровые инструменты</h3><p>Проверка компании по ИНН, быстрая диагностика, Boardroom, CRM и BX-радар.</p><span class="arrow">Открыть инструменты →</span></a>
      </div>
    </div></section>

    <section class="section"><div class="shell">
      <div class="profileHero">
        <div class="panel profileVisual"><div class="profileMonogram">СС</div><h2>Сергей<br>Савинов</h2><p>Управляющий партнёр BX. Собственник-практик и управленец с более чем двадцатилетним опытом в фитнес-индустрии.</p><div class="profileRole">Управляющий партнёр</div></div>
        <div class="panel profileContent"><div class="eyebrow">ЛИЧНАЯ ОТВЕТСТВЕННОСТЬ</div><h1>Ключевое решение не передаётся алгоритму.</h1><p class="lead">Сергей ведёт первую стратегическую встречу, формулирует вопрос собственника, защищает итоговый вывод и отвечает за границы обещаний клиенту.</p><div class="factGrid"><div class="fact"><b>20+ лет</b><span>управленческого опыта в фитнес-индустрии</span></div><div class="fact"><b>12 функций</b><span>в составе Совета BX</span></div><div class="fact"><b>Никакой магии</b><span>эффект только после данных и внедрения</span></div></div>${actions('/sergey-savinov','ПОДРОБНЕЕ О СЕРГЕЕ','/contact','ОБСУДИТЬ ЗАДАЧУ')}</div>
      </div>
    </div></section>

    <section class="section"><div class="shell">
      <div class="sectionHead"><div><div class="eyebrow">ПРОЕКТЫ</div><h2>Не витрина обещаний. Карта реальной работы.</h2></div><p class="sectionIntro">На сайте разделены действующие проекты собственника, публичные аналитические разборы и демонстрационные сценарии. Потенциал никогда не выдаётся за реализованный результат.</p></div>
      <div class="projectGrid">
        ${projects.slice(0,3).map((p,i)=>`<a class="panel projectCard ${i===0?'featured':''}" href="/projects/${p.slug}"><div><div class="projectMeta"><span>${p.type}</span>${status(p.status,p.cls)}</div><h3>${p.title}</h3><p>${p.summary}</p><div class="projectLink">Открыть проект →</div></div>${i===0?`<div>${scopeList(p.tasks)}</div>`:''}</a>`).join('')}
      </div>
      <div class="actions"><a class="btn ghost" href="/projects">ВСЕ ПРОЕКТЫ →</a></div>
    </div></section>

    <section class="section"><div class="shell">
      <div class="sectionHead"><div><div class="eyebrow">МЕТОД</div><h2>Сильная идея должна пережить несогласие.</h2></div><p class="sectionIntro">BX не ищет подтверждение замыслу собственника. Он проверяет экономику, данные, способность выполнить решение и возможный ущерб.</p></div>
      <div class="methodFlow">
        ${[['01','Вопрос','Что именно должен решить собственник'],['02','Данные','Чему можно доверять'],['03','Анализ','Независимые позиции функций'],['04','Конфликт','Где выводы расходятся'],['05','Проверка','Почему идея может не сработать'],['06','Решение','Запускать, проверять, отложить или отказаться']].map(x=>`<div class="methodStep"><div class="n">${x[0]}</div><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}
      </div>
      <div class="actions"><a class="btn ghost" href="/methodology">ПОЛНАЯ МЕТОДОЛОГИЯ →</a></div>
    </div></section>

    <section class="section tight"><div class="shell"><div class="panel ctaBand"><div><div class="eyebrow">НАЧАТЬ С ПРОСТОГО</div><h2>Проверьте компанию или сформулируйте вопрос собственника.</h2></div><div><p>По ИНН BX соберёт открытый профиль компании. Для полноценного решения потребуется Data Room и интервью.</p>${actions('/company-check.html','ПРОВЕРИТЬ ПО ИНН','/contact','ЗАПРОСИТЬ РАЗБОР')}</div></div></div></section>`;
}

function about(){
  setMeta('О проекте BX — история и принципы','Как появился BX, зачем нужен Совет из 12 функций и почему независимая проверка встроена в каждый проект.');
  app.innerHTML = pageHero('О ПРОЕКТЕ','BX вырос из практической потребности собственника: видеть не отчёты, а последствия решений.','Проект соединяет управленческий опыт Сергея Савинова, независимую функциональную аналитику и систему контроля исполнения.',actions('/sergey-savinov','СЕРГЕЙ САВИНОВ','/projects','ПРОЕКТЫ')) + `
  <section class="section"><div class="shell"><div class="storyGrid">
    <div class="panel storyLead"><div class="eyebrow">ИСТОРИЯ</div><h3>От управления бизнесом — к системе, которая помогает собственнику думать яснее.</h3><p>BX создаётся не как классическая консалтинговая компания с красивыми обещаниями. На старте это компактная партнёрская модель: Сергей, Совет BX, существующий ресурс и внешние специалисты только под оплаченный проект.</p><div class="notice">Главная задача пилотной стадии — подтвердить спрос, цену, качество результата, доступность данных и реальную экономику первых двух проектов.</div></div>
    <div class="timeline">
      <div class="timelineStep"><div class="year">20+ лет</div><div><h3>Практика управления</h3><p>Опыт в фитнес-индустрии, операционном управлении, продажах, развитии сети и работе собственника.</p></div></div>
      <div class="timelineStep"><div class="year">2026</div><div><h3>Business X-Ray</h3><p>Сформирована методология диагностики, которая связывает деньги, продажи, операции, рынок, людей и риски.</p></div></div>
      <div class="timelineStep"><div class="year">2026</div><div><h3>Совет из 12 функций</h3><p>Финансы, коммерция, операции, рынок, данные, право, налоги, люди, инвестиции, внедрение и независимая проверка.</p></div></div>
      <div class="timelineStep"><div class="year">Сейчас</div><div><h3>Проверка продукта</h3><p>Первые платные диагностические пилоты, Boardroom, цифровые инструменты, CRM и рабочая панель собственника.</p></div></div>
    </div>
  </div></div></section>
  <section class="section"><div class="shell"><div class="sectionHead"><div><div class="eyebrow">ПРИНЦИПЫ</div><h2>Чего BX не делает.</h2></div><p class="sectionIntro">Доверие важнее краткосрочной конверсии. Поэтому ограничения продукта сформулированы так же ясно, как и преимущества.</p></div><div class="roleGrid">
    ${[['Не гарантирует прибыль без данных','Мы обещаем качество процесса и доказательность, но не результат, который зависит от действий клиента.'],['Не прячет неопределённость','Факт, расчёт, предположение, внешние данные и неизвестное маркируются отдельно.'],['Не начинает масштабирование с веры','Если гипотезу можно проверить дешёвым пилотом, сначала проводится пилот.'],['Не считает презентацию внедрением','Эффект разделяется на найденный, утверждённый, внедрённый, реализованный и подтверждённый.']].map(x=>`<div class="panel roleCard"><div class="eyebrow">ОГРАНИЧЕНИЕ</div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}
  </div></div></section>`;
}

function sergey(){
  setMeta('Сергей Савинов — управляющий партнёр BX','Роль Сергея Савинова в Business X-Ray: вопрос собственника, ключевые интервью, итоговое решение и границы ответственности.');
  app.innerHTML = `
  <section class="pageHero shell"><div class="crumb"><a href="/">BX</a> / Сергей Савинов</div><div class="profileHero">
    <div class="panel profileVisual"><div class="profileMonogram">СС</div><h2>Сергей<br>Савинов</h2><p>Управляющий партнёр BX.</p><div class="profileRole">Партнёр собственника по решениям</div></div>
    <div class="panel profileContent"><div class="eyebrow">УПРАВЛЯЮЩИЙ ПАРТНЁР</div><h1>Личная ответственность за вопрос, вывод и границы обещаний.</h1><p class="lead">Более двадцати лет практического опыта в фитнес-индустрии. В BX Сергей соединяет позицию собственника, экономику проекта и способность команды реально выполнить решение.</p>${actions('/contact','ОБСУДИТЬ ЗАДАЧУ','/projects','ПОСМОТРЕТЬ ПРОЕКТЫ')}</div>
  </div></section>
  <section class="section"><div class="shell"><div class="sectionHead"><div><div class="eyebrow">РОЛЬ В BX</div><h2>Что Сергей делает лично.</h2></div><p class="sectionIntro">Технология ускоряет анализ, но ключевое доверие и ответственность остаются человеческими.</p></div><div class="roleGrid">
    ${[['Формулирует вопрос собственника','Отделяет симптом от решения, которое действительно влияет на капитал и свободный денежный поток.'],['Проводит ключевые интервью','Собственник, генеральный директор, финансовый и коммерческий контур.'],['Защищает итоговое решение','Объясняет не только что делать, но и почему альтернативы слабее.'],['Имеет право отказаться','Проект не принимается, если клиент не даёт данные, полномочия или требует необоснованной гарантии.']].map(x=>`<div class="panel roleCard"><div class="eyebrow">ОТВЕТСТВЕННОСТЬ</div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}
  </div></div></section>
  <section class="section"><div class="shell"><div class="panel redTeam"><div class="eyebrow">ЛИЧНОЕ ПРАВИЛО</div><h3>Не продавать клиенту уверенность, которой нет в данных.</h3><p>BX не обещает рост прибыли, если не определена исходная точка, нет полномочий на внедрение или результат зависит от решений самого клиента.</p><div class="redList"><div><b>Без данных</b><br><span class="muted">только предварительная гипотеза</span></div><div><b>Без полномочий</b><br><span class="muted">нет ответственности за внедрение</span></div><div><b>Без формулы</b><br><span class="muted">нет success fee</span></div></div></div></div></section>`;
}

function products(){
  setMeta('Продукты BX','Полная диагностика, Совет BX, 90 дней изменений, партнёр собственника и цифровые инструменты.');
  app.innerHTML = pageHero('ПРОДУКТЫ','Начать с одного вопроса. Продолжить системой управления решениями.','Продуктовая лестница устроена так, чтобы не продавать клиенту больше, чем он готов доказать и внедрить.',actions('/contact','ОБСУДИТЬ ЗАДАЧУ','/tools','ОТКРЫТЬ ИНСТРУМЕНТЫ')) + `
  <section class="section"><div class="shell"><div class="productGrid">
    ${[
      ['01','Сессия собственника','Одна встреча, формулировка реального вопроса и решение: нужен ли полноценный X-Ray.','/contact'],
      ['02','Business X-Ray','3–5 недель: данные, независимые заключения, карта потерь, риски и план на 90 дней.','/xray'],
      ['03','Совет BX','Проверка отдельной инвестиционной или управленческой гипотезы до запуска.','/board'],
      ['04','90 дней изменений','Управляемое внедрение с владельцами, условиями, контролем эффекта и критериями остановки.','/solutions/execution'],
      ['05','Партнёр собственника','Регулярный Boardroom и поддержка ключевых решений компании.','/solutions/operating-partner'],
      ['06','Аналитика и радар','Отраслевые сигналы, анализ компаний, лиды и инструменты собственника.','/tools']
    ].map(x=>`<a class="panel productCard" href="${x[3]}"><div class="n">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><span class="arrow">Подробнее →</span></a>`).join('')}
  </div></div></section>`;
}

function projectsPage(){
  setMeta('Проекты BX','С.С.С.Р., НФС, Fiton Store и развитие продукта BX — с честным разделением аналитики, гипотез и реализованного результата.');
  app.innerHTML = pageHero('ПРОЕКТЫ','Что мы уже разбираем и строим.','Каждый проект маркируется по типу: действующая работа, публичный аналитический X-Ray или пилот собственного продукта.',actions('/contact','ОБСУДИТЬ СВОЙ ПРОЕКТ','/methodology','КАК МЫ РАБОТАЕМ')) + `
  <section class="section"><div class="shell"><div class="projectGrid">${projects.map(p=>`<a class="panel projectCard" href="/projects/${p.slug}"><div class="projectMeta"><span>${p.type}</span>${status(p.status,p.cls)}</div><h3>${p.title}</h3><p>${p.summary}</p><div class="projectLink">Открыть проект →</div></a>`).join('')}</div></div></section>`;
}

function projectDetail(slug){
  const p = projects.find(x=>x.slug===slug);
  if(!p) return notFound();
  setMeta(`${p.name} — проект BX`,p.summary);
  app.innerHTML = pageHero(p.name,p.title,p.summary,`<div class="actions">${status(p.status,p.cls)}<a class="btn ghost" href="/projects">ВСЕ ПРОЕКТЫ</a></div>`) + `
  <section class="section"><div class="shell"><div class="caseLayout">
    <aside class="panel caseAside"><div class="eyebrow">КАРТОЧКА ПРОЕКТА</div><h3>${p.name}</h3><p>${p.type}</p><div class="miniList"><div><b>Статус</b><br>${p.status}</div><div><b>Фокус</b><br>${p.tasks[0]}</div><div><b>Принцип</b><br>Эффект только после подтверждения</div></div></aside>
    <div class="caseBody">
      <div class="panel caseSection"><div class="eyebrow">ЧТО РАЗБИРАЕМ</div><h2>Система, а не отдельная функция.</h2>${scopeList(p.tasks)}</div>
      <div class="panel caseSection"><div class="eyebrow">КАКОЙ РЕЗУЛЬТАТ СОЗДАН</div><h2>Артефакты для решения собственника.</h2><p>Карта бизнеса, ключевые конфликты, независимая проверка, условия запуска, риски, план действий и формат контроля эффекта.</p></div>
      <div class="panel caseSection"><div class="eyebrow">ЧЕСТНАЯ ГРАНИЦА</div><h2>Что нельзя выдавать за факт.</h2><div class="warning">${p.caveat}</div></div>
      <div class="panel caseSection"><div class="eyebrow">СЛЕДУЮЩИЙ ШАГ</div><h2>От аналитики — к проверяемому пилоту.</h2><p>Следующий этап начинается только после согласования исходной точки, владельцев, данных и критериев остановки.</p>${actions('/contact','ОБСУДИТЬ ПОДОБНЫЙ ПРОЕКТ','/board','ПОСМОТРЕТЬ СОВЕТ BX')}</div>
    </div>
  </div></div></section>`;
}

function board(){
  setMeta('Совет BX — 12 независимых функций','Как Совет BX проверяет бизнес-гипотезы, фиксирует конфликты и формирует решение собственника.');
  const members = [
    ['01','Управляющий партнёр','Формулирует вопрос и собирает единое решение.'],['02','Финансы','Проверяет прибыль, деньги, устойчивость и исходную точку.'],['03','Коммерция','Спрос, цена, продажи, клиенты и рост.'],['04','Операции','Способность реально выполнить решение.'],['05','Рынок','Конкуренты, спрос, изменения и внешние ограничения.'],['06','Независимый критик','Ищет причины отказаться от привлекательной идеи.'],['07','Налоги и учёт','Налоговые и бухгалтерские последствия.'],['08','Люди и организация','Роли, мотивация, загрузка и зависимость от ключевых людей.'],['09','Инвестиции и сделки','Капитал, альтернативы, доходность и стоимость бизнеса.'],['10','Данные и доказательства','Качество источников, расчётов и предположений.'],['11','Право и регулирование','Договоры, обязательства, лицензии и репутационные риски.'],['12','Внедрение','План, владельцы, сроки, эффект и дисциплина исполнения.']
  ];
  app.innerHTML = pageHero('СОВЕТ BX','Одно решение. Двенадцать независимых взглядов.','Функции сначала формируют позиции независимо. Затем фиксируются конфликты, проводится критическая проверка и только после этого собственник получает итог.',actions('/contact','ВЫНЕСТИ ВОПРОС НА СОВЕТ','/methodology','МЕТОДОЛОГИЯ')) + `
  <section class="section"><div class="shell"><div class="boardGrid">${members.map(x=>`<div class="panel boardMember"><small>${x[0]}</small><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></div></section>
  <section class="section"><div class="shell"><div class="panel redTeam"><div class="eyebrow">НЕЗАВИСИМАЯ ПРОВЕРКА</div><h3>Задача критического контура — не улучшить презентацию, а попытаться остановить плохое решение.</h3><p>Он проверяет экономику, качество данных, способность внедрить решение, юридические обязательства и максимальный downside.</p><div class="redList"><div><b>Финансовое veto</b><br><span class="muted">нет исходной точки или формулы</span></div><div><b>Veto данных</b><br><span class="muted">вывод стоит на гипотезах</span></div><div><b>Veto внедрения</b><br><span class="muted">нет владельца и полномочий</span></div></div></div></div></section>`;
}

function methodology(){
  setMeta('Методология BX','Доказательства, уровень уверенности, независимые заключения, конфликт, критическая проверка и решение.');
  app.innerHTML = pageHero('МЕТОДОЛОГИЯ','Уверенность должна быть доказуемой.','BX отделяет факт от расчёта и предположения, а найденный потенциал — от реально подтверждённого эффекта.',actions('/board','СОВЕТ BX','/tools','ИНСТРУМЕНТЫ')) + `
  <section class="section"><div class="shell"><div class="evidenceGrid">
    ${[['ФАКТ','Подтверждён первичным источником компании.'],['РАСЧЁТ','Получен понятной формулой из известных данных.'],['ВНЕШНИЕ ДАННЫЕ','Рынок, государственные реестры и публичные источники.'],['ПРЕДПОЛОЖЕНИЕ','Гипотеза, которую ещё нужно проверить.'],['ЭКСПЕРТНАЯ ОЦЕНКА','Профессиональная интерпретация, не замаскированная под факт.'],['НЕИЗВЕСТНО','Данных недостаточно — уверенный вывод запрещён.']].map(x=>`<div class="panel evidenceCard"><span class="evidenceTag">${x[0]}</span><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}
  </div></div></section>
  <section class="section"><div class="shell"><div class="sectionHead"><div><div class="eyebrow">ПОЛНЫЙ ЦИКЛ</div><h2>От вопроса до подтверждённого результата.</h2></div><p class="sectionIntro">Ни одна цифра эффекта не считается достигнутой до финансового подтверждения.</p></div><div class="methodFlow">${[['01','Постановка','цель, горизонт, бюджет, ограничения'],['02','Данные','качество источников и пробелы'],['03','Заключения','независимые позиции функций'],['04','Конфликт','расхождения и альтернативы'],['05','Проверка','возражения, veto, downside'],['06','Решение','условия, действия, эффект, review']].map(x=>`<div class="methodStep"><div class="n">${x[0]}</div><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div></div></section>`;
}

function tools(){
  setMeta('Инструменты BX','Проверка компании по ИНН, быстрая диагностика, демонстрационный отчёт и кабинет собственника.');
  app.innerHTML = pageHero('ИНСТРУМЕНТЫ','Не отдельная тестовая страница, а вход в продукт BX.','Инструменты помогают начать разговор и собрать предварительную картину. Полноценное решение требует данных компании и интервью.',actions('/company-check.html','ПРОВЕРИТЬ ПО ИНН','/quick-scan','БЫСТРАЯ ДИАГНОСТИКА')) + `
  <section class="section"><div class="shell"><div class="toolsGrid">
    ${[
      ['⌕','Проверка компании по ИНН','Открытые реестры, регистрационный статус, финансовый снимок, сигналы и вопросы для первой встречи.','/company-check.html'],
      ['◌','Быстрая диагностика','Предварительные вопросы по деньгам, продажам, управлению и прозрачности бизнеса.','/quick-scan'],
      ['▤','Пример результата','Как BX объясняет главную проблему, причины, действия и ограничения.','/sample-report'],
      ['⌘','Кабинет собственника','Демонстрация карты здоровья бизнеса, решений и статуса изменений.','/portal-demo'],
      ['◎','Демо-путь лида','Как компания проходит диагностику и попадает во внутреннюю базу.','/demo/aluminstar'],
      ['↗','Boardroom и BX-радар','Реестр решений, задачи, риски и ежедневный контур собственника.','/about']
    ].map(x=>`<a class="panel toolCard" href="${x[3]}"><div class="toolIcon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><span class="arrow">Открыть →</span></a>`).join('')}
  </div></div></section>`;
}

function intelligence(){
  setMeta('Аналитика BX','Материалы о решениях собственника, данных, рисках, росте и внедрении.');
  app.innerHTML = pageHero('АНАЛИТИКА','Информация полезна только тогда, когда меняет решение.','Материалы BX заканчиваются не пересказом новости, а последствиями для денег, риска и следующего действия.',actions('/projects','ПРОЕКТЫ','/contact','ПРЕДЛОЖИТЬ ТЕМУ')) + `
  <section class="section"><div class="shell"><div class="articleGrid">
    ${[
      ['Принцип BX','Почему выручка не равна стоимости бизнеса','Рост оборота может ухудшать деньги, маржу и управляемость.'],
      ['Совет BX','Зачем хорошей идее сильное несогласие','Конфликт функций защищает собственника от красивой, но слабой ставки.'],
      ['Внедрение','Почему найденный эффект ещё не результат','Пока нет владельца, срока и финансового подтверждения, существует только гипотеза.'],
      ['Данные','Как отличить факт от уверенного мнения','Прозрачная маркировка данных снижает риск решения на ложной точности.'],
      ['Red Team','Когда консультант обязан сказать «нет»','Платящий клиент тоже может быть плохим проектом.'],
      ['Boardroom','Зачем компании реестр решений','Он сохраняет, что мы знали, почему решили и что произошло на самом деле.']
    ].map(x=>`<article class="panel articleCard"><small>${x[0]}</small><h3>${x[1]}</h3><p>${x[2]}</p><span class="arrow">Материал готовится →</span></article>`).join('')}
  </div></div></section>`;
}

function contact(){
  setMeta('Связаться с BX','Оставить заявку на диагностику бизнеса или проверку управленческой гипотезы.');
  app.innerHTML = pageHero('ЗАПРОСИТЬ РАЗБОР','Начните с вопроса, который нельзя решить ещё одной планёркой.','Для предварительной квалификации нужен ИНН компании и короткое описание задачи.') + `
  <section class="section noLine"><div class="shell"><div class="contactLayout">
    <div class="panel contactIntro"><div class="eyebrow">КАК НАЧАТЬ</div><h2>Три шага до содержательного разговора.</h2><p>Заявка не означает автоматическую продажу проекта. Сначала BX проверяет, есть ли задача, данные и основания двигаться дальше.</p><div class="contactSteps"><div><i>1</i><span><b>Компания и ИНН</b><br><span class="muted">проверяем открытый контур</span></span></div><div><i>2</i><span><b>Вопрос собственника</b><br><span class="muted">что именно нужно решить</span></span></div><div><i>3</i><span><b>Квалификация</b><br><span class="muted">пилот, встреча или честный отказ</span></span></div></div></div>
    <form class="panel contactForm" id="leadForm"><div class="eyebrow">ЗАЯВКА</div><div class="formGrid"><label>Компания<input id="company" required placeholder="Название компании"></label><label>ИНН<input id="inn" required inputmode="numeric" maxlength="12" placeholder="10 или 12 цифр"></label><label>Ваша роль<input id="role" placeholder="Собственник / CEO / CFO"></label><label>Формат<select id="request"><option>Полная диагностика бизнеса</option><option>Проверка отдельного решения</option><option>90 дней изменений</option><option>Партнёр собственника</option></select></label></div><label>Главный вопрос<textarea id="note" rows="5" placeholder="Что происходит и какое решение вы хотите принять?"></textarea></label><div class="formNote">Отправляя заявку, вы соглашаетесь на обработку указанных данных для связи и предварительного анализа компании.</div><button class="btn primary" type="submit">ОТПРАВИТЬ ЗАЯВКУ →</button><div id="formState"></div></form>
  </div></div></section>`;
  const form = document.getElementById('leadForm');
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const button=form.querySelector('button'); const box=document.getElementById('formState');
    button.disabled=true; button.textContent='ОБРАБАТЫВАЕМ...'; box.innerHTML='';
    try{
      const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({company:document.getElementById('company').value,inn:document.getElementById('inn').value,contactRole:document.getElementById('role').value,request:document.getElementById('request').value,note:document.getElementById('note').value,source:'Основной сайт BX',sourceType:'Сайт'})});
      const data=await response.json(); if(!response.ok||!data.ok) throw new Error(data.error||'Не удалось отправить заявку');
      box.innerHTML=`<div class="formSuccess"><b>Заявка сохранена.</b><br>Карточка ${data.lead.id} создана. BX прикрепит к ней предварительный открытый анализ компании.</div>`; form.reset();
    }catch(err){box.innerHTML=`<div class="warning">${err.message}</div>`;}
    finally{button.disabled=false;button.textContent='ОТПРАВИТЬ ЗАЯВКУ →';}
  });
}

const scanQuestions = [
  ['Что сейчас беспокоит больше всего?',['Прибыль','Деньги на счетах','Продажи','Рост']],
  ['Как меняется выручка?',['Снижается','Почти не меняется','Растёт умеренно','Растёт быстро']],
  ['Как часто не хватает денег на текущие платежи?',['Часто','Иногда','Редко','Практически никогда']],
  ['Насколько понятно, какие направления действительно прибыльны?',['Практически непонятно','Есть примерная картина','Понятно по основным направлениям','Понятно регулярно и подробно']],
  ['Насколько бизнес зависит от личного участия собственника?',['Очень сильно','Сильно','Умеренно','Незначительно']],
  ['Насколько прозрачна работа отдела продаж?',['Почти не видна','Видна частично','В основном понятна','Полностью прозрачна']],
  ['Есть ли у руководителей понятные показатели результата?',['Нет','Только у части','У большинства','Да, связаны с результатом бизнеса']],
  ['Есть ли единый список главных изменений?',['Нет','Есть, но без ответственных','Есть ответственные','Есть контроль результата']]
];
let scanStep=0, scanAnswers=[];
function scan(){scanStep=0;scanAnswers=[];drawScan();}
function drawScan(){
  setMeta('Быстрая диагностика BX','Предварительная диагностика зон внимания бизнеса.');
  if(scanStep>=scanQuestions.length) return scanResult();
  const [q,opts]=scanQuestions[scanStep];
  app.innerHTML=`<section class="scanWrap"><div class="scanHead"><div><div class="eyebrow">БЫСТРАЯ ДИАГНОСТИКА</div><div class="muted">Предварительная оценка без регистрации</div></div><b>${scanStep+1} из ${scanQuestions.length}</b></div><div class="progress"><i style="width:${scanStep/scanQuestions.length*100}%"></i></div><div class="question">${q}</div><div class="options">${opts.map((o,i)=>`<div class="option" data-i="${i}">${o}<small>выбрать</small></div>`).join('')}</div><div class="scanControls"><button class="btn ghost" id="back" ${scanStep===0?'disabled':''}>← Назад</button><button class="btn primary" id="next">Далее →</button></div><div class="micro">Результат показывает направления для проверки, а не заменяет полноценную диагностику.</div></section>`;
  document.querySelectorAll('.option').forEach(el=>el.onclick=()=>{document.querySelectorAll('.option').forEach(x=>x.classList.remove('on'));el.classList.add('on')});
  document.getElementById('next').onclick=()=>{const e=document.querySelector('.option.on');if(!e)return alert('Выберите вариант');scanAnswers[scanStep]=+e.dataset.i;scanStep++;drawScan()};
  document.getElementById('back').onclick=()=>{if(scanStep>0){scanStep--;drawScan()}};
}
function scanResult(){
  const avg=scanAnswers.reduce((a,b)=>a+b,0)/(scanAnswers.length*3);
  const overall=avg>.72?['В целом устойчиво','good']:avg>.45?['Требует внимания','warn']:['Есть заметные риски','bad'];
  const items=[scanAnswers[2]<=1?['Денежный поток','Деньги могут застревать внутри бизнеса','bad']:['Денежный поток','Существенных тревожных сигналов пока не видно','good'],scanAnswers[4]<=1?['Зависимость от собственника','Слишком много решений проходят через владельца','warn']:['Зависимость от собственника','Управление выглядит достаточно распределённым','good'],scanAnswers[5]<=1?['Продажи','Нужно повысить прозрачность воронки и причин потерь','warn']:['Продажи','Картина выглядит достаточно прозрачной','good']];
  app.innerHTML=`<section class="scanWrap" style="width:min(1050px,calc(100% - 40px))"><div class="eyebrow">РЕЗУЛЬТАТ БЫСТРОЙ ДИАГНОСТИКИ</div><div class="resultSimple" style="margin-top:18px"><div class="panel resultCard"><div class="eyebrow">ОБЩАЯ КАРТИНА</div><div class="resultState">${overall[0]}</div>${state(overall[0],overall[1])}<p class="muted">Это не оценка компании по баллам. Это указатель, какие зоны стоит проверить глубже.</p></div><div class="panel pathVisual"><div class="eyebrow">КУДА СМОТРЕТЬ ПЕРВЫМ</div><div class="priorityList">${items.map(x=>`<div class="priority"><i style="background:var(--${x[2]==='bad'?'bad':x[2]==='warn'?'warn':'good'})"></i><div><b>${x[0]}</b><div class="muted">${x[1]}</div></div></div>`).join('')}</div></div></div>${actions('/company-check.html','ПРОВЕРИТЬ КОМПАНИЮ','/contact','ОБСУДИТЬ РЕЗУЛЬТАТ')}</section>`;
}

function report(){
  setMeta('Пример результата BX','Демонстрация структуры результата Business X-Ray.');
  app.innerHTML=pageHero('ПРИМЕР РЕЗУЛЬТАТА','Как выглядит итог без перегруза цифрами.','Демонстрационный пример показывает структуру: главная проблема, причина, решение и ограничения.',actions('/contact','ЗАПРОСИТЬ ДИАГНОСТИКУ','/methodology','МЕТОДОЛОГИЯ'))+`<section class="section"><div class="shell"><div class="reportHero"><div class="panel reportCard"><div class="eyebrow">ОБЩАЯ КАРТИНА</div><h2 style="font-size:36px;margin:10px 0 18px">Бизнес прибыльный, но денег становится меньше</h2><div class="summaryList"><div class="summaryItem"><b>Главная причина</b><span>деньги находятся в запасах и неоплаченных счетах клиентов</span></div><div class="summaryItem"><b>Вторая проблема</b><span>скидки снижают прибыль сильнее, чем видно по выручке</span></div><div class="summaryItem"><b>Ограничение</b><span>часть решений нельзя масштабировать без проверки спроса</span></div></div></div><div class="panel reportCard"><div class="eyebrow">ПЕРВЫЕ ДЕЙСТВИЯ</div><div class="summaryList"><div class="summaryItem"><b>1. Освободить деньги</b><span>пересмотреть нормативы закупки и сроки оплаты</span></div><div class="summaryItem"><b>2. Ограничить скидки</b><span>ввести границы и проверку исключений</span></div><div class="summaryItem"><b>3. Проверить цену</b><span>провести ограниченный тест, а не менять всем сразу</span></div></div></div></div></div></section>`;
}

function portal(){
  setMeta('Кабинет собственника BX — демо','Демонстрация рабочего кабинета собственника.');
  app.innerHTML=`<div class="portalShell"><aside class="portalSide"><b>BX · КАБИНЕТ СОБСТВЕННИКА</b><a class="active">Обзор</a><a>Карта бизнеса</a><a>Главные выводы</a><a>Решения</a><a>Изменения</a><a>Риски</a><a>Документы</a><a href="/">← На сайт</a></aside><main class="portalMain"><div class="portalTop"><div><div class="eyebrow">ДЕМОНСТРАЦИОННАЯ КОМПАНИЯ</div><h1>Что требует внимания сейчас</h1></div>${state('обновлено сегодня','good')}</div><div class="portalGrid"><div class="panel portalCard"><div class="eyebrow">СОСТОЯНИЕ БИЗНЕСА</div><div class="healthList">${[['Финансы','устойчиво',78,'good'],['Продажи','внимание',58,'warn'],['Операции','устойчиво',82,'good'],['Денежный поток','риск',44,'bad'],['Команда','внимание',61,'warn'],['Рынок','устойчиво',74,'good']].map(x=>`<div class="healthRow"><span>${x[0]}</span><div class="bar"><i style="width:${x[2]}%;background:var(--${x[3]})"></i></div><b style="color:var(--${x[3]})">${x[1]}</b></div>`).join('')}</div></div><div class="panel portalCard"><div class="eyebrow">ТРИ РЕШЕНИЯ</div><div class="decisionList"><div class="decisionItem"><b>Освободить деньги из запасов</b><span>В работе · операционный директор</span></div><div class="decisionItem"><b>Проверить новые правила скидок</b><span>Пилот · результат через 14 дней</span></div><div class="decisionItem"><b>Передать часть решений команде</b><span>Подготовка · нужны границы полномочий</span></div></div></div></div></main></div>`;
}

function solution(slug){
  const data={xray:['Полная диагностика бизнеса','3–5 недель: данные, независимые заключения, карта потерь, риски и план на 90 дней.'],execution:['90 дней изменений','Диагностика превращается в управляемую программу: владельцы, сроки, условия, риски и подтверждение эффекта.'],'operating-partner':['Партнёр собственника','Регулярная работа с ключевыми решениями, Boardroom и контроль исполнения.']};
  const x=data[slug]||['Решение BX','Разбираем проблему через причины, деньги, риск и способность выполнить решение.'];
  setMeta(`${x[0]} — BX`,x[1]);
  app.innerHTML=pageHero('РЕШЕНИЕ',x[0],x[1],actions('/contact','ОБСУДИТЬ ФОРМАТ','/products','ВСЕ ПРОДУКТЫ'))+`<section class="section"><div class="shell"><div class="methodFlow">${[['01','Исходная точка','факт и данные'],['02','Решения','приоритет и условия'],['03','Владельцы','кто отвечает'],['04','Ритм','еженедельный контроль'],['05','Риски','veto и downside'],['06','Эффект','подтверждение деньгами']].map(x=>`<div class="methodStep"><div class="n">${x[0]}</div><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div></div></section>`;
}

function notFound(){
  setMeta('Страница не найдена — BX','Страница не найдена.');
  app.innerHTML=pageHero('404','Эта страница ещё не создана.','Вернитесь на главную или откройте карту проекта.',actions('/','НА ГЛАВНУЮ','/projects','ПРОЕКТЫ'));
}

const routes={
  '/':home,'/about':about,'/sergey-savinov':sergey,'/products':products,'/projects':projectsPage,'/board':board,'/methodology':methodology,'/tools':tools,'/intelligence':intelligence,'/contact':contact,'/quick-scan':scan,'/sample-report':report,'/portal-demo':portal,'/xray':()=>solution('xray')
};
if(routes[path]) routes[path]();
else if(path.startsWith('/projects/')) projectDetail(path.split('/').pop());
else if(path.startsWith('/solutions/')) solution(path.split('/').pop());
else if(path.startsWith('/demo/')||path==='/crm-demo') app.innerHTML='';
else notFound();

const toggle=document.getElementById('menuToggle');
const menu=document.getElementById('mainMenu');
if(toggle&&menu){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰';});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));}
