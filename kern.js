"use strict";
// Kinder, Speicher und Abgleich. Ein Datensatz je Kind: {stand, vok, verlauf, zeit, reset}.
// Abgleich (wahlfrei): private GitHub-Ablage, je Kind eine Datei. Ohne Abgleich bleibt alles auf dem Geraet.
const KERN=(()=>{
const lies=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
const setz=(k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
const kopie=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));

// ---------- Geraet und Familie ----------
let geraet=Object.assign({token:"",repo:"johannesschenk193/englisch-spielstand",nur:0},lies("et:geraet",{}));
// kinder: alle je angelegten Nummern, weg: entfernte. Eine Nummer wird nie wieder vergeben, sonst kaeme ein alter Stand zurueck.
const VOR={namen:{1:"Jonathan",2:"Kind 2",3:"Kind 3",4:"Kind 4"},bild:{1:"🦊",2:"🐼",3:"🐯",4:"🐸"},pin:"",salz:"",kinder:[1,2,3,4],weg:[]};
let familie=lies("et:familie",null);
const fam=()=>{ const f=familie||{}; return {...VOR,...f,namen:{...VOR.namen,...f.namen},bild:{...VOR.bild,...f.bild},kinder:f.kinder||VOR.kinder,weg:f.weg||[]}; };
const kinder=()=>{ const f=fam(); return f.kinder.filter(n=>!f.weg.includes(n)).sort((a,b)=>a-b); };
const alleNummern=()=>{ const f=fam(); return [...new Set([...f.kinder,...f.weg])]; };
function setzFamilie(x){ familie={...(familie||{}),...x}; setz("et:familie",familie); plane(1500); }
function neuesKind(name,bild){ const f=fam(), n=Math.max(0,...alleNummern())+1;
  setzFamilie({kinder:[...f.kinder,n],namen:{...f.namen,[n]:name},bild:{...f.bild,[n]:bild}}); return n; }
function entferneKind(n){ const f=fam(); zuruecksetzen(n); setzFamilie({weg:[...new Set([...f.weg,n])]});
  if(geraet.nur===n) setzGeraet({nur:0}); if(lies("et:kind",0)===n) setz("et:kind",null); }
function setzGeraet(x){ geraet={...geraet,...x}; setz("et:geraet",geraet); }

// ---------- Daten je Kind ----------
const leer=()=>({stand:{},vok:{},verlauf:[],zeit:{},reset:0});
const daten=n=>Object.assign(leer(),lies("et:k"+n,{}));
let nr=geraet.nur||lies("et:kind",0); if(!(kinder().includes(nr)||nr&&nr===geraet.nur&&!fam().weg.includes(nr))) nr=0;
let D=nr?daten(nr):leer();
const sichere=()=>{ if(nr) setz("et:k"+nr,D); };
function speichere(teil,wert){ if(!nr) return; D[teil]=wert; sichere(); plane(20000); }
const heute=()=>{ const d=new Date(); return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5); };
function log(was,gut,von,art){ if(!nr||!von) return; D.verlauf.push({t:Date.now(),w:was,g:gut,v:von,a:art||""}); D.verlauf=D.verlauf.slice(-400); sichere(); plane(3000); }
function waehle(n){ setz("et:kind",n||null); location.reload(); }
function ersetze(n,d){ setz("et:k"+n,d); if(n===nr){ D=daten(nr); neu(); } plane(1500); }
function zuruecksetzen(n,teil){ // teil: "stand" (Grammatik), "vok" (Vokabeln) oder leer fuer alles
  const alt=n===nr?D:daten(n), x={...leer(),reset:Date.now()};
  if(teil){ Object.assign(x,kopie(alt)); x[teil]={}; x.reset=Date.now(); x.verlauf=(alt.verlauf||[]).filter(v=>teil==="vok"?v.a!=="vokabeln"&&v.a!=="test":v.a==="vokabeln"||v.a==="test"); }
  // Einstellungen der Eltern bleiben: Tagesziel, Auswahl, Testtermin
  if(teil!=="stand") for(const k of ["ziel","nach","wahl","aus","test"]) if(alt.vok?.[k]!==undefined) x.vok[k]=kopie(alt.vok[k]);
  ersetze(n,x); }
