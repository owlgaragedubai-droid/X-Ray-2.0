
const app = document.getElementById('app');
const path = location.pathname.replace(/\/$/,'') || '/';

const state = (label, cls='warn') => `<span class="state ${cls}">${label}</span>`;
const buttons = () => `<div class="actions"><a class="btn primary" href="/quick-scan">НАЧАТЬ ДИАГНОСТИКУ →</a><a class="btn ghost" href="/sample-report">ПОСМОТРЕТЬ ПРИМЕР</a></div>`;
const pageHero = (section,title,lead) => `<section class="pagehero shell"><div class="crumb">BX / ${section}</div><div class="eyebrow">${section}</div><h1>${title}</h1><p class="lead">${lead}</p>${buttons()}</section>`;

function home(){
  app.innerHTML = `
  <section class="hero shell">
    <div>
      <div class="eyebrow">ДИАГНОСТИКА БИЗНЕСА ДЛЯ СОБСТВЕННИКА</div>
      <h1>Показываем, где бизнес теряет деньги и что делать первым.</h1>
      <p class="lead">BX собирает разрозненные данные в одну понятную картину: что происходит, почему это происходит, какое решение принять и какой эффект оно может дать.</p>
      ${buttons()}
      <div class="micro">Без сложных терминов и ложной точности. Сначала смысл, потом цифры.</div>
    </div>
    <div class="panel heroVisual">
      <div class="eyebrow">КАК РАБОТАЕТ BX</div>
      <div class="simpleFlow" style="margin-top:18px">
        <div class="flowStep"><div class="flowIcon">◌</div><div><strong>Что происходит?</strong><span>Собираем факты из разных частей бизнеса</span></div><b>1</b></div>
        <div class="flowArrow">↓</div>
        <div class="flowStep"><div class="flowIcon">⌁</div><div><strong>Почему?</strong><span>Находим корневую причину, а не симптом</span></div><b>2</b></div>
        <div class="flowArrow">↓</div>
        <div class="flowStep"><div class="flowIcon">◇</div><div><strong>Что делать?</strong><span>Сравниваем варианты и риски</span></div><b>3</b></div>
        <div class="flowArrow">↓</div>
        <div class="flowStep"><div class="flowIcon">↗</div><div><strong>Что изменится?</strong><span>Связываем решение с деньгами и результатом</span></div><b>4</b></div>
      </div>
      <div class="heroNote"><b>Главный принцип</b><span>Не выдавать больше информации. Помогать принять более качественное решение.</span></div>
    </div>
  </section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">01 · КОГДА НУЖНА ДИАГНОСТИКА</div><h2>Проблема обычно видна. Причина — нет.</h2></div>
      <p class="sectionIntro">Собственник видит последствия в разных местах бизнеса. BX помогает связать их в одну причинно-следственную картину.</p>
    </div>
    <div class="visualProblems">
      ${[
        ['₽','Выручка растёт, а денег больше не становится.'],
        ['↘','Продажи есть, а прибыль снижается.'],
        ['◫','Запасы и дебиторская задолженность забирают деньги.'],
        ['◎','Реклама работает, а сделки не закрываются.'],
        ['⌘','Без собственника многие решения останавливаются.'],
        ['?','Руководители называют разные причины одной проблемы.']
      ].map(x=>`<div class="card problemCard"><div class="problemMark">${x[0]}</div><h3>${x[1]}</h3><div class="problemLink">BX ищет связь</div></div>`).join('')}
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">02 · ЛОГИКА РЕШЕНИЯ</div><h2>Не просто «найти проблему». Понять, к чему она приводит.</h2></div>
      <p class="sectionIntro">Вместо десятков показателей BX показывает цепочку: симптом → причина → решение → ожидаемый результат.</p>
    </div>
    <div class="causeMap">
      <div class="causeBox"><small>СИМПТОМ</small><h3>Денег постоянно не хватает</h3><p>При этом компания формально прибыльна.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>ПРИЧИНА</small><h3>Деньги застряли в запасах и оплатах клиентов</h3><p>Рост продаж финансируется из оборотных средств.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>РЕШЕНИЕ</small><h3>Изменить правила запасов и оплаты</h3><p>Сначала высвободить деньги, затем ускорять рост.</p></div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">03 · КАРТА БИЗНЕСА</div><h2>Видим не отделы по отдельности, а всю систему.</h2></div>
      <p class="sectionIntro">Шесть крупных зон связаны между собой. Цвет показывает состояние, а не абстрактный балл.</p>
    </div>
    <div class="mapWrap">
      <div class="panel businessMap">
        <div class="mapTitle">
          <div><div class="eyebrow">ОБЩАЯ КАРТИНА</div><h3>Где сейчас теряется устойчивость</h3></div>
          <div class="legend"><span><i class="dot" style="background:var(--good)"></i>Норма</span><span><i class="dot" style="background:var(--warn)"></i>Внимание</span><span><i class="dot" style="background:var(--bad)"></i>Риск</span></div>
        </div>
        <div class="mapVisual">
          <div class="mapLine l1"></div><div class="mapLine l2"></div><div class="mapLine l3"></div><div class="mapLine l4"></div><div class="mapLine l5"></div><div class="mapLine l6"></div>
          <div class="mapCenter"><div><strong>Здоровье бизнеса</strong><span>деньги · прибыль · устойчивость</span></div></div>
          <div class="mapNode good n1"><b>Финансы</b><small>картина понятна</small></div>
          <div class="mapNode warn n2"><b>Продажи</b><small>есть потери в марже</small></div>
          <div class="mapNode bad n3"><b>Денежный поток</b><small>деньги застревают</small></div>
          <div class="mapNode good n4"><b>Операции</b><small>работают устойчиво</small></div>
          <div class="mapNode warn n5"><b>Команда</b><small>зависимость от собственника</small></div>
          <div class="mapNode unknown n6"><b>Рынок и риски</b><small>нужно больше данных</small></div>
        </div>
      </div>
      <div class="sideStack">
        <div class="card insight"><div class="eyebrow">ГЛАВНЫЙ РИСК</div><h3>Деньги застревают внутри бизнеса</h3><p>Основная проблема не в объёме продаж, а в том, как быстро выручка превращается в свободные деньги.</p>${state('требует внимания','bad')}</div>
        <div class="card insight"><div class="eyebrow">ЧЕГО МЫ ПОКА НЕ ЗНАЕМ</div><h3>Можно ли безопасно повысить цены</h3><p>Данных недостаточно. Вместо уверенного совета BX предлагает проверку на небольшом сегменте.</p>${state('нужна проверка','unknown')}</div>
        <div class="card insight"><div class="eyebrow">ПЕРВЫЙ ШАГ</div><h3>Освободить деньги из оборота</h3><p>До агрессивного роста стоит восстановить управляемость запасов и условий оплаты.</p>${state('приоритет','warn')}</div>
      </div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">04 · ДОКАЗАТЕЛЬСТВА</div><h2>Каждый вывод должен отвечать на вопрос: «Откуда мы это знаем?»</h2></div>
      <p class="sectionIntro">Мы отделяем подтверждённые факты от предположений. Если данных не хватает — прямо так и говорим.</p>
    </div>
    <div class="proofGrid">
      <div class="panel proof"><div class="proofIcon">✓</div><div class="eyebrow">ФАКТ</div><h3>Скидки выше нормы</h3><p>Подтверждено данными по сделкам за последние 12 месяцев.</p></div>
      <div class="panel proof"><div class="proofIcon">⌁</div><div class="eyebrow">ВЫВОД</div><h3>Компания теряет прибыль в корпоративном канале</h3><p>Причина не в слабом спросе, а в слишком свободной политике скидок.</p></div>
      <div class="panel proof"><div class="proofIcon">→</div><div class="eyebrow">ДЕЙСТВИЕ</div><h3>Изменить правила скидок</h3><p>Сначала проверить новую модель на двух группах клиентов.</p></div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">05 · СОВЕТ BX</div><h2>Хорошее решение должно выдержать несогласие.</h2></div>
      <p class="sectionIntro">Финансы, продажи, операции, рынок и независимый критик рассматривают одну идею с разных сторон.</p>
    </div>
    <div class="council">
      <div class="panel opinion"><div class="who">ПРОДАЖИ</div><h3>Снизить цену</h3><p>Это может ускорить сделки.</p>${state('за','good')}</div>
      <div class="panel opinion"><div class="who">ФИНАНСЫ</div><h3>Не спешить</h3><p>Снижение цены может слишком сильно ударить по прибыли.</p>${state('против','bad')}</div>
      <div class="panel opinion"><div class="who">РЫНОК</div><h3>Проверить причину</h3><p>Нет доказательств, что цена — главный барьер покупки.</p>${state('нужна проверка','warn')}</div>
      <div class="panel finalDecision"><div><div class="eyebrow">РЕШЕНИЕ СОВЕТА</div><strong>Не масштабировать. Сначала проверить.</strong><p>Провести ограниченный тест на двух группах клиентов и сравнить результат.</p></div><div class="decisionBadge">ПРОВЕРКА 14 ДНЕЙ</div></div>
    </div>
  </div></section>

  <section class="section"><div class="shell">
    <div class="sectionHead">
      <div><div class="eyebrow">06 · КАК МОЖНО НАЧАТЬ</div><h2>От быстрой проверки — к постоянной системе управления решениями.</h2></div>
      <p class="sectionIntro">Каждый следующий уровень нужен только тогда, когда предыдущий дал основание двигаться глубже.</p>
    </div>
    <div class="productGrid">
      ${[
        ['Быстрая диагностика','Несколько минут. Показывает, где стоит искать глубже.','/quick-scan'],
        ['Полная диагностика','Разбираем бизнес по данным, причинам и экономическому эффекту.','/xray'],
        ['Совет BX','Проверяем отдельное крупное решение перед запуском.','/board'],
        ['90 дней изменений','Помогаем внедрить несколько самых важных решений.','/solutions/execution'],
        ['Партнёр собственника','Регулярно помогаем принимать сложные управленческие решения.','/solutions/operating-partner'],
        ['Аналитика BX','Следим за рынком и внешними изменениями, которые влияют на бизнес.','/intelligence']
      ].map((x,i)=>`<a class="panel product" href="${x[2]}"><div class="eyebrow">0${i+1}</div><h3>${x[0]}</h3><p>${x[1]}</p><div class="arrow">Подробнее →</div></a>`).join('')}
    </div>
  </div></section>

  <section class="section tight"><div class="shell">
    <div class="panel" style="padding:34px;background:linear-gradient(135deg,#e6f2f0,#ffffff)">
      <div class="eyebrow">НАЧАТЬ С ПРОСТОГО</div>
      <h2 style="margin-top:8px">Сначала понять, где действительно проблема.</h2>
      <p class="sectionIntro">Быстрая диагностика не обещает точный денежный эффект. Она помогает определить, куда направить внимание.</p>
      ${buttons()}
    </div>
  </div></section>`;
}

