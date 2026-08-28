'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('\"') && value.endsWith('\"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const BOT_TOKEN = String(process.env.BOT_TOKEN || '').trim();
const WEBAPP_URL = String(process.env.WEBAPP_URL || process.env.BASE_URL || '').replace(/\/$/, '');
const BASE_URL = String(process.env.BASE_URL || WEBAPP_URL || '').replace(/\/$/, '');
const WEBHOOK_URL = String(process.env.WEBHOOK_URL || '').replace(/\/$/, '');
const WEBHOOK_SECRET = String(process.env.WEBHOOK_SECRET || crypto.randomBytes(20).toString('hex'));
const SUPPORT_USERNAME = String(process.env.SUPPORT_USERNAME || '').replace(/^@/, '');
const DEV_MODE = /^(1|true|yes)$/i.test(String(process.env.DEV_MODE || ''));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = path.join(DATA_DIR, 'neon-arena.sqlite');
const INIT_DATA_MAX_AGE_SEC = Math.max(60, Number(process.env.INIT_DATA_MAX_AGE_SEC || 86400));

fs.mkdirSync(DATA_DIR, { recursive: true });

const PRODUCTS = Object.freeze({
  neo_crystals_250: { id:'neo_crystals_250', crystals:250, stars:50, title:'250 Neo Crystals', description:'Cosmetic currency for Neon Arena. No combat advantage.' },
  neo_crystals_500: { id:'neo_crystals_500', crystals:500, stars:90, title:'500 Neo Crystals', description:'Cosmetic currency for Neon Arena. No combat advantage.' },
  neo_crystals_1000:{ id:'neo_crystals_1000',crystals:1000,stars:160,title:'1000 Neo Crystals',description:'Cosmetic currency for Neon Arena. No combat advantage.' },
});

