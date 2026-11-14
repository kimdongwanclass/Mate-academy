/* 메이트 학원 지점 페이지 공통 기능 (목동·김포 공용) */
const SUBJ_ORDER=['국어','수학','영어','사회','과학'];
{const base=TEACHERS.filter(t=>!t.hidden).map((t,k)=>{const si=SUBJ_ORDER.indexOf(t.subjects[0]);return {t,k:T_FIRST.includes(t.name)?T_FIRST.indexOf(t.name):100+(si<0?99:si)*100+k};});
 base.sort((a,b)=>a.k-b.k);TEACHERS.splice(0,TEACHERS.length,...base.map(x=>x.t));}
/* 여러 과목 강사는 과목 색을 섞어 보여 줌 */
function gradOf(cols,deg){if(cols.length===1)return cols[0];const n=cols.length;return 'linear-gradient('+(deg||135)+'deg,'+cols.map((c,i)=>c+' '+(i/n*100).toFixed(2)+'% '+((i+1)/n*100).toFixed(2)+'%').join(',')+')';}
function darkOf(hex){const h=hex.replace('#','');const m=i=>Math.round(parseInt(h.substr(i,2),16)*.32+17*.68);return 'rgb('+m(0)+','+m(2)+','+m(4)+')';}
const BG_SUBJ={'안호수':'수학'};
function sCols(t,key){if(key==='bg'&&BG_SUBJ[t.name])return [SC[BG_SUBJ[t.name]].bg];return [(SC[t.subjects[0]]||SC['국어'])[key]];}

function renderTeachers(filter){
  const grid=document.getElementById('t-grid');
  grid.innerHTML=TEACHERS.map((t,idx)=>{
    const hidden=(filter!=='전체'&&!t.filters.includes(filter))?'hidden':'';
    const roleHtml=t.role?`<span class="t-role">${t.role}</span>`:'';
    const ps=PHOTO_DATA[t.name]||'';
    const primaryC=SC[BG_SUBJ[t.name]||t.subjects[0]]||SC['국어'];
    const ph=ps?`<img src="${ps}" alt="${t.name}" loading="lazy"/>`
      :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:rgba(255,255,255,.9);background:${primaryC.avatar}">${t.name.charAt(0)}</div>`;
    const badgesHtml=t.subjects.map(s=>{const c=SC[s]||{bg:'#eee',text:'#444'};return `<span class="t-badge" style="background:${c.bg};color:${c.text}">${s}</span>`;}).join('');
    return `<div class="t-card" ${hidden} style="--sc:${primaryC.avatar};--sc-lt:${primaryC.bg};--sc-grad:${gradOf(sCols(t,'avatar'))};--sc-lt-grad:${gradOf(sCols(t,'bg'))}" onclick="openTeacher(${idx})">
      <div class="t-photo">${ph}</div>
      <div class="t-info">
        <div class="t-badges">${badgesHtml}</div>
        <div class="t-name-row"><div class="t-name">${t.name}</div>${roleHtml}</div>
        ${t.msg?`<div class="t-msg">${t.msg}</div>`:''}
        <div class="t-more">상세 프로필 →</div>
      </div>
    </div>`;
  }).join('');
}
renderTeachers('전체');
document.getElementById('t-filter-bar').addEventListener('click',e=>{
  const btn=e.target.closest('.t-filter-btn');if(!btn)return;
  document.querySelectorAll('.t-filter-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');renderTeachers(btn.dataset.f);
});

/* Schedule — 「메이트 강의목록」 시트(Apps Script 웹 앱)에서 페이지가 열릴 때 읽어 옴
   반·시간표는 여기나 data 파일에 손으로 적지 않는다. 시트만 고치면 5분 안에 반영됨. */