function xray(){
  app.innerHTML = pageHero('ПОЛНАЯ ДИАГНОСТИКА','Понятная картина бизнеса вместо набора разрозненных отчётов.','Мы связываем финансы, продажи, процессы, команду, рынок и риски, чтобы собственник видел не только проблему, но и последовательность действий.') + `
  <section class="section"><div class="shell">
    <div class="causeMap">
      <div class="causeBox"><small>1 · СОБИРАЕМ</small><h3>Факты</h3><p>Финансы, продажи, процессы, команда, договоры и рынок.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>2 · СВЯЗЫВАЕМ</small><h3>Причины</h3><p>Понимаем, что на что влияет и где находится корень проблемы.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>3 · РЕШАЕМ</small><h3>Приоритеты</h3><p>Выбираем действия с лучшим соотношением эффекта, скорости и риска.</p></div>
    </div>
  </div></section>
  <section class="section"><div class="shell"><div class="sectionHead"><div><div class="eyebrow">КАК ПРОХОДИТ РАБОТА</div><h2>Шесть понятных этапов.</h2></div><p class="sectionIntro">Без длинного отчёта ради отчёта. Каждый этап должен приводить к более ясному решению.</p></div>
    <div class="timeline">
      ${[
        ['01','Определяем главный вопрос','Что собственник хочет понять или решить.'],
        ['02','Проверяем данные','Каким цифрам можно доверять, а где есть пробелы.'],
        ['03','Разбираем причины','Финансы, продажи, процессы, команда и рынок смотрятся вместе.'],
        ['04','Сравниваем мнения','Разные специалисты независимо оценивают одну ситуацию.'],
        ['05','Проверяем на прочность','Ищем слабые места и причины отказаться от привлекательной идеи.'],
        ['06','Формируем план','Что делать, кто отвечает, когда проверить результат и когда остановиться.']
      ].map(x=>`<div class="timelineStep"><div class="n">${x[0].slice(1)}</div><div><h3>${x[1]}</h3><p>${x[2]}</p></div></div>`).join('')}
    </div>
  </div></section>`;
}

