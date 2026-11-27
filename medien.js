"use strict";
// Medienzeit (U-017): Minuten erspielen, selbst einloesen, Auswertung je Tag und Woche fuer die Eltern.
// Daten je Kind in D.medien, uebersteht Zuruecksetzen (kern.js):
//   start    Zeitpunkt der ersten Aufzeichnung. Fruehere Tage zeigen nur, was geuebt wurde, ohne Minuten.
//   regeln   {Zeitstempel: Regel}. Jede Aenderung ist eine neue Fassung; ein Tag rechnet mit der Fassung, die an seinem Ende galt.
//   tag[t]   je Tag (KERN.heute()): w {Wort-Id:1} verschiedene Woerter, nach dem Tag verdichtet zu wn;
//            z {Geraet:{e,m}} Lernsekunden je Fach; u {Geraet:{Uebung:{n,g,v,a,t,l}}} Runden (ueberlebt die Kappung des Verlaufs);
//            s {"g:"|"m:"+Ebene: {f,name,n,schwer,t}} zum ersten Mal geschaffte Ebenen
//   ein      {Zeitstempel+Geraet: {t,min,storno}} Einloesungen
// Alles liegt unter Schluesseln, die KERN.misch vereinigt: zwei Geraete verlieren beim Abgleich nichts.
window.MEDIEN=(()=>{
const REGEL={an:true,stueck:10,proStueck:5,vokMax:30,lernMin:30,ebene:10,schwer:15,langAb:12,mathe:10,tagMax:60,verfall:20};
const FELDER=[ // Schluessel, Text davor, Einheit danach, kleinster und groesster Wert
  ["stueck","Vokabeln: je","Wörter …",1,100],["proStueck","… gibt es","Minuten",0,60],["vokMax","Vokabeln höchstens","Minuten am Tag",0,240],
  ["lernMin","Vokabelminuten voll ab","Minuten Lernzeit am Tag",0,240],["ebene","Grammatik-Ebene geschafft","Minuten",0,120],
  ["schwer","lange oder schwere Grammatik-Ebene","Minuten",0,120],["langAb","lang heißt ab","Aufgaben",1,100],["mathe","Mathe-Ebene geschafft","Minuten",0,120],
  ["tagMax","Höchstens","Minuten am Tag",0,600],["verfall","Rest verfällt Sonntag um","Uhr (24 = Mitternacht)",0,24]];

// ---------- Zeit ----------
let uhr=()=>Date.now();
const tagVon=t=>{ const d=new Date(t); return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5); };
const heute=()=>tagVon(uhr());
const wtag=d=>((d+4)%7+7)%7;                  // 0 Sonntag ... 6 Samstag
const montag=d=>d-(wtag(d)+6)%7;
const um=(d,std)=>{ const x=new Date(d*864e5); return new Date(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate(),std).getTime(); };
const WT=["So","Mo","Di","Mi","Do","Fr","Sa"], zw=n=>String(n).padStart(2,"0");
const tagText=d=>{ const x=new Date(d*864e5); return `${WT[wtag(d)]} ${zw(x.getUTCDate())}.${zw(x.getUTCMonth()+1)}.`; };
const kurz=d=>{ const x=new Date(d*864e5); return `${x.getUTCDate()}.${x.getUTCMonth()+1}.`; };
const uhrzeit=t=>new Date(t).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
const stunde=s=>s>=24?"Mitternacht":`${s} Uhr`;
const h=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const summe=(l,f)=>l.reduce((a,x)=>a+f(x),0);
const zahl=v=>(Math.round(v*10)/10).toLocaleString("de-DE");
const name=n=>h(KERN.fam().namen[n]||"");

// ---------- Daten ----------
function gid(){ let g=KERN.geraet.id; if(!g){ g=Math.random().toString(36).slice(2,8); KERN.setzGeraet({id:g}); } return g; }
const von=D=>{ const m=D?.medien||{}; return {start:m.start||0,regeln:m.regeln||{},tag:m.tag||{},ein:m.ein||{}}; };
function M(){ // zum Schreiben, nur fuer das gewaehlte Kind
  const D=KERN.D; if(!D.medien) D.medien={}; const m=D.medien; for(const k of ["tag","ein","regeln"]) if(!m[k]) m[k]={};
  if(!m.start){ m.start=Date.now(); if(!Object.keys(m.regeln).length) m.regeln[m.start]={...REGEL}; }
  return m;
}
const tagM=(m,d)=>m.tag[d]||(m.tag[d]={});
function aktuell(m){ let b=null,bt=-1; for(const k in m.regeln) if(+k>bt){ bt=+k; b=m.regeln[k]; } return {...REGEL,...(b||{})}; }
function regel(m,d){ // vor der ersten Fassung gilt die erste
  const ende=um(d+1,0); let b=null,bt=-1,e=null,et=Infinity;
  for(const k in m.regeln){ const t=+k; if(t<ende&&t>bt){ bt=t; b=m.regeln[k]; } if(t<et){ et=t; e=m.regeln[k]; } }
  return {...REGEL,...(b||e||{})}; }

// ---------- Aufzeichnen (aus kern.js, vokabeln.js, spiel.js, mathe.js) ----------
const fach=()=>typeof ort==="string"&&ort.startsWith("@m")?"m":"e";
function verdichte(m,d){ for(const k in m.tag){ const t=m.tag[k]; if(+k<d&&t.w){ t.wn=Math.max(t.wn||0,Object.keys(t.w).length); delete t.w; } } }
function tick(d){ if(!KERN.nr) return; const m=M(), t=tagM(m,d), g=gid(); verdichte(m,d); t.z=t.z||{}; const z=t.z[g]=t.z[g]||{}, f=fach(); z[f]=(z[f]||0)+15; }
function wort(id){ if(!KERN.nr) return; const m=M(), d=KERN.heute(); verdichte(m,d); const t=tagM(m,d); (t.w=t.w||{})[id]=1; }
function runde(was,gut,anz,art){ if(!KERN.nr||!anz) return; const t=tagM(M(),KERN.heute()), g=gid(); t.u=t.u||{};
  const u=t.u[g]=t.u[g]||{}, e=u[was]||(u[was]={n:0,g:0,v:0,a:art||"",t:Date.now()}); e.n++; e.g+=gut||0; e.v+=anz; e.l=Date.now(); }
// schwer: selbst ins Englische uebersetzen oder einen eigenen Text schreiben. Lang: ab regel.langAb Aufgaben (beim Rechnen).
const schwerE=(f,e)=>f==="g"&&(e.typ==="schreiben"||/^Übersetzen/.test(e.name||""));
function ebene(f,e,n){ // f "g" Grammatik, "m" Mathe. Nur beim ersten Mal, auch nach einem Zuruecksetzen nicht noch einmal.
  if(!KERN.nr||!e) return; const m=M(), k=f+":"+e.id;
  if(Object.values(m.tag).some(t=>t.s?.[k])) return;
  const t=tagM(m,KERN.heute()); (t.s=t.s||{})[k]={f,name:[f==="g"?e.bereich?.name:e.b?.name,e.name].filter(Boolean).join(": "),n:n||0,schwer:schwerE(f,e),t:Date.now()};
}

// ---------- Rechnen ----------
function woerter(D,m,d){ const t=m.tag[d]||{}, ids=new Set(Object.keys(t.w||{})), hv=D.vok?.heute; if(hv?.tag===d) for(const i of hv.ids||[]) ids.add(i); return Math.max(t.wn||0,ids.size); }
function fachSek(m,d){ const r={e:0,m:0}, z=m.tag[d]?.z||{}; for(const g in z){ r.e+=z[g].e||0; r.m+=z[g].m||0; } return r; }
const sek=(D,m,d)=>{ const f=fachSek(m,d); return Math.max(f.e+f.m,D.zeit?.[d]||0); };
function ebenenAm(m,d){ const s=m.tag[d]?.s||{}; // hat ein anderes Geraet dieselbe Ebene frueher geschafft, zaehlt nur der fruehere Tag
  return Object.entries(s).filter(([k])=>!Object.keys(m.tag).some(x=>+x<d&&m.tag[x].s?.[k])).map(([k,v])=>({k,...v})).sort((a,b)=>a.t-b.t); }
// Ein Tag: Vokabeln floor(n/stueck)*proStueck, Deckel vokMax, mal Lernzeit/lernMin (hoechstens 1), auf proStueck abgerundet; dazu Ebenen; Tagesdeckel.
function rechne(D,d,m=von(D)){
  const r=regel(m,d), n=woerter(D,m,d), min=Math.floor(sek(D,m,d)/60), ein=Math.max(1,r.proStueck);
  const x={d,r,n,min,laeuft:d===heute(),vor:!m.start||d<tagVon(m.start),aus:!r.an};
  x.vRoh=Math.floor(n/Math.max(1,r.stueck))*r.proStueck;
  x.vDeckel=Math.min(x.vRoh,r.vokMax); x.abVok=x.vRoh-x.vDeckel;
  x.voll=!(r.lernMin>0&&min<r.lernMin);
  x.vMin=x.voll?x.vDeckel:Math.floor(x.vDeckel*min/(r.lernMin*ein))*ein;   // ganzzahlig gerechnet, kein Rundungsfehler
  x.gek=x.vDeckel-x.vMin;
  x.eb=ebenenAm(m,d).map(e=>{ const lang=e.f==="g"&&e.n>=r.langAb; return {...e,lang,min:e.f==="m"?r.mathe:e.schwer||lang?r.schwer:r.ebene}; });
  x.summe=x.vMin+summe(x.eb,e=>e.min); x.erspielt=Math.min(x.summe,r.tagMax); x.abTag=x.summe-x.erspielt;
  if(x.vor||x.aus) x.erspielt=x.gek=x.abVok=x.abTag=0;
  x.gekuerzt=x.gek; x.abgeschnitten=x.abVok+x.abTag;
  return x;
}
// Woche Montag bis Sonntag. Einloesungen zaehlen von Verfall zu Verfall (Sonntag, regel.verfall Uhr).
function woche(D,mo,m=von(D)){
  const hT=heute(), tage=[]; for(let d=mo;d<mo+7&&d<=hT;d++) tage.push(rechne(D,d,m));
  const ab=um(mo-1,regel(m,mo-1).verfall), bis=um(mo+6,regel(m,mo+6).verfall);
  const ein=Object.entries(m.ein).map(([k,v])=>({k,...v})).filter(e=>e.t>=ab&&e.t<bis).sort((a,b)=>a.t-b.t);
  const w={mo,tage,ein,ab,bis,vorbei:uhr()>=bis,erspielt:summe(tage,x=>x.erspielt),gekuerzt:summe(tage,x=>x.gekuerzt),abgeschnitten:summe(tage,x=>x.abgeschnitten),
    eingeloest:summe(ein.filter(e=>!e.storno),e=>e.min)};
  const rest=w.erspielt-w.eingeloest; w.guthaben=w.vorbei?0:Math.max(0,rest); w.verfallen=w.vorbei?Math.max(0,rest):0; w.ueber=Math.max(0,-rest);
  return w;
}
function konto(D,m=von(D)){ const mo=montag(heute()), w=woche(D,mo,m); return w.vorbei?woche(D,mo+7,m):w; }
function einloesen(min){
  min=Math.floor(+min); if(!KERN.nr) return "Kein Kind gewählt."; if(!(min>0)) return "Gib ein, wie viele Minuten du nimmst.";
  const g=konto(KERN.D).guthaben; if(min>g) return `Du hast nur ${g} ${g===1?"Minute":"Minuten"}.`;
  const t=uhr(); M().ein[t+gid()]={t,min}; KERN.speichere("medien",KERN.D.medien); if(KERN.verbunden()) KERN.abgleich(); zeige(); return "";
}

// ---------- Ecke fuer das Kind ----------
let zuletzt=null, plusUhr=0;
function zeige(){
  const b=document.getElementById("bMedien"); if(!b) return;
  const D=KERN.D, m=von(D), an=!!KERN.nr&&aktuell(m).an&&!(typeof elternAuf!=="undefined"&&elternAuf);
  b.hidden=!an; if(!an){ zuletzt=null; return; }
  const g=konto(D,m).guthaben;
  if(zuletzt!==null&&g>zuletzt){ b.dataset.plus="+"+(g-zuletzt); b.classList.remove("plus"); void b.offsetWidth; b.classList.add("plus"); clearTimeout(plusUhr); plusUhr=setTimeout(()=>b.classList.remove("plus"),2600); }
  if(g!==zuletzt){ b.innerHTML=`<span aria-hidden="true">🎮</span> <b>${g}</b> <small>min</small>`; b.setAttribute("aria-label",`Medienzeit: ${g} Minuten. Antippen für Einzelheiten.`); }
  zuletzt=g;
}
function oeffne(){
  if(!KERN.nr) return; let dlg=document.getElementById("medien");
  if(!dlg){ dlg=document.createElement("dialog"); dlg.id="medien"; dlg.className="mdialog"; document.body.append(dlg);
    dlg.addEventListener("keydown",e=>e.stopPropagation()); dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); }); }
  male(dlg); if(!dlg.open) dlg.showModal();
}
function male(dlg,meldung){
  const D=KERN.D, m=von(D), w=konto(D,m), x=rechne(D,heute(),m), r=x.r, z=[];
  if(x.n) z.push(`📚 ${x.n} ${x.n===1?"Wort":"Wörter"} geübt: ${x.vDeckel} Minuten${x.abVok?` (mehr als ${r.vokMax} gibt es für Vokabeln nicht)`:""}`);
  if(r.proStueck&&x.vRoh<r.vokMax){ const f=r.stueck-x.n%r.stueck; z.push(`Noch ${f} ${f===1?"Wort":"Wörter"}, dann gibt es ${r.proStueck} Minuten mehr.`); }
  if(x.gek) z.push(`⏱️ Du hast heute ${x.min} Minuten gelernt. Ab ${r.lernMin} Minuten zählen die Vokabelminuten voll, jetzt zählen ${x.vMin}.`);
  for(const e of x.eb) z.push(`${e.f==="m"?"🧮":"✏️"} ${h(e.name)} geschafft: ${e.min} Minuten`);
  if(x.abTag) z.push(`Mehr als ${r.tagMax} Minuten am Tag gibt es nicht.`);
  const g=w.guthaben;
  dlg.innerHTML=`<h2>🎮 Deine Medienzeit</h2><p class="mgross"><b>${g}</b> ${g===1?"Minute":"Minuten"}</p>
    <p>Heute erspielt: <b>${x.erspielt}</b> Minuten. Diese Woche erspielt: ${w.erspielt}, eingelöst: ${w.eingeloest}.</p>
    ${z.length?`<ul>${z.map(s=>`<li>${s}</li>`).join("")}</ul>`:""}
    <form class="meinloesen"><label>Einlösen <input type="number" inputmode="numeric" min="1" max="${g}" step="1" id="mmin" ${g?"":"disabled"}> Minuten</label>
      <button class="haupt" ${g?"":"disabled"}>Einlösen</button><p class="meld" role="status">${meldung||""}</p></form>
    ${w.ein.length?`<h3>Eingelöst diese Woche</h3><ul>${w.ein.map(e=>`<li>${e.storno?"<s>":""}${tagText(tagVon(e.t))} ${uhrzeit(e.t)}: ${e.min} Minuten${e.storno?"</s> (zurückgenommen)":""}</li>`).join("")}</ul>`:""}
    <p><small>Sonntag um ${stunde(regel(m,w.mo+6).verfall)} verfällt, was übrig ist.</small></p>
    <div class="knoepfe"><button class="neben" type="button" id="mzu">Schließen</button></div>`;
  const f=dlg.querySelector("form"), b=f.querySelector("button"), i=f.querySelector("input"), sag=t=>f.querySelector(".meld").textContent=t;
  i.oninput=()=>{ delete b.dataset.ok; b.textContent="Einlösen"; sag(""); };
  f.onsubmit=e=>{ e.preventDefault(); const v=Math.floor(+i.value);
    if(!(v>0)) return sag("Gib ein, wie viele Minuten du nimmst."); if(v>g) return sag(`Du hast nur ${g} ${g===1?"Minute":"Minuten"}.`);
    if(b.dataset.ok!==String(v)){ b.dataset.ok=v; b.textContent=`Ja, ${v} Minuten einlösen`; return sag("Stimmt das? Dann noch einmal tippen."); }
    const fehler=einloesen(v); if(fehler) return sag(fehler); male(dlg,`${v} Minuten eingelöst. Viel Spaß!`); };
  dlg.querySelector("#mzu").onclick=()=>dlg.close();
}

