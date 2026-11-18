/* 네이버 블로그 새 글 목록 (제목·링크·날짜·카테고리만)
   주소: /api/blog?id=edumate_mokdong  또는  /api/blog?id=yourmate_gimpo
   - 네이버 RSS(rss.blog.naver.com/아이디.xml)를 Netlify 서버에서 읽어 JSON으로 돌려줌
     (브라우저에서 네이버를 바로 부르면 보안 정책에 막히기 때문)
   - 10분 동안은 Netlify가 저장해 둔 결과를 그대로 보여 줌 → 네이버·함수 호출이 거의 없음
   - 아래 BLOGS에 있는 아이디만 허용 (다른 블로그를 대신 읽어 주는 통로가 되지 않게) */

const BLOGS = ['edumate_mokdong', 'yourmate_gimpo'];
const MAX = 10;

const json = (body, status, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': cache,
    },
  });

function pick(block, tag) {
  const m = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
  if (!m) return '';
  return m[1]
    .replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .trim();
}

export default async (req) => {
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!BLOGS.includes(id)) return json({ error: 'unknown blog' }, 400, 'no-store');

  try {
    const res = await fetch('https://rss.blog.naver.com/' + id + '.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (mate4u.netlify.app blog list)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error('rss ' + res.status);
    const xml = await res.text();

    const items = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, MAX).map((b) => {
      const link = pick(b, 'link').split('?')[0];          /* 추적용 꼬리(?fromRss=…) 제거 */
      const d = new Date(pick(b, 'pubDate'));
      return {
        title: pick(b, 'title'),
        link: /^https:\/\/(m\.)?blog\.naver\.com\//.test(link) ? link : 'https://blog.naver.com/' + id,
        date: isNaN(d) ? '' : d.toISOString(),
        category: pick(b, 'category'),
      };
    }).filter((x) => x.title);

    return json({ blog: id, updated: new Date().toISOString(), items }, 200,
      'public, s-maxage=600, stale-while-revalidate=86400');
  } catch (e) {
    return json({ error: 'fetch failed' }, 502, 'public, s-maxage=60');
  }
};

export const config = { path: '/api/blog' };