const PREMIUM_ITEMS = Object.freeze({
  'skin:quantum': {kind:'skin',id:'quantum',price:500},
  'skin:phoenix': {kind:'skin',id:'phoenix',price:650},
  'skin:astral': {kind:'skin',id:'astral',price:800},
  'bullet:celestial': {kind:'bullet',id:'celestial',price:500},
  'bullet:dragonPulse': {kind:'bullet',id:'dragonPulse',price:650},
  'bullet:voidLance': {kind:'bullet',id:'voidLance',price:800},
  'trail:galaxyTrail': {kind:'trail',id:'galaxyTrail',price:500},
  'trail:lightningTrail': {kind:'trail',id:'lightningTrail',price:650},
  'trail:cosmicRoyalTrail': {kind:'trail',id:'cosmicRoyalTrail',price:800},
});
const PREMIUM_BY_KIND = {
  skin:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='skin').map(x=>x.id)),
  bullet:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='bullet').map(x=>x.id)),
  trail:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='trail').map(x=>x.id)),
};
const TOP10_CRYSTALS = Object.freeze({1:100,2:80,3:65,4:50,5:40,6:30,7:25,8:20,9:15,10:10});
const SCORE_SCALE = 1000;

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON;');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  telegram_id INTEGER PRIMARY KEY,
  username TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  language_code TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  best_score_at INTEGER NOT NULL DEFAULT 0,
  crystals INTEGER NOT NULL DEFAULT 0,
  progress_json TEXT NOT NULL DEFAULT '{}',
  premium_owned_json TEXT NOT NULL DEFAULT '{"skin":[],"bullet":[],"trail":[]}',
  last_top_claim_date TEXT NOT NULL DEFAULT '',
  last_top_claim_rank INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id TEXT PRIMARY KEY,
  telegram_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  stars INTEGER NOT NULL,
  payload TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  telegram_charge_id TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  paid_at INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(telegram_id) REFERENCES users(telegram_id)
);
CREATE TABLE IF NOT EXISTS payment_events (
  telegram_charge_id TEXT PRIMARY KEY,
  telegram_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  stars INTEGER NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users(best_score DESC, best_score_at ASC, telegram_id ASC);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(telegram_id, created_at DESC);
`);

const q = {
  getUser: db.prepare('SELECT * FROM users WHERE telegram_id=?'),
  insertUser: db.prepare(`INSERT INTO users(telegram_id,username,first_name,last_name,language_code,photo_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)`),
  updateUserIdentity: db.prepare(`UPDATE users SET username=?,first_name=?,last_name=?,language_code=?,photo_url=?,updated_at=? WHERE telegram_id=?`),
  saveProgress: db.prepare(`UPDATE users SET progress_json=?,updated_at=? WHERE telegram_id=?`),
  saveScore: db.prepare(`UPDATE users SET best_score=?,best_score_at=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  setPremiumState: db.prepare(`UPDATE users SET crystals=?,premium_owned_json=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  claimTop: db.prepare(`UPDATE users SET crystals=?,last_top_claim_date=?,last_top_claim_rank=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  top10: db.prepare(`SELECT * FROM users WHERE best_score>0 ORDER BY best_score DESC,best_score_at ASC,telegram_id ASC LIMIT 10`),
  rankCount: db.prepare(`SELECT COUNT(*) AS n FROM users WHERE best_score>? OR (best_score=? AND (best_score_at<? OR (best_score_at=? AND telegram_id<?)))`),
  insertPurchase: db.prepare(`INSERT INTO purchases(purchase_id,telegram_id,product_id,stars,payload,status,created_at) VALUES(?,?,?,?,?,'pending',?)`),
  getPurchase: db.prepare(`SELECT * FROM purchases WHERE purchase_id=?`),
  getPurchasePayload: db.prepare(`SELECT * FROM purchases WHERE payload=?`),
  markPaid: db.prepare(`UPDATE purchases SET status='paid',telegram_charge_id=?,paid_at=? WHERE purchase_id=? AND status!='paid'`),
  insertPaymentEvent: db.prepare(`INSERT INTO payment_events(telegram_charge_id,telegram_id,product_id,stars,payload,created_at) VALUES(?,?,?,?,?,?)`),
};

function now(){ return Date.now(); }
function todayUTC(){ return new Date().toISOString().slice(0,10); }
function safeJsonParse(text, fallback){ try { const v=JSON.parse(text); return v ?? fallback; } catch { return fallback; } }
function arrayStrings(v, max=100){ return Array.isArray(v) ? [...new Set(v.filter(x=>typeof x==='string' && x.length<=80))].slice(0,max) : []; }
function clampInt(v,min,max){ v=Math.floor(Number(v)||0); return Math.max(min,Math.min(max,v)); }
function publicName(row){
  const full=[row.first_name,row.last_name].filter(Boolean).join(' ').trim();
  if(full) return full.slice(0,48);
  if(row.username) return '@'+String(row.username).slice(0,47);
  return 'Player';
}
function premiumOwned(row){
  const raw=safeJsonParse(row.premium_owned_json,{});
  return {skin:arrayStrings(raw.skin,32),bullet:arrayStrings(raw.bullet,32),trail:arrayStrings(raw.trail,32)};
}
function getProgress(row){
  const p=safeJsonParse(row.progress_json,{});
  p.schemaVersion=Math.max(7,clampInt(p.schemaVersion,0,100));
  p.bestScore=Math.max(0,Number(row.best_score)||0);
  p.crystals=Math.max(0,Number(row.crystals)||0);
  p.lastTopCrystalRewardDate=row.last_top_claim_date||'';
  p.lastTopCrystalRewardRank=Math.max(0,Number(row.last_top_claim_rank)||0);
  return applyPremiumOwnership(row,p);
}
function applyPremiumOwnership(row, raw){
  const p={...raw};
  const owned=premiumOwned(row);
  const listMap={skin:'ownedSkins',bullet:'ownedBullets',trail:'ownedTrails'};
  const baseDefaults={skin:['aqua'],bullet:['orb'],trail:['pulseLine']};
  for(const kind of ['skin','bullet','trail']){
    const key=listMap[kind];
    const incoming=arrayStrings(p[key],120).filter(id=>!PREMIUM_BY_KIND[kind].has(id));
    p[key]=[...new Set([...baseDefaults[kind],...incoming,...owned[kind]])];
  }
  const selectedMap={skin:'selectedSkin',bullet:'selectedBullet',trail:'selectedTrail'};
  for(const kind of ['skin','bullet','trail']){
    const key=selectedMap[kind];
    if(typeof p[key]!=='string' || !p[listMap[kind]].includes(p[key])) p[key]=baseDefaults[kind][0];
  }
  p.crystals=Math.max(0,Number(row.crystals)||0);
  p.bestScore=Math.max(0,Number(row.best_score)||0);
  p.lastTopCrystalRewardDate=row.last_top_claim_date||'';
  p.lastTopCrystalRewardRank=Math.max(0,Number(row.last_top_claim_rank)||0);
  return p;
}
function sanitizeProgress(row, raw){
  const p = raw && typeof raw==='object' && !Array.isArray(raw) ? {...raw} : {};
  p.schemaVersion=Math.max(7,clampInt(p.schemaVersion,0,100));
  p.updatedAt=clampInt(p.updatedAt,0,Number.MAX_SAFE_INTEGER);
  p.syncRevision=clampInt(p.syncRevision,0,1_000_000_000);
  p.gamesPlayed=clampInt(p.gamesPlayed,0,1_000_000_000);
  p.coins=clampInt(p.coins,0,1_000_000_000);
  p.dailyStreak=clampInt(p.dailyStreak,0,100000);
  p.weeklyProgress=clampInt(p.weeklyProgress,0,7);
  p.lastAdCreditsAt=0;p.lastAdCapsuleAt=0;p.lastAdCrystalsAt=0;
  p.handledPurchaseTokens=[];
  p.dailyQuestClaims=arrayStrings(p.dailyQuestClaims,32);
  p.leaderboardMilestones=arrayStrings(p.leaderboardMilestones,32);
  if(p.dailyQuestStats && typeof p.dailyQuestStats==='object'){
    for(const k of Object.keys(p.dailyQuestStats)) p.dailyQuestStats[k]=clampInt(p.dailyQuestStats[k],0,100000000);
  } else p.dailyQuestStats={};
  const secured=applyPremiumOwnership(row,p);
  secured.bestScore=Math.max(0,Number(row.best_score)||0);
  secured.crystals=Math.max(0,Number(row.crystals)||0);
  secured.lastTopCrystalRewardDate=row.last_top_claim_date||'';
  secured.lastTopCrystalRewardRank=Math.max(0,Number(row.last_top_claim_rank)||0);
  return secured;
}
function bumpProgress(row, mutate){
  let p=getProgress(row);
  mutate(p);
  p.schemaVersion=Math.max(7,Number(p.schemaVersion)||7);
  p.updatedAt=now();
  p.syncRevision=Math.max(0,Number(p.syncRevision)||0)+1;
  return p;
}
function ensureUser(tgUser){
  const id=Number(tgUser.id);
  if(!Number.isSafeInteger(id) || id<=0) throw Object.assign(new Error('invalid_user'),{status:401});
  let row=q.getUser.get(id);
  const identity=[String(tgUser.username||'').slice(0,64),String(tgUser.first_name||'').slice(0,128),String(tgUser.last_name||'').slice(0,128),String(tgUser.language_code||'').slice(0,16),String(tgUser.photo_url||'').slice(0,1024)];
  if(!row){
    const ts=now(); q.insertUser.run(id,...identity,ts,ts); row=q.getUser.get(id);
  }else{
    q.updateUserIdentity.run(...identity,now(),id); row=q.getUser.get(id);
  }
  return row;
}

function validateInitData(initData){
  if(!BOT_TOKEN) throw Object.assign(new Error('bot_token_missing'),{status:503});
  if(typeof initData!=='string' || initData.length<10 || initData.length>10000) throw Object.assign(new Error('invalid_init_data'),{status:401});
  const params=new URLSearchParams(initData);
  const receivedHash=params.get('hash');
  if(!receivedHash || !/^[0-9a-f]{64}$/i.test(receivedHash)) throw Object.assign(new Error('invalid_hash'),{status:401});
  params.delete('hash');
  const dataCheck=[...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret=crypto.createHmac('sha256','WebAppData').update(BOT_TOKEN).digest();
  const calculated=crypto.createHmac('sha256',secret).update(dataCheck).digest('hex');
  const a=Buffer.from(calculated,'hex'),b=Buffer.from(receivedHash,'hex');
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) throw Object.assign(new Error('signature_mismatch'),{status:401});
  const authDate=Number(params.get('auth_date')||0);
  const age=Math.floor(Date.now()/1000)-authDate;
  if(!authDate || age< -60 || age>INIT_DATA_MAX_AGE_SEC) throw Object.assign(new Error('expired_init_data'),{status:401});
  const user=safeJsonParse(params.get('user')||'',null);
  if(!user?.id) throw Object.assign(new Error('missing_user'),{status:401});
  return user;
}
function authenticate(req){
  const initData=String(req.headers['x-telegram-init-data']||'');
  if(initData) return ensureUser(validateInitData(initData));
  if(DEV_MODE){
    const id=clampInt(req.headers['x-dev-user-id']||999001,1,Number.MAX_SAFE_INTEGER);
    return ensureUser({id,first_name:'Dev',last_name:'Player',username:'neon_dev',language_code:'ru'});
  }
  throw Object.assign(new Error('telegram_auth_required'),{status:401});
}

function sendJson(res,status,data,extraHeaders={}){
  const body=Buffer.from(JSON.stringify(data));
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':body.length,'Cache-Control':'no-store',...extraHeaders});
  res.end(body);
}
function sendText(res,status,text,type='text/plain; charset=utf-8'){
  const body=Buffer.from(text);res.writeHead(status,{'Content-Type':type,'Content-Length':body.length});res.end(body);
}
function readJson(req,limit=128*1024){
  return new Promise((resolve,reject)=>{
    let size=0,chunks=[];
    req.on('data',c=>{size+=c.length;if(size>limit){reject(Object.assign(new Error('body_too_large'),{status:413}));req.destroy();return}chunks.push(c)});
    req.on('end',()=>{if(!chunks.length)return resolve({});try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(Object.assign(new Error('invalid_json'),{status:400}))}});
    req.on('error',reject);
  });
}
function serveStatic(req,res,pathname){
  let rel=pathname==='/'?'index.html':decodeURIComponent(pathname).replace(/^\/+/, '');
  const file=path.resolve(PUBLIC_DIR,rel);
  if(!file.startsWith(PUBLIC_DIR+path.sep) && file!==path.join(PUBLIC_DIR,'index.html')) return sendText(res,403,'Forbidden');
  let stat;try{stat=fs.statSync(file)}catch{return sendText(res,404,'Not found')}
  if(!stat.isFile())return sendText(res,404,'Not found');
  const ext=path.extname(file).toLowerCase();
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'}[ext]||'application/octet-stream';
  res.writeHead(200,{
    'Content-Type':mime,
    'Content-Length':stat.size,
    'Cache-Control':ext==='.html'?'no-store':'public, max-age=300',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer',
    'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
  });
  fs.createReadStream(file).pipe(res);
}

