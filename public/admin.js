
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const loginCard=$('loginCard'),dashboard=$('dashboard'),loginForm=$('loginForm'),tokenInput=$('tokenInput'),loginError=$('loginError');
  let token=sessionStorage.getItem('neon_admin_token')||'',refreshTimer=null;

  const fmtNum=n=>Math.round(Number(n)||0).toLocaleString('ru-RU');
  function fmtDuration(ms,compact=false){
    let s=Math.max(0,Math.round((Number(ms)||0)/1000));
    const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);const sec=s%60;
    if(d)return compact?`${d}д ${h}ч`:`${d} д ${h} ч`;
    if(h)return compact?`${h}ч ${m}м`:`${h} ч ${m} мин`;
    if(m)return compact?`${m}м ${sec}с`:`${m} мин ${sec} сек`;
    return `${sec} сек`;
  }
  function fmtDate(ts){
    if(!ts)return '—';
    const d=new Date(Number(ts));
    return d.toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  async function load(){
    if(!token)return showLogin();
    try{
      loginError.classList.add('hidden');
      const r=await fetch('/api/admin/stats',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw Object.assign(new Error(data.error||'Ошибка доступа'),{status:r.status});
      render(data);showDashboard();
    }catch(e){
      if(e.status===401){sessionStorage.removeItem('neon_admin_token');token='';loginError.textContent='Неверный ADMIN_TOKEN.';loginError.classList.remove('hidden');showLogin()}
      else{loginError.textContent=e.message||'Не удалось загрузить статистику.';loginError.classList.remove('hidden')}
    }
  }
  function showLogin(){loginCard.classList.remove('hidden');dashboard.classList.add('hidden');$('logoutBtn').classList.add('hidden');$('refreshBtn').classList.add('hidden');tokenInput.focus()}
  function showDashboard(){loginCard.classList.add('hidden');dashboard.classList.remove('hidden');$('logoutBtn').classList.remove('hidden');$('refreshBtn').classList.remove('hidden')}
  function setText(id,value){const el=$(id);if(el)el.textContent=value}
  function render(data){
    const o=data.overview||{},today=data.today||{},s=data.last7d||{},m=data.monetization||{};
    setText('playersTotal',fmtNum(o.players));setText('activeNow',fmtNum(o.activeNow));setText('activeToday',fmtNum(today.activePlayers));setText('active7d',fmtNum(o.active7d));
    setText('runsTotal',fmtNum(o.runs));setText('runsToday',`Сегодня: ${fmtNum(today.runs)}`);
    setText('playTotal',fmtDuration(o.playMs,true));setText('playToday',`Сегодня: ${fmtDuration(today.playMs,true)}`);
    setText('avgRun',fmtDuration(s.avgRunMs,true));setText('avgWave',`Средняя волна: ${(Number(s.avgWave)||0).toFixed(1)}`);
    setText('avgSession',fmtDuration(s.avgSessionMs,true));setText('sessions7d',`Сессий: ${fmtNum(s.sessions)}`);
    setText('starsTotal',`${fmtNum(m.all?.stars)} ⭐`);setText('purchasesTotal',`${fmtNum(m.all?.purchases)} покупок · ${fmtNum(m.all?.payers)} плательщиков`);
    setText('stars30',`${fmtNum(m.last30d?.stars)} ⭐`);setText('payers30',`${fmtNum(m.last30d?.payers)} плательщиков`);
    setText('runTimeTotal',fmtDuration(o.runMs,true));setText('sessionsTotal',fmtNum(o.sessions));
    setText('updatedAt',`Обновлено ${new Date(data.generatedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} · UTC analytics`);
    renderTrend(data.trend||[]);renderPlayers(data.players||[]);
  }
  function renderTrend(rows){
    const box=$('trendChart');box.innerHTML='';
    const maxPlayers=Math.max(1,...rows.map(x=>Number(x.activePlayers)||0)),maxRuns=Math.max(1,...rows.map(x=>Number(x.runs)||0));
    for(const row of rows){
      const day=document.createElement('div');day.className='trend-day';
      const bars=document.createElement('div');bars.className='bars';
      const p=document.createElement('div');p.className='bar players';p.style.height=`${Math.max(2,(Number(row.activePlayers)||0)/maxPlayers*100)}%`;p.title=`Игроки: ${fmtNum(row.activePlayers)}`;
      const r=document.createElement('div');r.className='bar runs';r.style.height=`${Math.max(2,(Number(row.runs)||0)/maxRuns*100)}%`;r.title=`Забеги: ${fmtNum(row.runs)}`;
      bars.append(p,r);
      const label=document.createElement('div');label.className='day-label';label.textContent=String(row.day||'').slice(5).replace('-','.');
      day.append(bars,label);box.appendChild(day);
    }
  }
  function renderPlayers(players){
    const body=$('playersTable');body.innerHTML='';
    for(const p of players){
      const tr=document.createElement('tr'),fresh=Date.now()-Number(p.lastSeenAt||0)<90000;
      tr.innerHTML=`<td><span class="player-name"></span><span class="player-user"></span></td><td>${fmtNum(p.runs)}</td><td>${fmtDuration(p.playMs,true)}</td><td>${fmtDuration(p.runMs,true)}</td><td>${fmtNum(p.sessions)}</td><td>${fmtNum(p.bestScore)}</td><td class="${fresh?'fresh':''}">${fresh?'Сейчас':fmtDate(p.lastSeenAt)}</td>`;
      tr.querySelector('.player-name').textContent=p.name||'Player';
      tr.querySelector('.player-user').textContent=p.username||`ID ${p.id}`;
      body.appendChild(tr);
    }
    if(!players.length){const tr=document.createElement('tr');tr.innerHTML='<td colspan="7">Пока нет аналитики игроков после обновления.</td>';body.appendChild(tr)}
  }

  loginForm.addEventListener('submit',e=>{e.preventDefault();token=tokenInput.value.trim();if(!token)return;sessionStorage.setItem('neon_admin_token',token);load()});
  $('refreshBtn').addEventListener('click',load);
  $('logoutBtn').addEventListener('click',()=>{token='';sessionStorage.removeItem('neon_admin_token');tokenInput.value='';showLogin()});
  if(token)load();else showLogin();
  refreshTimer=setInterval(()=>{if(token&&!document.hidden)load()},60000);
})();