// ---------- Elternbereich ----------
function regelText(r,k){
  return `<ol class="mregel">
   <li><b>Vokabeln:</b> Für je ${r.stueck} verschiedene Wörter, die ${k} an einem Tag übt, gibt es ${r.proStueck} Minuten. Angefangene ${r.stueck}er zählen nicht, es wird abgerundet. Dasselbe Wort zweimal zählt einmal.</li>
   <li><b>Deckel Vokabeln:</b> Mehr als ${r.vokMax} Minuten gibt es für Vokabeln an einem Tag nicht${r.proStueck?` (erreicht ab ${Math.ceil(r.vokMax/r.proStueck)*r.stueck} Wörtern)`:""}. Der Rest wird abgeschnitten.</li>
   <li><b>Lernzeit:</b> Die Vokabelminuten gibt es nur voll, wenn ${k} an dem Tag mindestens ${r.lernMin} Minuten gelernt hat (alle Fächer zusammen; gezählt wird nur Zeit, in der wirklich geübt wird). Sonst werden sie gekürzt: Vokabelminuten × Lernzeit ÷ ${r.lernMin}, dann auf volle ${Math.max(1,r.proStueck)} Minuten abgerundet. Beispiel: 20 Minuten aus Vokabeln, 18 Minuten gelernt: 20 × 18 ÷ ${r.lernMin} = ${zahl(20*18/Math.max(1,r.lernMin))}, das gibt ${Math.floor(20*18/(Math.max(1,r.lernMin)*Math.max(1,r.proStueck)))*Math.max(1,r.proStueck)} Minuten.</li>
   <li><b>Grammatik:</b> Eine Ebene zum ersten Mal geschafft (drei Viertel auf Anhieb richtig) gibt ${r.ebene} Minuten. Lange Ebenen (ab ${r.langAb} Aufgaben) und schwere (Übersetzen ins Englische, eigener Text) geben ${r.schwer} Minuten. Wiederholen gibt nichts, auch nicht nach dem Zurücksetzen.</li>
   <li><b>Mathe:</b> Eine Mathe-Ebene zum ersten Mal geschafft gibt ${r.mathe} Minuten.</li>
   <li><b>Tagesdeckel:</b> Höchstens ${r.tagMax} Minuten am Tag. Was darüber liegt, wird abgeschnitten und steht unten in der Statistik.</li>
   <li><b>Woche:</b> Die Minuten sammeln sich über die Tage. Sonntag um ${stunde(r.verfall)} verfällt, was übrig ist. Was am Sonntag danach noch erspielt wird, verfällt mit.</li>
   <li><b>Einlösen:</b> ${k} tippt oben rechts auf die Minuten und trägt selbst ein, wie viele Minuten genommen werden, höchstens das Guthaben. Eine Einlösung könnt ihr hier am Tag zurücknehmen.</li>
   <li>Der laufende Tag wird ständig neu gerechnet, bis er vorbei ist. Eine geänderte Regel gilt ab dem Tag der Änderung, frühere Tage bleiben, wie sie waren.</li></ol>`;
}
function warum(x,k){
  const r=x.r, l=[];
  if(x.vor) return `<p>Vor dem Start der Medienzeit. Für diesen Tag gibt es keine Minuten.</p>`;
  if(x.aus) return `<p>Die Medienzeit war für ${k} ausgeschaltet.</p>`;
  if(x.n){ const z=Math.floor(x.n/Math.max(1,r.stueck)), rest=x.n-z*r.stueck;
    l.push(`Vokabeln: ${x.n} verschiedene Wörter, das sind ${z} × ${r.stueck} → ${z} × ${r.proStueck} = <b>${x.vRoh} min</b>.${rest?rest===1?" Das übrige Wort zählt nicht (abgerundet).":` Die übrigen ${rest} Wörter zählen nicht (abgerundet).`:""}`);
    if(x.abVok) l.push(`Deckel Vokabeln: höchstens ${r.vokMax} min am Tag → <b>${x.abVok} min abgeschnitten</b>.`);
    if(x.vDeckel) l.push(x.voll?`Lernzeit ${x.min} min, mindestens ${r.lernMin} → Vokabelminuten voll: <b>${x.vMin} min</b>.`
      :`Lernzeit nur ${x.min} von ${r.lernMin} min → ${x.vDeckel} × ${x.min} ÷ ${r.lernMin} = ${zahl(x.vDeckel*x.min/r.lernMin)}, auf volle ${Math.max(1,r.proStueck)} abgerundet: <b>${x.vMin} min</b>. <b>${x.gek} min gekürzt</b>, weil ${k} weniger als ${r.lernMin} Minuten gelernt hat.`);
  }
  for(const e of x.eb) l.push(`${e.f==="m"?"Mathe":"Grammatik"} „${h(e.name)}“ zum ersten Mal geschafft${e.f==="g"&&(e.n||e.schwer)?` (${e.n?`${e.n} Aufgaben`:"eigener Text"}${e.schwer?", zählt als schwer":e.lang?", zählt als lang":""})`:""} → <b>${e.min} min</b>.`);
  if(!x.n&&!x.eb.length) l.push("Keine Vokabeln und keine neu geschaffte Ebene.");
  l.push(`Zusammen ${x.summe} min.${x.abTag?` Tagesdeckel ${r.tagMax} min → <b>${x.abTag} min abgeschnitten</b>.`:""}`);
  l.push(`Erspielt: <b>${x.erspielt} min</b>${x.laeuft?" (der Tag läuft noch)":""}.`);
  return `<ol>${l.map(s=>`<li>${s}</li>`).join("")}</ol>`;
}
function runden(m,d,vl){ // je Uebung zusammengefasst: alle Geraete, vor dem Start aus dem Verlauf
  const z={}, add=(w,n,g,v,t)=>{ const a=z[w]||(z[w]={w,n:0,g:0,v:0,t}); a.n+=n; a.g+=g; a.v+=v; a.t=Math.min(a.t,t); };
  const u=m.tag[d]?.u||{}; for(const g in u) for(const [w,e] of Object.entries(u[g])) add(w,e.n,e.g,e.v,e.t);
  for(const v of vl[d]||[]) if(!m.start||v.t<m.start) add(v.w,1,v.g,v.v,v.t);
  return Object.values(z).sort((a,b)=>a.t-b.t);
}
function tagHtml(m,x,vl,k){
  const f=fachSek(m,x.d), rl=runden(m,x.d,vl), ein=Object.entries(m.ein).map(([kk,v])=>({k:kk,...v})).filter(e=>tagVon(e.t)===x.d).sort((a,b)=>a.t-b.t);
  return `<details class="mtag" data-id="t${x.d}"><summary><b>${tagText(x.d)}</b><span>${x.min} min gelernt</span><span class="mplus">${x.vor?"":x.aus?"aus":`+${x.erspielt} min`}</span></summary><div class="mtin">
    <p>Gelernt: <b>${x.min} Minuten</b>${f.e+f.m?` (Englisch ${Math.round(f.e/60)}, Mathe ${Math.round(f.m/60)})`:""}.${x.laeuft?" Der Tag läuft noch.":""} Vokabeln: <b>${x.n}</b> verschiedene Wörter.</p>
    ${rl.length?`<table class="mrunden"><thead><tr><th>Übung</th><th>Runden</th><th>richtig</th></tr></thead><tbody>${rl.map(a=>`<tr><td>${h(a.w)}</td><td>${a.n}</td><td>${a.g} von ${a.v}</td></tr>`).join("")}</tbody></table>`:"<p><small>Keine Runde zu Ende gespielt.</small></p>"}
    ${x.eb.length?`<p>Zum ersten Mal geschafft: ${x.eb.map(e=>`${e.f==="m"?"🧮":"✏️"} ${h(e.name)}`).join(", ")}</p>`:""}
    ${ein.map(e=>`<p class="mein">${e.storno?"<s>":""}Eingelöst um ${uhrzeit(e.t)}: ${e.min} min${e.storno?"</s> zurückgenommen":` <button type="button" class="neben mstorno" data-k="${h(e.k)}">Zurücknehmen</button>`}</p>`).join("")}
    <details class="warum" data-id="w${x.d}"><summary>Wie haben sich die Spielminuten zusammengesetzt?</summary>${warum(x,k)}</details></div></details>`;
}
function inhalt(n){
  const D=n===KERN.nr?KERN.D:KERN.daten(n), m=von(D), r=aktuell(m), k=name(n), hT=heute(), kw=konto(D,m), vl={};
  for(const v of D.verlauf||[]) (vl[tagVon(v.t)]=vl[tagVon(v.t)]||[]).push(v);
  const aktiv=d=>d===hT||(D.zeit?.[d]||0)>0||vl[d]||m.tag[d]||Object.values(m.ein).some(e=>tagVon(e.t)===d);
  const z=(v,t)=>`<div><b>${v}</b><small>${t}</small></div>`, wochen=[];
  for(let i=0;i<8;i++){ const w=woche(D,montag(hT)-7*i,m), tage=w.tage.filter(x=>aktiv(x.d)).reverse(); if(i&&!tage.length&&!w.ein.length) continue;
    wochen.push(`<details class="mwoche" data-id="k${w.mo}" ${i===0?"open":""}><summary><b>${i===0?"Diese Woche":i===1?"Letzte Woche":`Woche ab ${kurz(w.mo)}`}</b> <small>${kurz(w.mo)} bis ${kurz(w.mo+6)}</small></summary>
      <div class="mzahlen">${z(w.erspielt,"erspielt")}${z(w.eingeloest,"eingelöst")}${w.vorbei?z(w.verfallen,"verfallen"):z(w.guthaben,"übrig")}${z(w.gekuerzt,"gekürzt")}${z(w.abgeschnitten,"abgeschnitten")}</div>
      ${w.ueber?`<p class="rot"><small>${w.ueber} min mehr eingelöst als erspielt (zwei Geräte gleichzeitig).</small></p>`:""}
      ${tage.map(x=>tagHtml(m,x,vl,k)).join("")||"<p><small>In dieser Woche nicht geübt.</small></p>"}</details>`); }
  return `<h3>🎮 Medienzeit</h3>
    <p>${r.an?`Guthaben jetzt: <b>${kw.guthaben} min</b>. Verfällt ${tagText(kw.mo+6)} um ${stunde(regel(m,kw.mo+6).verfall)}.${m.start?"":` Gezählt wird ab der ersten Übung mit dieser Fassung.`}`:`Ausgeschaltet: ${k} sieht keine Minuten.`}</p>
    <p><small>Tippen öffnet Woche und Tag. Erspielt ist, was gutgeschrieben wurde; gekürzt (zu wenig Lernzeit) und abgeschnitten (Deckel) kam nicht dazu.</small></p>
    ${wochen.join("")}
    <details class="mregeln" data-id="regeln"><summary>Regeln und Einstellungen für ${k}</summary>${regelText(r,k)}
      <form class="mform"><label><input type="checkbox" name="an" ${r.an?"checked":""}> Medienzeit für ${k} an</label>
      ${FELDER.map(([f,vor,nach,a,b])=>`<label>${vor} <input type="number" inputmode="numeric" name="${f}" min="${a}" max="${b}" step="1" value="${r[f]}"> ${nach}</label>`).join("")}</form></details>`;
}
function aendern(n,f){ const x=JSON.parse(JSON.stringify(n===KERN.nr?KERN.D:KERN.daten(n))); x.medien=x.medien||{}; for(const k of ["tag","ein","regeln"]) x.medien[k]=x.medien[k]||{}; f(x.medien); KERN.ersetze(n,x); }
function neu(sec,n,meld){ const offen=[...sec.querySelectorAll("details[open]")].map(d=>d.dataset.id); sec.innerHTML=inhalt(n);
  sec.querySelectorAll("details").forEach(d=>d.open=offen.includes(d.dataset.id)); verdrahte(sec,n,meld); zeige(); }