const CLASS_API='https://script.google.com/macros/s/AKfycbyJaGLC1QJplM-Ij3PmnwtXrygEDW8kVNqvuJp6MOQdpUNGszal6AbzbzFYKm3_sb1E/exec?site=home';
const CLASS_CACHE='mate_classes_home';
const GRADE_BASE=['예비고1','고1','고2'];          /* 수업이 없어도 늘 보이는 학년 버튼 */
const GRADE_ORDER=['예비고1','고1','고2','고3','N수','방학특강'];
const VAC_KEY='방학특강';   /* 구분이 겨울·여름인 반은 학년과 상관없이 이 버튼 하나로 모음 (시트 수정 불필요) */
const GRADE_LABEL={'예비고1':'예비고1·중3'};
const ALL_GRADE=/^(전\s*학년|전체|공통)$/;   /* 시트 학년 칸이 이 값이면 모든 학년에 표시 */
const KIND_ORDER={'정규':0,'겨울':1,'여름':2};
const SEASON={'겨울':{cls:'s-winter',badge:'<span class="sc-badge sc-winter">❄ 겨울방학 특강</span>'},
              '여름':{cls:'s-summer',badge:'<span class="sc-badge sc-summer">☀ 여름방학 특강</span>'}};
const SC_S={
  '국어':{bg:'#FEF9C3',text:'#854D0E',border:'#EAB308'},
  '수학':{bg:'#DCFCE7',text:'#166534',border:'#22C55E'},
  '영어':{bg:'#FCE7F3',text:'#9D174D',border:'#EC4899'},
  '사회':{bg:'#EDE9FE',text:'#5B21B6',border:'#7C3AED'},
  '과학':{bg:'#E0F2FE',text:'#075985',border:'#0EA5E9'},
  '논술':{bg:'#E4ECF7',text:'#2F558C',border:'#7C9FD0'},
  '면접·컨설팅':{bg:'#E4E9F1',text:'#1E293B',border:'#334155'},
};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let SCHEDULE={};            /* {학년:[반,…]} — 시트에서 받아 채움 */
let schedState='loading';   /* loading | ok | fail */
let curGrade=null,curSubj='전체';

/* 시트 시간 표기 → 화면 표기: 클 → 클리닉, a10 → 오전 10, 시간 칸이 요일로 시작하면 요일 칸은 생략 */
function timeText(days,time){
  const t=String(time||'').trim().replace(/클(?!리닉)/g,'클리닉').replace(/(^|[^A-Za-z])a(\d)/g,'$1 오전 $2').replace(/\s+/g,' ').trim();
  const d=String(days||'').trim();
  return (!d||/^[월화수목금토일]/.test(t))?t:(t?d+' '+t:d);
}
function toItem(c){
  const ns=(Array.isArray(c.teachers)?c.teachers:String(c.teachers||'').split(/[·,]/)).map(x=>String(x).trim().replace(/T$/,'')).filter(Boolean);
  const grades=String(c.grade||'').split(/[·,\/]/).map(x=>x.trim()).filter(Boolean);
  return {id:c.id,subj:c.subject||'',tnames:ns,teacher:ns.map(n=>n+'T').join(' · '),class_name:c.name||'',
    time:timeText(c.days,c.time),desc:c.intro||'',recommend:c.recommend||'',period:c.period||'',
    status:c.status||'',kind:c.kind||'정규',gradeText:c.grade||'',grades:grades.length?grades:['기타']};
}
/* 방학특강 공개 기간 (원장님 결정 2026-11-13): 겨울 = 11월 15일 ~ 2월 말, 여름 = 7월 1일 ~ 8월 31일.
   기간 밖에는 시트에 있어도 홈페이지에 안 보임. 기간 안이라도 시트 상태가 '종강'이면 숨김. 날짜는 한국 시간 기준 */
