/* 메뉴를 눌러야 그 칸이 보이는 방식 (목동·김포·메이트랩 공용)
   - data-tab 이 붙은 section 은 처음에 숨겨 두고, 메뉴(#아이디 링크)를 누르면 그 칸 하나만 보여 줌
   - 주소 뒤 #아이디 로 들어오면 그 칸이 열린 채로 시작 (예: mokdong.html#schedule)
   - 뒤로 가기 하면 직전 칸으로 돌아감. #hero(로고) 를 누르면 모두 닫고 맨 위로 */
(function(){
  const panels=[...document.querySelectorAll('section[data-tab]')];
  if(!panels.length)return;
  const ids=panels.map(p=>p.id);
  const hd=document.getElementById('hd');
  function panelOf(id){
    if(!id)return null;
    const el=document.getElementById(id);if(!el)return null;
    return panels.find(p=>p===el||p.contains(el))||null;
  }
  function mark(cur){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      const id=a.getAttribute('href').slice(1);
      if(ids.includes(id))a.classList.toggle('on',cur===id);
    });
  }
  function show(id,scroll){
    const p=panelOf(id);
    panels.forEach(x=>x.classList.toggle('tab-on',x===p));
    mark(p?p.id:null);
    if(p)window.dispatchEvent(new Event('resize'));   /* 숨어 있던 칸(수강후기 넘김 등) 크기 다시 계산 */
    if(!scroll)return;
    const target=id&&document.getElementById(id);
    if(p&&target){
      const off=(hd?hd.offsetHeight:0)+8;
      window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-off,behavior:'smooth'});
    }else if(!id||id==='hero'){
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const id=a.getAttribute('href').slice(1);
    if(id!=='hero'&&!panelOf(id))return;            /* 그 밖의 링크(#consult 등)는 원래대로 */
    e.preventDefault();
    if(location.hash!=='#'+id)history.pushState(null,'',id==='hero'?location.pathname+location.search:'#'+id);
    show(id==='hero'?null:id,true);
  });
  window.addEventListener('popstate',()=>show(location.hash.slice(1),true));
  show(location.hash.slice(1),!!panelOf(location.hash.slice(1)));
})();
