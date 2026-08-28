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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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
  neo_crystals_250: { id:'neo_crystals_250', type:'crystals', crystals:250, stars:50, title:'250 Neo Crystals', description:'Cosmetic currency for Neon Arena. No combat advantage.' },
  neo_crystals_500: { id:'neo_crystals_500', type:'crystals', crystals:500, stars:90, title:'500 Neo Crystals', description:'Cosmetic currency for Neon Arena. No combat advantage.' },
  neo_crystals_1000:{ id:'neo_crystals_1000',type:'crystals',crystals:1000,stars:160,title:'1000 Neo Crystals',description:'Cosmetic currency for Neon Arena. No combat advantage.' },
  star_chest_10:   { id:'star_chest_10', type:'star_chest', stars:10, title:'10 Stars Chest', description:'Premium cosmetic chest. Mythic 1%, Legendary 15%.', chestId:'star_chest_10' },
  star_chest_20:   { id:'star_chest_20', type:'star_chest', stars:20, title:'20 Stars Chest', description:'Premium cosmetic chest. Mythic 1%, Legendary 17%.', chestId:'star_chest_20' },
  star_chest_30:   { id:'star_chest_30', type:'star_chest', stars:30, title:'30 Stars Chest', description:'Premium cosmetic chest. Mythic 1%, Legendary 20%.', chestId:'star_chest_30' },
  season_pass:     { id:'season_pass', type:'season_pass', stars:149, title:'Neon Season Pass', description:'Premium seasonal reward track. Cosmetics only — no combat advantage.' },
});
const STAR_CHEST_PRODUCTS = Object.freeze({
  star_chest_10:{id:'star_chest_10',stars:10,odds:[{id:'common',chance:.34},{id:'rare',chance:.30},{id:'epic',chance:.20},{id:'legendary',chance:.15},{id:'mythic',chance:.01}]},
  star_chest_20:{id:'star_chest_20',stars:20,odds:[{id:'common',chance:.18},{id:'rare',chance:.31},{id:'epic',chance:.33},{id:'legendary',chance:.17},{id:'mythic',chance:.01}]},
  star_chest_30:{id:'star_chest_30',stars:30,odds:[{id:'common',chance:.08},{id:'rare',chance:.26},{id:'epic',chance:.45},{id:'legendary',chance:.20},{id:'mythic',chance:.01}]},
});
const DUPLICATE_CHEST_COINS = Object.freeze({common:35,rare:90,epic:260,legendary:900,mythic:2500});
const LEGENDARY_PITY_AT = 10;
const MYTHIC_PITY_AT = 100;
const PASS_SEASON_DAYS = 28;
const PASS_LEVELS = 20;
const PASS_XP_PER_LEVEL = 800;
const PASS_MAX_XP = (PASS_LEVELS-1)*PASS_XP_PER_LEVEL;
const PASS_BASE_UTC = Date.UTC(2026,0,5,0,0,0,0);
const PASS_COSMETICS = Object.freeze([
  {kind:'skin',id:'seasonFlux'},
  {kind:'skin',id:'seasonCrown'},
  {kind:'skin',id:'seasonAscendant'},
  {kind:'bullet',id:'seasonPulse'},
  {kind:'bullet',id:'seasonNova'},
  {kind:'trail',id:'seasonComet'},
  {kind:'trail',id:'seasonHalo'},
]);
const PASS_REWARDS = Object.freeze({
  free:Object.freeze([
    null,
    {credits:100},{credits:150},{crystals:10},{credits:200},{crystals:15},
    {credits:250},{crystals:15},{credits:300},{crystals:20},{cosmetic:{kind:'bullet',id:'seasonPulse'}},
    {credits:300},{crystals:20},{credits:350},{crystals:25},{cosmetic:{kind:'trail',id:'seasonComet'}},
    {credits:400},{crystals:25},{credits:450},{crystals:30},{cosmetic:{kind:'skin',id:'seasonFlux'}},
  ]),
  premium:Object.freeze([
    null,
    {crystals:15},{credits:200},{crystals:25},{credits:250},{cosmetic:{kind:'skin',id:'seasonCrown'}},
    {crystals:25},{credits:300},{crystals:30},{credits:350},{cosmetic:{kind:'bullet',id:'seasonNova'}},
    {crystals:30},{credits:400},{crystals:35},{credits:450},{cosmetic:{kind:'trail',id:'seasonHalo'}},
    {crystals:40},{credits:500},{crystals:50},{credits:600},{cosmetic:{kind:'skin',id:'seasonAscendant'}},
  ]),
});
const SERVER_COSMETIC_POOLS = Object.freeze({
  common: Object.freeze([{kind:'skin',id:'aqua',rarity:'common'}, {kind:'skin',id:'magenta',rarity:'common'}, {kind:'skin',id:'lime',rarity:'common'}, {kind:'skin',id:'coral',rarity:'common'}, {kind:'skin',id:'cobalt',rarity:'common'}, {kind:'skin',id:'mint',rarity:'common'}, {kind:'skin',id:'sunset',rarity:'common'}, {kind:'bullet',id:'orb',rarity:'common'}, {kind:'bullet',id:'bolt',rarity:'common'}, {kind:'bullet',id:'shard',rarity:'common'}, {kind:'bullet',id:'needle',rarity:'common'}, {kind:'bullet',id:'spark',rarity:'common'}, {kind:'bullet',id:'beamlet',rarity:'common'}, {kind:'bullet',id:'glimmer',rarity:'common'}, {kind:'trail',id:'pulseLine',rarity:'common'}, {kind:'trail',id:'afterglow',rarity:'common'}, {kind:'trail',id:'shimmerTrail',rarity:'common'}, {kind:'trail',id:'driftTrail',rarity:'common'}]),
  rare: Object.freeze([{kind:'skin',id:'solar',rarity:'rare'}, {kind:'skin',id:'void',rarity:'rare'}, {kind:'skin',id:'ice',rarity:'rare'}, {kind:'skin',id:'ember',rarity:'rare'}, {kind:'skin',id:'toxic',rarity:'rare'}, {kind:'skin',id:'moon',rarity:'rare'}, {kind:'skin',id:'thunder',rarity:'rare'}, {kind:'skin',id:'jade',rarity:'rare'}, {kind:'bullet',id:'comet',rarity:'rare'}, {kind:'bullet',id:'pulse',rarity:'rare'}, {kind:'bullet',id:'arc',rarity:'rare'}, {kind:'bullet',id:'rocket',rarity:'rare'}, {kind:'bullet',id:'plasma',rarity:'rare'}, {kind:'bullet',id:'hex',rarity:'rare'}, {kind:'bullet',id:'vortex',rarity:'rare'}, {kind:'bullet',id:'emberBolt',rarity:'rare'}, {kind:'trail',id:'emberTrail',rarity:'rare'}, {kind:'trail',id:'frostTrail',rarity:'rare'}, {kind:'trail',id:'ionRibbon',rarity:'rare'}, {kind:'trail',id:'sparklineTrail',rarity:'rare'}, {kind:'trail',id:'mistTrail',rarity:'rare'}]),
  epic: Object.freeze([{kind:'skin',id:'ghost',rarity:'epic'}, {kind:'skin',id:'royal',rarity:'epic'}, {kind:'skin',id:'glitch',rarity:'epic'}, {kind:'skin',id:'aurora',rarity:'epic'}, {kind:'skin',id:'bloom',rarity:'epic'}, {kind:'skin',id:'matrix',rarity:'epic'}, {kind:'skin',id:'velvet',rarity:'epic'}, {kind:'skin',id:'holo',rarity:'epic'}, {kind:'bullet',id:'star',rarity:'epic'}, {kind:'bullet',id:'wave',rarity:'epic'}, {kind:'bullet',id:'echo',rarity:'epic'}, {kind:'bullet',id:'flare',rarity:'epic'}, {kind:'bullet',id:'petal',rarity:'epic'}, {kind:'bullet',id:'fractal',rarity:'epic'}, {kind:'bullet',id:'blossom',rarity:'epic'}, {kind:'bullet',id:'overclock',rarity:'epic'}, {kind:'trail',id:'glitchTrail',rarity:'epic'}, {kind:'trail',id:'auroraTrail',rarity:'epic'}, {kind:'trail',id:'stardustTrail',rarity:'epic'}, {kind:'trail',id:'velvetTrail',rarity:'epic'}, {kind:'trail',id:'pixelTrail',rarity:'epic'}]),
  legendary: Object.freeze([{kind:'skin',id:'nova',rarity:'legendary'}, {kind:'skin',id:'prism',rarity:'legendary'}, {kind:'skin',id:'eclipse',rarity:'legendary'}, {kind:'skin',id:'tempest',rarity:'legendary'}, {kind:'skin',id:'nebula',rarity:'legendary'}, {kind:'skin',id:'monarch',rarity:'legendary'}, {kind:'skin',id:'supernova',rarity:'legendary'}, {kind:'bullet',id:'singularity',rarity:'legendary'}, {kind:'bullet',id:'rainbow',rarity:'legendary'}, {kind:'bullet',id:'chronos',rarity:'legendary'}, {kind:'bullet',id:'helix',rarity:'legendary'}, {kind:'bullet',id:'meteor',rarity:'legendary'}, {kind:'bullet',id:'crownShot',rarity:'legendary'}, {kind:'bullet',id:'stormCore',rarity:'legendary'}, {kind:'trail',id:'prismTrail',rarity:'legendary'}, {kind:'trail',id:'solarTrail',rarity:'legendary'}, {kind:'trail',id:'eclipseTrail',rarity:'legendary'}, {kind:'trail',id:'cometTrail',rarity:'legendary'}, {kind:'trail',id:'haloTrail',rarity:'legendary'}]),
  mythic: Object.freeze([{kind:'skin',id:'quantum',rarity:'mythic'}, {kind:'skin',id:'phoenix',rarity:'mythic'}, {kind:'skin',id:'astral',rarity:'mythic'}, {kind:'skin',id:'seraph',rarity:'mythic'}, {kind:'skin',id:'abyssal',rarity:'mythic'}, {kind:'bullet',id:'celestial',rarity:'mythic'}, {kind:'bullet',id:'dragonPulse',rarity:'mythic'}, {kind:'bullet',id:'voidLance',rarity:'mythic'}, {kind:'bullet',id:'seraphic',rarity:'mythic'}, {kind:'bullet',id:'blackstar',rarity:'mythic'}, {kind:'trail',id:'galaxyTrail',rarity:'mythic'}, {kind:'trail',id:'lightningTrail',rarity:'mythic'}, {kind:'trail',id:'cosmicRoyalTrail',rarity:'mythic'}, {kind:'trail',id:'seraphTrail',rarity:'mythic'}, {kind:'trail',id:'voidStormTrail',rarity:'mythic'}]),
});