const SEASON_OPEN={'겨울':md=>md>=1115||md<=229,'여름':md=>md>=701&&md<=831};
function seasonOpen(kind,now){
  const f=SEASON_OPEN[kind];if(!f)return true;
  const k=new Date((now||Date.now())+9*3600e3);   /* UTC → 한국 시간 */
  return f((k.getUTCMonth()+1)*100+k.getUTCDate());
}
function buildSchedule(data){
  const list=(data&&Array.isArray(data.classes)?data.classes:[])
    .filter(c=>c&&c.branch===BRANCH&&c.status!=='종강').map(toItem).filter(it=>seasonOpen(it.kind));
  const ko=k=>KIND_ORDER[k]==null?9:KIND_ORDER[k],so=s=>{const i=SUBJ_ORDER.indexOf(s);return i<0?99:i;};
  list.sort((a,b)=>ko(a.kind)-ko(b.kind)||so(a.subj)-so(b.subj));
  const out={},every=[];
  list.forEach(it=>{if(SEASON[it.kind])(out[VAC_KEY]=out[VAC_KEY]||[]).push(it);
    else if(it.grades.some(g=>ALL_GRADE.test(g)))every.push(it);
    else it.grades.forEach(g=>(out[g]=out[g]||[]).push(it));});
  SCHEDULE=out;
  /* 학년이 '전학년'인 반은 따로 버튼을 만들지 않고, 보이는 모든 학년 버튼(방학특강 제외)에 같이 넣음 */
  if(every.length){
    gradeKeys().filter(g=>g!==VAC_KEY).forEach(g=>{out[g]=(out[g]||[]).concat(every).sort((a,b)=>ko(a.kind)-ko(b.kind)||so(a.subj)-so(b.subj));});
  }
}
function gradeKeys(){
  const ks=[...GRADE_BASE];
  Object.keys(SCHEDULE).forEach(g=>{if(!ks.includes(g))ks.push(g);});
  const gi=g=>{const i=GRADE_ORDER.indexOf(g);return i<0?50:i;};
  return ks.sort((a,b)=>gi(a)-gi(b));
}
function allItems(){const seen={},out=[];gradeKeys().filter(g=>SCHEDULE[g]).forEach(g=>SCHEDULE[g].forEach(it=>{if(!seen[it.id]){seen[it.id]=1;out.push(it);}}));return out;}
function setUpdated(iso){
  const d=iso?new Date(iso):null,txt=d&&!isNaN(d)?`${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 기준`:'';
  document.querySelectorAll('.sched-updated').forEach(el=>{el.textContent=txt||'시간표 확인 중';});
  document.querySelectorAll('.sched-updated-wrap').forEach(el=>{el.style.display=txt?'':'none';});
}
function renderFilters(){
  const gb=document.getElementById('grade-btns'),sb=document.getElementById('subj-btns');
  if(schedState!=='ok'){gb.innerHTML='';sb.innerHTML='';return;}
  if(curGrade&&curGrade!=='전체'&&!gradeKeys().includes(curGrade))curGrade=null;
  gb.innerHTML=['전체',...gradeKeys()].map(g=>`<button type="button" class="sf-btn${curGrade===g?' on':''}" data-g="${esc(g)}">${esc(GRADE_LABEL[g]||g)}</button>`).join('');
  const subs=[];allItems().forEach(it=>{if(it.subj&&!subs.includes(it.subj))subs.push(it.subj);});
  const so=s=>{const i=SUBJ_ORDER.indexOf(s);return i<0?99:i;};subs.sort((a,b)=>so(a)-so(b));
  if(curSubj!=='전체'&&!subs.includes(curSubj))curSubj='전체';
  sb.innerHTML=['전체',...subs].map(s=>`<button type="button" class="ss-btn ${esc(s)}${curSubj===s?' on':''}" data-s="${esc(s)}">${esc(s)}</button>`).join('');
}
function badgeOf(it){
  if(it.status==='마감')return '<span class="sc-badge">마감</span>';
  if(['개강예정','개강대기','미정'].includes(it.status))return '<span class="sc-badge sc-new">개강 예정</span>';
  return '';
}
/* 개강·종강 칸: '기간' 머리말 없이 표시. 날짜 하나만 있으면 뒤에 '개강'을 붙인다 */
function periodText(p){p=String(p).trim();if(/개강|종강|~|∼|-\s*\d.*\d/.test(p)&&!/^\d{4}-\d{1,2}-\d{1,2}$/.test(p))return p;return p+' 개강';}
/* 반 카드 한 장 — 시간표·강사 상세 공용 */
function cardHtml(it,o){
  const c=SC_S[it.subj]||{bg:'#f5f5f5',text:'#444',border:'#bbb'},se=SEASON[it.kind];
  const gt=o.gradeChip?`<span class="d-sg">${esc(it.gradeText)}</span>`:'';
  const teacher=o.teacher&&it.teacher?`<div class="sc-teacher">${esc(it.teacher)}</div>`:'';
  const extra=(it.period?`<div class="sc-meta">${esc(periodText(it.period))}</div>`:'')+(it.recommend?`<div class="sc-meta"><b>추천</b> ${esc(it.recommend)}</div>`:'');
  return `<div class="s-card${se?' '+se.cls:''}" style="border-left-color:${c.border};${it.status==='마감'?'opacity:.5':''}"><div class="sc-subj" style="color:${c.text}">${esc(it.subj)}${gt}${se?se.badge:''}${badgeOf(it)}</div><div class="sc-class">${esc(it.class_name)}</div>${teacher}${it.time?`<span class="sc-time">${esc(it.time)}</span>`:''}${it.desc?`<div class="sc-desc">${esc(it.desc)}</div>`:''}${extra}</div>`;
}
function renderSchedule(){
  const grid=document.getElementById('sched-grid'),subjBar=document.getElementById('subj-btns');
  renderFilters();
  if(schedState==='loading'){subjBar.style.display='none';grid.innerHTML='<div class="sched-empty" style="grid-column:1/-1">시간표를 불러오는 중입니다…</div>';return;}
  if(schedState==='fail'){subjBar.style.display='none';grid.innerHTML='<div class="sched-empty" style="grid-column:1/-1">시간표 준비 중입니다.<br>블로그 또는 전화로 문의해 주세요.</div>';return;}
  if(!curGrade){
    subjBar.style.display='none';
    grid.innerHTML='<div class="sched-pick"><div class="sp-t">학년을 선택해 주세요.</div><div class="sp-row">'+gradeKeys().map(g=>{const n=(SCHEDULE[g]||[]).filter(i=>i.status!=='마감').length;return `<button type="button" class="sp-card" data-pick="${esc(g)}"><span class="sp-g">${esc(GRADE_LABEL[g]||g)}</span><span class="sp-n">${n?'수업 '+n+'개 →':'학원 문의 →'}</span></button>`;}).join('')+'</div></div>';
    grid.querySelectorAll('.sp-card').forEach(c=>c.addEventListener('click',()=>{curGrade=c.dataset.pick;renderSchedule();}));
    return;
  }
  subjBar.style.display='';
  const base=curGrade==='전체'?allItems():(SCHEDULE[curGrade]||[]);
  const items=base.filter(it=>curSubj==='전체'||it.subj===curSubj);
  if(!items.length){grid.innerHTML=`<div class="sched-empty" style="grid-column:1/-1">${base.length?'해당 조건의 수업이 없습니다.':'현재 안내 중인 수업이 없습니다. 학원으로 문의해 주세요.'}</div>`;return;}
  grid.innerHTML=items.map(it=>cardHtml(it,{teacher:true,gradeChip:(curGrade==='전체'||curGrade===VAC_KEY)&&it.gradeText&&it.gradeText!=='기타'})).join('');
}
function applyClasses(data){buildSchedule(data);schedState='ok';setUpdated(data.updated);renderSchedule();}
function loadSchedule(){
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CLASS_CACHE)||'null');}catch(e){}
  if(cached&&Array.isArray(cached.classes))applyClasses(cached);   /* 지난번 내용 먼저 보여 주고 */
  else{setUpdated(null);renderSchedule();}
  const ctl=window.AbortController?new AbortController():null,timer=setTimeout(()=>ctl&&ctl.abort(),12000);
  fetch(CLASS_API,ctl?{signal:ctl.signal}:{}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
    .then(data=>{clearTimeout(timer);if(!data||!Array.isArray(data.classes))throw new Error('format');
      try{localStorage.setItem(CLASS_CACHE,JSON.stringify(data));}catch(e){}
      applyClasses(data);})                                          /* 새 내용으로 바꿔 그림 */
    .catch(()=>{clearTimeout(timer);if(schedState!=='ok'){schedState='fail';setUpdated(null);renderSchedule();}});
}
document.getElementById('grade-btns').addEventListener('click',e=>{const btn=e.target.closest('.sf-btn');if(!btn)return;curGrade=curGrade===btn.dataset.g?null:btn.dataset.g;renderSchedule();});
document.getElementById('subj-btns').addEventListener('click',e=>{const btn=e.target.closest('.ss-btn');if(!btn)return;curSubj=btn.dataset.s;renderSchedule();});
loadSchedule();

