// Offline-Betrieb: Programm zuerst aus dem Netz, ohne Netz aus dem Speicher. Aufnahmen zuerst aus dem Speicher.
const NAME="englisch-trainer-7";
const KERN=["./","index.html","stil.css","optik.css","kern.js","spiel.js","vokabelliste.js","vokabeln.js","mathe.js","app.js","audio/liste.js","manifest.webmanifest","icon-192.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(KERN)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith("englisch-trainer-")&&n!==NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin) return;
  if(u.pathname.endsWith(".mp3")){
    // Safari fragt Ton in Stuecken an (Range): ganze Datei speichern, passendes Stueck liefern
    e.respondWith((async()=>{
      const c=await caches.open(NAME); let r=await c.match(u.pathname);
      if(!r){ r=await fetch(u.pathname); if(r.ok) await c.put(u.pathname,r.clone()); else return r; }
      const b=e.request.headers.get("range"), m=b&&/bytes=(\d+)-(\d*)/.exec(b); if(!m) return r;
      const a=await r.arrayBuffer(), von=+m[1], bis=m[2]?Math.min(+m[2],a.byteLength-1):a.byteLength-1;
      return new Response(a.slice(von,bis+1),{status:206,headers:{"Content-Type":"audio/mpeg","Accept-Ranges":"bytes","Content-Range":`bytes ${von}-${bis}/${a.byteLength}`,"Content-Length":String(bis-von+1)}});
    })()); return;
  }
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const k=r.clone(); caches.open(NAME).then(c=>c.put(u.pathname,k)); } return r; })
    .catch(async()=>(await caches.match(u.pathname))||(e.request.mode==="navigate"?caches.match("./"):Response.error())));
});
