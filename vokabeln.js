"use strict";
// Vokabeltrainer im Englisch-Trainer. Nutzt $, mischen, sag, piep, sprich, zeige, ruhe, karten, abschluss, sicher, menue aus spiel.js.
// Karteikasten: 6 Faecher mit wachsenden Abstaenden. Richtig = ein Fach weiter, fast = bleibt, falsch = ein Fach zurueck (wie phase6).
// Steht ein Testtermin fest, werden die Abstaende auf 30 % der Restzeit gekuerzt, damit vor dem Test alles noch einmal kommt.
(()=>{
const ABSTAND=[0,1,3,7,14,30,90];           // Tage bis zur naechsten Abfrage, je Fach
const SITZUNG=20, ZIEL=50;                  // Karten je Uebung, Woerter am Tag mindestens (Eltern koennen es aendern)
const LEER="vok-karte";

// ---------- Woerter ----------
// Gruppen zum Lernen: nach Seite, nach Abschnitt, nach Unit. Eine Zeile "@190" im Abschnitt heisst: ab hier Seite 190.
// Ohne solche Zeile gehoert ein Abschnitt ueber zwei Seiten als Ganzes zu "Seite 189–190".
const W={}, ABSCHNITT=[], GRUPPEN={seite:[],abschnitt:[],unit:[]};
const MODI=[["seite","Seitenweise"],["abschnitt","Abschnittsweise"],["unit","Unitweise"]];
const glatt=s=>s.toLowerCase().replace(/[’`´]/g,"'").replace(/[….,!?;:"]/g," ").replace(/\s+/g," ").trim();
const gruppe=(m,key,name,sub)=>{ let g=GRUPPEN[m].find(x=>x.key===key); if(!g){ g={key,name,sub,woerter:[],nr:GRUPPEN[m].length}; GRUPPEN[m].push(g); } return g; };
for(const [id,name,seite,text] of window.VOKABELN){
  const a={id,name,seite,woerter:[]}; ABSCHNITT.push(a);
  const unit=name.split(":")[0].trim(), seiten=(seite.match(/\d+/g)||[]).map(Number);
  const ga=gruppe("abschnitt",id,name,seite), gu=gruppe("unit","unit:"+unit,unit,"");
  let s=seiten.length>1&&!/^@/m.test(text)?seiten.join("–"):String(seiten[0]||"?"), bs=0;
  for(const z of text.trim().split("\n")){
    if(/^@\d+/.test(z)){ s=z.slice(1).trim(); continue; }
    if(/^#\d+/.test(z)){ bs=parseInt(z.slice(1)); continue; }   // ab hier: Seite im Schulbuch (aus der Randnummer der Vokabelliste)
    const [en,de,hint="",alt="",merk=""]=z.split("|"), k=glatt(en);
    const schon=Object.values(W).find(w=>w.k===k&&w.de===de); if(schon) throw Error("doppelt: "+z);
    const verb=/^to ./.test(en), teile=en.split(" ").filter(t=>/[a-z]/i.test(t)), eins=verb?teile.length===2:teile.length===1;
    const w={id:id+":"+k+(hint?"#"+hint.slice(0,8):""),en,de,hint,merk,k,sec:a,verb,teile,eins,bs,
      formen:[verb?k.slice(3):k,...alt.split(",").map(glatt).filter(Boolean)].filter((x,i,l)=>l.indexOf(x)===i),
      gross:/^(I|I'm|English|Mr|Mrs|TV|OK)\b/.test(en)&&eins,
      ton:en.replace(/\s*…\s*/g," ").trim()};
    const gs=gruppe("seite","seite:"+s,"Seite "+s,"");
    w.g={seite:gs.key,abschnitt:ga.key,unit:gu.key};
    W[w.id]=w; a.woerter.push(w); ga.woerter.push(w); gu.woerter.push(w); gs.woerter.push(w);
  }
}
GRUPPEN.seite.sort((x,y)=>parseInt(x.key.slice(6))-parseInt(y.key.slice(6))||x.nr-y.nr);
for(const g of GRUPPEN.unit){ const n=g.woerter.flatMap(w=>w.g.seite.slice(6).split("–").map(Number)).filter(x=>x); g.sub=n.length?`S. ${Math.min(...n)}–${Math.max(...n)}`:""; }
for(const g of GRUPPEN.seite) g.sub=[...new Set(g.woerter.map(w=>w.sec.name))].join(", ");
const ALLE=Object.values(W);
const NACH={}; ALLE.filter(w=>w.eins).forEach(w=>{ { const k=w.verb?w.k.slice(3):w.k; (NACH[k]=NACH[k]||[]).push(w); }; });
// haeufige englische Woerter, die nur einen Buchstaben neben einer Vokabel liegen: das ist dann ein anderes Wort, kein Tippfehler
const ANDERES=new Set("bad bet bit but bat big bag beg bug god got dig hot hat hit hut cut cup cap rot run rice nice mine dead deed read real seat set sit ball bell tall wall well will fall full fell free tree tea bee hair hear here there chain share horse house hose nose mouth moose loose lose low law raw row rod road load boot goat coat boat beat bear beer bird bread board broad word work warm form from front flood flow flower glass glad grass class clash close cloth clothes coat cook cooker cookie book look lock clock block black back pack park part dark bark bike like lake lane lone long song sing thing think thank tank bank pink pine wine fine fire five live love lone life give gave have hate late gate game name same come some home hope hole whole who how now new few knew know no not note nose toe two too top toy boy buy by my me men man many any all ill always away again against quit quite quiet kit kite bite white write while where were wear year yes yet pet pat put let get wet west vest test rest best east beast fast last past list lost most must dust just tall table cable able chair cheese chess choose class dad day dog door floor poor end and hand land sand send sent ant aunt uncle under other mother brother father rather feather farther her his its it in is at as an on or of off our out own only once one ten then than them they this these those that the there their so go do to for four fore far fur car card care cat can when went want wand wander hand rat rap red bed bid see sea she sick six mix fix film fill milk part port sport short shot shop ship sheep sleep slow blow blue glue grow brown crown green grey great greet street sweet".split(" "));

// ---------- Lernstand ----------
const leer=()=>({w:{},aus:[],test:"",neu:{tag:0,n:0},tage:[],tests:{},heute:{tag:0,ids:[]}});
let S={...leer(),...JSON.parse(JSON.stringify(KERN.D.vok))};
const halte=()=>KERN.speichere("vok",S);
const tagVon=d=>Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5);
let heute=()=>tagVon(new Date());
const testTag=()=>S.test?Math.round(Date.parse(S.test+"T00:00:00Z")/864e5):0;
const L=w=>S.w[w.id]||{f:0,d:0,s:0,r:0,h:0,x:0};   // f Fach, d faellig am, s Schwierigkeit, r richtig, h fast, x falsch
// ---------- Stand im Buch ----------
// stand.buch = {seite: Schulbuchseite, pos: Abschnitt-Id, i: Reihenfolge, frage: Tag der letzten Startfrage}. Steht im
// Grammatik-Stand (spiel.js), damit mitKind() im Elternbereich ihn mittauscht. Ohne Angabe: BUCH_START aus vokabelliste.js.
// Seitengenau (E-230): Woerter mit Seitenmarke (#39) gehen genau mit ihrer Schulbuchseite auf, die anderen mit dem Abschnitt.
const REIHE=ABSCHNITT.map(a=>a.id), idx=id=>REIHE.indexOf(id);
const BS=window.BUCHSEITE||{}, GROB=window.BUCHSEITEN||[];
const seiteAbschnitt=n=>BS[n]?.[0]||(GROB.find(([a,b])=>n>=a&&n<=b)||[])[2]||null;
const seiteVon=id=>{ let m=0; for(const k in BS) if(BS[k][0]===id) m=Math.max(m,+k); for(const [a,b,i] of GROB) if(i===id) m=Math.max(m,b); return m||null; };
const buchPos=()=>{ const p=(typeof stand!=="undefined"?stand:null)?.buch?.pos; return idx(p)>=0?p:(idx(window.BUCH_START)>=0?window.BUCH_START:REIHE[REIHE.length-1]); };
const buchSeite=()=>{ const s=(typeof stand!=="undefined"?stand:null)?.buch?.seite; return s>0?s:(seiteVon(buchPos())||0); };
const erreicht=id=>!id||idx(id)<0||idx(id)<=idx(buchPos());
const wErreicht=w=>w.bs?w.bs<=buchSeite():erreicht(w.sec.id);
const abschnitt=id=>ABSCHNITT[idx(id)];
// Seite setzen: neue Woerter genau dieser Seiten zuerst lernen, Grammatik-Ebenen der Seiten als To-do (stand.todo)
function seiteSetzen(s){
  if(!(s>0)) return {neu:[],seiten:[],woerter:[],ebenen:[]};
  const alt=buchSeite(), altPos=buchPos(), pos=seiteAbschnitt(s)||altPos;
  stand.buch={...(stand.buch||{}),seite:s,pos,i:idx(pos),frage:heute(),seit:Date.now()};
  if(s<=alt){ merke(); return {neu:[],seiten:[],woerter:[],ebenen:[]}; }
  const seiten=[]; for(let p=alt+1;p<=s;p++) seiten.push(p);
  const von=idx(altPos), bis=idx(pos);
  const neuW=ALLE.filter(w=>w.bs?w.bs>alt&&w.bs<=s:idx(w.sec.id)>von&&idx(w.sec.id)<=bis), ids=new Set(neuW.map(w=>w.id));
  S.fokusW=[...new Set([...(S.fokusW||[]).filter(id=>W[id]&&!L(W[id]).f),...ids])]; delete S.fokus;
  if(S.wahl) for(const m of Object.keys(S.wahl)){ const dazu=GRUPPEN[m].filter(g=>g.woerter.some(w=>ids.has(w.id))).map(g=>g.key); S.wahl[m]=[...new Set([...S.wahl[m],...dazu])]; }
  const eb=[...new Set(seiten.flatMap(p=>BS[p]?.[3]||[]))], offen=Object.fromEntries(Object.entries(stand.todo?.e||{}).filter(([,v])=>!v));
  stand.todo={seit:Date.now(),von:alt+1,bis:s,e:{...offen,...Object.fromEntries(eb.map(id=>[id,0]))}};
  merke(); halte(); return {neu:REIHE.slice(von+1,bis+1),seiten,woerter:neuW,ebenen:eb};
}
// Abschnitt statt Seite (Vokabellisten-Seite, Elternbereich): auf die letzte Schulbuchseite des Abschnitts umrechnen
function buchSetzen(id){
  const s=seiteVon(id); if(s) return seiteSetzen(s);
  const alt=buchPos(), von=idx(alt), bis=idx(id); if(bis<0) return {neu:[],seiten:[],woerter:[],ebenen:[]};
  stand.buch={...(stand.buch||{}),pos:id,i:bis,frage:heute(),seit:Date.now()}; delete stand.buch.seite;
  if(bis<=von){ merke(); return {neu:[],seiten:[],woerter:[],ebenen:[]}; }
  const neu=REIHE.slice(von+1,bis+1), neuW=ALLE.filter(w=>neu.includes(w.sec.id));
  S.fokusW=[...new Set([...(S.fokusW||[]),...neuW.map(w=>w.id)])];
  merke(); halte(); return {neu,seiten:[],woerter:neuW,ebenen:[]};
}
// Auswahl: v.nach = seite | abschnitt | unit, v.wahl[nach] = gewaehlte Gruppen. Ohne Auswahl gilt die alte Liste "aus".
// Was im Buch noch nicht dran war, kommt nie vor, auch wenn es angehakt ist.
const gewaehlt=(v,m)=>v.wahl?.[m]||(m==="abschnitt"?ABSCHNITT.filter(a=>!(v.aus||[]).includes(a.id)).map(a=>a.id):GRUPPEN[m].map(g=>g.key));
const dranVon=v=>{ const m=v.nach||"abschnitt", sel=new Set(gewaehlt(v,m)); return ALLE.filter(w=>sel.has(w.g[m])&&wErreicht(w)); };
const dran=()=>dranVon(S);
// neu im Unterricht: Woerter der zuletzt erreichten Seiten (fokusW); fokus = alter Stand nach Abschnitten
const imFokus=w=>(S.fokusW||[]).includes(w.id)||(S.fokus||[]).includes(w.sec.id)&&erreicht(w.sec.id);
const faellige=()=>dran().filter(w=>L(w).f>0&&L(w).d<=heute()).sort((a,b)=>L(a).d-L(b).d||L(a).f-L(b).f);
const neue=()=>dran().filter(w=>!L(w).f).sort((a,b)=>imFokus(b)-imFokus(a));
const fokusNeu=()=>neue().filter(imFokus);
const schwere=()=>ALLE.filter(w=>L(w).s>0).sort((a,b)=>L(b).s-L(a).s);
const neuHeute=()=>S.neu.tag===heute()?S.neu.n:0;
const ziel=()=>S.ziel||ZIEL;
const geuebt=()=>S.heute?.tag===heute()?S.heute.ids.length:0;
// schon gelernt, heute nicht dran: zum Auffrischen, wenn die neuen Woerter der Auswahl nicht fuers Tagesziel reichen
const auffrischen=()=>{ const h=new Set(S.heute?.tag===heute()?S.heute.ids:[]); return dran().filter(w=>L(w).f>0&&L(w).d>heute()&&!h.has(w.id)).sort((a,b)=>L(a).f-L(b).f||L(a).d-L(b).d); };
function neuProTag(){ // nur mit Testtermin: so viele neue, dass bis zum Test alles einmal dran war
  const bis=testTag()-heute();
  return bis>0 ? Math.min(25,Math.max(5,Math.ceil((neue().length+neuHeute())/Math.max(1,bis-1)))) : 0;
}
// was heute noch offen ist: f faellig, n neu, x auffrischen. Zusammen mindestens bis zum Tagesziel.
function offen(){
  const f=faellige().length, rest=Math.max(0,ziel()-geuebt()-f);
  const n=Math.min(neue().length,Math.max(rest,neuProTag()-neuHeute()));
  const x=Math.min(auffrischen().length,Math.max(0,rest-n));
  return {f,n,x,alle:f+n+x};
}
function faellig(fach){
  let iv=ABSTAND[fach]; const bis=testTag()-heute();
  if(bis>1) iv=Math.min(iv,Math.max(1,Math.round(bis*.3)),bis-1);
  return heute()+Math.max(1,iv);
}
// p: 2 richtig, 1 fast, 0 falsch. zaehlt=false: Zusatzuebung, aendert das Fach nicht nach oben.
function buche(w,p,{zaehlt=true,sofort=false}={}){
  const e=S.w[w.id]=L(w), warNeu=!e.f, war=e.f>0&&e.d>heute();
  if(p===2){ e.r++; e.s=Math.max(0,e.s-1); } else if(p===1){ e.h++; e.s=Math.min(4,e.s+1); } else { e.x++; e.s=Math.min(4,e.s+2); }
  if(zaehlt){
    if(p===2){ if(warNeu){ e.f=sofort?2:1; e.d=faellig(e.f); } else if(!war){ e.f=Math.min(6,e.f+1); e.d=faellig(e.f); } }
    else if(p===1){ e.f=Math.max(1,e.f); e.d=heute()+1; }
    else if(!warNeu){ e.f=Math.max(1,e.f-1); e.d=heute()+1; }
    if(warNeu&&e.f){ if(S.neu.tag!==heute()) S.neu={tag:heute(),n:0}; S.neu.n++; }
  } else if(p<2&&e.f) e.d=Math.min(e.d,heute()+1);
  if(S.tage[S.tage.length-1]!==heute()) S.tage.push(heute());
  if(S.heute?.tag!==heute()) S.heute={tag:heute(),ids:[]};
  if(!S.heute.ids.includes(w.id)) S.heute.ids.push(w.id);
  halte();
}
function kette(){ let n=0,t=heute(); const m=new Set(S.tage); if(!m.has(t)) t--; while(m.has(t)){n++;t--;} return n; }

// ---------- Bewertung der Rechtschreibung ----------
function abstand(a,b){ // Damerau-Levenshtein: Dreher zaehlt als ein Fehler
  const d=Array.from({length:a.length+1},(_,i)=>[i]); for(let j=1;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++){
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[a.length][b.length];
}
// klingt gleich: Geruest der Mitlaute, deutsch geschriebene Laute eingeschlossen (frend, kusin, wite)
const klang=s=>s.replace(/[^a-z]/g,"").replace(/ph/g,"f").replace(/igh/g,"i").replace(/^kn/,"n").replace(/wh/g,"w").replace(/tsch|tch|ch/g,"C").replace(/sch|sh/g,"S")
  .replace(/qu?/g,"kw").replace(/x/g,"ks").replace(/c(?=[eiy])/g,"s").replace(/ck|c/g,"k").replace(/z/g,"s").replace(/gh/g,"").replace(/(.)\1/g,"$1").replace(/[aeiouyh]/g,"");
const grenze=n=>n<=2?0:n<=5?1:n<=8?2:3;
function bewerte(w,eingabe){
  const roh=eingabe.trim(); let n=glatt(eingabe);
  if(!n) return {p:0,leer:true,t:""};
  if(w.verb) n=n.replace(/^to /,""); else if(!w.formen.includes(n)) n=n.replace(/^(the|an?) (?=.)/,"");
  if(w.formen.includes(n)){
    if(w.gross&&n===w.formen[0]&&roh[0]!==w.en[0]) return {p:2,t:`Richtig. ${w.en} schreibt man groß.`};
    if(n!==w.formen[0]) return {p:2,t:`Stimmt auch. Im Buch steht ${w.en}`};
    return {p:2,t:""};
  }
  const f0=w.formen[0];
  if(w.formen.some(f=>f.replace(/'/g,"")===n.replace(/'/g,""))) return {p:1,t:"Fast! Schau auf den Apostroph."};
  if(w.formen.some(f=>f.replace(/[ -]/g,"")===n.replace(/[ -]/g,""))) return {p:1,t:"Fast! Das schreibt man in einem Wort."};
  const anderes=NACH[n]; if(anderes) return {p:0,t:`${n} heißt „${anderes[0].de}“.`};
  if(w.de.split(";").some(t=>glatt(t)===n)&&!w.formen.some(f=>abstand(f,n)<=1)) return {p:0,t:"Das ist das deutsche Wort."};
  if(ANDERES.has(n)&&klang(n).length>1&&w.formen.some(f=>klang(f)===klang(n))) return {p:1,t:`Fast! Das klingt ähnlich, aber ${n} ist ein anderes Wort.`};
  if(ANDERES.has(n)) return {p:0,t:`${n} ist ein anderes englisches Wort.`};
  let best=9,form=f0; for(const f of w.formen){ const a=abstand(n,f); if(a<best){best=a;form=f;} }
  const tonGleich=klang(n)===klang(form)&&klang(form).length>=2&&best<=Math.ceil(form.length/2);
  if(best<=grenze(form.length)||tonGleich) return {p:1,t:best===1?"Fast! Du kennst das Wort, nur eine Stelle stimmt nicht.":"Fast! Du kennst das Wort, schau auf die Buchstaben."};
  return {p:0,t:""};
}
function vergleich(a,b){ // gemeinsame Buchstaben beider Schreibweisen
  a=a.trim(); const x=a.toLowerCase(), y=b.toLowerCase(), m=Array.from({length:x.length+1},()=>Array(y.length+1).fill(0));
  for(let i=x.length-1;i>=0;i--) for(let j=y.length-1;j>=0;j--) m[i][j]=x[i]===y[j]?m[i+1][j+1]+1:Math.max(m[i+1][j],m[i][j+1]);
  const A=[],B=[]; let i=0,j=0; while(i<x.length&&j<y.length){ if(x[i]===y[j]){A.push(i++);B.push(j++);} else if(m[i+1][j]>=m[i][j+1]) i++; else j++; }
  const mal=(s,ok,kl)=>[...s].map((c,k)=>ok.includes(k)||c===" "?sicher(c):`<span class="${kl}">${sicher(c)}</span>`).join("");
  return {du:mal(a,A,"weg1"),soll:mal(b,B,"neu1"),maske:[...b].map((c,k)=>B.includes(k)||/[ '-]/.test(c)?c:"_").join(" ")};
}
const halbe=w=>{ const s=w.formen[0]; return [...s].map((c,i)=>i===0||i===s.length-1&&s.length>3||(s.length>5&&i%3===0)?c:"_").join(" "); };
const nackt=t=>t.replace(/[….,!?]/g,"");
function bewerteSatz(w,teile){
  const a=teile.map(t=>nackt(t).toLowerCase()), b=w.teile.map(t=>nackt(t).toLowerCase());
  if(!a.length) return 0; if(a.join(" ")===b.join(" ")) return 2;
  return b.length>2&&abstand(a.map(x=>String.fromCharCode(1000+[...new Set([...a,...b])].indexOf(x))).join(""),b.map(x=>String.fromCharCode(1000+[...new Set([...a,...b])].indexOf(x))).join(""))<=1?1:0;
}

// ---------- Karten ----------
let aus=0; // laufende Nummer: alte Zeitgeber verfallen
const lebt=n=>n===aus&&ort==="vok"&&modus==="karte";
const spaeter=(f,ms)=>{ const n=aus; setTimeout(()=>{ if(lebt(n)) f(); },ms); };
function karte(html){ aus++; const el=document.createElement("div"); el.className="aufgabe vokabel"; el.innerHTML=html; $("karte").replaceChildren(el); $("karte").classList.remove(LEER); return el; }
const frage=(w,auftrag)=>`<p class="auftrag">${auftrag}</p><p class="satzgross">${sicher(w.de)}</p>${w.hint?`<p class="zusatz">${sicher(w.hint)}</p>`:""}`;
const merkHtml=w=>w.merk?`<p class="merk">${sicher(w.merk)}</p>`:"";
const gut=()=>piep([[660,0,.12],[880,.1,.18]]), schlecht=()=>piep([[220,0,.2]]);

function kartZeigen(w,weiter,kenn){
  const el=karte(`<p class="auftrag">Neues Wort</p><p class="satzgross">${sicher(w.en)}</p><p class="deutsch">${sicher(w.de)}</p>${w.hint?`<p class="zusatz">${sicher(w.hint)}</p>`:""}${merkHtml(w)}
    <div class="reihe"><button type="button" class="hoeren">Anhören</button><button type="button" class="pruefen">Weiter</button><button type="button" class="hoeren kenn">Kenn ich schon</button></div>`);
  sag("Lies das Wort, hör es an und sprich es nach.",""); sprich(w.ton);
  el.querySelector(".hoeren").onclick=()=>sprich(w.ton);
  el.querySelector(".pruefen").onclick=weiter; el.querySelector(".kenn").onclick=kenn; el.querySelector(".pruefen").focus();
}
// art: "hilfe" mit Buchstaben, "frei" allein, "test" ohne Rueckmeldung. fertig(punkte, eingabe)
function kartSchreiben(w,art,fertig){
  const el=karte(`${frage(w,"Wie heißt das auf Englisch?")}<p class="muster">${art==="hilfe"?sicher(halbe(w)):""}</p>
    <form><input id="vfeld" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="en" aria-label="Englisches Wort">
    <div class="reihe"><button class="pruefen">${art==="test"?"Weiter":"Prüfen"}</button>${art==="test"?"":'<button type="button" class="hoeren weissnicht">Weiß ich nicht</button>'}</div></form>`);
  const feld=el.querySelector("input"), muster=el.querySelector(".muster"); let erst=null, zu=false;
  sag("",""); feld.focus();
  const ende=(p,t)=>{ zu=true; feld.className="gut"; feld.disabled=true; sprich(w.ton); gut(); sag(t,"gut"); spaeter(()=>fertig(p,erst||feld.value),t.length>22?2000:1300); };
  const abschreiben=p=>{ kartAbschreiben(w,erst,()=>fertig(p,erst)); };
  el.querySelector("form").onsubmit=e=>{ e.preventDefault(); if(zu) return;
    const v=feld.value, b=bewerte(w,v);
    if(art==="test"){ zu=true; return fertig(b.p,v); }
    if(b.leer) return sag("Schreib etwas, auch wenn du nicht sicher bist. Ein Teil ist besser als nichts.","");
    if(b.p===2) return ende(erst===null?2:1, b.t||(erst===null?"Richtig!":"Jetzt stimmt es. Das Wort kommt nachher noch einmal."));
    if(erst===null&&b.p===1){ erst=v; const g=vergleich(v,w.formen.reduce((a,f)=>abstand(glatt(v),f)<abstand(glatt(v),a)?f:a)); schlecht();
      muster.innerHTML=`<span class="deins">${g.du}</span>${g.maske.includes("_")?"<br>"+sicher(g.maske):""}`; feld.value=""; feld.focus(); return sag(b.t+" Versuch es noch einmal.","schlecht"); }
    const p=erst===null?0:1; if(erst===null) erst=v; schlecht(); sag(b.t,"schlecht"); abschreiben(p);
  };
  el.querySelector(".weissnicht")?.addEventListener("click",()=>{ if(zu) return; zu=true; const p=erst===null?0:1; erst=erst||""; abschreiben(p); });
}
// Ansehen, abdecken, schreiben: die Loesung verschwindet beim ersten Buchstaben
function kartAbschreiben(w,eingabe,fertig){
  const ziel=w.formen[0], g=eingabe?vergleich(eingabe,ziel):null;
  const el=karte(`<p class="auftrag">${sicher(w.de)}${w.hint?` (${sicher(w.hint)})`:""}</p>${g?`<p class="deins">${g.du}</p>`:""}<p class="satzgross loesung">${w.verb?"to ":""}${g?g.soll:sicher(w.en)}</p>${merkHtml(w)}
    <form><input id="vfeld" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="en" aria-label="Wort abschreiben"><button class="pruefen">Prüfen</button></form>`);
  const feld=el.querySelector("input"), lo=el.querySelector(".loesung"); let zu=false;
  const deck=()=>{ const an=!!feld.value; lo.classList.toggle("zu",an); el.querySelector(".merk")?.classList.toggle("zu",an); };
  sag(($("tipp").textContent+" Sieh dir das Wort genau an. Sobald du schreibst, verschwindet es.").trim(),"schlecht"); sprich(w.ton); feld.focus(); feld.oninput=deck;
  el.querySelector("form").onsubmit=e=>{ e.preventDefault(); if(zu||!feld.value.trim()) return;
    const n=glatt(feld.value).replace(w.verb?/^to /:/^$/,"");
    if(w.formen.includes(n)){ zu=true; feld.className="gut"; feld.disabled=true; gut(); sag("Genau so. Das Wort kommt nachher noch einmal.","gut"); return spaeter(fertig,1100); }
    schlecht(); feld.value=""; deck(); sag("Noch nicht ganz. Sieh noch einmal hin.","schlecht"); feld.focus();
  };
}
const ablenker=(w,n,ganz)=>{ // falsche Schilder, moeglichst aus demselben Abschnitt
  if(w.eins){ const pool=mischen(ALLE.filter(x=>x.eins&&x.k!==w.k&&!w.formen.includes(x.formen[0])&&!x.formen.some(f=>w.formen.includes(f))&&x.de!==w.de&&!x.de.split("; ").some(t=>w.de.split("; ").includes(t)))).sort((a,b)=>(b.sec===w.sec)-(a.sec===w.sec)); return pool.slice(0,n).map(x=>x.en); }
  if(ganz) return mischen(ALLE.filter(x=>!x.eins&&x!==w&&x.de!==w.de)).sort((a,b)=>(b.sec===w.sec)-(a.sec===w.sec)).slice(0,n).map(x=>x.en);
  const hat=new Set(w.teile.map(t=>nackt(t).toLowerCase())), aus=[];
  for(const x of mischen(w.sec.woerter.filter(x=>!x.eins&&x!==w)).concat(mischen(ALLE.filter(x=>!x.eins&&x!==w)))) for(const t of x.teile){ const k=nackt(t).toLowerCase(); if(!hat.has(k)&&aus.length<n){ hat.add(k); aus.push(nackt(t)); } }
  return aus;
};
// Schilder ziehen oder anklicken. wahl: ein Schild von vieren. sonst Satz bauen.
function kartSchilder(w,art,fertig){
  const wahl=art==="wahl", soll=wahl?[w.en]:w.teile.map(nackt);
  const el=karte(`${frage(w,wahl?"Zieh das richtige Wort in das Feld.":"Bau den Ausdruck aus den Schildern.")}<p class="satzgross loesung zu" hidden></p><div class="linie" aria-label="Deine Antwort"></div><div class="vorrat"></div>
    ${wahl?"":`<div class="reihe"><button type="button" class="pruefen">${art==="test"?"Weiter":"Prüfen"}</button>${art==="test"?"":'<button type="button" class="hoeren weissnicht">Weiß ich nicht</button>'}</div>`}`);
  const linie=el.querySelector(".linie"), vorrat=el.querySelector(".vorrat"); let erst=null, zu=false;
  sag("","");
  const texte=mischen([...soll,...ablenker(w,wahl?3:Math.min(3,Math.max(2,5-soll.length)),wahl)]);
  const hole=()=>[...linie.children].map(s=>s.textContent);
  const falschWahl=s=>{ s.classList.add("raus"); s.disabled=true; vorrat.append(s); schlecht(); if(erst===null) erst=s.textContent;
    const d=ALLE.find(x=>x.en===s.textContent); sag(`${s.textContent} heißt „${d?d.de:"etwas anderes"}“.`,"schlecht"); };
  function gelegt(s){ if(!wahl) return; if(s.textContent===w.en){ zu=true; linie.classList.add("gut"); gut(); sprich(w.ton); sag("Richtig!","gut"); spaeter(()=>fertig(erst===null?2:1,erst),1200); } else falschWahl(s); }
  for(const t of texte){
    const s=document.createElement("button"); s.type="button"; s.className="wort breit"; s.textContent=t; vorrat.append(s);
    let x0=0,y0=0,zieht=false,unten=false;
    const lege=x=>{ if(wahl&&linie.children.length) vorrat.append(linie.firstChild);
      const vor=[...linie.children].find(c=>{const b=c.getBoundingClientRect();return c!==s&&x!=null&&x<b.left+b.width/2;}); linie.insertBefore(s,vor||null); gelegt(s); };
    s.addEventListener("pointerdown",e=>{ if(zu||e.button>0) return; unten=true; zieht=false; x0=e.clientX; y0=e.clientY; try{s.setPointerCapture(e.pointerId);}catch(_){} });
    s.addEventListener("pointermove",e=>{ if(!unten) return; const dx=e.clientX-x0,dy=e.clientY-y0; if(!zieht&&Math.hypot(dx,dy)<6) return; zieht=true; s.style.transform=`translate(${dx}px,${dy}px)`; s.style.zIndex=5; s.style.position="relative";
      const b=linie.getBoundingClientRect(); linie.classList.toggle("ziel",e.clientY>b.top-30&&e.clientY<b.bottom+20&&e.clientX>b.left-30&&e.clientX<b.right+30); });
    const los=e=>{ if(!unten) return; unten=false; s.style.transform=s.style.zIndex=s.style.position=""; linie.classList.remove("ziel"); if(!zieht) return;
      s.dataset.gezogen=1; setTimeout(()=>delete s.dataset.gezogen,0); if(zu) return;
      const b=linie.getBoundingClientRect(); if(e.type==="pointerup"&&e.clientY>b.top-30&&e.clientY<b.bottom+20&&e.clientX>b.left-30&&e.clientX<b.right+30) lege(e.clientX); else if(e.type==="pointerup") vorrat.append(s); };
    s.addEventListener("pointerup",los); s.addEventListener("pointercancel",los);
    s.addEventListener("click",()=>{ if(zu||s.dataset.gezogen||s.disabled) return; s.parentNode===linie?vorrat.append(s):lege(null); if(lo&&!lo.hidden) lo.classList.toggle("zu",linie.children.length>0); });
  }
  const lo=el.querySelector(".loesung");
  const zeigLoesung=()=>{ lo.hidden=false; lo.classList.remove("zu"); lo.textContent=w.en; vorrat.append(...linie.children); sprich(w.ton); el.querySelector(".weissnicht")?.remove(); sag("So heißt es. Sieh es dir an und bau es nach.","schlecht"); };
  let p=null;
  el.querySelector(".pruefen")?.addEventListener("click",()=>{ if(zu) return; const a=hole();
    if(art==="test"){ zu=true; return fertig(bewerteSatz(w,a),a.join(" ")); }
    if(!a.length) return sag("Leg erst ein paar Schilder auf die Linie.","");
    const b=bewerteSatz(w,a); if(p===null){ p=b; erst=a.join(" "); }
    if(b===2){ zu=true; linie.classList.add("gut"); gut(); sprich(w.ton); sag(p===2?"Richtig!":"Jetzt stimmt es. Der Ausdruck kommt nachher noch einmal.","gut"); return spaeter(()=>fertig(p,erst),1400); }
    schlecht(); if(b===1&&lo.hidden&&!el.dataset.zwei){ el.dataset.zwei=1; return sag("Fast! Ein Schild stimmt noch nicht. Versuch es noch einmal.","schlecht"); }
    zeigLoesung(); });
  el.querySelector(".weissnicht")?.addEventListener("click",()=>{ if(zu) return; if(p===null){p=0;erst="";} zeigLoesung(); });
}

// ---------- Uebung ----------
let U=null;
function starteUebung(liste,titel,zusatz){ // liste: [{w,s}] s: neu | abfrage | schwer
  if(!liste.length) return vokMenue();
  ort="vok"; laeuft=false; lauf++; zeige("karte"); $("schilder").replaceChildren();
  U={q:liste.slice(),titel,zusatz,gesamt:liste.length,fertig:new Set(),gut:0,fast:0,falsch:0,nach:{}};
  schritt();
}
const rein=(t,n)=>U.q.splice(Math.min(n,U.q.length),0,t);
function abfrage(w,fertig,art="frei"){ w.eins?kartSchreiben(w,art,fertig):kartSchilder(w,"frei",fertig); }
function schritt(){
  $("runde").textContent=U.titel; $("punkte").textContent=`Noch ${new Set(U.q.map(t=>t.w.id)).size} ${new Set(U.q.map(t=>t.w.id)).size===1?"Wort":"Wörter"}`;
  const t=U.q.shift(); if(!t) return uebungFertig();
  const {w}=t;
  if(t.s==="neu") return kartZeigen(w,()=>kartSchilder(w,"wahl",()=>{ w.eins?rein({w,s:"hilfe"},2):rein({w,s:"abfrage",neu:true},2); schritt(); }),()=>{ t.s="abfrage"; t.sofort=true; U.q.unshift(t); schritt(); });
  if(t.s==="hilfe") return kartSchreiben(w,"hilfe",()=>{ rein({w,s:"abfrage",neu:true},3); schritt(); });
  abfrage(w,p=>{
    if(!U.nach[w.id]){ // nur der erste Versuch zaehlt fuers Fach
      if(t.neu&&p<2){ rein({w,s:"abfrage",neu:true},3); t.neu=2; buche(w,p,{zaehlt:p===1}); U.nach[w.id]=1; }
      else { buche(w,p,{zaehlt:t.s!=="schwer",sofort:t.sofort}); if(p<2) U.nach[w.id]=1; if(p<2) rein({w,s:t.sofort&&p===0?"hilfe":"abfrage",neu:t.sofort},4); }
      p===2?U.gut++:p===1?U.fast++:U.falsch++;
    } else if(p<2&&U.nach[w.id]<4){ U.nach[w.id]++; rein({w,s:"abfrage"},3); }
    else if(p===2&&!L(w).f){ buche(w,2); }   // neu, erst falsch, jetzt aus dem Kopf gewusst: Fach 1
    schritt();
  });
}
const tagesStand=()=>{ const g=geuebt(), z=ziel(); return `<div class="tagesziel"><span>Heute ${Math.min(g,z)} von ${z} Wörtern${g>z?` (${g} geübt)`:""}</span><span class="bar"><i style="width:${Math.min(100,Math.round(100*g/z))}%"></i></span></div>`; };
function uebungFertig(){
  KERN.log(U.titel,U.gut,U.gut+U.fast+U.falsch,"vokabeln");
  aus++; $("karte").replaceChildren(); const o=offen();
  const k=document.createElement("div"); k.className="aufgabe"; k.innerHTML=`<p class="satzgross">Geschafft!</p>${tagesStand()}${kasten()}`; $("karte").append(k);
  $("runde").textContent=U.titel; $("punkte").textContent=""; sag("",""); piep([[523,0,.15],[659,.13,.15],[784,.26,.3]]);
  const r=Math.max(0,ziel()-geuebt()), g=grammatik();
  const gk=g.offen&&U.heute?[[`Weiter: 8 Grammatik-Aufgaben`,"haupt",()=>grammatikHeute.start()]]:[];
  abschluss(`<p>${U.gut} gleich richtig, ${U.fast} fast richtig, ${U.falsch} noch nicht. ${o.alle?r?`Noch ${r} ${r===1?"Wort":"Wörter"} bis zum Tagesziel.`:"":g.offen?"Die Wörter sind für heute fertig.":"Für heute bist du fertig."}${gk.length?` Jetzt noch kurz Grammatik: ${sicher(g.name)}.`:""}</p>`,
    o.alle?[...gk,["Weiter üben",gk.length?"neben":"haupt",heuteUeben],["Zurück","neben",vokMenue]]:[...gk,["Zurück",gk.length?"neben":"haupt",vokMenue],...(neue().length?[["5 neue Wörter extra","neben",()=>neueUeben(5)]]:[])]);
}
// Grammatik des aktuellen Themas (spiel.js): einmal am Tag nach der Vokabelrunde
const grammatik=()=>window.grammatikHeute?grammatikHeute.info():{offen:false,fertig:false,name:""};
// Bekanntes zuerst, neue Woerter in kleinen Portionen dazwischen; reicht beides nicht fuers Tagesziel, kommt Gelerntes zum Auffrischen
function heuteUeben(){
  const o=offen();
  const f=faellige().slice(0,SITZUNG).map(w=>({w,s:"abfrage"}));
  const nn=Math.min(o.n,Math.max(5,SITZUNG-f.length),10), n=neue().slice(0,nn).map(w=>({w,s:"neu"}));
  const x=auffrischen().slice(0,Math.min(o.x,Math.max(0,SITZUNG-f.length-n.length))).map(w=>({w,s:"schwer"}));
  if(!f.length&&!n.length&&!x.length&&grammatik().offen) return grammatikHeute.start();
  starteUebung([...mischen([...f,...x]),...n],"Vokabeln: heute üben"); if(U) U.heute=true;
}
const neueUeben=n=>starteUebung(neue().slice(0,n).map(w=>({w,s:"neu"})),"Vokabeln: neue Wörter");
const schwereUeben=()=>starteUebung(schwere().slice(0,12).map(w=>({w,s:"schwer"})),"Vokabeln: schwere Wörter");

// ---------- Vokabeltest ----------
let T=null;
function starteTest(id,titel,pool){
  const w=mischen(pool).sort((a,b)=>(L(b).s>0)-(L(a).s>0)).slice(0,20);
  if(!w.length) return testMenue();
  ort="vok"; laeuft=false; lauf++; zeige("karte"); $("schilder").replaceChildren();
  T={id,titel,w:mischen(w),i:0,a:[]}; testFrage();
}
function testFrage(){
  const w=T.w[T.i]; $("runde").textContent=`Vokabeltest: ${T.titel}`; $("punkte").textContent=`Frage ${T.i+1} von ${T.w.length}`;
  const fertig=(p,v)=>{ T.a.push({w,p,v}); buche(w,p,{sofort:true}); T.i++; T.i<T.w.length?testFrage():testFertig(); };
  w.eins?kartSchreiben(w,"test",fertig):kartSchilder(w,"test",fertig);
  sag("Im Test gibt es keine Tipps. Schreib auch hin, was du nur ungefähr weißt.","");
}
function testFertig(){
  aus++; const pkt=T.a.reduce((s,x)=>s+x.p,0), max=2*T.a.length, alt=S.tests[T.id], pz=Math.round(100*pkt/max);
  S.tests[T.id]={best:Math.max(pz,alt?.best||0),zuletzt:pz,n:(alt?.n||0)+1}; halte(); KERN.log("Vokabeltest: "+T.titel,Math.round(pkt/2),T.a.length,"test");
  const reihen=[...T.a].sort((a,b)=>a.p-b.p).map(({w,p,v})=>{ const g=v&&p<2?vergleich(v,w.eins?w.formen[0]:nackt(w.en).trim()):null;
    return `<tr><td>${sicher(w.de)}${w.hint?` <small>(${sicher(w.hint)})</small>`:""}</td><td>${p===2?sicher(v):g?`<span class="deins">${g.du}</span>`:"–"}</td><td>${p===2?"":(w.verb?"to ":"")+(p===1&&g?g.soll:sicher(w.eins&&w.verb?w.formen[0]:w.en))}</td><td>${p}</td></tr>`; }).join("");
  const k=document.createElement("div"); k.className="testliste"; k.innerHTML=`<h2>${pkt} von ${max} Punkten</h2><p>2 Punkte: alles richtig. 1 Punkt: das Wort stimmt, die Rechtschreibung noch nicht ganz.</p><table><thead><tr><th>Deutsch</th><th>Du</th><th>Richtig</th><th>Punkte</th></tr></thead><tbody>${reihen}</tbody></table>`;
  $("karte").replaceChildren(k); $("punkte").textContent=""; sag("","");
  const fehl=T.a.filter(x=>x.p<2).map(x=>({w:x.w,s:"schwer"}));
  abschluss(`<p>${T.a.filter(x=>x.p===2).length} richtig, ${T.a.filter(x=>x.p===1).length} fast, ${T.a.filter(x=>x.p===0).length} falsch. Das sind ${pz} %.${alt?` Dein bestes Ergebnis bisher: ${alt.best} %.`:""}</p>`,
    [...(fehl.length?[["Fehler jetzt üben","haupt",()=>starteUebung(fehl,"Vokabeln: Fehler aus dem Test")]]:[]),["Zurück",fehl.length?"neben":"haupt",testMenue]]);
}
const tst=id=>S.tests[id]?`zuletzt ${S.tests[id].zuletzt} %, bestes ${S.tests[id].best} %`:"";
function testMenue(){
  ort="vok"; ruhe("Vokabeltest","20 Wörter ohne Tipps. Einzelne Wörter schreibst du, Ausdrücke baust du aus Schildern.");
  const g=dran().filter(w=>L(w).f);
  karten([{t:"Alles Gelernte",u:`gemischt aus ${g.length} Wörtern`,zu:g.length<5,st:g.length<5?"ab 5 Wörtern":tst("gelernt"),f:()=>starteTest("gelernt","alles Gelernte",g)},
    ...GRUPPEN[S.nach||"abschnitt"].map(a=>({t:sicher(a.name),u:`${a.sub?sicher(a.sub)+", ":""}${a.woerter.length} Wörter`,st:tst(a.key),f:()=>starteTest(a.key,a.name,a.woerter)}))]);
}

// ---------- Menues ----------
function kasten(){
  const z=[0,0,0,0,0,0,0]; dran().forEach(w=>z[L(w).f]++);
  const wann=["noch neu","jeden Tag","nach 3 Tagen","nach 7 Tagen","nach 14 Tagen","nach 30 Tagen","nach 90 Tagen"];
  return `<div class="kasten">${z.map((n,i)=>`<div class="fach"><b>${n}</b><span>${i?`Fach ${i}`:"Neu"}</span><small>${wann[i]}</small></div>`).join("")}</div>`;
}
const modusName=v=>({seite:"Seiten",abschnitt:"Abschnitte",unit:"Units"})[v.nach||"abschnitt"];
const auswahlText=v=>{ const m=v.nach||"abschnitt", sel=gewaehlt(v,m); return sel.length===GRUPPEN[m].length?`alle ${modusName(v)}`:sel.length===1?GRUPPEN[m].find(g=>g.key===sel[0])?.name||"":`${sel.length} ${modusName(v)}`; };
function vokMenue(){
  aus++; ort="vok"; const o=offen(), bis=testTag()-heute(), k=kette();
  ruhe("Vokabeln",[bis>0?`Noch ${bis} ${bis===1?"Tag":"Tage"} bis zum Test.`:bis===0&&S.test?"Heute ist der Test.":"", k>1?`${k} Tage hintereinander geübt.`:"", `Jeden Tag mindestens ${ziel()} Wörter.`].filter(Boolean).join(" "));
  const fn=fokusNeu(), fs=[...new Set(fn.map(w=>w.bs?`S. ${w.bs}`:w.sec.name))], g=grammatik();
  karten([...(fn.length?[{t:"Neu im Unterricht",u:sicher(fs.slice(0,4).join(", ")+(fs.length>4?" …":"")),st:`${fn.length} neue Wörter`,f:()=>starteUebung(fn.slice(0,10).map(w=>({w,s:"neu"})),"Vokabeln: neu im Unterricht")}]:[]),
    {t:"Heute üben",u:(o.alle?[o.f&&`${o.f} wiederholen`,o.n&&`${o.n} neu`,o.x&&`${o.x} auffrischen`].filter(Boolean).join(", "):"Wörter für heute fertig")+(g.offen?`, dazu Grammatik: ${sicher(g.name)}`:g.fertig?", Grammatik fertig":""),
      st:o.alle?`${Math.min(geuebt(),ziel())} von ${ziel()}`:g.offen?"Grammatik offen":"Fertig ✓",zu:!o.alle&&!g.offen,f:heuteUeben},
    {t:"Was lerne ich?",u:"seitenweise, abschnittsweise oder unitweise",st:auswahlText(S),f:einstellen},
    {t:"Schwere Wörter",u:"nur, was zuletzt nicht saß",st:schwere().length?`${schwere().length} offen`:"nichts offen",zu:!schwere().length,f:schwereUeben},
    {t:"Vokabeltest",u:"20 Wörter wie in der Schule",st:S.test&&bis>=0?`Test: ${S.test.split("-").reverse().join(".")}`:"",f:testMenue},
    {t:"Neue Wörter extra",u:"fünf neue Wörter",zu:!neue().length,f:()=>neueUeben(5)},
    {t:"Wortliste",u:"alle Wörter nachsehen",f:wortliste}]);
  $("spiele").insertAdjacentHTML("afterbegin",tagesStand()+kasten());
}
// Auswahl der Gruppen, fuer das Kind (hier) und fuer die Eltern (app.js). v: Vokabelstand, speichern(v) nach jeder Aenderung.
function wahlEl(v,speichern){
  const d=document.createElement("div"); d.className="wahl";
  const zeichne=()=>{ const m=v.nach||"abschnitt", sel=new Set(gewaehlt(v,m)), n=dranVon(v).length;
    d.innerHTML=`<div class="modi" role="group" aria-label="Lernen nach">${MODI.map(([k,t])=>`<button type="button" data-m="${k}" aria-pressed="${k===m}">${t}</button>`).join("")}</div>
      <p><small>${n} ${n===1?"Wort":"Wörter"} ausgewählt. Gelernte Wörter bleiben gespeichert, auch wenn sie gerade nicht dran sind.</small></p>
      <div class="reihe2"><button type="button" class="neben" data-alle="1">Alle</button><button type="button" class="neben" data-alle="0">Keine</button></div>`
      +GRUPPEN[m].map(g=>{ const spaeter=!g.woerter.some(wErreicht);
        return `<label${spaeter?' class="spaeter"':""}><input type="checkbox" value="${sicher(g.key)}" ${sel.has(g.key)?"checked":""}> ${sicher(g.name)} <small>${spaeter?"kommt im Buch noch":`${g.sub?sicher(g.sub)+", ":""}${g.woerter.length} Wörter, ${g.woerter.filter(w=>v.w?.[w.id]?.f).length} gelernt`}</small></label>`; }).join(""); };
  const setze=(m,keys)=>{ v.wahl={...(v.wahl||{}),[m]:keys}; speichern(v); zeichne(); };
  d.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; const m=v.nach||"abschnitt";
    if(b.dataset.m&&b.dataset.m!==m){ const aktiv=new Set(dranVon(v).map(w=>w.id)); v.nach=b.dataset.m; setze(b.dataset.m,GRUPPEN[b.dataset.m].filter(g=>g.woerter.some(w=>aktiv.has(w.id))).map(g=>g.key)); }
    else if(b.dataset.alle) setze(m,b.dataset.alle==="1"?GRUPPEN[m].map(g=>g.key):[]); });
  d.addEventListener("change",e=>{ if(e.target.type!=="checkbox") return; const m=v.nach||"abschnitt";
    setze(m,[...d.querySelectorAll("input[type=checkbox]:checked")].map(c=>c.value)); });
  zeichne(); return d;
}
function einstellen(){
  ruhe("Was lerne ich?","Wähl, wie du lernst, und hak an, was gerade dran ist.");
  const d=document.createElement("div"); d.className="einstellung";
  d.innerHTML=`<label class="termin">Nächster Vokabeltest am <input type="date" value="${S.test}"></label><p>Mit Termin verteilt das Spiel die neuen Wörter auf die Tage bis dahin und wiederholt öfter.</p>`;
  d.append(wahlEl(S,()=>halte()));
  d.insertAdjacentHTML("beforeend",`<button type="button" class="spiel">Fertig</button>`);
  $("spiele").replaceChildren(d);
  d.querySelector("[type=date]").onchange=e=>{ S.test=e.target.value; halte(); };
  d.querySelector(".spiel:last-child").onclick=vokMenue;
}
function wortliste(){
  ruhe("Wortliste","Klick auf ein Wort, um es zu hören.");
  const d=document.createElement("div"); d.className="einstellung";
  d.innerHTML=ABSCHNITT.map(a=>`<details><summary>${sicher(a.name)} <small>${a.seite}</small></summary><table><tbody>${a.woerter.map(w=>`<tr><td><button type="button" data-w="${sicher(w.id).replace(/"/g,"&quot;")}">${sicher(w.en)}</button></td><td>${sicher(w.de)}${w.hint?` <small>(${sicher(w.hint)})</small>`:""}</td><td>${L(w).f?`Fach ${L(w).f}`:""}</td></tr>`).join("")}</tbody></table></details>`).join("");
  $("spiele").replaceChildren(d);
  d.onclick=e=>{ const w=W[e.target.dataset?.w]; if(w) sprich(w.ton); };
}
window.vokMenue=vokMenue;
window.vokKarte=()=>{ const o=offen(); return {i:"📚",p:[ALLE.filter(w=>L(w).f).length,ALLE.length],t:"Vokabeln",u:"Karteikasten und Vokabeltest",st:o.alle?`heute ${Math.min(geuebt(),ziel())} von ${ziel()}`:"heute fertig ✓",f:vokMenue}; };
window.vokWahl=wahlEl;
// fuer "Heute dran" (spiel.js): neue Woerter der zuletzt erreichten Seiten
window.vokNeu={zahl:()=>fokusNeu().length,woerter:()=>fokusNeu(),start:()=>{ const fn=fokusNeu(); starteUebung(fn.slice(0,10).map(w=>({w,s:"neu"})),"Vokabeln: neu im Unterricht"); }};
window.BUCH={ABSCHNITT,REIHE,idx,pos:buchPos,seite:buchSeite,erreicht,abschnitt,setzen:buchSetzen,seiteSetzen,seiteVon,seiteAbschnitt,SEITE:BS,naechste:()=>ABSCHNITT[idx(buchPos())+1],
  // Seite der Vokabelliste (ab 180) -> letzter Abschnitt, der auf dieser Seite steht
  ausListenseite:n=>{ let t=null; for(const a of ABSCHNITT){ const s=(a.seite.match(/\d+/g)||[]).map(Number); if(s.length&&s[0]<=n) t=a; } return t; },
  // Seite im Schulbuch -> Abschnitt (aus dem Inhaltsverzeichnis, vokabelliste.js)
  ausSchulseite:n=>{ const t=(window.BUCHSEITEN||[]).find(([a,b])=>n>=a&&n<=b); return t&&idx(t[2])>=0?t[2]:null; }};
window.vokPruef={leer,kasten,GRUPPEN,ZIEL,offen,geuebt,ziel,dran,auffrischen,auswahlText,tausch:x=>{const a=S; if(x) S=x; return a;},W,ALLE,ABSCHNITT,bewerte,bewerteSatz,vergleich,faellig,ablenker,halbe,L,S:()=>S,setTag:t=>heute=()=>t,U:()=>U,faellige,neue,neuProTag}; // fuer Tests
})();
