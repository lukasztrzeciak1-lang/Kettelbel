(function(){
  function safeParse(key, fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch(e){return fallback}}
  function restoreBase(){
    const w=document.getElementById('week'), s=document.getElementById('session');
    if(!w||!s)return;
    const saved=safeParse('kb220_plan_state',null);
    if(saved){
      if(saved.week && [...w.options].some(o=>o.value==String(saved.week))) w.value=String(saved.week);
      if(saved.session && [...s.options].some(o=>o.value===saved.session)) s.value=saved.session;
    }
    const save=()=>{
      localStorage.setItem('kb220_plan_state',JSON.stringify({week:Number(w.value||1),session:s.value||'A',savedAt:Date.now()}));
      try{if(typeof renderBase==='function')renderBase()}catch(e){}
    };
    w.addEventListener('change',save);
    s.addEventListener('change',save);
    try{if(typeof renderBase==='function')renderBase()}catch(e){}
  }
  function cacheCoach(){
    try{
      if(Array.isArray(window.coachWorkouts) && window.coachWorkouts.length){
        localStorage.setItem('kb220_coach_cache',JSON.stringify({items:window.coachWorkouts,savedAt:Date.now()}));
      }
    }catch(e){}
  }
  function renderCoachCache(){
    const box=document.getElementById('coachBox');
    if(!box)return;
    const cached=safeParse('kb220_coach_cache',null);
    if(!cached?.items?.length)return;
    const now=new Date(); now.setHours(0,0,0,0);
    const item=cached.items.find(x=>!x.scheduled_for || new Date(x.scheduled_for+'T00:00:00')>=now) || cached.items[0];
    if(!item)return;
    const bits=[];
    if(item.kettlebell_kg!=null)bits.push(item.kettlebell_kg+' kg');
    if(item.duration_seconds!=null)bits.push(Math.round(item.duration_seconds/60*10)/10+' min');
    if(item.target_rpm!=null)bits.push(item.target_rpm+'/min');
    if(item.target_reps!=null)bits.push('cel '+item.target_reps);
    box.innerHTML='<b>'+ (item.title||'Trening od trenera') +'</b><br>'+
      (item.scheduled_for?'<span class="pill">'+item.scheduled_for+'</span> ':'')+
      bits.map(x=>'<span class="pill">'+x+'</span>').join('')+
      (item.instructions?'<div style="margin-top:8px">'+item.instructions+'</div>':'')+
      '<div class="mut" style="margin-top:8px">Ostatnio zapisany plan – aplikacja odświeży go po połączeniu z internetem.</div>';
  }
  function hookCoach(){
    try{
      if(typeof window.loadCoach==='function' && !window.__kb220LoadCoachWrapped){
        const original=window.loadCoach;
        window.loadCoach=async function(){
          renderCoachCache();
          try{
            const r=await original.apply(this,arguments);
            cacheCoach();
            return r;
          }catch(e){
            renderCoachCache();
            throw e;
          }
        };
        window.__kb220LoadCoachWrapped=true;
      }
    }catch(e){}
  }
  window.kbPersistenceRestore=function(){
    restoreBase();
    renderCoachCache();
    hookCoach();
    setTimeout(cacheCoach,1200);
    setTimeout(cacheCoach,3000);
  };
  setTimeout(window.kbPersistenceRestore,250);
})();
