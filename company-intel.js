const sleep = ms => new Promise(r => setTimeout(r, ms));

function cleanHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;|&#xA0;|&#8239;|&#x202F;|&thinsp;/gi, ' ')
    .replace(/&quot;/gi, '"').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/[\u2009\u202f\u00a0]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function firstMatch(text, patterns) {
  for (const p of patterns) {
    const m = String(text || '').match(p);
    if (m && m[1]) return m[1].replace(/\s+/g, ' ').trim();
  }
  return '';
}

function numberFrom(value) {
  if (value == null) return null;
  const s = String(value).replace(/\s/g, '').replace(',', '.');
  const n = Number(s.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function moneyByUnit(value, unit) {
  const n = numberFrom(value);
  if (!Number.isFinite(n)) return null;
  const u = String(unit || '').toLowerCase();
  if (u.includes('млрд')) return Math.round(n * 1e9);
  if (u.includes('млн')) return Math.round(n * 1e6);
  if (u.includes('тыс')) return Math.round(n * 1e3);
  return Math.round(n);
}

function formatRub(rub) {
  if (!Number.isFinite(rub)) return null;
  if (Math.abs(rub) >= 1e9) return (rub / 1e9).toFixed(Math.abs(rub) >= 1e10 ? 1 : 2).replace('.', ',') + ' млрд ₽';
  if (Math.abs(rub) >= 1e6) return (rub / 1e6).toFixed(Math.abs(rub) >= 1e8 ? 1 : 2).replace('.', ',') + ' млн ₽';
  if (Math.abs(rub) >= 1e3) return (rub / 1e3).toFixed(1).replace('.', ',') + ' тыс. ₽';
  return Math.round(rub).toLocaleString('ru-RU') + ' ₽';
}

function percent(v) {
  return Number.isFinite(v) ? (v * 100).toFixed(1).replace('.', ',') + '%' : null;
}

function isValidInn(value) {
  const inn = String(value || '').replace(/\D/g, '');
  if (inn.length === 10) {
    const k = [2,4,10,3,5,9,4,6,8];
    return k.reduce((s,w,i) => s + w * Number(inn[i]), 0) % 11 % 10 === Number(inn[9]);
  }
  if (inn.length === 12) {
    const a = [7,2,4,10,3,5,9,4,6,8];
    const b = [3,7,2,4,10,3,5,9,4,6,8];
    const c1 = a.reduce((s,w,i) => s + w * Number(inn[i]), 0) % 11 % 10;
    const c2 = b.reduce((s,w,i) => s + w * Number(inn[i]), 0) % 11 % 10;
    return c1 === Number(inn[10]) && c2 === Number(inn[11]);
  }
  return false;
}

async function fetchText(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeout || 9000);
  try {
    const r = await fetch(url, {
      method: opts.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.6',
        ...(opts.headers || {})
      },
      body: opts.body,
      redirect: 'follow',
      signal: controller.signal
    });
    const text = await r.text();
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return { text, headers: r.headers, url: r.url };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, opts = {}) {
  const r = await fetchText(url, opts);
  return { data: JSON.parse(r.text), headers: r.headers, url: r.url };
}

function sourceState(key, name, url, status, detail, fields = 0) {
  return { key, name, url, status, detail, fields };
}

async function sourceEgrul(inn) {
  const url = 'https://egrul.nalog.ru/';
  try {
    const body = new URLSearchParams({ query: inn });
    const r = await fetchText(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://egrul.nalog.ru/index.html'
      },
      body
    });
    const start = JSON.parse(r.text);
    if (start.captchaRequired) return { source: sourceState('egrul','ФНС — ЕГРЮЛ',url,'ограничен','ФНС запросила CAPTCHA',0), data: {} };
    if (!start.t) return { source: sourceState('egrul','ФНС — ЕГРЮЛ',url,'нет данных','Токен поиска не получен',0), data: {} };

    const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
    let result = null;
    for (let i = 0; i < 5; i++) {
      await sleep(350 + i * 200);
      try {
        const q = await fetchJson('https://egrul.nalog.ru/search-result/' + encodeURIComponent(start.t), {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://egrul.nalog.ru/index.html',
            ...(cookie ? { 'Cookie': cookie } : {})
          }
        });
        result = q.data;
        if (result && Array.isArray(result.rows)) break;
      } catch (e) {}
    }

    const rows = (result && result.rows) || [];
    const row = rows.find(x => String(x.i || '') === inn) || rows[0];
    if (!row) return { source: sourceState('egrul','ФНС — ЕГРЮЛ',url,'нет данных','Организация не найдена в ответе ФНС',0), data: {} };

    const liquidationDate = row.e || row.lDate || row.ld || '';
    const legalName = row.n || row.c || '';
    const data = {
      legalName,
      shortName: row.c || legalName,
      inn: row.i || inn,
      ogrn: row.o || '',
      kpp: row.p || row.k || '',
      registrationDate: row.r || '',
      liquidationDate,
      status: liquidationDate ? 'Недействующая' : 'Действующая',
      director: row.g || '',
      address: row.a || ''
    };
    return { source: sourceState('egrul','ФНС — ЕГРЮЛ','https://egrul.nalog.ru/index.html','ok','Официальный реестр ФНС',Object.values(data).filter(Boolean).length), data };
  } catch (e) {
    return { source: sourceState('egrul','ФНС — ЕГРЮЛ',url,'ошибка',e.message,0), data: {} };
  }
}

