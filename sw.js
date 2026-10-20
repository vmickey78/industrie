// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
// Ne touche jamais à la sauvegarde (stockée à part, dans le navigateur et sur OneDrive).
const C='industrie-cache'; // v2 : toujours revalider auprès du serveur (évite les anciennes versions)
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request.url,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