let beiNeu=()=>{}; const neu=()=>{ try{ beiNeu(D); }catch(e){ console.error(e); } };
addEventListener("storage",e=>{ if(nr&&e.key==="et:k"+nr&&e.newValue){ D=daten(nr); neu(); } });
// Uebungszeit: nur, wenn die Seite offen ist und in der letzten Minute etwas passiert ist
let zuletzt=0; for(const e of ["pointerdown","keydown"]) addEventListener(e,()=>zuletzt=Date.now(),{passive:true,capture:true});
setInterval(()=>{ if(nr&&!document.hidden&&Date.now()-zuletzt<60000&&document.body?.dataset.modus!=="menue"){ const h=heute(); D.zeit[h]=(D.zeit[h]||0)+15; sichere(); } },15000);

// ---------- Zusammenfuehren zweier Staende (b = letzter gemeinsamer Stand, l = hier, r = Ablage) ----------
const J=JSON.stringify, istObj=x=>x&&typeof x==="object"&&!Array.isArray(x);
function misch(b,l,r,p=[]){
  if(J(l)===J(r)) return l; if(J(l)===J(b)) return r; if(J(r)===J(b)) return l;
  if(p.length===0&&istObj(l)&&istObj(r)&&(l.reset||0)!==(r.reset||0)) return (l.reset||0)>(r.reset||0)?l:r;
  const [p0,p1]=p;
  if(p0==="zeit"&&p.length===2) return (l||0)+(r||0)-(b||0);
  if(l===undefined) return r; if(r===undefined) return l;
  if(p0==="vok"&&p1==="w"&&p.length===3){ const s=x=>x.r+x.h+x.x; return s(l)>=s(r)?l:r; }
  if((p0==="kinder"||p0==="weg")&&p.length===1&&Array.isArray(l)&&Array.isArray(r)) return [...new Set([...l,...r])].sort((x,y)=>x-y);
  if(p0==="vok"&&p1==="heute"&&p.length===2) return l.tag!==r.tag?(l.tag>r.tag?l:r):{tag:l.tag,ids:[...new Set([...l.ids,...r.ids])]};
  if(p0==="vok"&&p1==="neu") return l.tag!==r.tag?(l.tag>r.tag?l:r):{tag:l.tag,n:Math.max(l.n,r.n)};
  if(p0==="stand"&&p1==="weiter"&&p.length===3) return l;
  if(Array.isArray(l)&&Array.isArray(r)){
    if(p0==="verlauf"){ const m=new Map([...l,...r].map(x=>[x.t+x.w,x])); return [...m.values()].sort((x,y)=>x.t-y.t).slice(-400); }
    if(p0==="vok"&&p1==="tage") return [...new Set([...l,...r])].sort((x,y)=>x-y);
    return b===undefined?(r.length?r:l):l;
  }
  if(istObj(l)&&istObj(r)){ const z={}; for(const k of new Set([...Object.keys(l),...Object.keys(r)])){ const v=misch(istObj(b)?b[k]:undefined,l[k],r[k],[...p,k]); if(v!==undefined) z[k]=v; } return z; }
  if(typeof l==="number"&&typeof r==="number") return Math.max(l,r);
  if(typeof l==="boolean") return l||r;
  if(typeof l==="string"&&typeof r==="string"){ if(b!==undefined) return l; return p0==="stand"?(l.length>=r.length?l:r):(r||l); }
  return b===undefined?r:l;
}