async function sourceBo(inn) {
  const base = 'https://bo.nalog.gov.ru';
  try {
    const searchUrl = base + '/advanced-search/organizations/search?query=' + encodeURIComponent(inn) + '&page=0&size=20';
    const search = await fetchJson(searchUrl, {
      timeout: 10000,
      headers: { 'Accept':'application/json', 'Referer':base + '/' }
    });
    const raw = search.data || {};
    const items = Array.isArray(raw) ? raw : (Array.isArray(raw.content) ? raw.content : (Array.isArray(raw.items) ? raw.items : []));
    const strip = v => cleanHtml(String(v || ''));
    const org = items.find(x => strip(x.inn) === inn) || items[0];
    if (!org || !org.id) {
      return { source: sourceState('bo','ФНС — бухгалтерская отчётность',base + '/','нет данных','Организация не найдена в ГИР БО',0), data: {} };
    }

    const bfoUrl = base + '/nbo/organizations/' + encodeURIComponent(org.id) + '/bfo/';
    const detail = await fetchJson(bfoUrl, {
      timeout: 10000,
      headers: { 'Accept':'application/json', 'Referer':base + '/' }
    });
    const periods = Array.isArray(detail.data) ? detail.data : (Array.isArray(detail.data && detail.data.content) ? detail.data.content : []);
    const sorted = [...periods].sort((a,b) => Number(b.period || 0) - Number(a.period || 0));
    let chosen = null;
    for (const period of sorted) {
      const corrections = Array.isArray(period.typeCorrections) ? period.typeCorrections : [];
      const annual = corrections.find(x => Number(x.type) === 12 && x.correction) || corrections.find(x => x.correction);
      if (annual && annual.correction) {
        chosen = { period, correction: annual.correction };
        break;
      }
    }
    if (!chosen) {
      return { source: sourceState('bo','ФНС — бухгалтерская отчётность',bfoUrl,'нет данных','Карточка найдена, но годовая отчётность недоступна',0), data: {
        legalName: strip(org.shortName || org.name || ''),
        latestYear: numberFrom(org.bfo && org.bfo.period)
      }};
    }

    const correction = chosen.correction || {};
    const fr = correction.financialResult || {};
    const bal = correction.balance || {};
    const rub = v => {
      const n = numberFrom(v);
      return Number.isFinite(n) ? n * 1000 : null;
    };
    const data = {
      boId: org.id,
      legalName: strip(org.shortName || org.name || ''),
      latestYear: Number(chosen.period.period || (org.bfo && org.bfo.period) || 0) || null,
      revenue: rub(fr.current2110),
      revenuePrev: rub(fr.previous2110),
      netProfit: rub(fr.current2400),
      netProfitPrev: rub(fr.previous2400),
      assets: rub(bal.current1600),
      currentAssets: rub(bal.current1200),
      equity: rub(bal.current1300),
      currentLiabilities: rub(bal.current1500),
      payables: rub(bal.current1520),
      receivables: rub(bal.current1230),
      inventory: rub(bal.current1210),
      cash: rub(bal.current1250),
      okved: strip(org.okved2 || ''),
      statusCode: strip(org.statusCode || ''),
      statusDate: strip(org.statusDate || '')
    };
    return { source: sourceState('bo','ФНС — бухгалтерская отчётность',base + '/','ok','Официальная годовая отчётность ФНС за ' + (data.latestYear || 'последний доступный') + ' год',Object.values(data).filter(v => v !== null && v !== '').length), data };
  } catch (e) {
    return { source: sourceState('bo','ФНС — бухгалтерская отчётность','https://bo.nalog.gov.ru/','ошибка',e.message,0), data: {} };
  }
}