function getRank(row){
  if(!row || Number(row.best_score)<=0) return 0;
  const n=Number(q.rankCount.get(row.best_score,row.best_score,row.best_score_at,row.best_score_at,row.telegram_id).n)||0;
  return n+1;
}
function leaderboardPayload(userRow){
  const top=q.top10.all();
  const entries=top.map((r,i)=>({rank:i+1,score:Number(r.best_score)*SCORE_SCALE,player:{publicName:publicName(r),uniqueID:String(r.telegram_id)}}));
  const rank=getRank(userRow);
  return {entries,userRank:rank};
}
function playerEntry(row){
  const rank=getRank(row);if(!rank)return null;
  return {rank,score:Number(row.best_score)*SCORE_SCALE,player:{publicName:publicName(row),uniqueID:String(row.telegram_id)}};
}

async function botApi(method,payload={}){
  if(!BOT_TOKEN) throw new Error('BOT_TOKEN is not configured');
  const r=await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await r.json().catch(()=>({ok:false,description:'Invalid Telegram response'}));
  if(!r.ok || !data.ok) throw new Error(`Telegram ${method}: ${data.description||r.status}`);
  return data.result;
}
function webAppButton(){ return WEBAPP_URL ? {text:'⚡ Играть в Neon Arena',web_app:{url:WEBAPP_URL}} : null; }
async function sendStart(chatId){
  const btn=webAppButton();
  const reply_markup=btn?{inline_keyboard:[[btn],[{text:'🏆 Рейтинг',callback_data:'leaderboard'}]]}:undefined;
  return botApi('sendMessage',{chat_id:chatId,text:'⚡ Neon Arena\n\nВыживай, собирай комбо, открывай косметику и поднимайся в глобальном рейтинге Telegram.',reply_markup});
}
async function sendLeaderboard(chatId,userId){
  const row=q.getUser.get(Number(userId));const top=q.top10.all();
  const lines=top.length?top.map((r,i)=>`${i+1}. ${publicName(r)} — ${Number(r.best_score).toLocaleString('ru-RU')}`).join('\n'):'Пока нет результатов.';
  const mine=row&&row.best_score>0?`\n\nВаше место: #${getRank(row)} · ${Number(row.best_score).toLocaleString('ru-RU')}`:'';
  return botApi('sendMessage',{chat_id:chatId,text:`🏆 Глобальный рейтинг Neon Arena\n\n${lines}${mine}`});
}
function supportText(payment=false){
  const contact=SUPPORT_USERNAME?`@${SUPPORT_USERNAME}`:'у владельца бота (укажите SUPPORT_USERNAME в настройках сервера)';
  return payment?`Поддержка по платежам: ${contact}. При обращении укажите дату покупки и количество Stars.`:`Поддержка Neon Arena: ${contact}.`;
}
const TERMS_TEXT='Neon Arena продаёт цифровую косметическую валюту и предметы за Telegram Stars. Они не имеют денежной стоимости внутри игры, не подлежат выводу и не дают преимущества в боевых характеристиках. Возвраты по обоснованным платежным обращениям рассматриваются поддержкой проекта.';