/* Detail */
const dp=document.getElementById('page-detail');let savedScroll=0;
function openTeacher(idx){
  const t=TEACHERS[idx];const primaryC=SC[BG_SUBJ[t.name]||t.subjects[0]]||SC['국어'];
  {const h=primaryC.avatar.replace('#','');const mix=i=>Math.round(parseInt(h.substr(i,2),16)*.32+17*.68);
   dp.style.setProperty('--dc',primaryC.avatar);dp.style.setProperty('--dc-lt',primaryC.bg);
   dp.style.setProperty('--dh','rgb('+mix(0)+','+mix(2)+','+mix(4)+')');
   dp.style.setProperty('--dh-grad',gradOf(sCols(t,'avatar').map(darkOf),110));dp.style.setProperty('--dc-lt-grad',gradOf(sCols(t,'bg'),135));}
  document.getElementById('d-photo').src=PHOTO_DATA[t.name]||'';
  document.getElementById('d-subject').textContent=t.subjects.join(' · ');
  document.getElementById('d-breadcrumb').textContent=t.name+(t.team?' 프로필':' 강사 프로필');
  document.getElementById('d-name').innerHTML=t.name+(t.role?` <span class="detail-role-badge">${t.role}</span>`:'');
  document.getElementById('d-msg').textContent=t.msg?'"'+t.msg+'"':'';
  document.getElementById('d-tags').innerHTML=t.tags.slice(0,3).map(tg=>`<span class="detail-tag">${tg}</span>`).join('');
  {const st=document.getElementById('d-sch-title'),sb=document.getElementById('d-sched');
   const rows=allItems().filter(it=>it.tnames.includes(t.name));
   if(rows.length){st.style.display='';sb.innerHTML=rows.map(it=>cardHtml(it,{teacher:it.tnames.length>1,gradeChip:!SEASON[it.kind]})).join('');}
   else{st.style.display='none';sb.innerHTML='';}}
  document.getElementById('d-career').innerHTML=t.careerGroups?t.careerGroups.map(g=>`<div class="d-cr-h">${g.name}</div>`+g.items.map(c=>`<div class="d-cr">${c}</div>`).join('')).join(''):t.career.map(c=>`<div class="d-cr">${c}</div>`).join('');
  const bt=document.getElementById('d-blog-title');const bl=document.getElementById('d-blog-links');
  if(t.blogLinks&&t.blogLinks.length){bt.style.display='';bl.innerHTML=t.blogLinks.map(b=>`<a href="${b.url}" target="_blank" rel="noopener" class="blog-link-btn">${b.title} ↗</a>`).join('');}
  else{bt.style.display='none';bl.innerHTML='';}
  const vt=document.getElementById('d-vid-title');const vl=document.getElementById('d-vid-links');
  if(t.videos&&t.videos.length){vt.style.display='';vl.innerHTML=t.videos.map(v=>`<a href="https://youtu.be/${v.id}" target="_blank" rel="noopener" class="vid-card"><span class="vid-th"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy"/><span class="vid-play" aria-hidden="true"></span></span><span class="vid-t">${v.title} <span class="vid-yt">YouTube ↗</span></span></a>`).join('');}
  else{vt.style.display='none';vl.innerHTML='';}
  savedScroll=window.scrollY;document.body.style.overflow='hidden';dp.classList.add('open');dp.scrollTop=0;
}
function closeDetail(){dp.classList.remove('open');document.body.style.overflow='';window.scrollTo(0,savedScroll);}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dp.classList.contains('open'))closeDetail();});

