"use strict";
// Mathe als zweites Fach (E-229). Gleiche Kinder und gleicher Abgleich wie Englisch, eigener Lernstand je Kind in D.mathe.
// Grundlage: Mathebuch Klasse 5, Gymnasium NRW, Kapitel 1 "Natuerliche Zahlen und Groessen" (S. 6-40).
// Aufgaben entstehen aus Zufallszahlen: zieh() -> p, mach(p) -> Aufgabe. Gespeichert wird nur p, damit Fehler und
// angefangene Runden genau so wiederkommen.
// Nutzt aus spiel.js: $, ruhe, zeige, karten, sag, piep, abschluss, mischen, sterne, TAB, ort, lauf;
// aus app.js (erst beim Aufruf): kopf, kname, blatt, antworten, fussleiste, balken, schultag, fachWahl, startseite, elternTor.
const MATHE=(()=>{
const heute=()=>KERN.heute();

// ---------- Zahlen schreiben und lesen ----------
const NB=" ";
const rund=x=>Number.isInteger(x)?x:Number(x.toFixed(9));
function fz(x){ x=rund(+x); const neg=x<0; let [g,d]=String(Math.abs(x)).split("."); if(g.length>=5) g=g.replace(/\B(?=(\d{3})+(?!\d))/g,NB); return (neg?"−":"")+g+(d?","+d:""); }
const geld=e=>Number.isInteger(rund(e))?fz(e):rund(e).toFixed(2).replace(".",",");
function lies(s){
  s=String(s).trim().replace(/[\s   ]+/g,"").replace(/[a-zA-ZäöüÄÖÜß€]+\.?$/,"").replace(/^[−–]/,"-");
  if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s=s.replace(/\./g,""); // 23.000 = 23 000
  s=s.replace(",","."); return /^-?(\d+(\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;
}
const gleich=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
const R={int:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick:a=>a[Math.floor(Math.random()*a.length)],ja:(q=.5)=>Math.random()<q};
const h=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const ohneTags=t=>String(t).replace(/<[^>]*>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const NULLEN=["eine Null","zwei Nullen","drei Nullen","vier Nullen","fünf Nullen"];
const STW=["Einern","Zehnern","Hundertern","Tausendern","Zehntausendern","Hunderttausendern","Millionen","Zehnmillionen","Hundertmillionen","Milliarden","Zehnmilliarden","Hundertmilliarden"];

// Zahlwort wie im Buch: "elf Millionen fünfhunderttausendeins"
const EIN=["null","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf","dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn"];
const ZEH=["","","zwanzig","dreißig","vierzig","fünfzig","sechzig","siebzig","achtzig","neunzig"];
function bis999(n,ende){
  const hu=Math.floor(n/100), r=n%100; let t=hu?(hu===1?"ein":EIN[hu])+"hundert":"";
  if(r){ if(r<20) t+=r===1&&!ende?"ein":EIN[r]; else { const e=r%10; t+=(e?(e===1?"ein":EIN[e])+"und":"")+ZEH[Math.floor(r/10)]; } }
  return t;
}
const gross1=(x,ein,viele)=>x===1?ein:(x%100===1?bis999(x,true).slice(0,-1)+"e":bis999(x,true))+" "+viele;
function zahlwort(n){
  if(!n) return "null";
  const mrd=Math.floor(n/1e9), mio=Math.floor(n/1e6)%1000, tsd=Math.floor(n/1000)%1000, rest=n%1000, t=[];
  if(mrd) t.push(gross1(mrd,"eine Milliarde","Milliarden"));
  if(mio) t.push(gross1(mio,"eine Million","Millionen"));
  let w=""; if(tsd) w+=(tsd===1?"ein":bis999(tsd,false))+"tausend"; if(rest) w+=bis999(rest,true);
  if(w) t.push(w); return t.join(" ");
}
const bloecke=n=>[Math.floor(n/1e9),Math.floor(n/1e6)%1000,Math.floor(n/1e3)%1000,n%1000];
function paeckchenText(n){ const b=bloecke(n), t=[];
  if(b[0]) t.push(`${b[0]} ${b[0]===1?"Milliarde":"Milliarden"}`); if(b[1]) t.push(`${b[1]} ${b[1]===1?"Million":"Millionen"}`);
  if(b[2]) t.push(`${b[2]} Tausend`); if(b[3]||!t.length) t.push(String(b[3])); return t.join(" "); }

// Roemische Zahlen (Streifzug S. 16-17)
const ROM=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
const roemisch=n=>{ let t=""; for(const [w,z] of ROM) while(n>=w){ t+=z; n-=w; } return t; };
const RW={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
function vonRoemisch(s){ s=String(s).trim().toUpperCase(); if(!/^[IVXLCDM]+$/.test(s)) return NaN; let n=0; for(let i=0;i<s.length;i++){ const a=RW[s[i]], b=RW[s[i+1]]||0; n+=a<b?-a:a; } return n; }
function rWeg(n){ const t=[Math.floor(n/1000)*1000,Math.floor(n/100)%10*100,Math.floor(n/10)%10*10,n%10].filter(Boolean);
  return `${t.map(fz).join(" + ")} = ${t.map(roemisch).join(" + ")} = ${roemisch(n)}`; }

// ---------- Bilder ----------
const tafel=(kopf,z)=>`<table class="mtafel"><tr>${kopf.map(k=>`<th>${k}</th>`).join("")}</tr><tr>${z.map(x=>`<td>${x}</td>`).join("")}</tr></table>`;
function striche(n){
  const b=Math.floor(n/5), r=n%5; let x=10, t="";
  const s=x0=>`<line x1="${x0}" y1="8" x2="${x0}" y2="48"/>`;
  for(let i=0;i<b;i++){ for(let k=0;k<4;k++) t+=s(x+k*9); t+=`<line x1="${x-5}" y1="40" x2="${x+32}" y2="15"/>`; x+=50; }
  for(let k=0;k<r;k++) t+=s(x+k*9);
  const w=x+r*9+6; return `<svg class="mbild" viewBox="0 0 ${w} 56" style="max-width:${Math.round(w*1.3)}px" role="img" aria-label="Strichliste"><g stroke="#1f2a1a" stroke-width="3.2" stroke-linecap="round">${t}</g></svg>`;
}
function saeulen(lab,w,titel){
  const max=Math.max(...w), top=max+(max%2?1:2), W=360, H=236, l=34, b=40, t=22, ih=H-b-t, sw=(W-l-10)/lab.length;
  let g=`<text x="${l}" y="13" font-weight="700">${h(titel)}</text>`;
  for(let v=0;v<=top;v++){ const y=t+ih-ih*v/top; g+=`<line x1="${l}" x2="${W-6}" y1="${y}" y2="${y}" stroke="${v%2?"#e9eee4":"#c9d3bf"}"/>`; if(v%2===0) g+=`<text x="${l-6}" y="${y+4}" text-anchor="end">${v}</text>`; }
  lab.forEach((k,i)=>{ const x=l+i*sw+sw*.2, hh=ih*w[i]/top; g+=`<rect x="${x}" y="${t+ih-hh}" width="${sw*.6}" height="${hh}" fill="#4c8f16" rx="2"/><text x="${x+sw*.3}" y="${H-b+17}" text-anchor="middle">${h(k)}</text>`; });
  g+=`<line x1="${l}" y1="${t-4}" x2="${l}" y2="${t+ih}" stroke="#1f2a1a" stroke-width="1.5"/><line x1="${l}" y1="${t+ih}" x2="${W-6}" y2="${t+ih}" stroke="#1f2a1a" stroke-width="1.5"/>`;
  return `<svg class="mbild" viewBox="0 0 ${W} ${H}" role="img" aria-label="Säulendiagramm" font-size="12" fill="#1f2a1a">${g}</svg>`;
}
function strahl(a,s,L,m){
  const N=2*L, W=360, x0=22, x1=W-26, dx=(x1-x0)/N;
  let g=`<line x1="${x0-12}" y1="50" x2="${W-6}" y2="50" stroke="#1f2a1a" stroke-width="2"/><path d="M${W-4} 50 l-10 -5 v10 z" fill="#1f2a1a"/>`;
  for(let i=0;i<=N;i++){ const x=x0+i*dx, lang=i%L===0; g+=`<line x1="${x}" x2="${x}" y1="${lang?37:43}" y2="${lang?63:57}" stroke="#1f2a1a" stroke-width="${lang?2.2:1.3}"/>`;
    if(lang) g+=`<text x="${x}" y="82" text-anchor="middle">${fz(a+i*s)}</text>`; }
  for(const [mm,lb] of Array.isArray(m)?m:[[m,"A"]]){ const xm=x0+mm*dx; g+=`<path d="M${xm} 35 l-7 -12 h14 z" fill="#c3262e"/><text x="${xm}" y="17" text-anchor="middle" font-weight="700" fill="#c3262e">${lb}</text>`; }
  return `<svg class="mbild" viewBox="0 0 ${W} 92" role="img" aria-label="Zahlenstrahl" font-size="13" fill="#1f2a1a">${g}</svg>`;
}
// Zahl mit markierter Rundungsstelle (unterstrichen) und der Ziffer daneben (fett)
function markiert(n,k){
  const s=String(n), i=s.length-1-Math.round(Math.log10(k)); let t="";
  for(let j=0;j<s.length;j++){ if(j&&s.length>=5&&(s.length-j)%3===0) t+=NB; t+=j===i?`<u>${s[j]}</u>`:j===i+1?`<b class="mrechts">${s[j]}</b>`:s[j]; }
  return t;
}

// ---------- Einheiten ----------
const LG={km:1e6,m:1000,dm:100,cm:10,mm:1}, GW={t:1e9,kg:1e6,g:1000,mg:1}, ZT={d:86400,h:3600,min:60,s:1};
// Umrechnen von q in der Einheit von nach der Einheit nach; extra(v,a,F,klein) darf einen eigenen Tipp liefern
function um(q,von,nach,U,extra){
  const fak=U[von]/U[nach], klein=fak>1, F=rund(klein?fak:1/fak), a=rund(q*fak), gr=klein?von:nach, kl=klein?nach:von;
  return {f:`${fz(q)} ${von} = {0} ${nach}`,a:[a],
    hilfe:klein?`1 ${gr} sind ${fz(F)} ${kl}. ${fz(q)} ${gr} sind also ${fz(q)} mal ${fz(F)} ${kl}.`:U===ZT?`1 ${gr} = ${fz(F)} ${kl}. Teile durch ${fz(F)}.`:`1 ${gr} sind ${fz(F)} ${kl}. Wie oft stecken ${fz(F)} ${kl} in ${fz(q)} ${kl}? So viele ${gr} sind es.`,
    weg:klein?`${fz(q)} ${von} = ${fz(q)} · ${fz(F)} ${nach} = ${fz(a)} ${nach}`:U===ZT?`${fz(q)} ${von} = ${fz(q)} : ${fz(F)} ${nach} = ${fz(a)} ${nach}`
      :Number.isInteger(a)?`${fz(q)} ${von} = ${fz(a)} · ${fz(F)} ${von} = ${fz(a)} ${nach}`
      :`${fz(q)} ${von} = ${Math.floor(a)} · ${fz(F)} ${von} + ${fz(rund(q-Math.floor(a)*F))} ${von} = ${Math.floor(a)} ${nach} ${fz(rund(q-Math.floor(a)*F))} ${von} = ${fz(a)} ${nach}`,
    tipp:(i,v)=>extra?.(v,a,F,klein)||(gleich(v,rund(q/fak))?(klein?`${nach} ist die kleinere Einheit. Da wird die Zahl größer, nicht kleiner.`:`${nach} ist die größere Einheit. Da wird die Zahl kleiner, nicht größer.`):null)};
}
// m und cm: die Stelle, an der Jonathan haengt (Johannes, 26.11.2026)
const mcmTipp=(v,a,F,klein)=>{ if(F!==100) return null;
  if(gleich(v,klein?a/10:a*10)) return klein?"1 m sind 100 cm, nicht 10. Mal 100 heißt: zwei Nullen anhängen.":"Geteilt durch 100 heißt: zwei Nullen weg, nicht nur eine.";
  if(gleich(v,klein?a*10:a/10)) return klein?"Das wären Millimeter. Für Zentimeter: mal 100.":"Zwischen cm und m ist es 100, nicht 1000.";
  return null; };
const uhr=m=>`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`;
const dauer=d=>[Math.floor(d/60)?Math.floor(d/60)+" h":"",d%60?d%60+" min":""].filter(Boolean).join(" ");
function spanneWeg(s,d){
  const e=s+d, nv=Math.ceil(s/60)*60; if(e<=nv) return `${uhr(s)} → ${uhr(e)} sind ${d} min.`;
  const m1=nv-s, hs=Math.floor((e-nv)/60), m2=(e-nv)%60, t=[];
  if(m1) t.push(`${uhr(s)} → ${uhr(nv)} sind ${m1} min`); if(hs) t.push(`${uhr(nv)} → ${uhr(nv+hs*60)} sind ${hs} h`); if(m2) t.push(`${uhr(nv+hs*60)} → ${uhr(e)} sind ${m2} min`);
  return t.join(", ")+`. Zusammen ${dauer(d)}.`;
}

// ---------- Aufgabenbausteine ----------
// E: eine Ebene. zieh() liefert die Zahlen, mach(p) die Aufgabe:
// {frage (HTML), f (Text mit {0} fuer Eingabefelder oder ___ fuer die Luecke), a (Loesungen), typ: eingabe|wahl|ordnen,
//  o (Auswahl), art: zahl|text, bild, hilfe (nach dem zweiten Fehler), weg (Loesungsweg), tipp(i,v), t (Tipp bei Auswahl), l (Loesungssatz)}
const E=(id,name,was,zieh,mach,n)=>({id,name,was,zieh,mach,n:n||10});
const liste=a=>[()=>({i:R.int(0,a.length-1)}),({i})=>a[i]];
const wahl=(frage,a,o,x)=>({typ:"wahl",frage,a,o,...x});

const RSINN=[["die Telefonnummer 865 214",0,"Mit einer gerundeten Nummer erreichst du niemanden."],["die Hausnummer 198",0,"Der Brief käme sonst beim falschen Haus an."],
 ["die Einwohnerzahl von Bielefeld: 328 314",1,"Die Zahl ändert sich ständig, ungefähr reicht: etwa 330 000."],["13 589 Besucher beim Konzert",1,"Für einen Bericht reicht etwa 14 000."],
 ["deine Schuhgröße 37",0,"Schuhe in Größe 40 passen nicht."],["die Postleitzahl 45768",0,"Sonst kommt die Post nicht an."],["die Entfernung zur Sonne: 149 597 871 km",1,"Etwa 150 Millionen km kann man sich merken."],
 ["der Preis an der Kasse: 26,99 €",0,"An der Kasse zahlst du genau."],["62 217 Zuschauer im Stadion",1,"Rund 62 000 genügt für die Zeitung."],["das Gewicht eines Blauwals: 196 000 kg",1,"Tiere wiegen nie genau gleich viel."],
 ["deine PIN 4711",0,"Eine PIN muss genau stimmen."],["die Zahl der Einwohner Deutschlands: 84 607 016",1,"Etwa 85 Millionen reicht."],["die Abfahrt deines Busses: 7:43 Uhr",0,"Sonst ist der Bus weg."],["die Höhe der Zugspitze: 2962 m",1,"Ungefähr 3000 m reicht zum Merken."]];
const SEINHEIT=[["Ein Tisch ist etwa 80 ___ hoch.","cm"],["Ein Zimmer ist etwa 2,50 ___ hoch.","m"],["Eine Büroklammer ist etwa 3 ___ lang.","cm"],["Mit dem Auto fährt man auf der Autobahn in einer Stunde etwa 100 ___.","km"],
 ["Eine Ameise ist etwa 6 ___ lang.","mm"],["Ein DIN-A4-Blatt ist etwa 30 ___ lang.","cm"],["Ein Fußballtor ist 7,32 ___ breit.","m"],["Ein Bleistift ist etwa 18 ___ lang.","cm"],["Eine 1-Cent-Münze ist etwa 2 ___ dick.","mm"],
 ["Der Rhein ist etwa 1230 ___ lang.","km"],["Eine Tafel Schokolade wiegt 100 ___.","g"],["Eine Packung Mehl wiegt 1 ___.","kg"],["Ein Auto wiegt etwa 1 ___.","t"],["Eine Stubenfliege wiegt etwa 15 ___.","mg"],
 ["Ein Elefant wiegt etwa 5 ___.","t"],["Ein Fußball wiegt etwa 450 ___.","g"],["Ein Erwachsener wiegt etwa 75 ___.","kg"],["Die große Pause dauert 20 ___.","min"],["Ein Jahr hat 365 ___.","d"],
 ["Ein Lied dauert etwa 3 ___.","min"],["Ein Schultag dauert etwa 6 ___.","h"],["Einmal blinzeln dauert weniger als 1 ___.","s"],["Ein Fußballspiel dauert 90 ___.","min"],["Die Sommerferien dauern etwa 42 ___.","d"]]
 .map(([f,a])=>({typ:"wahl",f,a,o:["mm","cm","m","km"].includes(a)?["mm","cm","m","km"]:["mg","g","kg","t"].includes(a)?["mg","g","kg","t"]:["s","min","h","d"],t:"Vergleiche mit etwas, das du kennst.",weg:f.replace("___",a)}));
const SWIEVIEL=[["Wie schwer ist eine Wassermelone?","2 kg",["2 g","2 kg","2 t"]],["Wie schwer ist ein Fußball?","500 g",["500 mg","500 g","500 kg"]],["Wie schwer ist ein Pferd?","400 kg",["400 g","400 kg","400 t"]],
 ["Wie schwer ist eine 2-Euro-Münze?","10 g",["10 mg","10 g","10 kg"]],["Wie schwer ist ein Schulranzen mit Büchern?","5 kg",["5 g","5 kg","5 t"]],["Wie schwer ist ein Lkw?","20 t",["20 kg","200 kg","20 t"]],
 ["Wie lang ist ein Bleistift?","18 cm",["18 mm","18 cm","18 m"]],["Wie lang ist ein Klassenraum?","8 m",["8 dm","8 m","8 km"]],["Wie hoch ist eine Tür?","2 m",["2 dm","2 m","20 m"]],
 ["Wie lang ist ein Marienkäfer?","7 mm",["7 mm","7 cm","7 dm"]],["Wie lange dauert Zähneputzen?","3 min",["3 s","3 min","3 h"]],["Wie lange dauert eine Nacht Schlaf?","9 h",["9 min","9 h","9 d"]],
 ["Wie lange dauert ein Wimpernschlag?","1 s",["1 s","1 min","1 h"]],["Wie lange dauern die Herbstferien?","14 d",["14 h","14 d","14 Wochen"]]].map(([frage,a,o])=>wahl(frage,a,o,{t:"Stell es dir vor und vergleiche mit etwas, das du kennst.",weg:`${frage.replace(/^Wie (schwer|lang|hoch|lange) (ist|dauert|dauern) /,"").replace("?","")}: etwa ${a}.`}));
const RFALSCH=[[4,"IIII"],[9,"VIIII"],[14,"XIIII"],[19,"XVIIII"],[40,"XXXX"],[45,"VL"],[49,"IL"],[90,"LXXXX"],[95,"VC"],[99,"IC"],[400,"CCCC"],[490,"XD"],[900,"DCCCC"],[990,"XM"],[999,"IM"],[1999,"MIM"],[10,"VV"],[100,"LL"],[1000,"DD"],[8,"IIX"],[18,"XIIX"],[15,"VX"]];
const RREGEL="Höchstens dreimal dasselbe Zeichen. V, L und D nur einmal. Abziehen nur: I von V und X, X von L und C, C von D und M.";
const DTHEMA=[["Lieblingstier",["Hund","Katze","Pferd","Hamster","Fische"]],["Schulweg",["zu Fuß","Fahrrad","Bus","Auto"]],["Lieblingsfach",["Mathe","Deutsch","Englisch","Sport","Kunst"]],["Geschwister",["keine","eins","zwei","drei"]]];
const FARBEN=["Rot","Blau","Gelb","Grün","Lila"];
const ZIMMER=["Das Kinderzimmer","Die Küche","Das Wohnzimmer","Der Flur","Das Bad"], PLATZ=["Der Schulhof","Das Fußballfeld","Der Parkplatz"];
// was zu der echten Laenge r (in m) passt: kein 22 m langes Kinderzimmer
const HAUS=["Das Haus","Der Garten","Das Handballfeld","Das Schwimmbecken"], WEGE=["Der Schulweg","Die Straße","Der Weg zum Park"];
const ctxVon=(m,c,r)=>m<50?"Das Modell":r<=7?ZIMMER[c%ZIMMER.length]:r<=50?HAUS[c%HAUS.length]:r<=300?PLATZ[c%PLATZ.length]:WEGE[c%WEGE.length];
const LPAARE=[["km","m"],["m","dm"],["dm","cm"],["cm","mm"],["m","cm"],["m","mm"]];
// ueber zwei Stufen, wie 5c und 5d der Klassenarbeit: 4,5 km in dm, 2 400 000 cm in km
const STUFEN=[["cm","m","km"],["km","m","dm"],["km","m","cm"],["mm","cm","m"],["dm","m","km"],["m","cm","mm"],["mm","m","km"]];
// Holzstab wie Aufgabe 6: L cm, 2 Stuecke zu a cm, 1 m c mm, 2 Stuecke zu 2 dm e cm, 5 Saegeschnitte zu s mm; Rest 8 bis 41 cm
function holzZieh(){ const a=R.pick([25,30,35,40,45]), c=R.pick([5,8,12,15,24,40,105]), e=R.int(1,9), s=R.pick([1,2,2,3]), sum=20*a+1000+c+2*(200+10*e)+5*s;
  return {k:4,L:Math.ceil((sum+R.int(80,400))/10),a,c,e,s}; }
const KPAARE=[["km","m",LG],["m","cm",LG],["m","mm",LG],["cm","mm",LG],["dm","cm",LG],["m","dm",LG],["t","kg",GW],["kg","g",GW],["g","mg",GW]];
const KOMMA_AN=F=>Math.round(Math.log10(F));
function kommaZahl(F){ const st=R.int(1,KOMMA_AN(F)), d=10**st; let x; do x=R.int(R.ja(.25)?1:d+1,99*d); while(x%10===0||x%d===0); return x/d; }
const zerlegt=(q,von,nach,F)=>`${Math.floor(q)} ${von} ${fz(rund((q-Math.floor(q))*F))} ${nach}`;
function laengeText(x,f){ // x in mm
  if(f===0) return `${fz(x)} mm`; if(f===1) return `${fz(x/10)} cm`; if(f===2) return `${fz(x/1000)} m`; if(f===3) return `${fz(x/100)} dm`;
  return x>=1000&&x%1000?`${Math.floor(x/1000)} m ${fz((x%1000)/10)} cm`:`${fz(x/10)} cm`; }
const RST=[[10,"Zehner"],[100,"Hunderter"],[1000,"Tausender"],[10000,"Zehntausender"],[100000,"Hunderttausender"]];
const rundeAuf=(n,k)=>Math.round(n/k)*k;
// Arten: knapp an der 5; eine 9 an der Rundungsstelle; Uebertrag ueber mehrere Stellen wie 1 999 541 auf Zehntausender (zweimal so
// oft, Klassenarbeit 1.1, 4b); grosse Zahl auf eine kleine Stelle wie 256 173 auf Zehner, hinten nur Nullen (4c); sonst frei
function rundZieh(){ const s=R.int(0,4), k=RST[s][0], hinten=()=>R.int(5,9)*k/10+R.int(0,k/10-1); let n=R.int(k*2,k*1000); const art=R.int(0,7);
  if(art===0) n=Math.floor(n/k)*k+R.pick([4,5])*k/10+R.int(0,k/10-1);
  else if(art===1&&s<=3) n=(R.int(1,99)*10+9)*k+hinten();
  else if(art===2||art===3){ const q=R.int(2,s<=2?3:2); n=(R.int(1,9)*10**q+10**q-1)*k+hinten(); }
  else if((art===4||art===5)&&s<=2) n=R.int(100000,9999999);
  return {n,s}; }
function rundTipp(n,s){ const [k,name]=RST[s]; return (i,v)=>{
  const a=rundeAuf(n,k), ab=Math.floor(n/k)*k, auf=ab+k, z=Math.floor(n/(k/10))%10;
  if(v===ab&&a===auf) return `Rechts neben der Rundungsstelle steht eine ${z}. Bei 5, 6, 7, 8 und 9 rundest du auf.`;
  if(v===auf&&a===ab) return `Rechts neben der Rundungsstelle steht eine ${z}. Bei 0, 1, 2, 3 und 4 rundest du ab.`;
  let x=n; for(let kk=10;kk<=k;kk*=10) x=rundeAuf(x,kk);
  if(v===x&&x!==a) return "Nicht zweimal runden! Schau nur auf die eine Ziffer rechts neben der Rundungsstelle.";
  const andere=RST.find(([kk])=>kk!==k&&v===rundeAuf(n,kk)); if(andere) return `Das ist auf ${andere[1]} gerundet. Auf ${name} gerundet stehen am Ende ${NULLEN[s]}.`;
  if(v%k) return `Nach der Rundungsstelle gibt es nur Nullen! Auf ${name} gerundet stehen am Ende ${NULLEN[s]}.`;
  const u=Math.floor(n/k); if(a===auf&&u%10===9) return `Die 9 an der Rundungsstelle wird zur 10: Dort steht dann 0, und 1 kommt zur Stelle links dazu. Aus ${fz(u)} ${name}n werden ${fz(u+1)} ${name}.`;
  return null; }; }
const rundWeg=(n,s)=>{ const [k,name]=RST[s], z=Math.floor(n/(k/10))%10, u=Math.floor(n/k);
  return `Rundungsstelle: ${name}. Rechts daneben steht ${z}, also ${z>=5?"aufrunden":"abrunden"}${z>=5&&u%10===9?`, mit Übertrag: Aus ${fz(u)} ${name}n werden ${fz(u+1)} ${name}`:""}. Nach der Rundungsstelle nur Nullen: ${fz(n)} ≈ ${fz(rundeAuf(n,k))}.`; };
function vergleichWeg(a,b){ const s=String(a), t=String(b), z=`${fz(a)} ${a<b?"<":">"} ${fz(b)}`;
  if(s.length!==t.length) return `${fz(Math.max(a,b))} hat mehr Stellen, also ist sie größer: ${z}.`;
  let i=0; while(s[i]===t[i]) i++; return `Gleich viele Stellen. Die erste andere Ziffer steht bei den ${STW[s.length-1-i]}: ${s[i]} gegen ${t[i]}. Also ${z}.`; }
function aendereZiffer(a){ const s=String(a).split(""), i=R.int(0,s.length-1); let d; do d=R.int(i?0:1,9); while(String(d)===s[i]); s[i]=String(d); return Number(s.join("")); }

// ---------- Vergleichen, gemischt (Johannes, 26.11.2026: "größer / kleiner ist zu einfach, muss mehr gemischt werden") ----------
// sieben Arten: Ziffer weit hinten anders, Ziffern vertauscht, Falle mit mehr Stellen, Größen in zwei Einheiten,
// Größe mit Komma, Zahlwort gegen Ziffern, römisch gegen Zahl. Immer mit "=" als Möglichkeit.
const VPAARE=[["km","m",LG],["m","cm",LG],["m","dm",LG],["dm","cm",LG],["cm","mm",LG],["kg","g",GW],["t","kg",GW],["g","mg",GW],["h","min",ZT],["min","s",ZT],["d","h",ZT]];
const VKOMMA=[["m","cm",LG],["km","m",LG],["kg","g",GW],["m","mm",LG]];
const rel=(a,b)=>gleich(a,b)?"=":a<b?"<":">";
function vergleichMix(k){
  if(k===undefined) k=R.int(0,6);
  const zahlen=(a,b)=>({l:fz(a),lw:a,r:fz(b),rw:b,w:vergleichWeg(a,b)});
  const seiten=x=>R.ja()?x:{l:x.r,lw:x.rw,r:x.l,rw:x.lw,w:x.w};
  if(k===0){ const L=R.int(4,8), a=R.int(10**(L-1),10**L-1), s=String(a).split(""), i=R.int(Math.min(2,L-1),L-1); let d; do d=R.int(0,9); while(String(d)===s[i]); s[i]=String(d); return zahlen(a,Number(s.join(""))); }
  if(k===1){ const L=R.int(4,8); for(;;){ const a=R.int(10**(L-1),10**L-1), s=String(a).split(""), i=R.int(1,L-2); if(s[i]===s[i+1]) continue; [s[i],s[i+1]]=[s[i+1],s[i]]; return zahlen(a,Number(s.join(""))); } }
  if(k===2){ const L=R.int(3,6); return seiten(R.ja()?zahlen(10**L+R.int(0,99),10**L-R.int(1,99)):zahlen(R.int(9*10**(L-1),10**L-1),R.int(10**L,Math.round(1.2*10**L)))); }
  if(k===3){ const [g,kl,U]=R.pick(VPAARE), F=U[g]/U[kl], q=R.int(1,9), v=R.int(0,3), ex=q*F, h2=Math.max(1,Math.floor(F/2));
    let x=v===0?ex-R.int(1,h2):v===1?ex+R.int(1,h2):v===2?ex:(U===ZT?q*100:ex/10); if(!Number.isInteger(x)||x<=0) x=ex+1;
    return seiten({l:`${q} ${g}`,lw:q*U[g],r:`${fz(x)} ${kl}`,rw:x*U[kl],w:`Erst in dieselbe Einheit: ${q} ${g} = ${fz(ex)} ${kl}. ${fz(ex)} ${kl} ${rel(ex,x)} ${fz(x)} ${kl}.`}); }
  if(k===4){ const [g,kl,U]=R.pick(VKOMMA), F=U[g]/U[kl], q=R.int(11,49)/10, ex=rund(q*F), v=R.int(0,2);
    const x=v===0?Math.floor(q)*F+Math.round(q*10)%10:v===1?ex:ex+R.pick([-1,1])*R.int(1,F/10);
    return seiten({l:`${fz(q)} ${g}`,lw:rund(q*U[g]),r:`${fz(x)} ${kl}`,rw:x*U[kl],w:`${fz(q)} ${g} = ${fz(ex)} ${kl}. ${fz(ex)} ${kl} ${rel(ex,x)} ${fz(x)} ${kl}.`}); }
  if(k===5){ let n; do n=R.int(1001,9999); while(!String(n).includes("0")); const s=String(n), i=s.indexOf("0"); let m=Number(s.slice(0,i)+s.slice(i+1)); if(R.ja()||m===n) m=aendereZiffer(n);
    return seiten({l:zahlwort(n),lw:n,r:fz(m),rw:m,w:`${zahlwort(n)} = ${fz(n)}, also ${fz(n)} ${rel(n,m)} ${fz(m)}.`}); }
  const n=R.int(4,1999); let m=R.ja()?n+R.pick([-10,-1,1,10,40]):R.int(4,1999); if(m<1) m=n+1;
  return seiten({l:roemisch(n),lw:n,r:fz(m),rw:m,w:`${roemisch(n)} = ${n}, also ${n} ${rel(n,m)} ${fz(m)}.`});
}
// alte gespeicherte Aufgaben {a,b} lesen sich weiter
const vAlt=p=>p.l!==undefined?p:{l:fz(p.a),lw:p.a,r:fz(p.b),rw:p.b,w:vergleichWeg(p.a,p.b)};
const VTIPP="Erst in dieselbe Einheit oder Schreibweise bringen. Die Spitze zeigt zur kleineren Seite.";
const vergleichAufgabe=p=>{ const x=vAlt(p); return {typ:"wahl",f:`${x.l} ___ ${x.r}`,a:rel(x.lw,x.rw),o:["<","=",">"],t:VTIPP,weg:x.w}; };

// ---------- Rechnen mit Komma (Johannes' Zettel vom 26.11.2026; Regel wie Markus im Buch, S. 29 Aufgabe 8) ----------
// x · F = y oder x : F = y mit F = 10, 100, 1000, 10 000. Hoechstens maxNk Stellen hinter dem Komma, meist ist eine Kommazahl dabei.
const nk=x=>(Math.abs(x).toFixed(9).replace(/\.?0+$/,"").split(".")[1]||"").length; // nicht String(x): 4e-7
const stellen=n=>n===1?"eine Stelle":`${["","eine","zwei","drei","vier"][n]} Stellen`;
const kErg=({x,F,mal})=>rund(mal?x*F:x/F);
function kommaAufgabe(maxNk){
  const F=R.pick([10,10,100,100,1000,1000,10000]), mal=R.ja(.55);
  for(;;){ const st=R.pick([1,1,2,2,3]); let m; do m=R.int(10**(st-1),10**st-1); while(m%10===0);
    const x=rund(m*10**R.int(-4,2)), y=kErg({x,F,mal});
    if(Math.max(nk(x),nk(y))<=maxNk&&x<1e5&&y<1e5&&(nk(x)||nk(y)||R.ja(.1))) return {x,F,mal}; } }
const kommaWeg=p=>{ const n=KOMMA_AN(p.F); return `${fz(p.x)} ${p.mal?"·":":"} ${fz(p.F)} = ${fz(kErg(p))}: ${NULLEN[n-1]}, das Komma rückt ${stellen(n)} nach ${p.mal?"rechts":"links"}.`; };
const KREGEL="Mal 10, 100, 1000: Das Komma rückt so viele Stellen nach rechts, wie die Zahl Nullen hat (Buch S. 29, Aufgabe 8). Geteilt: genauso viele nach links. Fehlende Stellen füllst du mit 0: 3 : 100 = 0,03.";
// Malnehmen durch Zerlegen wie auf dem Zettel: 40 · 2,8 = 40 · 2 + 40 · 0,8 = 80 + 32 = 112
function zerlZieh(){ const k=R.int(0,9);
  if(k<6) return {a:R.int(2,9)*10,g:R.int(1,9),d:R.int(1,9)};
  if(k<9){ const a=R.pick([2,4,5,6,8]); let d; do d=R.int(1,9); while(a*d%10); return {a,g:R.int(1,9),d}; }
  return {a:R.int(2,9),g:R.int(1,9),d:R.int(1,9)}; }
function zerl({a,g,d}){ const b=rund(g+d/10), z=fz(d/10), t1=a*g, t2=rund(a*d/10), s=rund(t1+t2);
  const klein=a%10===0?`${a} · ${z}: rechne ${a/10} · ${d} = ${fz(t2)}.`:`${a} · ${z}: rechne ${a} · ${d} = ${a*d}, dann das Komma eine Stelle nach links: ${fz(t2)}.`;
  return {b,z,t1,t2,s,klein,zer:`${a} · ${fz(b)} = ${a} · ${g} + ${a} · ${z}`,weg:`${a} · ${fz(b)} = ${a} · ${g} + ${a} · ${z} = ${fz(t1)} + ${fz(t2)} = ${fz(s)}`}; }

// ---------- Ziehen: die erste Ebene eines Themas, wie die Tabelle in Englisch (Johannes, 26.11.2026) ----------
// Aufgabe {typ:"ziehen", zeilen:[{vor|vorHtml, nach, a, t}], tiles, bleibt (Karten bleiben liegen), satz (Satz statt Tabelle)}
const Z=(id,name,was,zieh,mach,n)=>({...E(id,name,was,zieh,mach,n||6),ziehen:true});
const nAus=(len,n)=>mischen([...Array(len).keys()]).slice(0,n);
const zz=(vor,nach,a,t)=>({vor,nach,a:String(a),t});
const ZL_ZAHL=[["1 km =","m","1000"],["1 m =","dm","10"],["1 dm =","cm","10"],["1 cm =","mm","10"],["1 m =","cm","100"],["1 m =","mm","1000"]];
const ZL_EINH=[["1","= 1000 m","km"],["1","= 10 dm","m"],["1","= 100 cm","m"],["1","= 10 cm","dm"],["1","= 10 mm","cm"],["1 km = 1000","","m"],["1 m = 100","","cm"],["1 m = 10","","dm"],["1 cm = 10","","mm"],["1 dm = 10","","cm"]];
const ZG=[["1 t =","kg","1000"],["1 kg =","g","1000"],["1 g =","mg","1000"],["1","= 1000 kg","t"],["1","= 1000 g","kg"],["1","= 1000 mg","g"],["1 t = 1000","","kg"],["1 kg = 1000","","g"],["1 g = 1000","","mg"]];
const ZZ=[["1 d =","h","24"],["1 h =","min","60"],["1 min =","s","60"],["1 Woche =","Tage","7"],["1 Jahr =","Monate","12"],["½ h =","min","30"],["¼ h =","min","15"],["½ d =","h","12"]];
const ZR=[["I",1],["V",5],["X",10],["L",50],["C",100],["D",500],["M",1000]];
const ZM=[[50,"50 cm"],[100,"1 m"],[200,"2 m"],[500,"5 m"],[1000,"10 m"],[10000,"100 m"],[25000,"250 m"],[100000,"1 km"]];
const TREPPE="Die Treppe: km → m → dm → cm → mm. Von km zu m ist es 1000, sonst immer 10. Von m zu cm also 10 · 10 = 100.";
const weg3=([v,n,a])=>`${v} ${a} ${n}`.replace(/\s+/g," ").trim();
const ZIEHEN={
 f_zeichen:Z("f_zeichen","<, = oder > ziehen","gemischt: Zahlen, Größen, Zahlwörter",()=>({z:nAus(7,4).map(k=>vergleichMix(k))}),
  ({z})=>({typ:"ziehen",satz:true,frage:"Zieh &lt;, = oder &gt; in die Lücken. Achtung, es ist gemischt!",zeilen:z.map(x=>zz(x.l,x.r,rel(x.lw,x.rw),VTIPP)),tiles:["<","=",">"],bleibt:true,t:VTIPP,weg:z.map(x=>x.w).join(" ")})),
 d_tabelle:Z("d_tabelle","Strichliste in die Tabelle","Striche zählen und zuordnen",()=>{ const t=R.int(0,3), k=DTHEMA[t][1], s=new Set(); while(s.size<k.length) s.add(R.int(3,16)); return {t,w:[...s]}; },
  ({t,w})=>{ const [titel,k]=DTHEMA[t], fa=w.map(n=>Math.floor(n/5)*4+n%5).find(x=>!w.includes(x));
    return {typ:"ziehen",frage:`Umfrage: ${titel}. Zieh zu jeder Strichliste die passende Zahl.`,zeilen:k.map((x,i)=>({vorHtml:`${h(x)} ${striche(w[i]).replace('class="mbild"','class="mstrich"').replace(/ style="[^"]*"/,"")}`,vor:x,nach:"",a:String(w[i]),t:"Ein Bündel sind 5 Striche."})),
      tiles:[...w.map(String),...(fa?[String(fa)]:[])],bleibt:false,hilfe:"Zähl in Fünferschritten: jedes Bündel 5, dann die einzelnen Striche dazu.",weg:k.map((x,i)=>`${x}: ${w[i]}`).join(", ")}; }),
 g_paare:Z("g_paare","Paare finden","Wort und Ziffern zuordnen",()=>({d:R.int(2,9),r:nAus(6,4)}),
  ({d,r})=>{ const V=[(100*d+d)*1e6,d*1e7+d*1e4,d*1e9+d*1e7,d*1e6+d*1e4,d*1e10+d*1e6,d*1e5+d], z=r.map(i=>V[i]);
    return {typ:"ziehen",satz:true,frage:"Welche Zahl ist gemeint? Zieh sie zum passenden Wort.",zeilen:z.map(n=>zz(paeckchenText(n)+" =","",fz(n))),tiles:z.map(fz),bleibt:false,t:"Zähl die Päckchen: Milliarden, Millionen, Tausend, Einer.",weg:z.map(n=>`${paeckchenText(n)} = ${fz(n)}`).join(" · ")}; }),
 r_zeichen:Z("r_zeichen","Die Zeichen","I, V, X … zuordnen",()=>({k:R.int(0,1),r:nAus(7,5)}),
  ({k,r})=>{ const z=r.slice(0,4).map(i=>ZR[i]), x=ZR[r[4]];
    return {typ:"ziehen",frage:k?"Welches Zeichen gehört zur Zahl?":"Wie viel ist das Zeichen wert?",zeilen:z.map(([c,w])=>k?zz(fz(w)+" =","",c):zz(c+" =","",fz(w))),tiles:[...z,x].map(([c,w])=>k?c:fz(w)),bleibt:false,t:"I 1, V 5, X 10, L 50, C 100, D 500, M 1000.",weg:z.map(([c,w])=>`${c} = ${fz(w)}`).join(", ")}; }),
 s_ziehen:Z("s_ziehen","Zahlen an den Strahl","A, B und C zuordnen",()=>{ const [st,L]=R.pick([[1,5],[1,10],[2,5],[5,10],[10,5],[10,10],[20,5],[25,4],[25,4],[25,4],[250,4],[50,10],[100,5],[100,10],[1000,10]]), a=R.ja(.6)?0:R.int(1,20)*st*L;
    let m; do m=nAus(2*L-1,3).map(x=>x+1).sort((x,y)=>x-y); while(m.some(x=>x%L===0)||m[1]-m[0]<2||m[2]-m[1]<2); return {s:st,L,a,m}; },
  ({s:st,L,a,m})=>{ const w=m.map(x=>a+x*st), d=[...new Set([...m.map(x=>a+x),...m.map(x=>a+(x+1)*st)])].filter(v=>!w.includes(v)).slice(0,2);
    return {typ:"ziehen",bild:strahl(a,st,L,m.map((x,i)=>[x,"ABC"[i]])),frage:"Welche Zahl gehört zu A, B und C?",zeilen:w.map((v,i)=>zz(`${"ABC"[i]} =`,"",fz(v))),tiles:[...w,...d].map(fz),bleibt:false,
      hilfe:`Zwischen ${fz(a)} und ${fz(a+L*st)} liegen ${L} Schritte. Ein Schritt ist ${fz(st)}.`,t:"Erst ausrechnen, wie viel ein Schritt wert ist.",weg:w.map((v,i)=>`${"ABC"[i]} = ${fz(v)}`).join(", ")}; }),
 ru_aufab:Z("ru_aufab","Auf oder ab?","aufrunden oder abrunden",()=>({z:[0,1,2,3].map(()=>rundZieh())}),
  ({z})=>({typ:"ziehen",satz:true,frage:"Aufrunden oder abrunden? Die rote Ziffer entscheidet.",zeilen:z.map(({n,s})=>{ const k=RST[s][0], d=Math.floor(n/(k/10))%10;
      return {vorHtml:`<span class="mzahl">${markiert(n,k)}</span> auf ${RST[s][1]}:`,vor:`${fz(n)} auf ${RST[s][1]}:`,nach:"",a:d>=5?"aufrunden":"abrunden",t:"Bei 0, 1, 2, 3, 4 abrunden, bei 5, 6, 7, 8, 9 aufrunden."}; }),
    tiles:["abrunden","aufrunden"],bleibt:true,weg:z.map(({n,s})=>rundWeg(n,s)).join(" ")})),
 sc_einheit:Z("sc_einheit","Welche Einheit passt?","mm, cm, m, km … in die Lücke ziehen",()=>{ const fam=R.pick([["mm","cm","m","km"],["mg","g","kg","t"],["s","min","h","d"]]); return {r:mischen(SEINHEIT.map((x,k)=>k).filter(k=>fam.includes(SEINHEIT[k].a))).slice(0,3)}; },
  ({r,i})=>{ const L=(r||[i]).map(k=>SEINHEIT[k]);
    return {typ:"ziehen",satz:true,frage:"Welche Einheit passt? Zieh sie in die Lücke.",zeilen:L.map(x=>{ const [v,n]=x.f.split("___"); return zz(v.trim(),n.trim(),x.a,"Vergleiche mit etwas, das du kennst."); }),tiles:L[0].o,bleibt:true,weg:L.map(x=>x.weg).join(" ")}; }),
 l_treppe:Z("l_treppe","Die Einheitentreppe","1 m = 10 dm zuordnen",()=>{ const k=R.int(0,1); return {k,r:nAus(k?ZL_EINH.length:ZL_ZAHL.length,4)}; },
  ({k,r})=>{ const T=k?ZL_EINH:ZL_ZAHL; return {typ:"ziehen",frage:k?"Welche Einheit gehört in die Lücke?":"Welche Umrechnungszahl gehört in die Lücke?",zeilen:r.map(i=>zz(...T[i])),tiles:k?["km","m","dm","cm","mm"]:["10","100","1000"],bleibt:true,hilfe:TREPPE,t:"Denk an die Treppe: km, m, dm, cm, mm.",weg:r.map(i=>weg3(T[i])).join(", ")}; }),
 w_treppe:Z("w_treppe","Gewichte zuordnen","1 kg = 1000 g",()=>({r:nAus(ZG.length,4)}),
  ({r})=>({typ:"ziehen",frage:"Was gehört in die Lücke?",zeilen:r.map(i=>zz(...ZG[i])),tiles:["100","1000","t","kg","g","mg"],bleibt:true,hilfe:"t → kg → g → mg: jede Stufe ist 1000.",t:"Bei Gewichten ist es immer die 1000.",weg:r.map(i=>weg3(ZG[i])).join(", ")})),
 z_treppe:Z("z_treppe","Zeiten zuordnen","1 h = 60 min",()=>({r:nAus(ZZ.length,4)}),
  ({r})=>({typ:"ziehen",frage:"Welche Zahl gehört in die Lücke?",zeilen:r.map(i=>zz(...ZZ[i])),tiles:["7","12","15","24","30","60","100"],bleibt:true,hilfe:"1 d = 24 h, 1 h = 60 min, 1 min = 60 s, 1 Woche = 7 Tage, 1 Jahr = 12 Monate.",t:"Eine Stunde hat 60 Minuten, nicht 100.",weg:r.map(i=>weg3(ZZ[i])).join(", ")})),
 ge_paare:Z("ge_paare","Euro und Cent zuordnen","Paare finden",()=>({z:mischen([[R.int(1,40),R.int(1,9)],[R.int(1,9),R.int(10,99)],[0,R.pick([25,50,75,90])],[R.int(2,60),0]])}),
  ({z})=>{ const w=z.map(([e,c])=>e*100+c), kl=z.find(([e,c])=>e&&c&&c<10), d=kl?Number(`${kl[0]}${kl[1]}`):null;
    return {typ:"ziehen",frage:"Wie viele Cent sind das?",zeilen:z.map(([e,c])=>zz(`${geld(e+c/100)} € =`,"ct",fz(e*100+c),"1 € = 100 ct. Nach dem Komma stehen zwei Stellen für die Cent.")),tiles:[...w,...(d&&!w.includes(d)?[d]:[])].map(fz),bleibt:false,
      weg:z.map(([e,c])=>`${geld(e+c/100)} € = ${fz(e*100+c)} ct`).join(", ")}; }),
 k_puzzle:Z("k_puzzle","Komma-Puzzle","6,7 km = 6 km 700 m",()=>{ const z=[]; while(z.length<3){ const i=R.int(0,KPAARE.length-1), [g,k,U]=KPAARE[i], q=kommaZahl(U[g]/U[k]); if(q>=1&&!z.some(x=>x[0]===i)) z.push([i,q]); } return {z}; },
  ({z})=>{ const r=z.map(([i,q])=>{ const [g,k,U]=KPAARE[i], F=U[g]/U[k], ganz=Math.floor(q); return {g,k,q,F,ganz,rest:rund((q-ganz)*F),hinten:Number(String(q).split(".")[1])}; });
    const t=new Set(r.map(x=>fz(x.rest))); r.forEach(x=>{ if(t.size<6&&x.hinten!==x.rest) t.add(fz(x.hinten)); if(t.size<6&&x.rest*10<x.F) t.add(fz(x.rest*10)); });
    return {typ:"ziehen",frage:"Zerleg die Größen. Zieh die passende Zahl in die Lücke.",zeilen:r.map(x=>zz(`${fz(x.q)} ${x.g} = ${x.ganz} ${x.g}`,x.k,fz(x.rest),`Bei ${x.g} gehören ${KOMMA_AN(x.F)} Stellen hinter dem Komma zu den ${x.k}.`)),
      tiles:[...t].sort((a,b)=>lies(a)-lies(b)),bleibt:true,hilfe:"Fehlende Stellen hinter dem Komma füllst du mit 0: 6,7 km = 6,700 km = 6 km 700 m.",weg:r.map(x=>`${fz(x.q)} ${x.g} = ${x.ganz} ${x.g} ${fz(x.rest)} ${x.k}`).join(", ")}; }),
 ma_tabelle:Z("ma_tabelle","Maßstab-Tabelle","1 cm auf dem Plan sind …",()=>({r:nAus(ZM.length,4),x:R.int(0,4)}),
  ({r,x})=>{ const z=r.map(i=>ZM[i]), d=["5 cm","10 cm","50 m","500 m","10 km"].filter(t=>!z.some(([m,l])=>l===t))[x%3];
    return {typ:"ziehen",frage:"1 cm auf dem Plan sind in Wirklichkeit …",zeilen:z.map(([m,l])=>zz(`1 : ${fz(m)}`,"",l,"Die Zahl rechts sind Zentimeter. 100 cm = 1 m.")),tiles:[...z.map(([m,l])=>l),d],bleibt:false,
      hilfe:"1 : 100 heißt: 1 cm sind 100 cm, also 1 m. 100 000 cm sind 1 km.",weg:z.map(([m,l])=>`1 : ${fz(m)}: 1 cm sind ${fz(m)} cm = ${l}`).join(" · ")}; })
};

// Zahlkarten: Antworten plus Fallen (Faktor 10), keine doppelten, der Groesse nach
const zahlKarten=(ans,extra,komma)=>{ const t=new Map(); ans.forEach(x=>t.set(rund(x),fz(x))); extra.forEach(x=>{ x=rund(x); if(t.size<7&&(komma||Number.isInteger(x))&&x>0) t.set(x,fz(x)); }); return [...t.entries()].sort((a,b)=>a[0]-b[0]).map(e=>e[1]); };
const WEG_GROSS=[["cm","m",100],["cm","m",100],["cm","m",100],["mm","cm",10],["m","km",1000],["dm","m",10]];
const WEG_KLEIN=[["m","cm",100],["m","cm",100],["km","m",1000],["cm","mm",10],["m","dm",10]];
Object.assign(ZIEHEN,{
 l_weg:Z("l_weg","Der Weg aus dem Buch","400 cm = 4 · 100 cm = 4 m",()=>({g:R.int(0,WEG_GROSS.length-1),q:R.int(2,60)*(R.ja(.3)?10:1),k:R.int(0,WEG_KLEIN.length-1),p:R.int(2,25)}),
  ({g,q,k,p})=>{ const [a1,b1,F1]=WEG_GROSS[g], [a2,b2,F2]=WEG_KLEIN[k];
    return {typ:"ziehen",schema:true,frage:"Rechne wie im Buch: Wie oft steckt die Umrechnungszahl drin?",
      zeilen:[{s:`${fz(q*F1)} ${a1} = {0} · ${fz(F1)} ${a1} = {1} ${b1}`,as:[fz(q),fz(q)],t:`Wie oft stecken ${fz(F1)} ${a1} in ${fz(q*F1)} ${a1}? So viele ${b1} sind es.`},
              {s:`${p} ${a2} = ${p} · {0} ${b2} = {1} ${b2}`,as:[fz(F2),fz(p*F2)],t:`1 ${a2} sind ${fz(F2)} ${b2}. ${p} ${a2} sind also ${p} mal ${fz(F2)} ${b2}.`}],
      tiles:zahlKarten([q,F2,p*F2],[q*10,p*F2*10,p*F2/10,F2===10?100:10]),bleibt:true,
      hilfe:"So steht es im Buch: 4000 mg = 4 · 1000 mg = 4 g (S. 24) und 40 000 cm = 400 · 100 cm = 400 m (S. 30).",
      weg:`${fz(q*F1)} ${a1} = ${fz(q)} · ${fz(F1)} ${a1} = ${fz(q)} ${b1}. ${p} ${a2} = ${p} · ${fz(F2)} ${b2} = ${fz(p*F2)} ${b2}.`}; }),
 ma_weg:Z("ma_weg","Der Rechenweg aus dem Buch","wie Beispiel 1 und 2 auf S. 30 und 31",()=>{ const k=R.int(0,1), c=R.int(0,4);
    if(!k) return {k,m:R.pick([100,200,500,1000,2000,5000,10000]),b:R.int(2,9),c};
    const m=R.pick([50,100,200,500]); let b; do b=R.int(2,12); while(b*m%100); return {k,m,b,c}; },
  ({k,m,b,c})=>{ const ctx=ctxVon(m,c,b*m/100);
    if(!k){ const w=b*m, mm=w/100;
      return {typ:"ziehen",schema:true,frage:`${ctx} ist auf dem Plan <b>${b} cm</b> lang. Wie lang ist es in Wirklichkeit?`,
        zeilen:[{s:`Maßstab: 1 : ${fz(m)}`,as:[]},{s:`Länge im Bild: ${b} cm`,as:[]},{s:`Länge in Wirklichkeit: ${b} cm · {0} = {1} cm = {2} · 100 cm = {3} m`,as:[fz(m),fz(w),fz(mm),fz(mm)],t:"Erst mal die Maßstabszahl. Dann: Wie oft stecken 100 cm drin?"}],
        tiles:zahlKarten([m,w,mm],[w/10,w*10,mm*10]),bleibt:true,hilfe:`1 cm im Bild entsprechen ${fz(m)} cm in der Wirklichkeit. Die Länge in der Wirklichkeit ist also ${fz(m)}-mal so groß. Multipliziere daher mit ${fz(m)}.`,
        weg:`Länge in Wirklichkeit: ${b} cm · ${fz(m)} = ${fz(w)} cm = ${fz(mm)} · 100 cm = ${fz(mm)} m`}; }
    const r=b*m/100;
    return {typ:"ziehen",schema:true,frage:`${ctx} ist in Wirklichkeit <b>${fz(r)} m</b> lang. Es wird im Maßstab 1 : ${fz(m)} gezeichnet. Wie lang wird es im Bild?`,
      zeilen:[{s:`Maßstab: 1 : ${fz(m)}`,as:[]},{s:`Länge in Wirklichkeit: ${fz(r)} m = {0} cm`,as:[fz(r*100)],t:"Erst in cm umwandeln: 1 m = 100 cm."},{s:`Länge im Bild: {0} cm : {1} = {2} cm`,as:[fz(r*100),fz(m),fz(b)],t:"Im Bild ist es kleiner: dividiere durch die Maßstabszahl."}],
      tiles:zahlKarten([r*100,m,b],[r*10,r*1000,b*10]),bleibt:true,hilfe:`1 cm im Bild entsprechen ${fz(m)} cm in der Wirklichkeit. Die Länge im Bild ist also ${fz(m)}-mal so klein. Dividiere daher durch ${fz(m)}. Vorher in cm umwandeln.`,
      weg:`Länge in Wirklichkeit: ${fz(r)} m = ${fz(r*100)} cm. Länge im Bild: ${fz(r*100)} cm : ${fz(m)} = ${b} cm`}; }),
 // Rechnen mit Komma: die mittlere Zahl einsetzen wie auf dem Zettel (2,5 · [10] = 25, 3 : [100] = 0,03), mal und geteilt gemischt
 rk_zieh:Z("rk_zieh","Welche Zahl fehlt?","2,5 · ▢ = 25 mit 10, 100, 1000",()=>({z:[0,1,2,3].map(()=>kommaAufgabe(4))}),
  ({z})=>({typ:"ziehen",frage:"Welche Zahl fehlt? Zieh 10, 100, 1000 oder 10 000 in die Lücke. Achtung: mal und geteilt sind gemischt!",
    zeilen:z.map(p=>zz(`${fz(p.x)} ${p.mal?"·":":"}`,`= ${fz(kErg(p))}`,fz(p.F),"Zähl, um wie viele Stellen das Komma gerückt ist. So viele Nullen hat die Zahl.")),
    tiles:[10,100,1000,10000].map(fz),bleibt:true,hilfe:KREGEL,weg:z.map(kommaWeg).join(" ")})),
 rk_zeichen:Z("rk_zeichen","Mal oder geteilt?","0,03 ▢ ▢ = 3: Zeichen und Zahl",()=>({z:[0,1,2].map(()=>kommaAufgabe(4))}),
  ({z})=>({typ:"ziehen",frage:"Mal oder geteilt? Zieh das Rechenzeichen und die Zahl in die Lücken.",
    zeilen:z.map(p=>({s:`${fz(p.x)} {0} {1} = ${fz(kErg(p))}`,as:[p.mal?"·":":",fz(p.F)],t:"Wird die Zahl größer, rechnest du mal. Wird sie kleiner, geteilt. Dann die Stellen zählen."})),
    tiles:["·",":",...[10,100,1000,10000].map(fz)],bleibt:true,hilfe:KREGEL,weg:z.map(kommaWeg).join(" ")})),
 rk_zerlegen:Z("rk_zerlegen","Zerlegen","40 · 2,8 = 40 · 2 + 40 · 0,8 wie auf dem Zettel",zerlZieh,
  p=>{ const {a,g,d}=p, x=zerl(p);
    return {typ:"ziehen",schema:true,frage:`Rechne ${a} · ${fz(x.b)} wie auf dem Zettel: erst zerlegen, dann zusammenzählen.`,
      zeilen:[{s:x.zer,as:[]},{s:"= {0} + {1}",as:[fz(x.t1),fz(x.t2)],t:`Erst ${a} · ${g}, dann ${x.klein}`},{s:"= {0}",as:[fz(x.s)],t:"Jetzt die beiden Teile zusammenzählen."}],
      tiles:zahlKarten([x.t1,x.t2,x.s],[a*d,x.t1+a*d,x.s/10,x.t2/10],true),bleibt:false,hilfe:x.klein,weg:x.weg}; })
});

// ---------- Erklaerseiten und Aufgaben, Reihenfolge wie im Buch ----------
const BEREICHE=[
{id:"m_fund",kap:"1.0",icon:"🧱",name:"Dein Fundament",was:"Stellenwerttafel, Wert einer Ziffer, vergleichen",
 erkl:{s:"6–7",wozu:"Hier wiederholst du, was du aus der Grundschule kennst: Zahlen in der Stellenwerttafel, den Wert einer Ziffer und Zahlen vergleichen.",
  teile:[["Die Stellenwerttafel",["T = Tausender, H = Hunderter, Z = Zehner, E = Einer.","Jede Ziffer zählt so viel wie ihre Spalte: 3 Zehner sind 30.","Ist eine Spalte leer, schreibst du dort eine 0: 4 T 5 H 0 Z 2 E = 4502."]],
   ["Vergleichen",["Mehr Stellen heißt größer.","Gleich viele Stellen: von links Ziffer für Ziffer vergleichen.","&lt; heißt kleiner als, &gt; heißt größer als."]]],
  tab:TAB(["T","H","Z","E"],[["4","5","0","2"]]),
  bsp:[["Welche Zahl ist 4 T 5 H 0 Z 2 E?","4502. Die 0 bei den Zehnern nicht vergessen."],["Welchen Wert hat die 3 in 321?","300, denn die 3 steht bei den Hundertern."],["89 oder 98?","89 &lt; 98: beide haben zwei Stellen, und 8 Zehner sind weniger als 9 Zehner."]],
  achtung:["Die Null nicht weglassen: 4 T 2 E ist 4002, nicht 42."],maus:"Die Spitze von &lt; und &gt; zeigt immer zur kleineren Zahl."},
 ebenen:[
  ZIEHEN.f_zeichen,
  E("f_tafel","Stellenwerttafel","Welche Zahl steht in der Tafel?",()=>{ const z=[R.int(1,9),R.int(0,9),R.int(0,9),R.int(0,9)]; if(R.ja(.6)) z[R.int(1,3)]=0; return {z}; },
   ({z})=>{ const n=z[0]*1000+z[1]*100+z[2]*10+z[3], ohne=Number(z.filter((x,i)=>x||!i).join(""));
     return {bild:tafel(["T","H","Z","E"],z),frage:"Welche Zahl steht in der Stellenwerttafel?",f:"{0}",a:[n],weg:`${z[0]} Tausender, ${z[1]} Hunderter, ${z[2]} Zehner, ${z[3]} Einer: ${fz(n)}.`,
       tipp:(i,v)=>v===ohne&&ohne!==n?"Eine Spalte hat eine 0. Die 0 musst du mitschreiben.":null}; }),
  E("f_wert","Wert einer Ziffer","3, 30 oder 300?",()=>{ for(;;){ const n=R.int(100,99999), s=String(n), i=R.int(0,s.length-1), d=s[i]; if(d!=="0"&&s.split(d).length===2) return {n,i}; } },
   ({n,i})=>{ const s=String(n), d=+s[i], st=s.length-1-i, w=d*10**st;
     return wahl(`Welchen Wert hat die <b>${d}</b> in ${fz(n)}?`,fz(w),[...Array(s.length)].map((_,k)=>fz(d*10**k)),{t:"Schau, in welcher Spalte die Ziffer steht: Einer, Zehner, Hunderter …",weg:`Die ${d} steht bei den ${STW[st]}: ${fz(w)}.`}); }),
  E("f_vergl","Größer, kleiner, gleich?","gemischt: Zahlen, Größen, Zahlwörter",()=>vergleichMix(),vergleichAufgabe)]},

{id:"m_daten",kap:"1.1",icon:"📊",name:"Daten auswerten",was:"Strichliste, Häufigkeitstabelle, Säulendiagramm",
 erkl:{s:"8–12",wozu:"Du sammelst Antworten, zählst sie aus und stellst sie übersichtlich dar.",
  teile:[["So gehst du vor",["Mit einem Fragebogen sammelst du Daten.","In der Strichliste machst du für jede Antwort einen Strich. Den fünften Strich ziehst du quer: ein Bündel sind 5.","In der Häufigkeitstabelle steht, wie oft jede Antwort vorkommt.","Im Säulendiagramm ist jede Antwort eine Säule. Je höher die Säule, desto häufiger die Antwort."]],
   ["Das Säulendiagramm",["Die Skala fängt immer bei 0 an.","Die Achse reicht bis zum größten Wert.","Die Abstände sind gleich groß, ein Kästchen ist zum Beispiel 1 Kind.","Die Achsen beschriftest du wie die Spalten der Tabelle."]],
   ["Eine Befragung in fünf Schritten (S. 12)",["Planen, Durchführen, Auswerten, Darstellen, Folgern."]]],
  tab:TAB(["Geschwister","keine","ein","zwei","drei","vier"],[["Häufigkeit","8","11","6","2","1"]]),
  bsp:[["Gregor fragt 28 Kinder nach ihren Geschwistern (Beispiel 1, S. 8).","keine: 8, ein: 11, zwei: 6, drei: 2, vier: 1. Zusammen 8 + 11 + 6 + 2 + 1 = 28."],["Wie viele haben mehr als ein Geschwister?","zwei, drei oder vier: 6 + 2 + 1 = 9."],["Strichliste mit 2 Bündeln und 3 Strichen","5 + 5 + 3 = 13."]],
  achtung:["Beginnt die Skala nicht bei 0, sehen kleine Unterschiede riesig aus (Stolperstelle S. 10).","Durften die Kinder mehrere Antworten geben, kannst du aus dem Diagramm nicht ablesen, wie viele Kinder gefragt wurden."],maus:"Ein Bündel sind 5 Striche: zähl in Fünferschritten."},
 ebenen:[
  ZIEHEN.d_tabelle,
  E("d_strich","Strichliste lesen","Bündel zu fünf zählen",()=>({n:R.int(4,29)}),
   ({n})=>({bild:striche(n),frage:"So viele Kinder kommen mit dem Fahrrad zur Schule. Wie viele sind es?",f:"{0} Kinder",a:[n],
     weg:`${Math.floor(n/5)} Bündel zu 5 sind ${Math.floor(n/5)*5}, dazu ${n%5}: ${n}.`,
     tipp:(i,v)=>v===Math.floor(n/5)?"Das ist die Zahl der Bündel. Jedes Bündel zählt 5.":v===Math.floor(n/5)*4+n%5?"Ein Bündel sind 5 Striche: 4 senkrecht und einer quer.":null})),
  E("d_saeule","Säulendiagramm ablesen","ablesen, zusammenzählen, vergleichen",()=>{ const t=R.int(0,3), k=DTHEMA[t][1], w=k.map(()=>R.int(1,14)), q=R.pick(["wert","wert","summe","diff"]), i=R.int(0,k.length-1), j=(i+R.int(1,k.length-1))%k.length;
     if(q==="diff"&&w[i]===w[j]) w[i]++; return {t,w,q,i,j}; },
   ({t,w,q,i,j})=>{ const [titel,k]=DTHEMA[t], mehr=w[i]>w[j]?i:j, wen=mehr===i?j:i, s=w.reduce((x,y)=>x+y,0), werte=k.map((x,n)=>`${x}: ${w[n]}`).join(", ");
     const fr=q==="wert"?`Wie viele Kinder haben „${k[i]}“ geantwortet?`:q==="summe"?"Jedes Kind hat genau einmal geantwortet. Wie viele Kinder wurden gefragt?":`Wie viele Kinder mehr haben „${k[mehr]}“ geantwortet als „${k[wen]}“?`;
     return {bild:saeulen(k,w,"Umfrage: "+titel),frage:fr,f:"{0} Kinder",a:[q==="wert"?w[i]:q==="summe"?s:w[mehr]-w[wen]],
       weg:q==="wert"?`Die Säule „${k[i]}“ reicht bis ${w[i]}.`:q==="summe"?`${werte}. Zusammen ${w.join(" + ")} = ${s}.`:`${k[mehr]}: ${w[mehr]}, ${k[wen]}: ${w[wen]}. ${w[mehr]} − ${w[wen]} = ${w[mehr]-w[wen]}.`,
       tipp:(n,v)=>q==="wert"&&Math.abs(v-w[i])===1?"Geh vom oberen Rand der Säule waagerecht nach links zur Achse. Jede Linie ist 1 mehr.":q==="diff"&&(v===w[mehr]||v===w[mehr]+w[wen])?"Wie viele mehr: die kleinere Zahl von der größeren abziehen.":null}; }),
  E("d_liste","Urliste auszählen","wie oft kommt es vor?",()=>{ const n=R.int(14,22), w=[...Array(n)].map(()=>R.int(0,4)), z=w[R.int(0,n-1)]; return {w,z}; },
   ({w,z})=>{ const c=w.filter(x=>x===z).length;
     return {bild:`<p class="mliste">${w.map(i=>`<span>${FARBEN[i]}</span>`).join("")}</p>`,frage:`Die Klasse wurde nach der Lieblingsfarbe gefragt. Wie oft kommt <b>${FARBEN[z]}</b> vor?`,f:"{0}-mal",a:[c],
       weg:`In der Strichliste bekommt ${FARBEN[z]} ${c} Striche.`,tipp:(i,v)=>Math.abs(v-c)<=2?"Zähl noch einmal. Tipp mit dem Finger jedes passende Wort an.":null}; })]},

{id:"m_gross",kap:"1.2",icon:"🔢",name:"Große Zahlen",was:"Dreierpäckchen, Zahlwörter, ordnen",
 erkl:{s:"13–15",wozu:"Große Zahlen wie 18 738 493 847 lesen, schreiben und vergleichen.",
  teile:[["Das Zehnersystem",["Die Zahlen 0, 1, 2, 3, … heißen natürliche Zahlen.","Jede Stelle ist zehnmal so viel wert wie die Stelle rechts daneben."]],
   ["Dreierpäckchen",["Teile die Zahl von rechts in Dreierpäckchen: 23 432 411.","Von links gelesen: 23 Millionen 432 Tausend 411.","Ein Päckchen hinter dem ersten hat immer drei Ziffern: 73 Millionen 1 Tausend 2 = 73 001 002."]],
   ["Vergleichen",["Mehr Stellen heißt größer: 155 472 &gt; 99 472.","Gleich viele Stellen: von links vergleichen, bis zwei Ziffern verschieden sind: 84 027 &lt; 84 072."]],
   ["Vorgänger und Nachfolger",["Der Vorgänger ist 1 kleiner, der Nachfolger 1 größer: 9999 &lt; 10 000 &lt; 10 001."]]],
  tab:TAB(["Milliarden","Millionen","Tausend","Einer"],[["18","738","493","847"]]),
  bsp:[["23 432 411 lesen","23 Millionen 432 Tausend 411"],["dreihundertfünfundsechzigtausendsiebenundzwanzig","365 Tausend 27 = 365 027, nicht 36 527 (Stolperstelle S. 15)"],["84 027 oder 84 072?","84 027 &lt; 84 072: erst bei den Zehnern verschieden, 2 &lt; 7."]],
  achtung:["Fehlt ein Päckchen, schreibst du drei Nullen: 5 Millionen 50 Tausend = 5 050 000.","Die kleinste sechsstellige Zahl ist 100 000, nicht 111 111."],maus:"Von rechts in Dreierpäckchen teilen, von links lesen."},
 ebenen:[
  ZIEHEN.g_paare,
  E("g_pack","Päckchen schreiben","Millionen, Tausend, Einer",()=>{ const L=R.int(5,11); let n=R.int(10**(L-1),10**L-1);
     if(R.ja(.6)){ const b=bloecke(n), oben=b.findIndex(x=>x>0), j=R.int(oben+1,3); if(j<=3&&j>oben){ b[j]=R.pick([0,R.int(1,9),R.int(10,99)]); n=b[0]*1e9+b[1]*1e6+b[2]*1e3+b[3]; } } return {n}; },
   ({n})=>{ const b=bloecke(n), o=b.findIndex(x=>x>0), roh1=Number(b.slice(o).map(String).join("")), roh2=Number(b.slice(o).filter((x,k)=>x||!k).map(String).join(""));
     return {frage:`Schreib mit Ziffern: <b>${paeckchenText(n)}</b>`,f:"{0}",a:[n],weg:`Jedes Päckchen hinter dem ersten hat drei Ziffern: ${fz(n)}.`,
       tipp:(i,v)=>(v===roh1||v===roh2)&&v!==n?"Jedes Päckchen hinter dem ersten hat genau drei Ziffern. Fehlende füllst du mit 0 auf: 1 Tausend → 001.":null}; }),
  // bis Milliarden, Paeckchen mit Nullen vorn wie 18 025 003 804 (Klassenarbeit 1.1, Aufgabe 2a)
  E("g_wort","Zahlwort in Ziffern","wie im Diktat, bis Milliarden",()=>{ const L=R.pick([4,5,6,7,8,9,10,10,11,11]); let n=R.int(10**(L-1),10**L-1); const b=bloecke(n), o=b.findIndex(x=>x>0);
     for(let j=o+1;j<=3;j++) if(R.ja(.5)) b[j]=R.pick([0,R.int(1,9),R.int(10,99)]); n=b[0]*1e9+b[1]*1e6+b[2]*1e3+b[3]; return {n}; },
   ({n})=>({frage:`Schreib mit Ziffern:<br><b class="mwort">${zahlwort(n)}</b>`,f:"{0}",a:[n],weg:`${paeckchenText(n)} = ${fz(n)}`,
     hilfe:"Zerleg das Wort an „Milliarden“, „Millionen“ und „tausend“. Jedes Päckchen hinter dem ersten hat genau drei Ziffern: 25 Millionen → 025, 3 Tausend → 003.",
     tipp:(i,v)=>String(v).length<String(n).length?"Da fehlt eine Stelle. Nach „Milliarden“, „Millionen“ und „tausend“ kommen immer drei Ziffern, fehlende füllst du mit 0.":String(v).length>String(n).length?"Da ist eine Stelle zu viel. Zerleg das Wort an „Milliarden“, „Millionen“ und „tausend“.":null})),
  E("g_nach","Vorgänger und Nachfolger","1 weniger, 1 mehr",()=>{ const k=R.int(0,2), e=R.int(2,6), z=R.int(1,9); return {n:k===0?z*10**e:k===1?z*10**e-1:R.int(10,999999)}; },
   ({n})=>({frage:"Schreib den Vorgänger und den Nachfolger.",f:`{0} < ${fz(n)} < {1}`,a:[n-1,n+1],weg:`${fz(n)} − 1 = ${fz(n-1)} und ${fz(n)} + 1 = ${fz(n+1)}.`,
     tipp:(i,v)=>i===0&&v===n+1?"Der Vorgänger kommt vorher, er ist 1 kleiner.":i===1&&v===n-1?"Der Nachfolger kommt danach, er ist 1 größer.":i===0&&n%10===0?"Bei −1 werden die Nullen am Ende zu Neunen: 10 000 − 1 = 9999.":i===1&&n%10===9?"Bei +1 werden die Neunen am Ende zu Nullen: 9999 + 1 = 10 000.":null})),
  E("g_vergl","Große Zahlen vergleichen","&lt;, = oder &gt;",()=>vergleichMix(R.pick([0,1,2,5])),vergleichAufgabe),
  E("g_ordnen","Zahlen ordnen","von klein nach groß",()=>{ const L=R.int(4,6), base=R.int(10**(L-1),10**L-1), s=new Set([base]); while(s.size<5){ let x=aendereZiffer(base); if(R.ja(.4)) x=aendereZiffer(x); s.add(x); } return {z:[...s]}; },
   ({z})=>({typ:"ordnen",frage:"Tipp die Zahlen der Größe nach an, die kleinste zuerst.",o:z.map(w=>({t:fz(w),w})),t:"Von links vergleichen: Wo ist die erste Ziffer verschieden?",weg:[...z].sort((a,b)=>a-b).map(fz).join(" < ")}))]},

{id:"m_rom",kap:"1.2r",icon:"🏛️",name:"Römische Zahlen",was:"I, V, X, L, C, D, M",
 erkl:{s:"16–17",wozu:"Die Römer schrieben Zahlen mit Buchstaben. Du findest sie heute noch auf Uhren, Grabsteinen und an alten Gebäuden.",
  teile:[["Lesen",["Steht ein kleineres Zeichen vor einem größeren, ziehst du es ab: IX = 10 − 1 = 9.","Sonst zählst du zusammen: VIII = 5 + 1 + 1 + 1 = 8."]],
   ["Schreiben",["I, X, C und M höchstens dreimal hintereinander.","V, L und D nur einmal, und nie vor einem größeren Zeichen.","Abziehen darfst du nur: I von V und X, X von L und C, C von D und M."]]],
  tab:TAB(["I","V","X","L","C","D","M"],[["1","5","10","50","100","500","1000"]]),
  bsp:[["XXVI","10 + 10 + 5 + 1 = 26"],["XCIV","100 − 10 + 5 − 1 = 94"],["38","30 + 8 = XXX + VIII = XXXVIII"],["91","90 + 1 = XC + I = XCI"]],
  achtung:["49 ist nicht IL, sondern 40 + 9 = XL + IX = XLIX.","4 ist IV, nicht IIII."],maus:"Zerleg die Zahl in Tausender, Hunderter, Zehner und Einer und schreib jeden Teil einzeln."},
 ebenen:[
  ZIEHEN.r_zeichen,
  E("r_lesen","Römisch lesen","welche Zahl ist das?",()=>({n:R.ja(.4)?R.int(1,49):R.ja(.5)?R.int(50,499):R.int(1200,2026)}),
   ({n})=>({f:`${roemisch(n)} = {0}`,a:[n],l:`${roemisch(n)} = ${n}`,weg:rWeg(n),
     tipp:(i,v)=>{ const add=[...roemisch(n)].reduce((s,c)=>s+RW[c],0); return v===add&&add!==n?"Steht ein kleineres Zeichen vor einem größeren, ziehst du es ab: IX = 10 − 1 = 9.":null; }})),
  E("r_schreiben","Römisch schreiben","mit I, V, X, L, C, D, M",()=>({n:R.ja(.4)?R.int(1,49):R.ja(.5)?R.int(50,499):R.int(500,3999)}),
   ({n})=>({art:"text",f:`${n} = {0}`,a:[roemisch(n)],l:`${n} = ${roemisch(n)}`,weg:rWeg(n),
     tipp:(i,v)=>{ const w=vonRoemisch(v); if(!Number.isFinite(w)) return "Nimm nur die Zeichen I, V, X, L, C, D und M."; if(w===n) return "Der Wert stimmt, aber so schreibt man es nicht. "+RREGEL; return `Das ist ${w}. Zerleg ${n} in Tausender, Hunderter, Zehner und Einer.`; }})),
  E("r_richtig","Richtig geschrieben?","eine Schreibweise ist falsch",...liste(RFALSCH.map(([n,f])=>wahl(`Wie schreibt man ${n} richtig?`,roemisch(n),[roemisch(n),f],{t:RREGEL,weg:rWeg(n)}))))]},

{id:"m_strahl",kap:"1.3",icon:"📏",name:"Zahlenstrahl",was:"ablesen, Mitte finden, Zahlen dazwischen",
 erkl:{s:"18–19",wozu:"Auf dem Zahlenstrahl siehst du, wo eine Zahl liegt und wie groß sie im Vergleich ist.",
  teile:[["Der Zahlenstrahl",["Er beginnt bei 0 und hat kein Ende. Nach rechts werden die Zahlen größer.","Zwischen zwei Nachbarstrichen ist immer gleich viel Abstand."]],
   ["Ablesen",["Such zwei beschriftete Striche und zähl die Schritte dazwischen.","Abstand der beiden Zahlen geteilt durch die Zahl der Schritte: so viel ist ein Schritt.","Dann vom beschrifteten Strich aus weiterzählen."]],
   ["Zeichnen",["Zuerst die größte Zahl ansehen, dann die Einteilung wählen, zum Beispiel 1er-, 5er- oder 20er-Schritte."]]],
  bsp:[["Zwischen 0 und 50 liegen 5 Schritte.","50 : 5 = 10, ein Schritt ist 10."],["Mitte zwischen 200 000 und 600 000","Abstand 400 000, die Hälfte davon 200 000. 200 000 + 200 000 = 400 000."],["Zahlen zwischen 8 und 16","9, 10, 11, 12, 13, 14, 15: das sind 7. Die 8 und die 16 zählen nicht mit."]],
  achtung:["Ein Strahl mit ungleichen Abständen ist falsch gezeichnet (Stolperstelle S. 19).","Nicht einfach die Striche zählen: erst schauen, wie viel ein Schritt wert ist."],maus:"Erst die Einteilung, dann ablesen."},
 ebenen:[
  ZIEHEN.s_ziehen,
  // Schritt 25 haeufiger: Klassenarbeit 1.1, Aufgabe 3a ("4 Kaestchen fuer 100 Einheiten, 1 Kaestchen fuer 100 : 4 = 25")
  E("s_ablesen","Zahlenstrahl ablesen","welche Zahl zeigt der Pfeil?",()=>{ const [s,L]=R.pick([[1,5],[1,10],[2,5],[5,10],[10,5],[10,10],[20,5],[25,4],[25,4],[25,4],[250,4],[50,10],[100,5],[100,10],[500,10],[1000,5],[1000,10],[10000,10],[100000,5]]);
     const a=R.ja(.6)?0:R.int(1,20)*s*L; let m; do m=R.int(1,2*L-1); while(m%L===0); return {s,L,a,m}; },
   ({s,L,a,m})=>({bild:strahl(a,s,L,m),frage:"Welche Zahl gehört an den Pfeil A?",f:"A = {0}",a:[a+m*s],
     hilfe:`Zwischen ${fz(a)} und ${fz(a+L*s)} liegen ${L} Schritte. Ein Schritt ist ${fz(L*s)} : ${L} = ${fz(s)}.`,
     weg:`Ein Schritt ist ${fz(s)}. Von ${fz(a+Math.floor(m/L)*L*s)} aus ${m%L} ${m%L===1?"Schritt":"Schritte"} weiter: ${fz(a+m*s)}.`,
     tipp:(i,v)=>s>1&&(v===a+m||v===m)?"Nicht nur die Striche zählen: Wie viel ist ein Schritt wert?":L===4&&v!==a+m*s&&Math.abs(v-(a+m*s))<2*s?`4 Schritte sind ${fz(4*s)}, ein Schritt also ${fz(4*s)} : 4 = ${fz(s)}. Zähl in ${fz(s)}er-Schritten.`:null})),
  E("s_mitte","Die Mitte","genau in der Mitte zwischen zwei Zahlen",()=>{ const k=R.pick([1,10,100,1000,10000,100000]), a=R.int(1,40)*k, d=2*R.int(1,30)*k; return {a,b:a+d}; },
   ({a,b})=>({frage:`Welche Zahl liegt genau in der Mitte zwischen ${fz(a)} und ${fz(b)}?`,f:"{0}",a:[(a+b)/2],weg:`Abstand ${fz(b-a)}, die Hälfte davon ${fz((b-a)/2)}. ${fz(a)} + ${fz((b-a)/2)} = ${fz((a+b)/2)}.`,
     tipp:(i,v)=>v===(b-a)/2?"Das ist die Hälfte des Abstands. Zähl sie noch zur kleineren Zahl dazu.":v===a+b?"Das ist die Summe. Die Mitte ist die Hälfte davon.":v===b-a?"Das ist der Abstand. Die Mitte liegt nach der Hälfte davon.":null})),
  E("s_zwischen","Zahlen dazwischen","wie viele liegen zwischen …?",()=>{ const a=R.ja(.6)?R.int(0,50):R.int(90,990); return {a,b:a+R.int(3,22)}; },
   ({a,b})=>({frage:`Wie viele natürliche Zahlen liegen zwischen ${fz(a)} und ${fz(b)}?`,f:"{0} Zahlen",a:[b-a-1],weg:`${fz(a+1)}, ${fz(a+2)}, …, ${fz(b-1)}: ${fz(b)} − ${fz(a)} − 1 = ${b-a-1}. Die ${fz(a)} und die ${fz(b)} zählen nicht mit.`,
     tipp:(i,v)=>v===b-a?"Fast. Die beiden Zahlen selbst zählen nicht mit.":v===b-a+1?`Die ${fz(a)} und die ${fz(b)} zählen nicht mit.`:null}))]},

{id:"m_runden",kap:"1.4",icon:"🎯",name:"Runden",was:"auf Zehner, Hunderter, Tausender …",
 erkl:{s:"20–21",wozu:"Gerundete Zahlen kann man sich leichter merken. Statt 13 589 Besucher sagt man etwa 14 000.",
  teile:[["So rundest du",["Zuerst die Rundungsstelle suchen, zum Beispiel die Hunderter.","Schau nur auf die Ziffer rechts daneben.","0, 1, 2, 3 oder 4: abrunden. Die Rundungsstelle bleibt.","5, 6, 7, 8 oder 9: aufrunden. Die Rundungsstelle wird um 1 größer.","Alles rechts von der Rundungsstelle wird 0.","Das Zeichen ≈ heißt ungefähr gleich."]],
   ["Wann ist Runden sinnvoll?",["Bei Einwohnern, Besuchern und Entfernungen: ja.","Bei Telefonnummern, Hausnummern und Preisen an der Kasse: nein, da braucht man die genaue Zahl."]]],
  tab:TAB(["Zahl","auf Zehner","auf Hunderter","auf Tausender"],[["75 845","75 850","75 800","76 000"],["12 999","13 000","13 000","13 000"]]),
  bsp:[["35 auf Zehner","Rechts von der 3 steht eine 5: aufrunden. 35 ≈ 40."],["1835 auf Hunderter","Rechts von der 8 steht eine 3: abrunden. 1835 ≈ 1800."],["79 835 auf Tausender","Rechts von der 9 steht eine 8: aufrunden. Aus 79 Tausend wird 80 Tausend: 80 000."]],
  achtung:["Nicht zweimal runden: 3549 auf Hunderter ist 3500. Falsch wäre 3549 → 3550 → 3600 (Stolperstelle S. 21).","1550 auf Hunderter ist 1600, nicht 2000. Erst die Stelle prüfen."],maus:"Nur die eine Ziffer rechts neben der Rundungsstelle entscheidet."},
 ebenen:[
  ZIEHEN.ru_aufab,
  E("ru_mark","Runden mit Markierung","die Rundungsstelle ist unterstrichen",rundZieh,
   ({n,s})=>({frage:`Runde <span class="mzahl">${markiert(n,RST[s][0])}</span> auf <b>${RST[s][1]}</b>.<br><small>Grün unterstrichen: die Rundungsstelle. Rot: die Ziffer, die entscheidet.</small>`,f:`${fz(n)} ≈ {0}`,a:[rundeAuf(n,RST[s][0])],weg:rundWeg(n,s),tipp:rundTipp(n,s)})),
  E("ru_stelle","Runden","ohne Markierung",rundZieh,
   ({n,s})=>({frage:`Runde auf <b>${RST[s][1]}</b>.`,f:`${fz(n)} ≈ {0}`,a:[rundeAuf(n,RST[s][0])],hilfe:`Die Rundungsstelle sind die ${RST[s][1]}. Schau auf die Ziffer rechts daneben.`,weg:rundWeg(n,s),tipp:rundTipp(n,s)})),
  E("ru_rueck","Rückwärts runden","welche Zahl war es vorher?",()=>{ const s=R.int(0,2), k=RST[s][0]; return {s,g:R.int(2,99)*k,gr:R.ja()}; },
   ({s,g,gr})=>{ const [k,name]=RST[s], lo=g-k/2, hi=g+k/2-1;
     return {frage:`Eine Zahl wurde auf ${name} gerundet. Das Ergebnis ist <b>${fz(g)}</b>. Welche Zahl ist die <b>${gr?"größte":"kleinste"}</b>, die es gewesen sein kann?`,f:"{0}",a:[gr?hi:lo],
       weg:`Von ${fz(lo)} bis ${fz(hi)} wird alles auf ${fz(g)} gerundet.`,
       tipp:(i,v)=>gr&&v===g+k/2?`${fz(v)} wird schon auf ${fz(g+k)} aufgerundet.`:!gr&&v===lo-1?`${fz(v)} wird auf ${fz(g-k)} abgerundet.`:gr&&v===g+k-1||!gr&&v===g-k+1?"So weit geht es nicht. Bei welcher Ziffer wird aufgerundet?":null}; }),
  E("ru_sinn","Sinnvoll runden?","runden oder genau lassen",...liste(RSINN.map(([t,j,w])=>wahl(`Ist Runden hier sinnvoll?<br><b>${t}</b>`,j?"Ja, runden":"Nein, genau lassen",["Ja, runden","Nein, genau lassen"],{t:"Braucht man hier die genaue Zahl?",weg:w}))))]},

{id:"m_schaetz",kap:"1.5",icon:"⚖️",name:"Größen schätzen",was:"welche Einheit passt?",
 erkl:{s:"22–23",wozu:"Eine Größe besteht aus Maßzahl und Maßeinheit: Bei 100 m ist 100 die Maßzahl und m die Maßeinheit.",
  teile:[["Die Einheiten",["Länge: mm, cm, dm, m, km.","Gewicht: mg, g, kg, t.","Zeit: s, min, h, d."]],
   ["Schätzen",["Vergleiche mit etwas, das du kennst.","Schokolade 100 g, Mehl 1 kg, ein Auto etwa 1 t, eine Stubenfliege 15 mg.","DIN-A4-Blatt etwa 20 cm mal 30 cm, Tisch 80 cm hoch, Zimmer etwa 2,50 m hoch.","1 km dauert zu Fuß 10 bis 15 min, mit dem Fahrrad 4 bis 6 min."]]],
  tab:TAB(["Länge","Gewicht","Zeit"],[["mm Millimeter","mg Milligramm","s Sekunde"],["cm Zentimeter","g Gramm","min Minute"],["dm Dezimeter","kg Kilogramm","h Stunde"],["m Meter","t Tonne","d Tag"],["km Kilometer","",""]]),
  bsp:[["Kiste mit 12 Ein-Liter-Flaschen (Beispiel 1, S. 22)","1 Liter Wasser wiegt etwa 1 kg. 12 Liter wiegen 12 kg, dazu Kiste und Flaschen: etwa 13 bis 15 kg."],["Haus mit 5 Etagen","Eine Etage ist etwa 2,50 m hoch, das Haus also etwa 12,50 m."]],
  achtung:["Ohne Einheit sagt eine Zahl nichts: 80 ist kein Tisch, 80 cm schon."],maus:"Vergleichen hilft beim Schätzen."},
 ebenen:[ZIEHEN.sc_einheit,E("sc_wieviel","Wie schwer, wie lang?","eine Angabe passt",...liste(SWIEVIEL))]},

{id:"m_laenge",kap:"1.6",icon:"📐",name:"Längen umrechnen",was:"km, m, dm, cm, mm. Vor allem m und cm",
 erkl:{s:"24–27",wozu:"Zum Vergleichen und Rechnen müssen Längen in derselben Einheit stehen. Dafür brauchst du die Umrechnungszahlen.",
  teile:[["Die Umrechnungszahlen",["1 km = 1000 m","1 m = 10 dm","1 dm = 10 cm","1 cm = 10 mm","Daraus folgt: 1 m = 10 · 10 cm = 100 cm und 1 m = 1000 mm."]],
   ["Von m nach cm (wie im Buch, S. 24)",["1 m sind 100 cm. 3 m sind also 3 mal 100 cm.","3 m = 3 · 100 cm = 300 cm."]],
   ["Von cm nach m (wie im Buch, S. 24 und 30)",["Frag dich: Wie oft stecken 100 cm drin? So viele Meter sind es.","400 cm = 4 · 100 cm = 4 m.","40 000 cm = 400 · 100 cm = 400 m.","Bleibt etwas übrig: 345 cm = 3 · 100 cm + 45 cm = 3 m 45 cm = 3,45 m."]]],
  tab:`<p class="mtreppe"><span>km</span><i>1000</i><span>m</span><i>10</i><span>dm</span><i>10</i><span>cm</span><i>10</i><span>mm</span></p>`+TAB(["von","nach","Rechnung"],[["m","cm","mal 100"],["cm","m","geteilt durch 100"],["km","m","mal 1000"],["m","km","geteilt durch 1000"],["cm","mm","mal 10"],["mm","cm","geteilt durch 10"]]),
  bsp:[["3 m in cm","3 m = 3 · 100 cm = 300 cm"],["400 cm in m","400 cm = 4 · 100 cm = 4 m"],["40 000 cm in m (S. 30)","40 000 cm = 400 · 100 cm = 400 m"],["2 m 5 cm in cm","200 cm + 5 cm = 205 cm"],["3,45 m in cm","3 m 45 cm = 300 cm + 45 cm = 345 cm"]],
  achtung:["1 m sind 100 cm, nicht 10. Zwischen m und cm liegt noch der dm.","Sabrina rechnet 24 km = 2400 m. Richtig ist 24 · 1000 = 24 000 m (Stolperstelle S. 26).","Kleinere Einheit, größere Zahl. Größere Einheit, kleinere Zahl."],
  maus:"Meter in Zentimeter: zwei Nullen dran. Zentimeter in Meter: zwei Nullen weg."},
 ebenen:[
  ZIEHEN.l_treppe,
  ZIEHEN.l_weg,
  E("l_zahl","Die Umrechnungszahlen","1 m = ? cm",...liste([["1 m = {0} cm",100,"Zwischen m und cm liegt noch der dm: 1 m = 10 dm, 1 dm = 10 cm. Also 10 · 10 = 100."],["1 km = {0} m",1000,"Kilo heißt tausend."],["1 m = {0} dm",10,"Dezi heißt ein Zehntel."],["1 dm = {0} cm",10,"Ein Dezimeter ist so lang wie zehn Zentimeter."],["1 cm = {0} mm",10,"Auf dem Lineal: zehn kleine Striche pro Zentimeter."],["1 m = {0} mm",1000,"1 m = 100 cm und 1 cm = 10 mm: 100 · 10 = 1000."],["100 cm = {0} m",1,"100 cm sind genau ein Meter."],["10 mm = {0} cm",1,"10 mm sind genau ein Zentimeter."],["1000 m = {0} km",1,"1000 m sind genau ein Kilometer."],["10 dm = {0} m",1,"10 dm sind genau ein Meter."]].map(([f,a,t])=>({f,a:[a],hilfe:t,tipp:()=>t,weg:f.replace("{0}",fz(a))})),10)),
  E("l_mcm","Meter in Zentimeter","mal 100",()=>({q:R.ja(.7)?R.int(1,20):R.pick([25,30,40,50,75,120,250])}),({q})=>um(q,"m","cm",LG,mcmTipp)),
  E("l_cmm","Zentimeter in Meter","geteilt durch 100",()=>({q:R.ja(.7)?R.int(1,20):R.pick([25,30,40,50,75,120,250])}),({q})=>um(q*100,"cm","m",LG,mcmTipp)),
  // mm dazu: In der Klassenarbeit las Jonathan 1 m 12 mm als 1,12 (Aufgabe 6)
  E("l_gemischt","Meter und cm oder mm","3 m 45 cm = 345 cm, 1 m 12 mm = 1012 mm",()=>{ const r=R.ja(), m=R.int(1,9); if(R.ja(.4)) return {m,c:R.ja(.6)?R.int(1,99):R.int(101,999),r,u:"mm"}; return {m,c:R.ja(.35)?R.int(1,9):R.int(10,99),r}; },
   ({m,c,r,u})=>{ if(u==="mm"){ const t=m*1000+c;
       return r?{f:`${fz(t)} mm = {0} m {1} mm`,a:[m,c],hilfe:"1000 mm sind 1 m. Wie viele ganze Meter stecken drin, und was bleibt übrig?",weg:`${fz(t)} mm = ${fz(m*1000)} mm + ${c} mm = ${m} m ${c} mm`,
           tipp:(i,v)=>i===0&&v===Math.floor(t/100)?"1 m sind 1000 mm, nicht 100 mm.":i===1&&v===t?"Die ganzen Meter stehen schon vorn. Hier kommt nur der Rest hin.":null}
         :{f:`${m} m ${c} mm = {0} mm`,a:[t],hilfe:`${m} m sind ${fz(m*1000)} mm. Dann kommen die ${c} mm dazu.`,weg:`${m} m ${c} mm = ${fz(m*1000)} mm + ${c} mm = ${fz(t)} mm`,
           tipp:(i,v)=>v===Number(`${m}${c}`)?`${m} m sind ${fz(m*1000)} mm. Dazu kommen ${c} mm.`:v===m*100+c?"1 m sind 1000 mm, nicht 100.":gleich(v,m+c/100)||v===m*1000+10*c?`${m} m ${c} mm ist nicht ${fz(m+c/100)} m. Gefragt ist in mm: ${fz(m*1000)} mm + ${c} mm.`:v===m*1000?`Die ${c} mm fehlen noch.`:null}; }
     const t=m*100+c;
     return r?{f:`${t} cm = {0} m {1} cm`,a:[m,c],hilfe:"100 cm sind 1 m. Wie viele ganze Meter stecken drin, und was bleibt übrig?",weg:`${t} cm = ${m*100} cm + ${c} cm = ${m} m ${c} cm`,
         tipp:(i,v)=>i===0&&v===Math.floor(t/10)?"100 cm sind 1 m, nicht 10 cm.":i===1&&v===t?"Die ganzen Meter stehen schon vorn. Hier kommt nur der Rest hin.":null}
       :{f:`${m} m ${c} cm = {0} cm`,a:[t],hilfe:`${m} m sind ${m*100} cm. Dann kommen die ${c} cm dazu.`,weg:`${m} m ${c} cm = ${m*100} cm + ${c} cm = ${t} cm`,
         tipp:(i,v)=>v===Number(`${m}${c}`)?`${m} m sind ${m*100} cm. Dazu ${c} cm.`:v===m*10+c?"1 m sind 100 cm, nicht 10.":v===m*100?`Die ${c} cm fehlen noch.`:null}; }),
  E("l_alle","Alle Längen","mm, cm, dm, m, km",()=>{ const [g,k]=R.pick(LPAARE), F=LG[g]/LG[k], rauf=R.ja(); return {g,k,q:rauf?R.int(2,60)*F:R.int(2,60)*(F===1000&&R.ja(.3)?10:1),rauf}; },
   ({g,k,q,rauf})=>rauf?um(q,k,g,LG,mcmTipp):um(q,g,k,LG,mcmTipp)),
  E("l_komma","Meter mit Komma","3,45 m = 345 cm",()=>{ const r=R.ja(); if(r) return {r,c:R.ja(.2)?R.int(1,9):R.ja(.3)?R.int(10,99):R.int(101,999)}; const k=R.int(0,2); return {r,q:k===0?R.int(101,999)/100:k===1?R.int(11,99)/10:R.int(1,99)/100}; },
   ({r,c,q})=>{ if(r){ const a=c/100; return {f:`${fz(c)} cm = {0} m`,a:[a],hilfe:"Wie oft stecken 100 cm drin? Das sind die ganzen Meter, der Rest kommt hinter das Komma.",weg:`${fz(c)} cm = ${Math.floor(c/100)} · 100 cm + ${c%100} cm = ${Math.floor(c/100)} m ${c%100} cm = ${fz(a)} m`,
       tipp:(i,v)=>gleich(v,c/10)?"Zwei Stellen nach links, nicht nur eine: 1 m = 100 cm.":gleich(v,c/1000)?"Eine Stelle zu weit: 1 m sind 100 cm, nicht 1000.":gleich(v,c)?"Meter sind größer, die Zahl wird kleiner: geteilt durch 100.":null}; }
     const a=rund(q*100), g=Math.floor(q), rest=rund(a-g*100);
     return {f:`${fz(q)} m = {0} cm`,a:[a],hilfe:`${fz(q)} m = ${g} m ${rest} cm. Ein Meter sind 100 cm.`,weg:`${fz(q)} m = ${g} m ${rest} cm = ${g*100} cm + ${rest} cm = ${fz(a)} cm`,
       tipp:(i,v)=>gleich(v,q*10)?(String(q).split(".")[1]?.length===1?`Hinten fehlt eine 0: ${fz(q)} m = ${fz(q)}0 m. Das Komma rückt zwei Stellen nach rechts.`:"Das Komma rückt zwei Stellen nach rechts, nicht eine."):gleich(v,q*1000)?"Das wären Millimeter. Für Zentimeter: mal 100.":null}; }),
  // Klassenarbeit 1.1, Aufgabe 5d: 2 400 000 cm in km, ohne Zwischenrechnung keine Teilpunkte
  E("l_stufen","Über mehrere Stufen","2 400 000 cm = 24 000 m = 24 km",()=>({i:R.int(0,STUFEN.length-1),x:R.ja(.6)?R.int(2,60):R.int(11,99)/10}),
   ({i,x})=>{ const [A,B,C]=STUFEN[i], gr=LG[A]>LG[C]?A:C, v=[A,B,C].map(u=>rund(x*LG[gr]/LG[u])), s1=um(v[0],A,B,LG,mcmTipp), s2=um(v[1],B,C,LG,mcmTipp);
     return {frage:"Rechne über die Zwischenstufe. Schreib den Zwischenschritt hin, dafür gibt es in der Arbeit Teilpunkte.",f:`${fz(v[0])} ${A} = {0} ${B} = {1} ${C}`,a:[v[1],v[2]],
       hilfe:`Stufe für Stufe: erst von ${A} nach ${B}, dann von ${B} nach ${C}. ${TREPPE}`,weg:`${s1.weg}. ${s2.weg}.`,tipp:(k,w)=>(k?s2:s1).tipp(0,w)}; }),
  E("l_text","Sachaufgaben","Längen im Alltag, auch der Holzstab aus der Arbeit",()=>{ const k=R.int(0,4); return k<4?{k,x:R.int(0,99),y:R.int(0,99)}:holzZieh(); },
   p=>{ const {k,x,y}=p;
     if(k===4){ const {L,a,c,e,s}=p, st=2*(200+10*e), sum=20*a+1000+c+st+5*s, r=L*10-sum;
       return {frage:`Ein Holzstab ist ${L} cm lang. Abgesägt werden 2 Stücke zu je ${a} cm, ein Stück von 1 m ${c} mm und 2 Stücke zu je 2 dm ${e} cm. Für jedes Stück gibt es einen Sägeschnitt, dabei gehen jedes Mal ${s} mm verloren. Wie lang ist das Reststück?`,
         f:"{0} mm",a:[r],hilfe:"Rechne alles in mm um: 1 cm = 10 mm, 1 dm = 100 mm, 1 m = 1000 mm. Dann alles abziehen, auch die Sägeschnitte.",
         weg:`Alles in mm: ${L} cm = ${fz(L*10)} mm. 2 · ${a} cm = 2 · ${a*10} mm = ${fz(20*a)} mm. 1 m ${c} mm = ${fz(1000+c)} mm. 2 · 2 dm ${e} cm = 2 · ${200+10*e} mm = ${st} mm. 5 Schnitte · ${s} mm = ${5*s} mm. ${fz(L*10)} − ${fz(20*a)} − ${fz(1000+c)} − ${st} − ${5*s} = ${fz(r)} mm.`,
         tipp:(i,v)=>v===r+5*s?`Die Sägeschnitte fehlen: 5 Stücke, also 5 Schnitte zu je ${s} mm.`:v===r+200+10*e?`Es sind zwei Stücke zu je 2 dm ${e} cm.`:v===r+20*a/2?`Es sind zwei Stücke zu je ${a} cm.`
           :c<100&&v===r+(1000+c)-(1000+10*c)?`1 m ${c} mm sind ${fz(1000+c)} mm, nicht ${fz(1000+10*c)} mm.`:gleich(v,r/10)?"Das sind Zentimeter. Gefragt ist in mm.":null}; }
     if(k===0){ const a=250+x, b2=a===250+y?a-7:250+y;
       return {frage:`Tim springt ${fz(a/100)} m weit, Lea ${b2} cm. Um wie viele Zentimeter springt der Bessere weiter?`,f:"{0} cm",a:[Math.abs(a-b2)],hilfe:`Erst in dieselbe Einheit: ${fz(a/100)} m = ${a} cm.`,weg:`${fz(a/100)} m = ${a} cm. ${Math.max(a,b2)} cm − ${Math.min(a,b2)} cm = ${Math.abs(a-b2)} cm.`}; }
     if(k===1){ const br=[20,25,30,40,50,60][x%6], n=2+y%6, L=br*n;
       return {frage:`Ein Regal ist ${fz(L/100)} m breit. Wie viele Kisten mit ${br} cm Breite passen nebeneinander hinein?`,f:"{0} Kisten",a:[n],hilfe:`${fz(L/100)} m = ${L} cm.`,weg:`${fz(L/100)} m = ${L} cm. ${L} : ${br} = ${n}.`,
         tipp:(i,v)=>gleich(v,L/100/br)?"Erst die Meter in Zentimeter umrechnen.":null}; }
     if(k===2){ const s=50+5*(x%7), n=100*(1+y%6), a=s*n/100;
       return {frage:`Mia macht ${n} Schritte, jeder ist ${s} cm lang. Wie viele Meter ist sie gegangen?`,f:"{0} m",a:[a],hilfe:`${n} · ${s} cm = ${fz(n*s)} cm. Dann in Meter: geteilt durch 100.`,weg:`${n} · ${s} cm = ${fz(n*s)} cm = ${fz(a)} m`,
         tipp:(i,v)=>gleich(v,n*s)?"Das sind Zentimeter. In Meter: geteilt durch 100.":null}; }
     const L=2+x%4, c=30+5*(y%31);
     return {frage:`Von einem ${L} m langen Band schneidest du ${c} cm ab. Wie viele Zentimeter bleiben übrig?`,f:"{0} cm",a:[L*100-c],hilfe:`${L} m = ${L*100} cm.`,weg:`${L} m = ${L*100} cm. ${L*100} cm − ${c} cm = ${L*100-c} cm.`,
       tipp:(i,v)=>v===L*10-c||v===c-L?"Erst die Meter in Zentimeter umrechnen: 1 m = 100 cm.":null}; })]},

{id:"m_gewicht",kap:"1.6",icon:"🏋️",name:"Gewichte umrechnen",was:"t, kg, g, mg",
 erkl:{s:"24–26",wozu:"Auch Gewichte rechnest du mit Umrechnungszahlen um. Hier ist es immer die 1000.",
  teile:[["Die Umrechnungszahlen",["1 t = 1000 kg","1 kg = 1000 g","1 g = 1000 mg"]],
   ["So rechnest du",["In die kleinere Einheit: mal 1000. 18 kg = 18 000 g.","In die größere Einheit (Beispiel 1, S. 24): 1 g sind 1000 mg. 4 mal 1000 mg sind also 4 g: 4000 mg = 4 · 1000 mg = 4 g.","Vergleichen: erst in dieselbe Einheit umrechnen. 8 kg = 8000 g, das ist mehr als 7389 g."]]],
  tab:`<p class="mtreppe"><span>t</span><i>1000</i><span>kg</span><i>1000</i><span>g</span><i>1000</i><span>mg</span></p>`+TAB(["von","nach","Rechnung"],[["t","kg","mal 1000"],["kg","g","mal 1000"],["g","mg","mal 1000"],["mg → g → kg → t","","geteilt durch 1000"]]),
  bsp:[["5 t in kg","5 · 1000 = 5000 kg"],["24 000 mg in g","24 000 mg = 24 · 1000 mg = 24 g"],["2 kg 70 g in g","2000 g + 70 g = 2070 g"]],
  achtung:["Sabrina schreibt 3000 kg = 3 g. Richtig ist 3000 kg = 3 t (Stolperstelle S. 26)."],maus:"Bei Gewichten ist es immer die 1000."},
 ebenen:[
  ZIEHEN.w_treppe,
  E("w_zahl","Die Umrechnungszahlen","1 kg = ? g",...liste([["1 t = {0} kg",1000],["1 kg = {0} g",1000],["1 g = {0} mg",1000],["1000 kg = {0} t",1],["1000 g = {0} kg",1],["1000 mg = {0} g",1]].map(([f,a])=>({f,a:[a],hilfe:"Bei Gewichten ist die Umrechnungszahl immer 1000.",weg:f.replace("{0}",fz(a))}))),6),
  E("w_klein","In die kleinere Einheit","mal 1000",()=>{ const [g,k]=R.pick([["t","kg"],["kg","g"],["g","mg"]]); return {g,k,q:R.ja(.7)?R.int(2,90):R.int(101,999)}; },({g,k,q})=>um(q,g,k,GW)),
  E("w_gross","In die größere Einheit","geteilt durch 1000",()=>{ const [g,k]=R.pick([["t","kg"],["kg","g"],["g","mg"]]); return {g,k,q:R.int(2,90)}; },({g,k,q})=>um(q*1000,k,g,GW)),
  E("w_gemischt","kg und g","2 kg 70 g = 2070 g",()=>({g:R.int(1,9),k:R.ja(.4)?R.int(5,95):R.int(101,995),r:R.ja(),t:R.ja(.3)}),
   ({g,k,r,t})=>{ const [G,K]=t?["t","kg"]:["kg","g"], s=g*1000+k;
     return r?{f:`${fz(s)} ${K} = {0} ${G} {1} ${K}`,a:[g,k],hilfe:`1000 ${K} sind 1 ${G}.`,weg:`${fz(s)} ${K} = ${fz(g*1000)} ${K} + ${k} ${K} = ${g} ${G} ${k} ${K}`}
       :{f:`${g} ${G} ${k} ${K} = {0} ${K}`,a:[s],hilfe:`${g} ${G} sind ${fz(g*1000)} ${K}.`,weg:`${fz(g*1000)} ${K} + ${k} ${K} = ${fz(s)} ${K}`,
         tipp:(i,v)=>v===Number(`${g}${k}`)?`${g} ${G} sind ${fz(g*1000)} ${K}. Dazu kommen ${k} ${K}.`:null}; }),
  E("w_vergl","Was ist schwerer?","erst dieselbe Einheit",()=>{ const [g,k]=R.pick([["kg","g"],["t","kg"],["g","mg"]]), q=R.int(2,40), x=R.int(0,3); return {g,k,q,b:x===0?q*1000:x===1?q*1000-R.int(1,900):x===2?q*1000+R.int(1,900):q*100}; },
   ({g,k,q,b})=>{ const A=`${fz(q)} ${g}`, B=`${fz(b)} ${k}`, a=b===q*1000?"gleich schwer":b<q*1000?A:B;
     return wahl(`Was ist schwerer: <b>${A}</b> oder <b>${B}</b>?`,a,[A,B,"gleich schwer"],{t:`Rechne zuerst ${A} in ${k} um.`,weg:`${A} = ${fz(q*1000)} ${k}. ${a==="gleich schwer"?"Beide sind gleich schwer.":`Schwerer ist ${a}.`}`}); })]},

{id:"m_zeit",kap:"1.6",icon:"⏰",name:"Zeit umrechnen",was:"d, h, min, s und Uhrzeiten",
 erkl:{s:"25–27",wozu:"Zeiten rechnen anders als Längen: Eine Stunde hat 60 Minuten, nicht 100.",
  teile:[["Die Umrechnungszahlen",["1 d = 24 h","1 h = 60 min","1 min = 60 s","1 Woche = 7 Tage, 1 Jahr = 12 Monate"]],
   ["Zeitpunkt und Zeitspanne",["„Wann?“ fragt nach dem Zeitpunkt: um 16:15 Uhr.","„Wie lange?“ fragt nach der Zeitspanne: 38 min.","Zeitspanne ausrechnen: erst bis zur vollen Stunde, dann die ganzen Stunden, dann die restlichen Minuten."]]],
  tab:TAB(["","Minuten"],[["Viertelstunde","15 min"],["halbe Stunde","30 min"],["Dreiviertelstunde","45 min"],["eineinhalb Stunden","90 min"]]),
  bsp:[["5 h in min","5 · 60 = 300 min"],["72 h in d","72 : 24 = 3 d"],["Schule von 7:50 bis 12:55","7:50 → 8:00 sind 10 min, 8:00 → 12:00 sind 4 h, 12:00 → 12:55 sind 55 min. Zusammen 4 h 65 min = 5 h 5 min."]],
  achtung:["Sabrina schreibt 7 min = 70 s. Richtig ist 7 · 60 = 420 s (Stolperstelle S. 26).","Bei Zeiten gibt es kein Komma wie bei Metern: 1,7 h sind nicht 1 h 70 min."],maus:"Bei der Uhr ist die 60 die wichtige Zahl."},
 ebenen:[
  ZIEHEN.z_treppe,
  E("z_zahl","Die Umrechnungszahlen","1 h = ? min",...liste([["1 d = {0} h",24],["1 h = {0} min",60],["1 min = {0} s",60],["1 Woche = {0} Tage",7],["1 Jahr = {0} Monate",12],["1 h = {0} s",3600],["eine halbe Stunde = {0} min",30],["eine Viertelstunde = {0} min",15],["eine Dreiviertelstunde = {0} min",45],["eineinhalb Stunden = {0} min",90],["ein halber Tag = {0} h",12],["eine halbe Minute = {0} s",30]].map(([f,a])=>({f,a:[a],hilfe:"1 h = 60 min, 1 min = 60 s, 1 d = 24 h.",weg:f.replace("{0}",fz(a)),tipp:(i,v)=>v===100||v===50||v===25||v===75||v===150?"Eine Stunde hat 60 Minuten, nicht 100.":null})))),
  E("z_um","Zeit umrechnen","min, s, h, d",()=>{ const k=R.int(0,4); if(k<2){ const [g,kl]=R.pick([["min","s"],["h","min"],["d","h"]]); return {k,g,kl,q:R.int(2,12)}; } return {k,h:R.int(1,5),m:R.int(5,55)}; },
   ({k,g,kl,q,h:hh,m})=>{ if(k===0) return um(q,g,kl,ZT,v=>v===q*100?{d:"Ein Tag hat 24 Stunden, nicht 100.",h:"Eine Stunde hat 60 Minuten, nicht 100.",min:"Eine Minute hat 60 Sekunden, nicht 100."}[g]:null);
     if(k===1){ const F=ZT[g]/ZT[kl]; return um(q*F,kl,g,ZT); }
     const t=hh*60+m; if(k===2) return {f:`${hh} h ${m} min = {0} min`,a:[t],hilfe:`${hh} h sind ${hh} · 60 = ${hh*60} min.`,weg:`${hh*60} min + ${m} min = ${t} min`,tipp:(i,v)=>v===hh*100+m?"Eine Stunde hat 60 Minuten, nicht 100.":null};
     return {f:`${t} min = {0} h {1} min`,a:[hh,m],hilfe:"60 min sind 1 h. Wie oft passt 60 hinein?",weg:`${t} min = ${hh*60} min + ${m} min = ${hh} h ${m} min`,tipp:(i,v)=>i===0&&v===Math.floor(t/100)||i===1&&v===t%100?"Eine Stunde hat 60 Minuten, nicht 100.":i===1&&v>=60?"Mehr als 59 Minuten bleiben nie übrig.":null}; }),
  E("z_spanne","Wie lange dauert es?","Zeitspanne zwischen zwei Uhrzeiten",()=>{ const s=R.int(6*60,17*60); let d=R.ja(.45)?R.int(8,55):R.int(65,330); if(d%60===0) d+=7; return {s,d}; },
   ({s,d})=>{ const e=s+d, f100=(Math.floor(e/60)*100+e%60)-(Math.floor(s/60)*100+s%60);
     return {frage:`Von <b>${uhr(s)} Uhr</b> bis <b>${uhr(e)} Uhr</b>. Wie lange ist das?`,f:d<60?"{0} min":"{0} h {1} min",a:d<60?[d]:[Math.floor(d/60),d%60],hilfe:"Rechne erst bis zur vollen Stunde, dann die ganzen Stunden, dann die restlichen Minuten.",weg:spanneWeg(s,d),
       tipp:(i,v)=>d<60&&v===f100?"Eine Stunde hat 60 Minuten, nicht 100. Rechne erst bis zur vollen Stunde.":i===1&&v>=60?"Mehr als 59 Minuten gibt es nicht: 60 min sind 1 h.":null}; }),
  E("z_punkt","Wann ist es zu Ende?","Uhrzeit plus Dauer",()=>({s:R.int(6*60,19*60),d:R.ja(.4)?R.int(10,55):R.int(65,240),k:R.int(0,2)}),
   ({s,d,k})=>{ const e=s+d, was=["Das Training beginnt","Der Film beginnt","Der Zug fährt los"][k];
     return {frage:`${was} um <b>${uhr(s)} Uhr</b> und dauert <b>${dauer(d)}</b>. Um wie viel Uhr ist es vorbei?`,f:"{0} : {1} Uhr",a:[Math.floor(e/60),e%60],l:`${uhr(e)} Uhr`,hilfe:"Zähl erst die ganzen Stunden dazu, dann die Minuten.",
       weg:`${uhr(s)} + ${dauer(d)} = ${uhr(e)} Uhr`,tipp:(i,v)=>i===1&&v>=60?"60 Minuten sind eine Stunde. Rechne die Stunde vorn dazu.":null}; })]},

{id:"m_geld",kap:"1.6",icon:"💶",name:"Geld und Rechnen mit Größen",was:"€ und ct, erst dieselbe Einheit",
 erkl:{s:"26–27",wozu:"Geld rechnest du um wie Meter in Zentimeter: 1 € = 100 ct. Und wer mit Größen rechnet, braucht erst dieselbe Einheit.",
  teile:[["Euro und Cent",["1 € = 100 ct","2,79 € = 2 € 79 ct = 279 ct","465 ct = 4,65 €"]],
   ["Mit Größen rechnen",["Erst beide Größen in dieselbe Einheit umrechnen, am besten in die kleinere.","Dann rechnen: 2 km + 300 m = 2000 m + 300 m = 2300 m."]]],
  bsp:[["30,05 € in ct","30 € = 3000 ct, dazu 5 ct: 3005 ct"],["2 km + 300 m","2000 m + 300 m = 2300 m"],["3 h + 50 min","180 min + 50 min = 230 min"]],
  achtung:["30,05 € sind 3005 ct, nicht 305 ct: Nach dem Komma stehen immer zwei Stellen für die Cent."],maus:"Erst die gleiche Einheit, dann rechnen."},
 ebenen:[
  ZIEHEN.ge_paare,
  E("ge_ct","Euro und Cent","1 € = 100 ct",()=>R.ja()?{e:R.int(1,60),c:R.pick([0,R.int(1,9),R.int(10,99),R.int(10,99)]),r:0}:{e:0,c:R.int(5,9999),r:1},
   ({e,c,r})=>r?{f:`${fz(c)} ct = {0} €`,a:[c/100],l:`${fz(c)} ct = ${geld(c/100)} €`,hilfe:"100 ct sind 1 €. Das Komma rückt zwei Stellen nach links.",weg:`${fz(c)} : 100 = ${geld(c/100)}, also ${geld(c/100)} €`,tipp:(i,v)=>gleich(v,c/10)?"100 ct sind 1 €: zwei Stellen nach links, nicht eine.":gleich(v,c)?"Euro sind größer, die Zahl wird kleiner: geteilt durch 100.":null}
     :{f:`${geld(e+c/100)} € = {0} ct`,a:[e*100+c],hilfe:"1 € = 100 ct. Erst die Euro umrechnen, dann die Cent dazu.",weg:`${e} € = ${e*100} ct${c?`, dazu ${c} ct: ${e*100+c} ct`:""}`,
       tipp:(i,v)=>c&&c<10&&v===Number(`${e}${c}`)?"Nach dem Komma stehen immer zwei Stellen für die Cent: ,05 sind 5 ct.":v===e*10+c||v===e*10?"1 € sind 100 ct, nicht 10.":null}),
  E("ge_rechnen","Mit Größen rechnen","erst dieselbe Einheit",()=>({k:R.int(0,8),a:R.int(1,9),b:R.int(1,9),p:R.ja()}),
   ({k,a,b,p})=>{ const [G,K,F,U]=[["km","m",1000],["m","cm",100],["m","dm",10],["cm","mm",10],["kg","g",1000],["t","kg",1000],["g","mg",1000],["h","min",60],["min","s",60]][k];
     const bk=F===10?b:F===60?b*5:b*(F/10), x=a*F, plus=p||bk>=x, r=plus?x+bk:x-bk;
     return {f:`${a} ${G} ${plus?"+":"−"} ${fz(bk)} ${K} = {0} ${K}`,a:[r],hilfe:`Erst in ${K} umrechnen: ${a} ${G} = ${fz(x)} ${K}.`,weg:`${a} ${G} = ${fz(x)} ${K}. ${fz(x)} ${plus?"+":"−"} ${fz(bk)} = ${fz(r)} ${K}.`,
       tipp:(i,v)=>v===(plus?a+bk:Math.abs(a-bk))?`Erst in dieselbe Einheit umrechnen: ${a} ${G} = ${fz(x)} ${K}.`:null}; })]},

{id:"m_komma",kap:"1.7",icon:"🔸",name:"Kommaschreibweise",was:"3,8 cm = 38 mm",
 erkl:{s:"28–29",wozu:"Größen kann man mit Komma schreiben: 3,8 cm heißt 3 cm und 8 mm.",
  teile:[["Die Einheitentafel",["Die Zahl vor dem Komma kommt in die Spalte der Einheit.","Die Ziffern nach dem Komma kommen der Reihe nach in die Spalten rechts daneben.","Leere Spalten bis zur gesuchten Einheit füllst du mit 0. Dann liest du ohne Komma ab."]],
   ["Mit der Umrechnungszahl",["Das Komma rückt um so viele Stellen, wie die Umrechnungszahl Nullen hat.","In die kleinere Einheit nach rechts, in die größere nach links."]]],
  tab:TAB(["mit Komma","zerlegt","ohne Komma"],[["3,8 cm","3 cm 8 mm","38 mm"],["6,7 km","6 km 700 m","6700 m"],["1,175 kg","1 kg 175 g","1175 g"],["0,85 t","0 t 850 kg","850 kg"]]),
  bsp:[["4,2 km in m","1 km = 1000 m hat drei Nullen: Komma drei Stellen nach rechts. 4,200 → 4200 m"],["250 cm in m","1 m = 100 cm hat zwei Nullen: Komma zwei Stellen nach links. 2,50 m = 2,5 m"],["23 mg in g","1 g = 1000 mg: drei Stellen nach links. 0,023 g"]],
  achtung:["Jan schreibt 3,7 km = 37 m. Richtig ist 3,7 km = 3 km 700 m = 3700 m (Stolperstelle S. 29).","0,6 m sind 60 cm, nicht 6 cm.","Zeiten schreibt man nicht mit Komma um: 1,7 h sind nicht 1 h 70 min."],maus:"So viele Nullen die Umrechnungszahl hat, so viele Stellen rückt das Komma."},
 ebenen:[
  ZIEHEN.k_puzzle,
  E("k_ohne","Ohne Komma schreiben","in die kleinere Einheit",()=>{ const i=R.int(0,KPAARE.length-1), [g,k,U]=KPAARE[i]; return {i,q:kommaZahl(U[g]/U[k])}; },
   ({i,q})=>{ const [g,k,U]=KPAARE[i], F=U[g]/U[k], n=KOMMA_AN(F), roh=Number(String(q).replace(".","")); const x=um(q,g,k,U);
     return {...x,hilfe:`${fz(q)} ${g} = ${zerlegt(q,g,k,F)}. 1 ${g} = ${fz(F)} ${k}: das Komma rückt ${n} ${n===1?"Stelle":"Stellen"} nach rechts.`,weg:`${fz(q)} ${g} = ${zerlegt(q,g,k,F)} = ${fz(rund(q*F))} ${k}`,
       tipp:(j,v)=>v===roh&&!gleich(roh,q*F)?`Das Komma rückt ${n} ${n===1?"Stelle":"Stellen"} nach rechts, weil 1 ${g} = ${fz(F)} ${k}. Fehlende Stellen füllst du mit 0.`:x.tipp(j,v)}; }),
  E("k_mit","Mit Komma schreiben","in die größere Einheit",()=>{ const i=R.int(0,KPAARE.length-1), [g,k,U]=KPAARE[i], F=U[g]/U[k]; let x; do x=R.int(Math.max(2,F/100),20*F); while(x%F===0); return {i,x}; },
   ({i,x})=>{ const [g,k,U]=KPAARE[i], F=U[g]/U[k], n=KOMMA_AN(F), a=rund(x/F);
     return {f:`${fz(x)} ${k} = {0} ${g}`,a:[a],hilfe:`1 ${g} = ${fz(F)} ${k}: das Komma rückt ${n} ${n===1?"Stelle":"Stellen"} nach links.`,weg:`${fz(x)} ${k} = ${zerlegt(a,g,k,F)} = ${fz(a)} ${g}`,
       tipp:(j,v)=>gleich(v,x*F)?`${g} ist die größere Einheit, die Zahl wird kleiner.`:gleich(v,a*10)||gleich(v,a/10)?`Bei ${fz(F)} rückt das Komma genau ${n} ${n===1?"Stelle":"Stellen"} nach links.`:null}; }),
  E("k_teile","Zerlegen","6,7 km = 6 km 700 m",()=>{ const i=R.int(0,KPAARE.length-1), [g,k,U]=KPAARE[i]; let q; do q=kommaZahl(U[g]/U[k]); while(q<1); return {i,q}; },
   ({i,q})=>{ const [g,k,U]=KPAARE[i], F=U[g]/U[k], n=KOMMA_AN(F), ganz=Math.floor(q), rest=rund((q-ganz)*F), hinten=Number(String(q).split(".")[1]);
     return {f:`${fz(q)} ${g} = {0} ${g} {1} ${k}`,a:[ganz,rest],hilfe:`Vor dem Komma stehen die ganzen ${g}. Hinter dem Komma kommen ${n} ${n===1?"Stelle":"Stellen"} für die ${k}.`,weg:`${fz(q)} ${g} = ${q.toFixed(n).replace(".",",")} ${g} = ${ganz} ${g} ${fz(rest)} ${k}`,
       tipp:(j,v)=>j===1&&v===hinten&&hinten!==rest?`Hinter dem Komma gehören bei ${g} genau ${n} Stellen zu den ${k}: ${fz(q)} ${g} = ${q.toFixed(n).replace(".",",")} ${g}.`:null}; }),
  E("k_ordnen","Längen ordnen","erst in dieselbe Einheit",()=>{ const s=new Set(); while(s.size<5) s.add(R.int(8,260)*10); return {w:[...s].map(x=>({x,f:R.int(0,4)}))}; },
   ({w})=>({typ:"ordnen",frage:"Tipp die Längen der Größe nach an, die kürzeste zuerst.",o:w.map(({x,f})=>({t:laengeText(x,f),w:x})),t:"Rechne alle Längen im Kopf in cm um.",weg:"In cm: "+[...w].sort((a,b)=>a.x-b.x).map(({x,f})=>`${laengeText(x,f)} = ${fz(x/10)} cm`).join(", ")}))]},

// Nach der Klassenarbeit 1.1 (4+): Johannes' Zettel vom 26.11.2026, "Ich brauche noch eine Basic Uebung zum Mal und Teilen bzw.
// Verschieben des Komma" und "Solche Aufgaben muss er auch mehr ueben" (40 · 2,8 zerlegen). Regel wie im Buch S. 29, Aufgabe 8.
{id:"m_rkomma",kap:"1.7",icon:"✖️",name:"Rechnen mit Komma",was:"mal und geteilt durch 10, 100, 1000; zerlegen",
 erkl:{s:"29",wozu:"Mit Kommazahlen rechnest du wie beim Umrechnen von Größen: Bei mal 10 rückt das Komma eine Stelle nach rechts. Das brauchst du beim Umrechnen, beim Maßstab und beim Malnehmen.",
  teile:[["Mal 10, 100, 1000",["Das Komma rückt um so viele Stellen nach rechts, wie die Zahl Nullen hat. So steht es bei Markus im Buch (S. 29, Aufgabe 8).","2,5 · 10 = 25: eine Null, eine Stelle.","0,003 · 1000 = 3: drei Nullen, drei Stellen.","Fehlt hinten eine Stelle, hängst du eine 0 an: 2,8 · 100 = 2,80 · 100 = 280."]],
   ["Geteilt durch 10, 100, 1000",["Das Komma rückt nach links, so viele Stellen, wie die Zahl Nullen hat.","299 : 100 = 2,99.","Fehlen vorn Stellen, füllst du mit 0 auf: 3 : 100 = 0,03."]],
   ["Malnehmen mit Zerlegen",["Zerleg die Kommazahl in die ganze Zahl und den Rest: 2,8 = 2 + 0,8.","Nimm beide Teile einzeln mal und zähl zusammen: 40 · 2,8 = 40 · 2 + 40 · 0,8 = 80 + 32 = 112.","40 · 0,8 rechnest du als 4 · 8 = 32."]]],
  tab:TAB(["Aufgabe","Komma rückt","Ergebnis"],[["2,58 · 10","1 Stelle nach rechts","25,8"],["0,03 · 100","2 Stellen nach rechts","3"],["0,0005 · 10 000","4 Stellen nach rechts","5"],["299 : 100","2 Stellen nach links","2,99"],["3 : 100","2 Stellen nach links","0,03"]]),
  bsp:[["0,003 · 1000","1000 hat drei Nullen: das Komma rückt drei Stellen nach rechts. 0,003 → 3"],["3 : 100","100 hat zwei Nullen: zwei Stellen nach links. 3 = 3,0 → 0,03"],["40 · 2,8","40 · 2 + 40 · 0,8 = 80 + 32 = 112"]],
  achtung:["Mal macht die Zahl größer, geteilt macht sie kleiner. Prüf am Ende: Passt das?","3 : 100 ist nicht 0,3. Zwei Nullen, zwei Stellen: 0,03.","40 · 0,8 ist nicht 320. Rechne 4 · 8 = 32."],maus:"So viele Nullen, so viele Stellen. Mal nach rechts, geteilt nach links."},
 ebenen:[
  ZIEHEN.rk_zieh,
  ZIEHEN.rk_zeichen,
  E("rk_tippen","Ausrechnen","2,58 · 10 = ? und 299 : 100 = ?",()=>kommaAufgabe(3),
   p=>{ const y=kErg(p), n=KOMMA_AN(p.F);
     return {f:`${fz(p.x)} ${p.mal?"·":":"} ${fz(p.F)} = {0}`,a:[y],hilfe:`${fz(p.F)} hat ${NULLEN[n-1]}: das Komma rückt ${stellen(n)} nach ${p.mal?"rechts":"links"}. Fehlende Stellen füllst du mit 0.`,weg:kommaWeg(p),
       tipp:(i,v)=>gleich(v,p.mal?p.x/p.F:p.x*p.F)?(p.mal?"Mal heißt: Die Zahl wird größer, das Komma rückt nach rechts.":"Geteilt heißt: Die Zahl wird kleiner, das Komma rückt nach links.")
         :gleich(v,y*10)||gleich(v,y/10)?`${fz(p.F)} hat ${NULLEN[n-1]}: Das Komma rückt genau ${stellen(n)}.`:null}; }),
  Object.assign(ZIEHEN.rk_zerlegen,{kette:true}), // gleich offen, laeuft neben dem Komma-Verschieben
  E("rk_zerltipp","Malnehmen mit Komma","40 · 2,8 = ?",zerlZieh,
   p=>{ const {a,g,d}=p, x=zerl(p);
     return {f:`${a} · ${fz(x.b)} = {0}`,a:[x.s],hilfe:`Zerleg ${fz(x.b)} in ${g} + ${x.z}: ${x.zer}. ${x.klein}`,weg:x.weg,
       tipp:(i,v)=>gleich(v,x.t1)?`Das ist nur ${a} · ${g}. Dazu kommt noch ${a} · ${x.z}.`:gleich(v,x.t2)?`Das ist nur ${a} · ${x.z}. Dazu kommt noch ${a} · ${g} = ${fz(x.t1)}.`
         :gleich(v,x.t1+a*d)?`${a} · ${x.z} ist nicht ${fz(a*d)}. ${x.klein}`:`Zerleg ${fz(x.b)} = ${g} + ${x.z} und rechne beide Teile einzeln: ${x.zer}.`}; })]},

{id:"m_mass",kap:"1.8",icon:"🗺️",name:"Maßstab",was:"1 : 50 auf Plänen und Karten",
 erkl:{s:"30–33",wozu:"Auf Karten und Plänen ist alles kleiner gezeichnet. Der Maßstab sagt, wievielmal.",
  teile:[["Was heißt 1 : 50?",["Links steht die Länge im Bild, rechts die Länge in Wirklichkeit, beide in cm.","1 : 50 heißt: 1 cm auf dem Plan sind 50 cm in Wirklichkeit.","1 : 500 ist eine 500-fache Verkleinerung. 2 : 1 ist eine Vergrößerung auf das Doppelte."]],
   ["Längen in der Wirklichkeit berechnen (Beispiel 1, S. 30)",["1 cm im Stadtplan entsprechen 10 000 cm in der Wirklichkeit. Die Länge in der Wirklichkeit ist also 10 000-mal so groß. Multipliziere daher mit 10 000.","Dann in Meter: Wie oft stecken 100 cm drin? 40 000 cm = 400 · 100 cm = 400 m."]],
   ["Längen im Bild berechnen (Beispiel 2, S. 31)",["1 cm im Bild entsprechen 200 cm in der Wirklichkeit. Die Länge im Bild ist also 200-mal so klein. Dividiere daher durch 200.","Wandle die wirklichen Längen vor dem Dividieren in cm um: 40 m = 4000 cm."]]],
  tab:TAB(["Maßstab","1 cm auf dem Plan sind"],[["1 : 50","50 cm"],["1 : 100","100 cm = 1 m"],["1 : 1000","1000 cm = 10 m"],["1 : 10 000","10 000 cm = 100 m"],["1 : 100 000","100 000 cm = 1 km"]]),
  bsp:[["Beispiel 1 (S. 30): Vom Rathaus zum Staatstheater sind es auf der Karte 4 cm.","Maßstab: 1 : 10 000<br>Länge im Bild: 4 cm<br>Länge in Wirklichkeit: 4 cm · 10 000 = 40 000 cm = 400 · 100 cm = 400 m"],
   ["Beispiel 2 (S. 31): Ein Handballfeld ist 40 m lang, gezeichnet im Maßstab 1 : 200.","Maßstab: 1 : 200<br>Länge in Wirklichkeit: 40 m = 4000 cm<br>Länge im Bild: 4000 cm : 200 = 20 cm"],
   ["Ein Zimmer ist im Plan 1 : 50 genau 8 cm lang.","Länge in Wirklichkeit: 8 cm · 50 = 400 cm = 4 · 100 cm = 4 m"]],
  achtung:["Tim rechnet beim Modellauto 1 : 5 so: 40 cm : 5 = 8 cm. Falsch! In Wirklichkeit ist das Auto größer, also mal 5: 200 cm = 2 m (Stolperstelle S. 33).","Vor dem Dividieren erst in cm umwandeln (Beispiel 2)."],maus:"Bild nach Wirklichkeit: mal. Wirklichkeit nach Bild: erst in cm, dann geteilt."},
 ebenen:[
  ZIEHEN.ma_tabelle,
  ZIEHEN.ma_weg,
  E("ma_worte","Maßstab verstehen","1 cm auf dem Plan sind …",()=>{ const k=R.int(0,3); return k===0?{k,m:R.pick([20,50,100,200,500,1000])}:k===1?{k,m:R.pick([100,200,500,1000,2000,5000,10000,25000,50000])}:k===2?{k,m:R.pick([100000,200000,250000,500000,1000000])}:{k,i:R.int(0,7)}; },
   ({k,m,i})=>{ if(k===3){ const [a,b]=[[1,50],[1,3],[2,1],[1,500],[500,1],[10,1],[1,25000],[3,1]][i], v=a<b;
       return wahl(`Ist der Maßstab <b>${a} : ${fz(b)}</b> eine Vergrößerung oder eine Verkleinerung?`,v?"Verkleinerung":"Vergrößerung",["Vergrößerung","Verkleinerung"],{t:"Links steht das Bild, rechts die Wirklichkeit.",weg:v?`1 cm im Bild sind ${fz(b)} cm in Wirklichkeit. Das Bild ist kleiner.`:`${a} cm im Bild sind 1 cm in Wirklichkeit. Das Bild ist größer.`}); }
     const fr=`Maßstab <b>1 : ${fz(m)}</b>. 1 cm auf dem Plan sind in Wirklichkeit …`;
     if(k===0) return {frage:fr,f:"{0} cm",a:[m],weg:`1 cm · ${fz(m)} = ${fz(m)} cm`,tipp:(j,v)=>v===m/100?"Hier ist nach Zentimetern gefragt.":null};
     if(k===1) return {frage:fr,f:"{0} m",a:[m/100],hilfe:`1 cm auf dem Plan sind ${fz(m)} cm. 100 cm = 1 m.`,weg:`${fz(m)} cm = ${fz(m/100)} m`,tipp:(j,v)=>v===m?"Das sind Zentimeter. In Meter: geteilt durch 100.":gleich(v,m/10)||gleich(v,m/1000)?"1 m sind 100 cm: geteilt durch 100.":null};
     return {frage:fr,f:"{0} km",a:[m/100000],hilfe:`${fz(m)} cm = ${fz(m/100)} m. 1000 m = 1 km.`,weg:`${fz(m)} cm = ${fz(m/100)} m = ${fz(m/100000)} km`,tipp:(j,v)=>v===m/100?"Das sind Meter. In Kilometer: geteilt durch 1000.":v===m?"Das sind Zentimeter. 100 000 cm sind 1 km.":null}; }),
  E("ma_echt","Plan nach Wirklichkeit","mal die Maßstabszahl",()=>({m:R.pick([5,10,20,25,50,100,200,500,1000]),b:R.int(2,15),c:R.int(0,4)}),
   ({m,b,c})=>({frage:`Maßstab <b>1 : ${fz(m)}</b>. ${ctxVon(m,c,b*m/100)} ist ${m<50?"als Modell":"auf dem Plan"} ${b} cm lang. Wie lang ist es in Wirklichkeit?`,f:"{0} cm",a:[b*m],weg:`Länge in Wirklichkeit: ${b} cm · ${fz(m)} = ${fz(b*m)} cm`,
     tipp:(i,v)=>gleich(v,b/m)||v===Math.round(b/m)?`In Wirklichkeit ist alles größer: mal ${fz(m)}, nicht geteilt.`:v===b+m?"Nicht plus, sondern mal.":null})),
  E("ma_echtm","Plan nach Wirklichkeit in m","Rechenweg wie Beispiel 1",()=>{ const m=R.pick([50,50,100,200,500,1000]); let b=m===1000?R.int(2,12):R.int(2,20); if(m===50&&b%2) b++; return {m,b,c:R.int(0,4)}; },
   ({m,b,c})=>{ const w=b*m, mm=rund(w/100);
     return {frage:`Maßstab <b>1 : ${fz(m)}</b>. ${ctxVon(m,c,b*m/100)} ist auf dem Plan ${b} cm lang. Wie lang ist es in Wirklichkeit?`,f:`${b} cm · ${fz(m)} = {0} cm = {1} · 100 cm = {2} m`,a:[w,mm,mm],
       hilfe:`1 cm im Bild sind ${fz(m)} cm in Wirklichkeit: multipliziere mit ${fz(m)}. Dann: Wie oft stecken 100 cm drin?`,weg:`Länge in Wirklichkeit: ${b} cm · ${fz(m)} = ${fz(w)} cm = ${fz(mm)} · 100 cm = ${fz(mm)} m`,
       tipp:(i,v)=>i===0&&gleich(v,b/m)?"In Wirklichkeit ist es größer: mal, nicht geteilt.":i>0&&gleich(v,w)?"Wie oft stecken 100 cm drin? Die Zahl wird kleiner.":i>0&&(gleich(v,w/10)||gleich(v,w/1000))?"1 m sind 100 cm, nicht 10 und nicht 1000.":null}; }),
  E("ma_plan","Wirklichkeit nach Plan","erst in cm, dann geteilt",()=>{ const m=R.pick([50,100,200,500,1000]); return {m,b:m===1000?R.int(2,12):R.int(2,20),c:R.int(0,4)}; },
   ({m,b,c})=>{ const r=b*m/100;
     return {frage:`${ctxVon(m,c,r)} ist in Wirklichkeit ${fz(r)} m lang. Maßstab <b>1 : ${fz(m)}</b>. Wie lang wird es auf dem Plan?`,f:"{0} cm",a:[b],hilfe:`Erst in cm umrechnen: ${fz(r)} m = ${fz(r*100)} cm.`,weg:`Länge in Wirklichkeit: ${fz(r)} m = ${fz(r*100)} cm. Länge im Bild: ${fz(r*100)} cm : ${fz(m)} = ${b} cm.`,
       tipp:(i,v)=>gleich(v,r*m)||gleich(v,r*100*m)?"Auf dem Plan wird alles kleiner: geteilt, nicht mal.":gleich(v,r/m)?"Erst die Meter in Zentimeter umrechnen, dann teilen.":null}; }),
  E("ma_bestimmen","Maßstab bestimmen","wievielmal kleiner oder größer?",()=>R.ja(.65)?{k:R.pick([10,20,25,40,45,50,87,100,160]),m:R.int(5,30),v:0}:{k:R.pick([2,3,4,5,10,20]),m:R.int(2,12),v:1},
   ({k,m,v})=>{ if(v){ const b=m*k; return {frage:`Ein Käfer ist ${m} mm lang. Im Bild ist er ${fz(b/10)} cm lang. Welcher Maßstab ist das?`,f:"{0} : 1",a:[k],l:`${k} : 1`,hilfe:`${fz(b/10)} cm = ${b} mm. Wie oft passen ${m} mm hinein?`,weg:`${b} mm : ${m} mm = ${k}, also ${k} : 1 (Vergrößerung).`}; }
     const r=m*k; return {frage:`Ein Modell ist ${m} cm lang. Das Original ist ${fz(r/100)} m lang. Welchen Maßstab hat das Modell?`,f:"1 : {0}",a:[k],l:`1 : ${k}`,hilfe:`${fz(r/100)} m = ${fz(r)} cm. Wie oft passen ${m} cm hinein?`,weg:`${fz(r)} cm : ${m} cm = ${k}, also 1 : ${k}.`,
       tipp:(i,v)=>gleich(v,r/100/m)?"Erst die Meter in Zentimeter umrechnen.":null}; }),
  E("ma_karte","Auf der Landkarte","km und Wegweiser",()=>R.ja(.6)?{m:R.pick([10000,20000,25000,50000,100000,200000,250000,500000]),b:R.int(2,15),r:0}:{m:R.pick([10000,20000,25000,50000]),b:R.int(2,12),r:1},
   ({m,b,r})=>{ if(r){ const e=b*m/100; return {frage:`Ein Wegweiser zeigt: „Museum ${fz(e)} m“. Wie viele cm sind das auf dem Stadtplan im Maßstab <b>1 : ${fz(m)}</b>?`,f:"{0} cm",a:[b],hilfe:`${fz(e)} m = ${fz(e*100)} cm. Dann geteilt durch ${fz(m)}.`,weg:`${fz(e*100)} cm : ${fz(m)} = ${b} cm`,tipp:(i,v)=>gleich(v,e/m)?"Erst die Meter in Zentimeter umrechnen.":null}; }
     const a=b*m/100000; return {frage:`Landkarte im Maßstab <b>1 : ${fz(m)}</b>. Zwei Orte liegen auf der Karte ${b} cm auseinander. Wie weit ist das in Wirklichkeit?`,f:"{0} km",a:[a],hilfe:`${b} cm · ${fz(m)} = ${fz(b*m)} cm. 100 000 cm sind 1 km.`,weg:`${b} cm · ${fz(m)} = ${fz(b*m)} cm = ${fz(b*m/100)} · 100 cm = ${fz(b*m/100)} m = ${fz(a)} km`,
       tipp:(i,v)=>gleich(v,b*m/100)?"Das sind Meter. In Kilometer: geteilt durch 1000.":v===b*m?"Das sind Zentimeter. 100 000 cm sind 1 km.":null}; })]}
];
const EB={}; BEREICHE.forEach(b=>b.ebenen.forEach(e=>{ e.b=b; EB[e.id]=e; }));

// ---------- Mathebuch: Inhaltsverzeichnis (S. 3-4) ----------
const KAPITEL={1:"Natürliche Zahlen und Größen",2:"Grundbegriffe der Geometrie",3:"Rechnen mit natürlichen Zahlen",4:"Flächeninhalt und Umfang",5:"Volumen und Oberflächeninhalt",6:"Brüche und Dezimalzahlen"};
const ABS=[["1.0","Dein Fundament",6],["1.1","Daten erheben und auswerten",8],["1.2","Natürliche Zahlen – große Zahlen",13],["1.2r","Streifzug: Römische Zahlen",16],["1.3","Zahlenstrahl",18],["1.4","Runden",20],["1.5","Größen angeben und schätzen",22],["1.6","Größen umrechnen",24],["1.7","Größen in Kommaschreibweise",28],["1.8","Maßstab",30],["1.9","Vermischte Aufgaben",34],["1.P","Prüfe dein neues Fundament",38],
 ["2.0","Dein Fundament",42],["2.1","Senkrecht und parallel zueinander",44],["2.2","Vierecke",50],["2.3","Achsensymmetrie",54],["2.4","Koordinaten",58],["2.5","Grundkörper",62],["2.6","Körpernetze",66],["2.7","Schrägbild eines Quaders",70],["2.8","Vermischte Aufgaben",76],["2.P","Prüfe dein neues Fundament",78],
 ["3.0","Dein Fundament",82],["3.1","Addieren und Subtrahieren",84],["3.2","Multiplizieren und Dividieren",87],["3.3","Rechnen mit allen Grundrechenarten",90],["3.4","Rechengesetze",95],["3.5","Distributivgesetz",98],["3.6","Überschlagsrechnung",100],["3.7","Schriftliches Addieren und Subtrahieren",102],["3.8","Schriftliches Multiplizieren und Dividieren",105],["3.9","Potenzieren",111],["3.10","Teiler, Vielfache und Teilbarkeitsregeln",113],["3.11","Primzahlen",117],["3.12","Zahlenfolgen",120],["3.13","Vermischte Aufgaben",122],["3.P","Prüfe dein neues Fundament",124],
 ["4.0","Dein Fundament",128],["4.1","Flächen vergleichen",130],["4.2","Flächeninhalt eines Rechtecks",134],["4.3","Flächeneinheiten",137],["4.4","Zusammengesetzte Figuren",142],["4.5","Umfang",144],["4.6","Vermischte Aufgaben",149],["4.P","Prüfe dein neues Fundament",152],
 ["5.0","Dein Fundament",156],["5.1","Körper vergleichen",158],["5.2","Volumen eines Quaders",161],["5.3","Volumeneinheiten",164],["5.4","Zusammengesetzte Körper",168],["5.5","Oberflächeninhalt eines Quaders",171],["5.6","Vermischte Aufgaben",174],["5.P","Prüfe dein neues Fundament",176],
 ["6.0","Dein Fundament",180],["6.1","Brüche",182],["6.2","Brüche erweitern und kürzen",186],["6.3","Brüche vergleichen",189],["6.4","Brüche als Quotienten",193],["6.5","Brüche am Zahlenstrahl",197],["6.6","Brüche und Größen",199],["6.7","Dezimalzahlen",203],["6.8","Dezimalzahlen vergleichen",207],["6.9","Periodische Dezimalzahlen",210],["6.10","Prozentschreibweise",213],["6.11","Vermischte Aufgaben",216],["6.P","Prüfe dein neues Fundament",218]
].map(([id,titel,seite])=>{ const k=+id.split(".")[0], nr=/^\d+\.\d+$/.test(id)&&!id.endsWith(".0"); return {id,titel,seite,k,name:nr?`${id} ${titel}`:/r$/.test(id)?titel:`Kapitel ${k}: ${titel}`}; });
// Stand 26.11.2026 (Johannes): die Klasse ist bei 1.8 Massstab
const START="1.8";
const RE=ABS.map(a=>a.id), aidx=id=>RE.indexOf(id), abs=id=>ABS[aidx(id)];
const posVon=m=>aidx(m?.buch?.pos)>=0?m.buch.pos:START;
const erreichtVon=(m,id)=>aidx(id)<=aidx(posVon(m));
// Kapitelanfangsseiten (5, 41, 81, 127, 155, 179) gehoeren zum neuen Kapitel
function ausSeite(s){ if(!(s>=1&&s<=248)) return null; const k={41:"2.0",81:"3.0",127:"4.0",155:"5.0",179:"6.0"}[s]; if(k) return abs(k); let t=ABS[0]; for(const a of ABS) if(a.seite<=s) t=a; return t; }
const mitAufgaben=new Set(BEREICHE.map(b=>b.kap));
const letzteSeite=k=>Math.max(...ABS.filter(a=>a.k===k).map(a=>a.seite))+2;

// ---------- Stand je Kind (D.mathe) ----------
// buch {pos,i,frage,seit}, fokus (Bereich), erklaert/spaeter je Bereich, gespielt/best/geschafft je Ebene,
// weiter je Runde, fehler {schluessel: {e,p,rest,t}}, neuFrei, hTag (Heute geschafft am)
const M=()=>{ const d=KERN.D; if(!d.mathe||typeof d.mathe!=="object") d.mathe={}; return d.mathe; };
const halte=()=>KERN.speichere("mathe",M());
// Schwerpunkte als Liste (Eltern: Haekchen). Jonathan (Kind 1) nach der Klassenarbeit 1.1: Rechnen mit Komma, Laengen, Runden
// (Johannes, 26.11.2026). Der alte Einzelwert (Text) liest sich als Liste; "m_laenge" war der alte Vorschlag und wird zum neuen.
const FOKUS1=["m_rkomma","m_laenge","m_runden"];
const fokusVon=(m,n)=>{ const f=m.fokus; if(Array.isArray(f)) return f.filter(id=>BEREICHE.some(b=>b.id===id)); if(n===1&&(f===undefined||f==="m_laenge")) return FOKUS1; return f?[f]:[]; };
// Eine Ebene mit kette:true beginnt eine eigene Kette und ist von Anfang an offen (Zerlegen, Johannes 26.11.2026: "gleich offen").
const ezu=(b,i,m)=>i>0&&!b.ebenen[i].kette&&!m.geschafft?.[b.ebenen[i-1].id]&&!m.gespielt?.[b.ebenen[i].id];
const ketten=b=>b.ebenen.reduce((k,e,i)=>(i&&!e.kette?k[k.length-1].push(e):k.push([e]),k),[]);
const offeneEbenen=(b,m)=>b.ebenen.filter((e,i)=>!ezu(b,i,m));
const fertigB=(b,m)=>b.ebenen.every(e=>m.geschafft?.[e.id]);
const zahlB=(b,m)=>[b.ebenen.filter(e=>m.geschafft?.[e.id]).length,b.ebenen.length];
const offenB=m=>BEREICHE.filter(b=>erreichtVon(m,b.kap));
const fKey=x=>x.e+"|"+JSON.stringify(x.p);
const offeneFehler=(m,bid)=>Object.values(m.fehler||{}).filter(x=>x.rest>0&&EB[x.e]&&(!bid||EB[x.e].b.id===bid)&&erreichtVon(m,EB[x.e].b.kap)).sort((a,b)=>b.t-a.t);
const gewicht=it=>it.typ==="ziehen"?it.zeilen.reduce((n,z)=>n+z.as.length,0):1;
function mach(x){ const e=EB[x.e], it={typ:"eingabe",art:"zahl",...e.mach(x.p)}; it.e=e;
  // Zieh-Zeilen vereinheitlichen: s = HTML mit {0}, {1} ... fuer die Luecken, as = Antworten in dieser Reihenfolge
  if(it.typ==="ziehen") it.zeilen=it.zeilen.map(z=>z.as?z:{...z,as:[z.a],s:`${z.vorHtml||h(z.vor)} {0}${z.nach?(/^[.,!?]/.test(z.nach)?"":" ")+h(z.nach):""}`});
  return it; }
function loesung(it){
  if(it.l) return it.l;
  if(it.typ==="wahl") return it.f?it.f.replace("___",it.a):ohneTags(it.a);
  if(it.typ==="ordnen") return [...it.o].sort((a,b)=>a.w-b.w).map(o=>o.t).join(" < ");
  if(it.typ==="ziehen") return it.zeilen.map(z=>{ let k=0; return ohneTags(z.s.replace(/\{\d\}/g,()=>z.as[k++])); }).join(" · ");
  return it.f.replace(/\{(\d)\}/g,(_,k)=>it.art==="text"?it.a[k]:fz(it.a[k]));
}

// ---------- Startfrage: Mathe heute? Wo seid ihr im Buch? ----------
function mStart(){ const m=M(); if(schultag()&&m.buch?.frage!==heute()) return frageMathe(); mMenue(); }
function gefragt(){ const m=M(); m.buch={...(m.buch||{}),pos:posVon(m),i:aidx(posVon(m)),frage:heute()}; halte(); }
function frageMathe(){
  ort="@mfrage"; ruhe(`Hallo ${kname(KERN.nr)}!`,"Hattest du heute Mathe in der Schule?"); kopf();
  const d=blatt(""); antworten(d,[["Ja","haupt",frageBuch],["Nein","neben",()=>{ gefragt(); mMenue(); }],["Weiß ich nicht","neben",()=>{ gefragt(); mMenue(); }]]);
}
function frageBuch(){
  ort="@mfrage"; const m=M(), i=aidx(posVon(m)), n=ABS[i+1], weiter=ABS.slice(i+2,i+8);
  ruhe("Habt ihr im Mathebuch weitergemacht?",`Zuletzt warst du bei ${abs(posVon(m)).name} (Seite ${abs(posVon(m)).seite}).`); kopf();
  const d=blatt("");
  const f=antworten(d,[...(n?[[`Ja, weiter mit ${h(n.name)}`,"haupt",()=>weiterBis(n.id),`Diese Überschrift steht im Buch auf Seite ${n.seite}.`]]:[]),["Nein, wir sind noch beim alten Thema","neben",()=>{ gefragt(); mMenue(); }]]);
  if(weiter.length){ const det=document.createElement("details"); det.innerHTML="<summary>Noch weiter, und zwar bis …</summary>"; f.append(det); antworten(det,weiter.map(a=>[h(a.name),"neben",()=>weiterBis(a.id),`Seite ${a.seite}`])); }
  const form=document.createElement("form"); form.innerHTML=`<label>Oder die Seite im Mathebuch: <input type="number" inputmode="numeric" min="1" max="248" id="mseite"></label><button class="haupt">OK</button><p class="meld"></p>`; f.append(form);
  form.onsubmit=e=>{ e.preventDefault(); const s=parseInt(form.querySelector("#mseite").value), a=ausSeite(s); if(!a) return form.querySelector(".meld").textContent="Das Buch hat die Seiten 1 bis 248."; weiterBis(a.id); };
  antworten(f,[["Weiß ich nicht","neben",()=>{ gefragt(); mMenue(); }]]);
}
function setzen(id){
  const m=M(), von=aidx(posVon(m)), bis=aidx(id); if(bis<0) return {neu:[]};
  if(bis<=von){ gefragt(); return {neu:[]}; }
  m.buch={...(m.buch||{}),pos:id,i:bis,frage:heute(),seit:Date.now()};
  const neu=RE.slice(von+1,bis+1); m.neuFrei=[...new Set([...(m.neuFrei||[]),...BEREICHE.filter(b=>neu.includes(b.kap)).map(b=>b.id)])];
  halte(); return {neu};
}
function weiterBis(id){
  const r=setzen(id); if(!r.neu.length) return mMenue();
  const frei=BEREICHE.filter(b=>r.neu.includes(b.kap)), ohne=[...new Set(r.neu.map(x=>abs(x).k).filter(k=>k>1))], misch=r.neu.some(x=>/\.(9|P)$/.test(x));
  ort="@mfrage"; ruhe("Super, dann geht's weiter!",`Neu dran: ${r.neu.map(x=>abs(x).name).join(", ")}.`); kopf();
  const d=blatt(`${frei.length?`<section class="neufrei"><h3>🔓 Neu freigeschaltet</h3><ul>${frei.map(b=>`<li>${b.icon} <b>${h(b.name)}</b>: ${h(b.was)}</li>`).join("")}</ul><p>Vor dem ersten Spiel kommt eine Erklärung aus dem Buch.</p></section>`:""}
    ${misch&&!ohne.length?`<section><h3>🏆 Klassenarbeit üben</h3><p>Für die vermischten Aufgaben gibt es „Klassenarbeit üben“: Aufgaben aus dem ganzen Kapitel, ohne Tipps.</p></section>`:""}
    ${ohne.length?`<section><h3>📷 Kapitel ${ohne.join(", ")}</h3><p>Dafür hat der Trainer noch keine Aufgaben. Bis dahin übst du Kapitel 1 weiter. Sag deinen Eltern Bescheid, dass die neuen Buchseiten fotografiert werden müssen.</p></section>`:""}`);
  antworten(d,[["Los geht's","haupt",mMenue]]);
}

// ---------- Menues ----------
// fo: die Schwerpunkte, die noch nicht fertig sind (Reihenfolge wie bei den Eltern), th: das aktuelle Thema im Buch
function heuteTeile(m){
  const fo=fokusVon(m,KERN.nr).map(id=>BEREICHE.find(b=>b.id===id)).filter(b=>b&&erreichtVon(m,b.kap)&&!fertigB(b,m)), pos=posVon(m), k=abs(pos).k;
  let th=BEREICHE.filter(b=>b.kap===pos); if(!th.length) th=BEREICHE.filter(b=>abs(b.kap).k===k&&erreichtVon(m,b.kap)); if(!th.length) th=offenB(m);
  return {fo,th:th.filter(b=>!fo.includes(b))};
}
function heuteText(m){ const {fo,th}=heuteTeile(m); return [...fo.map(b=>b.name),...th.slice(0,3).map(b=>b.name)].join(", ")+(th.length>3?" …":""); }
function mMenue(){
  ort="@mathe"; const m=M(); ruhe("🧮 Mathe",`Im Buch: ${abs(posVon(m)).name}.`); kopf();
  const off=offenB(m), zu=BEREICHE.filter(b=>!erreichtVon(m,b.kap)), neu=new Set(m.neuFrei||[]), z=off.map(b=>zahlB(b,m));
  const g=z.reduce((a,x)=>a+x[0],0), v=z.reduce((a,x)=>a+x[1],0), fe=offeneFehler(m).length, p=m.weiter?.probe, hw=m.weiter?.heute, k=abs(posVon(m)).k;
  const fl=heuteTeile(m).fo, reihe=[...fl,...off.filter(b=>!fl.includes(b))];
  karten([{i:"⭐",t:"Heute üben",u:"Für heute: "+h(heuteText(m)),st:hw?`weiter: ${hw.nr} von ${hw.liste.length}`:m.hTag===heute()?"heute fertig ✓":"heute noch offen",f:heuteStart},
    ...reihe.map(b=>{ const x=zahlB(b,m); return {i:b.icon,t:h(b.name)+(neu.has(b.id)?'<span class="neu">NEU</span>':fl.includes(b)?'<span class="neu start">START</span>':""),u:h(b.was),p:x,st:`${x[0]} von ${x[1]}`,f:()=>mBereich(b.id)}; }),
    ...zu.map(b=>({i:"🔒",t:h(b.name),u:`geht auf mit ${h(abs(b.kap).name)}`,zu:true,st:"noch nicht dran"})),
    ...(k>1?[{i:"📷",t:`Kapitel ${k}: ${KAPITEL[k]}`,u:"Dafür fehlen im Trainer noch die Buchseiten.",zu:true,st:"kommt bald"}]:[]),
    {i:"🎯",t:"Meine Fehler",u:"nur üben, was falsch war",st:fe?`${fe} offen`:"nichts offen",zu:!fe,f:()=>starteFehler(null)},
    {i:"🏆",t:"Klassenarbeit üben",u:"20 Aufgaben aus allem, was dran war, ohne Tipps",st:p?`weiter: ${p.nr} von ${p.liste.length}`:m.gespielt?.probe?`Bestes: ${m.best.probe} von ${m.bestVon?.probe||20}`:"",f:starteProbe}]);
  $("spiele").insertAdjacentHTML("afterbegin",`<div class="gesamt"><span>Du hast <b>${g} von ${v}</b> Mathe-Ebenen geschafft.</span>${balken(g,v)}</div>`);
  fussleiste([["📖 Im Mathebuch weiter?",frageBuch],["Fach wechseln",fachWahl],...(KERN.geraet.nur?[]:[["Kind wechseln",startseite]]),["🔒 Eltern",elternTor]]);
}
function standE(e,m){ const w=m.weiter?.[e.id], g=m.gespielt?.[e.id]; if(w) return `weiter: ${w.nr} von ${w.liste.length}`; return g?`Bestes: ${m.best[e.id]} von ${m.bestVon?.[e.id]||e.n}${m.geschafft?.[e.id]?" ✓":""}`:""; }
function mBereich(id){
  const b=BEREICHE.find(x=>x.id===id), m=M(); if(!b) return mMenue();
  if(m.neuFrei?.includes(id)){ m.neuFrei=m.neuFrei.filter(x=>x!==id); halte(); }
  if(erklFaellig(b,m)){ gezeigt.add(id); return erklaerung(b,true); }
  ort="@mb:"+id; ruhe(`${b.icon} ${b.name}`,`Mathebuch Seite ${b.erkl.s}. Die nächste Ebene geht auf, wenn du drei Viertel auf Anhieb richtig hast.`); kopf();
  const fe=offeneFehler(m,id).length;
  karten([{t:"📖 Erklärung",u:`aus dem Buch, Seite ${b.erkl.s}`,st:m.erklaert?.[id]?"gelesen ✓":"noch nicht gelesen",f:()=>erklaerung(b,false)},
    ...b.ebenen.map((e,i)=>{ const zu=ezu(b,i,m); return {t:`${i+1}. ${h(e.name)}`,u:e.was,zu,st:zu?"noch gesperrt":standE(e,m),f:()=>starteEbene(e)}; }),
    {t:"🎯 Meine Fehler",u:"nur üben, was falsch war",st:fe?`${fe} offen`:"nichts offen",zu:!fe,f:()=>starteFehler(id)}]);
}
function mZurueck(){ const o=ort||""; if(o.startsWith("@mr:")||o.startsWith("@me:")) return mBereich(o.slice(4)); if(o==="@mathe") return fachWahl(); mMenue(); }

// ---------- Erklaerung aus dem Buch: vor dem ersten Oeffnen, "Spaeter" schiebt auf morgen ----------
const gezeigt=new Set();
const erklFaellig=(b,m)=>!m.erklaert?.[b.id]&&m.spaeter?.[b.id]!==heute()&&!gezeigt.has(b.id);
function erklaerung(b,auto,weiter){
  weiter=weiter||(()=>mBereich(b.id)); const e=b.erkl;
  ort="@me:"+b.id; ruhe(`${b.icon} ${b.name}`,`Erklärung aus dem Mathebuch, Seite ${e.s}.`); kopf();
  const d=document.createElement("div"); d.className="einstellung erkl";
  d.innerHTML=`<section><h3>Wofür?</h3><p>${e.wozu}</p></section>`
    +e.teile.map(([t,l])=>`<section><h3>${t}</h3><ul>${l.map(x=>`<li>${x}</li>`).join("")}</ul></section>`).join("")
    +(e.tab?`<section class="tabs">${e.tab}</section>`:"")
    +`<section><h3>So rechnest du</h3><ul class="mbsp">${e.bsp.map(([a,l])=>`<li><b>${a}</b><span>${l}</span></li>`).join("")}</ul></section>`
    +(e.achtung?.length?`<section class="achtung"><h3>Achtung, Stolperstelle!</h3><ul>${e.achtung.map(x=>`<li>${x}</li>`).join("")}</ul></section>`:"")
    +(e.maus?`<p class="maus">🐭 ${e.maus}</p>`:"")+`<div class="knoepfe"></div>`;
  const k=d.querySelector(".knoepfe"), knopf=(t,c,f)=>{ const x=document.createElement("button"); x.type="button"; x.className=c; x.textContent=t; x.onclick=f; k.append(x); };
  knopf(auto?"Verstanden, los geht's":"Verstanden","haupt",()=>{ const m=M(); m.erklaert={...(m.erklaert||{}),[b.id]:Date.now()}; halte(); weiter(); });
  if(auto) knopf("Später","neben",()=>{ const m=M(); m.spaeter={...(m.spaeter||{}),[b.id]:heute()}; halte(); weiter(); });
  $("spiele").className=""; $("spiele").replaceChildren(d); scrollTo(0,0);
}
function merkzettel(){ const b=A?.it?.e?.b; if(!b) return; const e=b.erkl;
  $("regeltitel").textContent=b.name;
  $("regeln").innerHTML=e.teile.map(([t,l])=>`<h3>${t}</h3><ul>${l.map(x=>`<li>${x}</li>`).join("")}</ul>`).join("")+(e.tab||"")+(e.maus?`<p>🐭 ${e.maus}</p>`:"");
  $("tabelle").showModal(); }

// ---------- Runden ----------
let X=null, A=null; // X: laufende Runde, A: aktuelle Aufgabe
function plane(e,n,schon){ const l=[], s=new Set(schon||[]);
  for(let k=0;k<n;k++){ let p; for(let v=0;v<40;v++){ p=e.zieh(); if(!s.has(e.id+JSON.stringify(p))) break; } s.add(e.id+JSON.stringify(p)); l.push({e:e.id,p}); }
  return l; }
function starteEbene(e){ ort="@mr:"+e.b.id; runde({art:"ebene",key:e.id,titel:e.name,e},()=>plane(e,e.n)); }
// Heute: offene Fehler zuerst, dann die Schwerpunkte (6 Punkte, bei mehreren 9), Rest aus dem aktuellen Thema, mindestens 3 Punkte.
// Gezaehlt wird nach Luecken: eine Zieh-Aufgabe mit vier Luecken zaehlt vier. Die Schwerpunkte kommen reihum dran: die naechste
// Aufgabe bekommt immer der mit den wenigsten Punkten, jeder aus seiner aktuellen Ebene, jede dritte aus einer schon offenen.
// Hat ein Bereich zwei Ketten (Rechnen mit Komma: Verschieben und Zerlegen), laeuft jede unfertige Kette wie ein eigener Schwerpunkt,
// und jede kommt mindestens einmal dran. Fertige Ketten bleiben als Wiederholung (jede dritte Aufgabe) im Spiel.
function heuteListe(){
  const m=M(), {fo,th}=heuteTeile(m), l=[], wx=x=>gewicht(mach(x)), w=()=>l.reduce((s,x)=>s+wx(x),0), schon=()=>l.map(x=>x.e+JSON.stringify(x.p));
  offeneFehler(m).slice(0,2).forEach(x=>l.push({e:x.e,p:x.p}));
  if(fo.length){ const st=fo.flatMap(b=>{ const ks=ketten(b), ganz=k=>k.every(e=>m.geschafft?.[e.id]), rest=ks.filter(ganz).flat();
      return ks.filter(k=>!ganz(k)).map(k=>{ const off=k.filter(e=>!ezu(b,b.ebenen.indexOf(e),m)), jetzt=off.find(e=>!m.geschafft?.[e.id])||off[off.length-1];
        return {jetzt,alt:[...off.filter(e=>e!==jetzt),...rest],p:0,i:0}; }); }), ziel=w()+(st.length>1?9:6);
    for(let n=0;(w()<ziel||st.some(s=>!s.p))&&n<24;n++){ const s=st.reduce((a,b)=>b.p<a.p?b:a), x=plane(s.i++%3===2&&s.alt.length?R.pick(s.alt):s.jetzt,1,schon()); s.p+=x.reduce((q,y)=>q+wx(y),0); l.push(...x); } }
  const pool=th.flatMap(b=>offeneEbenen(b,m)), bis=Math.max(10,w()+3); for(let i=0;w()<bis&&pool.length&&i<20;i++) l.push(...plane(R.pick(pool),1,schon()));
  return mischen(l);
}
function heuteStart(){ const m=M(), {fo,th}=heuteTeile(m), b=[...fo,...th].find(b=>erklFaellig(b,m)); if(b){ gezeigt.add(b.id); return erklaerung(b,true,starteHeute); } starteHeute(); }
function starteHeute(){ ort="@mr"; runde({art:"heute",key:"heute",titel:"Heute üben"},heuteListe); }
function starteFehler(bid){ ort=bid?"@mr:"+bid:"@mr"; runde({art:"fehler",key:null,titel:"Meine Fehler"},()=>offeneFehler(M(),bid).slice(0,10).map(x=>({e:x.e,p:x.p}))); }
function starteProbe(){ ort="@mr"; runde({art:"probe",key:"probe",titel:"Klassenarbeit üben"},()=>{ const m=M(), bs=mischen(offenB(m)), l=[];
  for(let k=0;l.length<20&&k<200;k++){ const b=bs[k%bs.length], oe=offeneEbenen(b,m).filter(e=>!e.ziehen), e=oe.length?R.pick(oe):b.ebenen.find(e=>!e.ziehen); l.push(...plane(e,1,l.map(x=>x.e+JSON.stringify(x.p)))); } return l; }); }
function runde(cfg,plan){
  lauf++; const m=M(), w=cfg.key&&m.weiter?.[cfg.key], ok=!!(w&&w.liste?.length&&w.nr<w.liste.length&&w.liste.every(x=>EB[x.e]));
  X={...cfg,...(ok?JSON.parse(JSON.stringify(w)):{liste:plan(),nr:0,gut:0,schlecht:[],f:0})};
  if(!X.liste.length) return mMenue();
  X.n=X.liste.reduce((s,x)=>s+gewicht(mach(x)),0);
  zeige("karte"); $("schilder").replaceChildren(); $("schilder").hidden=true; $("bTabelle").hidden=false;
  frage(ok&&(w.nr||w.f));
}
function merkeRunde(){ if(!X.key) return; const m=M(); m.weiter={...(m.weiter||{}),[X.key]:{liste:X.liste,nr:X.nr,gut:X.gut,schlecht:X.schlecht,f:X.f}}; halte(); }
function frage(fort){
  const en=X.liste[X.nr], it=mach(en); A={it,en,f:X.f||0,fertig:false};
  $("runde").textContent=`${X.titel} · Aufgabe ${X.nr+1} von ${X.liste.length}`; $("punkte").textContent=`Auf Anhieb: ${X.gut}`;
  baueKarte(it);
  sag(fort?"Hier hast du aufgehört. Mach weiter.":it.typ==="ziehen"?"Zieh die Karten unten in die Lücken. Oder tipp erst eine Karte, dann die Lücke.":it.typ==="wahl"?"Tipp auf die richtige Antwort.":it.typ==="ordnen"?"Tipp der Reihe nach an, das Kleinste zuerst.":"Schreib das Ergebnis hinein. Dann Prüfen oder Enter.","");
}
function feld(it,k){ const t=it.art==="text"; return `<input type="text" inputmode="${t?"text":"decimal"}" autocomplete="off" autocapitalize="${t?"characters":"off"}" autocorrect="off" spellcheck="false" enterkeyhint="done" style="width:${Math.max(2.3,String(t?it.a[k]:fz(it.a[k])).length*.68+1.3).toFixed(2)}em" data-k="${k}" aria-label="Lösung ${k+1}">`; }
function baueKarte(it){
  const el=document.createElement("div"); el.className="aufgabe mathe";
  let x=(it.bild||"")+(it.frage?`<p class="mfrage">${it.frage}</p>`:"");
  if(it.typ==="wahl") x+=(it.f?`<p class="satzgross">${h(it.f).replace("___",'<span class="platz mluecke"></span>')}</p>`:"")+`<div class="mwahl">${it.o.map((o,i)=>`<button type="button" data-i="${i}">${h(o)}</button>`).join("")}</div>`;
  else if(it.typ==="ordnen"){ A.ord=mischen(it.o); A.k=0; x+=`<p class="mreihe" aria-live="polite"></p><div class="mwahl">${A.ord.map((o,i)=>`<button type="button" data-i="${i}">${h(o.t)}</button>`).join("")}</div>`; }
  else if(it.typ==="ziehen"){ A.gaps=it.zeilen.flatMap((z,r)=>z.as.map(a=>({a,r,f:0,ok:false}))); let gi=0;
    const P=()=>{ const i=gi++; return `<span class="platz" data-i="${i}" tabindex="0" role="button" aria-label="Lücke ${i+1}"></span>`; };
    const einfach=!it.satz&&it.zeilen.every(z=>z.vor!==undefined&&z.as.length===1);
    x+=einfach?`<div class="mtab">${it.zeilen.map(z=>`<div class="mzeile"><span class="mvor">${z.vorHtml||h(z.vor)}</span>${P()}<span class="mnach">${h(z.nach||"")}</span></div>`).join("")}</div>`
      :`<div class="msaetze${it.schema?" mschema":""}">${it.zeilen.map(z=>`<p class="msatz${z.as.length?"":" mfest"}">${z.s.replace(/\{\d\}/g,()=>P())}</p>`).join("")}</div>`; }
  else x+=`<form><p class="satzgross">${h(it.f).replace(/\{(\d)\}/g,(_,k)=>feld(it,+k))}</p><button class="pruefen" type="submit">Prüfen</button></form>`;
  x+=`<p class="mweg" hidden></p><div class="knoepfe mweiter" hidden><button type="button" class="haupt">Weiter</button></div>`;
  el.innerHTML=x; $("karte").replaceChildren(el); A.el=el;
  const S=$("schilder"); A.sel=null;
  if(it.typ==="ziehen"){ A.tiles=(it.bleibt?it.tiles:mischen(it.tiles)).map(t=>({text:String(t)})); S.replaceChildren(...A.tiles.map(baueKachel)); S.hidden=false;
    el.addEventListener("click",ev=>{ const p=ev.target.closest(".platz")||ev.target.closest(".mzeile,.msatz")?.querySelector(".platz:not(.voll)"); if(!p||A.fertig) return; if(A.sel) lege(A.sel,p); else sag("Nimm zuerst eine Karte unten.",""); });
    el.addEventListener("keydown",ev=>{ if((ev.key==="Enter"||ev.key===" ")&&ev.target.classList?.contains("platz")){ ev.preventDefault(); ev.target.click(); } }); }
  else { S.replaceChildren(); S.hidden=true; }
  el.querySelector("form")?.addEventListener("submit",e=>{ e.preventDefault(); pruefeEingabe(); });
  el.querySelectorAll(".mwahl button").forEach(b=>b.onclick=()=>it.typ==="wahl"?pruefeWahl(b):pruefeOrdnen(b));
  el.querySelector(".mweiter button").onclick=weiter;
  el.querySelector("input")?.focus({preventScroll:true});
}

// ---------- Karten ziehen (Finger, Maus, Stift) oder antippen ----------
function baueKachel(t){
  const b=document.createElement("button"); b.type="button"; b.className="wort"+(t.text.length>5?" breit":""); b.textContent=t.text; b.setAttribute("aria-pressed","false"); t.el=b;
  let st=null, geist=null, ziel=null, gezogen=false;
  const ende=()=>{ geist?.remove(); geist=null; b.classList.remove("gezogen"); ziel?.classList.remove("ziel"); ziel=null; st=null; };
  b.addEventListener("pointerdown",e=>{ if(e.button>0||A.fertig) return; const r=b.getBoundingClientRect(); st={x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top}; gezogen=false; try{ b.setPointerCapture(e.pointerId); }catch(_){} });
  b.addEventListener("pointermove",e=>{ if(!st) return;
    if(!geist){ if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<6) return; waehleK(null); gezogen=true; geist=b.cloneNode(true); geist.classList.add("geist"); document.body.append(geist); b.classList.add("gezogen"); }
    geist.style.transform=`translate(${e.clientX-st.dx}px,${e.clientY-st.dy}px) rotate(-3deg)`;
    const p=platzBei(e.clientX,e.clientY); if(p!==ziel){ ziel?.classList.remove("ziel"); ziel=p; ziel?.classList.add("ziel"); } });
  b.addEventListener("pointerup",()=>{ const war=!!geist, p=ziel; ende(); if(war&&p) lege(t,p); });
  b.addEventListener("pointercancel",ende);
  b.addEventListener("click",()=>{ if(gezogen){ gezogen=false; return; } if(A.fertig) return; waehleK(A.sel===t?null:t); });
  return b;
}
function platzBei(x,y){ const el=document.elementFromPoint(x,y); if(!el||!A?.el?.contains(el)) return null; const p=el.closest(".platz"); if(p&&!p.classList.contains("voll")) return p; return el.closest(".mzeile,.msatz")?.querySelector(".platz:not(.voll)")||null; }
function waehleK(t){ if(A.sel){ A.sel.el.classList.remove("gewaehlt"); A.sel.el.setAttribute("aria-pressed","false"); } A.sel=t; if(t){ t.el.classList.add("gewaehlt"); t.el.setAttribute("aria-pressed","true"); sag(`${t.text}: Tipp jetzt auf die passende Lücke.`,""); } }
function lege(t,p){
  if(A.fertig||p.classList.contains("voll")) return; waehleK(null);
  const g=A.gaps[+p.dataset.i], z=A.it.zeilen[g.r];
  if(t.text===g.a){ p.textContent=t.text; p.classList.add("voll"); p.classList.remove("nein"); g.ok=true; if(!A.it.bleibt) t.el.classList.add("weg");
    if(A.gaps.every(x=>x.ok)) return geloest(); piep([[523,0,.12]]); sag("Passt. Weiter mit der nächsten Lücke.","gut"); return; }
  g.f++; p.classList.add("nein"); setTimeout(()=>p.classList.remove("nein"),1100);
  if(falsch()) return;
  if(A.f===2&&A.it.hilfe) zeigeWeg("💡 "+h(A.it.hilfe));
  sag("Noch nicht. "+(z.t||A.it.t||""),"schlecht");
  if(g.f>=2) huepfe(A.tiles.find(x=>x.text===g.a&&!x.el.classList.contains("weg"))?.el);
}
function zeigeWeg(t){ const p=A.el.querySelector(".mweg"); p.innerHTML=t; p.hidden=!t; }
function wackel(){ A.el.classList.remove("falsch"); void A.el.offsetWidth; A.el.classList.add("falsch"); setTimeout(()=>A.el?.classList.remove("falsch"),500); piep([[220,0,.2],[175,.14,.25]]); }
function pruefeEingabe(){
  if(A.fertig) return;
  const it=A.it, ins=[...A.el.querySelectorAll("input")], offen=ins.filter(i=>!i.readOnly), leer=offen.find(i=>!i.value.trim());
  if(leer){ sag("Da fehlt noch etwas.",""); leer.focus(); return; }
  let erst=null;
  for(const i of offen){ const k=+i.dataset.k, soll=it.a[k], v=it.art==="text"?i.value.trim().toUpperCase():lies(i.value);
    const ok=it.art==="text"?v===String(soll).toUpperCase():Number.isFinite(v)&&gleich(v,soll);
    if(ok){ i.readOnly=true; i.classList.add("gut"); i.classList.remove("nein"); } else { i.classList.add("nein"); if(!erst) erst={i,k,v}; } }
  if(!erst) return geloest();
  if(falsch()) return;
  const v=erst.v, soll=it.a[erst.k];
  const lesbar=it.art==="text"||Number.isFinite(v);
  let t=(lesbar&&it.tipp?.(erst.k,v))||(it.art!=="text"&&lesbar?faktorTipp(v,soll):null)||(lesbar?"Rechne noch einmal nach.":"Schreib nur die Zahl, mit Ziffern.");
  if(A.f===2&&it.hilfe) zeigeWeg("💡 "+it.hilfe);
  if(A.f>=3){ zeigeWeg(`${it.weg?"So geht es: "+h(it.weg)+"<br>":""}<b>Richtig ist ${h(loesung(it))}.</b> Schreib es ab.`); t="Schreib die richtige Lösung ab."; }
  sag("Noch nicht. "+t,"schlecht"); erst.i.focus(); erst.i.select();
}
function faktorTipp(v,a){ for(const f of [10,100,1000]){ if(gleich(v,a*f)) return `Dein Ergebnis ist ${f}-mal zu groß.`; if(gleich(v*f,a)) return `Dein Ergebnis ist ${f}-mal zu klein.`; } return null; }
function pruefeWahl(b){
  if(A.fertig||b.disabled) return; const it=A.it, o=it.o[+b.dataset.i];
  if(o===it.a){ b.classList.add("gut"); const l=A.el.querySelector(".mluecke"); if(l){ l.textContent=o; l.classList.add("voll"); } return geloest(); }
  b.classList.add("nein"); b.disabled=true; if(falsch()) return;
  sag("Noch nicht. "+(it.t||""),"schlecht");
}
function pruefeOrdnen(b){
  if(A.fertig||b.classList.contains("weg")) return; const it=A.it, o=A.ord[+b.dataset.i], rest=A.ord.filter((x,i)=>!A.el.querySelector(`.mwahl button[data-i="${i}"]`).classList.contains("weg")), min=Math.min(...rest.map(x=>x.w));
  if(o.w===min){ b.classList.add("weg"); const r=A.el.querySelector(".mreihe"); r.textContent+=(r.textContent?" < ":"")+o.t; piep([[523,0,.12]]); if(rest.length===1) return geloest(); sag("Passt. Und jetzt?","gut"); return; }
  b.classList.add("nein"); setTimeout(()=>b.classList.remove("nein"),900); if(falsch()) return;
  sag("Noch nicht. Es gibt etwas Kleineres. "+(it.t||""),"schlecht");
}
// zaehlt einen Fehler; in der Probearbeit ist nach dem ersten Fehler Schluss mit der Aufgabe
function falsch(){
  A.f++; wackel();
  if(A.f===1){ const m=M(), k=fKey(A.en); m.fehler={...(m.fehler||{}),[k]:{e:A.en.e,p:A.en.p,rest:2,t:Date.now()}};
    const alle=Object.entries(m.fehler).sort((a,b)=>b[1].t-a[1].t); if(alle.length>120) m.fehler=Object.fromEntries(alle.slice(0,120)); halte(); }
  if(X.art!=="probe"){ X.f=A.f; merkeRunde(); return false; }
  A.fertig=true; X.schlecht.push(A.en); X.nr++; X.f=0; const ende=X.nr>=X.liste.length; if(ende) bucheRunde(); else merkeRunde();
  A.el.querySelectorAll("input").forEach(i=>i.readOnly=true); A.el.querySelectorAll(".mwahl button").forEach(b=>b.disabled=true);
  sag("Leider falsch.","schlecht"); zeigeWeg(`<b>Richtig ist ${h(loesung(A.it))}.</b>${A.it.weg?"<br>"+h(A.it.weg):""}`); zeigeWeiter();
  return true;
}
function zeigeWeiter(){ const w=A.el.querySelector(".mweiter"); w.hidden=false; w.querySelector("button").focus({preventScroll:true}); }
function weiter(){ lauf++; if(X.nr>=X.liste.length) return abschlussM(); frage(); }
function geloest(){
  A.fertig=true; const sauber=!A.f, m=M();
  piep([[523,0,.15],[784,.1,.25]]);
  X.gut+=A.it.typ==="ziehen"?A.gaps.filter(g=>!g.f).length:sauber?1:0; if(A.it.typ==="ziehen") $("schilder").hidden=true;
  if(sauber){ const k=fKey(A.en); if(m.fehler?.[k]?.rest>0){ m.fehler[k]={...m.fehler[k],rest:m.fehler[k].rest-1,t:Date.now()}; halte(); } } else X.schlecht.push(A.en);
  X.nr++; X.f=0; const ende=X.nr>=X.liste.length; if(ende) bucheRunde(); else merkeRunde();
  $("punkte").textContent=`Auf Anhieb: ${X.gut}`;
  sag(`Richtig! ${loesung(A.it)}`,"gut");
  A.el.querySelectorAll("input").forEach(i=>i.readOnly=true);
  const wg=A.it.weg; if(wg) zeigeWeg(h(wg));
  zeigeWeiter();
  if(sauber){ const mein=lauf; setTimeout(()=>{ if(lauf===mein) weiter(); },wg?2600:1500); }
}
function bucheRunde(){
  const m=M(), n=X.n;
  if(X.key&&m.weiter?.[X.key]){ m.weiter={...m.weiter}; delete m.weiter[X.key]; }
  if(X.art==="ebene"||X.art==="probe"){ const id=X.art==="probe"?"probe":X.e.id; X.alt=m.best?.[id]||0;
    m.gespielt={...(m.gespielt||{}),[id]:(m.gespielt?.[id]||0)+1}; m.best={...(m.best||{}),[id]:Math.max(X.alt,X.gut)}; m.bestVon={...(m.bestVon||{}),[id]:n};
    if(X.art==="ebene"&&X.gut/n>=.75){ if(!m.geschafft?.[id]) window.MEDIEN?.ebene("m",X.e,n); m.geschafft={...(m.geschafft||{}),[id]:true}; } }
  if(X.art==="heute") m.hTag=heute();
  halte(); KERN.log("Mathe: "+(X.e?`${X.e.b.name}: ${X.e.name}`:X.titel),X.gut,n,"mathe");
}
function abschlussM(){
  const n=X.n, a=X.gut, st=sterne(a,n), m=M(), e=X.e, b=e?.b, i=b?b.ebenen.indexOf(e):-1, next=b?.ebenen[i+1], fb=b?.id||null;
  piep([[523,0,.2],[659,.15,.2],[784,.3,.2],[1047,.45,.5]]);
  let text=`${a} von ${n} auf Anhieb richtig.`;
  if(X.alt&&a>X.alt) text+=" Das ist dein neuer Rekord."; else if(X.alt) text+=` Dein bestes Ergebnis: ${Math.max(X.alt,a)}.`;
  const offen=next&&!ezu(b,i+1,m); if(next&&!offen) text+=` Für die nächste Ebene brauchst du ${Math.ceil(n*.75)}.`;
  if(X.schlecht.length) text+=`<br>Schau dir noch einmal an: ${X.schlecht.slice(0,4).map(x=>h(loesung(mach(x)))).join(" · ")}`;
  if(X.art==="probe"&&X.schlecht.length){ const z={}; X.schlecht.forEach(x=>{ const nm=EB[x.e].b.name; z[nm]=(z[nm]||0)+1; }); text+=`<br>Fehler nach Thema: ${Object.entries(z).map(([t,c])=>`${h(t)} ${c}`).join(", ")}`; }
  $("schilder").hidden=true; sag("","");
  const fe=offeneFehler(m,fb).length, titel=X.art==="heute"?"Mathe für heute geschafft.":a===n?"Alles auf Anhieb richtig!":"Runde geschafft.";
  const kn=X.art==="ebene"?[...(offen?[[`Weiter: ${next.name}`,"haupt",()=>starteEbene(next)]]:[["Noch einmal","haupt",()=>starteEbene(e)]]),...(fe?[[`Nur meine Fehler üben (${fe})`,"neben",()=>starteFehler(fb)]]:[]),...(offen?[["Noch einmal","neben",()=>starteEbene(e)]]:[]),["Zurück","neben",()=>mBereich(b.id)]]
    :[["Zum Mathe-Menü","haupt",mMenue],...(fe?[[`Nur meine Fehler üben (${fe})`,"neben",()=>starteFehler(null)]]:[]),...(X.art==="probe"?[["Noch eine Klassenarbeit","neben",starteProbe]]:X.art==="heute"?[["Noch eine Runde","neben",starteHeute]]:[])];
  abschluss(`<h2>${titel} <span class="sterne" aria-label="${st} von 3 Sternen">${"★".repeat(st)}${"☆".repeat(3-st)}</span></h2><p>${text}</p>`,kn);
}

// ---------- fuer die Fachwahl und den Elternbereich ----------
function karte(){ const m=M(), z=offenB(m).map(b=>zahlB(b,m)); return {t:"Mathe",u:`Im Buch: ${h(abs(posVon(m)).name)}`,p:[z.reduce((a,x)=>a+x[0],0),z.reduce((a,x)=>a+x[1],0)],st:m.weiter?.heute?"Heute üben: angefangen":m.hTag===heute()?"heute fertig ✓":"heute noch offen"}; }
function eltern(n){
  const d=n===KERN.nr?KERN.D:KERN.daten(n), m=d.mathe||{}, ab=Date.now()-7*864e5, v=(d.verlauf||[]).filter(x=>x.a==="mathe"&&x.t>ab);
  const off=offenB(m), z=off.map(b=>[b,...zahlB(b,m)]), g=z.reduce((a,x)=>a+x[1],0), ges=z.reduce((a,x)=>a+x[2],0), q=v.reduce((a,x)=>a+x.v,0);
  const fe=offeneFehler(m), pos=posVon(m), fo=fokusVon(m,n), k=abs(pos).k;
  const html=`<section id="mathe"><h3>🧮 Mathe</h3><p>${g} von ${ges} Ebenen geschafft. Letzte 7 Tage: ${v.length} ${v.length===1?"Runde":"Runden"}${q?`, ${Math.round(100*v.reduce((a,x)=>a+x.g,0)/q)} % auf Anhieb richtig`:""}.</p>
    ${z.map(([b,x,y])=>`<div class="zeile2"><span>${b.icon} ${h(b.name)}</span><small>${x} von ${y}</small>${balken(x,y)}</div>`).join("")}
    ${k>1?`<p class="rot"><small>Im Unterricht ist Kapitel ${k} dran. Im Trainer gibt es bisher nur Kapitel 1: bitte die Buchseiten ${abs(k+".0")?.seite||""} bis ${letzteSeite(k)} fotografieren.</small></p>`:""}
    <label>Stand im Mathebuch <select id="mbuch">${ABS.map(a=>`<option value="${a.id}" ${a.id===pos?"selected":""}>${h(a.name)} (S. ${a.seite})</option>`).join("")}</select></label>
    <fieldset id="mfokus" style="border:0;padding:0;margin:10px 0"><legend style="padding:0;font-weight:600">Schwerpunkte</legend>${BEREICHE.map(b=>`<label style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" value="${b.id}" ${fo.includes(b.id)?"checked":""}> ${b.icon} ${h(b.name)}</label>`).join("")}</fieldset>
    <p><small>Die Schwerpunkte bekommen in „Heute üben“ gut die Hälfte der Aufgaben, reihum verteilt, bis alle ihre Ebenen geschafft sind. Ohne Häkchen gibt es nur das aktuelle Thema. ${h(kname(n))} wird an Schultagen gefragt, ob es im Mathebuch weiterging.</small></p>
    <details><summary>Offene Fehler Mathe (${fe.length})</summary><ul>${fe.slice(0,30).map(x=>`<li>${h(loesung(mach(x)))}</li>`).join("")||"<li>keine</li>"}</ul></details></section>`;
  const aendern=f=>{ const x=JSON.parse(JSON.stringify(n===KERN.nr?KERN.D:KERN.daten(n))); x.mathe=x.mathe||{}; f(x.mathe); KERN.ersetze(n,x); };
  return {html,verdrahte:(root,meld)=>{
    root.querySelector("#mbuch").onchange=e=>{ const id=e.target.value; aendern(mm=>{ const von=aidx(posVon(mm)), bis=aidx(id);
      if(bis>von) mm.neuFrei=[...new Set([...(mm.neuFrei||[]),...BEREICHE.filter(b=>RE.slice(von+1,bis+1).includes(b.kap)).map(b=>b.id)])];
      mm.buch={...(mm.buch||{}),pos:id,i:bis,seit:Date.now()}; }); meld(`Mathebuch: ${abs(id).name}.`); };
    root.querySelector("#mfokus").onchange=()=>{ const l=[...root.querySelectorAll("#mfokus input:checked")].map(x=>x.value); aendern(mm=>mm.fokus=l);
      meld(l.length?`Schwerpunkte: ${l.map(id=>BEREICHE.find(b=>b.id===id).name).join(", ")}.`:"Kein Schwerpunkt, nur das aktuelle Thema."); };
  }};
}

// "Regeln" oben: in Mathe der Merkzettel des Themas
const altRegeln=$("bTabelle").onclick; $("bTabelle").onclick=e=>{ if(ort?.startsWith("@m")) return merkzettel(); altRegeln?.(e); };

return {start:mStart,menue:mMenue,zurueck:mZurueck,karte,eltern,BEREICHE,EB,ABS,START,mach,loesung,lies,fz,zahlwort,roemisch,vonRoemisch,ausSeite,setzen,
  posVon:()=>posVon(M()),fokusVon:n=>fokusVon(M(),n??KERN.nr),gesperrt:id=>{ const b=BEREICHE.find(x=>x.id===id); return b.ebenen.filter((e,i)=>ezu(b,i,M())).map(e=>e.id); },plane,heuteListe,starteEbene,starteHeute,starteProbe,starteFehler,erklaerung,bereich:mBereich,frageBuch,weiterBis,
  get X(){return X;}, get A(){return A;}, pruefeEingabe};
})();
