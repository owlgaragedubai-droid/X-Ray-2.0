'use strict';
// Owner-only HTTPS bridge. Credentials stay in Render runtime variables.
const { createHash, timingSafeEqual } = require('crypto');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');
const ACCOUNT = 'sv@savinov.club';
const MAX_RAW = 20 * 1024 * 1024;
const MAX_INPUT = 9 * 1024 * 1024;
const hash = x => createHash('sha256').update(x).digest('hex');

class MailError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
function fail(code, message, status) { throw new MailError(code, message, status); }
function tokenOK(header, secret) {
  if (typeof secret !== 'string' || secret.length < 48 || typeof header !== 'string') return false;
  const wanted = Buffer.from(hash('Bearer ' + secret));
  const supplied = Buffer.from(hash(header));
  return timingSafeEqual(wanted, supplied);
}
function text(value, max = 256, multiline = false) {
  if (typeof value !== 'string' || value.length > max || (multiline ? /[\x00]/ : /[\x00-\x1f\x7f]/).test(value)) fail('INVALID_INPUT', 'Некорректное текстовое поле.');
  return value.trim();
}
function int(value, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail('INVALID_INPUT', 'Некорректное числовое поле.');
  return value;
}
function credentials(env) {
  if (String(env.SMTP_USER || '').toLowerCase() !== ACCOUNT || !env.SMTP_PASSWORD) fail('MAIL_NOT_CONFIGURED', 'Рабочий ящик ещё не настроен.', 503);
  return { user: ACCOUNT, pass: env.SMTP_PASSWORD };
}
function smtp(env) {
  const port = Number(env.SMTP_PORT || 465);
  if (![465, 587].includes(port)) fail('MAIL_NOT_CONFIGURED', 'Не настроено защищённое SMTP-соединение.', 503);
  return nodemailer.createTransport({
    host: env.SMTP_HOST || 'mail.nic.ru', port, secure: port === 465, requireTLS: true,
    auth: credentials(env), tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true
  });
}
async function withImap(env, fn) {
  const client = new ImapFlow({
    host: env.BX_MAIL_IMAP_HOST || 'mail.nic.ru', port: 993, secure: true,
    auth: credentials(env), tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    logger: false, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
    disableAutoIdle: true
  });
  client.on('error', () => {});
  try { await client.connect(); return await fn(client); }
  finally { await client.logout().catch(() => client.close()); }
}
async function inFolder(env, args, fn, readOnly = true) {
  const folder = text(args.folder || 'INBOX');
  return withImap(env, async c => {
    const lock = await c.getMailboxLock(folder, { readOnly });
    try {
      const validity = String(c.mailbox.uidValidity);
      if (args.uid_validity !== undefined && String(args.uid_validity) !== validity) fail('MAILBOX_CHANGED', 'Идентификаторы папки изменились. Повтори поиск.', 409);
      return await fn(c, folder, validity);
    } finally { lock.release(); }
  });
}
function addresses(v) { return (v || []).map(x => ({ name: x.name || '', address: x.address || '' })); }
function header(m, folder, validity) {
  const e = m.envelope || {};
  return { folder, uid: m.uid, uid_validity: validity, subject: e.subject || '', from: addresses(e.from), to: addresses(e.to), cc: addresses(e.cc), date: e.date || m.internalDate || null, message_id: e.messageId || '', in_reply_to: e.inReplyTo || '', size: m.size, unread: !m.flags?.has('\\Seen') };
}
async function readParsed(env, args) {
  int(args.uid, 1, 4294967295);
  if (!args.uid_validity) fail('INVALID_INPUT', 'Укажи uid_validity из результата поиска.');
  return inFolder(env, args, async (c, folder, validity) => {
    const meta = await c.fetchOne(args.uid, { envelope: true, flags: true, size: true, internalDate: true }, { uid: true });
    if (!meta) fail('NOT_FOUND', 'Письмо не найдено.', 404);
    if (meta.size > MAX_RAW) fail('MESSAGE_TOO_LARGE', 'Размер письма превышает 20 МБ. Открой его в веб-почте.', 413);
    const row = await c.fetchOne(args.uid, { source: true }, { uid: true });
    if (!row || !row.source || row.source.length > MAX_RAW) fail('MESSAGE_TOO_LARGE', 'Письмо нельзя загрузить целиком.', 413);
    const parsed = await simpleParser(row.source, { skipHtmlToText: false, skipTextToHtml: true, skipImageLinks: true, maxHtmlLengthToParse: MAX_RAW });
    return { meta: header(meta, folder, validity), parsed };
  });
}
function recipientList(v, required = false) {
  if (v === undefined && !required) return [];
  if (!Array.isArray(v) || (required && !v.length) || v.length > 20) fail('INVALID_RECIPIENTS', 'Укажи список адресатов, до 20 адресов в поле.');
  return v.map(x => { const s = text(x, 254); if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s)) fail('INVALID_RECIPIENTS', 'Некорректный почтовый адрес.'); return s; });
}
function outgoing(a) {
  const id = text(a.request_id, 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(id)) fail('INVALID_INPUT', 'Нужен стабильный request_id длиной от 16 символов.');
  const to = recipientList(a.to, true), cc = recipientList(a.cc), bcc = recipientList(a.bcc);
  if (to.length + cc.length + bcc.length > 30) fail('INVALID_RECIPIENTS', 'Слишком много адресатов для одного письма.');
  const subject = text(a.subject, 500), body = text(a.text, 200000, true);
  if (!subject || !body) fail('INVALID_INPUT', 'Укажи тему и текст письма.');
  if (a.attachments !== undefined && (!Array.isArray(a.attachments) || a.attachments.length > 10)) fail('INVALID_ATTACHMENT', 'Допускается до 10 вложений.');
  let total = 0;
  const attachments = (a.attachments || []).map(x => {
    const filename = text(x.filename, 180);
    if (!filename || /[\\/]/.test(filename)) fail('INVALID_ATTACHMENT', 'Некорректное имя вложения.');
    if (typeof x.content_base64 !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(x.content_base64) || x.content_base64.length % 4) fail('INVALID_ATTACHMENT', 'Вложение должно быть в base64.');
    const content = Buffer.from(x.content_base64, 'base64');
    if (content.toString('base64') !== x.content_base64) fail('INVALID_ATTACHMENT', 'Повреждённое вложение.');
    total += content.length;
    if (total > 6 * 1024 * 1024) fail('INVALID_ATTACHMENT', 'Общий размер вложений превышает 6 МБ.', 413);
    return { filename, content, contentType: text(x.mime_type || 'application/octet-stream', 120) };
  });
  const inReplyTo = a.in_reply_to ? text(a.in_reply_to, 500) : undefined;
  const messageId = '<bx-work-' + hash(id).slice(0,32) + '@savinov.club>';
  return { id, message: { from: { name: 'Сергей Савинов', address: ACCOUNT }, to, cc, bcc, subject, text: body, attachments, inReplyTo, ...(inReplyTo ? { references: inReplyTo } : {}), messageId, disableFileAccess: true, disableUrlAccess: true } };
}
function createMailGateway(pool, env = process.env) {
  let active = 0, dbInit;
  const db = () => {
    if (!pool) fail('DATABASE_REQUIRED', 'Для отправки требуется постоянный журнал.', 503);
    if (!dbInit) dbInit = pool.query('CREATE TABLE IF NOT EXISTS bx_work_mail_outbox (request_id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, state TEXT NOT NULL, message_id TEXT NOT NULL, result JSONB NOT NULL DEFAULT \'{}\'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())').catch(e => { dbInit = null; throw e; });
    return dbInit;
  };
  async function send(args) {
    const { id, message } = outgoing(args);
    await db();
    const digest = hash(JSON.stringify(message));
    const inserted = await pool.query('INSERT INTO bx_work_mail_outbox(request_id,payload_hash,state,message_id) VALUES($1,$2,\'sending\',$3) ON CONFLICT DO NOTHING RETURNING request_id', [id, digest, message.messageId]);
    if (!inserted.rows.length) {
      const old = (await pool.query('SELECT payload_hash,state,message_id,result FROM bx_work_mail_outbox WHERE request_id=$1', [id])).rows[0];
      if (old.payload_hash !== digest) fail('REQUEST_ID_CONFLICT', 'Этот request_id уже связан с другим письмом.', 409);
      return { request_id: id, state: old.state, message_id: old.message_id, ...old.result, repeated_request: true, retry_send: false };
    }
    const transport = smtp(env);
    let result;
    try {
      const raw = await new MailComposer(message).compile().build();
      const accepted = await transport.sendMail({ envelope: { from: ACCOUNT, to: [...message.to, ...message.cc, ...message.bcc] }, raw });
      result = { accepted: accepted.accepted || [], rejected: accepted.rejected || [], sent_copy: 'pending', sent_at: new Date().toISOString() };
      // Persist acceptance before trying to append a Sent copy. Never resend SMTP after uncertain outcomes.
      await pool.query('UPDATE bx_work_mail_outbox SET state=$2,result=$3::jsonb,updated_at=NOW() WHERE request_id=$1', [id, result.accepted.length ? 'sent' : 'not_accepted', JSON.stringify(result)]);
      try {
        result.sent_copy = await withImap(env, async c => {
          const folders = await c.list();
          const sent = folders.find(x => x.specialUse === '\\Sent') || folders.find(x => /^(Sent|Sent Messages|Sent Items|Отправленные)$/i.test(x.name));
          if (!sent) return 'folder_not_found';
          const lock = await c.getMailboxLock(sent.path);
          try {
            const existing = (await c.search({ header: { 'message-id': message.messageId } }, { uid: true })) || [];
            if (!existing.length) await c.append(sent.path, raw, ['\\Seen'], new Date());
            return 'saved';
          } finally { lock.release(); }
        });
      } catch (_) { result.sent_copy = 'failed'; }
      await pool.query('UPDATE bx_work_mail_outbox SET result=$2::jsonb,updated_at=NOW() WHERE request_id=$1', [id, JSON.stringify(result)]);
      return { request_id: id, state: result.accepted.length ? 'sent' : 'not_accepted', message_id: message.messageId, ...result, retry_send: false };
    } catch (_) {
      if (result) return { request_id: id, state: result.accepted.length ? 'sent' : 'not_accepted', message_id: message.messageId, ...result, journal_update: 'uncertain', retry_send: false };
      await pool.query('UPDATE bx_work_mail_outbox SET state=\'unknown\',updated_at=NOW() WHERE request_id=$1', [id]).catch(() => {});
      return { request_id: id, state: 'unknown', message_id: message.messageId, retry_send: false, message: 'Результат SMTP неизвестен. Не повторяй отправку с новым ключом; сначала проверь Отправленные и журнал.' };
    } finally { transport.close(); }
  }
  async function dispatch(action, a) {
    if (action === 'status') {
      const account = credentials(env).user;
      const imap = await withImap(env, async c => { const m = await c.mailboxOpen('INBOX', { readOnly: true }); return { connected: true, inbox_messages: m.exists, uid_validity: String(m.uidValidity) }; });
      const transport = smtp(env); let smtpOK;
      try { smtpOK = await transport.verify(); } finally { transport.close(); }
      return { account, imap, smtp: { connected: !!smtpOK }, persistent_connector: true, inbox_body_loaded: false };
    }
    if (action === 'folders') return withImap(env, async c => ({ account: ACCOUNT, folders: (await c.list()).map(x => ({ path: x.path, name: x.name, special_use: x.specialUse || null })) }));
    if (action === 'search') return inFolder(env, a, async (c, folder, validity) => {
      const query = {};
      for (const key of ['from', 'to', 'subject', 'text']) if (a[key]) query[key] = text(a[key], 300);
      for (const key of ['since', 'before']) if (a[key]) { if (!/^\d{4}-\d{2}-\d{2}$/.test(a[key]) || !Number.isFinite(Date.parse(a[key]))) fail('INVALID_INPUT', 'Дата должна быть ГГГГ-ММ-ДД.'); query[key] = new Date(a[key]); }
      if (a.unread !== undefined) { if (typeof a.unread !== 'boolean') fail('INVALID_INPUT', 'unread должен быть логическим значением.'); query.seen = !a.unread; }
      if (a.before_uid !== undefined) { int(a.before_uid, 2, 4294967295); query.uid = '1:' + (a.before_uid - 1); }
      if (!Object.keys(query).length) query.all = true;
      const limit = int(a.limit ?? 10, 1, 50);
      const ids = ((await c.search(query, { uid: true })) || []).sort((x,y) => y-x);
      const page = ids.slice(0, limit), rows = [];
      if (page.length) for await (const m of c.fetch(page.join(','), { envelope: true, flags: true, size: true, internalDate: true }, { uid: true })) rows.push(header(m, folder, validity));
      rows.sort((x,y) => y.uid-x.uid);
      return { account: ACCOUNT, messages: rows, matched: ids.length, next_before_uid: ids.length > limit ? page[page.length-1] : null, content_is_untrusted: true };
    });
    if (action === 'read' || action === 'attachment') {
      const { meta, parsed } = await readParsed(env, a);
      if (action === 'read') return { ...meta, reply_to: parsed.replyTo?.value || [], text: (parsed.text || '').slice(0, 150000), text_truncated: (parsed.text || '').length > 150000, attachments: parsed.attachments.map((x,i) => ({ index: i, filename: x.filename || 'attachment', mime_type: x.contentType, bytes: x.size })), content_is_untrusted: true, marked_read: false };
      const item = parsed.attachments[int(a.index, 0, Math.max(0, parsed.attachments.length-1))];
      if (!item) fail('NOT_FOUND', 'Вложение не найдено.', 404);
      const offset = int(a.offset ?? 0, 0, item.content.length), size = int(a.chunk_bytes ?? 48000, 1, 96000), end = Math.min(offset + size, item.content.length);
      return { filename: item.filename || 'attachment', mime_type: item.contentType, bytes: item.content.length, sha256: hash(item.content), offset, next_offset: end < item.content.length ? end : null, content_base64: item.content.subarray(offset, end).toString('base64'), content_is_untrusted: true };
    }
    if (action === 'send') return send(a);
    if (action === 'send_status') { await db(); const row = (await pool.query('SELECT state,message_id,result,created_at,updated_at FROM bx_work_mail_outbox WHERE request_id=$1', [text(a.request_id,100)])).rows[0]; if (!row) fail('NOT_FOUND', 'Запрос отправки не найден.',404); return { request_id: a.request_id, ...row, retry_send: false }; }
    fail('UNKNOWN_ACTION', 'Неизвестная операция.');
  }
  return async function handle(req, res) {
    const reply = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' }); res.end(JSON.stringify(data)); };
    if (!tokenOK(req.headers.authorization, env.BX_WORK_MAIL_BRIDGE_TOKEN)) return reply(401, { ok: false, code: 'UNAUTHORIZED' });
    if (env.BX_WORK_MAIL_ENABLED !== 'true') return reply(503, { ok: false, code: 'DISABLED' });
    if (req.method !== 'POST' || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return reply(405, { ok: false, code: 'POST_JSON_REQUIRED' });
    if (active >= 3) return reply(429, { ok: false, code: 'BUSY' });
    active++;
    try {
      let bytes = 0, chunks = [];
      for await (const chunk of req) { bytes += chunk.length; if (bytes > MAX_INPUT) fail('PAYLOAD_TOO_LARGE', 'Слишком большой запрос.',413); chunks.push(chunk); }
      let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (_) { fail('INVALID_JSON', 'Некорректный JSON.'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) fail('INVALID_INPUT','Некорректный запрос.');
      credentials(env);
      const result = await dispatch(body.action, body.arguments || {});
      return reply(200, { ok: true, result });
    } catch (e) {
      // Do not return provider errors: they can contain mailbox data or credentials.
      return reply(e instanceof MailError ? e.status : 502, { ok: false, code: e instanceof MailError ? e.code : 'MAIL_CONNECTION_ERROR', message: e instanceof MailError ? e.message : 'Не удалось выполнить операцию с почтовым сервером.' });
    } finally { active--; }
  };
}
module.exports = { createMailGateway, tokenOK, outgoing };