// ---------- Abgleich mit der privaten Ablage ----------
let status={t:0,text:"",gut:true}, melde=()=>{}, uhr=0, laeuft=false, nochmal=false;
const verbunden=()=>!!geraet.token;
const kopf=()=>({Authorization:"Bearer "+geraet.token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"});
const zu64=s=>{ const u=new TextEncoder().encode(s); let x=""; for(let i=0;i<u.length;i+=8192) x+=String.fromCharCode(...u.subarray(i,i+8192)); return btoa(x); };
const von64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),c=>c.charCodeAt(0)));
const url=(d)=>`https://api.github.com/repos/${geraet.repo}/contents/${d}.json`;
async function hole(d){
  const r=await fetch(url(d),{headers:kopf(),cache:"no-store"});
  if(r.status===404) return {data:undefined,sha:undefined};
  if(!r.ok) throw Error(r.status===401?"Der Schlüssel gilt nicht mehr.":r.status===403?"Der Schlüssel darf hier nicht schreiben.":"GitHub antwortet mit "+r.status);
  const j=await r.json(); return {data:JSON.parse(von64(j.content)),sha:j.sha};
}
async function lege(d,data,sha,keep){
  return fetch(url(d),{method:"PUT",headers:kopf(),keepalive:!!keep,body:J({message:d+" "+new Date().toLocaleString("de-DE"),content:zu64(J(data)),sha})});
}
async function gleicheAb(d,lesenLokal,schreibLokal){
  for(let v=0;v<4;v++){
    const {data,sha}=await hole(d), basis=lies("et:basis:"+d,undefined), l=lesenLokal();
    if(l===undefined&&data===undefined) return;
    const m=misch(basis,l,data);
    if(J(m)!==J(l)) schreibLokal(m);
    if(J(m)===J(data)){ setz("et:basis:"+d,m); return; }
    const r=await lege(d,m,sha);
    if(r.ok){ setz("et:basis:"+d,m); return; }
    if(r.status!==409&&r.status!==422) throw Error(r.status===403||r.status===404?"Der Schlüssel darf hier nicht schreiben.":"GitHub antwortet mit "+r.status);
    await new Promise(f=>setTimeout(f,400*(v+1)));
  }
  throw Error("Zu viele Geräte gleichzeitig, gleich noch einmal.");
}
const hatInhalt=d=>d&&(d.reset||d.verlauf?.length||Object.keys(d.stand||{}).length||Object.keys(d.vok||{}).length);
async function abgleich(alle){
  if(!verbunden()) return false;
  if(laeuft){ nochmal=true; return false; }
  laeuft=true; clearTimeout(uhr); uhr=0;
  try{
    await gleicheAb("familie",()=>familie||undefined,m=>{ familie=m; setz("et:familie",m); });
    const liste=geraet.nur?[geraet.nur]:alle||!nr?alleNummern():[nr];
    for(const n of liste) await gleicheAb("kind"+n,()=>{ const d=n===nr?D:daten(n); return hatInhalt(d)?kopie(d):undefined; },
      m=>{ setz("et:k"+n,m); if(n===nr){ D=daten(nr); neu(); } });
    status={t:Date.now(),text:"abgeglichen",gut:true};
  }catch(e){ status={t:Date.now(),text:e instanceof TypeError?"kein Netz, wird nachgeholt":e.message,gut:false}; }
  laeuft=false; melde(status);
  if(nochmal){ nochmal=false; plane(1000); }
  return status.gut;
}
function plane(ms){ if(!verbunden()) return; const z=Date.now()+ms; if(uhr&&plane.z<=z) return; clearTimeout(uhr); plane.z=z; uhr=setTimeout(()=>{ uhr=0; abgleich(); },ms); }
async function pruefe(token){ // darf der Schluessel die Ablage lesen und schreiben?
  try{ const r=await fetch(`https://api.github.com/repos/${geraet.repo}`,{headers:{...kopf(),Authorization:"Bearer "+token},cache:"no-store"});
    if(r.status===401) return "Diesen Schlüssel kennt GitHub nicht. Ist er vollständig kopiert?";
    if(r.status===404) return "Der Schlüssel sieht die Ablage nicht. Beim Erstellen unter „Only select repositories“ englisch-spielstand auswählen.";
    if(!r.ok) return "GitHub antwortet mit "+r.status;
    return ""; }catch(e){ return "Kein Netz."; }
}
const CODE="ET1.";
const codeFuer=n=>CODE+zu64(J({t:geraet.token,r:geraet.repo,k:n})).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
function ausCode(c){ try{ c=String(c).trim(); const i=c.indexOf(CODE); if(i<0) return null; const j=JSON.parse(von64(c.slice(i+CODE.length).replace(/-/g,"+").replace(/_/g,"/"))); return j.t?j:null; }catch(e){ return null; } }
function trenne(){ setzGeraet({token:""}); setz("et:basis:familie",null); for(const n of alleNummern()) setz("et:basis:kind"+n,null); }
addEventListener("online",()=>plane(500));
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ if(uhr||laeuft) abgleich(); } else if(Date.now()-status.t>60000) plane(300); });
addEventListener("load",()=>plane(400));

// ---------- Eltern-PIN (haelt Kinder fern, ist kein Tresor) ----------
async function hash(pin,salz){ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(salz+":"+pin)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
async function setzPin(pin){ const salz=Math.random().toString(36).slice(2); setzFamilie({salz,pin:await hash(pin,salz)}); }
const pinOk=async pin=>(await hash(pin,fam().salz))===fam().pin;

return {kinder,alleNummern,neuesKind,entferneKind,lies,setz,fam,setzFamilie,setzGeraet,daten,speichere,log,waehle,ersetze,zuruecksetzen,heute,misch,abgleich,pruefe,verbunden,codeFuer,ausCode,trenne,setzPin,pinOk,leer,hatInhalt,
  get nr(){return nr;}, get D(){return D;}, get geraet(){return geraet;}, get status(){return status;},
  set beiNeu(f){beiNeu=f;}, set melde(f){melde=f;}};
})();
