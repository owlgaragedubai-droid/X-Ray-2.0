'use strict';

function mailConfig(env = process.env) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.LEAD_NOTIFY_TO) return null;
  const port = Number(env.SMTP_PORT || 465);
  if (![465, 587].includes(port)) return null;
  return {
    host: env.SMTP_HOST, port, secure: port === 465, requireTLS: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false
  };
}

function mailMessage(lead, env = process.env) {
  return {
    from: { name: 'BX — обращения с сайта', address: env.SMTP_USER },
    to: { address: env.LEAD_NOTIFY_TO },
    ...(lead.email ? { replyTo: { address: lead.email } } : {}),
    subject: '[BX] Новое обращение — ' + String(lead.company || 'Компания').replace(/[\r\n]/g, ' ').slice(0, 200),
    messageId: '<' + lead.id + '@bx-ray.com>',
    text: [
      'Новое обращение с сайта BX',
      'Номер: ' + lead.id, 'Время: ' + lead.createdAt,
      'Компания: ' + lead.company, 'ИНН: ' + lead.inn,
      'Имя: ' + (lead.contactName || 'Не указано'),
      'Роль: ' + (lead.contactRole || 'Не указана'),
      'Email: ' + (lead.email || 'Не указан'),
      'Телефон: ' + (lead.phone || 'Не указан'),
      'Формат: ' + lead.request, '', 'Вопрос:', lead.note, '',
      'Защищённая карточка: https://bx-ray.com/leads.html?lead=' + encodeURIComponent(lead.id)
    ].join('\n')
  };
}

function createNotifier(pool, env = process.env, makeTransport) {
  let running = false, transport;
  async function drain() {
    const config = mailConfig(env);
    if (!pool || !config || running) return;
    running = true;
    try {
      if (!transport) transport = (makeTransport || require('nodemailer').createTransport)(config);
      for (let n = 0; n < 3; n++) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const queued = await client.query("SELECT id,payload FROM bx_leads WHERE payload->'notification'->>'state' IN ('pending','retry') AND (payload->'notification'->>'nextAttemptAt' IS NULL OR (payload->'notification'->>'nextAttemptAt')::timestamptz <= NOW()) ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED");
          if (!queued.rows.length) { await client.query('COMMIT'); break; }
          const lead = queued.rows[0].payload;
          const attempts = Number(lead.notification.attempts || 0) + 1;
          let notification;
          try {
            const result = await transport.sendMail(mailMessage(lead, env));
            if (!result.accepted || !result.accepted.length) throw new Error('not accepted');
            notification = { state: 'sent', attempts, sentAt: new Date().toISOString() };
          } catch (error) {
            notification = {
              state: attempts >= 8 ? 'failed' : 'retry', attempts,
              nextAttemptAt: new Date(Date.now() + Math.min(21600000, 60000 * 2 ** attempts)).toISOString(),
              error: 'Не удалось передать уведомление почтовому серверу.'
            };
          }
          await client.query("UPDATE bx_leads SET payload=jsonb_set(payload,'{notification}',$2::jsonb) WHERE id=$1", [lead.id, JSON.stringify(notification)]);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          console.error('Notification queue temporarily unavailable');
          break;
        } finally { client.release(); }
      }
    } catch (error) {
      console.error('Notification delivery temporarily unavailable');
    } finally { running = false; }
  }
  return { drain };
}

module.exports = { createNotifier, mailConfig, mailMessage };