async function sourcePb(inn) {
  const searchUrl = 'https://pb.nalog.ru/search-proc.json';
  const companyUrl = 'https://pb.nalog.ru/company-proc.json';
  const formHeaders = {
    'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With':'XMLHttpRequest',
    'Referer':'https://pb.nalog.ru/'
  };
  const postForm = async (url, obj) => {
    const body = new URLSearchParams(obj);
    const r = await fetchText(url,{method:'POST',headers:formHeaders,body,timeout:10000});
    return JSON.parse(r.text);
  };
  try {
    let result = await postForm(searchUrl,{mode:'search-ul',queryUl:inn,page:'1',pageSize:'10'});
    if (result && result.captchaRequired) {
      return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','ограничен','ФНС запросила CAPTCHA',0), data:{} };
    }
    if (result && result.id && !(result.ul && result.ul.data)) {
      for (let i=0;i<6;i++) {
        await sleep(350+i*250);
        const polled = await postForm(searchUrl,{id:String(result.id),method:'get-response'});
        if (polled && polled.captchaRequired) {
          return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','ограничен','ФНС запросила CAPTCHA',0), data:{} };
        }
        if (polled && polled.ul && Array.isArray(polled.ul.data)) { result=polled; break; }
      }
    }
    const rows = result && result.ul && Array.isArray(result.ul.data) ? result.ul.data : [];
    const row = rows.find(x => cleanHtml(String(x.inn || x.ИНН || '')) === inn) || rows[0];
    if (!row) {
      return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','нет данных','Компания не найдена в ответе сервиса',0), data:{} };
    }

    let vyp = {};
    if (row.token) {
      try {
        let req = await postForm(companyUrl,{token:String(row.token),method:'get-request'});
        if (req && req.captchaRequired) {
          return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','ограничен','ФНС запросила CAPTCHA при открытии карточки',0), data:{
            legalName: cleanHtml(String(row.name || row.naim || row.НаимЮЛПолн || ''))
          }};
        }
        if (req && req.id) {
          for (let i=0;i<6;i++) {
            await sleep(350+i*250);
            const polled = await postForm(companyUrl,{token:String(row.token),id:String(req.id),method:'get-response'});
            if (polled && polled.vyp) { vyp=polled.vyp; break; }
          }
        } else if (req && req.vyp) {
          vyp=req.vyp;
        }
      } catch(e) {}
    }

    const data = {
      legalName: cleanHtml(String(vyp['НаимЮЛПолн'] || row['НаимЮЛПолн'] || row.name || '')),
      shortName: cleanHtml(String(vyp['НаимЮЛСокр'] || row['НаимЮЛСокр'] || '')),
      ogrn: cleanHtml(String(vyp['ОГРН'] || row.ogrn || row['ОГРН'] || '')),
      registrationDate: cleanHtml(String(vyp['ДатаРег'] || vyp['ДатаОГРН'] || row.registrationDate || '')),
      okved: cleanHtml(String((vyp['КодОКВЭД'] || '') + ' ' + (vyp['НаимОКВЭД'] || ''))).trim(),
      tokenFound: !!row.token
    };
    return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','ok','Официальная карточка ФНС',Object.values(data).filter(Boolean).length), data };
  } catch (e) {
    const detail = /403|451|captcha/i.test(e.message) ? 'Доступ ограничен для текущего сервера: ' + e.message : e.message;
    return { source: sourceState('pb','ФНС — Прозрачный бизнес','https://pb.nalog.ru/','ошибка',detail,0), data:{} };
  }
}

