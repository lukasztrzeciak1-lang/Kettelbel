(function(){
'use strict';
const EXERCISES=[
 ['Swing 2-ręczny','Dynamiczne'],['Swing 1-ręczny','Dynamiczne'],['Double KB Swing','Dynamiczne'],['Clean 1 KB','Sportowe'],['Clean 2 KB','Sportowe'],['Jerk 1 KB','Sportowe'],['Jerk 2 KB','Sportowe'],['Push Press 1 KB','Sportowe'],['Push Press 2 KB','Sportowe'],['Strict Press','Siła'],['Snatch','Sportowe'],['Half Snatch','Sportowe'],['OALC – One Arm Long Cycle','Sportowe'],['TALC – Two Arm Long Cycle','Sportowe'],['Long Cycle','Sportowe'],['Clean & Press','Sportowe'],
 ['Goblet Squat','Nogi'],['Front Squat 1 KB','Nogi'],['Double KB Front Squat','Nogi'],['Reverse Lunge','Nogi'],['Forward Lunge','Nogi'],['Walking Lunge','Nogi'],['Side Lunge','Nogi'],['Bulgarian Split Squat','Nogi'],
 ['Deadlift','Tył ciała'],['Romanian Deadlift','Tył ciała'],['Single-Leg RDL','Tył ciała'],['High Pull','Góra'],['Bent Over Row','Góra'],['Renegade Row','Góra'],['Floor Press','Góra'],['Bottoms-Up Press','Góra'],
 ['Russian Twist','Core'],['Windmill','Core'],['Side Bend','Core'],['Plank Drag','Core'],['Turkish Get-Up','Stabilizacja'],['Half Get-Up','Stabilizacja'],['Halo','Mobilność'],['Arm Bar','Mobilność'],['Around the World','Mobilność'],['Goblet Squat Hold','Mobilność'],
 ['Farmer Walk','Carry'],['Suitcase Carry','Carry'],['Rack Carry','Carry'],['Overhead Carry','Carry'],['Waiter Walk','Carry'],
 ['Clean + Squat + Press','Kompleks'],['Swing + Clean + Press','Kompleks'],['Clean + Lunge + Press','Kompleks'],['Snatch + Windmill','Kompleks'],['Thruster','Kompleks']
];
const MODES=[
 {id:'pent',name:'PIĘCIOBÓJ',sub:'5 konkurencji • pełny protokół',seq:['Clean','Clean & Press','Jerk','Half Snatch','Push Press'],work:360,rest:300},
 {id:'halfPent',name:'PÓŁPIĘCIOBÓJ',sub:'krótszy wariant treningowy',seq:['Clean','Clean & Press','Jerk','Half Snatch','Push Press'],work:180,rest:180},
 {id:'snatch',name:'RWANIE / SNATCH',sub:'1 lub wiele zmian ręki',exercise:'Snatch',work:600},
 {id:'oalc',name:'OALC',sub:'One Arm Long Cycle',exercise:'OALC – One Arm Long Cycle',work:600},
 {id:'talc',name:'TALC',sub:'Two Arm Long Cycle',exercise:'TALC – Two Arm Long Cycle',work:600},
 {id:'lc',name:'LONG CYCLE',sub:'Clean & Jerk',exercise:'Long Cycle',work:600},
 {id:'jerk',name:'JERK',sub:'1 lub 2 kettle',exercise:'Jerk',work:600},
 {id:'halfSnatch',name:'HALF SNATCH',sub:'kontrolowany powrót do rack',exercise:'Half Snatch',work:600},
 {id:'strength',name:'SIŁA / GPP',sub:'ćwiczenia uzupełniające',special:'library'},
 {id:'custom',name:'WŁASNY TRENING',sub:'wybierz ruch, czas i ciężar',special:'custom'},
 {id:'program220',name:'PROGRAM 220 × 24 KG',sub:'Twój obecny plan do marca 2027',special:'close'}
];

const TRAINER_PLANS=[
 {no:11,title:'Rwanie + fiksacja',lines:[
  'Swing jednorącz 18 kg × 100, alternatywnie',
  'Rwanie 24 kg: 2:30 na rękę (5:00 łącznie), potem 4:00 przerwy',
  'Rwanie 20 kg: 2:30 na rękę (5:00 łącznie), potem 4:00 przerwy',
  'Fiksacja 22 kg po 1:00 — 2 razy'
 ],timers:[
  {label:'Rwanie 24 kg — zmiana ręki po 2:30',sec:300,kg:24},
  {label:'Przerwa',sec:240,kg:0},
  {label:'Rwanie 20 kg — zmiana ręki po 2:30',sec:300,kg:20},
  {label:'Przerwa',sec:240,kg:0},
  {label:'Fiksacja 22 kg — 1. seria',sec:60,kg:22},
  {label:'Fiksacja 22 kg — 2. seria',sec:60,kg:22}
 ]},
 {no:12,title:'Swings + drabinka rwania',lines:[
  'Swing USA 20 kg × 10',
  'Swing rosyjski oburącz 40 kg × 10',
  'Całość 2 razy',
  'Rwanie: 6:00 — 16 kg',
  '3:00 przerwy',
  'Rwanie: 5:00 — 18 kg',
  '3:00 przerwy',
  'Rwanie: 4:00 — 20 kg',
  'Biceps hantle młotkowo 2 × 12,5 kg × 50 powt.'
 ],timers:[
  {label:'Rwanie 16 kg',sec:360,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'Rwanie 18 kg',sec:300,kg:18},{label:'Przerwa',sec:180,kg:0},
  {label:'Rwanie 20 kg',sec:240,kg:20}
 ]},
 {no:13,title:'Interwał wiosło + rwanie',lines:[
  '5 rund',
  'Wiosło 200 m',
  'Rwanie 20 kg po 20 powt.',
  'Rozciąganie'
 ],timers:[]},
 {no:14,title:'Test Snatch 16 kg',lines:[
  'Rozgrzewka jak na zawodach przed startem',
  'Tylko test — najlepiej nagrać',
  'Test Snatch 16 kg, 1 zmiana ręki, 10:00',
  'Zapisz wynik',
  'Rozciąganie'
 ],timers:[{label:'TEST SNATCH 16 kg — 1 zmiana ręki po 5:00',sec:600,kg:16}]},
 {no:15,title:'Wiosło + OALC',lines:[
  'Wiosło 1000 m',
  'Od razu długi cykl jednorącz',
  '20 kg — zmiana ręki co 6 powt., 8:00; potem 3:00 przerwy',
  '16 kg — zmiana ręki co 7 powt., 10:00; potem 3:00 przerwy',
  '12 kg — zmiana dowolnie, 12:00; potem 4:00 przerwy',
  'Rozciąganie'
 ],timers:[
  {label:'OALC 20 kg — zmiana co 6 powt.',sec:480,kg:20},{label:'Przerwa',sec:180,kg:0},
  {label:'OALC 16 kg — zmiana co 7 powt.',sec:600,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'OALC 12 kg — zmiana dowolnie',sec:720,kg:12},{label:'Przerwa',sec:240,kg:0}
 ]},
 {no:16,title:'Półpięciobój testowy 16 kg',lines:[
  '3:00 pracy na każdy bój, 3:00 przerwy między bojami',
  'Jedna zmiana ręki, maksymalna liczba powtórzeń',
  'Clean =',
  'Clean Press =',
  'Jerk =',
  'Half Snatch =',
  'Push Press =',
  'Zapisz każdy wynik osobno'
 ],timers:[
  {label:'Clean 16 kg',sec:180,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'Clean Press 16 kg',sec:180,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'Jerk 16 kg',sec:180,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'Half Snatch 16 kg',sec:180,kg:16},{label:'Przerwa',sec:180,kg:0},
  {label:'Push Press 16 kg',sec:180,kg:16}
 ]},
 {no:17,title:'Kompleks na worku 8 kg',lines:[
  'Przerwa 1:00 pomiędzy bojami',
  'Suples Spin — 6:00 — 210 powt. / 35 na min',
  'Swing Squat — 5:00 — 110 powt. / 22 na min',
  'Suples Snatch — 4:00 — 80 powt. / 20 na min',
  'Squat and Press — 3:00 — 70 powt. / 24 na min',
  'Suples Spin + Arm Throw — 2:00 — 30 powt. / 15 na min'
 ],timers:[
  {label:'Suples Spin — cel 210 / 35 na min',sec:360,kg:8},{label:'Przerwa',sec:60,kg:0},
  {label:'Swing Squat — cel 110 / 22 na min',sec:300,kg:8},{label:'Przerwa',sec:60,kg:0},
  {label:'Suples Snatch — cel 80 / 20 na min',sec:240,kg:8},{label:'Przerwa',sec:60,kg:0},
  {label:'Squat and Press — cel 70 / 24 na min',sec:180,kg:8},{label:'Przerwa',sec:60,kg:0},
  {label:'Suples Spin + Arm Throw — cel 30 / 15 na min',sec:120,kg:8}
 ]},
 {no:18,title:'Burpees + jerk + Assault',lines:[
  'Burpees × 5',
  'Jerk 20 kg po 10 na rękę',
  'Powtórz całość 10 razy',
  'Od razu Assault Bike 20:00'
 ],timers:[{label:'Assault Bike',sec:1200,kg:0}]}
];
let state={mode:null,phase:0,isRest:false,left:0,total:0,running:false,reps:0,timer:null,kg:24,pace:0};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function css(){if(document.getElementById('kbSportCss'))return;const s=document.createElement('style');s.id='kbSportCss';s.textContent=`
.kbs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.kbs-tile{background:#0b1628;border:1px solid #2b3a52;border-radius:17px;padding:14px;text-align:left;color:#fff;min-height:92px}.kbs-tile b{display:block;color:#facc15;font-size:17px;margin-bottom:6px}.kbs-tile span{color:#9aa8bd;font-size:13px}.kbs-modal{position:fixed;inset:0;background:#020617;z-index:120;overflow:auto;padding:18px;display:none}.kbs-modal.on{display:block}.kbs-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px}.kbs-x{border:0;background:#334155;color:#fff;border-radius:12px;padding:11px 14px;font-weight:800}.kbs-ex{padding:12px 0;border-bottom:1px solid #26364e}.kbs-cat{color:#facc15;font-weight:900;margin-top:18px}.kbs-clock{text-align:center;font-size:clamp(72px,24vw,140px);font-weight:900;margin:35px 0 8px}.kbs-phase{text-align:center;color:#facc15;font-size:26px;font-weight:900}.kbs-reps{text-align:center;font-size:56px;font-weight:900;margin:18px}.kbs-controls{display:grid;grid-template-columns:1fr 1fr;gap:10px}.kbs-controls button{min-height:52px}.kbs-wide{grid-column:1/-1}.kbs-badge{display:inline-block;padding:6px 9px;border-radius:999px;background:#223149;margin:3px}.kbs-note{font-size:13px;color:#9aa8bd;margin-top:9px}@media(max-width:420px){.kbs-grid{grid-template-columns:1fr 1fr}.kbs-tile{padding:12px;min-height:86px}.kbs-tile b{font-size:15px}}
`;document.head.appendChild(s)}
function inject(){css();if(document.getElementById('kbSportCard'))return;const coach=document.getElementById('coachCard');if(!coach)return;const card=document.createElement('div');card.className='card';card.id='kbSportCard';card.innerHTML=`<h2>Kettlebell Training</h2><div class="mut" style="margin-bottom:12px">Wybierz konkurencję albo typ treningu</div><div class="kbs-grid">${MODES.slice(0,10).map(m=>`<button class="kbs-tile" data-kbs="${m.id}"><b>${m.name}</b><span>${m.sub}</span></button>`).join('')}</div><button class="btn big" style="margin-top:12px" data-kbs="program220">PROGRAM 220 × 24 KG</button>`;coach.parentNode.insertBefore(card,coach);card.querySelectorAll('[data-kbs]').forEach(b=>b.onclick=()=>openMode(b.dataset.kbs));
 const trainer=document.createElement('div');trainer.className='card';trainer.id='kbTrainerCard';trainer.innerHTML=`<h2>Plan od trenera</h2><div class="mut" style="margin-bottom:12px">Treningi 11–18</div><button class="btn green big" id="kbTrainerOpen">OTWÓRZ PLAN TRENERA</button>`;coach.parentNode.insertBefore(trainer,coach);trainer.querySelector('#kbTrainerOpen').onclick=openTrainerList;
 const modal=document.createElement('div');modal.id='kbSportModal';modal.className='kbs-modal';modal.innerHTML='<div id="kbSportBody"></div>';document.body.appendChild(modal);
}
function close(){stopTick();document.getElementById('kbSportModal')?.classList.remove('on')}
function openMode(id){const m=MODES.find(x=>x.id===id);if(!m)return;if(m.special==='close'){close();document.getElementById('training')?.scrollIntoView({behavior:'smooth'});return}const modal=document.getElementById('kbSportModal'),body=document.getElementById('kbSportBody');modal.classList.add('on');if(m.special==='library'){renderLibrary(body);return}if(m.special==='custom'){renderCustom(body);return}renderSetup(body,m)}
function header(title){return `<div class="kbs-head"><div><h2 style="margin:0">${esc(title)}</h2></div><button class="kbs-x" id="kbsClose">✕</button></div>`}
function wireClose(){const x=document.getElementById('kbsClose');if(x)x.onclick=close}
function openTrainerList(){const modal=document.getElementById('kbSportModal'),body=document.getElementById('kbSportBody');modal.classList.add('on');body.innerHTML=header('Plan od trenera')+`<div class="card"><div class="mut" style="margin-bottom:12px">Jednostki 11–18</div><div class="kbs-grid">${TRAINER_PLANS.map(p=>`<button class="kbs-tile" data-trainer="${p.no}"><b>Trening ${p.no}</b><span>${esc(p.title)}</span></button>`).join('')}</div></div>`;wireClose();body.querySelectorAll('[data-trainer]').forEach(b=>b.onclick=()=>renderTrainerPlan(+b.dataset.trainer))}
function renderTrainerPlan(no){const p=TRAINER_PLANS.find(x=>x.no===no),body=document.getElementById('kbSportBody');if(!p)return;const saved=localStorage.getItem('kb_trainer_notes_'+no)||'';body.innerHTML=header('Trening '+no)+`<div class="card"><h2>${esc(p.title)}</h2><ol style="padding-left:22px">${p.lines.map(x=>`<li style="margin:8px 0">${esc(x)}</li>`).join('')}</ol>${p.timers.length?`<h3>Timery</h3><div style="display:grid;gap:8px">${p.timers.map((t,i)=>`<button class="btn ${t.kg?'':'sec'}" data-tt="${i}">▶ ${esc(t.label)} — ${fmt(t.sec)}</button>`).join('')}</div>`:''}<h3 style="margin-top:18px">Wynik / notatki</h3><textarea id="kbTrainerNotes" rows="6" style="width:100%" placeholder="Wpisz wynik testu, powtórzenia, RPE, uwagi...">${esc(saved)}</textarea><button class="btn green big" id="kbTrainerSave" style="margin-top:10px">ZAPISZ WYNIK</button><button class="btn big" id="kbTrainerBack" style="margin-top:8px">← LISTA TRENINGÓW</button></div>`;wireClose();body.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>startTrainerTimer(p,+b.dataset.tt));document.getElementById('kbTrainerSave').onclick=()=>{localStorage.setItem('kb_trainer_notes_'+no,document.getElementById('kbTrainerNotes').value||'');const b=document.getElementById('kbTrainerSave');b.textContent='✓ ZAPISANO';setTimeout(()=>b.textContent='ZAPISZ WYNIK',900)};document.getElementById('kbTrainerBack').onclick=openTrainerList}
function startTrainerTimer(plan,idx){const t=plan.timers[idx];state.mode={id:'trainer'+plan.no,name:'TRENING '+plan.no,exercise:t.label,work:t.sec};state.kg=t.kg||0;state.pace=0;state.phase=0;state.isRest=false;state.reps=0;state.left=t.sec;state.total=t.sec;state.running=false;renderTimer()}
function renderSetup(body,m){body.innerHTML=header(m.name)+`<div class="card"><div class="goal">${esc(m.sub)}</div>${m.seq?`<p class="mut">${m.seq.join(' → ')}</p>`:''}<div class="grid"><div><label>Ciężar kettla</label><select id="kbsKg"><option>8</option><option>12</option><option>16</option><option>20</option><option selected>24</option><option>28</option><option>32</option><option>36</option><option>40</option></select></div><div><label>Tempo docelowe / min</label><input id="kbsPace" type="number" min="0" value="0"></div><div><label>Czas pracy – min</label><input id="kbsWork" type="number" step="0.5" min="0.5" value="${m.work/60}"></div>${m.seq?`<div><label>Przerwa – min</label><input id="kbsRest" type="number" step="0.5" min="0" value="${m.rest/60}"></div>`:''}</div><button class="btn green big" id="kbsStart">▶ START</button><div class="kbs-note">Parametry można zmienić przed startem. Wynik zapisuje się lokalnie w historii Kettlebell Sport.</div></div>`;wireClose();document.getElementById('kbsStart').onclick=()=>startMode(m)}
function startMode(m){state.mode=JSON.parse(JSON.stringify(m));state.mode.work=Math.max(30,Math.round((+document.getElementById('kbsWork').value||m.work/60)*60));if(m.seq)state.mode.rest=Math.max(0,Math.round((+document.getElementById('kbsRest').value||m.rest/60)*60));state.kg=+document.getElementById('kbsKg').value||24;state.pace=+document.getElementById('kbsPace').value||0;state.phase=0;state.isRest=false;state.reps=0;state.left=state.mode.work;state.total=state.left;state.running=false;renderTimer()}
function phaseName(){if(state.isRest)return 'PRZERWA';if(state.mode.seq)return state.mode.seq[state.phase];return state.mode.exercise||state.mode.name}
function fmt(sec){sec=Math.max(0,Math.ceil(sec));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function renderTimer(){const body=document.getElementById('kbSportBody');body.innerHTML=header(state.mode.name)+`<div class="card"><div class="kbs-phase" id="kbsPhase">${esc(phaseName())}</div><div style="text-align:center"><span class="kbs-badge">${state.kg} kg</span>${state.pace?`<span class="kbs-badge">${state.pace}/min</span>`:''}${state.mode.seq?`<span class="kbs-badge">etap ${state.phase+1}/${state.mode.seq.length}</span>`:''}</div><div class="kbs-clock" id="kbsClock">${fmt(state.left)}</div><div class="kbs-reps" id="kbsReps">${state.reps}</div><div class="kbs-controls"><button class="btn sec" id="kbsMinus">−1</button><button class="btn" id="kbsPlus">+1</button><button class="btn" id="kbsPlus5">+5</button><button class="btn sec" id="kbsNext">NASTĘPNY ETAP</button><button class="btn green kbs-wide" id="kbsPlay">START</button><button class="btn red kbs-wide" id="kbsFinish">ZAKOŃCZ I ZAPISZ</button></div></div>`;wireClose();document.getElementById('kbsMinus').onclick=()=>rep(-1);document.getElementById('kbsPlus').onclick=()=>rep(1);document.getElementById('kbsPlus5').onclick=()=>rep(5);document.getElementById('kbsNext').onclick=advance;document.getElementById('kbsPlay').onclick=toggle;document.getElementById('kbsFinish').onclick=finish}
function rep(n){state.reps=Math.max(0,state.reps+n);const e=document.getElementById('kbsReps');if(e)e.textContent=state.reps}
function toggle(){state.running=!state.running;const b=document.getElementById('kbsPlay');if(b)b.textContent=state.running?'PAUZA':'START';if(state.running&&!state.timer){let last=Date.now();state.timer=setInterval(()=>{if(!state.running){last=Date.now();return}const now=Date.now(),d=(now-last)/1000;last=now;state.left-=d;if(state.left<=0){state.left=0;updateClock();navigator.vibrate?.([250,100,250]);advance();}else updateClock()},200)}}
function updateClock(){const c=document.getElementById('kbsClock');if(c)c.textContent=fmt(state.left)}
function advance(){if(!state.mode.seq){state.running=false;return}if(!state.isRest){if(state.phase>=state.mode.seq.length-1){finish();return}state.isRest=true;state.left=state.mode.rest;state.total=state.left}else{state.isRest=false;state.phase++;state.left=state.mode.work;state.total=state.left;state.reps=0}state.running=false;stopTick(false);renderTimer()}
function stopTick(setPaused=true){if(state.timer){clearInterval(state.timer);state.timer=null}if(setPaused)state.running=false}
function finish(){stopTick();const rec={id:Date.now(),date:new Date().toISOString(),mode:state.mode?.name||'Trening',exercise:phaseName(),kg:state.kg,reps:state.reps,pace:state.pace};const arr=JSON.parse(localStorage.getItem('kb_sport_history')||'[]');arr.unshift(rec);localStorage.setItem('kb_sport_history',JSON.stringify(arr.slice(0,100)));const body=document.getElementById('kbSportBody');body.innerHTML=header('Trening zakończony')+`<div class="card"><h2>${esc(rec.mode)}</h2><div class="goal">${rec.reps} powtórzeń</div><p><span class="kbs-badge">${rec.kg} kg</span>${rec.pace?`<span class="kbs-badge">cel ${rec.pace}/min</span>`:''}</p><button class="btn big" id="kbsDone">GOTOWE</button></div>`;wireClose();document.getElementById('kbsDone').onclick=close}
function renderLibrary(body){const cats=[...new Set(EXERCISES.map(x=>x[1]))];body.innerHTML=header('Biblioteka ćwiczeń')+`<div class="card"><input id="kbsSearch" placeholder="Szukaj ćwiczenia..."><div id="kbsList">${libraryHtml(cats,'')}</div></div>`;wireClose();document.getElementById('kbsSearch').oninput=e=>document.getElementById('kbsList').innerHTML=libraryHtml(cats,e.target.value)}
function libraryHtml(cats,q){q=(q||'').toLowerCase();return cats.map(c=>{const es=EXERCISES.filter(x=>x[1]===c&&x[0].toLowerCase().includes(q));if(!es.length)return'';return `<div class="kbs-cat">${c}</div>${es.map(x=>`<div class="kbs-ex">${esc(x[0])}</div>`).join('')}`}).join('')}
function renderCustom(body){const opts=EXERCISES.map(x=>`<option>${esc(x[0])}</option>`).join('');body.innerHTML=header('Własny trening')+`<div class="card"><label>Ćwiczenie</label><select id="kbsCustomEx">${opts}</select><div class="grid"><div><label>Ciężar</label><select id="kbsCustomKg"><option>8</option><option>12</option><option>16</option><option>20</option><option selected>24</option><option>28</option><option>32</option></select></div><div><label>Czas – min</label><input id="kbsCustomTime" type="number" value="10" min="0.5" step="0.5"></div><div><label>Tempo / min</label><input id="kbsCustomPace" type="number" value="0" min="0"></div></div><button class="btn green big" id="kbsCustomStart">▶ START</button></div>`;wireClose();document.getElementById('kbsCustomStart').onclick=()=>{const m={id:'customRun',name:'WŁASNY TRENING',sub:'',exercise:document.getElementById('kbsCustomEx').value,work:(+document.getElementById('kbsCustomTime').value||10)*60};state.mode=m;state.kg=+document.getElementById('kbsCustomKg').value||24;state.pace=+document.getElementById('kbsCustomPace').value||0;state.phase=0;state.isRest=false;state.reps=0;state.left=m.work;state.total=m.work;state.running=false;renderTimer()}}
function boot(){inject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,450));else setTimeout(boot,450);
window.kbSport={open:openMode,exercises:EXERCISES,modes:MODES};
})();
