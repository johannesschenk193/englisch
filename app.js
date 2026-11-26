"use strict";
// Startseite, Kinderwahl, Elternbereich. Nutzt KERN (kern.js) und die Spielfunktionen aus spiel.js und vokabeln.js.
const BILDER=["🦊","🐼","🐯","🐸","🦁","🐨","🐵","🐶","🐱","🦉","🦖","🚀","⚽","🎸"];
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const kname=n=>KERN.fam().namen[n], kbild=n=>KERN.fam().bild[n];
let elternAuf=false, elternKind=0, elternZiel=null;
const prozent=(g,v)=>v?Math.round(100*g/v):0;
const balken=(g,v)=>`<span class="bar"><i style="width:${prozent(g,v)}%"></i></span>`;
const datum=t=>new Date(t).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
const zeitpunkt=t=>new Date(t).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});

function kopf(){ $("titel").textContent=KERN.nr?`${kbild(KERN.nr)} ${kname(KERN.nr)}`:"Englisch-Trainer"; }
function appZurueck(){
  if(ort==="@eltern") return elternKind?elternStart():(elternAuf=false,KERN.nr?menue():startseite());
  if(ort==="@geraet"||ort==="@neu") return elternStart();
  return KERN.nr?menue():startseite();
}
function blatt(html){ const d=document.createElement("div"); d.className="einstellung eltern"; d.innerHTML=html; $("spiele").className=""; $("spiele").replaceChildren(d); scrollTo(0,0); return d; }

// ---------- Startseite ----------
function startseite(){
  ort="@start"; ruhe("Wer übt?","Tipp auf dein Bild."); kopf(); $("bMenue").hidden=!KERN.nr;
  karten(KERN.kinder().map(n=>{ const d=KERN.daten(n), t=d.verlauf[d.verlauf.length-1]?.t;
    return {i:esc(kbild(n)),t:esc(kname(n)),u:t?`zuletzt geübt ${datum(t)}`:KERN.hatInhalt(d)?"":"noch nicht angefangen",f:()=>KERN.waehle(n)}; }));
  fussleiste([["🔒 Eltern",elternTor],...(KERN.verbunden()?[]:[["Einrichtungscode eingeben",codeEingeben]])]);
}
function fussleiste(l){ const d=document.createElement("div"); d.className="fussleiste"; l.forEach(([t,f])=>{ const b=document.createElement("button"); b.type="button"; b.textContent=t; b.onclick=f; d.append(b); }); $("spiele").append(d); }
// unter dem Hauptmenue eines Kindes
function hauptFuss(){ fussleiste([["📖 Im Buch weiter?",frageBuch],...(KERN.geraet.nur?[]:[["Kind wechseln",startseite]]),["🔒 Eltern",elternTor]]); }

function codeEingeben(){
  ort="@code"; ruhe("Gerät einrichten","Füge den Code ein, den du im Elternbereich auf dem ersten Gerät bekommen hast.");
  const d=blatt(`<label>Einrichtungscode <input type="text" id="code" autocomplete="off" autocapitalize="off" spellcheck="false"></label><p class="meld"></p><button type="button" class="haupt">Einrichten</button>`);
  d.querySelector("button").onclick=()=>richteEin(d.querySelector("#code").value,t=>d.querySelector(".meld").textContent=t);
}
async function richteEin(code,sagt){
  const j=KERN.ausCode(code); if(!j) return sagt("Der Code ist nicht vollständig.");
  sagt("Verbinde ..."); KERN.setzGeraet({repo:j.r});
  const f=await KERN.pruefe(j.t); if(f) return sagt(f);
  KERN.setzGeraet({token:j.t,nur:j.k||0}); if(j.k) KERN.setz("et:kind",j.k);
  await KERN.abgleich(true); location.replace(location.pathname);
}