function parsePayload(payload){
  const m=/^neon:([a-f0-9]{24}):(\d+):([a-z0-9_]+)$/i.exec(String(payload||''));
  return m?{purchaseId:m[1],telegramId:Number(m[2]),productId:m[3]}:null;
}
function processSuccessfulPayment(message){
  const sp=message?.successful_payment;if(!sp)return;
  const fromId=Number(message.from?.id);const parsed=parsePayload(sp.invoice_payload);if(!parsed || parsed.telegramId!==fromId)return;
  const purchase=q.getPurchase.get(parsed.purchaseId);const product=PRODUCTS[parsed.productId];
  if(!purchase||!product||purchase.telegram_id!==fromId||purchase.product_id!==product.id)return;
  if(sp.currency!=='XTR' || Number(sp.total_amount)!==product.stars)return;
  const charge=String(sp.telegram_payment_charge_id||'');if(!charge)return;
  try{
    db.exec('BEGIN IMMEDIATE');
    const duplicate=db.prepare('SELECT 1 FROM payment_events WHERE telegram_charge_id=?').get(charge);
    if(duplicate){db.exec('COMMIT');return}
    const row=q.getUser.get(fromId);if(!row)throw new Error('user_missing');
    q.insertPaymentEvent.run(charge,fromId,product.id,product.stars,sp.invoice_payload,now());
    q.markPaid.run(charge,now(),purchase.purchase_id);
    const nextCrystals=Math.max(0,Number(row.crystals)||0)+product.crystals;
    const p=bumpProgress(row,x=>{x.crystals=nextCrystals});
    q.setPremiumState.run(nextCrystals,row.premium_owned_json,JSON.stringify(p),now(),fromId);
    db.exec('COMMIT');
  }catch(e){try{db.exec('ROLLBACK')}catch{};console.error('[payment]',e)}
}
async function processBotUpdate(update){
  if(update.pre_checkout_query){
    const pc=update.pre_checkout_query;let ok=false,error_message='Платёж не прошёл проверку.';
    try{
      const parsed=parsePayload(pc.invoice_payload);const purchase=parsed&&q.getPurchase.get(parsed.purchaseId);const product=parsed&&PRODUCTS[parsed.productId];
      ok=Boolean(parsed&&purchase&&product&&purchase.status==='pending'&&Number(pc.from?.id)===parsed.telegramId&&purchase.telegram_id===parsed.telegramId&&pc.currency==='XTR'&&Number(pc.total_amount)===product.stars);
      if(ok)error_message=undefined;
    }catch{}
    await botApi('answerPreCheckoutQuery',{pre_checkout_query_id:pc.id,ok,...(error_message?{error_message}:{})}).catch(console.error);return;
  }
  const msg=update.message;
  if(msg?.successful_payment){processSuccessfulPayment(msg);return}
  if(msg?.text){
    const cmd=msg.text.trim().split(/\s+/)[0].split('@')[0].toLowerCase();
    if(cmd==='/start'||cmd==='/play') return sendStart(msg.chat.id).catch(console.error);
    if(cmd==='/leaderboard') return sendLeaderboard(msg.chat.id,msg.from?.id).catch(console.error);
    if(cmd==='/terms') return botApi('sendMessage',{chat_id:msg.chat.id,text:TERMS_TEXT}).catch(console.error);
    if(cmd==='/support') return botApi('sendMessage',{chat_id:msg.chat.id,text:supportText(false)}).catch(console.error);
    if(cmd==='/paysupport') return botApi('sendMessage',{chat_id:msg.chat.id,text:supportText(true)}).catch(console.error);
  }
  const cb=update.callback_query;
  if(cb?.data==='leaderboard'){
    await botApi('answerCallbackQuery',{callback_query_id:cb.id}).catch(()=>{});
    return sendLeaderboard(cb.message?.chat?.id,cb.from?.id).catch(console.error);
  }
}
let botOffset=0,stopPolling=false;
async function pollingLoop(){
  while(!stopPolling){
    try{
      const updates=await botApi('getUpdates',{offset:botOffset,timeout:25,allowed_updates:['message','callback_query','pre_checkout_query']});
      for(const u of updates){botOffset=Math.max(botOffset,Number(u.update_id)+1);await processBotUpdate(u)}
    }catch(e){console.error('[bot polling]',e.message);await new Promise(r=>setTimeout(r,2500))}
  }
}
async function configureBot(){
  if(!BOT_TOKEN){console.warn('[bot] BOT_TOKEN missing: bot and Telegram auth/payment APIs are disabled.');return}
  await botApi('setMyCommands',{commands:[
    {command:'play',description:'Открыть Neon Arena'},
    {command:'leaderboard',description:'Глобальный рейтинг'},
    {command:'terms',description:'Условия покупок'},
    {command:'support',description:'Поддержка'},
    {command:'paysupport',description:'Поддержка по платежам'},
  ]}).catch(e=>console.error('[setMyCommands]',e.message));
  if(WEBHOOK_URL){
    const url=`${WEBHOOK_URL}/telegram/webhook/${encodeURIComponent(WEBHOOK_SECRET)}`;
    await botApi('setWebhook',{url,secret_token:WEBHOOK_SECRET,allowed_updates:['message','callback_query','pre_checkout_query']});
    console.log('[bot] webhook enabled:',url);
  }else{
    await botApi('deleteWebhook',{drop_pending_updates:false}).catch(()=>{});
    pollingLoop();console.log('[bot] long polling enabled');
  }
}

