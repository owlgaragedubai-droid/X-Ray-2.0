
(function(){
  const p = location.pathname.replace(/\/$/,'') || '/';
  if(p !== '/demo/aluminstar' && p !== '/crm-demo') return;

  const app = document.getElementById('app');
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const badge = (t,c='') => `<span class="demoBadge ${c}">${esc(t)}</span>`;

  async function post(url, body){
    const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j = await r.json();
    if(!r.ok || !j.ok) throw new Error(j.error || 'Ошибка');
    return j;
  }
  async function get(url){
    const r = await fetch(url);
    const j = await r.json();
    if(!r.ok || !j.ok) throw new Error(j.error || 'Ошибка');
    return j;
  }

  function topSteps(active){
    const steps=['Целевой клиент','Диагностика','Заявка','Лид в базе','Работа менеджера'];
    return `<div class="demoSteps">${steps.map((s,i)=>`<div class="demoStep ${i<active?'done':i===active?'active':''}"><i>${i+1}</i><span>${s}</span></div>`).join('')}</div>`;
  }

  async function renderAluminstar(){
    app.innerHTML=`<section class="demoShell">
      <div class="demoNotice"><b>Демонстрационный сценарий</b><span>Мы моделируем, как Aluminstar мог бы пройти путь клиента. Это не утверждение о реальном обращении компании.</span></div>
      ${topSteps(1)}
      <div class="demoHero">
        <div>
          <div class="eyebrow">ПЕРВЫЙ КЛИЕНТ ИЗ ЦЕЛЕВОГО РЕЙТИНГА</div>
          <h1>Aluminstar</h1>
          <p>ООО «Завод СПК Звезда»</p>
          <div class="demoChips">${badge('№1 в целевом списке','teal')}${badge('соответствие профилю 92%')}${badge('крупный бизнес')}</div>
        </div>
        <div class="panel demoSource">
          <div class="eyebrow">КАК ОН ПОПАЛ НА САЙТ</div>
          <div class="sourceFlow"><span>Рейтинг BX</span><b>→</b><span>Персональная ссылка</span><b>→</b><span>Диагностика</span></div>
          <p>Источник фиксируется сразу, чтобы потом было видно, откуда пришёл лид и какая гипотеза привела его на сайт.</p>
        </div>
      </div>

      <div class="panel demoLoading" id="diagBox">
        <div class="spinner"></div>
        <h3>Система анализирует ответы Aluminstar</h3>
        <p>Проверяем финансы, денежный поток, продажи, операции, управление и рыночные риски.</p>
      </div>
    </section>`;

    try{
      const data = await post('/api/diagnostic',{profile:'aluminstar-demo'});
      const r = data.result;
      const priorities = r.findings.slice(0,3);
      document.getElementById('diagBox').outerHTML = `
        <div class="panel demoResult">
          <div class="demoResultHead">
            <div><div class="eyebrow">РЕЗУЛЬТАТ ПРЕДВАРИТЕЛЬНОЙ ДИАГНОСТИКИ</div><h2>Что требует внимания в первую очередь</h2></div>
            <div>${badge('уверенность: '+r.confidence,r.confidence==='высокая'?'green':'amber')}</div>
          </div>
          <div class="demoPriorityGrid">
            ${priorities.map((x,i)=>`<div class="demoPriority">
              <div class="demoPriorityNum">0${i+1}</div>
              <h3>${esc(x.area)}</h3>
              <p>${esc(x.finding)}</p>
              <div class="demoAction"><b>Что проверить:</b><span>${esc(x.action)}</span></div>
            </div>`).join('')}
          </div>
          <div class="demoConclusion">
            <div><div class="eyebrow">СЛЕДУЮЩИЙ ШАГ</div><strong>${esc(r.nextStep)}</strong></div>
            <button class="btn primary" id="openLeadForm">ОСТАВИТЬ ЗАЯВКУ →</button>
          </div>
        </div>
        <div id="leadFormHolder"></div>`;

      document.getElementById('openLeadForm').onclick=()=>showLeadForm(data);
    }catch(e){
      document.getElementById('diagBox').innerHTML='<h3>Не удалось получить результат</h3><p>'+esc(e.message)+'</p>';
    }
  }

  function showLeadForm(diag){
    document.getElementById('leadFormHolder').innerHTML=`
      <div class="panel demoLeadForm">
        <div class="eyebrow">ЗАЯВКА НА ПОЛНУЮ ДИАГНОСТИКУ</div>
        <h2>Данные, которые увидит наша команда</h2>
        <div class="demoFormGrid">
          <label>Компания<input id="fCompany" value="Aluminstar" readonly></label>
          <label>Юридическое лицо<input id="fLegal" value="ООО «Завод СПК Звезда»" readonly></label>
          <label>ИНН<input id="fInn" value="7724406329" readonly></label>
          <label>Кто обращается<input id="fRole" value="Собственник / руководитель"></label>
          <label>Что нужно<select id="fRequest"><option>Полная диагностика бизнеса</option><option>Разбор отдельного решения</option><option>90 дней изменений</option></select></label>
        </div>
        <label>Комментарий<textarea id="fNote" rows="3">Хотим понять, где теряется прибыль и почему рост не даёт ожидаемого денежного результата.</textarea></label>
        <div class="demoPrivacy">В демо-режиме реальные телефон и e-mail не сохраняются. Мы показываем только механику лида.</div>
        <button class="btn primary" id="submitLead">ОТПРАВИТЬ ЗАЯВКУ</button>
        <span id="submitState"></span>
      </div>`;

    document.getElementById('leadFormHolder').scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('submitLead').onclick=async()=>{
      const b=document.getElementById('submitLead');
      const s=document.getElementById('submitState');
      b.disabled=true;s.textContent=' Сохраняем...';
      try{
        const saved=await post('/api/leads',{
          company:'Aluminstar',
          legalName:'ООО «Завод СПК Звезда»',
          inn:document.getElementById('fInn').value,
          source:'Рейтинг потенциальных клиентов BX → персональная диагностика',
          sourceType:'Целевой список',
          rank:1,
          fitScore:92,
          sizeScore:90,
          contactRole:document.getElementById('fRole').value,
          request:document.getElementById('fRequest').value,
          note:document.getElementById('fNote').value,
          diagnostic:diag.result
        });
        renderLeadSaved(saved);
      }catch(e){
        b.disabled=false;s.textContent=' Ошибка: '+e.message;
      }
    };
  }

  function renderLeadSaved(saved){
    const lead=saved.lead;
    document.getElementById('leadFormHolder').innerHTML=`
      <div class="panel demoSaved">
        <div class="savedIcon">✓</div>
        <div>
          <div class="eyebrow">ЗАЯВКА ПРИНЯТА И СОХРАНЕНА</div>
          <h2>Создан лид ${esc(lead.id)}</h2>
          <p>Система связала заявку с диагностикой, проверила дубликаты, присвоила приоритет, выполнила внешний финансовый анализ по ИНН и сохранила историю.</p>
          <div class="demoSavedGrid">
            <div><span>Этап</span><b>${esc(lead.stage)}</b></div>
            <div><span>Квалификация</span><b>${esc(lead.qualification)}</b></div>
            <div><span>Источник</span><b>Целевой список BX</b></div>
            <div><span>Хранилище</span><b>${esc(saved.storage)}</b></div>
          </div>
          <div class="actions"><a class="btn primary" href="/crm-demo?lead=${encodeURIComponent(lead.id)}">ПОКАЗАТЬ, КАК ЛИД УПАЛ НАМ →</a></div>
        </div>
      </div>`;
    document.getElementById('leadFormHolder').scrollIntoView({behavior:'smooth',block:'center'});
  }

  async function renderCRM(){
    app.innerHTML=`<section class="demoShell">
      <div class="demoNotice internal"><b>Внутренний экран BX</b><span>Демо-воронка. Здесь не отображаются реальные персональные контакты.</span></div>
      ${topSteps(3)}
      <div class="crmHead"><div><div class="eyebrow">ВХОДЯЩИЕ ЛИДЫ</div><h1>Новые обращения</h1></div><a class="btn ghost" href="/demo/aluminstar">← Путь клиента</a></div>
      <div class="panel demoLoading" id="crmLoading"><div class="spinner"></div><h3>Загружаем базу лидов</h3></div>
    </section>`;
    try{
      const data=await get('/api/leads');
      const alum=data.leads.find(x=>x.demoKey==='aluminstar') || data.leads[0];
      if(!alum) throw new Error('Демо-лид не найден');
      if(!alum.research || alum.research.status!=='готово'){
        try{
          const rr=await post('/api/company-research',{company:'Aluminstar',legalName:'ООО «Завод СПК Звезда»',inn:'7724406329'});
          alum.research=rr.research;
        }catch(e){}
      }
      document.getElementById('crmLoading').outerHTML = crmContent(alum,data.storage);
    }catch(e){
      document.getElementById('crmLoading').innerHTML='<h3>Не удалось загрузить лиды</h3><p>'+esc(e.message)+'</p>';
    }
  }


  function researchContent(research){
    if(!research || research.status!=='готово'){
      return `<div class="panel crmResearch"><div class="eyebrow">АВТОАНАЛИЗ КОМПАНИИ</div><h2>Недостаточно данных</h2><p>Для автоматического финансового анализа нужен корректный ИНН.</p></div>`;
    }
    return `<div class="panel crmResearch">
      <div class="crmResearchHead">
        <div><div class="eyebrow">АВТОАНАЛИЗ ИЗ ОТКРЫТЫХ ИСТОЧНИКОВ</div><h2>Финансовый снимок компании</h2></div>
        ${badge('уверенность: '+research.confidence,research.confidence==='высокая'?'green':'amber')}
      </div>
      <div class="researchMetrics">
        ${(research.metrics||[]).map(m=>`<div class="researchMetric"><span>${esc(m.label)}</span><b class="${m.tone==='bad'?'redText':m.tone==='warn'?'amberText':m.tone==='good'?'greenText':''}">${esc(m.value)}</b></div>`).join('')}
      </div>
      <div class="researchGrid">
        <div><div class="eyebrow">ЧТО ВИДИТ СИСТЕМА</div><div class="researchSignals">
          ${(research.signals||[]).map(x=>`<div class="researchSignal ${x.tone}"><b>${esc(x.title)}</b><span>${esc(x.text)}</span></div>`).join('')}
        </div></div>
        <div><div class="eyebrow">ГИПОТЕЗЫ ДЛЯ ПЕРВОЙ ВСТРЕЧИ</div><ol class="researchIdeas">
          ${(research.hypotheses||[]).map(x=>`<li>${esc(x)}</li>`).join('')}
        </ol></div>
      </div>
      <div class="researchSources">
        <b>Источники:</b>
        ${(research.sources||[]).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)} ↗</a>`).join('')}
      </div>
      <p class="researchCaveat">${esc(research.caveat)}</p>
    </div>`;
  }

  function crmContent(lead,storage){
    const stages=['Новая заявка','Связались','Запрос данных','Полная диагностика','Предложение'];
    const area = lead.diagnostic?.findings?.[0]?.area || 'Не определено';
    return `
      <div class="crmPipeline">
        ${stages.map((s,i)=>`<div class="crmColumn"><div class="crmColumnHead"><b>${s}</b><span>${i===0?'1':'0'}</span></div>${i===0?`
          <div class="crmLeadCard">
            <div class="crmLeadTop"><div><b>Aluminstar</b><span>ООО «Завод СПК Звезда»</span></div>${badge('A','green')}</div>
            <p>Главная зона: <strong>${esc(area)}</strong></p>
            <div class="crmLeadMeta"><span>Источник: целевой рейтинг</span><span>Запрос: полная диагностика</span></div>
          </div>`:''}</div>`).join('')}
      </div>

      <div class="crmDetailGrid">
        <div class="panel crmCard">
          <div class="eyebrow">КАРТОЧКА ЛИДА</div>
          <h2>Aluminstar</h2>
          <div class="crmRows">
            <div><span>ID</span><b>${esc(lead.id)}</b></div>
            <div><span>Этап</span><b>${esc(lead.stage)}</b></div>
            <div><span>Приоритет</span><b>${esc(lead.qualification)}</b></div>
            <div><span>Источник</span><b>${esc(lead.source)}</b></div>
            <div><span>Первичный запрос</span><b>${esc(lead.request)}</b></div>
            <div><span>Главная зона внимания</span><b>${esc(area)}</b></div>
            <div><span>База</span><b>${esc(storage)}</b></div>
          </div>
          <div class="crmNext"><div class="eyebrow">СЛЕДУЮЩЕЕ ДЕЙСТВИЕ</div><strong>Связаться с компанией и запросить исходные данные для полной диагностики.</strong></div>
        </div>

        <div class="panel crmCard">
          <div class="eyebrow">КАК ЛИД БЫЛ СОЗДАН</div>
          <div class="crmTimeline">
            ${(lead.events||[]).map((e,i)=>`<div class="crmEvent"><i>${i+1}</i><div><b>${esc(e.title)}</b><span>${esc(e.detail)}</span></div></div>`).join('')}
          </div>
        </div>
      </div>

      ${researchContent(lead.research)}
      <div class="panel crmArchitecture">
        <div class="eyebrow">ЧТО СОХРАНЯЕТСЯ В БАЗЕ</div>
        <div class="architectureFlow">
          <span>Источник лида</span><b>→</b><span>Компания + ИНН</span><b>→</b><span>Диагностика</span><b>→</b><span>Открытые данные</span><b>→</b><span>Финансовый анализ</span><b>→</b><span>Гипотезы решений</span><b>→</b><span>Этап продажи</span>
        </div>
        <p>Когда мы подключим боевую CRM, эта же карточка сможет автоматически уходить менеджеру, создавать задачу, запускать уведомление и сохранять дальнейшую историю общения.</p>
      </div>`;
  }

  if(p==='/demo/aluminstar') renderAluminstar();
  if(p==='/crm-demo') renderCRM();
})();