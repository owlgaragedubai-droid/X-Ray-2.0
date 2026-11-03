'use strict';
const { createHash, timingSafeEqual } = require('crypto');

function protectedPath(urlPath, method) {
  const p = urlPath.toLowerCase().replace(/\/+$/, '') || '/';
  if (p === '/api/leads' && method === 'POST') return false;
  return p === '/leads' || p === '/leads.html' || p === '/crm-demo' ||
    p === '/demo/aluminstar' || p === '/api/leads' || p.startsWith('/api/leads/');
}

function isAdmin(req, env = process.env) {
  // An unset credential must never turn protection off.
  if (!env.BX_ADMIN_PASSWORD || env.BX_ADMIN_PASSWORD.length < 20) return false;
  const match = /^Basic ([A-Za-z0-9+/=]+)$/.exec(req.headers.authorization || '');
  if (!match || match[1].length > 4096) return false;
  const actual = createHash('sha256').update(Buffer.from(match[1], 'base64')).digest();
  const expected = createHash('sha256').update((env.BX_ADMIN_USER || 'bx') + ':' + env.BX_ADMIN_PASSWORD).digest();
  return timingSafeEqual(actual, expected);
}

function requireAdmin(req, res, env = process.env) {
  if (isAdmin(req, env)) return true;
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="BX private", charset="UTF-8"',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow'
  });
  res.end(JSON.stringify({ ok: false, error: 'Для доступа к обращениям требуется вход.' }));
  return false;
}

function cleanText(value, max, multiline = false) {
  if (typeof value !== 'string') return '';
  return value.replace(multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g : /[\x00-\x1f\x7f]/g, '').trim().slice(0, max);
}

function intakeFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Проверьте данные заявки.');
  const email = cleanText(body.email, 254);
  const phone = cleanText(body.phone, 40);
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('Проверьте адрес электронной почты.');
  if (phone && (phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15)) throw new Error('Проверьте номер телефона.');
  if (!email && !phone) throw new Error('Укажите email или телефон для ответа.');
  const note = cleanText(body.note, 5000, true);
  if (!note) throw new Error('Опишите ваш вопрос.');
  return {
    company: cleanText(body.company, 200),
    contactName: cleanText(body.contactName, 120),
    contactRole: cleanText(body.contactRole, 120),
    request: cleanText(body.request, 200) || 'Обращение с сайта',
    email, phone, note
  };
}

module.exports = { protectedPath, isAdmin, requireAdmin, intakeFields };