function board(){
  app.innerHTML = pageHero('СОВЕТ BX','Несколько независимых взглядов на одно решение.','Совет BX нужен там, где ставка слишком велика, чтобы принимать решение на основе одного мнения.') + `
  <section class="section"><div class="shell">
    <div class="council">
      ${[
        ['Управляющий партнёр','Собирает вопрос и держит фокус на интересе собственника.'],
        ['Финансы','Проверяет влияние на прибыль, деньги и устойчивость.'],
        ['Продажи','Проверяет спрос, цену, воронку и коммерческий потенциал.'],
        ['Операции','Смотрит, можно ли реально выполнить решение.'],
        ['Рынок','Проверяет внешнюю среду и поведение клиентов.'],
        ['Команда','Оценивает людей, роли и зависимость от ключевых сотрудников.'],
        ['Налоги и учёт','Проверяет налоговые и учётные последствия.'],
        ['Право и риски','Ищет юридические ограничения и риски.'],
        ['Инвестиции','Сравнивает вложения, отдачу и альтернативы.'],
        ['Данные','Проверяет качество доказательств и пробелы.'],
        ['Внедрение','Проверяет сроки, ресурсы и ответственность.'],
        ['Независимый критик','Ищет причины, почему идея может не сработать.']
      ].map(x=>`<div class="panel opinion"><div class="who">${x[0]}</div><h3>${x[1]}</h3></div>`).join('')}
      <div class="panel finalDecision"><div><div class="eyebrow">РЕЗУЛЬТАТ</div><strong>Запускать · проверить · отложить · отказаться</strong><p>Каждое решение сопровождается условиями, рисками и датой пересмотра.</p></div><div class="decisionBadge">ОДНО РЕШЕНИЕ</div></div>
    </div>
  </div></section>`;
}