// ---------- Elternbereich ----------
function elternTor(){
  if(elternAuf) return elternStart();
  const neu=!KERN.fam().pin; ort="@tor";
  ruhe("Elternbereich",neu?"Leg eine PIN mit mindestens vier Ziffern fest. Sie hält Kinder aus dem Elternbereich fern.":"Gib die PIN ein.");
  const d=blatt(`<form><label>PIN <input type="password" inputmode="numeric" id="pin" autocomplete="off"></label>${neu?'<label>PIN wiederholen <input type="password" inputmode="numeric" id="pin2" autocomplete="off"></label>':""}<p class="meld"></p><button class="haupt">${neu?"PIN festlegen":"Öffnen"}</button></form>`);
  const meld=d.querySelector(".meld"); d.querySelector("#pin").focus();
  d.querySelector("form").onsubmit=async e=>{ e.preventDefault(); const p=d.querySelector("#pin").value;
    if(neu){ if(!/^\d{4,}$/.test(p)) return meld.textContent="Mindestens vier Ziffern."; if(p!==d.querySelector("#pin2").value) return meld.textContent="Die beiden Eingaben sind verschieden."; await KERN.setzPin(p); }
    else if(!await KERN.pinOk(p)){ d.querySelector("#pin").value=""; return meld.textContent="Die PIN stimmt nicht."; }
    elternAuf=true; (elternZiel||elternStart)(); elternZiel=null; };
}
// rechnet mit dem Stand eines bestimmten Kindes, ohne ihn zu veraendern
function mitKind(n,f){
  const d=n===KERN.nr?KERN.D:KERN.daten(n), altS=stand, altV=vokPruef.tausch(null);
  stand=Object.assign(leererStand(),JSON.parse(JSON.stringify(d.stand))); vokPruef.tausch({...vokPruef.leer(),...JSON.parse(JSON.stringify(d.vok))});
  try{ return f(d); }finally{ stand=altS; vokPruef.tausch(altV); }
}
function kennzahlen(n){
  return mitKind(n,d=>{ const h=KERN.heute(), woche=[0,1,2,3,4,5,6].map(i=>d.zeit[h-i]||0), ab=Date.now()-7*864e5, v=d.verlauf.filter(x=>x.t>ab);
    const ber=BEREICHE.filter(bOffen).map(b=>({b,f:fortschrittZahl(b)})), g=ber.reduce((a,x)=>a+x.f[0],0), ges=ber.reduce((a,x)=>a+x.f[1],0);
    return {d,ber,g,ges,min:Math.round(woche.reduce((a,b)=>a+b,0)/60),tage:woche.filter(x=>x>0).length,uebungen:v.length,quote:prozent(v.reduce((a,x)=>a+x.g,0),v.reduce((a,x)=>a+x.v,0)),
      fehler:offeneFehler().map(k=>({k,t:k.startsWith("x|")?loesung(ITEM[k]):k.replace(/^(\w+):(\w+)$/,(_,a,i)=>{const z=ZEILEN.find(z=>z.id===i);return `${z.en} = ${z.wort}`;}),r:rest(k)})),
      vok:vokPruef.ALLE.filter(w=>vokPruef.L(w).f).length,faellig:vokPruef.faellige().length,
      schwer:vokPruef.ALLE.filter(w=>vokPruef.L(w).s>0).sort((a,b)=>vokPruef.L(b).s-vokPruef.L(a).s).slice(0,15).map(w=>({en:w.en,de:w.de,e:vokPruef.L(w)})),kasten:vokPruef.kasten(),tests:JSON.parse(JSON.stringify(vokPruef.S().tests)),test:vokPruef.S().test,ziel:vokPruef.ziel(),heute:vokPruef.geuebt(),auswahl:vokPruef.auswahlText(vokPruef.S()),
      buch:BUCH.pos(),letzte:d.verlauf.filter(v=>v.a!=="buch").slice(-1)[0]?.t||0}; });
}
function elternStart(){
  elternKind=0; ort="@eltern"; ruhe("Elternbereich",statusText()); kopf();
  const nr=KERN.geraet.nur?[KERN.geraet.nur]:KERN.kinder();
  karten(nr.map(n=>{ const z=kennzahlen(n); return {i:esc(kbild(n)),t:esc(kname(n)),u:z.letzte?`7 Tage: ${z.min} min, ${z.uebungen} Übungen${z.uebungen?`, ${z.quote} % richtig`:""}`:z.g||z.vok?`${z.g} Ebenen geschafft, ${z.vok} Vokabeln gelernt`:"noch nicht angefangen",
    st:z.letzte?`zuletzt ${datum(z.letzte)}`:"",p:[z.g,z.ges],f:()=>elternDetail(n)}; }));
  fussleiste([...(KERN.geraet.nur?[]:[["＋ Kind hinzufügen",kindNeu]]),["Geräte und Abgleich",geraete],["PIN ändern",pinAendern],["Elternbereich schließen",()=>{elternAuf=false;KERN.nr?menue():startseite();}]]);
  if(KERN.verbunden()&&Date.now()-KERN.status.t>15000) KERN.abgleich(true).then(()=>{ if(ort==="@eltern"&&!elternKind) elternStart(); });
}
const statusText=()=>!KERN.verbunden()?"Ohne Abgleich: Jedes Gerät merkt sich seinen eigenen Stand.":KERN.status.t?`Abgleich: ${KERN.status.text} (${zeitpunkt(KERN.status.t)})`:"Abgleich läuft ...";
function pinAendern(){
  ort="@geraet"; ruhe("PIN ändern","");
  const d=blatt(`<form><label>Neue PIN <input type="password" inputmode="numeric" id="p1" autocomplete="off"></label><label>wiederholen <input type="password" inputmode="numeric" id="p2" autocomplete="off"></label><p class="meld"></p><button class="haupt">Speichern</button></form>`);
  d.querySelector("form").onsubmit=async e=>{ e.preventDefault(); const p=d.querySelector("#p1").value; const m=d.querySelector(".meld"); if(!/^\d{4,}$/.test(p)) return m.textContent="Mindestens vier Ziffern."; if(p!==d.querySelector("#p2").value) return m.textContent="Die beiden Eingaben sind verschieden."; await KERN.setzPin(p); elternStart(); };
}
function kindNeu(){
  ort="@neu"; ruhe("Kind hinzufügen","Name und Bild kannst du später ändern.");
  const frei=BILDER.filter(b=>!KERN.kinder().map(kbild).includes(b)); let bild=frei[0]||BILDER[0];
  const d=blatt(`<form><label>Name <input type="text" id="name" maxlength="20" autocomplete="off"></label><div class="bilder">${BILDER.map(b=>`<button type="button" aria-pressed="${b===bild}">${b}</button>`).join("")}</div><p class="meld"></p><button class="haupt">Anlegen</button></form>`);
  d.querySelectorAll(".bilder button").forEach(b=>b.onclick=()=>{ bild=b.textContent; d.querySelectorAll(".bilder button").forEach(x=>x.setAttribute("aria-pressed",x===b)); });
  d.querySelector("#name").focus();
  d.querySelector("form").onsubmit=e=>{ e.preventDefault(); const t=d.querySelector("#name").value.trim(); if(!t) return d.querySelector(".meld").textContent="Gib einen Namen ein.";
    elternDetail(KERN.neuesKind(t,bild)); };
}
// Zweimal tippen: erst fragt der Knopf nach, dann passiert es
function zweimal(b,frage,warnung,meld,tu){ b.onclick=async()=>{ if(!b.dataset.sicher){ b.dataset.sicher=1; b.dataset.alt=b.textContent; b.textContent=frage; meld(warnung);
  setTimeout(()=>{ if(b.isConnected&&b.dataset.sicher){ delete b.dataset.sicher; b.textContent=b.dataset.alt; meld(""); } },8000); return; }
  b.disabled=true; meld("Einen Moment ..."); if(KERN.verbunden()) await KERN.abgleich(true); await tu(); }; }