/* Header & scroll */
const hd=document.getElementById('hd');const tb=document.getElementById('topbar');
const mbItems=document.querySelectorAll('.mb-item');
const sections=['teachers','curriculum','schedule','reviews','consult'];
let py=0;
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  hd.classList.toggle('scrolled',y>10);
  document.getElementById('stb').classList.toggle('on',y>400);
  /* 맨 위 바(지점 버튼)는 제자리에 두고, 메뉴 바만 따라 내려오며 화면 맨 위에 딱 붙는다 */
  hd.style.top=Math.max(0,tb.offsetHeight-y)+'px';
  let cur='';sections.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<200)cur=id;});
  mbItems.forEach(item=>item.classList.toggle('active',item.getAttribute('href')==='#'+cur));
  py=y;
},{passive:true});
const burger=document.getElementById('burger');const mob=document.getElementById('mob');
burger.addEventListener('click',()=>{burger.classList.toggle('on');mob.classList.toggle('on');document.body.style.overflow=mob.classList.contains('on')?'hidden':'';});
document.querySelectorAll('.ml,.ml2').forEach(l=>l.addEventListener('click',()=>{burger.classList.remove('on');mob.classList.remove('on');document.body.style.overflow='';}));
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -32px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));


/* ── POPUP ── */
(function(){
  const KEY=POPUP_KEY,today=new Date().toDateString(),pp=document.getElementById('popup');
  let skip=null;try{skip=localStorage.getItem(KEY);}catch(e){}
  if(skip!==today)setTimeout(()=>pp.classList.add('show'),500);
  const close=()=>pp.classList.remove('show');
  document.getElementById('pp-close').addEventListener('click',close);
  document.getElementById('pp-today').addEventListener('click',()=>{try{localStorage.setItem(KEY,today);}catch(e){}close();});
  pp.addEventListener('click',e=>{if(e.target===pp)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();

/* ══ 커리큘럼 (data/curriculum.js) ══ */
(function(){
 const root=document.getElementById('cu-root');if(!root||typeof CURRICULUM==='undefined')return;
 const SUBJ_COLOR={국어:['#FEF9C3','#854D0E','#EAB308'],수학:['#DCFCE7','#166534','#22C55E'],영어:['#FCE7F3','#9D174D','#EC4899'],사회:['#EDE9FE','#5B21B6','#7C3AED'],과학:['#E0F2FE','#075985','#0EA5E9'],논술:['#E4ECF7','#2F558C','#7C9FD0']};
 const ORDER=['국어','수학','영어','사회','과학','논술'],GORDER=['고1','고2','고3 (수능+내신)','고3·N수 (수능)'];
 const LINK=typeof CURRICULUM_BOOK_LINK!=='undefined'?CURRICULUM_BOOK_LINK:{};
 const list=CURRICULUM.slice().sort((a,b)=>ORDER.indexOf(a.subj)-ORDER.indexOf(b.subj));
 let si=0,gk='고1';
 const bk=t=>t.replace(/「[^」]+」/g,m=>`<b class="cu-bk">${m}</b>`);
 const ul=a=>`<ul>${a.map(t=>`<li>${bk(t)}</li>`).join('')}</ul>`;
 const dots=n=>`<div class="cu-dots">${Array.from({length:n},(_,j)=>`<i class="${j?'':'on'}"></i>`).join('')}</div>`;
 function row(r){
  const body=r.g?r.g.map(x=>`<h5>${x[0]}</h5>${ul(x[1])}`).join(''):(r.t?`<h5>${r.t}</h5>`:'')+ul(r.items);
  const side=r.aim?`<em>수업 중심 목표</em>${r.aim}`:`<em>클리닉</em>${r.clinic}`;
  return `<div class="cu-row ${r.k}"><div><div class="cu-when">${r.w}</div><span class="cu-tag">${r.tag}</span></div><div>${body}</div><div class="cu-aim">${side}</div></div>`;
 }
 function render(){
  const c=list[si],[bg,fg,ln]=SUBJ_COLOR[c.subj],gs=Object.keys(c.grades).sort((a,b)=>GORDER.indexOf(a)-GORDER.indexOf(b));
  if(!gs.includes(gk))gk=gs[0];const g=c.grades[gk];
  root.style.cssText=`--sb:${bg};--sc:${fg};--sl:${ln}`;
  const main=g.tbd?`<div class="cu-tbd"><b>${c.subj} ${gk} 커리큘럼을 준비하고 있습니다</b>자세한 내용은 상담에서 안내해 드립니다.</div>`:`
   <div class="cu-head"><small>${c.subj} · ${gk}</small><div class="cu-slogan">${g.slogan}</div>${g.sub?`<div class="cu-course">${g.sub}</div>`:''}</div>
   <div class="cu-body">
    <div class="cu-sub">학습 단계</div>
    <div class="cu-steps">${g.steps.map(s=>`<div><b>${s[0]}</b><strong>${s[1]}</strong><span>${s[2]}</span></div>`).join('')}</div>
    <div class="cu-sub">수업 목표</div>
    <div class="cu-goals">${g.goals.map(x=>`<div class="cu-goal"><h4>${x[0]}</h4><p>${x[1].join(' ')}</p></div>`).join('')}</div>${dots(g.goals.length)}
    <div class="cu-sub">연간 로드맵</div>
    <div class="cu-tl">${g.rows.map(row).join('')}</div>${dots(g.rows.length)}
    <div class="cu-sub">관리 시스템</div>
    <div class="cu-care">${g.care.map(x=>`<span>${x}</span>`).join('')}</div>
   </div>`;
  root.innerHTML=`<div class="cu-tabs">${list.map((x,i)=>{const s=SUBJ_COLOR[x.subj];return `<button type="button" class="cu-tab${i===si?' on':''}" style="--sb:${s[0]};--sc:${s[1]};--sl:${s[2]}" data-s="${i}">${x.subj}</button>`}).join('')}</div>
  <div class="cu-box"><div class="cu-grades">${gs.map(k=>`<button type="button" class="cu-gbtn${k===gk?' on':''}" data-g="${k}">${k}</button>`).join('')}</div>
  ${main}
  <div class="cu-foot"><span>내신 대비 기간은 학교별 학사일정에 따라 조정됩니다. 반 편성은 레벨테스트 후 배정합니다.</span><div class="cu-foot-btns">${LINK[c.subj]?`<a class="lab" href="${LINK[c.subj]}">${c.subj} 자체 교재 보기 →</a>`:''}<a href="#schedule">${c.subj} 시간표 보기 →</a></div></div></div>`;
  root.querySelectorAll('.cu-goals,.cu-tl').forEach(f=>f.addEventListener('scroll',()=>{const st=f.children,w=st[0].offsetWidth+10,n=Math.min(Math.round(f.scrollLeft/w),st.length-1);f.nextElementSibling.querySelectorAll('i').forEach((d,i)=>d.classList.toggle('on',i===n))}));
 }
 root.addEventListener('click',e=>{const t=e.target.closest('.cu-tab');if(t){si=+t.dataset.s;render();return}
  const g=e.target.closest('.cu-gbtn');if(g){gk=g.dataset.g;render()}});
 render();
})();