function cases(){
  app.innerHTML = pageHero('КЕЙСЫ','Показываем не красивые обещания, а путь от проблемы до результата.','В каждом кейсе отдельно видно: что нашли, что решили, что внедрили и что реально изменилось.') + `
  <section class="section"><div class="shell"><div class="cards">
    ${[
      ['Производство','Деньги застряли в запасах','Сократили избыточные запасы и изменили правила закупки.'],
      ['Услуги для бизнеса','Слишком большие скидки','Перестроили правила скидок и контроль маржи.'],
      ['Розница','Слишком широкий ассортимент','Убрали позиции, которые занимали деньги и почти не давали прибыли.'],
      ['Фитнес','Слабая отдача отдела продаж','Изменили распределение лидов и систему управления продавцами.'],
      ['Дистрибуция','Медленный оборот денег','Сократили сроки оплаты и пересобрали политику запасов.'],
      ['Компания собственника','Все решения идут через владельца','Часть решений передали руководителям с понятными границами ответственности.']
    ].map(x=>`<div class="card problemCard"><div><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></div><div class="problemLink">показать логику решения</div></div>`).join('')}
  </div></div></section>`;
}

function intelligence(){
  app.innerHTML = pageHero('АНАЛИТИКА BX','Не просто новости. Что они меняют для собственника.','Каждый материал заканчивается конкретным выводом: какой риск появился, где возможность и требуется ли действие.') + `
  <section class="section"><div class="shell"><div class="cards">
    ${[
      ['Сигнал','Коротко: что изменилось и почему это важно.'],
      ['Обзор рынка','Спрос, цены, конкуренты и новые проекты.'],
      ['Исследование','Глубокий разбор вопроса с источниками и выводами.'],
      ['Мнение совета','Как одно событие видят финансы, продажи, рынок и риски.'],
      ['Пульс отрасли','Несколько ключевых изменений без лишней информации.'],
      ['Записка собственнику','Короткий список вопросов, которые требуют внимания на этой неделе.']
    ].map(x=>`<div class="card problemCard"><div><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3></div><div class="problemLink">что это значит для бизнеса</div></div>`).join('')}
  </div></div></section>`;
}