function verdrahte(sec,n,meld){
  sec.querySelectorAll(".mstorno").forEach(b=>b.onclick=()=>{ if(!b.dataset.sicher){ b.dataset.sicher=1; b.textContent="Wirklich zurücknehmen?"; return; }
    aendern(n,m=>{ if(m.ein[b.dataset.k]) m.ein[b.dataset.k].storno=true; }); neu(sec,n,meld); meld("Einlösung zurückgenommen, die Minuten sind wieder da."); });
  const f=sec.querySelector(".mform"); f.onsubmit=e=>e.preventDefault();
  f.onchange=()=>{ const alt=aktuell(von(n===KERN.nr?KERN.D:KERN.daten(n))), r={an:f.elements.an.checked};
    for(const [k,,,a,b] of FELDER){ const v=Math.round(+f.elements[k].value); r[k]=Number.isFinite(v)&&f.elements[k].value!==""?Math.min(b,Math.max(a,v)):alt[k]; }
    aendern(n,m=>m.regeln[uhr()]=r); neu(sec,n,meld); meld("Regel gespeichert. Sie gilt ab heute, frühere Tage bleiben."); };
}
function eltern(n){ return {html:`<section id="medien-e">${inhalt(n)}</section>`,verdrahte:(root,meld)=>verdrahte(root.querySelector("#medien-e"),n,meld)}; }

document.getElementById("bMedien").onclick=oeffne;
setInterval(zeige,2000); zeige();

return {REGEL,FELDER,rechne,woche,konto,regel,aktuell,montag,heute,tagVon,um,einloesen,oeffne,zeige,eltern,tick,wort,runde,ebene,von,
  setzUhr:t=>{ uhr=t==null?()=>Date.now():()=>t; }};
})();
