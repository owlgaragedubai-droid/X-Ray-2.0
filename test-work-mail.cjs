const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {ImapFlow}=require('imapflow');
const nodemailer=require('nodemailer');
const {createMailGateway,outgoing,tokenOK}=require('./work-mail');
const secret='test-only-'.repeat(8);
const env={SMTP_USER:'sv@savinov.club',SMTP_PASSWORD:'test-only-password',BX_WORK_MAIL_BRIDGE_TOKEN:secret,BX_WORK_MAIL_ENABLED:'true'};

test('Authentication fails closed and attachment validation rejects paths and header injection',()=>{
 assert.equal(tokenOK('Bearer '+secret,secret),true);
 assert.equal(tokenOK('Bearer wrong',secret),false);
 assert.equal(tokenOK('',undefined),false);
 const a={request_id:'unit-test-message-0001',to:['one@example.com'],subject:'Test',text:'Body'};
 assert.throws(()=>outgoing({...a,to:['one@example.com\r\nBcc: leak@example.com']}));
 assert.throws(()=>outgoing({...a,attachments:[{filename:'../../secret',content_base64:'eA=='}]}));
 assert.throws(()=>outgoing({...a,attachments:[{filename:'file.txt',content_base64:'bad encoding'}]}));
 assert.equal(outgoing(a).message.from.address,'sv@savinov.club');
});

test('Gateway rejects unauthorized requests and prevents a second SMTP send after success or uncertainty',async t=>{
 let sends=0,uncertain=false;
 t.mock.method(nodemailer,'createTransport',()=>({verify:async()=>true,close(){},sendMail:async()=>{sends++;if(uncertain)throw Error('test transport uncertainty');return {accepted:['one@example.com'],rejected:[]};}}));
 t.mock.method(ImapFlow.prototype,'connect',async()=>{});
 t.mock.method(ImapFlow.prototype,'logout',async()=>{});
 t.mock.method(ImapFlow.prototype,'list',async()=>[]);
 const rows=new Map();
 const pool={async query(q,a){
  if(q.startsWith('CREATE TABLE'))return {rows:[]};
  if(q.startsWith('INSERT')){if(rows.has(a[0]))return {rows:[]};rows.set(a[0],{payload_hash:a[1],state:'sending',message_id:a[2],result:{}});return {rows:[{request_id:a[0]}]};}
  if(q.startsWith('SELECT'))return {rows:rows.has(a[0])?[rows.get(a[0])]:[]};
  const row=rows.get(a[0]);
  if(q.includes("state='unknown'"))row.state='unknown';
  else if(q.includes('state=$2')){row.state=a[1];row.result=JSON.parse(a[2]);}
  else if(q.includes('result=$2'))row.result=JSON.parse(a[1]);
  return {rows:[]};
 }};
 const server=http.createServer(createMailGateway(pool,env));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>new Promise(r=>server.close(r)));
 const url='http://127.0.0.1:'+server.address().port;
 const post=async(body,auth=true)=>{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:'Bearer '+secret}:{})},body:JSON.stringify(body)});return {status:r.status,...await r.json()};};
 assert.equal((await post({action:'status'},false)).status,401);
 const a={request_id:'unit-test-message-0002',to:['one@example.com'],subject:'Test',text:'Body'};
 const first=await post({action:'send',arguments:a});
 assert.equal(first.result.state,'sent');assert.equal(sends,1);
 const repeat=await post({action:'send',arguments:a});
 assert.equal(repeat.result.repeated_request,true);assert.equal(sends,1);
 assert.equal((await post({action:'send',arguments:{...a,text:'changed'}})).status,409);
 uncertain=true;
 const b={...a,request_id:'unit-test-message-0003'};
 assert.equal((await post({action:'send',arguments:b})).result.state,'unknown');
 assert.equal(sends,2);
 assert.equal((await post({action:'send',arguments:b})).result.state,'unknown');assert.equal(sends,2);
 assert.equal((await post({action:'send_status',arguments:{request_id:b.request_id}})).result.state,'unknown');
});

test('Read uses read-only folder and rejects stale UID validity',async t=>{
 let mode;
 t.mock.method(ImapFlow.prototype,'connect',async()=>{});
 t.mock.method(ImapFlow.prototype,'logout',async()=>{});
 t.mock.method(ImapFlow.prototype,'getMailboxLock',async function(folder,options){mode=options.readOnly;this.mailbox={uidValidity:123n};return {release(){}};});
 const server=http.createServer(createMailGateway(null,env));await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const response=await fetch('http://127.0.0.1:'+server.address().port,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+secret},body:JSON.stringify({action:'read',arguments:{uid:1,uid_validity:'122'}})});
 assert.equal(response.status,409);assert.equal(mode,true);
});

