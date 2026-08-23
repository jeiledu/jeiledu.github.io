/* =====================================================================
   서비스 워커 — 화면 파일을 기기에 저장해 두고,
   인터넷이 끊겨도 앱이 열리고 타이머가 돌게 합니다.

   ※ 평소에는 아무것도 안 하셔도 됩니다.
      index.html · admin.html · config.js 는 인터넷을 항상 먼저 보고,
      받아올 때마다 저장본도 같이 새로 고쳐집니다. (저절로 최신이 됩니다)

      아래 VERSION 은 "이 sw.js 파일 자체를 고칠 때" 만 올리면 됩니다.
      그마저도 파일이 바뀌면 브라우저가 알아서 새 워커를 깔기 때문에,
      옛날 저장본을 확실히 버리고 싶을 때만 쓰는 안전장치입니다.
   ===================================================================== */
const VERSION = "v1";
const CACHE   = "jeil-" + VERSION;

// 미리 저장해 둘 파일들
const SHELL = [
  "./", "./index.html", "./config.js", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", (e)=>{
  e.waitUntil((async ()=>{
    const c = await caches.open(CACHE);
    // 하나라도 실패하면 설치가 통째로 실패하므로 한 개씩 담습니다
    await Promise.all(SHELL.map(u=> c.add(u).catch(()=>{})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k=> k.startsWith("jeil-") && k !== CACHE).map(k=> caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch(_){ return; }

  // Supabase 서버, 유튜브, CDN 은 건드리지 않습니다.
  // (특히 Supabase 를 저장해 버리면 오래된 글이 보이거나
  //  로그인 상태가 꼬일 수 있어서 반드시 그냥 통과시킵니다)
  if (url.origin !== location.origin) return;

  // 바뀔 수 있는 것은 항상 인터넷을 먼저 봅니다 → 버전 관리가 필요 없습니다.
  // 그림처럼 안 바뀌는 것만 저장본을 먼저 씁니다.
  const fresh = req.mode === "navigate"
             || url.pathname.endsWith(".html")
             || url.pathname.endsWith("/")
             || url.pathname.endsWith("config.js")
             || url.pathname.endsWith("manifest.json");

  e.respondWith(fresh ? pageFirst(req) : fileFirst(req));
});

/* 인터넷을 먼저 본다 → 안 되면 저장해 둔 것.
   성공할 때마다 저장본을 덮어써서, 다음에 오프라인이 되면 최신이 나옵니다.
   덕분에 화면을 고쳐 올려도 따로 손댈 게 없습니다. */
async function pageFirst(req){
  const cache = await caches.open(CACHE);
  try{
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }catch(_){
    const hit = await cache.match(req);
    if (hit) return hit;
    if (req.mode === "navigate"){
      const home = await cache.match("./index.html") || await cache.match("./");
      if (home) return home;
    }
    return new Response("인터넷에 연결되어 있지 않아요.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}

/* 그림(아이콘): 저장해 둔 것을 먼저 보여주고, 뒤에서 조용히 새로 받아둔다 */
async function fileFirst(req){
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit){
    fetch(req).then(res=>{ if (res && res.ok) cache.put(req, res.clone()); }).catch(()=>{});
    return hit;
  }
  try{
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }catch(_){
    return new Response("", { status: 503 });
  }
}

self.addEventListener("message", (e)=>{
  if (e.data === "skipWaiting") self.skipWaiting();
});