const PREMIUM_ITEMS = Object.freeze({
  'skin:quantum': {kind:'skin',id:'quantum',price:500},
  'skin:phoenix': {kind:'skin',id:'phoenix',price:650},
  'skin:astral': {kind:'skin',id:'astral',price:800},
  'skin:seraph': {kind:'skin',id:'seraph',price:900},
  'skin:abyssal': {kind:'skin',id:'abyssal',price:980},
  'bullet:celestial': {kind:'bullet',id:'celestial',price:500},
  'bullet:dragonPulse': {kind:'bullet',id:'dragonPulse',price:650},
  'bullet:voidLance': {kind:'bullet',id:'voidLance',price:800},
  'bullet:seraphic': {kind:'bullet',id:'seraphic',price:900},
  'bullet:blackstar': {kind:'bullet',id:'blackstar',price:980},
  'trail:galaxyTrail': {kind:'trail',id:'galaxyTrail',price:500},
  'trail:lightningTrail': {kind:'trail',id:'lightningTrail',price:650},
  'trail:cosmicRoyalTrail': {kind:'trail',id:'cosmicRoyalTrail',price:800},
  'trail:seraphTrail': {kind:'trail',id:'seraphTrail',price:900},
  'trail:voidStormTrail': {kind:'trail',id:'voidStormTrail',price:980},
});
const PREMIUM_BY_KIND = {
  skin:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='skin').map(x=>x.id)),
  bullet:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='bullet').map(x=>x.id)),
  trail:new Set(Object.values(PREMIUM_ITEMS).filter(x=>x.kind==='trail').map(x=>x.id)),
};
for(const item of PASS_COSMETICS) PREMIUM_BY_KIND[item.kind].add(item.id);
const WEEKLY_CRYSTAL_REWARDS = Object.freeze({1:180,2:140,3:110,4:90,5:75,6:60,7:50,8:45,9:40,10:35});
const SCORE_SCALE = 1000;
const LEADERBOARD_LIMIT = 50;

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
  weekly_best_score INTEGER NOT NULL DEFAULT 0,
  weekly_best_score_at INTEGER NOT NULL DEFAULT 0,
  weekly_best_week_id TEXT NOT NULL DEFAULT '',
  star_chest_legendary_pity INTEGER NOT NULL DEFAULT 0,
  star_chest_mythic_pity INTEGER NOT NULL DEFAULT 0,
  pass_season_id TEXT NOT NULL DEFAULT '',
  pass_xp INTEGER NOT NULL DEFAULT 0,
  pass_premium INTEGER NOT NULL DEFAULT 0,
  pass_claims_json TEXT NOT NULL DEFAULT '{"free":[],"premium":[]}',
  pass_last_xp_at INTEGER NOT NULL DEFAULT 0,
  crystals INTEGER NOT NULL DEFAULT 0,
  progress_json TEXT NOT NULL DEFAULT '{}',
  premium_owned_json TEXT NOT NULL DEFAULT '{"skin":[],"bullet":[],"trail":[]}',
  weekly_reward_claim_week TEXT NOT NULL DEFAULT '',
  weekly_reward_claim_rank INTEGER NOT NULL DEFAULT 0
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
  fulfillment_json TEXT NOT NULL DEFAULT '',
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
CREATE INDEX IF NOT EXISTS idx_users_weekly_leaderboard ON users(weekly_best_week_id, weekly_best_score DESC, weekly_best_score_at ASC, telegram_id ASC);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(telegram_id, created_at DESC);
`);

function hasColumn(table, column){
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some(row => row.name === column);
}
function addColumnIfMissing(table, column, ddl){
  if (!hasColumn(table, column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}
addColumnIfMissing('users', 'weekly_best_score', 'weekly_best_score INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'weekly_best_score_at', 'weekly_best_score_at INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'weekly_best_week_id', "weekly_best_week_id TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('users', 'weekly_reward_claim_week', "weekly_reward_claim_week TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('users', 'weekly_reward_claim_rank', 'weekly_reward_claim_rank INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'star_chest_legendary_pity', 'star_chest_legendary_pity INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'star_chest_mythic_pity', 'star_chest_mythic_pity INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'pass_season_id', "pass_season_id TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('users', 'pass_xp', 'pass_xp INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'pass_premium', 'pass_premium INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'pass_claims_json', `pass_claims_json TEXT NOT NULL DEFAULT '{"free":[],"premium":[]}'`);
addColumnIfMissing('users', 'pass_last_xp_at', 'pass_last_xp_at INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('purchases', 'fulfillment_json', "fulfillment_json TEXT NOT NULL DEFAULT ''");

db.exec('CREATE INDEX IF NOT EXISTS idx_users_weekly_leaderboard ON users(weekly_best_week_id, weekly_best_score DESC, weekly_best_score_at ASC, telegram_id ASC)');

const q = {
  getUser: db.prepare('SELECT * FROM users WHERE telegram_id=?'),
  insertUser: db.prepare(`INSERT INTO users(telegram_id,username,first_name,last_name,language_code,photo_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)`),
  updateUserIdentity: db.prepare(`UPDATE users SET username=?,first_name=?,last_name=?,language_code=?,photo_url=?,updated_at=? WHERE telegram_id=?`),
  saveProgress: db.prepare(`UPDATE users SET progress_json=?,updated_at=? WHERE telegram_id=?`),
  saveScore: db.prepare(`UPDATE users SET best_score=?,best_score_at=?,weekly_best_score=?,weekly_best_score_at=?,weekly_best_week_id=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  saveWeeklyScore: db.prepare(`UPDATE users SET weekly_best_score=?,weekly_best_score_at=?,weekly_best_week_id=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  setPremiumState: db.prepare(`UPDATE users SET crystals=?,premium_owned_json=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  claimWeeklyReward: db.prepare(`UPDATE users SET crystals=?,weekly_reward_claim_week=?,weekly_reward_claim_rank=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  topWeekly: db.prepare(`SELECT * FROM users WHERE weekly_best_week_id=? AND weekly_best_score>0 ORDER BY weekly_best_score DESC,weekly_best_score_at ASC,telegram_id ASC LIMIT ${LEADERBOARD_LIMIT}`),
  rankCountWeekly: db.prepare(`SELECT COUNT(*) AS n FROM users WHERE weekly_best_week_id=? AND (weekly_best_score>? OR (weekly_best_score=? AND (weekly_best_score_at<? OR (weekly_best_score_at=? AND telegram_id<?))))`),
  setChestPity: db.prepare(`UPDATE users SET star_chest_legendary_pity=?,star_chest_mythic_pity=?,updated_at=? WHERE telegram_id=?`),
  setPassState: db.prepare(`UPDATE users SET pass_season_id=?,pass_xp=?,pass_premium=?,pass_claims_json=?,pass_last_xp_at=?,updated_at=? WHERE telegram_id=?`),
  setPassAndProgress: db.prepare(`UPDATE users SET pass_season_id=?,pass_xp=?,pass_premium=?,pass_claims_json=?,pass_last_xp_at=?,crystals=?,premium_owned_json=?,progress_json=?,updated_at=? WHERE telegram_id=?`),
  insertPurchase: db.prepare(`INSERT INTO purchases(purchase_id,telegram_id,product_id,stars,payload,status,created_at) VALUES(?,?,?,?,?,'pending',?)`),
  getPurchase: db.prepare(`SELECT * FROM purchases WHERE purchase_id=?`),
  getPurchasePayload: db.prepare(`SELECT * FROM purchases WHERE payload=?`),
  markPaid: db.prepare(`UPDATE purchases SET status='paid',telegram_charge_id=?,paid_at=?,fulfillment_json=? WHERE purchase_id=? AND status!='paid'`),
  insertPaymentEvent: db.prepare(`INSERT INTO payment_events(telegram_charge_id,telegram_id,product_id,stars,payload,created_at) VALUES(?,?,?,?,?,?)`),
};

function now(){ return Date.now(); }
function safeJsonParse(text, fallback){ try { const v=JSON.parse(text); return v ?? fallback; } catch { return fallback; } }
function arrayStrings(v, max=100){ return Array.isArray(v) ? [...new Set(v.filter(x=>typeof x==='string' && x.length<=80))].slice(0,max) : []; }
function clampInt(v,min,max){ v=Math.floor(Number(v)||0); return Math.max(min,Math.min(max,v)); }
function publicName(row){
  const full=[row.first_name,row.last_name].filter(Boolean).join(' ').trim();
  if(full) return full.slice(0,48);
  if(row.username) return '@'+String(row.username).slice(0,47);
  return 'Player';
}
function getUtcWeekInfo(ts=Date.now()){
  const dayMs=86400000;
  const d=new Date(ts);
  d.setUTCHours(0,0,0,0);
  const weekday=(d.getUTCDay()+6)%7;
  const monday=new Date(d);
  monday.setUTCDate(monday.getUTCDate()-weekday);
  const thursday=new Date(monday);
  thursday.setUTCDate(thursday.getUTCDate()+3);
  const isoYear=thursday.getUTCFullYear();
  const jan4=new Date(Date.UTC(isoYear,0,4));
  const jan4Weekday=(jan4.getUTCDay()+6)%7;
  const firstMonday=new Date(jan4);
  firstMonday.setUTCDate(firstMonday.getUTCDate()-jan4Weekday);
  const week=Math.floor((monday.getTime()-firstMonday.getTime())/(7*dayMs))+1;
  const nextMonday=new Date(monday);
  nextMonday.setUTCDate(nextMonday.getUTCDate()+7);
  return {
    weekId:`${isoYear}-W${String(week).padStart(2,'0')}`,
    isoYear,
    week,
    startAt:monday.getTime(),
    resetAt:nextMonday.getTime(),
  };
}
function leaderboardWeekId(){ return getUtcWeekInfo().weekId; }
function weeklyRewardAmount(rank){ return WEEKLY_CRYSTAL_REWARDS[rank] || 0; }
function currentWeeklyScore(row){ return row && row.weekly_best_week_id===leaderboardWeekId() ? Number(row.weekly_best_score)||0 : 0; }
function currentWeeklyScoreAt(row){ return row && row.weekly_best_week_id===leaderboardWeekId() ? Number(row.weekly_best_score_at)||0 : 0; }
function randomPick(arr){ return arr[Math.floor(Math.random()*arr.length)] || null; }
function weightedChancePick(odds){
  const total=odds.reduce((sum,x)=>sum+Math.max(0,Number(x.chance)||0),0);
  let roll=Math.random()*Math.max(total,1);
  for(const item of odds){ roll-=Math.max(0,Number(item.chance)||0); if(roll<=0) return item.id; }
  return odds[odds.length-1]?.id || 'common';
}
function passSeasonInfo(ts=Date.now()){
  const span=PASS_SEASON_DAYS*86400000;
  const idx=Math.max(0,Math.floor((ts-PASS_BASE_UTC)/span));
  const startAt=PASS_BASE_UTC+idx*span;
  const resetAt=startAt+span;
  const start=new Date(startAt);
  return {seasonId:`${start.getUTCFullYear()}-S${String(idx+1).padStart(2,'0')}`,startAt,resetAt,levels:PASS_LEVELS,xpPerLevel:PASS_XP_PER_LEVEL};
}
function normalizePassClaims(raw){
  const value=safeJsonParse(raw,{free:[],premium:[]});
  return {free:[...new Set((Array.isArray(value.free)?value.free:[]).map(Number).filter(x=>x>=1&&x<=PASS_LEVELS))],premium:[...new Set((Array.isArray(value.premium)?value.premium:[]).map(Number).filter(x=>x>=1&&x<=PASS_LEVELS))]};
}
function passState(row){
  const season=passSeasonInfo();
  const same=String(row?.pass_season_id||'')===season.seasonId;
  const xp=same?clampInt(row.pass_xp,0,PASS_MAX_XP):0;
  const premium=same?Boolean(row.pass_premium):false;
  const claims=same?normalizePassClaims(row.pass_claims_json):{free:[],premium:[]};
  const level=Math.min(PASS_LEVELS,1+Math.floor(xp/PASS_XP_PER_LEVEL));
  return {season,xp,premium,claims,level,lastXpAt:same?Number(row.pass_last_xp_at)||0:0};
}
function pityState(row){
  const legendary=clampInt(row?.star_chest_legendary_pity,0,LEGENDARY_PITY_AT-1);
  const mythic=clampInt(row?.star_chest_mythic_pity,0,MYTHIC_PITY_AT-1);
  return {legendary:{count:legendary,guaranteedAt:LEGENDARY_PITY_AT,remaining:LEGENDARY_PITY_AT-legendary},mythic:{count:mythic,guaranteedAt:MYTHIC_PITY_AT,remaining:MYTHIC_PITY_AT-mythic}};
}
function passRewardPublic(reward){
  if(!reward)return null;
  if(reward.cosmetic)return {type:'cosmetic',cosmetic:{...reward.cosmetic}};
  if(reward.crystals)return {type:'crystals',amount:Number(reward.crystals)||0};
  return {type:'credits',amount:Number(reward.credits)||0};
}
function passPayload(row){
  const s=passState(row);
  return {season:s.season,xp:s.xp,level:s.level,premium:s.premium,claims:s.claims,priceStars:PRODUCTS.season_pass.stars,rewards:{free:PASS_REWARDS.free.slice(1).map(passRewardPublic),premium:PASS_REWARDS.premium.slice(1).map(passRewardPublic)}};
}
function addPassXp(row,{score=0,wave=0,kills=0,durationMs=0}={}){
  const s=passState(row),ts=now();
  if(ts-s.lastXpAt<8000 || Number(durationMs)<5000 || Number(score)<=0) return {state:s,gained:0};
  const gain=clampInt(125+Number(wave)*22+Number(kills)*2.2+Math.floor(Number(score)/100),100,800);
  const xp=Math.min(PASS_MAX_XP,s.xp+gain);
  q.setPassState.run(s.season.seasonId,xp,s.premium?1:0,JSON.stringify(s.claims),ts,ts,row.telegram_id);
  return {state:{...s,xp,level:Math.min(PASS_LEVELS,1+Math.floor(xp/PASS_XP_PER_LEVEL)),lastXpAt:ts},gained:gain};
}
function grantStarChestReward(row, chestId){
  const config=STAR_CHEST_PRODUCTS[chestId];
  if(!config) throw new Error('unknown_star_chest');
  const owned=premiumOwned(row);
  const prevLegendary=clampInt(row.star_chest_legendary_pity,0,LEGENDARY_PITY_AT-1);
  const prevMythic=clampInt(row.star_chest_mythic_pity,0,MYTHIC_PITY_AT-1);
  let rarity=weightedChancePick(config.odds),guarantee='';
  if(prevMythic>=MYTHIC_PITY_AT-1){rarity='mythic';guarantee='mythic'}
  else if(prevLegendary>=LEGENDARY_PITY_AT-1 && rarity!=='legendary' && rarity!=='mythic'){rarity='legendary';guarantee='legendary'}
  const nextLegendary=(rarity==='legendary'||rarity==='mythic')?0:Math.min(LEGENDARY_PITY_AT-1,prevLegendary+1);
  const nextMythic=rarity==='mythic'?0:Math.min(MYTHIC_PITY_AT-1,prevMythic+1);
  let rewardItem=null, duplicate=false, coins=0;
  const progress=bumpProgress(row, x => {
    const pool=SERVER_COSMETIC_POOLS[rarity] || SERVER_COSMETIC_POOLS.common;
    rewardItem=randomPick(pool) || randomPick(SERVER_COSMETIC_POOLS.common);
    if(!rewardItem) throw new Error('empty_cosmetic_pool');
    const listKey=rewardItem.kind==='skin'?'ownedSkins':rewardItem.kind==='bullet'?'ownedBullets':'ownedTrails';
    const currentList=Array.isArray(x[listKey]) ? x[listKey] : [];
    const alreadyOwned=rewardItem.rarity==='mythic' ? owned[rewardItem.kind].includes(rewardItem.id) : currentList.includes(rewardItem.id);
    if(alreadyOwned){
      duplicate=true; coins=DUPLICATE_CHEST_COINS[rewardItem.rarity] || 35;
      x.coins=Math.max(0,Number(x.coins)||0)+coins;
      return;
    }
    x[listKey]=[...new Set([...currentList,rewardItem.id])];
    if(rewardItem.rarity==='mythic') owned[rewardItem.kind]=[...new Set([...owned[rewardItem.kind],rewardItem.id])];
  });
  return {
    progress,
    premiumOwnedJson: JSON.stringify(owned),
    pity:{legendary:{count:nextLegendary,guaranteedAt:LEGENDARY_PITY_AT,remaining:LEGENDARY_PITY_AT-nextLegendary},mythic:{count:nextMythic,guaranteedAt:MYTHIC_PITY_AT,remaining:MYTHIC_PITY_AT-nextMythic}},
    reward: {type:'star_chest', chestId:config.id, duplicate, coins, guarantee, item:rewardItem}
  };
}
function premiumOwned(row){
  const raw=safeJsonParse(row.premium_owned_json,{});
  return {skin:arrayStrings(raw.skin,64),bullet:arrayStrings(raw.bullet,64),trail:arrayStrings(raw.trail,64)};
}
function getProgress(row){
  const p=safeJsonParse(row.progress_json,{});
  p.schemaVersion=Math.max(8,clampInt(p.schemaVersion,0,100));
  p.bestScore=Math.max(0,Number(row.best_score)||0);
  p.crystals=Math.max(0,Number(row.crystals)||0);
  p.lastWeeklyCrystalRewardWeek=row.weekly_reward_claim_week||'';
  p.lastWeeklyCrystalRewardRank=Math.max(0,Number(row.weekly_reward_claim_rank)||0);
  return applyPremiumOwnership(row,p);
}
function applyPremiumOwnership(row, raw){
  const p={...raw};
  const owned=premiumOwned(row);
  const listMap={skin:'ownedSkins',bullet:'ownedBullets',trail:'ownedTrails'};
  const baseDefaults={skin:['aqua'],bullet:['orb'],trail:['pulseLine']};
  for(const kind of ['skin','bullet','trail']){
    const key=listMap[kind];
    const incoming=arrayStrings(p[key],160).filter(id=>!PREMIUM_BY_KIND[kind].has(id));
    p[key]=[...new Set([...baseDefaults[kind],...incoming,...owned[kind]])];
  }
  const selectedMap={skin:'selectedSkin',bullet:'selectedBullet',trail:'selectedTrail'};
  for(const kind of ['skin','bullet','trail']){
    const key=selectedMap[kind];
    if(typeof p[key]!=='string' || !p[listMap[kind]].includes(p[key])) p[key]=baseDefaults[kind][0];
  }
  p.crystals=Math.max(0,Number(row.crystals)||0);
  p.bestScore=Math.max(0,Number(row.best_score)||0);
  p.lastWeeklyCrystalRewardWeek=row.weekly_reward_claim_week||'';
  p.lastWeeklyCrystalRewardRank=Math.max(0,Number(row.weekly_reward_claim_rank)||0);
  return p;
}
function sanitizeProgress(row, raw){
  const p = raw && typeof raw==='object' && !Array.isArray(raw) ? {...raw} : {};
  p.schemaVersion=Math.max(8,clampInt(p.schemaVersion,0,100));
  p.updatedAt=clampInt(p.updatedAt,0,Number.MAX_SAFE_INTEGER);
  p.syncRevision=clampInt(p.syncRevision,0,1_000_000_000);
  p.gamesPlayed=clampInt(p.gamesPlayed,0,1_000_000_000);
  p.coins=clampInt(p.coins,0,1_000_000_000);
  p.dailyStreak=clampInt(p.dailyStreak,0,100000);
  p.weeklyProgress=clampInt(p.weeklyProgress,0,7);
  p.lastAdCreditsAt=0;p.lastAdCapsuleAt=0;p.lastAdCrystalsAt=0;
  p.handledPurchaseTokens=[];
  p.dailyQuestClaims=arrayStrings(p.dailyQuestClaims,64);
  p.leaderboardMilestones=arrayStrings(p.leaderboardMilestones,64);
  if(p.dailyQuestStats && typeof p.dailyQuestStats==='object'){
    for(const k of Object.keys(p.dailyQuestStats)) p.dailyQuestStats[k]=clampInt(p.dailyQuestStats[k],0,100000000);
  } else p.dailyQuestStats={};
  const secured=applyPremiumOwnership(row,p);
  secured.bestScore=Math.max(0,Number(row.best_score)||0);
  secured.crystals=Math.max(0,Number(row.crystals)||0);
  secured.lastWeeklyCrystalRewardWeek=row.weekly_reward_claim_week||'';
  secured.lastWeeklyCrystalRewardRank=Math.max(0,Number(row.weekly_reward_claim_rank)||0);
  return secured;
}
function bumpProgress(row, mutate){
  let p=getProgress(row);
  mutate(p);
  p.schemaVersion=Math.max(8,Number(p.schemaVersion)||8);
  p.updatedAt=now();
  p.syncRevision=Math.max(0,Number(p.syncRevision)||0)+1;
  return p;
}
function claimPassReward(row, track, level){
  track=track==='premium'?'premium':'free';
  level=clampInt(level,1,PASS_LEVELS);
  const state=passState(row);
  if(level>state.level) throw Object.assign(new Error('pass_level_locked'),{status:409,reason:'locked'});
  if(track==='premium'&&!state.premium) throw Object.assign(new Error('premium_pass_required'),{status:409,reason:'premium'});
  if(state.claims[track].includes(level)) throw Object.assign(new Error('pass_reward_claimed'),{status:409,reason:'claimed'});
  const reward=PASS_REWARDS[track][level];
  if(!reward) throw Object.assign(new Error('pass_reward_missing'),{status:404,reason:'missing'});
  const claims={free:[...state.claims.free],premium:[...state.claims.premium]};
  claims[track].push(level);claims[track].sort((a,b)=>a-b);
  const owned=premiumOwned(row);
  let nextCrystals=Math.max(0,Number(row.crystals)||0),duplicate=false,duplicateCredits=0;
  const progress=bumpProgress(row,x=>{
    if(reward.credits) x.coins=Math.max(0,Number(x.coins)||0)+Number(reward.credits);
    if(reward.crystals){nextCrystals+=Number(reward.crystals);x.crystals=nextCrystals}
    if(reward.cosmetic){
      const {kind,id}=reward.cosmetic;
      const listKey=kind==='skin'?'ownedSkins':kind==='bullet'?'ownedBullets':'ownedTrails';
      const current=Array.isArray(x[listKey])?x[listKey]:[];
      const already=current.includes(id)||owned[kind].includes(id);
      if(already){duplicate=true;duplicateCredits=250;x.coins=Math.max(0,Number(x.coins)||0)+duplicateCredits}
      else{x[listKey]=[...new Set([...current,id])];owned[kind]=[...new Set([...owned[kind],id])]}
    }
  });
  q.setPassAndProgress.run(state.season.seasonId,state.xp,state.premium?1:0,JSON.stringify(claims),state.lastXpAt,nextCrystals,JSON.stringify(owned),JSON.stringify(progress),now(),row.telegram_id);
  const latest=q.getUser.get(row.telegram_id);
  return {ok:true,track,level,reward:passRewardPublic(reward),duplicate,duplicateCredits,progress:getProgress(latest),pass:passPayload(latest)};
}
function activateSeasonPass(row){
  const state=passState(row);
  if(state.premium) return {alreadyOwned:true,seasonId:state.season.seasonId};
  q.setPassState.run(state.season.seasonId,state.xp,1,JSON.stringify(state.claims),state.lastXpAt,now(),row.telegram_id);
  return {alreadyOwned:false,seasonId:state.season.seasonId};
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

function getWeeklyRank(row){
  const weekId=leaderboardWeekId();
  const score=currentWeeklyScore(row);
  if(!row || score<=0) return 0;
  const at=currentWeeklyScoreAt(row);
  const n=Number(q.rankCountWeekly.get(weekId,score,score,at,at,row.telegram_id).n)||0;
  return n+1;
}
function leaderboardPayload(userRow){
  const week=getUtcWeekInfo();
  const top=q.topWeekly.all(week.weekId);
  const entries=top.map((r,i)=>({
    rank:i+1,
    score:Number(r.weekly_best_score)*SCORE_SCALE,
    player:{publicName:publicName(r),uniqueID:String(r.telegram_id),photoUrl:String(r.photo_url||'')},
    rewardCrystals: weeklyRewardAmount(i+1),
  }));
  const rank=getWeeklyRank(userRow);
  return {
    entries,
    userRank:rank,
    season:{weekId:week.weekId, week:week.week, year:week.isoYear, resetAt:week.resetAt},
    reward:{top10:WEEKLY_CRYSTAL_REWARDS, claimedWeek:userRow?.weekly_reward_claim_week||'', claimedRank:Number(userRow?.weekly_reward_claim_rank)||0},
  };
}
function playerEntry(row){
  const rank=getWeeklyRank(row);if(!rank)return null;
  return {rank,score:currentWeeklyScore(row)*SCORE_SCALE,player:{publicName:publicName(row),uniqueID:String(row.telegram_id),photoUrl:String(row.photo_url||'')}};
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
  const reply_markup=btn?{inline_keyboard:[[btn],[{text:'🏆 Недельный рейтинг',callback_data:'leaderboard'}]]}:undefined;
  return botApi('sendMessage',{chat_id:chatId,text:'⚡ Neon Arena\n\nВыживай, собирай комбо, открывай косметику и поднимайся в еженедельном рейтинге Telegram.',reply_markup});
}
async function sendLeaderboard(chatId,userId){
  const row=q.getUser.get(Number(userId));const top=q.topWeekly.all(leaderboardWeekId());
  const lines=top.length?top.map((r,i)=>`${i+1}. ${publicName(r)} — ${Number(r.weekly_best_score).toLocaleString('ru-RU')}`).join('\n'):'Пока нет результатов за эту неделю.';
  const mine=row&&currentWeeklyScore(row)>0?`\n\nВаше место: #${getWeeklyRank(row)} · ${Number(currentWeeklyScore(row)).toLocaleString('ru-RU')}`:'';
  return botApi('sendMessage',{chat_id:chatId,text:`🏆 Недельный рейтинг Neon Arena\n\n${lines}${mine}`});
}
function supportText(payment=false){
  const contact=SUPPORT_USERNAME?`@${SUPPORT_USERNAME}`:'у владельца бота (укажите SUPPORT_USERNAME в настройках сервера)';
  return payment?`Поддержка по платежам: ${contact}. При обращении укажите дату покупки и количество Stars.`:`Поддержка Neon Arena: ${contact}.`;
}
const TERMS_TEXT='Neon Arena продаёт цифровую косметическую валюту, премиальные сундуки, сезонный пропуск и косметические предметы за Telegram Stars. Сундуки содержат случайные косметические награды с опубликованными шансами и системой гаранта. Все цифровые предметы не имеют денежной стоимости внутри игры, не подлежат выводу и не дают преимущества в боевых характеристиках. Возвраты по обоснованным платёжным обращениям рассматриваются поддержкой проекта.';

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
    let nextCrystals=Math.max(0,Number(row.crystals)||0), premiumJson=row.premium_owned_json, progressJson=JSON.stringify(getProgress(row));
    let fulfillment={type:product.type||'crystals'};
    if(product.type==='star_chest'){
      const opened=grantStarChestReward(row, product.chestId||product.id);
      premiumJson=opened.premiumOwnedJson;
      progressJson=JSON.stringify(opened.progress);
      fulfillment={...opened.reward,pity:opened.pity};
      q.setChestPity.run(opened.pity.legendary.count,opened.pity.mythic.count,now(),fromId);
    }else if(product.type==='season_pass'){
      const activated=activateSeasonPass(row);
      fulfillment={type:'season_pass',seasonId:activated.seasonId,alreadyOwned:activated.alreadyOwned};
    }else{
      nextCrystals=Math.max(0,Number(row.crystals)||0)+Number(product.crystals||0);
      const p=bumpProgress(row,x=>{x.crystals=nextCrystals});
      progressJson=JSON.stringify(p);
      fulfillment={type:'crystals',crystals:Number(product.crystals)||0};
    }
    q.markPaid.run(charge,now(),JSON.stringify(fulfillment),purchase.purchase_id);
    if(product.type!=='season_pass')q.setPremiumState.run(nextCrystals,premiumJson,progressJson,now(),fromId);
    db.exec('COMMIT');
  }catch(e){try{db.exec('ROLLBACK')}catch{};console.error('[payment]',e)}
}
async function processBotUpdate(update){
  if(update.pre_checkout_query){
    const pc=update.pre_checkout_query;let ok=false,error_message='Платёж не прошёл проверку.';
    try{
      const parsed=parsePayload(pc.invoice_payload);const purchase=parsed&&q.getPurchase.get(parsed.purchaseId);const product=parsed&&PRODUCTS[parsed.productId];
      ok=Boolean(parsed&&purchase&&product&&purchase.status==='pending'&&Number(pc.from?.id)===parsed.telegramId&&purchase.telegram_id===parsed.telegramId&&pc.currency==='XTR'&&Number(pc.total_amount)===product.stars);
      if(ok&&product.type==='season_pass'){
        const buyer=q.getUser.get(parsed.telegramId);if(buyer&&passState(buyer).premium){ok=false;error_message='Premium Season Pass уже активирован для текущего сезона.'}
      }
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
    {command:'leaderboard',description:'Недельный рейтинг'},
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
    return sendJson(res,200,{products:Object.values(PRODUCTS).map(p=>({id:p.id,type:p.type||'crystals',title:p.title,description:p.description,price:`${p.stars} ⭐`,stars:p.stars,amount:Number(p.crystals)||0}))});
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
    const fresh=q.getUser.get(row.telegram_id);const passGain=addPassXp(fresh,{score,wave,kills,durationMs});let newBest=false,newWeeklyBest=false;const weekId=leaderboardWeekId();
    const currentWeekly=fresh.weekly_best_week_id===weekId?Number(fresh.weekly_best_score||0):0;
    const shouldUpdateBest=score>Number(fresh.best_score||0);
    const shouldUpdateWeekly=score>currentWeekly;
    if(shouldUpdateBest || shouldUpdateWeekly){
      const p=bumpProgress(fresh,x=>{x.bestScore=Math.max(Number(fresh.best_score)||0,score);x.gamesPlayed=Math.max(Number(x.gamesPlayed)||0,1)});
      const encoded=JSON.stringify(p);
      if(shouldUpdateBest){
        q.saveScore.run(
          Math.max(Number(fresh.best_score)||0,score),
          shouldUpdateBest?now():Number(fresh.best_score_at)||0,
          Math.max(currentWeekly,score),
          shouldUpdateWeekly?now():currentWeeklyScoreAt(fresh),
          weekId,
          encoded,
          now(),
          row.telegram_id
        );
        newBest=true;newWeeklyBest=shouldUpdateWeekly;
      }else if(shouldUpdateWeekly){
        q.saveWeeklyScore.run(score,now(),weekId,encoded,now(),row.telegram_id);
        newWeeklyBest=true;
      }
    }
    const latest=q.getUser.get(row.telegram_id);return sendJson(res,200,{ok:true,newBest,newWeeklyBest,passXpGained:passGain.gained,pass:passPayload(latest),entry:playerEntry(latest)});
  }
  if(pathname==='/api/leaderboard' && req.method==='GET') return sendJson(res,200,{ok:true,...leaderboardPayload(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/player-entry' && req.method==='GET') return sendJson(res,200,{ok:true,entry:playerEntry(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/star-chest/status' && req.method==='GET') return sendJson(res,200,{ok:true,pity:pityState(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/pass' && req.method==='GET') return sendJson(res,200,{ok:true,...passPayload(q.getUser.get(row.telegram_id))});
  if(pathname==='/api/pass/claim' && req.method==='POST'){
    const body=await readJson(req);const fresh=q.getUser.get(row.telegram_id);
    try{return sendJson(res,200,claimPassReward(fresh,String(body.track||'free'),Number(body.level)||0))}
    catch(e){return sendJson(res,Number(e.status)||409,{ok:false,reason:e.reason||e.message||'pass_claim_failed'})}
  }
  if(pathname==='/api/invoice' && req.method==='POST'){
    if(!BOT_TOKEN)throw Object.assign(new Error('payments_unavailable'),{status:503});
    const body=await readJson(req);const product=PRODUCTS[String(body.productId||body.product_id||'')];if(!product)throw Object.assign(new Error('unknown_product'),{status:404});
    if(product.type==='season_pass'&&passState(q.getUser.get(row.telegram_id)).premium) return sendJson(res,409,{ok:false,reason:'already_owned'});
    const purchaseId=crypto.randomBytes(12).toString('hex');const payload=`neon:${purchaseId}:${row.telegram_id}:${product.id}`;
    q.insertPurchase.run(purchaseId,row.telegram_id,product.id,product.stars,payload,now());
    const invoiceLink=await botApi('createInvoiceLink',{title:product.title,description:product.description,payload,currency:'XTR',provider_token:'',prices:[{label:product.title,amount:product.stars}]});
    return sendJson(res,200,{ok:true,purchaseId,invoiceLink,stars:product.stars});
  }
  if(pathname==='/api/purchase-status' && req.method==='GET'){
    const purchaseId=String(url.searchParams.get('id')||'');const purchase=q.getPurchase.get(purchaseId);
    if(!purchase||Number(purchase.telegram_id)!==Number(row.telegram_id))throw Object.assign(new Error('purchase_not_found'),{status:404});
    const latest=q.getUser.get(row.telegram_id);return sendJson(res,200,{ok:true,status:purchase.status,progress:purchase.status==='paid'?getProgress(latest):undefined,reward:purchase.status==='paid'?safeJsonParse(purchase.fulfillment_json,null):null});
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
  if(pathname==='/api/rewards/weekly' && req.method==='POST'){
    let result;
    try{
      db.exec('BEGIN IMMEDIATE');const fresh=q.getUser.get(row.telegram_id);const weekId=leaderboardWeekId();const rank=getWeeklyRank(fresh);const amount=weeklyRewardAmount(rank);
      if(!amount){db.exec('COMMIT');return sendJson(res,409,{ok:false,reason:'rank',rank})}
      if(fresh.weekly_reward_claim_week===weekId){db.exec('COMMIT');return sendJson(res,409,{ok:false,reason:'claimed',rank,weekId})}
      const nextCrystals=Number(fresh.crystals)+amount;const p=bumpProgress(fresh,x=>{x.crystals=nextCrystals;x.lastWeeklyCrystalRewardWeek=weekId;x.lastWeeklyCrystalRewardRank=rank});
      q.claimWeeklyReward.run(nextCrystals,weekId,rank,JSON.stringify(p),now(),row.telegram_id);db.exec('COMMIT');result={ok:true,rank,amount,weekId,progress:getProgress(q.getUser.get(row.telegram_id))};
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
