'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const crypto = require('node:crypto');

function loadModule(name, env, overrides = {}) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, name), 'utf8'), {
    module, exports: module.exports, Buffer, Date, console,
    process: { env }, require: key => overrides[key] || require(key)
  }, { filename: name });
  return module.exports;
}

async function run() {
  const env = { DATABASE_URL: 'test-only', BX_ADMIN_PASSWORD: 'test-only-password-over-twenty-characters', BX_ADMIN_USER: 'bx' };
  const security = loadModule('lead-security.js', env);
  const auth = 'Basic ' + Buffer.from('bx:' + env.BX_ADMIN_PASSWORD).toString('base64');
  assert.equal(security.isAdmin({ headers: { authorization: auth } }, {}), false);
  assert.equal(security.isAdmin({ headers: { authorization: auth } }), true);
  assert.equal(security.isAdmin({ headers: { authorization: 'Basic ' + Buffer.from('bx:wrong').toString('base64') } }), false);
  const oldLead = { id: 'EXISTING-PRIVATE', inn: '7813640377', email: 'private@example.test', note: 'private note' };
  const records = new Map([[oldLead.id, oldLead]]);
  let handler, failWrites = false, failReads = false;
  class Pool {
    async query(sql, params = []) {
      if (sql.startsWith('CREATE')) return { rows: [] };
      if (sql.includes('COUNT(*)')) return { rows: [{ count: records.size }] };
      if (sql.startsWith('INSERT')) {
        if (failWrites) throw new Error('database offline');
        if (records.has(params[0])) return { rows: [] };
        records.set(params[0], JSON.parse(params[7]));
        return { rows: [{ id: params[0] }] };
      }
      if (sql.includes("AS hash")) return { rows: [{ hash: records.get(params[0])?.submissionHash }] };
      if (sql.startsWith('UPDATE')) return { rows: [] };
      if (sql.startsWith('SELECT payload')) {
        if(failReads) throw new Error('database offline');
        return { rows: [...records.values()].map(payload => ({ payload })) };
      }
      throw new Error('unexpected SQL: ' + sql);
    }
  }
  const source = fs.readFileSync(path.join(__dirname, 'server-v4.js'), 'utf8');
  vm.runInNewContext(source, {
    __dirname, Buffer, URL, console: { log() {}, error() {} }, process: { env },
    setInterval: () => ({ unref() {} }),
    require: key => ({
      http: { createServer(fn) { handler = fn; return { listen() {} }; } },
      pg: { Pool }, './lead-security': security,
      './lead-notifications': { createNotifier: () => ({ drain() {} }) },
      './company-intel': { isValidInn: x => x === '7813640377', enrichCompany: async () => ({ company: 'Public research' }) }
    }[key] || require(key))
  });
  await new Promise(resolve => setImmediate(resolve));

  function request(url, method = 'GET', body, authorization) {
    return new Promise((resolve, reject) => {
      const req = new EventEmitter();
      Object.assign(req, { url, method, headers: { 'content-type': 'application/json', ...(authorization ? { authorization } : {}) }, destroy() {} });
      const res = { headersSent: false, headers: {}, setHeader(k,v) { this.headers[k]=v; },
        writeHead(status, headers) { this.status=status; this.headers={...this.headers,...headers};this.headersSent=true; },
        end(text) { resolve({ status: this.status, headers: this.headers, body: text ? JSON.parse(text) : null }); }
      };
      handler(req, res).catch(reject);
      queueMicrotask(() => { if (body) req.emit('data', JSON.stringify(body)); req.emit('end'); });
    });
  }
  for (const url of ['/api/leads', '/leads.html', '/leads.html/', '/crm-demo', '/demo/aluminstar', '/%6ceads.html', '/a/../leads.html', '//leads.html']) {
    const response = await request(url);
    assert.equal(response.status, 401, url);
    assert.equal(JSON.stringify(response.body).includes('private@example.test'), false);
  }
  assert.equal((await request('/api/leads', 'GET', null, auth)).body.leads.length, 1);
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/%zz')).status, 400);
  failReads = true;
  assert.equal((await request('/api/leads', 'GET', null, auth)).status, 503);
  failReads = false;
  assert.equal((await request('/api/leads', 'POST', { inn: '7813640377', note: 'test' })).status, 400);
  const body = { inn: '7813640377', company: 'BX INTERNAL TEST', email: 'tester@example.test', note: 'A new question', submissionKey: crypto.randomUUID(), research: { private: 'forged' } };
  const created = await request('/api/leads', 'POST', body);
  assert.equal(created.status, 201);
  assert.deepEqual(Object.keys(created.body).sort(), ['ok', 'requestId']);
  assert.equal(records.get(created.body.requestId).note, body.note);
  assert.equal(records.get(created.body.requestId).email, body.email);
  assert.equal(records.get(created.body.requestId).research, null);
  assert.equal(records.get(oldLead.id).note, 'private note');
  const again = await request('/api/leads', 'POST', body);
  assert.equal(again.status, 200);
  assert.equal(again.body.requestId, created.body.requestId);
  assert.equal(records.size, 2);
  assert.equal((await request('/api/leads', 'POST', { ...body, note: 'Changed content' })).status, 409);
  const another = await request('/api/leads', 'POST', { ...body, note: 'Second independent request', submissionKey: crypto.randomUUID() });
  assert.equal(another.status, 201);
  assert.equal(records.size, 3);
  failWrites = true;
  assert.equal((await request('/api/leads', 'POST', { ...body, submissionKey: crypto.randomUUID() })).status, 503);

  const notification = loadModule('lead-notifications.js', {});
  assert.equal(notification.mailConfig({}), null);
  const mailEnv = { SMTP_HOST: 'smtp.example.test', SMTP_USER: 'owner@example.test', SMTP_PASSWORD: 'test-only', LEAD_NOTIFY_TO: 'owner@example.test' };
  assert.equal(notification.mailConfig(mailEnv).secure, true);
  assert.equal(notification.mailConfig({ ...mailEnv, SMTP_PORT: '587' }).requireTLS, true);
  const message = notification.mailMessage({ ...body, id: created.body.requestId, createdAt: new Date().toISOString() }, mailEnv);
  assert.equal(message.to.address, mailEnv.LEAD_NOTIFY_TO);
  assert.equal(message.replyTo.address, body.email);
  assert.ok(message.text.includes(body.note));
  const queueLead = { ...body, id: created.body.requestId, notification: { state: 'pending' } };
  let state;
  const queueClient = {
    async query(sql, params) {
      if (sql.startsWith('SELECT')) return { rows: state ? [] : [{ payload: queueLead }] };
      if (sql.startsWith('UPDATE')) state = JSON.parse(params[1]);
      return { rows: [] };
    }, release() {}
  };
  await notification.createNotifier({ connect: async () => queueClient }, mailEnv, () => ({ sendMail: async () => { throw new Error('smtp timeout'); } })).drain();
  assert.equal(state.state, 'retry');
  assert.equal(state.attempts, 1);
  state = null;
  await notification.createNotifier({ connect: async () => queueClient }, mailEnv, () => ({ sendMail: async () => ({ accepted: ['owner@example.test'] }) })).drain();
  assert.equal(state.state, 'sent');
  return 'PASS: private routes and encoded paths; missing/wrong/valid credentials; contact validation; no private response leak; separate requests for same INN; retry idempotency; database failure; fixed notification recipient; SMTP retry and acceptance.';
}

module.exports = run;
if (require.main === module) run().then(console.log).catch(error => { console.error(error); process.exitCode = 1; });
