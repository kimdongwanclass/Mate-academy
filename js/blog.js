/* 블로그 새 글 목록 (목동·김포 공용)
   <section id="blog" data-blog="블로그아이디" data-count="5"> 안의 #blog-list 를 채움
   - 데이터: /api/blog?id=… (netlify/functions/blog.mjs)
   - 마지막으로 받은 목록을 브라우저에 저장해 두고 먼저 보여 줌 → 느리거나 실패해도 빈칸이 안 생김
   - 저장된 것도 없고 불러오기도 실패하면 칸 전체를 숨김 (아래 '블로그 바로가기' 카드는 그대로) */
(function(){
  const sec=document.querySelector('section[data-blog]');if(!sec)return;
  const id=sec.dataset.blog,count=+sec.dataset.count||5;
  const list=sec.querySelector('#blog-list');
  const KEY='blog_cache_'+id;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const NEW_DAYS=7;

  function fmt(iso){
    const d=new Date(iso);if(isNaN(d))return '';
    return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
  }
  function render(items){
    if(!items||!items.length)return false;
    const now=Date.now();
    list.innerHTML=items.slice(0,count).map(it=>{
      const isNew=it.date&&(now-new Date(it.date))<NEW_DAYS*864e5;
      return `<a class="bl-item" href="${esc(it.link)}" target="_blank" rel="noopener">`+
        (it.category?`<span class="bl-cat">${esc(it.category)}</span>`:'')+
        `<span class="bl-title">${esc(it.title)}${isNew?'<span class="bl-new">NEW</span>':''}</span>`+
        `<span class="bl-date">${fmt(it.date)}</span><span class="bl-arr">↗</span></a>`;
    }).join('');
    sec.hidden=false;return true;
  }

  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  const shown=render(cached&&cached.items);

  /* 미리보기 파일(file://)에서는 예시 글을 넣어 둔 window.BLOG_SAMPLE 사용 */
  if(location.protocol==='file:'){if(window.BLOG_SAMPLE)render(window.BLOG_SAMPLE);else if(!shown)sec.hidden=true;return;}

  fetch('/api/blog?id='+encodeURIComponent(id))
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{if(render(d.items)){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}else if(!shown)sec.hidden=true;})
    .catch(()=>{if(!shown)sec.hidden=true;});
})();
