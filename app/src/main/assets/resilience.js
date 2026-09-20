(function(){
'use strict';
var $r=function(id){return document.getElementById(id)};
function notify(message){var n=$r('kbOfflineNotice');if(n)n.textContent=message}
function ensurePlan(){
  var week=$r('week'), base=$r('baseBox');
  if(!week||!base)return;
  if(!week.options.length){try{if(typeof initPlan==='function')initPlan()}catch(e){notify('Nie udało się otworzyć planu: '+e.message)}}
  if(week.options.length){
    try{var saved=JSON.parse(localStorage.getItem('kb220_plan_state')||'null');if(saved&&saved.week&&Array.from(week.options).some(function(o){return +o.value===+saved.week}))week.value=String(saved.week);if(saved&&saved.session&&$r('session'))$r('session').value=saved.session;if(typeof renderBase==='function')renderBase()}catch(e){}
  }
}
function showTraining(){
  var app=$r('app'),auth=$r('auth');if(app)app.classList.remove('hidden');if(auth)auth.classList.add('hidden');
  var tab=$r('training');if(tab){document.querySelectorAll('.tab').forEach(function(e){e.classList.remove('on')});tab.classList.add('on')}
  var buttons=document.querySelectorAll('.nav button');buttons.forEach(function(b){b.classList.remove('on')});if(buttons[0])buttons[0].classList.add('on');
  ensurePlan();var card=document.querySelector('#training .card.base');if(card)card.scrollIntoView({block:'start'});
}
function repairStart(){
  var base=$r('baseBox'),week=$r('week'),session=$r('session');
  if(!base||!week||!session)return;
  ensurePlan();if(!week.options.length){notify('Plan 220 jest niedostępny. Zamknij i otwórz aplikację ponownie.');return}
  showTraining();try{if(typeof startBase==='function')startBase()}catch(e){notify('Błąd uruchomienia 220: '+e.message)}
}
function renderOfflineAccess(){
  var account=$r('account');if(account&&!$r('kbAccountLogin')){
    var card=document.createElement('div');card.className='card';card.id='kbAccountLogin';
    card.innerHTML='<h2>Konto i synchronizacja</h2><p class="mut" id="kbOfflineNotice">Plan 220 i treningi sportowe są dostępne bez internetu. Synchronizacja historii z trenerem wymaga zalogowania.</p><button class="btn sec big" id="kbShowLogin">ZALOGUJ / SYNCHRONIZUJ</button>';
    account.insertBefore(card,account.firstChild);
    $r('kbShowLogin').onclick=function(){var auth=$r('auth');if(auth){auth.classList.remove('hidden');auth.scrollIntoView({block:'start'})}};
  }
  var start=document.querySelector('#training .card.base button');if(start&&!start.dataset.kbFixed){start.dataset.kbFixed='1';start.onclick=repairStart}
}
function restore(){
  var app=$r('app'),auth=$r('auth');if(!app||!auth)return;
  app.classList.remove('hidden');auth.classList.add('hidden');
  renderOfflineAccess();ensurePlan();
  if(!$r('kbSportCard')){try{if(window.kbSport&&window.kbSport.init)window.kbSport.init()}catch(e){notify('Błąd modułu sportowego: '+e.message)}}
}
// On the previous build, the 220 tile merely scrolled the page and could not open the program.
document.addEventListener('click',function(event){var tile=event.target.closest&&event.target.closest('[data-kbs="program220"]');if(tile){event.preventDefault();event.stopImmediatePropagation();showTraining()}},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore);else restore();
setTimeout(restore,650);
window.kbOpen220=showTraining;
})();