function codeValue(text, code) {
  const re = new RegExp('(?:^|\\s)' + code + '\\s+(-?[0-9][0-9\\s.,]{0,30})');
  const m = String(text || '').match(re);
  if (!m) return null;
  const n = numberFrom(m[1]);
  return Number.isFinite(n) ? n * 1000 : null;
}

async function sourceEecolog(inn) {
  const years = [2025,2024,2023,2022,2021];
  for (const year of years) {
    const url = 'https://e-ecolog.ru/buh/' + year + '/' + inn;
    try {
      const r = await fetchText(url, { timeout: 6500 });
      const text = cleanHtml(r.text);
      if (text.includes(inn) && /Бухгалтерск|финансов/i.test(text) && text.length > 500) {
        const data = {
          latestYear: year,
          legalName: firstMatch(text, [
            /Наименование организации\s+(.{3,180}?)\s+ИНН/i,
            /Бухгалтерская отчетность\s+(.{3,180}?)\s+ИНН/i
          ]),
          revenue: codeValue(text,'2110'),
          netProfit: codeValue(text,'2400'),
          assets: codeValue(text,'1600'),
          currentAssets: codeValue(text,'1200'),
          equity: codeValue(text,'1300'),
          currentLiabilities: codeValue(text,'1500'),
          payables: codeValue(text,'1520'),
          receivables: codeValue(text,'1230'),
          inventory: codeValue(text,'1210'),
          cash: codeValue(text,'1250')
        };
        return { source: sourceState('eecolog','Е-Досье / бухгалтерская отчётность',url,'ok','Найдена отчётность за ' + year + ' год',Object.values(data).filter(Boolean).length), data };
      }
    } catch (e) {}
  }
  return { source: sourceState('eecolog','Е-Досье / бухгалтерская отчётность','https://e-ecolog.ru/','нет данных','Отчётность за 2021–2025 годы не найдена',0), data: {} };
}

function parseStatusText(text) {
  if (/исключен[оа]? из ЕГРЮЛ|ликвидирован|прекращен/i.test(text)) return 'Недействующая';
  if (/действует|действующая|действующее/i.test(text)) return 'Действующая';
  return '';
}