function methodology(){
  app.innerHTML = pageHero('МЕТОДОЛОГИЯ','Чётко отделяем то, что знаем, от того, что предполагаем.','BX не маскирует недостаток данных под уверенный вывод. Каждый важный тезис имеет понятный уровень надёжности.') + `
  <section class="section"><div class="shell"><div class="cards">
    ${[
      ['Подтверждённый факт','Есть первичный источник внутри компании.'],
      ['Расчёт','Вывод получен из известных данных по понятной формуле.'],
      ['Внешние данные','Использованы рынок, исследования или публичные источники.'],
      ['Предположение','Гипотеза, которую ещё нужно проверить.'],
      ['Экспертная оценка','Профессиональное мнение, которое не выдаётся за факт.'],
      ['Данных недостаточно','BX прямо говорит, когда уверенный вывод делать рано.']
    ].map(x=>`<div class="card"><div class="eyebrow">${x[0]}</div><h3>${x[1]}</h3></div>`).join('')}
  </div></div></section>`;
}

const scanQuestions = [
  ['Что сейчас беспокоит больше всего?',['Прибыль','Деньги на счетах','Продажи','Рост']],
  ['Как меняется выручка?',['Снижается','Почти не меняется','Растёт умеренно','Растёт быстро']],
  ['Как часто не хватает денег на текущие платежи?',['Часто','Иногда','Редко','Практически никогда']],
  ['Насколько понятно, какие направления действительно прибыльны?',['Практически непонятно','Есть примерная картина','Понятно по основным направлениям','Понятно регулярно и подробно']],
  ['Насколько бизнес зависит от личного участия собственника?',['Очень сильно','Сильно','Умеренно','Незначительно']],
  ['Насколько прозрачна работа отдела продаж?',['Почти не видна','Видна частично','В основном понятна','Полностью прозрачна']],
  ['Есть ли у руководителей понятные показатели результата?',['Нет','Только у части','У большинства','Да, и они связаны с результатом бизнеса']],
  ['Есть ли единый список главных изменений в работе компании?',['Нет','Есть, но без ответственных','Есть ответственные','Есть ответственные и контроль результата']]
];
let scanStep=0,scanAnswers=[];