async function handleApi(req,res,pathname,url){
  if(pathname==='/api/health') return sendJson(res,200,{ok:true,telegram:Boolean(BOT_TOKEN),webapp:Boolean(WEBAPP_URL),devMode:DEV_MODE});
  if(pathname==='/api/store' && req.method==='GET'){
    return sendJson(res,200,{products:Object.values(PRODUCTS).map(p=>({id:p.id,title:p.title,description:p.description,price:`${p.stars} ⭐`,stars:p.stars,amount:p.crystals}))});
  }
  const row=authenticate(req);
  if(pathname==='/api/me' && req.method==='GET') return sendJson(res,200,{ok:true,user:{id:row.telegram_id,username:row.username,first_name:row.first_name,language_code:row.language_code},progress:getProgress(row),entry:playerEntry(row)});
  if(pathname==='/api/progress' && (req.method==='PUT'||req.method==='POST')){
    const body=await readJson(req);const fresh=q.getUser.get(row.telegram_id);const p=sanitizeProgress(fresh,body.progress||body);
    const encoded=JSON.stringify(p);if(encoded.length>70000)throw Object.assign(new Error('progress_too_large'),{status:413});
    q.saveProgress.run(encoded,now(),row.telegram_id);return sendJson(res,200,{ok:true,progress:p});
  }
  if(pathname==='/api/score' && req.method==='POST'){
    const body=await readJson(req);const scaled=clampInt(body.score,0,50_000_000*SCORE_SCALE);const score=Math.floor(scaled/SCORE_SCALE);
    const meta=body.meta||{};const durationMs=clampInt(meta.durationMs,0,24*3600*1000);const wave=clampInt(meta.wave,0,10000);const kills=clampInt(meta.kills,0,10_000_000);
    if(score>0 && durationMs>0 && durationMs<2500) return sendJson(res,422,{ok:false,reason:'run_too_short'});
    if(score>50_000_000 || wave>5000 || kills>5_000_000) return sendJson(res,422,{ok:false,reason:'implausible_score'});
    const fresh=q.getUser.get(row.telegram_id);let newBest=false;
    if(score>Number(fresh.best_score||0)){
      const p=bumpProgress(fresh,x=>{x.bestScore=score;x.gamesPlayed=Math.max(Number(x.gamesPlayed)||0,1)});
      q.saveScore.run(score,now(),JSON.stringify(p),now(),row.telegram_id);newBest=true;
    }
    const latest=q.getUser.get(row.telegram_id);return sendJson(res,200,{ok:true,newBest,entry:playerEntry(latest)});
  }
  if(pathname==='/api/leaderboard' && req.method==='GET') return sendJson(res,200,{ok:true,...leaderboardPayload(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/player-entry' && req.method==='GET') return sendJson(res,200,{ok:true,entry:playerEntry(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/invoice' && req.method==='POST'){
    if(!BOT_TOKEN)throw Object.assign(new Error('payments_unavailable'),{status:503});
    const body=await readJson(req);const product=PRODUCTS[String(body.productId||body.product_id||'')];if(!product)throw Object.assign(new Error('unknown_product'),{status:404});
    const purchaseId=crypto.randomBytes(12).toString('hex');const payload=`neon:${purchaseId}:${row.telegram_id}:${product.id}`;
    q.insertPurchase.run(purchaseId,row.telegram_id,product.id,product.stars,payload,now());
    const invoiceLink=await botApi('createInvoiceLink',{title:product.title,description:product.description,payload,currency:'XTR',provider_token:'',prices:[{label:product.title,amount:product.stars}]});
    return sendJson(res,200,{ok:true,purchaseId,invoiceLink,stars:product.stars});
  }
  if(pathname==='/api/purchase-status' && req.method==='GET'){
    const purchaseId=String(url.searchParams.get('id')||'');const purchase=q.getPurchase.get(purchaseId);
    if(!purchase||Number(purchase.telegram_id)!==Number(row.telegram_id))throw Object.assign(new Error('purchase_not_found'),{status:404});
    const latest=q.getUser.get(row.telegram_id);return sendJson(res,200,{ok:true,status:purchase.status,progress:purchase.status==='paid'?getProgress(latest):undefined});
  }
  if(pathname==='/api/shop/buy' && req.method==='POST'){
    const body=await readJson(req);const kind=String(body.kind||''),id=String(body.id||'');const item=PREMIUM_ITEMS[`${kind}:${id}`];if(!item)throw Object.assign(new Error('unknown_item'),{status:404});
    let result;
    try{
      db.exec('BEGIN IMMEDIATE');const fresh=q.getUser.get(row.telegram_id);const owned=premiumOwned(fresh);
      if(owned[kind].includes(id)){result={ok:true,alreadyOwned:true,progress:getProgress(fresh)};db.exec('COMMIT');return sendJson(res,200,result)}
      if(Number(fresh.crystals)<item.price){db.exec('COMMIT');return sendJson(res,409,{ok:false,reason:'funds',needed:item.price,balance:Number(fresh.crystals)})}
      owned[kind].push(id);const nextCrystals=Number(fresh.crystals)-item.price;
      const p=bumpProgress(fresh,x=>{x.crystals=nextCrystals;const listKey=kind==='skin'?'ownedSkins':kind==='bullet'?'ownedBullets':'ownedTrails';const selectedKey=kind==='skin'?'selectedSkin':kind==='bullet'?'selectedBullet':'selectedTrail';x[listKey]=[...new Set([...(x[listKey]||[]),id])];x[selectedKey]=id});
      q.setPremiumState.run(nextCrystals,JSON.stringify(owned),JSON.stringify(p),now(),row.telegram_id);db.exec('COMMIT');result={ok:true,progress:getProgress(q.getUser.get(row.telegram_id))};
    }catch(e){try{db.exec('ROLLBACK')}catch{};throw e}
    return sendJson(res,200,result);
  }
  if(pathname==='/api/rewards/top10' && req.method==='POST'){
    let result;
    try{
      db.exec('BEGIN IMMEDIATE');const fresh=q.getUser.get(row.telegram_id);const rank=getRank(fresh);const amount=TOP10_CRYSTALS[rank]||0;const today=todayUTC();
      if(!amount){db.exec('COMMIT');return sendJson(res,409,{ok:false,reason:'rank',rank})}
      if(fresh.last_top_claim_date===today){db.exec('COMMIT');return sendJson(res,409,{ok:false,reason:'claimed',rank})}
      const nextCrystals=Number(fresh.crystals)+amount;const p=bumpProgress(fresh,x=>{x.crystals=nextCrystals;x.lastTopCrystalRewardDate=today;x.lastTopCrystalRewardRank=rank});
      q.claimTop.run(nextCrystals,today,rank,JSON.stringify(p),now(),row.telegram_id);db.exec('COMMIT');result={ok:true,rank,amount,progress:getProgress(q.getUser.get(row.telegram_id))};
    }catch(e){try{db.exec('ROLLBACK')}catch{};throw e}
    return sendJson(res,200,result);
  }
  return sendJson(res,404,{ok:false,error:'not_found'});
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);const pathname=url.pathname;
    if(WEBHOOK_URL && pathname===`/telegram/webhook/${WEBHOOK_SECRET}` && req.method==='POST'){
      const secret=String(req.headers['x-telegram-bot-api-secret-token']||'');
      if(secret!==WEBHOOK_SECRET)return sendJson(res,403,{ok:false});
      const update=await readJson(req,512*1024);sendJson(res,200,{ok:true});processBotUpdate(update).catch(console.error);return;
    }
    if(pathname.startsWith('/api/'))return await handleApi(req,res,pathname,url);
    return serveStatic(req,res,pathname);
  }catch(e){
    const status=Number(e.status)||500;if(status>=500)console.error('[http]',e);
    return sendJson(res,status,{ok:false,error:e.message||'server_error'});
  }
});

server.listen(PORT,HOST,()=>{
  console.log(`[Neon Arena] http://${HOST}:${PORT}`);
  console.log(`[Neon Arena] DB: ${DB_PATH}`);
  if(DEV_MODE)console.warn('[Neon Arena] DEV_MODE is ON. Never enable it in production.');
  configureBot().catch(e=>console.error('[bot config]',e));
});

process.on('SIGINT',()=>{stopPolling=true;server.close(()=>process.exit(0))});
process.on('SIGTERM',()=>{stopPolling=true;server.close(()=>process.exit(0))});
