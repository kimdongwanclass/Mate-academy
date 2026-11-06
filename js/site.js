/* 메이트 학원 지점 페이지 공통 기능 (목동·김포 공용) */
const SUBJ_ORDER=['국어','수학','영어','사회','과학'];
{const base=TEACHERS.map((t,k)=>{const si=SUBJ_ORDER.indexOf(t.subjects[0]);return {t,k:T_FIRST.includes(t.name)?T_FIRST.indexOf(t.name):100+(si<0?99:si)*100+k};});
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

/* Schedule */

const LV_T={'★':'상위권 가능','●':'추천','○':'노베 추천'};
function mergeW(items){const out=[],wo=[],seen={};items.forEach(it=>{if(!it.winter){out.push(it);return;}const k=it.class_name;if(seen[k]){seen[k].lvs=seen[k].lvs.concat(it.lvs);seen[k].grade+='·'+it.grade;return;}const c={...it,lvs:[...it.lvs]};seen[k]=c;wo.push(c);});return out.concat(wo);}
function wExtra(it,showLv){if(!it.winter)return '';const lvs=showLv?it.lvs.filter(([g,m])=>m!=='●'):[];const lv=!lvs.length?'':`<div class="sc-lv">${lvs.map(([g,m])=>`<span class="lv-chip">${LV_T[m]}</span>`).join('')}</div>`;return lv+(it.link?`<a class="sc-link" href="${it.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">블로그에서 자세히 보기 ↗</a>`:'');}
const W_BADGE='<span class="sc-badge sc-winter">❄ 겨울방학 특강</span>';
const SC_S={
  '국어':{bg:'#FEF9C3',text:'#854D0E',border:'#EAB308'},
  '수학':{bg:'#DCFCE7',text:'#166534',border:'#22C55E'},
  '영어':{bg:'#FCE7F3',text:'#9D174D',border:'#EC4899'},
  '사회':{bg:'#EDE9FE',text:'#5B21B6',border:'#7C3AED'},
  '과학':{bg:'#E0F2FE',text:'#075985',border:'#0EA5E9'},
  '논술':{bg:'#E4ECF7',text:'#2F558C',border:'#7C9FD0'},
};

let curGrade=null,curSubj='전체';
function renderSchedule(){
  const grid=document.getElementById('sched-grid');
  if(!curGrade){
    document.getElementById('subj-btns').style.display='none';
    const gb=[...document.querySelectorAll('#grade-btns .sf-btn')].filter(b=>b.dataset.g!=='전체');
    grid.innerHTML='<div class="sched-pick"><div class="sp-t">학년을 선택해 주세요.</div><div class="sp-row">'+gb.map(b=>{const list=(SCHEDULE[b.dataset.g]||[]).filter(i=>!i.closed&&!i.any);return `<button type="button" class="sp-card" data-pick="${b.dataset.g}"><span class="sp-g">${b.textContent}</span><span class="sp-n">${list.length?'수업 '+list.length+'개 →':'학원 문의 →'}</span></button>`;}).join('')+'</div></div>';
    grid.querySelectorAll('.sp-card').forEach(c=>c.addEventListener('click',()=>document.querySelector('#grade-btns .sf-btn[data-g="'+c.dataset.pick+'"]').click()));
    return;
  }
  document.getElementById('subj-btns').style.display='';
  let items=[];
  const grades=curGrade==='전체'?Object.keys(SCHEDULE):Object.keys(SCHEDULE).filter(g=>g===curGrade);
  grades.forEach(g=>SCHEDULE[g].forEach(item=>{if(curSubj==='전체'||item.subj===curSubj||item.any)items.push({...item,grade:g});}));
  items=mergeW(items);
  if(!items.length){grid.innerHTML='<div class="sched-empty" style="grid-column:1/-1">해당 조건의 수업이 없습니다.</div>';return;}
  grid.innerHTML=items.map(it=>{
    const c=SC_S[it.subj]||{bg:'#f5f5f5',text:'#444',border:'#bbb'};
    const gt=curGrade==='전체'?`<span style="font-size:10px;background:var(--bg);padding:2px 6px;border-radius:3px;color:var(--t4);margin-left:5px">${it.grade}</span>`:'';
    const badge=it.closed?'<span class="sc-badge">마감</span>':it.status==='dec'?`<span class="sc-badge sc-new">${it.badge||'12월 개강'}</span>`:it.status==='wait'?'<span class="sc-badge sc-wait">개강 예정</span>':it.isNew?'<span class="sc-badge sc-new">신규</span>':'';
    const desc=it.desc?`<div class="sc-desc">${it.desc}</div>`:'';
    const teacher=it.teacher?`<div class="sc-teacher">${it.teacher}</div>`:'';
    return `<div class="s-card${it.winter?' s-winter':''}" style="border-left-color:${c.border};${it.closed?'opacity:.5':''}"><div class="sc-subj" style="color:${c.text}">${it.subj}${gt}${it.winter?W_BADGE:''}${badge}</div><div class="sc-class">${it.class_name}</div>${teacher}<span class="sc-time">${it.time}</span>${desc}${wExtra(it,curGrade!=='전체')}</div>`;
  }).join('');
}
renderSchedule();
document.getElementById('grade-btns').addEventListener('click',e=>{const btn=e.target.closest('.sf-btn');if(!btn)return;const was=btn.classList.contains('on');document.querySelectorAll('.sf-btn').forEach(b=>b.classList.remove('on'));if(was){curGrade=null;}else{btn.classList.add('on');curGrade=btn.dataset.g;}renderSchedule();});
document.getElementById('subj-btns').addEventListener('click',e=>{const btn=e.target.closest('.ss-btn');if(!btn)return;document.querySelectorAll('.ss-btn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');curSubj=btn.dataset.s;renderSchedule();});

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
  {const st=document.getElementById('d-sch-title'),sb=document.getElementById('d-sched');const rows=[];
   Object.keys(SCHEDULE).forEach(g=>SCHEDULE[g].forEach(it=>{if(it.any||!it.teacher)return;const ns=it.teacher.split('·').map(x=>x.trim().replace(/T$/,''));if(ns.includes(t.name))rows.push({...it,grade:g});}));
   rows.splice(0,rows.length,...mergeW(rows));
   if(rows.length){st.style.display='';sb.innerHTML=rows.map(it=>{const c=SC_S[it.subj]||{text:'#444',border:'#bbb'};
     const badge=it.closed?'<span class="sc-badge">마감</span>':it.status==='dec'?`<span class="sc-badge sc-new">${it.badge||'12월 개강'}</span>`:it.status==='wait'?'<span class="sc-badge sc-wait">개강 예정</span>':it.isNew?'<span class="sc-badge sc-new">신규</span>':'';
     const co=it.teacher.includes('·')?`<div class="sc-teacher">${it.teacher}</div>`:'';
     return `<div class="s-card${it.winter?' s-winter':''}" style="border-left-color:${c.border};${it.closed?'opacity:.5':''}"><div class="sc-subj" style="color:${c.text}">${it.subj}${it.winter?'':`<span class="d-sg">${it.grade}</span>`}${it.winter?W_BADGE:''}${badge}</div><div class="sc-class">${it.class_name}</div>${co}<span class="sc-time">${it.time}</span>${it.desc?`<div class="sc-desc">${it.desc}</div>`:''}${wExtra(it,false)}</div>`;}).join('');}
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
const sections=['teachers','about','schedule','reviews','consult'];
let py=0;
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  hd.classList.toggle('scrolled',y>10);
  document.getElementById('stb').classList.toggle('on',y>400);
  if(y>120){const dn=y>py;tb.style.cssText=dn?'transform:translateY(-100%);transition:transform .3s':'transform:none;transition:transform .3s';hd.style.top=dn?'0':'40px';}
  else{tb.style.cssText='';hd.style.top='40px';}
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