function elternDetail(n){
  elternKind=n; ort="@eltern"; const z=kennzahlen(n);
  ruhe(`${kbild(n)} ${kname(n)}`,z.letzte?`Zuletzt geübt ${zeitpunkt(z.letzte)}.`:z.g||z.vok?"Seit dem Umzug noch nicht geübt, der alte Stand ist da.":"Noch nicht angefangen.");
  const tests=Object.entries(z.tests), testName=id=>id==="gelernt"?"Alles Gelernte":Object.values(vokPruef.GRUPPEN).flat().find(a=>a.key===id)?.name||id;
  const texte=Object.entries(z.d.stand.texte||{}).filter(x=>x[1]);
  const d=blatt(`
   <section><h3>Letzte 7 Tage</h3><div class="zahlen"><div><b>${z.min}</b><small>Minuten</small></div><div><b>${z.tage}</b><small>Tage geübt</small></div><div><b>${z.uebungen}</b><small>Übungen</small></div><div><b>${z.uebungen?z.quote+" %":"–"}</b><small>richtig</small></div></div></section>
   <section><h3>Grammatik</h3>${z.ber.map(x=>`<div class="zeile2"><span>${x.b.icon} ${esc(x.b.name)}</span><small>${x.f[0]} von ${x.f[1]}</small>${balken(x.f[0],x.f[1])}</div>`).join("")}</section>
   <section><h3>Vokabeln</h3><p>${z.vok} von ${vokPruef.ALLE.length} gelernt, heute fällig: ${z.faellig}. Gerade dran: ${esc(z.auswahl)}.</p><div class="zeile2"><span>Heute geübt</span><small>${z.heute} von ${z.ziel} Wörtern</small>${balken(Math.min(z.heute,z.ziel),z.ziel)}</div>${z.kasten}
     ${tests.length?`<table><thead><tr><th>Vokabeltest</th><th>zuletzt</th><th>bestes</th><th>Anzahl</th></tr></thead><tbody>${tests.map(([id,t])=>`<tr><td>${esc(testName(id))}</td><td>${t.zuletzt} %</td><td>${t.best} %</td><td>${t.n}</td></tr>`).join("")}</tbody></table>`:"<p><small>Noch kein Vokabeltest.</small></p>"}
     <details><summary>Schwere Wörter (${z.schwer.length})</summary><table><tbody>${z.schwer.map(w=>`<tr><td>${esc(w.en)}</td><td>${esc(w.de)}</td><td><small>${w.e.r} richtig, ${w.e.h} fast, ${w.e.x} falsch</small></td></tr>`).join("")||"<tr><td>keine</td></tr>"}</tbody></table></details></section>
   <section><details><summary>Offene Fehler Grammatik (${z.fehler.length})</summary><ul>${z.fehler.slice(0,30).map(f=>`<li>${esc(f.t)}</li>`).join("")||"<li>keine</li>"}</ul></details>
     <details><summary>Verlauf (${z.d.verlauf.length})</summary><table><thead><tr><th>Wann</th><th>Übung</th><th>Richtig</th></tr></thead><tbody>${[...z.d.verlauf].reverse().slice(0,60).map(v=>`<tr><td>${zeitpunkt(v.t)}</td><td>${esc(v.w)}</td><td>${v.g} von ${v.v}</td></tr>`).join("")||"<tr><td>noch leer</td></tr>"}</tbody></table></details>
     ${texte.length?`<details><summary>Eigene Texte (${texte.length})</summary>${texte.map(([t,x])=>`<p><b>${esc(t)}</b><br>${esc(x)}</p>`).join("")}</details>`:""}</section>
   <section><h3>📖 Stand im Buch</h3><p><small>Bis hierhin kommen Vokabeln und Grammatik dran. ${esc(kname(n))} wird an Schultagen beim Start gefragt, ob es weiterging.</small></p>
     <label>Zuletzt im Unterricht <select id="buch">${BUCH.ABSCHNITT.map(a=>`<option value="${a.id}" ${a.id===z.buch?"selected":""}>${esc(a.name)}</option>`).join("")}</select></label></section>
   <section id="dran"><h3>Vokabeln: Was ist dran?</h3><label>Tagesziel <input type="number" id="ziel" min="5" max="300" step="5" value="${z.ziel}"> Wörter am Tag</label>
     <label>Nächster Vokabeltest am <input type="date" id="termin" value="${esc(z.test||"")}"></label></section>
   <section><h3>Einstellungen</h3><label>Name <input type="text" id="name" maxlength="20" value="${esc(kname(n))}" autocomplete="off"></label>
     <div class="bilder">${BILDER.map(b=>`<button type="button" aria-pressed="${b===kbild(n)}">${b}</button>`).join("")}</div>
     <div class="reihe2"><button type="button" class="neben" id="alsKind">Als ${esc(kname(n))} üben</button><button type="button" class="neben" id="sichern">Sicherung speichern</button><label class="neben datei">Sicherung laden<input type="file" id="laden" accept=".json" hidden></label></div></section>
   <section><h3>Spielstand</h3><p><small>Zurücksetzen fängt von vorn an, das Kind bleibt. Entfernen nimmt das Kind ganz heraus. Beides gilt auf allen verbundenen Geräten. Vorher am besten eine Sicherung speichern.</small></p>
     <div class="reihe2"><button type="button" class="neben" id="nullG">Grammatik zurücksetzen</button><button type="button" class="neben" id="nullV">Vokabeln zurücksetzen</button><button type="button" class="neben rot" id="null">Alles zurücksetzen</button>${KERN.kinder().length>1&&!KERN.geraet.nur?`<button type="button" class="neben rot" id="weg">Kind entfernen</button>`:""}</div><p class="meld" id="emeld"></p></section>`);
  const q=s=>d.querySelector(s), meld=t=>q("#emeld").textContent=t;
  const vokAendern=f=>{ const x=JSON.parse(JSON.stringify(n===KERN.nr?KERN.D:KERN.daten(n))); x.vok={...vokPruef.leer(),...x.vok}; f(x.vok); KERN.ersetze(n,x); };
  const vokJetzt=()=>({...vokPruef.leer(),...JSON.parse(JSON.stringify((n===KERN.nr?KERN.D:KERN.daten(n)).vok))});
  q("#dran").append(vokWahl(vokJetzt(),v=>vokAendern(x=>{ x.nach=v.nach; x.wahl=v.wahl; })));
  q("#termin").onchange=e=>vokAendern(v=>v.test=e.target.value);
  q("#buch").onchange=e=>{ const id=e.target.value, x=JSON.parse(JSON.stringify(n===KERN.nr?KERN.D:KERN.daten(n))); x.stand=x.stand||{}; x.vok=x.vok||{};
    const altI=BUCH.idx(x.stand.buch?.pos||window.BUCH_START), neuI=BUCH.idx(id);
    x.stand.buch={...(x.stand.buch||{}),pos:id,i:neuI,seit:Date.now()};
    if(neuI>altI){ x.vok.fokus=BUCH.REIHE.slice(altI+1,neuI+1); x.stand.neuFrei=[...new Set([...(x.stand.neuFrei||[]),...BEREICHE.filter(b=>b.ab&&x.vok.fokus.includes(b.ab)).map(b=>b.id)])]; }
    KERN.ersetze(n,x); $("emeld").textContent=`Stand im Buch: ${BUCH.abschnitt(id).name}.`; };
  q("#ziel").onchange=e=>{ const w=Math.max(5,Math.min(300,Math.round(+e.target.value||vokPruef.ZIEL))); e.target.value=w; vokAendern(v=>v.ziel=w); };
  q("#name").onchange=e=>{ const t=e.target.value.trim(); if(t){ KERN.setzFamilie({namen:{...KERN.fam().namen,[n]:t}}); kopf(); meld("Name gespeichert."); } };
  d.querySelectorAll(".bilder button").forEach(b=>b.onclick=()=>{ KERN.setzFamilie({bild:{...KERN.fam().bild,[n]:b.textContent}}); d.querySelectorAll(".bilder button").forEach(x=>x.setAttribute("aria-pressed",x===b)); kopf(); });
  q("#alsKind").onclick=()=>KERN.waehle(n);
  q("#sichern").onclick=()=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(n===KERN.nr?KERN.D:KERN.daten(n))],{type:"application/json"})); a.download=`englisch-${kname(n)}-${new Date().toISOString().slice(0,10)}.json`; a.click(); };
  q("#laden").onchange=async e=>{ try{ const x=JSON.parse(await e.target.files[0].text()); if(!x.stand||!x.vok) throw 0; KERN.ersetze(n,{...KERN.leer(),...x,reset:Date.now()}); elternDetail(n); }catch(_){ meld("Das ist keine Sicherung dieses Spiels."); } };
  const k=kname(n);
  zweimal(q("#nullG"),"Wirklich Grammatik zurücksetzen?",`Alle Ebenen, Fehler und eigenen Texte von ${k} gehen verloren. Die Vokabeln bleiben.`,meld,()=>{ KERN.zuruecksetzen(n,"stand"); elternDetail(n); $("emeld").textContent=("Grammatik zurückgesetzt."); });
  zweimal(q("#nullV"),"Wirklich Vokabeln zurücksetzen?",`Karteikasten und Tests von ${k} fangen von vorn an. Die Grammatik bleibt.`,meld,()=>{ KERN.zuruecksetzen(n,"vok"); elternDetail(n); $("emeld").textContent=("Vokabeln zurückgesetzt."); });
  zweimal(q("#null"),"Wirklich alles zurücksetzen?",`Der ganze Spielstand von ${k} geht verloren, Name und Bild bleiben.`,meld,()=>{ KERN.zuruecksetzen(n); elternDetail(n); $("emeld").textContent=("Alles zurückgesetzt."); });
  if(q("#weg")) zweimal(q("#weg"),`Wirklich ${k} entfernen?`,`${k} verschwindet von allen Geräten, der Spielstand wird gelöscht.`,meld,async()=>{ KERN.entferneKind(n); if(KERN.verbunden()) await KERN.abgleich(true); if(KERN.nr===n) return location.reload(); elternStart(); });
}
// ---------- Startfrage: Englisch heute? Wo seid ihr im Buch? ----------
// Montag bis Freitag einmal am Tag. Jede Antwort zaehlt als gefragt, auch "Weiß ich nicht".
const schultag=()=>{ const d=new Date().getDay(); return d>=1&&d<=5; };
function startFrage(){ if(!KERN.nr||!schultag()||stand.buch?.frage===KERN.heute()) return menue(); frageEnglisch(); }
function gefragt(){ stand.buch={...(stand.buch||{}),pos:BUCH.pos(),i:BUCH.idx(BUCH.pos()),frage:KERN.heute()}; merke(); }
const kurz=a=>esc(a.name.replace(/^([^:]+): /,"$1 · "));
function antworten(d,l){ const f=document.createElement("div"); f.className="frage"; l.forEach(([t,k,fn,sub])=>{ const b=document.createElement("button"); b.type="button"; b.className=k; b.innerHTML=t+(sub?`<small>${sub}</small>`:""); b.onclick=fn; f.append(b); }); d.append(f); return f; }
function frageEnglisch(){
  ort="@frage"; ruhe(`Hallo ${esc(kname(KERN.nr))}!`,"Hattest du heute Englisch in der Schule?"); kopf();
  const d=blatt(""); antworten(d,[["Ja","haupt",frageBuch],["Nein","neben",()=>{ gefragt(); menue(); }],["Weiß ich nicht","neben",()=>{ gefragt(); menue(); }]]);
}
function frageBuch(){
  ort="@frage"; const p=BUCH.abschnitt(BUCH.pos()), n=BUCH.naechste(), weiter=BUCH.ABSCHNITT.slice(BUCH.idx(BUCH.pos())+2,BUCH.idx(BUCH.pos())+8);
  ruhe("Habt ihr im Buch weitergemacht?",`Zuletzt warst du bei ${p?p.name:"–"}.`);
  const d=blatt("");
  const f=antworten(d,[...(n?[[`Ja, weiter mit ${kurz(n)}`,"haupt",()=>weiterBis(n.id),`Diese Überschrift steht im Buch. Vokabeln ${esc(n.seite)}`]]:[]),
    ["Nein, wir sind noch beim alten Abschnitt","neben",()=>{ gefragt(); menue(); }]]);
  if(weiter.length){ const det=document.createElement("details"); det.innerHTML=`<summary>Noch weiter, und zwar bis ...</summary>`; f.append(det);
    antworten(det,weiter.map(a=>[kurz(a),"neben",()=>weiterBis(a.id),esc(a.seite)])); }
  const form=document.createElement("form"); form.innerHTML=`<label>Oder die Seite im Buch: <input type="number" inputmode="numeric" min="1" max="300" id="bseite"></label><button class="haupt">OK</button><p class="meld"></p>`; f.append(form);
  form.onsubmit=e=>{ e.preventDefault(); const s=parseInt(form.querySelector("#bseite").value); if(!(s>0)) return form.querySelector(".meld").textContent="Gib eine Seitenzahl ein."; nachSeite(s); };
  antworten(f,[["Weiß ich nicht","neben",()=>{ gefragt(); menue(); }]]);
}
// Seite der Vokabelliste (ab 180): steht dort. Seite im Schulbuch: einmal fragen, welche Ueberschrift dort steht, und fuer alle Kinder merken.
function nachSeite(s){
  if(s>=180){ const a=BUCH.ausListenseite(s); return a?weiterBis(a.id):menue(); }
  const id=KERN.fam().seiten?.[s]; if(id&&BUCH.idx(id)>=0) return weiterBis(id);
  ort="@frage"; ruhe(`Seite ${s}`,"Welche Überschrift steht auf dieser Seite oder davor? Dann merke ich mir die Seite.");
  const d=blatt(""), ab=Math.max(0,BUCH.idx(BUCH.pos())-1);
  antworten(d,[...BUCH.ABSCHNITT.slice(ab,ab+10).map(a=>[kurz(a),"neben",()=>{ KERN.setzFamilie({seiten:{...(KERN.fam().seiten||{}),[s]:a.id}}); weiterBis(a.id); },esc(a.seite)]),
    ["Weiß ich nicht","neben",()=>{ gefragt(); menue(); }]]);
}
function weiterBis(id){
  const r=BUCH.setzen(id);
  if(!r.neu.length){ gefragt(); return menue(); }
  const frei=BEREICHE.filter(b=>b.ab&&r.neu.includes(b.ab));
  stand.neuFrei=[...new Set([...(stand.neuFrei||[]),...frei.map(b=>b.id)])]; merke();
  KERN.log(`Im Buch weiter: ${BUCH.abschnitt(id).name}`,0,0,"buch");
  ort="@frage"; ruhe("Super, dann geht's weiter!",`Neu dran: ${r.neu.map(x=>BUCH.abschnitt(x).name).join(", ")}`.replace(/([^.!?])$/,"$1."));
  const d=blatt(`<section><h3>📚 Vokabeln</h3><p>${r.woerter} neue Wörter. Die lernst du jetzt zuerst, die alten wiederholst du nebenbei.</p></section>
    ${frei.length?`<section class="neufrei"><h3>🔓 Neu freigeschaltet in Grammatik</h3><ul>${frei.map(b=>`<li>${b.icon} <b>${esc(b.name)}</b>: ${esc(b.was)}</li>`).join("")}</ul></section>`:""}`);
  antworten(d,[["Los geht's","haupt",menue]]);
}
// ---------- Geraete ----------
function geraete(){
  ort="@geraet"; ruhe("Geräte und Abgleich",statusText());
  const v=KERN.verbunden(), g=KERN.geraet;
  const d=blatt(`<section><h3>Dieses Gerät</h3><label>Hier übt <select id="nur"><option value="0">jedes Kind (Auswahl am Start)</option>${KERN.kinder().map(n=>`<option value="${n}" ${g.nur===n?"selected":""}>nur ${esc(kname(n))}</option>`).join("")}</select></label></section>
   <section><h3>Abgleich zwischen den Geräten</h3>${v?`<p>Verbunden mit der privaten Ablage ${esc(g.repo)}.</p><div class="reihe2"><button type="button" class="haupt" id="jetzt">Jetzt abgleichen</button><button type="button" class="neben" id="trennen">Abgleich auf diesem Gerät beenden</button></div>`
    :`<p>Damit PC und Handy denselben Stand haben, braucht jedes Gerät einmal den Schlüssel für die private Ablage.</p><label>Schlüssel (beginnt mit github_pat_) <input type="password" id="token" autocomplete="off"></label><button type="button" class="haupt" id="verbinden">Verbinden</button>`}<p class="meld"></p></section>
   ${v?`<section><h3>Weiteres Gerät einrichten</h3><p>Schick den Link auf das andere Gerät und öffne ihn dort. Auf dem iPhone danach Teilen → Zum Home-Bildschirm und dort einmal den Code eingeben. Wer den Link hat, kann die Spielstände lesen und ändern.</p><label>Für <select id="fuer"><option value="0">alle Kinder (Elterngerät)</option>${KERN.kinder().map(n=>`<option value="${n}">nur ${esc(kname(n))}</option>`).join("")}</select></label><div class="reihe2"><button type="button" class="haupt" id="teilen">Link teilen</button><button type="button" class="neben" id="kcode">Code kopieren</button></div><p class="meld" id="m2"></p></section>`:""}`);
  const q=s=>d.querySelector(s), meld=t=>q(".meld").textContent=t;
  q("#nur").onchange=e=>{ KERN.setzGeraet({nur:+e.target.value}); if(+e.target.value) KERN.setz("et:kind",+e.target.value); location.reload(); };
  if(q("#verbinden")) q("#verbinden").onclick=async()=>{ const t=q("#token").value.trim(); if(!t) return meld("Füge den Schlüssel ein."); meld("Prüfe ..."); const f=await KERN.pruefe(t); if(f) return meld(f); KERN.setzGeraet({token:t}); meld("Verbunden, gleiche ab ..."); await KERN.abgleich(true); geraete(); };
  if(q("#jetzt")) q("#jetzt").onclick=async()=>{ meld("Läuft ..."); await KERN.abgleich(true); geraete(); };
  if(q("#trennen")) q("#trennen").onclick=()=>{ KERN.trenne(); geraete(); };
  const kopiere=async t=>{ try{ await navigator.clipboard.writeText(t); q("#m2").textContent="Kopiert."; }catch(e){ q("#m2").textContent=t; } };
  if(q("#kcode")) q("#kcode").onclick=()=>kopiere(KERN.codeFuer(+q("#fuer").value));
  if(q("#teilen")) q("#teilen").onclick=async()=>{ const link=location.origin+location.pathname+"#geraet="+KERN.codeFuer(+q("#fuer").value); if(navigator.share){ try{ return await navigator.share({title:"Englisch-Trainer",url:link}); }catch(e){ if(e.name==="AbortError") return; } } kopiere(link); };
}