function scan(){scanStep=0;scanAnswers=[];drawScan()}
function drawScan(){
  if(scanStep>=scanQuestions.length) return scanResult();
  const [q,opts]=scanQuestions[scanStep];
  app.innerHTML=`<section class="scanWrap">
    <div class="scanHead"><div><div class="eyebrow">БЫСТРАЯ ДИАГНОСТИКА</div><div style="color:var(--muted)">Предварительная оценка без регистрации</div></div><b>${scanStep+1} из ${scanQuestions.length}</b></div>
    <div class="progress"><i style="width:${scanStep/scanQuestions.length*100}%"></i></div>
    <div class="question">${q}</div>
    <div class="options">${opts.map((o,i)=>`<div class="option" data-i="${i}">${o}<small>выбрать</small></div>`).join('')}</div>
    <div class="scanControls"><button class="btn ghost" id="back" ${scanStep===0?'disabled':''}>← Назад</button><button class="btn primary" id="next">Далее →</button></div>
    <div class="micro">Результат показывает направления для проверки, а не заменяет полноценную диагностику.</div>
  </section>`;
  document.querySelectorAll('.option').forEach(el=>el.onclick=()=>{document.querySelectorAll('.option').forEach(x=>x.classList.remove('on'));el.classList.add('on')});
  document.getElementById('next').onclick=()=>{const e=document.querySelector('.option.on');if(!e)return alert('Выберите вариант');scanAnswers[scanStep]=+e.dataset.i;scanStep++;drawScan()};
  document.getElementById('back').onclick=()=>{if(scanStep>0){scanStep--;drawScan()}};
}
function scanResult(){
  const avg=scanAnswers.reduce((a,b)=>a+b,0)/(scanAnswers.length*3);
  const overall=avg>0.72?['В целом устойчиво','good']:avg>0.45?['Требует внимания','warn']:['Есть заметные риски','bad'];
  const cash=scanAnswers[2] <=1 ? ['Денежный поток','Деньги могут застревать внутри бизнеса','bad'] : ['Денежный поток','Существенных тревожных сигналов пока не видно','good'];
  const owner=scanAnswers[4] <=1 ? ['Зависимость от собственника','Слишком много решений всё ещё проходят через владельца','warn'] : ['Зависимость от собственника','Управление выглядит достаточно распределённым','good'];
  const sales=scanAnswers[5] <=1 ? ['Продажи','Нужно повысить прозрачность воронки и причин потерь','warn'] : ['Продажи','Картина выглядит достаточно прозрачной','good'];
  app.innerHTML=`<section class="scanWrap" style="width:min(1050px,calc(100% - 40px))">
    <div class="eyebrow">РЕЗУЛЬТАТ БЫСТРОЙ ДИАГНОСТИКИ</div>
    <div class="resultSimple" style="margin-top:18px">
      <div class="panel resultCard"><div class="eyebrow">ОБЩАЯ КАРТИНА</div><div class="resultState">${overall[0]}</div>${state(overall[0],overall[1])}
        <p style="color:var(--muted);margin-top:18px">Это не оценка компании «по баллам». Это указатель, какие зоны стоит проверить глубже.</p>
      </div>
      <div class="panel pathVisual"><div class="eyebrow">КУДА СМОТРЕТЬ ПЕРВЫМ</div>
        <div class="priorityList">
          ${[cash,owner,sales].map(x=>`<div class="priority"><i style="background:var(--${x[2]==='bad'?'bad':x[2]==='warn'?'warn':'good'})"></i><div><b>${x[0]}</b><div style="color:var(--muted)">${x[1]}</div></div></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="panel" style="padding:24px;margin-top:14px">
      <div class="eyebrow">ЧТО ДАЛЬШЕ</div>
      <div class="pathRow"><span>Собрать факты</span><b>→</b><span>Найти причину</span></div>
      <div class="pathRow"><span>Сравнить решения</span><b>→</b><span>Проверить эффект</span></div>
    </div>
    <div class="actions"><a class="btn primary" href="/sample-report">ПОСМОТРЕТЬ ПРИМЕР ПОЛНОЙ ДИАГНОСТИКИ →</a><a class="btn ghost" href="/quick-scan">ПРОЙТИ ЕЩЁ РАЗ</a></div>
  </section>`;
}

function report(){
  app.innerHTML=pageHero('ПРИМЕР РЕЗУЛЬТАТА','Как выглядит итог без перегруза цифрами.','Демонстрационный пример показывает структуру: главная проблема, причина, решение и ожидаемый результат.')+`
  <section class="section"><div class="shell">
    <div class="reportHero">
      <div class="panel reportCard"><div class="eyebrow">ОБЩАЯ КАРТИНА</div><h2 style="font-size:36px;margin:10px 0 18px">Бизнес прибыльный, но денег становится меньше</h2>
        <div class="summaryList">
          <div class="summaryItem"><b>Главная причина</b><span>слишком много денег находится в запасах и неоплаченных счетах клиентов</span></div>
          <div class="summaryItem"><b>Вторая проблема</b><span>скидки снижают прибыль сильнее, чем кажется по общей выручке</span></div>
          <div class="summaryItem"><b>Ограничение</b><span>часть решений нельзя масштабировать без дополнительной проверки спроса</span></div>
        </div>
      </div>
      <div class="panel reportCard"><div class="eyebrow">ПЕРВЫЕ ДЕЙСТВИЯ</div>
        <div class="summaryList">
          <div class="summaryItem"><b>1. Освободить деньги из запасов</b><span>пересмотреть нормативы закупки и медленно оборачиваемые позиции</span></div>
          <div class="summaryItem"><b>2. Ограничить бесконтрольные скидки</b><span>ввести границы и проверку исключений</span></div>
          <div class="summaryItem"><b>3. Проверить новую цену</b><span>не менять её сразу для всех клиентов, а провести ограниченный тест</span></div>
        </div>
      </div>
    </div>
    <div class="causeMap" style="margin-top:16px">
      <div class="causeBox"><small>СЕЙЧАС</small><h3>Деньги застревают</h3><p>Рост требует всё больше оборотных средств.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>90 ДНЕЙ</small><h3>Вернуть управляемость</h3><p>Запасы, условия оплаты, скидки и ответственность.</p></div>
      <div class="causeArrow">→</div>
      <div class="causeBox"><small>ЦЕЛЬ</small><h3>Рост без кассового напряжения</h3><p>Сначала устойчивость, затем ускорение.</p></div>
    </div>
  </div></section>`;
}

function portal(){
  app.innerHTML=`<div class="portalShell">
    <aside class="portalSide"><b>BX · КАБИНЕТ СОБСТВЕННИКА</b><a class="active">Обзор</a><a>Карта бизнеса</a><a>Главные выводы</a><a>Решения</a><a>Изменения</a><a>Риски</a><a>Документы</a><a href="/">← На сайт</a></aside>
    <main class="portalMain">
      <div class="portalTop"><div><div class="eyebrow">ДЕМОНСТРАЦИОННАЯ КОМПАНИЯ</div><h1>Что требует внимания сейчас</h1></div>${state('обновлено сегодня','good')}</div>
      <div class="portalGrid">
        <div class="panel portalCard"><div class="eyebrow">СОСТОЯНИЕ БИЗНЕСА</div><div class="healthList">
          ${[
            ['Финансы','устойчиво',78,'good'],
            ['Продажи','внимание',58,'warn'],
            ['Операции','устойчиво',82,'good'],
            ['Денежный поток','риск',44,'bad'],
            ['Команда','внимание',61,'warn'],
            ['Рынок','устойчиво',74,'good']
          ].map(x=>`<div class="healthRow"><span>${x[0]}</span><div class="bar"><i style="width:${x[2]}%;background:var(--${x[3]})"></i></div><b style="color:var(--${x[3]})">${x[1]}</b></div>`).join('')}
        </div></div>
        <div class="panel portalCard"><div class="eyebrow">ТРИ РЕШЕНИЯ</div><div class="decisionList">
          <div class="decisionItem"><b>Освободить деньги из запасов</b><span>В работе · ответственный: операционный директор</span></div>
          <div class="decisionItem"><b>Проверить новые правила скидок</b><span>Проверка · результат через 14 дней</span></div>
          <div class="decisionItem"><b>Передать часть решений команде</b><span>Подготовка · нужны границы полномочий</span></div>
        </div></div>
      </div>
      <div class="portalGrid" style="margin-top:14px">
        <div class="panel portalCard"><div class="eyebrow">ЧТО УЖЕ ИЗМЕНИЛОСЬ</div><div class="summaryList">
          <div class="summaryItem"><b>Запасы начали сокращаться</b><span>появилась первая высвобождённая ликвидность</span></div>
          <div class="summaryItem"><b>Скидки стали управляемее</b><span>исключения теперь требуют подтверждения</span></div>
        </div></div>
        <div class="panel portalCard"><div class="eyebrow">ЧТО БЛОКИРУЕТ РЕЗУЛЬТАТ</div><div class="summaryList">
          <div class="summaryItem"><b>Не хватает данных по повторным продажам</b><span>без них нельзя уверенно менять ценовую модель</span></div>
          <div class="summaryItem"><b>Часть инициатив не имеет одного ответственного</b><span>нужно закрепить владельцев решений</span></div>
        </div></div>
      </div>
    </main>
  </div>`;
}

function solution(slug){
  const names={
    growth:['Рост','Как расти так, чтобы вместе с выручкой росли деньги и устойчивость.'],
    profit:['Прибыль','Где теряется прибыль и какие причины стоит устранять первыми.'],
    cash:['Денежный поток','Почему деньги застревают внутри бизнеса и как их освободить.'],
    sales:['Продажи','Где теряются сделки, маржа и производительность команды.'],
    operations:['Операции','Какие процессы ограничивают рост и создают лишние расходы.'],
    turnaround:['Выход из кризиса','Что делать сначала, когда главная задача — сохранить ликвидность и управляемость.'],
    investment:['Инвестиционное решение','Стоит ли вкладывать деньги, какие есть альтернативы и что может пойти не так.'],
    execution:['90 дней изменений','Как довести несколько ключевых решений до фактического результата.'],
    'operating-partner':['Партнёр собственника','Постоянная помощь в сложных управленческих решениях.']
  };
  const x=names[slug]||['Решение BX','Разбираем проблему через причины, деньги, риски и реализуемость.'];
  app.innerHTML=pageHero('РЕШЕНИЕ',x[0],x[1])+`<section class="section"><div class="shell"><div class="causeMap">
    <div class="causeBox"><small>1</small><h3>Понять, что происходит</h3><p>Без предположений и лишних показателей.</p></div>
    <div class="causeArrow">→</div>
    <div class="causeBox"><small>2</small><h3>Найти настоящую причину</h3><p>Отделить симптом от источника проблемы.</p></div>
    <div class="causeArrow">→</div>
    <div class="causeBox"><small>3</small><h3>Выбрать действие</h3><p>С учётом эффекта, риска, сроков и ресурсов.</p></div>
  </div></div></section>`;
}

const routes={'/':home,'/xray':xray,'/board':board,'/cases':cases,'/intelligence':intelligence,'/methodology':methodology,'/quick-scan':scan,'/sample-report':report,'/portal-demo':portal};
if(routes[path]) routes[path]();
else if(path.startsWith('/solutions/')) solution(path.split('/').pop());
else app.innerHTML=pageHero('СТРАНИЦА В РАБОТЕ','Этот раздел уже заложен в структуру сайта.','Контент будет добавлен на следующем этапе.');