async function sourceXfirm(inn) {
  const url = 'https://xfirm.ru/company/' + inn;
  try {
    const r = await fetchText(url, { timeout: 8500 });
    const text = cleanHtml(r.text);
    if (!text.includes(inn) || text.length < 500) return { source: sourceState('xfirm','Xfirm',url,'нет данных','Карточка не найдена',0), data: {} };

    const rev = text.match(/Выручка\s*([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн|тыс)?\s*₽/i);
    const profit = text.match(/Чистая прибыль\s*([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн|тыс)?\s*₽/i);
    const employees = firstMatch(text,[/Среднесписочная численность сотрудников\s+([0-9]+)/i]);
    const arb = firstMatch(text,[/Арбитражные дела[\s\S]{0,180}?Все\s*\((\d+)\)/i,/Все арбитражные дела\s+(\d+)/i]);
    const enforcement = firstMatch(text,[/Все исполнительные производства\s+(\d+)/i]);
    const linked = firstMatch(text,[/Связи[^.]{0,160}?Найдено\s*-\s*(\d+)/i]);
    const data = {
      legalName: firstMatch(text,[
        /(ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ\s+[«"].{2,180}?[»"])/i,
        /(ООО\s+[«"].{2,180}?[»"])/i
      ]),
      status: parseStatusText(text),
      ogrn: firstMatch(text,[/ОГРН\s+(\d{13,15})/i]),
      kpp: firstMatch(text,[/КПП\s+(\d{9})/i]),
      registrationDate: firstMatch(text,[/Дата регистрации\s+([0-9]{1,2}\s+\S+\s+[0-9]{4})/i]),
      liquidationDate: firstMatch(text,[/Ликвидирован[ао]?\s+([0-9]{1,2}\s+\S+\s+[0-9]{4})/i]),
      director: firstMatch(text,[/Генеральный директор\s+([А-ЯЁ][А-Яа-яЁё-]+\s+[А-ЯЁ][А-Яа-яЁё-]+\s+[А-ЯЁ][А-Яа-яЁё-]+)/i]),
      address: firstMatch(text,[/Юридический адрес\s+(.{10,220}?)\s+(?:сведения|Реестр|Предыдущие|Основной вид)/i]),
      okved: firstMatch(text,[/Основной вид деятельности по ОКВЭД\s+([0-9.]+\s+.{3,160}?)(?:Все виды|Налоговый орган|Коды статистики)/i]),
      revenue: rev ? moneyByUnit(rev[1],rev[2]) : null,
      netProfit: profit ? moneyByUnit(profit[1],profit[2]) : null,
      employees: employees ? Number(employees) : null,
      arbitrationCount: arb ? Number(arb) : null,
      enforcementCount: enforcement ? Number(enforcement) : null,
      relatedCount: linked ? Number(linked) : null,
      hasUnreliableData: /сведения недостоверны|недостоверност/i.test(text),
      procurement: /Нет заключенных контрактов/i.test(text) ? 'Нет заключённых контрактов' : ''
    };
    return { source: sourceState('xfirm','Xfirm',url,'ok','Расширенная открытая карточка компании',Object.values(data).filter(v => v !== null && v !== '').length), data };
  } catch (e) {
    return { source: sourceState('xfirm','Xfirm',url,'ошибка',e.message,0), data: {} };
  }
}

async function sourceFirmoteka(inn) {
  const url = 'https://firmoteka.ru/' + inn;
  try {
    const r = await fetchText(url, { timeout: 8000 });
    const text = cleanHtml(r.text);
    if (!text.includes(inn) || text.length < 300) return { source: sourceState('firmoteka','Фирмотека',url,'нет данных','Карточка не найдена',0), data: {} };
    const rev = text.match(/Выручка[^0-9]{0,50}([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн|тыс)?\s*₽/i);
    const prof = text.match(/(?:Чистая прибыль|Прибыль)[^0-9]{0,50}([0-9]+(?:[,.][0-9]+)?)\s*(млрд|млн|тыс)?\s*₽/i);
    const data = {
      legalName: firstMatch(text,[/(ООО\s+[«"].{2,160}?[»"])/i,/(АО\s+[«"].{2,160}?[»"])/i]),
      status: parseStatusText(text),
      revenue: rev ? moneyByUnit(rev[1],rev[2]) : null,
      netProfit: prof ? moneyByUnit(prof[1],prof[2]) : null,
      employees: numberFrom(firstMatch(text,[/(?:Сотрудники|Среднесписочная численность)[^0-9]{0,30}(\d{1,6})/i]))
    };
    return { source: sourceState('firmoteka','Фирмотека',url,'ok','Публичная карточка и финансовые показатели',Object.values(data).filter(v => v !== null && v !== '').length), data };
  } catch (e) {
    return { source: sourceState('firmoteka','Фирмотека',url,'ошибка',e.message,0), data: {} };
  }
}

async function sourceOpenweb(inn) {
  const url = 'https://www.openweb.ru/' + inn;
  try {
    const r = await fetchText(url, { timeout: 7500 });
    const text = cleanHtml(r.text);
    if (!text.includes(inn) || text.length < 300) return { source: sourceState('openweb','OpenWeb',url,'нет данных','Карточка не найдена',0), data: {} };
    const data = {
      legalName: firstMatch(text,[/(ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ\s+[«"].{2,180}?[»"])/i,/(ООО\s+[«"].{2,160}?[»"])/i]),
      status: parseStatusText(text),
      ogrn: firstMatch(text,[/ОГРН\s+(\d{13,15})/i]),
      okved: firstMatch(text,[/Основной род деятельности\s*[—-]\s*(.{3,180}?)(?:В \d{4}|Генеральный|$)/i])
    };
    return { source: sourceState('openweb','OpenWeb',url,'ok','Дополнительная открытая карточка',Object.values(data).filter(Boolean).length), data };
  } catch (e) {
    return { source: sourceState('openweb','OpenWeb',url,'ошибка',e.message,0), data: {} };
  }
}

async function sourceProcurement(inn) {
  const url = 'https://www.gos-postavki.ru/company/' + inn;
  try {
    const r = await fetchText(url, { timeout: 7000 });
    const text = cleanHtml(r.text);
    if (!text.includes(inn) || text.length < 250) return { source: sourceState('procurement','Гос-поставки / закупки',url,'нет данных','Карточка не найдена',0), data: {} };
    const data = {
      legalName: firstMatch(text,[/(ООО\s+[«"].{2,160}?[»"])/i]),
      procurementMention: /тендер|закупк/i.test(text),
      okved: firstMatch(text,[/Основным видом деятельности является\s+(.{3,180}?)(?:Cовладельцы|руководителем|$)/i])
    };
    return { source: sourceState('procurement','Гос-поставки / закупки',url,'ok','Проверен закупочный профиль',Object.values(data).filter(Boolean).length), data };
  } catch (e) {
    return { source: sourceState('procurement','Гос-поставки / закупки',url,'ошибка',e.message,0), data: {} };
  }
}

function choose(...vals) {
  for (const v of vals) if (v !== null && v !== undefined && v !== '') return v;
  return null;
}

function makeMetrics(d) {
  const out = [];
  if (d.latestYear) out.push({label:'Последняя отчётность',value:String(d.latestYear),tone:'neutral'});
  if (Number.isFinite(d.revenue)) out.push({label:'Выручка',value:formatRub(d.revenue),tone:'neutral'});
  if (Number.isFinite(d.revenueGrowth)) out.push({label:'Изменение выручки',value:(d.revenueGrowth>=0?'+':'')+percent(d.revenueGrowth),tone:d.revenueGrowth<-0.2?'bad':d.revenueGrowth<0?'warn':'good'});
  if (Number.isFinite(d.netProfit)) out.push({label:'Чистая прибыль',value:formatRub(d.netProfit),tone:d.netProfit<0?'bad':'neutral'});
  if (Number.isFinite(d.netMargin)) out.push({label:'Чистая рентабельность',value:percent(d.netMargin),tone:d.netMargin<0?'bad':d.netMargin<0.03?'warn':'good'});
  if (Number.isFinite(d.receivables)) out.push({label:'Дебиторская задолженность',value:formatRub(d.receivables),tone:'neutral'});
  if (Number.isFinite(d.cash)) out.push({label:'Деньги на отчётную дату',value:formatRub(d.cash),tone:'neutral'});
  if (Number.isFinite(d.employees)) out.push({label:'Сотрудники',value:String(d.employees),tone:'neutral'});
  return out;
}

function buildSignals(d) {
  const signals = [], hypotheses = [];
  if (d.status === 'Недействующая') {
    signals.push({tone:'bad',title:'Юридическое лицо недействующее',text:d.liquidationDate?'Прекращение зафиксировано: '+d.liquidationDate+'.':'Компания отмечена как недействующая.'});
    hypotheses.push('Не вести это юрлицо как активный коммерческий лид. Проверить действующие связанные компании, бренд и объект.');
  }
  if (d.hasUnreliableData) {
    signals.push({tone:'bad',title:'Есть отметка о недостоверности сведений',text:'Перед контактом нужно проверить актуальное действующее юрлицо и адрес.'});
    hypotheses.push('Проверить действующие юридические лица группы и актуальные реквизиты.');
  }
  if (Number.isFinite(d.revenueGrowth) && d.revenueGrowth < -0.25) {
    signals.push({tone:'bad',title:'Сильное снижение выручки',text:'Последняя доступная выручка заметно ниже предыдущего периода.'});
    hypotheses.push('Понять, связано ли падение с закрытием объекта, сменой юрлица, потерей клиентов или реструктуризацией.');
  } else if (Number.isFinite(d.revenueGrowth) && d.revenueGrowth < 0) {
    signals.push({tone:'warn',title:'Выручка снижается',text:'Динамика последнего периода отрицательная.'});
    hypotheses.push('Разобрать причины снижения продаж и загрузки.');
  }
  if (Number.isFinite(d.netMargin) && d.netMargin < 0.03) {
    signals.push({tone:'warn',title:'Низкая чистая рентабельность',text:'Запас прибыли относительно выручки невелик.'});
    hypotheses.push('Проверить цены, скидки, фонд оплаты труда и прибыльность направлений.');
  }
  if (Number.isFinite(d.currentRatio) && d.currentRatio < 1) {
    signals.push({tone:'bad',title:'Оборотных активов меньше краткосрочных обязательств',text:'Это требует проверки ликвидности и платёжного календаря.'});
    hypotheses.push('Проверить структуру краткосрочных обязательств и фактический денежный резерв.');
  }
  if (Number.isFinite(d.arbitrationCount) && d.arbitrationCount > 0) {
    signals.push({tone:d.arbitrationCount>=5?'warn':'neutral',title:'Есть арбитражные дела',text:'В открытой карточке найдено дел: '+d.arbitrationCount+'.'});
  }
  if (Number.isFinite(d.enforcementCount) && d.enforcementCount > 0) {
    signals.push({tone:'warn',title:'Есть исполнительные производства',text:'В открытых данных найдено производств: '+d.enforcementCount+'.'});
    hypotheses.push('Проверить характер и актуальность исполнительных производств до квалификации лида.');
  }
  if (Number.isFinite(d.relatedCount) && d.relatedCount > 0 && d.status === 'Недействующая') {
    signals.push({tone:'good',title:'Есть связанные лица и компании',text:'Открытый источник показывает связи; это полезно для поиска действующего преемника.'});
    hypotheses.push('Построить карту связанных действующих компаний и определить, куда перенеслась операционная деятельность.');
  }
  if (!signals.length) {
    signals.push({tone:'neutral',title:'Критических публичных сигналов недостаточно',text:'Открытые данные собраны, но для содержательной диагностики нужны внутренние данные компании.'});
    hypotheses.push('Запросить управленческую отчётность, структуру продаж и движение денежных средств.');
  }
  return {signals:signals.slice(0,7), hypotheses:[...new Set(hypotheses)].slice(0,7)};
}

async function enrichCompany({inn}) {
  const safeInn = String(inn || '').replace(/\D/g, '');
  if (!isValidInn(safeInn)) {
    return {status:'ошибка ИНН',inn:safeInn,confidence:'низкая',metrics:[],signals:[],hypotheses:[],sources:[],message:'ИНН не прошёл проверку контрольной суммы.'};
  }

  const results = await Promise.all([
    sourceEgrul(safeInn),
    sourceBo(safeInn),
    sourcePb(safeInn),
    sourceEecolog(safeInn),
    sourceXfirm(safeInn),
    sourceFirmoteka(safeInn),
    sourceOpenweb(safeInn),
    sourceProcurement(safeInn)
  ]);

  const map = Object.fromEntries(results.map(x => [x.source.key, x.data || {}]));
  const sources = results.map(x => x.source);
  const e = map.egrul || {}, b = map.bo || {}, pb = map.pb || {}, ec = map.eecolog || {}, x = map.xfirm || {}, f = map.firmoteka || {}, o = map.openweb || {}, p = map.procurement || {};

  const revenue = choose(b.revenue,ec.revenue,x.revenue,f.revenue);
  const revenuePrev = choose(b.revenuePrev,null);
  const netProfit = choose(b.netProfit,ec.netProfit,x.netProfit,f.netProfit);
  const currentAssets = choose(b.currentAssets,ec.currentAssets);
  const currentLiabilities = choose(b.currentLiabilities,ec.currentLiabilities);
  const assets = choose(b.assets,ec.assets);
  const equity = choose(b.equity,ec.equity);
  const receivables = choose(b.receivables,ec.receivables);
  const payables = choose(b.payables,ec.payables);
  const inventory = choose(b.inventory,ec.inventory);
  const cash = choose(b.cash,ec.cash);

  const d = {
    inn:safeInn,
    legalName:choose(e.legalName,pb.legalName,x.legalName,b.legalName,ec.legalName,f.legalName,o.legalName,p.legalName)||'',
    shortName:choose(e.shortName,pb.shortName,x.legalName,f.legalName)||'',
    ogrn:choose(e.ogrn,pb.ogrn,x.ogrn,o.ogrn)||'',
    kpp:choose(e.kpp,x.kpp)||'',
    status:choose(e.status,x.status,f.status,o.status)||'Не определён',
    registrationDate:choose(e.registrationDate,x.registrationDate)||'',
    liquidationDate:choose(e.liquidationDate,x.liquidationDate)||'',
    director:choose(e.director,x.director)||'',
    address:choose(e.address,x.address)||'',
    okved:choose(pb.okved,b.okved,x.okved,o.okved,p.okved)||'',
    latestYear:choose(b.latestYear,ec.latestYear)||null,
    revenue,revenuePrev,netProfit,assets,currentAssets,currentLiabilities,equity,receivables,payables,inventory,cash,
    employees:choose(x.employees,f.employees)||null,
    arbitrationCount:x.arbitrationCount,
    enforcementCount:x.enforcementCount,
    relatedCount:x.relatedCount,
    hasUnreliableData:!!x.hasUnreliableData,
    procurement:x.procurement||''
  };

  d.revenueGrowth = Number.isFinite(revenue) && Number.isFinite(revenuePrev) && revenuePrev !== 0 ? revenue / revenuePrev - 1 : null;
  d.netMargin = Number.isFinite(netProfit) && Number.isFinite(revenue) && revenue !== 0 ? netProfit / revenue : null;
  d.currentRatio = Number.isFinite(currentAssets) && Number.isFinite(currentLiabilities) && currentLiabilities !== 0 ? currentAssets / currentLiabilities : null;
  d.equityShare = Number.isFinite(equity) && Number.isFinite(assets) && assets !== 0 ? equity / assets : null;
  d.receivablesShare = Number.isFinite(receivables) && Number.isFinite(revenue) && revenue !== 0 ? receivables / revenue : null;

  const {signals,hypotheses} = buildSignals(d);
  const ok = sources.filter(s => s.status === 'ok').length;
  const official = sources.filter(s => ['egrul','bo','pb'].includes(s.key) && s.status === 'ok').length;
  const confidence = official >= 2 ? 'высокая' : official >= 1 && ok >= 2 ? 'выше средней' : ok >= 2 ? 'средняя' : 'низкая';

  let leadRecommendation = 'Требует ручной квалификации';
  if (d.status === 'Недействующая') leadRecommendation = 'Не вести это юрлицо как активный лид; искать действующего преемника';
  else if (signals.some(s => s.tone === 'bad')) leadRecommendation = 'Высокий приоритет для проверки и первого контакта';
  else if (ok >= 3) leadRecommendation = 'Можно квалифицировать как потенциальный лид';

  return {
    status:ok ? 'готово' : 'данные не найдены',
    researchedAt:new Date().toISOString(),
    company:d.shortName || d.legalName || ('Компания ' + safeInn),
    legalName:d.legalName,
    inn:safeInn,
    confidence,
    sourceCoverage:{successful:ok,total:sources.length,officialSuccessful:official},
    profile:{
      status:d.status,ogrn:d.ogrn,kpp:d.kpp,registrationDate:d.registrationDate,liquidationDate:d.liquidationDate,
      director:d.director,address:d.address,okved:d.okved,employees:d.employees,arbitrationCount:d.arbitrationCount,
      enforcementCount:d.enforcementCount,relatedCount:d.relatedCount,hasUnreliableData:d.hasUnreliableData,procurement:d.procurement
    },
    facts:{
      latestYear:d.latestYear,revenue:d.revenue,revenuePrev:d.revenuePrev,netProfit:d.netProfit,assets:d.assets,
      currentAssets:d.currentAssets,currentLiabilities:d.currentLiabilities,equity:d.equity,receivables:d.receivables,
      payables:d.payables,inventory:d.inventory,cash:d.cash
    },
    ratios:{revenueGrowth:d.revenueGrowth,netMargin:d.netMargin,currentRatio:d.currentRatio,equityShare:d.equityShare,receivablesShare:d.receivablesShare},
    metrics:makeMetrics(d),
    signals,hypotheses,leadRecommendation,sources,
    caveat:'Автоматический анализ основан на открытых данных. Он служит для предварительной квалификации лида и должен подтверждаться первичными документами компании.'
  };
}

module.exports = { enrichCompany, isValidInn, formatRub };