// ---------- Start ----------
KERN.melde=()=>{ if(ort==="@start") startseite(); };
KERN.beiNeu=d=>{ stand=Object.assign(leererStand(),JSON.parse(JSON.stringify(d.stand))); vokPruef.tausch({...vokPruef.leer(),...JSON.parse(JSON.stringify(d.vok))}); if(modus==="menue"&&!ort) menue(); };
(async()=>{
  kopf();
  const h=location.hash;
  if(h.startsWith("#geraet=")){ history.replaceState(null,"",location.pathname);
    ort="@code"; const c=h.slice(8); ruhe("Gerät einrichten","Der Code für dieses Gerät ist da. Am PC und auf Android: Hier einrichten.");
    const d=blatt(`<p class="meld"></p><p>Auf dem iPhone: Teilen → Zum Home-Bildschirm. Öffne dann das Symbol und füge dort den Code ein.</p><div class="reihe2"><button type="button" class="neben" id="kc">Code kopieren</button><button type="button" class="haupt" id="hier">Hier einrichten</button></div>`);
    d.querySelector("#kc").onclick=async()=>{ try{ await navigator.clipboard.writeText(c); d.querySelector(".meld").textContent="Code kopiert."; }catch(e){ d.querySelector(".meld").textContent=c; } };
    d.querySelector("#hier").onclick=()=>richteEin(c,t=>d.querySelector(".meld").textContent=t); return; }
  if(h.startsWith("#umzug=")){ // einmaliger Umzug aus der alten Fassung auf diesem PC
    history.replaceState(null,"",location.pathname);
    try{ const x=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(h.slice(7).replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0))));
      const alt=KERN.daten(x.kind), neu={...KERN.leer(),stand:x.stand||{},vok:x.vok||{}};
      KERN.setz("et:k"+x.kind,KERN.hatInhalt(alt)?KERN.misch(undefined,alt,neu):neu); return KERN.waehle(x.kind); }catch(e){ console.error(e); } }
  KERN.nr?startFrage():startseite();
  if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
