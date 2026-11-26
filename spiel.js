"use strict";
// ---------- Inhalt: die Tabelle ----------
const ZEILEN = [
  {id:"i",    en:"I",    wort:"my",    ding:"room", de:"mein",                  kurz:"mein"},
  {id:"you1", en:"you",  wort:"your",  ding:"room", de:"dein",                  kurz:"dein",       zusatz:"eine Person"},
  {id:"he",   en:"he",   wort:"his",   ding:"room", de:"sein (Junge/Mann)",     kurz:"sein (Junge)"},
  {id:"she",  en:"she",  wort:"her",   ding:"room", de:"ihr (Mädchen/Frau)",    kurz:"ihr (Mädchen)"},
  {id:"it",   en:"it",   wort:"its",   ding:"door", de:"sein/ihr (Sache/Tier)", kurz:"sein/ihr (Sache)"},
  {id:"we",   en:"we",   wort:"our",   ding:"room", de:"unser",                 kurz:"unser"},
  {id:"you2", en:"you",  wort:"your",  ding:"room", de:"euer / Ihr",            kurz:"euer / Ihr", zusatz:"mehrere"},
  {id:"they", en:"they", wort:"their", ding:"room", de:"ihr (mehrere)",         kurz:"ihr (mehrere)"}
];
const WOERTER = ["my","your","his","her","its","our","their"];
const DEUTSCH = { // Runde 2: [Besitzer, deutscher Ausdruck]
  i:   [["Das bin ich.","mein Zimmer"]],
  you1:[["Du, Pia!","dein Zimmer"]],
  he:  [["Das ist Tony.","sein Zimmer"],["Mein Bruder.","sein Zimmer"]],
  she: [["Das Mädchen.","ihr Zimmer"],["Meine Mutter.","ihr Zimmer"]],
  it:  [["Das Haus.","seine Tür"],["Die Schule.","ihre Tür"]],
  we:  [["Wir sind Brüder.","unser Zimmer"]],
  you2:[["Luke und Jamie!","euer Zimmer"],["Herr Elliot,","Ihr Zimmer","herr"]],
  they:[["Lou und Tess.","ihr Zimmer"],["Tom und Lisa.","ihr Zimmer"]]
};
const TIPP = {
  i:"I heißt ich. Was gehört mir?",
  you1:"you: Das gesuchte Wort fängt genauso an.",
  he:"Ein Junge oder ein Mann ist he. Das gesuchte Wort fängt auch mit h an.",
  she:"Ein Mädchen oder eine Frau ist im Englischen immer she, nie it.",
  it:"Eine Sache ist im Englischen immer it, egal ob der, die oder das. Häng einen Buchstaben an, ohne Apostroph.",
  we:"we heißt wir. Gesucht ist unser.",
  you2:"Hier sprichst du jemanden an: you. Das gesuchte Wort fängt genauso an.",
  they:"they sind mehrere. Das gesuchte Wort fängt genauso an: the..."
};
const TIPP_DE = {
  i:"I heißt ich.", you1:"Hier steht nur eine Person: du.", he:"he heißt er.", she:"she heißt sie, eine Person.",
  it:"it ist eine Sache oder ein Tier.", we:"we heißt wir.", you2:"Hier sprichst du mehrere an: ihr.", they:"they heißt sie, mehrere Personen."
};
// typ: person = englische Person, deutsch = deutscher Ausdruck, voll = Englisch und Deutsch
// bank: Schilder bleiben liegen; verdeckt: geloeste Woerter werden zum Haken; einzeln: immer nur ein Fenster
const RUNDEN = [
  {kurz:"Haus 1", was:"Person und Wort",      typ:"person", start:"Zieh jedes Wort zu seiner Person."},
  {kurz:"Haus 1b",was:"Person und Wort, ohne Ausschließen", typ:"person", bank:true, verdeckt:true, start:"Alle Wörter bleiben liegen. Jedes Schild darfst du mehrmals nehmen."},
  {kurz:"Haus 2", was:"vom Deutschen aus",    typ:"deutsch",bank:true, start:"Welches englische Wort passt? Jedes Schild darfst du mehrmals nehmen."},
  {kurz:"Haus 2b",was:"vom Deutschen aus, ein Fenster nach dem anderen", typ:"deutsch",bank:true, einzeln:true, start:"Welches englische Wort passt?"},
  {kurz:"Haus 3", was:"die ganze Tabelle mit Deutsch", typ:"voll", start:"Jetzt beides: das englische Wort (schwarz) und die deutsche Bedeutung (rot)."}
];

// ---------- Figuren ----------
const F = (x,hemd,haar,lang,haut,s=1) => `<g transform="translate(${x} ${100-100*s}) scale(${s})">
  ${lang?`<path d="M-19 34 Q-19 10 0 10 Q19 10 19 34 L21 62 L-21 62Z" fill="${haar}"/>`:""}
  <path d="M-26 100 Q-26 60 0 60 Q26 60 26 100Z" fill="${hemd}"/>
  <rect x="-6" y="48" width="12" height="16" fill="${haut}"/><circle cx="0" cy="36" r="17" fill="${haut}"/>
  <path d="M-18 34 Q-18 13 0 13 Q18 13 18 34 Q8 25 -4 26 Q-14 27 -18 34Z" fill="${haar}"/>
  <circle cx="-6" cy="38" r="2.2" fill="#1b2333"/><circle cx="6" cy="38" r="2.2" fill="#1b2333"/>
  <path d="M-6 44 Q0 49 6 44" fill="none" stroke="#1b2333" stroke-width="2" stroke-linecap="round"/></g>`;
const svg = (b,t) => `<svg viewBox="0 0 ${b} 100" role="img" aria-hidden="true">${t}</svg>`;
const ICH = x => F(x,"#e4752b","#5b3a1e",false,"#f3c9a5");
const BILD = {
  i:   svg(80, ICH(40)),
  you1:svg(80, F(40,"#2f74b5","#1f1a17",true,"#b97a4e")),
  he:  svg(80, F(40,"#2f8f6b","#c98b2b",false,"#f3c9a5")),
  she: svg(80, F(40,"#b23a77","#7a3b16",true,"#f0bf98")),
  it:  svg(90,`<path d="M10 46 L45 12 L80 46Z" fill="#7a3b2c"/><rect x="18" y="46" width="54" height="54" fill="#e8d9b8"/><rect x="36" y="62" width="19" height="38" fill="#c3262e"/><circle cx="51" cy="82" r="2" fill="#fff"/><rect x="23" y="54" width="9" height="12" fill="#6fa3c8"/><rect x="59" y="54" width="9" height="12" fill="#6fa3c8"/>`),
  we:  svg(130, F(88,"#3d9aa8","#5b3a1e",false,"#f3c9a5",.86)+ICH(44)),
  you2:svg(130, F(44,"#2f74b5","#1f1a17",true,"#b97a4e")+F(90,"#2f74b5","#3a2a20",false,"#a86c43",.92)),
  herr:svg(80, F(40,"#3b4658","#b9bcc4",false,"#f0bf98")),
  they:svg(170, F(38,"#7d5ba6","#1f1a17",false,"#b97a4e")+F(86,"#8a9a2f","#c98b2b",true,"#f3c9a5",.9)+F(132,"#7d5ba6","#7a3b16",false,"#f0bf98",.84))
};

// ---------- Inhalt: Bereiche und Ebenen ----------
// Aufgabenarten: wahl (f = Satz mit ___, a = Antwort, o = Schilder), bau (d = Auftrag, a = Teile mit |, x = falsche Schilder, z = Satzzeichen),
// kurz (f = Frage, j = ja/nein, a = Teile der Kurzantwort, / = beides richtig). t = Tipp.
const PRON=["I","he","she","it","we","they"];
const KURZ=["yes","no","I","he","she","it","we","they","there","am","is","are","'m","'m not","isn't","aren't"];
const JA=true, NEIN=false;
const WT={my:"I → my.",your:"Hier wird jemand angesprochen: you → your.",his:"Ein Junge oder Mann: he → his.",her:"Ein Mädchen oder eine Frau: she → her, nie its.",
  its:"Eine Sache oder ein Tier: it → its, ohne Apostroph.",our:"we → our.",their:"Mehrere: they → their."};
const PAAR={its:"its heißt sein oder ihr. Probier, ob it is in den Satz passt.","it's":"it's ist die Kurzform von it is. Probier it is im Satz.",
  your:"your heißt dein. Probier, ob you are in den Satz passt.","you're":"you're ist die Kurzform von you are. Probier you are im Satz."};
const GT={"'s":"Eine Person, ein Tier oder ein Wort ohne -s am Ende: 's.","'":"Das Wort endet schon auf -s: nur der Apostroph."};

// Ball und Kiste fuer die Ortswoerter
const KISTE='<rect x="60" y="50" width="50" height="40" fill="#c98b4a" stroke="#7a4f22" stroke-width="3"/>';
const BALL=(x,y,r=13)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#c3262e" stroke="#7d151b" stroke-width="3"/>`;
const ORT=t=>`<svg viewBox="0 0 170 100" role="img" aria-label="Ball und Kiste"><rect x="0" y="90" width="170" height="10" fill="#8fa37a"/>${t}</svg>`;
const ORTE={
  "in":ORT(BALL(85,58)+'<path d="M60 58 L110 58 L110 90 L60 90Z" fill="#c98b4a" stroke="#7a4f22" stroke-width="3"/><path d="M60 58 L60 40 M110 58 L110 40" stroke="#7a4f22" stroke-width="3"/>'),
  "on":ORT(KISTE+BALL(85,35)),
  "under":ORT('<rect x="50" y="34" width="70" height="10" fill="#c98b4a" stroke="#7a4f22" stroke-width="3"/><path d="M56 44V90M114 44V90" stroke="#7a4f22" stroke-width="5"/>'+BALL(85,76)),
  "behind":ORT(BALL(108,52,17)+KISTE),
  "in front of":ORT(KISTE+BALL(85,78,15)),
  "next to":ORT(KISTE+BALL(130,76))
};

// Zahlen
const EINER=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const ZEHNER=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
const wortZahl=n=>n===100?"one hundred":n<20?EINER[n]:ZEHNER[Math.floor(n/10)]+(n%10?"-"+EINER[n%10]:"");
const ZAHL={"a hundred":100}; for(let n=1;n<=100;n++) ZAHL[wortZahl(n)]=n;
const TRIOS=[[3,13,30],[4,14,40],[5,15,50],[6,16,60],[7,17,70],[8,18,80],[9,19,90],[2,12,20]];
const ZTIPP={fourty:"forty schreibt man ohne u. four und fourteen haben ein u.",forteen:"fourteen hat ein u wie four. Nur forty hat keins.",threeteen:"Aus three wird thir: thir und dann teen.",threety:"Aus three wird thir: thir und dann ty.",
  thriteen:"Erst das i, dann das r: thir.",thrity:"Erst das i, dann das r: thir.",fiveteen:"Aus five wird fif.",fivteen:"Aus five wird fif, mit zwei f.",fivety:"Aus five wird fif.",fivty:"Aus five wird fif, mit zwei f.",
  eightteen:"eight endet schon auf t. Es kommt kein zweites t dazu.",eightty:"eight endet schon auf t. Es kommt kein zweites t dazu.",eigth:"Erst gh, dann t: ei, gh, t.",ninty:"Das e von nine bleibt stehen.",ninteen:"Das e von nine bleibt stehen.",
  tree:"tree ist ein Baum. Nach dem t fehlt das h.",twelf:"Am Ende steht ve.",hundret:"Am Ende steht ein d.",tweny:"Nach dem n fehlt das t.",sixtteen:"Nur ein t."};
const ZMEINT={fourty:"forty",forteen:"fourteen",threeteen:"thirteen",threety:"thirty",thriteen:"thirteen",thrity:"thirty",fiveteen:"fifteen",fivteen:"fifteen",fivety:"fifty",fivty:"fifty",eightteen:"eighteen",eightty:"eighty",eigth:"eight",ninty:"ninety",ninteen:"nineteen",tree:"three",twelf:"twelve",hundret:"hundred",tweny:"twenty",sixtteen:"sixteen"};
// Buchstabenhilfe: Anfang und Ende bleiben stehen
const luecken=w=>w.split("").map((c,i)=>/[- ]/.test(c)?c:i===0||i===w.length-1||(w.length>6&&i===2)?c:"_").join(" ");

const BEREICHE=[
{id:"besitz",icon:"🏠",name:"Whose room?",was:"my, your, his, her ... (Nr. 5)",thema:"s3",regeln:"tabelle",ebenen:[
  {id:"b_a",name:"Lückensätze",was:"das richtige Wort einsetzen",typ:"wahl",o:WOERTER,items:[
    ["I'm Ben. ___ brother is seven.","my"],["She's Holly. ___ guinea pigs are cute.","her"],["He's Luke. ___ dog is Sherlock.","his"],["We're brothers. ___ room is big.","our"],
    ["They're the Elliots. ___ house is in Brook Lane.","their"],["It's a nice house. ___ door is red.","its"],["You're new here. What's ___ name?","your"],["Irina is a girl. ___ bedroom is pink.","her"],
    ["I'm from York. ___ house is big.","my"],["He's Tony. ___ room is in the loft.","his"],["She's my mum. ___ car is red.","her"],["They're my friends. ___ names are Ben and Max.","their"],
    ["We're a family. ___ flat is nice.","our"],["It's a dog. ___ ball is in the garden.","its"],["Luke and Jamie, is this ___ room?","your"],["The girl is from Cologne. ___ family is in London.","her"],
    ["Mr Elliot, is this ___ dog?","your"],["My brother is seven. ___ favourite colour is blue.","his"],["Holly and Amber are sisters. ___ guinea pigs are Mr Fluff and Honey.","their"],["I'm eleven. ___ sister is crazy.","my"],
    ["The kitchen is small. ___ walls are yellow.","its"],["You're new in Greenwich, Pia. Where is ___ house?","your"],["We're at school. ___ teacher is nice.","our"]
   ].map(([f,a])=>({f,a,t:WT[a]}))},
  {id:"b_b",name:"Wähle das richtige Wort",was:"drei Wörter, eins passt",typ:"wahl",items:[
    ["Luke and Jamie, is this ___ ball?","your","their","its"],["The girl is nice. ___ name is Pia.","her","its","their"],["Sherlock is a dog. ___ bed is in the kitchen.","his","their","her"],
    ["Mr Elliot, is this ___ car?","your","his","their"],["Tom and Lisa live in York. ___ flat is small.","their","her","his"],["I love ___ mum.","my","me","I"],
    ["Tony is a mouse. ___ room is in the loft.","his","her","their"],["Lou and Tess are friends. ___ house is in Greenwich.","their","her","its"],["My sister is ten. ___ bike is red.","her","his","its"],["The house is old. ___ windows are small.","its","his","it's"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:a==="my"?"mein: my. me heißt mich oder mir.":WT[a]}))},
  {id:"b_c",name:"its oder it's? your oder you're?",was:"gleich gesprochen, anders geschrieben",typ:"wahl",items:[
    ["___ a big house.","it's"],["The house is old. ___ walls are white.","its"],["___ a nice boy, Ben!","you're"],["Is this ___ bag?","your"],["The dog is happy. ___ ball is here.","its"],
    ["Look at the dog! ___ in the garden.","it's"],["___ late, Luke!","you're"],["Where is ___ dad, Pia?","your"],["What's the time? ___ ten o'clock.","it's"],["The kitchen is nice. ___ door is green.","its"],["___ my best friend, Pia.","you're"],["I like ___ room, Luke.","your"]
   ].map(([f,a])=>({f,a,o:/^it/.test(a)?["its","it's"]:["your","you're"],t:PAAR[a]}))},
  {id:"b_d",name:"Übersetzen",was:"englische Sätze bauen",typ:"bau",items:[
    ["Mein Zimmer ist klein.","my|room|is|small",["me"]],["Das Mädchen ist nett. Übersetze: Ihre Familie ist in London.","her|family|is|in London",["its","their"]],["Euer Wohnzimmer ist groß.","your|living room|is|big",["our"]],
    ["Das Wohnzimmer ist groß. Übersetze: Seine Wände sind blau.","its|walls|are|blue",["his","it's"]],["Lou und Tess sind Freunde. Übersetze: Ihr Haus ist in Greenwich.","their|house|is|in Greenwich",["her"]],
    ["Tony ist eine Maus. Übersetze: Sein Zimmer ist auf dem Dachboden.","his|room|is|in the loft",["its","her"]],["Mein kleiner Bruder ist nett.","my|little|brother|is|nice",["his"]],["Unsere Küche ist gelb.","our|kitchen|is|yellow",["their"]]
   ].map(([d,a,x])=>({d,a,x,z:".",t:"Überleg zuerst: Wem gehört es? Damit fängt der Satz an."}))}
 ]},
{id:"be",icon:"🙋",name:"Yes, I am.",was:"Fragen mit to be und Kurzantworten (Nr. 3)",thema:"s1",
 regeln:`<ul><li>Bei <b>Yes</b> immer die lange Form: Yes, I am. Nie Yes, I'm.</li><li>Bei <b>No</b> die Kurzform: No, he isn't. No, they aren't.</li><li>Bei I heißt es: No, <b>I'm not</b>.</li><li>Are <b>you</b> ...? Antwort mit <b>I</b>. Are <b>you and your friend</b> ...? Antwort mit <b>we</b>.</li><li>Frage bauen: Das Verb kommt nach vorn. Dave <b>is</b> here. <b>Is</b> Dave here?</li></ul>`,ebenen:[
  {id:"k_wer",name:"Wer antwortet?",was:"I, he, she, it, we oder they",typ:"wahl",o:PRON,items:[
    ["Are you eleven? Yes, ___ am.","I"],["Is Luke from Greenwich? Yes, ___ is.","he"],["Is Irina Luke's sister? Yes, ___ is.","she"],["Is the kitchen big? Yes, ___ is.","it"],["Are Luke and Jamie brothers? Yes, ___ are.","they"],
    ["Are you and your friend from London? No, ___ aren't.","we"],["Is your mum at work? Yes, ___ is.","she"],["Is the house in Greenwich? Yes, ___ is.","it"],["Are your friends nice? Yes, ___ are.","they"],["Is Mr Elliot English? Yes, ___ is.","he"],["Are you and your brother in the garden? Yes, ___ are.","we"],["Are you from York? Yes, ___ am.","I"]
   ].map(([f,a])=>({f,a,t:{I:"Du wirst gefragt, also antwortest du mit ich.",he:"Ein Junge oder ein Mann.",she:"Ein Mädchen oder eine Frau.",it:"Eine Sache.",we:"you and ...: Du und noch jemand, das sind wir.",they:"Mehrere, und du bist nicht dabei."}[a]}))},
  {id:"k_form",name:"Welche Antwort stimmt?",was:"lange Form bei Yes, Kurzform bei No",typ:"wahl",breit:true,items:[
    ["Are you from York? ___",JA,"Yes, I am.","Yes, I'm.","Yes, you are."],["Is Luke nice? ___",JA,"Yes, he is.","Yes, he's.","Yes, it is."],["Are you twelve? ___",NEIN,"No, I'm not.","No, I amn't.","No, I isn't."],["Is the bedroom small? ___",NEIN,"No, it isn't.","No, he isn't.","No, it not."],
    ["Are your friends nice? ___",JA,"Yes, they are.","Yes, they're.","Yes, we are."],["Are you and your brother in the garden? ___",NEIN,"No, we aren't.","No, they aren't.","No, I'm not."],["Is Irina crazy? ___",NEIN,"No, she isn't.","No, her isn't.","No, it isn't."],["Is your dad at home? ___",JA,"Yes, he is.","Yes, he's.","Yes, his is."]
   ].map(([f,j,a,...x])=>({f,j,a,o:[a,...x],t:j?"Bei Yes wird nie verkürzt. Und wer ist gemeint?":"Bei No steht die Kurzform. Und wer ist gemeint?"}))},
  {id:"k_kurz",name:"Kurzantworten bauen",was:"Yes oder No, Person, Verb",typ:"kurz",items:[
    ["Are you eleven?",NEIN,"no|I|'m not"],["Is Luke from Greenwich?",JA,"yes|he|is"],["Is Irina Luke's sister?",JA,"yes|she|is"],["Is the kitchen big?",NEIN,"no|it|isn't"],["Are Luke and Jamie brothers?",JA,"yes|they|are"],["Are you and your friend from London?",NEIN,"no|we|aren't"],
    ["Are you from York?",JA,"yes|I|am"],["Is Sherlock Luke's dog?",JA,"yes|he/it|is"],["Is your mum at work?",NEIN,"no|she|isn't"],["Are your friends nice?",JA,"yes|they|are"],["Is the house in Greenwich?",JA,"yes|it|is"],["Are you twelve?",NEIN,"no|I|'m not"],
    ["Is Mr Elliot English?",JA,"yes|he|is"],["Are Luke and Irina at school?",NEIN,"no|they|aren't"],["Is the bedroom small?",NEIN,"no|it|isn't"],["Are we in Brook Lane?",JA,"yes|we/you|are"],["Is Irina crazy?",NEIN,"no|she|isn't"],["Are you and your brother in the garden?",NEIN,"no|we|aren't"],["Are you tired?",JA,"yes|I|am"]
   ].map(([f,j,a])=>({f,j,a}))},
  {id:"k_frage",name:"Mach eine Frage daraus",was:"das Verb nach vorn",typ:"bau",items:[
    ["Dave is from Greenwich.","is|Dave|from Greenwich"],["The children are in the garden.","are|the children|in the garden"],["You are crazy.","are|you|crazy"],["The dog is under the table.","is|the dog|under the table"],["Holly and Tess are friends.","are|Holly and Tess|friends"],["Your mum is at work.","is|your mum|at work"],["We are in Brook Lane.","are|we|in Brook Lane"],["The sofa is red.","is|the sofa|red"]
   ].map(([d,a])=>({d,a,x:[/^is/.test(a)?"are":"is"],z:"?",t:"In der Frage steht das Verb ganz vorn."}))}
 ]},
{id:"there",icon:"📦",name:"There is, there are",was:"Es gibt ... (Nr. 3)",thema:"s2",
 regeln:`<ul><li><b>There is</b> und <b>there are</b> heißen: es gibt, da ist, da sind.</li><li>Ein Ding, also a oder an: <b>There is</b> a ball.</li><li>Mehrere Dinge: <b>There are</b> three balls.</li><li>Frage: tauschen. <b>Is there</b> a mouse under the bed? Erst das Ding, dann der Ort.</li><li>Antwort: there kommt wieder mit. <b>Yes, there is.</b> <b>No, there aren't.</b></li><li>Steht kein there in der Frage, antwortest du mit I, he, she, it, we oder they.</li></ul>`,ebenen:[
  {id:"t_isare",name:"is oder are?",was:"ein Ding oder mehrere",typ:"wahl",o:["is","are"],items:[
    ["There ___ a dog in the garden.","is"],["There ___ two cats on the sofa.","are"],["There ___ a ball.","is"],["There ___ three balls.","are"],["There ___ a mouse under the bed.","is"],["There ___ two books on the table.","are"],["There ___ a sofa in the living room.","is"],["There ___ four chairs in the kitchen.","are"],["There ___ biscuits on the shelf.","are"],["There ___ a TV in my bedroom.","is"]
   ].map(([f,a])=>({f,a,t:a==="is"?"Danach kommt a, also ein Ding.":"Das sind mehrere Dinge."}))},
  {id:"t_de",name:"Übersetzen",was:"Es gibt ..., Gibt es ...?",typ:"bau",items:[
    ["Es gibt einen Hund im Garten.","there|is|a dog|in the garden"],["Da sind zwei Bücher auf dem Tisch.","there|are|two books|on the table"],["Gibt es eine Katze im Haus?","is|there|a cat|in the house"],["Gibt es drei Stühle in der Küche?","are|there|three chairs|in the kitchen"],["Da sind zwei Katzen auf dem Sofa.","there|are|two cats|on the sofa"],["Gibt es eine Maus unter dem Bett?","is|there|a mouse|under the bed"],["Gibt es zwei Autos in der Garage?","are|there|two cars|in the garage"],["Gibt es Kekse im Schrank?","are|there|biscuits|in the cupboard"],["Gibt es einen Hund in deinem Haus?","is|there|a dog|in your house"],["Es gibt einen Ball in meiner Tasche.","there|is|a ball|in my bag"]
   ].map(([d,a])=>({d,a,x:[/(^|\|)is(\||$)/.test(a)?"are":"is"],z:d.endsWith("?")?"?":".",t:d.endsWith("?")?"Frage: erst is oder are, dann there, dann das Ding, dann der Ort.":"Satz: there, is oder are, das Ding, der Ort."}))},
  {id:"t_frage",name:"Fragen ordnen",was:"erst das Ding, dann der Ort",typ:"bau",items:["is|there|a sofa|in the living room","are|there|two cats|in the garden","is|there|a TV|in your bedroom","are|there|biscuits|on the shelf","is|there|a mouse|under the bed","are|there|pictures|on the walls","is|there|a fridge|in the kitchen","are|there|four chairs|in the kitchen"
   ].map(a=>({d:"Bau eine Frage.",a,z:"?",t:"Is oder Are, there, das Ding, der Ort."}))},
  {id:"t_kurz",name:"Kurzantworten mit there",was:"Yes, there is. No, there aren't.",typ:"wahl",breit:true,o:["Yes, there is.","No, there isn't.","Yes, there are.","No, there aren't.","Yes, it is.","Yes, they are."],items:[
    ["Is there a TV in your bedroom? ___",NEIN],["Are there two bathrooms in your house? ___",JA],["Is there a garden? ___",JA],["Are there books on your desk? ___",JA],["Is there a cat in your house? ___",NEIN],["Are there four chairs in the kitchen? ___",NEIN],["Is there a sofa in the living room? ___",JA],["Are there pictures on the walls in your room? ___",NEIN],["Are there biscuits on the shelf? ___",JA],["Is there a mouse under the bed? ___",JA]
   ].map(([f,j])=>({f,j,a:(j?"Yes, there ":"No, there ")+(/^Is/.test(f)?(j?"is.":"isn't."):(j?"are.":"aren't.")),t:"there kommt in der Antwort wieder mit. Schau: Is oder Are?"}))},
  {id:"t_dialog",name:"Tom und Lisa",was:"is, isn't, are, aren't",typ:"wahl",items:[
    ["Tom: Tell me about your house. ___ there a garden?","is",1],["Tom: Is there a garden? Lisa: Yes, there ___. It's great!","is"],["Tom: ___ there two bathrooms?","are",1],["Tom: Are there two bathrooms? Lisa: No, there ___. There's only one.","aren't"],["Tom: ___ your parents at home now?","are",1],["Tom: Are your parents at home now? Lisa: No, they ___. They're at work.","aren't"],["Tom: Is there a cat in your house? Lisa: No, there ___.","isn't"],["Tom: Are there pictures on the walls? Lisa: Yes, there ___.","are"]
   ].map(([f,a,frage])=>({f,a,o:frage?["is","are"]:["is","isn't","are","aren't"],t:"Ein Ding: is. Mehrere: are. Bei No mit n't."}))},
  {id:"t_mix",name:"Gemischt: there oder nicht?",was:"Steht there in der Frage?",typ:"kurz",items:[
    ["Are you ten?",JA,"yes|I|am"],["Is there a dog in the garden?",NEIN,"no|there|isn't"],["Is your brother at school?",JA,"yes|he|is"],["Are there two cats on the sofa?",JA,"yes|there|are"],["Is the kitchen big?",NEIN,"no|it|isn't"],["Is there a TV in your bedroom?",NEIN,"no|there|isn't"],["Are your friends crazy?",JA,"yes|they|are"],["Are there books on the table?",NEIN,"no|there|aren't"],["Is your dad from Greenwich?",NEIN,"no|he|isn't"],["Is there a mouse under the bed?",JA,"yes|there|is"],["Are you and your brother in the garden?",JA,"yes|we|are"],["Are there three chairs in the kitchen?",NEIN,"no|there|aren't"],["Is the sofa red?",JA,"yes|it|is"],["Are you from London?",NEIN,"no|I|'m not"],["Is there a ball in your bag?",JA,"yes|there|is"]
   ].map(([f,j,a])=>({f,j,a}))}
 ]},
{id:"of",icon:"🔗",name:"'s oder of?",was:"Luke's dog, the door of the house (Nr. 4)",thema:"s1",
 regeln:`<ul><li>Person oder Tier: <b>'s</b>. Luke<b>'s</b> dog.</li><li>Sache: <b>of</b>. the door <b>of</b> the house.</li><li>Das Wort endet schon auf -s: nur <b>'</b>. the boys<b>'</b> house, James<b>'</b> skateboard.</li><li>children, men, women: <b>'s</b>. the children<b>'s</b> room.</li><li>Zwei Namen: nur am letzten. Luke and Jamie<b>'s</b> dad.</li></ul>`,ebenen:[
  {id:"g_sort",name:"Lebewesen oder Sache?",was:"zwei Gruppen",typ:"wahl",breit:true,o:["'s oder '","of"],items:["Luke","the house","Sherlock","the road","my mum","the sofa","the girls","the kitchen","the dog","the street"
   ].map(w=>({f:w+" → ___",a:/house|road|sofa|kitchen|street/.test(w)?"of":"'s oder '",t:"Person oder Tier: 's oder '. Sache: of."}))},
  {id:"g_ende",name:"'s oder '?",was:"die richtige Endung",typ:"wahl",o:["'s","'","s"],items:[
    ["Tom___ bike","'s"],["my sister___ room","'s"],["the girls___ bedroom","'"],["James___ dog","'"],["the children___ toys","'s"],["Luke and Jamie___ mum","'s"],["the Elliots___ garden","'"],["my parents___ car","'"],["Holly___ guinea pigs","'s"],["the teacher___ desk","'s"],
    ["I'm very happy at the Elliots___ house.","'"],["Luke___ bed is great for a dog!","'s"],["The girls___ bedroom is pink.","'"],["Irina___ things are everywhere.","'s"],["Mr Elliot___ car is old, but I love it.","'s"],["The children___ football is in the garden.","'s"],["Luke and Jamie___ new room is in the loft.","'s"],["James___ skateboard is in the kitchen.","'"],["My friends___ names are Tony and Lou.","'"],["Holly___ guinea pigs are my friends too.","'s"]
   ].map(([f,a])=>({f,a,t:/children/.test(f)?"children ist schon die Mehrzahl ohne -s: 's.":/ and /.test(f)&&a==="'s"&&/Jamie/.test(f)?"Zwei Namen: nur am letzten 's.":GT[a]}))},
  {id:"g_of",name:"'s, ' oder of?",was:"die ganze Wortgruppe",typ:"wahl",breit:true,items:[
    ["the door / the house","the door of the house","the house's door","the house door"],["Irina / bedroom","Irina's bedroom","Irinas bedroom","the bedroom of Irina"],["the name / the street","the name of the street","the street's name","the streets name"],["my dad / car","my dad's car","my dads car","the car of my dad"],["the colour / the sofa","the colour of the sofa","the sofa's colour","the sofas colour"],["the dog / ball","the dog's ball","the dogs ball","the ball of the dog"],["the end / the road","the end of the road","the road's end","the roads end"],["Lou and Tess / friend","Lou and Tess' friend","Lou's and Tess' friend","Lou and Tesses friend"],
    ["Holly / house","Holly's house","Hollys house","the house of Holly"],["the colour / the door","the colour of the door","the door's colour","the doors colour"],["my brothers / bikes (zwei Brüder)","my brothers' bikes","my brother's bikes","my brothers bikes"],["Tess / cat","Tess' cat","Tesses cat","the cat of Tess"],["the name / the park","the name of the park","the park's name","the parks name"],["the children / ball","the children's ball","the childrens' ball","the childrens ball"],["Lou and Tess / house","Lou and Tess' house","Lou's and Tess' house","the house of Lou and Tess"]
   ].map(([w,a,...x])=>({f:w+" → ___",a,o:[a,...x],t:/ of /.test(a)?"Das ist eine Sache: of.":"Das ist ein Lebewesen: 's, nach einem -s am Ende nur der Apostroph."}))},
  {id:"g_de",name:"Übersetzen",was:"englische Sätze bauen",typ:"bau",items:[
    ["Das ist Pias Hund.","this|is|Pia's|dog",["Pias"]],["Das Zimmer der Jungen ist groß. (zwei Jungen)","the|boys'|room|is|big",["boy's"]],["Die Tür des Hauses ist grün.","the door|of the house|is|green",["the house's"]],["Die Spielsachen der Kinder sind im Garten.","the|children's|toys|are|in the garden",["childrens'"]],["Mr Elliot ist Lukes und Jamies Vater.","Mr Elliot|is|Luke and Jamie's|dad",["Luke's and Jamie's"]],["Das Auto meines Vaters ist alt.","my|dad's|car|is|old",["dads"]],["Der Name der Straße ist Brook Lane.","the name|of the street|is|Brook Lane",["the street's"]]
   ].map(([d,a,x])=>({d,a,x,z:".",t:"Wem gehört es? Lebewesen 's oder ', Sache of."}))}
 ]},
{id:"zimmer",icon:"🛏️",name:"My room",was:"dein Zimmer beschreiben (Nr. 6)",thema:"s3",
 regeln:`<ul><li>Ein Ding: <b>There is</b> a bed. Mehrere: <b>There are</b> two chairs.</li><li>Wo: in, on, under, behind, <b>in front of</b>, <b>next to</b>. next braucht immer to.</li><li>Farbe und Größe: The walls <b>are</b> blue. My room <b>is</b> small.</li><li>Satzanfang groß, am Ende ein Punkt.</li><li>Abwechseln: nicht jeder Satz mit There is.</li></ul>`,ebenen:[
  {id:"w_ort",name:"Wo ist es?",was:"in, on, under, behind ...",typ:"wahl",o:["in","on","under","behind","in front of","next to"],n:12,items:[
    ...Object.keys(ORTE).map(a=>({f:`The ball is ___ the ${a==="under"?"table":"box"}.`,a,bild:a})),
    ...[["Die Lampe ist auf dem Schreibtisch. The lamp is ___ the desk.","on"],["Die Maus ist unter dem Bett. The mouse is ___ the bed.","under"],["Das Bett ist neben dem Fenster. The bed is ___ the window.","next to"],["Der Tisch ist vor dem Fenster. The table is ___ the window.","in front of"],["Der Ball ist hinter dem Sofa. The ball is ___ the sofa.","behind"],["Die Bücher sind in der Tasche. The books are ___ the bag.","in"]].map(([f,a])=>({f,a}))
   ].map(x=>({...x,t:{"in":"drin","on":"oben drauf","under":"darunter","behind":"dahinter","in front of":"davor","next to":"daneben"}[x.a]+": Welches Wort heißt das?"}))},
  {id:"w_satz",name:"Satzbausteine",was:"der richtige Satzanfang",typ:"wahl",items:[
    ["___ bedroom is small.","my","there is","I like"],["___ a bed.","there is","there are","the"],["___ two chairs.","there are","there is","the lamp is"],["___ on the desk.","the lamp is","there are","my lamp"],["The walls ___ blue.","are","is","there"],["___ my big sofa.","I like","there are","the is"],["___ a lamp on my desk.","there is","there are","they are"],["___ two shelves on the wall.","there are","there is","they are"],["The fridge ___ white.","is","are","there is"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:"Ein Ding: is. Mehrere: are. Es gibt: there."}))},
  {id:"w_fehler",name:"Finde den Fehler",was:"welcher Satz ist richtig?",typ:"wahl",breit:true,items:[
    ["My kitchen are big.","My kitchen is big.","My kitchen be big.","My kitchens is big."],["There is two chairs in the kitchen.","There are two chairs in the kitchen.","There is two chair in the kitchen.","They are two chairs in the kitchen."],["The fridge is next the door.","The fridge is next to the door.","The fridge is next of the door.","The fridge is to next the door."],["There are a table in front of the window.","There is a table in front of the window.","There is a table in front the window.","They is a table in front of the window."],
    ["Threre is a lamp on the desk.","There is a lamp on the desk.","Thre is a lamp on the desk.","Their is a lamp on the desk."],["Are there on the walls photos?","Are there photos on the walls?","Are on the walls there photos?","There are on the walls photos?"],["there is a big bed next to the window","There is a big bed next to the window.","There is a big bed next to the window","there is a big bed next to the window."],["Is there in the kitchen a fridge?","Is there a fridge in the kitchen?","Is a fridge there in the kitchen?","Is in the kitchen there a fridge?"]
   ].map(([w,a,...x])=>({f:"Falsch: "+w+" ___",a,o:[a,...x],t:"Schau auf is und are, auf next to, auf die Reihenfolge und auf there."}))},
  {id:"w_text",name:"Text bauen",was:"Satz für Satz ein Zimmer beschreiben",typ:"bau",items:[
    ["Mein Schlafzimmer ist klein, aber schön.","my bedroom|is|small|but nice",["are"]],["Die Wände sind grün.","the walls|are|green",["is"]],["Es gibt ein großes Bett neben dem Fenster.","there is|a big bed|next to|the window",["there are","next"]],["Es gibt zwei Regale an der Wand.","there are|two shelves|on|the wall",["there is"]],["Mein Schreibtisch ist vor dem Fenster.","my desk|is|in front of|the window",["behind"]],["Es gibt eine Lampe auf meinem Schreibtisch.","there is|a lamp|on|my desk",["there are"]],["Ich mag mein Zimmer.","I|like|my|room",["me"]]
   ].map(([d,a,x])=>({d,a,x,z:".",t:"Ein Ding: there is. Mehrere: there are. Und achte auf das Ortswort."}))},
  {id:"w_du",name:"Jetzt du!",was:"fünf eigene Sätze schreiben",typ:"schreiben"}
 ]},
{id:"zahlen",icon:"🔢",name:"Numbers",was:"Zahlen schreiben: 3, 13, 30 (Seite 22, Nr. 14)",thema:"s2",
 regeln:`<ul><li>13 bis 19 enden auf <b>-teen</b>, die Zehner auf <b>-ty</b>: thir<b>teen</b>, thir<b>ty</b>.</li><li>Beim Sprechen: thir<b>TEEN</b> wird hinten betont, <b>THIR</b>ty vorn.</li><li>Aus three wird <b>thir</b>: thirteen, thirty.</li><li>Aus five wird <b>fif</b>: fifteen, fifty.</li><li>four und fourteen mit u, aber <b>forty</b> ohne u.</li><li>eighteen und eighty: nur ein t nach gh. nineteen und ninety: das e bleibt.</li><li>Ab 21 mit Bindestrich: twenty<b>-</b>one. Erst der Zehner, dann der Einer.</li></ul>`,ebenen:[
  {id:"n_wahl",name:"Zahl und Wort",was:"3, 13 oder 30?",typ:"wahl",n:12,items:TRIOS.flatMap(t=>t.map(n=>({f:`${n} = ___`,a:wortZahl(n),o:t.map(wortZahl),t:n<13?"Das ist die kurze Zahl ohne teen und ohne ty.":n<20?"13 bis 19 enden auf teen.":"Die Zehner enden auf ty."})))},
  {id:"n_ende",name:"-teen oder -ty?",was:"die richtige Endung",typ:"wahl",n:12,o:["teen","ty"],items:TRIOS.slice(0,7).flatMap(t=>[t[1],t[2]]).map(n=>({f:`${n} = ${wortZahl(n).replace(/(teen|ty)$/,"")}___`,a:n<20?"teen":"ty",t:n<20?"13 bis 19: teen.":"Zehner, also mit 0 am Ende: ty."}))},
  {id:"n_richtig",name:"Richtig geschrieben?",was:"forty oder fourty?",typ:"wahl",n:12,items:[
    [3,"tree","thre"],[8,"eigth","eihgt"],[12,"twelf","twelfe"],[13,"threeteen","thriteen"],[14,"forteen","fourten"],[15,"fiveteen","fivteen"],[18,"eightteen","eigthteen"],[19,"ninteen","ninetten"],[20,"tweny","twenteen"],[30,"threety","thrity"],[40,"fourty","fourteen"],[50,"fivety","fivty"],[80,"eightty","eigthy"],[90,"ninty","nineteen"],[100,"one hundret","one hunderd"]
   ].map(([n,...x])=>({f:`${n} = ___`,a:wortZahl(n),o:[wortZahl(n),...x],t:x.map(y=>ZTIPP[y]).find(Boolean)||"Lies jedes Wort Buchstabe für Buchstabe."}))},
  {id:"n_luecke",name:"Schreiben mit Hilfe",was:"ein paar Buchstaben stehen schon da",typ:"tippen",hilfe:true,n:10,items:[3,13,30,4,14,40,5,15,50,8,18,80,9,19,90,12,20].map(n=>({f:String(n),a:wortZahl(n)}))},
  {id:"n_wort",name:"Allein schreiben",was:"ohne Hilfe, die schwierigen öfter",typ:"tippen",n:12,schwer:["3","13","30","40","15","50","18","80","90","12"],items:[...TRIOS.flat(),10,11,100].map(n=>({f:String(n),a:n===100?"one hundred/a hundred":wortZahl(n)}))},
  {id:"n_trio",name:"Drei auf einmal",was:"3, 13 und 30 nebeneinander",typ:"tippen",n:8,items:TRIOS.map(t=>({f:t.join(" | "),a:t.map(wortZahl).join("|")}))},
  {id:"n_gross",name:"Große Zahlen",was:"21 bis 99 mit Bindestrich",typ:"tippen",n:10,items:[21,22,23,33,34,43,45,48,54,55,58,67,76,84,85,88,89,94,98,99].map(n=>({f:String(n),a:wortZahl(n)}))},
  {id:"n_hoer",name:"Zahlen hören",was:"13 oder 30? Schreib die Ziffern",typ:"tippen",hoeren:true,n:10,items:[...TRIOS.slice(0,7).flatMap(t=>[t[1],t[2]]),12,20,33,43,58,85].map(n=>({f:`Zahl ${n}`,a:String(n),sag:wortZahl(n)}))}
 ]},
// ---------- ab hier: geht erst auf, wenn die Klasse im Buch so weit ist (ab = Abschnitt der Vokabelliste) ----------
{id:"can",icon:"🛹",name:"I can skate!",was:"can und can't: können und dürfen (G9)",ab:"pb",
 regeln:`<ul><li><b>can</b> heißt kann oder darf, <b>can't</b> kann nicht oder darf nicht.</li><li>can bleibt bei allen gleich, auch bei he, she, it: She <b>can</b> swim. Nie: She cans.</li><li>Danach kommt das Verb ohne to: I can <b>skate</b>. Nie: I can to skate.</li><li>Frage: can nach vorn. <b>Can</b> you swim?</li><li>Kurzantwort: <b>Yes, I can.</b> <b>No, I can't.</b></li></ul>`,ebenen:[
  {id:"c_wahl",name:"can oder can't?",was:"kann oder kann nicht",typ:"wahl",o:["can","can't"],items:[
    ["Luke ___ skate. (kann nicht)","can't"],["Holly ___ skate fast now. (kann)","can"],["I ___ swim. (kann)","can"],["Sherlock ___ play in the garden. (darf)","can"],["We ___ play computer games now. (dürfen nicht)","can't"],["Dave ___ meet Luke today. (darf nicht)","can't"],
    ["You ___ see Greenwich from the river. (könnt)","can"],["My little brother ___ read. (kann nicht)","can't"],["They ___ find the lucky charm. (können nicht)","can't"],["My sister ___ ride a bike. (kann)","can"],["You ___ use your phone in class. (darfst nicht)","can't"],["We ___ go to the park after school. (dürfen)","can"]
   ].map(([f,a])=>({f,a,t:a==="can"?"Kann oder darf: can.":"Kann nicht oder darf nicht: can't."}))},
  {id:"c_form",name:"Die richtige Form",was:"can bleibt gleich, Verb ohne to",typ:"wahl",items:[
    ["She ___ swim.","can","cans"],["He ___ play the guitar.","can","cans"],["I can ___ fast.","skate","to skate","skates"],["Luke can ___ his bike.","ride","rides","to ride"],["My dog ___ run very fast.","can","cans"],
    ["We can ___ English.","speak","to speak","speaks"],["Holly ___ sing.","can","cans"],["They can ___ the ball.","find","finds","to find"],["Jay can ___ a song.","sing","sings","to sing"],["It ___ jump very high.","can","cans"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:"can bleibt immer gleich. Danach kommt das Verb ohne to und ohne s."}))},
  {id:"c_kurz",name:"Kurzantworten",was:"Yes, I can. No, he can't.",typ:"kurz",o:["yes","no","I","you","he","she","it","we","they","can","can't"],items:[
    ["Can you skate?",JA,"yes|I|can"],["Can Luke swim?",NEIN,"no|he|can't"],["Can Holly ride a horse?",JA,"yes|she|can"],["Can you and your friend play football?",JA,"yes|we|can"],["Can the dog play in the garden?",JA,"yes|it/he|can"],
    ["Can Luke and Jamie meet today?",NEIN,"no|they|can't"],["Can I use your pen, please?",JA,"yes|you|can"],["Can your mum speak English?",JA,"yes|she|can"],["Can you sing?",NEIN,"no|I|can't"],["Can Dave come to the party?",NEIN,"no|he|can't"]
   ].map(([f,j,a])=>({f,j,a}))},
  {id:"c_frage",name:"Mach eine Frage daraus",was:"can nach vorn",typ:"bau",frage:true,items:[
    ["You can swim.","can|you|swim"],["Luke can skate.","can|Luke|skate"],["Holly can ride a horse.","can|Holly|ride|a horse"],["We can play in the garden.","can|we|play|in the garden"],
    ["They can come to the party.","can|they|come|to the party"],["Your sister can sing.","can|your sister|sing"],["I can use your ruler.","can|I|use|your ruler"],["Sherlock can find the ball.","can|Sherlock|find|the ball"]
   ].map(([d,a])=>({d,a,x:["cans"],z:"?",t:"can nach vorn, dann wer, dann das Verb."}))},
  {id:"c_de",name:"Übersetzen",was:"können und dürfen",typ:"bau",items:[
    ["Ich kann schnell skaten.","I|can|skate|fast",["can to"]],["Luke kann nicht schwimmen.","Luke|can't|swim",["cans"]],["Darf ich dein Lineal benutzen?","can|I|use|your ruler",["cans"]],["Wir dürfen hier nicht rennen.","we|can't|run|here",["not"]],
    ["Sie kann Gitarre spielen. (ein Mädchen)","she|can|play|the guitar",["cans"]],["Kannst du Englisch sprechen?","can|you|speak|English",["to speak"]],["Mein Hund darf im Garten spielen.","my dog|can|play|in the garden",["cans"]],["Sie können nicht kommen. (mehrere)","they|can't|come",["can to"]]
   ].map(([d,a,x])=>({d,a,x,z:d.endsWith("?")?"?":".",t:"können und dürfen: can. Nicht: can't. Danach das Verb ohne to."}))},
  {id:"c_fehler",name:"Finde den Fehler",was:"welcher Satz ist richtig?",typ:"wahl",breit:true,items:[
    ["She cans swim.","She can swim.","She can swims.","She can to swim."],["I can to skate.","I can skate.","I cans skate.","I can skating."],["Luke not can swim.","Luke can't swim.","Luke can't swims.","Luke cann't swim."],
    ["Can you to sing?","Can you sing?","Cans you sing?","Can you sings?"],["Can you skate? – No, I not can.","No, I can't.","No, I not.","No, I cans."],["My dog cans run fast.","My dog can run fast.","My dog can runs fast.","My dog can to run fast."]
   ].map(([w,a,...x])=>({f:"Falsch: "+w+" ___",a,o:[a,...x],t:"can bleibt gleich: kein s, kein to. Nicht heißt can't."}))}
 ]},
{id:"havegot",icon:"🎒",name:"Have you got ...?",was:"have got, has got, Fragen und Kurzantworten (G10–G12)",ab:"u2s1",
 regeln:`<ul><li><b>I, you, we, they</b>: have got. Kurz: I<b>'ve</b> got.</li><li><b>he, she, it</b> und ein Name: <b>has</b> got. Kurz: she<b>'s</b> got.</li><li>Nein: <b>haven't</b> got, <b>hasn't</b> got.</li><li>Frage: have oder has nach vorn. <b>Has</b> Luke got a dog?</li><li>Kurzantwort ohne got: <b>Yes, I have.</b> <b>No, she hasn't.</b></li></ul>`,ebenen:[
  {id:"h_hh",name:"have oder has?",was:"wer hat was?",typ:"wahl",o:["have","has"],items:[
    ["I ___ got a dog.","have"],["Luke ___ got a dog.","has"],["We ___ got a big garden.","have"],["Holly ___ got two guinea pigs.","has"],["They ___ got a new car.","have"],["The house ___ got a loft.","has"],
    ["You ___ got a nice room.","have"],["My sister ___ got a red bike.","has"],["Jay and Luke ___ got a project.","have"],["It ___ got a long tail.","has"],["Mr Swindon ___ got a tutor group.","has"],["I ___ got a new pencil case.","have"]
   ].map(([f,a])=>({f,a,t:a==="has"?"he, she, it oder ein Name: has.":"I, you, we, they und mehrere: have."}))},
  {id:"h_nicht",name:"haven't oder hasn't?",was:"wer hat etwas nicht?",typ:"wahl",o:["haven't","hasn't"],items:[
    ["I ___ got a pet.","haven't"],["Dave ___ got a ruler.","hasn't"],["We ___ got a test today.","haven't"],["She ___ got a pen.","hasn't"],["They ___ got a garden.","haven't"],["The cafeteria ___ got pizza today.","hasn't"],
    ["You ___ got a uniform.","haven't"],["Tony ___ got a cat.","hasn't"],["Luke and Jamie ___ got a cat.","haven't"],["It ___ got a name.","hasn't"]
   ].map(([f,a])=>({f,a,t:a==="hasn't"?"he, she, it oder ein Name: hasn't.":"I, you, we, they und mehrere: haven't."}))},
  {id:"h_kurz",name:"Kurzantworten",was:"Yes, I have. No, he hasn't.",typ:"kurz",o:["yes","no","I","you","he","she","it","we","they","have","has","haven't","hasn't"],items:[
    ["Have you got a dog?",JA,"yes|I|have"],["Has Luke got a sister?",JA,"yes|he|has"],["Have you got a pencil case?",NEIN,"no|I|haven't"],["Has Holly got guinea pigs?",JA,"yes|she|has"],
    ["Have Luke and Jamie got a dog?",JA,"yes|they|have"],["Has the house got a loft?",JA,"yes|it|has"],["Have you and your friend got a test today?",NEIN,"no|we|haven't"],["Has Jay got a planner?",NEIN,"no|he|hasn't"],
    ["Have your parents got a car?",JA,"yes|they|have"],["Has your mum got a job?",JA,"yes|she|has"],["Have you got a ruler?",NEIN,"no|I|haven't"],["Has the dog got a ball?",NEIN,"no|it|hasn't"]
   ].map(([f,j,a])=>({f,j,a}))},
  {id:"h_frage",name:"Mach eine Frage daraus",was:"have oder has nach vorn",typ:"bau",frage:true,items:[
    ["Luke has got a dog.","has|Luke|got|a dog"],["You have got a new pen.","have|you|got|a new pen"],["Holly has got two guinea pigs.","has|Holly|got|two guinea pigs"],["They have got a big house.","have|they|got|a big house"],
    ["Jay has got a planner.","has|Jay|got|a planner"],["The school has got a recording studio.","has|the school|got|a recording studio"],["We have got a test today.","have|we|got|a test|today"],["Your sister has got a red bike.","has|your sister|got|a red bike"]
   ].map(([d,a])=>({d,a,x:[a.startsWith("has")?"have":"has"],z:"?",t:"have oder has nach vorn, dann wer, dann got."}))},
  {id:"h_de",name:"Übersetzen",was:"englische Sätze bauen",typ:"bau",items:[
    ["Ich habe einen Hund.","I|have got|a dog",["has got"]],["Er hat eine Schwester.","he|has got|a sister",["have got"]],["Wir haben heute einen Test.","we|have got|a test|today",["has got"]],["Sie hat kein Lineal.","she|hasn't got|a ruler",["haven't got"]],
    ["Hast du einen Bleistift?","have|you|got|a pencil",["has"]],["Hat Luke ein Haustier?","has|Luke|got|a pet",["have"]],["Sie haben keinen Garten. (mehrere)","they|haven't got|a garden",["hasn't got"]],["Das Haus hat einen Dachboden.","the house|has got|a loft",["have got"]]
   ].map(([d,a,x])=>({d,a,x,z:d.endsWith("?")?"?":".",t:"I, you, we, they: have. he, she, it: has. Frage: have oder has nach vorn."}))}
 ]},
{id:"befehl",icon:"🚫",name:"Don't stare!",was:"Aufforderungen und Verbote: Sit down! Don't run! (G13)",ab:"u2s2",
 regeln:`<ul><li>Aufforderung: das Verb steht vorn, ohne to und ohne you. <b>Sit down!</b> <b>Look</b> at the board!</li><li>Verbot: <b>Don't</b> + Verb. <b>Don't stare!</b> <b>Don't run!</b></li><li>Nicht: Not run! No run! You sit down!</li><li>Höflich mit please: <b>Please</b> sit down.</li></ul>`,ebenen:[
  {id:"i_form",name:"Die richtige Form",was:"Verb vorn, Don't für nicht",typ:"wahl",items:[
    ["___ at the board!","Look","Looks","To look"],["___! It's rude.","Don't stare","Not stare","Stare not"],["___ your pencil case!","Don't forget","Not forget","Forget not"],["___ down, please.","Sit","Sits","Sitting"],
    ["___ the knife and fork.","Use","Uses","To use"],["___ in the classroom!","Don't run","No run","Not run"],["___ to the teacher.","Listen","Listens","You listen"],["___ the dog sweets!","Don't give","Not give","Give not"],
    ["___ your name in the exercise book.","Write","Writes","To write"],["___ funny pictures in your book!","Don't draw","Not draw","No draw"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:/^Don't/.test(a)?"Verbot: Don't + Verb.":"Aufforderung: nur das Verb, ganz vorn."}))},
  {id:"i_lage",name:"Was sagst du?",was:"Mach das! oder Lass das!",typ:"wahl",breit:true,items:[
    ["Dein Freund starrt einen neuen Schüler an. ___","Don't stare!","Stare!","Not stare!"],["Die Lehrerin will, dass alle zuhören. ___","Listen, please!","Don't listen!","Listens, please!"],
    ["Jemand rennt im Klassenzimmer. ___","Don't run!","Run!","No run!"],["Dein Bruder soll sich hinsetzen. ___","Sit down, please.","Don't sit down.","Sits down, please."],
    ["Dein Freund will dem Hund Süßigkeiten geben. ___","Don't give him sweets!","Give him sweets!","Not give him sweets!"],["Die Klasse soll das Bild im Buch ansehen. ___","Look at the picture.","Don't look at the picture.","Looks at the picture."],
    ["Deine Schwester soll ihr Mäppchen nicht vergessen. ___","Don't forget your pencil case!","Forget your pencil case!","You not forget your pencil case!"],["Jemand ärgert dich die ganze Zeit. ___","Stop it!","Don't stop it!","Stops it!"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:"Soll es jemand tun: Verb vorn. Soll er es lassen: Don't + Verb."}))},
  {id:"i_de",name:"Übersetzen",was:"Aufforderungen bauen",typ:"bau",items:[
    ["Starr nicht!","don't|stare",["not"],"!"],["Renn nicht!","don't|run",["no"],"!"],["Schau dir das Bild an.","look at|the picture",["looks at"],"."],["Vergiss dein Übungsheft nicht!","don't|forget|your|exercise book",["not","you"],"!"],
    ["Benutz den Löffel.","use|the spoon",["uses"],"."],["Bitte gib mir das Lineal.","please|give|me|the ruler",["gives"],"."],["Bitte setz dich.","please|sit down",["sits down"],"."],["Komm rein!","come|in",["comes"],"!"]
   ].map(([d,a,x,z])=>({d,a,x,z,t:"Kein you, kein to: das Verb vorn. Nicht: Don't."}))},
  {id:"i_fehler",name:"Finde den Fehler",was:"welcher Satz ist richtig?",typ:"wahl",breit:true,items:[
    ["Not run in the classroom!","Don't run in the classroom!","No run in the classroom!","Doesn't run in the classroom!"],["You sit down, please.","Sit down, please.","Sits down, please.","To sit down, please."],
    ["Don't to forget your planner!","Don't forget your planner!","Not forget your planner!","Don't forgets your planner!"],["Looks at the board!","Look at the board!","To look at the board!","Looking at the board!"],
    ["Stare not! It's rude.","Don't stare! It's rude.","No stare! It's rude.","Not stare! It's rude."],["Please uses a ruler.","Please use a ruler.","Please to use a ruler.","Please using a ruler."]
   ].map(([w,a,...x])=>({f:"Falsch: "+w+" ___",a,o:[a,...x],t:"Das Verb steht vorn, ohne s, ohne to. Nicht heißt Don't."}))}
 ]},
{id:"this",icon:"👉",name:"This is our table.",was:"this, that, these, those (G14)",ab:"u2s2",
 regeln:`<ul><li><b>this</b> = dies hier (nah), <b>that</b> = das dort (weiter weg).</li><li>Mehrere: <b>these</b> (nah), <b>those</b> (weiter weg).</li><li>this book → <b>these</b> books, that book → <b>those</b> books. Und is wird are.</li><li>Zwei Dinge vergleichen: zuerst this, dann that.</li><li>Oft kurz: <b>That's</b> = that is.</li></ul>`,ebenen:[
  {id:"t_wahl",name:"this, that, these oder those?",was:"nah oder weit, eins oder mehrere",typ:"wahl",o:["this","that","these","those"],items:[
    ["___ is my pencil case. (hier, eins)","this"],["___ girls over there are in my class. (dort, mehrere)","those"],["___ books here are new. (hier, mehrere)","these"],["Look at ___ dog over there! (dort, eins)","that"],
    ["___ is our table, and that's the girls' table. (hier, eins)","this"],["Are ___ your pens here? (hier, mehrere)","these"],["Who is ___ boy over there? (dort, eins)","that"],["___ burgers over there look nice. (dort, mehrere)","those"],
    ["I like ___ T-shirt here. (hier, eins)","this"],["___ chips here are cold. (hier, mehrere)","these"],["___ house over there is old. (dort, eins)","that"],["Can I have ___ sweets over there? (dort, mehrere)","those"]
   ].map(([f,a])=>({f,a,t:{this:"Hier und eins: this.",that:"Dort und eins: that.",these:"Hier und mehrere: these.",those:"Dort und mehrere: those."}[a]}))},
  {id:"t_mehr",name:"Mach mehrere daraus",was:"this → these, that → those",typ:"wahl",breit:true,items:[
    ["This book is new. → ___","These books are new.","This books are new.","Those books are new."],["That girl is nice. → ___","Those girls are nice.","That girls are nice.","These girls are nice."],
    ["This pen is red. → ___","These pens are red.","This pens are red.","These pen are red."],["That boy is from York. → ___","Those boys are from York.","Those boys is from York.","That boys are from York."],
    ["This is my friend. → ___","These are my friends.","This are my friends.","These is my friends."],["That is your bag. → ___","Those are your bags.","That are your bags.","Those is your bags."]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:"Mehrere: this wird these, that wird those. Und is wird are."}))},
  {id:"t_de",name:"Übersetzen",was:"englische Sätze bauen",typ:"bau",items:[
    ["Das hier ist unser Tisch.","this|is|our table",["that"]],["Das dort ist der Tisch der Mädchen.","that's|the girls' table",["this is"]],["Diese Bücher hier sind neu.","these books|are|new",["those books"]],
    ["Die Jungen dort sind nett.","those boys|are|nice",["these boys"]],["Wer ist das Mädchen dort?","who|is|that girl",["this girl"]],["Diese Pommes hier sind lecker.","these chips|are|nice",["this chips"]],["Ist das hier dein Füller?","is|this|your pen",["these"]]
   ].map(([d,a,x])=>({d,a,x,z:d.endsWith("?")?"?":".",t:"Nah: this, these. Weiter weg: that, those."}))}
 ]},
{id:"always",icon:"⏰",name:"I'm always busy",was:"always, usually, often, sometimes, never; Ort vor Zeit (G15, G16)",ab:"u3s1",
 regeln:`<ul><li><b>always</b> immer, <b>usually</b> meistens, <b>often</b> oft, <b>sometimes</b> manchmal, <b>never</b> nie.</li><li>Sie stehen <b>vor dem Verb</b>: I <b>often</b> play football.</li><li>Aber <b>nach</b> am, is, are: I'm <b>always</b> busy. He is <b>never</b> late.</li><li>Bei have got und can in die Mitte: She has <b>never</b> got time. They can <b>usually</b> eat at school.</li><li>Im verneinten Satz steht sometimes vorn: He <b>sometimes</b> isn't nice.</li><li>Satzbau: wer, tut, was, wo, wann. <b>Ort vor Zeit</b>: I go to Art Club on Mondays.</li><li>Zeit: <b>at</b> seven o'clock (Uhrzeit), <b>on</b> Monday (Wochentag), <b>in</b> the morning (Tageszeit).</li></ul>`,ebenen:[
  {id:"a_wort",name:"Wie oft?",was:"das richtige Wort",typ:"wahl",o:["always","usually","often","sometimes","never"],items:[
    ["immer = ___","always"],["nie = ___","never"],["oft = ___","often"],["manchmal = ___","sometimes"],["meistens = ___","usually"],["normalerweise = ___","usually"],["niemals = ___","never"],["häufig = ___","often"],["100 % = ___","always"],["0 % = ___","never"]
   ].map(([f,a])=>({f,a,t:"always 100 %, usually, often, sometimes, never 0 %."}))},
  {id:"a_platz",name:"Wohin gehört es?",was:"vor das Verb, aber nach am, is, are",typ:"wahl",breit:true,items:[
    ["I play football. + often → ___","I often play football.","I play often football.","Often I football play."],["She is late. + never → ___","She is never late.","She never is late.","Never she is late."],
    ["We have breakfast at seven. + usually → ___","We usually have breakfast at seven.","We have usually breakfast at seven.","We have breakfast usually at seven."],["I'm tired. + always → ___","I'm always tired.","I always am tired.","Always I'm tired."],
    ["They are busy. + often → ___","They are often busy.","They often are busy.","Often they busy are."],["I go to bed at nine. + never → ___","I never go to bed at nine.","I go never to bed at nine.","I go to bed never at nine."],
    ["You are early. + always → ___","You are always early.","You always are early.","Always you are early."],["We practise on Mondays. + sometimes → ___","We sometimes practise on Mondays.","We practise sometimes on Mondays.","We practise on sometimes Mondays."],
    ["Olivia has got time. + never → ___","Olivia has never got time.","Olivia never has got time.","Olivia has got never time."],["They can eat lunch at school. + usually → ___","They can usually eat lunch at school.","They usually can eat lunch at school.","They can eat usually lunch at school."],
    ["Sherlock isn't nice to cats. + sometimes → ___","Sherlock sometimes isn't nice to cats.","Sherlock isn't sometimes nice to cats.","Sherlock isn't nice sometimes to cats."]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:/ has | can /.test(a)?"Bei have got und can kommt es in die Mitte.":/ sometimes isn't/.test(a)?"Im verneinten Satz steht sometimes vorn.":"Vor das Verb. Nur bei am, is, are dahinter."}))},
  {id:"a_de",name:"Übersetzen",was:"Sätze mit always, never ...",typ:"bau",items:[
    ["Ich bin immer beschäftigt.","I'm|always|busy",["never"]],["Wir frühstücken normalerweise um sieben.","we|usually|have breakfast|at seven",["often"]],["Ich spiele oft Fußball.","I|often|play|football",["always"]],
    ["Sie sind nie müde. (mehrere)","they|are|never|tired",["is"]],["Ich gehe nie früh ins Bett.","I|never|go to bed|early",["always"]],["Wir fangen montags oft früh an.","we|often|start|early|on Mondays",["sometimes"]],["Ich übe manchmal Saxofon.","I|sometimes|practise|the saxophone",["often"]]
   ].map(([d,a,x])=>({d,a,x,z:".",t:"Wie oft steht vor dem Verb, aber hinter am, is, are."}))},
  {id:"a_zeit",name:"in, at oder on?",was:"Uhrzeit, Wochentag, Tageszeit",typ:"wahl",o:["in","at","on"],items:[
    ["___ Monday","on"],["___ seven o'clock","at"],["___ the morning","in"],["___ the evening","in"],["___ Fridays","on"],["___ half past six","at"],["___ the afternoon","in"],
    ["I get up ___ seven a.m.","at"],["We have English ___ Tuesdays.","on"],["I practise ___ the afternoon.","in"],["The test is ___ Wednesday.","on"],["Lunch is ___ quarter past twelve.","at"]
   ].map(([f,a])=>({f,a,t:{at:"Uhrzeit: at.",on:"Wochentag: on.","in":"Tageszeit: in the morning, in the afternoon, in the evening."}[a]}))},
  {id:"a_ort",name:"Ort vor Zeit",was:"wer, tut, was, wo, wann",typ:"bau",items:[
    ["Ich gehe montags zum Art Club.","I|go|to Art Club|on Mondays"],["Ich höre morgens im Bus Musik.","I|listen to|music|on the bus|in the mornings"],["Ich spiele nach der Schule Computerspiele.","I|play|computer games|after school"],
    ["Ich spiele dienstags immer Korbball.","I|always|play|netball|on Tuesdays"],["Wir frühstücken um sieben in der Küche.","we|have breakfast|in the kitchen|at seven"],["Wir spielen samstags im Park Fußball.","we|play|football|in the park|on Saturdays"],
    ["Ich mache abends meine Hausaufgaben.","I|do|my homework|in the evenings"],["Wir treffen uns nach der Schule im Park.","we|meet|in the park|after school"]
   ].map(([d,a])=>({d,a,z:".",t:"Wer, tut, was, wo, wann. Der Ort kommt vor der Zeit."}))}
 ]},
{id:"she_s",icon:"🗣️",name:"She gets on my nerves",was:"he, she, it: das s muss mit (G17)",ab:"u3s2",
 regeln:`<ul><li>I, you, we, they: <b>play</b>. he, she, it und ein Name: <b>plays</b>.</li><li>Merksatz: he, she, it, das s muss mit.</li><li>Nach s, sh, ch, x und o: <b>-es</b>. watch<b>es</b>, go<b>es</b>, do<b>es</b>.</li><li>Mitlaut + y wird <b>-ies</b>: tidy → tid<b>ies</b>. Aber play → play<b>s</b>.</li><li>have wird <b>has</b>.</li></ul>`,ebenen:[
  {id:"s_mit",name:"Mit oder ohne s?",was:"wer macht es?",typ:"wahl",items:[
    ["I ___ football. (play)","play","plays"],["Luke ___ football. (play)","plays","play"],["She ___ on my nerves. (get)","gets","get"],["We ___ breakfast at seven. (have)","have","has"],
    ["My mum ___ at the vet's surgery. (work)","works","work"],["They ___ in Greenwich. (live)","live","lives"],["Olivia ___ Lucy's room. (tidy)","tidies","tidy","tidys"],["The dog ___ at cats. (bark)","barks","bark"],
    ["You ___ the saxophone. (practise)","practise","practises"],["Jay ___ TV in the evening. (watch)","watches","watch","watchs"],["Sherlock ___ to bed at ten. (go)","goes","go","gos"],["My friends ___ in the park. (meet)","meet","meets"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:/^(I|You|We|They|My friends) /.test(f)?"I, you, we, they und mehrere: ohne s.":"he, she, it oder ein Name: das s muss mit."}))},
  {id:"s_ende",name:"s, es oder ies?",was:"die richtige Endung",typ:"wahl",items:[
    ["to watch → she ___","watches","watchs","watchies"],["to go → he ___","goes","gos","gois"],["to tidy → she ___","tidies","tidys","tidyes"],["to play → he ___","plays","plaies","playes"],
    ["to do → she ___","does","dos","dose"],["to wash → he ___","washes","washs","washies"],["to have → it ___","has","haves","have"],["to say → she ___","says","saies","sayes"],["to get → he ___","gets","getes","getts"]
   ].map(([f,a,...x])=>({f,a,o:[a,...x],t:/ies$/.test(a)?"Mitlaut + y wird ies.":/es$/.test(a)&&!/^(says)$/.test(a)?"Nach s, sh, ch, x und o: es.":a==="has"?"have wird has.":"Einfach s dran."}))},
  {id:"s_de",name:"Übersetzen",was:"Sätze mit he, she, it",typ:"bau",items:[
    ["Sie geht mir auf die Nerven.","she|gets|on my nerves",["get"]],["Luke spielt jeden Tag mit Sherlock.","Luke|plays|with Sherlock|every day",["play"]],["Meine Oma passt auf den Hund auf.","my granny|looks after|the dog",["look after"]],
    ["Er räumt nie sein Zimmer auf.","he|never|tidies|his room",["tidys"]],["Der Hund bellt oft.","the dog|often|barks",["bark"]],["Sie frühstückt um sieben.","she|has breakfast|at seven",["have breakfast"]],
    ["Jay sieht abends fern.","Jay|watches TV|in the evening",["watch TV"]],["Olivia geht um neun ins Bett.","Olivia|goes to bed|at nine",["go to bed"]]
   ].map(([d,a,x])=>({d,a,x,z:".",t:"he, she, it oder ein Name: das s muss mit."}))},
  {id:"s_fehler",name:"Finde den Fehler",was:"welcher Satz ist richtig?",typ:"wahl",breit:true,items:[
    ["She get on my nerves.","She gets on my nerves.","She getting on my nerves.","She is get on my nerves."],["My dad work at the surgery.","My dad works at the surgery.","My dad workes at the surgery.","My dad working at the surgery."],
    ["Luke tidys his room.","Luke tidies his room.","Luke tidy his room.","Luke tidyes his room."],["We plays football on Mondays.","We play football on Mondays.","We playes football on Mondays.","We is play football on Mondays."],
    ["Irina watchs TV.","Irina watches TV.","Irina watch TV.","Irina watchies TV."],["The dog have a long tail.","The dog has a long tail.","The dog haves a long tail.","The dog is have a long tail."],["He go to school by bike.","He goes to school by bike.","He gos to school by bike.","He going to school by bike."]
   ].map(([w,a,...x])=>({f:"Falsch: "+w+" ___",a,o:[a,...x],t:"he, she, it: das s muss mit. I, you, we, they: ohne s."}))}
 ]}
];
// ---------- Erklaerseiten nach dem Grammatikteil im Buch (Green Line 1, S. 160-169) ----------
// g = Nummer im Grammatikteil, s = Seite dort, l = Seiten im Lektionsteil. Kommt vor dem ersten Oeffnen eines neu freien Felds.
const TAB=(kopf,zeilen)=>`<table class="etab"><thead><tr>${kopf.map(k=>`<th>${k}</th>`).join("")}</tr></thead><tbody>${zeilen.map(z=>`<tr>${z.map(t=>`<td>${t}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const ERKL={
 can:{g:"G9",s:"160–161",l:"32–34",
  wozu:"Mit <b>can</b> sagst du, was jemand kann oder darf. Mit <b>can't</b> sagst du, was jemand nicht kann oder nicht darf.",
  teile:[["So geht's",["can und can't bleiben bei allen gleich. Auch bei he, she, it kommt kein s dran: She <b>can</b> swim.","Nach can steht das Verb in der Grundform, ohne to: I can <b>skate</b>.","Im Deutschen sagst du können oder dürfen. Im Englischen heißt beides <b>can</b>.","Frage: can kommt nach vorn. <b>Can</b> you skate?","Antwort kurz mit can oder can't: Yes, I can. No, I can't."]]],
  tab:TAB(["wer","","was"],[["I","can / can't","help you."],["You","can / can't","show me the photo."],["He, she, it","can / can't","go fast."],["We","can / can't","play computer games now."],["They","can / can't","find the lucky charm."]]),
  bsp:[["I can skate fast now.","Ich kann jetzt schnell skaten."],["Luke can't skate.","Luke kann nicht skaten."],["Sherlock can play in the garden.","Sherlock darf im Garten spielen."],["Can you skate? – No, I can't.","Kannst du skaten? – Nein."]],
  achtung:["Nie <s>She cans</s> und nie <s>I can to skate</s>.","Nur Yes oder No allein klingt unhöflich. Sag lieber: Yes, I can."],
  maus:"can heißt können und dürfen."},
 havegot:{g:"G10–G12",s:"162–164",l:"39–41",
  wozu:"Mit <b>have got</b> sagst du, dass jemand etwas hat.",
  teile:[["So geht's",["I, you, we, they: <b>have got</b>. he, she, it und ein Name: <b>has got</b>.","Beim Sprechen nimmst du die Kurzform: I<b>'ve</b> got, she<b>'s</b> got. Die Langform schreibst du, wenn es ordentlich sein soll."]],
   ["Nicht haben (G11)",["Das not kommt zwischen have und got: I <b>haven't</b> got a pen.","he, she, it: <b>hasn't</b> got. Holly hasn't got her lucky charm."]],
   ["Fragen und Kurzantworten (G12)",["Frage: have oder has nach vorn, got bleibt hinten. <b>Has</b> she got a uniform?","Kurzantwort ohne got: Yes, I have. No, she hasn't."]]],
  tab:TAB(["Langform","Kurzform","nicht"],[["I have got","I've got","I haven't got"],["you have got","you've got","you haven't got"],["he, she, it has got","he's, she's, it's got","he, she, it hasn't got"],["we, they have got","we've, they've got","we, they haven't got"]])
   +TAB(["Frage","ja","nein"],[["Have you got a pen?","Yes, I have.","No, I haven't."],["Has he got a brother?","Yes, he has.","No, he hasn't."],["Have they got a big house?","Yes, they have.","No, they haven't."]]),
  bsp:[["I've got a dog.","Ich habe einen Hund."],["She's got two guinea pigs.","Sie hat zwei Meerschweinchen."],["Holly hasn't got her lucky charm.","Holly hat ihren Glücksbringer nicht."],["Have you got a uniform? – No, I haven't.","Hast du eine Uniform? – Nein."]],
  achtung:["Vorsicht bei den Kurzformen: Nie <s>We'ven't got</s>. Richtig: We haven't got a pet.","In der Kurzantwort fehlt got: Yes, I have. Nicht: <s>Yes, I have got.</s>"],
  maus:"he, she, it: has. Alle anderen: have."},
 befehl:{g:"G13",s:"164–165",l:"43",
  wozu:"Mit dem <b>Imperativ</b> sagst du jemandem, dass er etwas tun oder lassen soll.",
  teile:[["So geht's",["Der Imperativ ist einfach die Grundform des Verbs: <b>Look</b> at this! <b>Come</b> here. <b>Be</b> polite.","Er sieht immer gleich aus, egal ob du einen oder mehrere ansprichst.","Verbot: <b>Don't</b> + Grundform. Don't forget your planner.","Mit please wird es höflich: Don't bring your phone to school, please.","Ein Ausrufezeichen brauchst du nur, wenn du aufgeregt bist oder etwas betonen willst: Give me my pen!"]]],
  tab:TAB(["Mach das!","Lass das!"],[["Sit down.","Don't sit there."],["Look at the board.","Don't look at your phone."],["Be polite.","Don't be silly!"]]),
  bsp:[["Come here.","Komm her."],["Be polite.","Sei höflich."],["Don't stare!","Starr nicht so!"],["Don't forget your planner.","Vergiss deinen Planer nicht."]],
  achtung:["Kein you und kein to davor: nicht <s>You sit down</s>, sondern Sit down.","Nicht <s>Not run!</s> oder <s>No run!</s>, sondern Don't run!"],
  maus:"Bei Verboten setzt du einfach don't davor."},
 this:{g:"G14",s:"165",l:"44",
  wozu:"Mit <b>this, that, these</b> und <b>those</b> zeigst du auf Menschen, Tiere oder Sachen.",
  teile:[["So geht's",["<b>this</b>: eins, nah bei dir (here). <b>that</b>: eins, weiter weg (over there).","Mehrere: this wird <b>these</b>, that wird <b>those</b>.","Vergleichst du zwei, sagst du zuerst this, dann that: This is Luke's tray, and that's Steve's tray.","that is wird oft kurz: <b>That's</b> the girls' table.","Die Wörter stehen allein (This is Pia.) oder vor einem Nomen (This girl is nice.)."]]],
  tab:TAB(["","eins","mehrere"],[["nah (here)","this","these"],["weiter weg (over there)","that","those"]]),
  bsp:[["This is our table.","Das ist unser Tisch."],["That's the girls' table over there.","Das dort drüben ist der Tisch der Mädchen."],["These books are new, but those books are old.","Diese Bücher sind neu, aber die dort sind alt."],["This girl is nice.","Dieses Mädchen ist nett."]],
  achtung:["Bei mehreren ändert sich auch das Verb: This <b>is</b> … wird These <b>are</b> …"],
  maus:"here: this, these. over there: that, those."},
 always:{g:"G15, G16",s:"166–168",l:"57–58",
  wozu:"Mit <b>always, usually, often, sometimes</b> und <b>never</b> sagst du, wie oft etwas passiert. Dazu lernst du, in welcher Reihenfolge ein englischer Satz gebaut ist.",
  teile:[["Wie oft? (G15)",["always (immer), usually (meistens), often (oft), sometimes (manchmal), never (nie).","Sie stehen vor dem Verb: I <b>always</b> go to school by bike.","Bei am, is, are dahinter: Olivia and Holly are <b>never</b> late.","Bei have got zwischen have und got: Olivia has <b>never</b> got time.","Bei can zwischen can und dem Verb: They can <b>usually</b> eat lunch at school.","Im verneinten Satz steht sometimes vorn: Sherlock <b>sometimes</b> isn't nice to cats."]],
   ["Satzbau (G16)",["Ein englischer Satz geht so: wer, tut, was. Danach kommen wo und wann.","<b>Ort vor Zeit</b>, wie im Alphabet O vor Z: I go to Art Club on Mondays.","Die Zeit darf auch ganz vorn stehen: On Mondays I go to Art Club. Aber nie in der Mitte."]]],
  tab:TAB(["wer","tut","was","wo","wann"],[["I","play","computer games","","after school."],["I","go","","to Art Club","on Mondays."],["I","listen to","music","on the bus","in the mornings."]]),
  bsp:[["I always have breakfast with my family.","Ich frühstücke immer mit meiner Familie."],["After breakfast we sometimes go to Greenwich Park.","Nach dem Frühstück gehen wir manchmal in den Greenwich Park."],["Olivia has never got time.","Olivia hat nie Zeit."],["I always play netball on Tuesdays.","Ich spiele dienstags immer Korbball."]],
  achtung:["Im Deutschen steht die Zeit oft in der Mitte: Ich spiele dienstags Korbball. Im Englischen nie: I play netball on Tuesdays."],
  maus:"S, V, O, das steht fast immer so: Subjekt, Verb, Objekt."},
 she_s:{g:"G17",s:"168–169",l:"60–61",
  wozu:"Das <b>simple present</b> ist die einfache Gegenwart. Du nimmst es für Dinge, die jemand regelmäßig, oft, manchmal oder nie macht, für Dinge, die immer stimmen (Cats like mice.), und wenn du eine Geschichte der Reihe nach erzählst.",
  teile:[["So geht's",["I, you, we, they: das Verb bleibt, wie es ist. I <b>play</b>.","he, she, it und ein Name: ein s kommt dran. She <b>plays</b>.","Bei go, do und Verben auf s, sh, ch, x kommt -es dran: he <b>goes</b>, she <b>watches</b>.","Mitlaut + y: y wird ie, dann s. tidy → she <b>tidies</b>. Aber play → he <b>plays</b>, weil vor dem y ein Selbstlaut steht.","have wird <b>has</b>. be hat eigene Formen: am, is, are."]]],
  tab:TAB(["wer","Verb"],[["I, you","play"],["he, she, it","plays"],["we, you, they","play"]]),
  bsp:[["My parents often work on Saturdays.","Meine Eltern arbeiten samstags oft."],["Cats like mice.","Katzen mögen Mäuse."],["Granny Rose usually comes and looks after me.","Oma Rose kommt meistens und passt auf mich auf."],["She gets on my nerves.","Sie geht mir auf die Nerven."]],
  achtung:["Das s vergisst man leicht: nicht <s>He play</s>, sondern He plays.","Nur bei he, she, it: nicht <s>We plays</s>."],
  maus:"He, she, it, das s muss mit."}
};
BEREICHE.forEach(b=>{ if(ERKL[b.id]) b.erkl=ERKL[b.id]; });
// offen, wenn die Klasse im Buch dort angekommen ist (vokabeln.js setzt BUCH)
const bOffen=b=>!b.ab||!window.BUCH||BUCH.erreicht(b.ab);
// Register aller Aufgaben; der Schluessel bleibt beim Umsortieren gleich
const ITEM={}, EBENE={};
BEREICHE.forEach(b=>b.ebenen.forEach(e=>{ e.bereich=b; EBENE[e.id]=e; e.keys=(e.items||[]).map(it=>{
  const k=`x|${e.id}|${it.bild||(it.d==="Bau eine Frage."?it.a:it.d||it.f)}`; if(ITEM[k]) console.error("doppelt",k); ITEM[k]={...it,k,e}; return k; }); }));
const gross=t=>t.charAt(0).toUpperCase()+t.slice(1);
const ANFANG=/(^|[.!?:] )$/;
function loesung(it){
  if(it.e.typ==="tippen"){ const w=it.a.split("|").map(t=>t.split("/")[0]); if(it.e.hoeren) return `${it.a} = ${it.sag}`; const z=it.f.split(" | "); return w.map((x,i)=>`${z[i]} = ${x}`).join(", "); }
  if(it.e.typ==="kurz"){ const [x,y,z]=it.a.split("|").map(t=>t.split("/")[0]); return `${gross(x)}, ${y}${z.startsWith("'")?"":" "}${z}.`; }
  if(it.e.typ==="bau") return gross(it.a.split("|").join(" "))+it.z;
  if(/^Falsch: /.test(it.f)) return it.a;
  const i=it.f.indexOf("___"), vor=it.f.slice(0,i);
  return vor+(ANFANG.test(vor)?gross(it.a):it.a)+it.f.slice(i+3);
}
// vorlesen nur Englisch: deutsche Vorsaetze und Pfeile weglassen
function englisch(it){
  if(it.e.bereich.ab){ if(it.e.breit||/^Falsch: /.test(it.f||"")) return it.a; return loesung(it).replace(/^.*(→|=) /,"").replace(/ \([a-z]+\)$/,""); } // neue Felder: nur der englische Satz
  if(it.e.typ==="tippen") return it.sag||it.a.split("|").map(t=>t.split("/")[0]).join(", "); if(it.e.bereich.id==="zahlen") return wortZahl(parseInt(it.f)); if(it.e.id==="g_sort") return ""; if(it.e.id==="g_of"||it.e.id==="w_fehler") return it.a; return loesung(it).replace(/^(Die|Das|Der) [^.]*\. /,"").replace(/(Tom|Lisa): /g,""); }

// ---------- Zustand ----------
const $ = id => document.getElementById(id);
const mischen = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
let runde=0, zimmer=[], gewaehlt=null, aufAnhieb=0, gesamt=0, ton=true, laeuft=false;
let modus="menue", durchgang=1, lauf=0, frageNr=0;
// Tabelle: serie = wie oft hintereinander richtig (3 = sitzt), frei = einmal ganz geschafft
const ZIEL=3;
let ort=null, xr=null;
let akt=null, schlange=[], geuebt=[], altBest=0;
// lern = Lernstand je Aufgabe, runden = ganze Runden je Aufgabenart, gespielt/best = je Haus, weiter = angefangene Runden
const leererStand=()=>({serie:{},frei:false,lern:{},runden:{},gespielt:{},best:{},weiter:{},geschafft:{},texte:{}});
let stand=Object.assign(leererStand(),JSON.parse(JSON.stringify(KERN.D.stand)));
const serie=id=>stand.serie[id]||0;
const sitzt=()=>ZEILEN.filter(z=>serie(z.id)>=ZIEL).length;
function merke(){ KERN.speichere("stand",stand); }

// ---------- Lernstand: was zählt wie viel ----------
// Es zählt nur der erste Versuch an einem Platz. Tabelle (Serie) und Häuser werden getrennt gezählt.
// Fehler in der allerersten Runde einer Aufgabenart: einmal richtig genügt (Kennenlernen).
// Fehler ab der zweiten Runde: zweimal hintereinander richtig. Ein neuer Fehler setzt wieder hoch.
// Richtig zählt nur, wenn noch mindestens drei verschiedene Wörter zur Wahl standen (kein Ausschluss).
const FEHLER_AB=2; // so viele ganze Runden, bis "Meine Fehler" aufgeht
const FEHLER={kurz:"Meine Fehler",typ:"fehler",bank:true,einzeln:true};
const artVon=(typ,art)=>art==="de"?"bedeutung":typ==="deutsch"?"deutsch":"person";
const ARTEN={person:["person"],deutsch:["deutsch"],voll:["person","bedeutung"]};
const rest=k=>stand.lern[k]?.rest||0;
const bereichVon=k=>k.startsWith("x|")?ITEM[k]?.e.bereich.id:"besitz";
const artKey=k=>k.startsWith("x|")?k.split("|")[1]:k.split(":")[0];
const offeneFehler=b=>Object.keys(stand.lern).filter(k=>rest(k)>0 && bereichVon(k) && (!b||bereichVon(k)===b));
const gesamtRunden=()=>Object.values(stand.gespielt).reduce((a,b)=>a+b,0);
const fehlerOffen=b=>gesamtRunden()>=FEHLER_AB && offeneFehler(b).length>0;
function buche(k,ok,zaehlt){
  const L=stand.lern[k]||(stand.lern[k]={r:0,f:0,rest:0});
  if(!ok){ L.f++; L.rest=Math.max(L.rest,(stand.runden[artKey(k)]||0)<1?1:2); }
  else if(zaehlt){ L.r++; if(L.rest) L.rest--; }
  merke();
}
function bucheRunde(){
  ARTEN[akt.typ].forEach(a=>stand.runden[a]=(stand.runden[a]||0)+1);
  stand.gespielt[runde]=(stand.gespielt[runde]||0)+1;
  altBest=stand.best[runde]||0; stand.best[runde]=Math.max(altBest,aufAnhieb);
  delete stand.weiter[runde]; merke(); KERN.log("Das "+akt.kurz,aufAnhieb,gesamt,"besitz");
}
function merkeRunde(){ stand.weiter[runde]=zimmer.map(r=>({id:r.z.id,v:r.v,p:r.plaetze.map(p=>[p.voll?1:0,p.fehler])})); merke(); }


// ---------- Ton ----------
let ac=null;
function piep(folge){
  if(!ton) return;
  try{ ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    folge.forEach(([f,t,d])=>{const o=ac.createOscillator(),g=ac.createGain();o.type="triangle";o.frequency.value=f;
      g.gain.setValueAtTime(.12,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+t+d);
      o.connect(g).connect(ac.destination);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+d);});
  }catch(e){}
}
// Aufnahmen liegen in audio/ (erzeugt mit audio_erzeugen.ps1); ohne Aufnahme spricht der Browser, falls er Englisch kann
const abspieler=new Audio();
addEventListener("pointerdown",()=>{ if(abspieler.src) return; abspieler.src="audio/hello.mp3"; abspieler.muted=true; abspieler.play().then(()=>{ if(abspieler.muted) abspieler.pause(); }).catch(()=>{}); },{once:true,capture:true});
const tonName=t=>t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
function sprich(text){
  if(!ton || !text) return;
  const name=tonName(text);
  if(window.TON?.has(name)){ abspieler.pause(); abspieler.muted=false; abspieler.src=`audio/${name}.mp3`; abspieler.play().catch(e=>{ if(e.name==="NotSupportedError") stimme(text); }); return; }
  stimme(text);
}
function stimme(text){
  if(!window.speechSynthesis) return;
  try{ const st=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));
    if(!st.length) return; // keine englische Stimme: lieber still als deutsch ausgesprochen
    const u=new SpeechSynthesisUtterance(text); u.voice=st.find(v=>/en[-_]GB/i.test(v.lang))||st[0]; u.lang=u.voice.lang; u.rate=.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}

// ---------- Hauptmenü ----------
function zeige(m){
  modus=m; document.body.dataset.modus=m; gewaehlt=null;
  $("menue").hidden=m!=="menue"; $("tafel").hidden=m!=="tabelle"; $("karte").hidden=m!=="karte"; $("schreiben").hidden=m!=="schreiben";
  document.querySelectorAll(".dach,.wand").forEach(e=>e.hidden=m!=="haus");
  $("ende").hidden=true; $("schilder").hidden=m!=="haus"&&m!=="karte";
  $("bMenue").hidden = (m==="menue" && !ort) || (m==="tabelle" && !stand.frei);
  $("bMenue").textContent = m==="menue" && ort!=="vok" && ort?.[0]!=="@" ? "Menü" : "Zurück";
  $("bTabelle").hidden = m==="tabelle" || !ort || ort==="probe" || ort==="fehler" || ort==="vok" || ort==="heute" || ort?.[0]==="@";
  $("bMenue").textContent="← "+$("bMenue").textContent;
}
function zurueck(){ if(ort?.startsWith("@erkl:")) return bereich(ort.slice(6)); if(ort==="heute") return vokMenue(); if(ort?.[0]==="@") return appZurueck(); if(ort==="vok"&&(modus!=="menue"||$("menuetitel").textContent!=="Vokabeln")) return vokMenue(); if(modus==="menue"||!ort||ort==="probe"||ort==="fehler") menue(); else bereich(ort); }
function ruhe(titel,text){
  lauf++; laeuft=false; abspieler.pause(); try{ speechSynthesis.cancel(); }catch(e){}
  zeige("menue"); sag("",""); $("runde").textContent=""; $("punkte").textContent="";
  $("menuetitel").textContent=titel; $("menuetext").textContent=text;
}
function karten(liste){
  $("spiele").className=liste.some(k=>k.i)?"kacheln":"";
  $("spiele").replaceChildren(...liste.map(k=>{ const b=document.createElement("button"); b.type="button"; b.className="spiel"; b.disabled=!!k.zu;
    b.innerHTML=`${k.i?`<span class="ic">${k.i}</span>`:""}<span class="tx"><b>${k.t}</b><small>${k.u}</small></span>${k.p?balken(...k.p):""}<span class="stand">${k.st||""}</span>`; b.onclick=k.f; return b; }));
  scrollTo(0,0);
}
const fehlerKarte=b=>({t:b?"Meine Fehler":"Alle meine Fehler",u:"nur üben, was falsch war",f:()=>starteFehler(b),zu:!fehlerOffen(b),
  st:gesamtRunden()<FEHLER_AB?`ab ${FEHLER_AB} Runden`:offeneFehler(b).length?`${offeneFehler(b).length} offen`:"nichts offen"});
function fortschrittZahl(b){
  let d=b.ebenen.filter(e=>stand.geschafft[e.id]).length, g=b.ebenen.length;
  if(b.id==="besitz"){ g+=1+RUNDEN.length; d+=(stand.frei?1:0)+RUNDEN.filter((x,n)=>stand.gespielt[n]).length; }
  return [d,g];
}
const fortschritt=b=>fortschrittZahl(b).join(" von ");
function menue(){
  ort=null; ruhe(`Hallo ${KERN.nr?sicher(kname(KERN.nr)):""}!`,""); kopf();
  const offen=BEREICHE.filter(bOffen), zu=BEREICHE.filter(b=>!bOffen(b)), neu=new Set(stand.neuFrei||[]);
  const z=offen.map(fortschrittZahl), g=z.reduce((a,x)=>a+x[0],0), v=z.reduce((a,x)=>a+x[1],0), p=stand.weiter.probe24;
  karten([...(window.vokKarte?[vokKarte()]:[]),...offen.map((b,n)=>({i:b.icon,t:b.name+(neu.has(b.id)?'<span class="neu">NEU</span>':""),u:b.was,p:z[n],st:`${z[n][0]} von ${z[n][1]}`,f:()=>bereich(b.id)})),
    ...zu.map(b=>({i:"🔒",t:b.name,u:`geht auf mit ${sicher(BUCH.abschnitt(b.ab)?.name||"")}`,zu:true,st:"noch nicht dran"})),
    {i:"🎯",...fehlerKarte(null)},
    {i:"🏆",t:"Probearbeit",u:"24 Aufgaben aus allen Bereichen, ohne Tipps",st:p?`weiter: ${p.nr} von ${p.keys.length}`:stand.gespielt.probe24?`Bestes: ${stand.best.probe24} von 24`:"",f:starteProbe}]);
  $("spiele").insertAdjacentHTML("afterbegin",`<div class="gesamt"><span>Du hast <b>${g} von ${v}</b> Grammatik-Ebenen geschafft.</span>${balken(g,v)}</div>`);
  hauptFuss();
}
// Ebene n ist offen, wenn die davor zu drei Vierteln auf Anhieb saß
const hatStimme=()=>{ if(window.TON) return true; try{ return speechSynthesis.getVoices().some(v=>/^en/i.test(v.lang)); }catch(e){ return false; } };
function ebeneZu(b,i){ if(b.ebenen[i].hoeren&&!hatStimme()) return true; return b.id==="besitz" ? !stand.frei : i>0 && !stand.geschafft[b.ebenen[i-1].id]; }
function bereich(id){
  const b=BEREICHE.find(b=>b.id===id); ort=id;
  if(stand.neuFrei?.includes(id)){ stand.neuFrei=stand.neuFrei.filter(x=>x!==id); merke(); }
  if(erklFaellig(b)){ erklGezeigt.add(id); return erklaerung(b,true); }
  const schon=b.id==="besitz"&&!stand.frei;
  ruhe(b.name, schon?"Fang mit der Tabelle an. Sitzt jedes Wort dreimal hintereinander, gehen die anderen Spiele auf.":b.id==="besitz"?"Such dir ein Spiel aus.":"Die nächste Ebene geht auf, wenn du drei Viertel auf Anhieb richtig hast.");
  const liste=[fehlerKarte(id)];
  if(b.id==="besitz") liste.unshift({t:"Die Tabelle",u:"I = my, you = your ...",st:stand.frei?"Geschafft":sitzt()?`${sitzt()} von 8 sitzen`:"",f:starteTabelle}),
    liste.push(...RUNDEN.map((x,n)=>({t:"Das "+x.kurz,u:x.was,f:()=>starte(n),zu:!stand.frei,st:stand.frei?standText(n):"noch gesperrt"})));
  liste.push(...b.ebenen.map((e,i)=>{ const zu=ebeneZu(b,i); return {t:(b.id==="besitz"?"":`${i+1}. `)+e.name,u:e.was,zu,st:e.hoeren&&!hatStimme()?"keine englische Stimme":zu?"noch gesperrt":standX(e),f:()=>starteEbene(e)}; }));
  if(b.erkl) liste.unshift({t:"📖 Erklärung",u:`aus dem Buch, ${b.erkl.g}, Seite ${b.erkl.s}`,st:stand.erklaert?.[id]?"gelesen ✓":"noch nicht gelesen",f:()=>erklaerung(b,false)});
  karten(liste);
}
// ---------- Erklaerung aus dem Buch ----------
// Kommt einmal vor dem ersten Oeffnen. "Später" schiebt sie auf morgen, "Zurück" nur bis zum naechsten Laden der Seite.
const erklGezeigt=new Set();
const erklFaellig=b=>!!b.erkl&&!stand.erklaert?.[b.id]&&stand.spaeter?.[b.id]!==KERN.heute()&&!erklGezeigt.has(b.id);
function erklaerung(b,auto,weiter){
  weiter=weiter||(()=>bereich(b.id)); const e=b.erkl;
  ruhe(b.name,`Erklärung aus dem Buch: ${e.g}, Grammatik Seite ${e.s}, geübt auf Seite ${e.l}.`); ort="@erkl:"+b.id; zeige("menue");
  const d=document.createElement("div"); d.className="einstellung erkl";
  d.innerHTML=`<section><h3>Wofür?</h3><p>${e.wozu}</p></section>`
    +e.teile.map(([h,l])=>`<section><h3>${h}</h3><ul>${l.map(x=>`<li>${x}</li>`).join("")}</ul></section>`).join("")
    +(e.tab?`<section class="tabs">${e.tab}</section>`:"")
    +`<section><h3>Beispiele</h3><p class="leise">Tipp auf einen Satz, dann hörst du ihn.</p><ul class="bsp">${e.bsp.map(([en,de])=>`<li><button type="button" data-sag="${sicher(en).replace(/"/g,"&quot;")}">🔊 ${sicher(en)}</button><span>${sicher(de)}</span></li>`).join("")}</ul></section>`
    +(e.achtung?.length?`<section class="achtung"><h3>Achtung!</h3><ul>${e.achtung.map(x=>`<li>${x}</li>`).join("")}</ul></section>`:"")
    +(e.maus?`<p class="maus">🐭 ${e.maus}</p>`:"")
    +`<div class="knoepfe"></div>`;
  d.addEventListener("click",ev=>{ const t=ev.target.closest("[data-sag]"); if(t) sprich(t.dataset.sag); });
  const k=d.querySelector(".knoepfe");
  const knopf=(t,c,f)=>{ const x=document.createElement("button"); x.type="button"; x.className=c; x.textContent=t; x.onclick=f; k.append(x); };
  const gelesen=()=>{ stand.erklaert={...(stand.erklaert||{}),[b.id]:Date.now()}; merke(); KERN.log("Erklärung: "+b.name,0,0,"erklaerung"); weiter(); };
  knopf(auto?"Verstanden, los geht's":"Verstanden","haupt",gelesen);
  if(auto) knopf("Später","neben",()=>{ stand.spaeter={...(stand.spaeter||{}),[b.id]:KERN.heute()}; merke(); weiter(); });
  $("spiele").className=""; $("spiele").replaceChildren(d); scrollTo(0,0);
}
// ---------- Grammatik von heute: kurze Runde zum aktuellen Thema, haengt an "Heute üben" ----------
// Thema = die freien Felder der Unit, in der der neueste schon erreichte Anker liegt (ab oder thema).
const HEUTE={id:"heute8",name:"Grammatik von heute"};
function themaFelder(){
  if(!window.BUCH) return [];
  const pos=BUCH.idx(BUCH.pos()), unit=id=>BUCH.abschnitt(id)?.name.split(":")[0];
  const mit=BEREICHE.filter(bOffen).map(b=>({b,i:BUCH.idx(b.ab||b.thema)})).filter(x=>x.i>=0&&x.i<=pos);
  if(!mit.length) return [];
  const neu=mit.reduce((a,x)=>x.i>a.i?x:a), u=unit(neu.b.ab||neu.b.thema);
  return mit.filter(x=>unit(x.b.ab||x.b.thema)===u).map(x=>x.b);
}
const themaKeys=()=>themaFelder().flatMap(b=>b.ebenen.filter((e,i)=>!e.hoeren&&e.typ!=="schreiben"&&e.keys.length&&!ebeneZu(b,i)).flatMap(e=>e.keys));
function starteHeute(){ const keys=themaKeys(); if(!keys.length) return vokMenue(); ort="heute"; starteX(HEUTE,()=>ziehe(keys,Math.min(8,keys.length))); }
window.grammatikHeute={
  info:()=>{ const f=themaFelder(); return {offen:stand.gTag!==KERN.heute()&&themaKeys().length>0,fertig:stand.gTag===KERN.heute(),name:f.map(b=>b.name).join(", ")}; },
  start:()=>{ const b=themaFelder().find(erklFaellig); if(b){ erklGezeigt.add(b.id); return erklaerung(b,true,starteHeute); } starteHeute(); }
};
function standX(e){
  if(e.typ==="schreiben") return stand.geschafft[e.id]?"Geschafft":Object.values(stand.texte).some(t=>t)?"angefangen":"";
  const w=stand.weiter[e.id], g=stand.gespielt[e.id];
  if(w) return `weiter: ${w.nr} von ${w.keys.length}`;
  return g?`Bestes: ${stand.best[e.id]} von ${rundenLaenge(e)}${stand.geschafft[e.id]?" ✓":""}`:"";
}
function standText(n){
  const w=stand.weiter[n], g=stand.gespielt[n];
  if(w){ const alle=w.flatMap(x=>x.p); return `weiter: ${alle.filter(p=>p[0]).length} von ${alle.length}`; }
  const rd=`${g} ${g===1?"Runde":"Runden"}`;
  return !g?"":stand.best[n]==null?`gespielt: ${rd}`:`Bestes: ${stand.best[n]} (${rd})`;
}

// ---------- Spiel: die einfache Tabelle ----------
function starteTabelle(){
  if(sitzt()===ZEILEN.length){ stand.serie={}; merke(); }
  durchgang=1; baueTabelle("Zieh jedes Wort nach links zur richtigen Person.");
}
function baueTabelle(text){
  ort="besitz"; zeige("tabelle"); runde=-1; akt=null; lauf++; laeuft=true;
  $("runde").textContent=`Die Tabelle, Durchgang ${durchgang}`;
  $("schilder").replaceChildren();
  zimmer=ZEILEN.map(z=>{
    const el=document.createElement("div"); el.className="zeile"; el.tabIndex=0; el.setAttribute("role","button"); el.setAttribute("aria-label",`${z.en} ${z.zusatz||""}`);
    el.innerHTML=`<span class="p">${z.en}${z.zusatz?`<small>${z.zusatz}</small>`:""}</span><span class="gl">=</span><span class="platz"></span><span class="serie"><i></i><i></i><i></i></span>`;
    const r={z,el,plaetze:[{el:el.querySelector(".platz"),art:"en",soll:z.wort,voll:false,fehler:0}]};
    verdrahte(r); zeigeSerie(r); return r;
  });
  $("links").replaceChildren(...zimmer.map(r=>r.el));
  $("rechts").replaceChildren(...mischen(ZEILEN.map(z=>({art:"en",text:z.wort}))).map(baueSchild));
  sag(text,""); zeigePunkte();
}
function zeigeSerie(r){ [...r.el.querySelectorAll(".serie i")].forEach((i,n)=>i.classList.toggle("an",n<serie(r.z.id)));
  r.el.querySelector(".serie").title=`${serie(r.z.id)} von ${ZIEL} Mal hintereinander richtig`; }
function tabelleFertig(){
  const offen=ZEILEN.length-sitzt();
  if(offen){ durchgang++; baueTabelle(`Nächster Durchgang. ${offen===1?"Ein Wort fehlt":offen+" Wörter fehlen"} noch: Alle drei Punkte müssen grün sein.`); return; }
  stand.frei=true; merke(); KERN.log("Die Tabelle",8,8,"besitz");
  piep([[523,0,.2],[659,.15,.2],[784,.3,.2],[1047,.45,.5]]);
  sag("",""); $("bMenue").hidden=false;
  abschluss(`<h2>Geschafft! Die Tabelle sitzt.</h2><p>Jede Zuordnung war dreimal hintereinander richtig.</p>`,
    [["Zu den anderen Spielen","haupt",()=>bereich("besitz")],["Tabelle noch einmal","neben",starteTabelle]]);
}
function abschluss(html,knoepfe){
  const e=$("ende"); e.hidden=false; e.innerHTML=html+'<div class="knoepfe"></div>';
  knoepfe.forEach(([t,c,f],i)=>{const b=document.createElement("button");b.type="button";b.className=c;b.textContent=t;b.onclick=f;e.querySelector(".knoepfe").append(b);if(!i)b.focus({preventScroll:true});});
}
function verdrahte(r){
  const setzen=e=>{ if(gewaehlt) ablegen(gewaehlt,r,e?.target?.closest?.(".platz")); else if(laeuft && !r.plaetze.every(p=>p.voll)) sag("Nimm zuerst ein Wort.",""); };
  r.el.addEventListener("click",setzen);
  r.el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();setzen();} });
}

// ---------- Runde im Haus aufbauen ----------
function fenster(typ,z,v){
  const r={z,typ,v:null,plaetze:[],el:document.createElement("div")};
  r.el.className="zimmer"; r.el.tabIndex=0; r.el.setAttribute("role","button");
  let kopf="", satz="", bild=z.id;
  if(typ==="deutsch"){
    r.v = v??Math.floor(Math.random()*DEUTSCH[z.id].length);
    const [wer,was,b]=DEUTSCH[z.id][r.v]; bild=b||bild;
    satz=`<span class="frage">${wer} <b>${was}</b></span><span class="platz" data-art="en"></span><span>${z.ding}</span>`;
    r.el.setAttribute("aria-label",`${wer} ${was}`);
  }else{
    kopf=`<span class="person">${z.en}${z.zusatz?`<small>${z.zusatz}</small>`:""}</span>`;
    satz=typ==="bedeutung" ? `<span><b>${z.wort}</b> ${z.ding} =</span><span class="platz de" data-art="de"></span>`
      : `<span class="platz" data-art="en"></span><span>${z.ding}</span>`+(typ==="voll"?`<span class="platz de" data-art="de"></span>`:"");
    r.el.setAttribute("aria-label",`${z.en} ${z.zusatz||""}`);
  }
  r.bild=bild===z.id?null:bild;
  r.el.innerHTML=`<div class="wer">${kopf}${BILD[bild]}</div><div class="satz">${satz}</div>`;
  r.plaetze=[...r.el.querySelectorAll(".platz")].map(el=>({el,art:el.dataset.art,soll:el.dataset.art==="en"?z.wort:z.kurz,voll:false,fehler:0,
    k:artVon(typ,el.dataset.art)+":"+z.id}));
  verdrahte(r);
  return r;
}
const bankEn=()=>WOERTER.map(w=>({art:"en",text:w,bleibt:true}));
function starte(n){
  ort="besitz"; zeige("haus"); runde=n; laeuft=true; $("rechts").replaceChildren();
  const R=akt=RUNDEN[n]; lauf++;
  $("runde").textContent=`Das ${R.kurz}: ${R.was}`;
  const alt=stand.weiter[n];
  sag(alt?"Hier hast du aufgehört. Mach weiter.":R.start,"");
  let plan;
  if(alt) plan=alt;
  else if(R.einzeln) plan=mischen(ZEILEN.flatMap(z=>DEUTSCH[z.id].map((d,v)=>({id:z.id,v}))));
  else plan=((R.typ==="deutsch"||R.verdeckt)?mischen(ZEILEN):ZEILEN).map(z=>({id:z.id}));
  zimmer=plan.map(x=>{
    const r=fenster(R.typ,ZEILEN.find(z=>z.id===x.id),x.v??undefined);
    (x.p||[]).forEach(([voll,fehler],i)=>{ const p=r.plaetze[i]; p.fehler=fehler; if(voll){ p.voll=true; p.el.classList.add("voll"); p.el.textContent=R.verdeckt?"✓":p.soll; } });
    if(r.plaetze.every(p=>p.voll)) r.el.classList.add("an");
    return r;
  });
  const plaetze=zimmer.flatMap(r=>r.plaetze);
  gesamt=plaetze.length; aufAnhieb=plaetze.filter(p=>p.voll&&!p.fehler).length;
  $("haus").classList.toggle("einzeln",!!R.einzeln);
  if(R.einzeln) zeigeFrage(zimmer.findIndex(r=>!r.plaetze.every(p=>p.voll))); else $("haus").replaceChildren(...zimmer.map(r=>r.el));
  let liste;
  if(R.bank) liste=bankEn();
  else{ // Schilder fuer noch leere Plaetze; "your" gibt es zweimal und ist dadurch richtig mitgezaehlt
    const leer=art=>mischen(plaetze.filter(p=>p.art===art&&!p.voll).map(p=>({art,text:p.soll})));
    liste=[...leer("en"),...leer("de")];
  }
  $("schilder").replaceChildren(...liste.map(baueSchild));
  zeigePunkte();
}

// ---------- Meine Fehler ----------
let fehlerBereich=null;
function starteFehler(b){
  fehlerBereich=b||null; ort=b||"fehler"; runde=-2; akt=FEHLER; xr=null; lauf++; $("rechts").replaceChildren();
  schlange=mischen(offeneFehler(b)); geuebt=[];
  naechsterFehler();
}
function naechsterFehler(){
  if(!schlange.length) return fehlerFertig();
  const k=schlange[0];
  laeuft=true;
  if(k.startsWith("x|")){ zeige("karte"); baueX(ITEM[k]); }
  else{
    const [art,id]=k.split(":");
    zeige("haus"); $("haus").classList.add("einzeln");
    zimmer=[fenster(art,ZEILEN.find(z=>z.id===id))];
    $("haus").replaceChildren(zimmer[0].el);
    $("schilder").replaceChildren(...(art==="bedeutung"?mischen(ZEILEN).map(z=>({art:"de",text:z.kurz,bleibt:true})):bankEn()).map(baueSchild));
  }
  $("runde").textContent="Meine Fehler";
  sag(rest(k)>1?"Diese Aufgabe noch zweimal auf Anhieb richtig, dann ist sie erledigt.":"Diese Aufgabe noch einmal auf Anhieb richtig, dann ist sie erledigt.","");
  zeigePunkte();
}
function fehlerFertig(){
  if(geuebt.length) KERN.log("Meine Fehler geübt",new Set(geuebt).size,new Set(geuebt).size,"fehler");
  laeuft=false; piep([[523,0,.2],[659,.15,.2],[784,.3,.2],[1047,.45,.5]]);
  $("schilder").hidden=true; sag("","");
  abschluss(`<h2>Alle Fehler sind erledigt.</h2><p>Geübt hast du: ${[...new Set(geuebt)].slice(0,6).join("; ")}</p>`,[["Zurück","haupt",zurueck]]);
}

// ---------- Aufgaben auf der Karte ----------
const PROBE={id:"probe24",name:"Probearbeit"};
const rundenLaenge=e=>Math.min(e.n||10,e.keys.length);
// Auswahl einer Runde: offene Fehler zuerst, dann Neues, dann der Rest
function ziehe(keys,n){
  const schwer=k=>ITEM[k].e.schwer?.includes(ITEM[k].f)?.5:0;
  const rang=k=>(rest(k)?0:stand.lern[k]?2:1)-schwer(k);
  return mischen(mischen(keys).sort((a,b)=>rang(a)-rang(b)).slice(0,n));
}
function starteEbene(e,neu){
  if(e.typ==="schreiben") return starteSchreiben(e);
  ort=e.bereich.id; starteX(e,()=>ziehe(e.keys,rundenLaenge(e)));
}
function starteProbe(){
  ort="probe"; starteX(PROBE,()=>mischen(BEREICHE.filter(bOffen).flatMap(b=>mischen(b.ebenen.filter(e=>!e.hoeren).flatMap(e=>e.keys)).slice(0,4))));
}
function starteX(e,plan){
  lauf++; runde=-3; akt=null; $("rechts").replaceChildren();
  const w=stand.weiter[e.id], gueltig=w&&w.keys.every(k=>ITEM[k])&&w.nr<w.keys.length;
  xr=gueltig?{e,...w}:{e,keys:plan(),nr:0,gut:0,f:0,schlecht:[]};
  zeige("karte"); frageX(gueltig&&(w.nr||w.f));
}
function merkeX(){ const {e,...w}=xr; stand.weiter[e.id]=w; merke(); }
function frageX(fortgesetzt){
  const it=ITEM[xr.keys[xr.nr]]; laeuft=true;
  baueX(it,xr.f);
  $("runde").textContent=`${xr.e.name} Aufgabe ${xr.nr+1} von ${xr.keys.length}`;
  sag(fortgesetzt?"Hier hast du aufgehört. Mach weiter.":{wahl:"Zieh das richtige Schild in die Lücke.",bau:"Zieh die Teile in die richtige Reihenfolge.",kurz:"Bau die Kurzantwort.",tippen:it.e.hoeren?"Hör zu und schreib die Zahl mit Ziffern. Dann Enter.":it.a.includes("|")?"Schreib alle drei Zahlen als Wort. Dann Enter.":"Schreib die Zahl als Wort. Dann Enter."}[it.e.typ],"");
  zeigePunkte();
}
const sicher=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;");
function baueX(it,fehler){
  if(it.e.typ==="tippen") return baueTippen(it,fehler);
  const el=document.createElement("div"); el.className="aufgabe"; el.tabIndex=0; el.setAttribute("role","button");
  const typ=it.e.typ, P=k=>`<span class="platz${k?" "+k:""}"></span>`;
  const jn=it.j==null?"":`<span class="janein${it.j?"":" nein"}">${it.j?"ja ✓":"nein ✗"}</span>`;
  let h="", soll=[], gr=[], tiles=[], bleibt=true;
  if(typ==="wahl"){
    const i=it.f.indexOf("___"); let vor=it.f.slice(0,i); const nach=it.f.slice(i+3);
    const gap=P(it.e.breit?"lang":it.e.id==="g_ende"?"eng":"");
    if(it.bild) h+=ORTE[it.bild];
    const fs=/^Falsch: /.test(vor);
    if(fs) h+=`<p class="auftrag">Dieser Satz ist falsch. Zieh den richtigen in das Feld.</p>`;
    if(it.e.id==="g_sort") h+=`<p class="auftrag">Gehört etwas zu diesem Wort: 's oder of?</p>`;
    if(it.e.id==="g_of") h+=`<p class="auftrag">Wie heißt das zusammen auf Englisch?</p>`;
    h+= it.e.breit ? `<p class="satzgross">${/ → $/.test(vor)?sicher(vor.slice(0,-3)):fs?`<span class="falschsatz">${sicher(vor.slice(8).trim())}</span>`:sicher(vor)}</p>${jn}<div class="reihe">${gap}</div>`
                   : `${jn}<p class="satzgross">${sicher(vor)}${gap}${sicher(nach)}</p>`;
    soll=[[it.a]]; gr=[ANFANG.test(vor)&&!fs];
    const o=it.o||it.e.o; tiles=it.o?mischen(o):o;
  }else if(typ==="kurz"){
    h=`<p class="satzgross">${sicher(it.f)}</p>${jn}<div class="reihe">${P()},${P()}${P()}.</div>`;
    soll=it.a.split("|").map(t=>t.split("/")); gr=[true,false,false]; tiles=it.e.o||KURZ;
  }else{
    const teile=it.a.split("|"); soll=teile.map(t=>[t]); gr=teile.map((t,n)=>n===0); bleibt=false;
    h=`<p class="auftrag">${it.e.id==="k_frage"||it.e.frage?"Mach eine Frage daraus:":it.d==="Bau eine Frage."?"":"Auf Englisch:"}</p><p class="satzgross">${sicher(it.d)}</p><div class="reihe">${teile.map(()=>P()).join("")}${it.z}</div>`;
    tiles=mischen([...teile,...(it.x||[])]);
  }
  el.innerHTML=h;
  const rr={x:it,z:{},el,f:fehler||0};
  rr.plaetze=[...el.querySelectorAll(".platz")].map((e,n)=>({el:e,art:"en",soll:soll[n],gross:gr[n],voll:false,fehler:0}));
  verdrahte(rr); zimmer=[rr];
  $("karte").replaceChildren(el);
  $("schilder").replaceChildren(...tiles.map(t=>{ const s={art:"en",text:t,bleibt}, b=baueSchild(s); if(it.e.breit||typ!=="wahl") b.classList.add("breit"); return b; }));
}
function baueTippen(it,fehler){
  const el=document.createElement("div"); el.className="aufgabe";
  const teile=it.a.split("|"), z=it.f.split(" | "), hoeren=it.e.hoeren;
  const feld=(n,label)=>`<input type="text" id="feld${n}" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en" aria-label="${label}"${hoeren?' inputmode="numeric"':""}>`;
  const muster=t=>`<p class="muster">${it.e.hilfe?luecken(t.split("/")[0]):""}</p>`;
  el.innerHTML=`<form>${hoeren?`<button type="button" class="hoeren">Noch einmal hören</button>${feld(0,"Zahl in Ziffern")}`
    :teile.length>1?`<div class="trio">${teile.map((t,n)=>`<span>${z[n]}</span>${feld(n,z[n]+" als Wort")}${muster(t)}`).join("")}</div>`
    :`<div style="display:grid;gap:10px;justify-items:center"><p class="zahl">${z[0]}</p>${muster(teile[0])}${feld(0,z[0]+" als Wort")}</div>`}
    <button class="pruefen" type="submit">Prüfen</button></form>`;
  const rr={x:it,z:{},el,f:fehler||0,plaetze:[]};
  const felder=[...el.querySelectorAll("input")].map((i,n)=>({i,soll:teile[n].split("/"),muster:el.querySelectorAll(".muster")[n],fehler:0,voll:false}));
  zimmer=[rr];
  el.querySelector("form").addEventListener("submit",e=>{ e.preventDefault(); pruefeTippen(rr,felder); });
  el.querySelector(".hoeren")?.addEventListener("click",()=>{ if(!ton) sag("Schalte oben den Ton an.",""); sprich(it.sag); felder[0].i.focus(); });
  $("karte").replaceChildren(el); $("schilder").replaceChildren();
  felder[0].i.focus({preventScroll:true});
  if(hoeren) setTimeout(()=>{ if(zimmer[0]===rr) sprich(it.sag); },350);
}
function pruefeTippen(r,felder){
  if(!laeuft) return;
  const offen=felder.filter(f=>!f.voll), norm=t=>t.trim().toLowerCase().replace(/\s+/g," ").replace(/\s*[-\u2010-\u2014]\s*/g,"-");
  const leer=offen.find(f=>!norm(f.i.value)); if(leer){ sag("Da fehlt noch etwas.",""); leer.i.focus(); return; }
  const falsch=[];
  offen.forEach(f=>{ if(f.soll.includes(norm(f.i.value))){ f.voll=true; f.i.readOnly=true; f.i.classList.add("gut"); f.i.classList.remove("nein"); if(f.muster) f.muster.textContent=""; } else { f.fehler++; f.i.classList.add("nein"); falsch.push(f); } });
  if(!falsch.length) return geloestX(r);
  const f=falsch[0], it=r.x, stumm=xr?.e===PROBE && akt!==FEHLER, v=norm(f.i.value), w=f.soll[0];
  fehlerX(r);
  let tipp=it.e.hoeren?(Number(v)&&Math.abs(Number(v)-Number(w))!==0&&(String(v)[0]===String(w)[0]||String(v)[0]==="1"||w[0]==="1")?"Achte auf das Ende: teen klingt lang, ty kurz.":"Hör noch einmal genau hin."):diagnose(v,w);
  if(f.fehler>=3 && f.muster) f.muster.textContent=w, tipp="Schreib das Wort richtig ab: "+w;
  else if(f.fehler>=3) tipp=`Es war ${w}: ${it.sag}.`;
  else if(f.fehler===2 && f.muster && !stumm) f.muster.textContent=luecken(w);
  sag(stumm&&f.fehler<3?"Noch nicht. Schau noch einmal hin.":(f.fehler>=3?"":"Noch nicht. ")+tipp,"schlecht");
  if(it.e.hoeren) sprich(it.sag);
  f.i.focus(); f.i.select();
}
function diagnose(v,w){
  if(ZAHL[v]) return `Das ist ${ZAHL[v]}.`;
  const roh=t=>t.replace(/[- ]/g,"");
  if(roh(v)===roh(w)) return w.includes("-")?"Zwischen Zehner und Einer gehört ein Bindestrich.":w.includes(" ")?"Das sind zwei Wörter.":"Das ist ein Wort, ohne Lücke und ohne Strich.";
  for(const k in ZTIPP) if(v.split(/[- ]/).includes(k) && w.split(/[- ]/).includes(ZMEINT[k])) return ZTIPP[k];
  let n=0; while(n<v.length&&v[n]===w[n]) n++;
  return n?`Bis hierher stimmt es: ${w.slice(0,n)}`:`Das Wort fängt mit ${w[0]} an.`;
}
function ablegenX(s,r,platz){
  const it=r.x, p=r.plaetze.find(p=>p.el===platz&&!p.voll)||r.plaetze.find(p=>!p.voll);
  if(!p) return;
  const stumm=xr?.e===PROBE && akt!==FEHLER;
  if(p.soll.includes(s.text)){
    p.voll=true; p.el.textContent=p.gross?gross(s.text):s.text; p.el.classList.add("voll"); p.el.classList.remove("nein");
    if(!s.bleibt) s.el.classList.add("weg");
    if(!r.plaetze.every(p=>p.voll)){ piep([[523,0,.12]]); sag("Passt. Weiter mit dem nächsten Teil.","gut"); return; }
    geloestX(r);
  }else{
    fehlerX(r);
    p.fehler++; p.el.classList.add("nein"); setTimeout(()=>p.el.classList.remove("nein"),1200);
    sag(stumm?"Noch nicht. Probier ein anderes Schild.":"Noch nicht. "+(it.e.typ==="kurz"?tippKurz(it,r.plaetze.indexOf(p)):it.t||""),"schlecht");
    if(p.fehler>=2 && !stumm) huepfe([...document.querySelectorAll("#schilder .wort:not(.weg)")].find(e=>p.soll.includes(e.textContent)));
  }
}
function fehlerX(r){
  r.f++; if(r.f===1) buche(r.x.k,false); if(akt!==FEHLER){ xr.f=r.f; merkeX(); }
  r.el.classList.remove("falsch"); void r.el.offsetWidth; r.el.classList.add("falsch"); setTimeout(()=>r.el.classList.remove("falsch"),500);
  piep([[220,0,.2],[175,.14,.25]]);
}
function geloestX(r){
    const it=r.x;
    laeuft=false; piep([[523,0,.15],[784,.1,.25]]);
    const sauber=!r.f; if(sauber) buche(it.k,true,true);
    sag("Richtig: "+loesung(it),"gut"); sprich(englisch(it));
    const meinLauf=lauf, warte=it.e.typ==="wahl"&&!it.e.breit?1500:2000;
    if(akt===FEHLER){ geuebt.push(sicher(loesung(it))); schlange.shift(); if(rest(it.k)) schlange.push(it.k);
      zeigePunkte(); setTimeout(()=>{ if(lauf===meinLauf) naechsterFehler(); },warte); return; }
    if(sauber) xr.gut++; else xr.schlecht.push(it.k);
    xr.nr++; xr.f=0; const fertigX=xr.nr>=xr.keys.length;
    if(fertigX) bucheX(); else merkeX();
    zeigePunkte();
    setTimeout(()=>{ if(lauf!==meinLauf) return; fertigX?abschlussX():frageX(); },warte);
}
function tippKurz(it,n){
  if(n===0) return "Schau auf ja oder nein.";
  if(n===1) return /^(Is|Are) there/.test(it.f)?"In der Frage steht there, also auch in der Antwort.":/ you and /.test(it.f)?"Du und noch jemand, das sind wir.":/^(Are|Have|Can) you/.test(it.f)?"Du wirst gefragt, also antwortest du mit ich.":/^Can I /.test(it.f)?"Jemand fragt dich, ob er darf. Du antwortest mit you.":/^(Has|Have|Can) /.test(it.f)?"Wer ist gemeint: he, she, it oder they?":"Kein there in der Frage. Wer oder was ist gemeint: he, she, it oder they?";
  if(/^Can /.test(it.f)) return it.j?"Die Antwort nimmt can wieder auf.":"Bei No: can't.";
  return it.j?"Bei Yes die lange Form. Welche Form passt zur Person?":"Bei No die Kurzform. Welche Form passt zur Person?";
}
function bucheX(){
  const id=xr.e.id; xr.alt=stand.best[id]||0;
  stand.gespielt[id]=(stand.gespielt[id]||0)+1; if(xr.e!==PROBE) stand.runden[id]=(stand.runden[id]||0)+1;
  stand.best[id]=Math.max(xr.alt,xr.gut);
  if(xr.e!==PROBE && xr.gut/xr.keys.length>=.75) stand.geschafft[id]=true;
  if(xr.e===HEUTE) stand.gTag=KERN.heute();
  delete stand.weiter[id]; merke(); KERN.log((xr.e.bereich?xr.e.bereich.name+": ":"")+xr.e.name,xr.gut,xr.keys.length,xr.e.bereich?.id||(xr.e===HEUTE?"heute":"probe"));
}
function abschlussX(){
  const g=xr.keys.length, a=xr.gut, st=sterne(a,g), e=xr.e, b=e.bereich, i=b?b.ebenen.indexOf(e):-1, next=b?.ebenen[i+1];
  piep([[523,0,.2],[659,.15,.2],[784,.3,.2],[1047,.45,.5]]);
  let text=`${a} von ${g} auf Anhieb richtig.`;
  if(xr.alt && a>xr.alt) text+=" Das ist dein neuer Rekord."; else if(xr.alt) text+=` Dein bestes Ergebnis: ${stand.best[e.id]}.`;
  const offen=next && !ebeneZu(b,i+1);
  if(next && !offen && !(next.hoeren&&!hatStimme())) text+=` Für die nächste Ebene brauchst du ${Math.ceil(g*.75)}.`;
  if(xr.schlecht.length) text+=`<br>Schau dir noch einmal an: ${xr.schlecht.slice(0,4).map(k=>sicher(loesung(ITEM[k]))).join(" · ")}`;
  if(e===PROBE && xr.schlecht.length){ const z={}; xr.schlecht.forEach(k=>{const n=ITEM[k].e.bereich.name; z[n]=(z[n]||0)+1;}); text+=`<br>Fehler nach Bereich: ${Object.entries(z).map(([n,c])=>`${n} ${c}`).join(", ")}`; }
  $("schilder").hidden=true; sag("","");
  if(e===HEUTE) return abschluss(`<h2>Grammatik für heute geschafft. <span class="sterne" aria-label="${st} von 3 Sternen">${"★".repeat(st)}${"☆".repeat(3-st)}</span></h2><p>${text}</p>`,
    [["Zurück zu den Vokabeln","haupt",()=>vokMenue()],["Zum Menü","neben",menue]]);
  const wieder=["Noch einmal","neben",()=>e===PROBE?starteProbe():starteEbene(e)], fb=b?b.id:null;
  abschluss(`<h2>${a===g?"Alles auf Anhieb richtig!":"Runde geschafft."} <span class="sterne" aria-label="${st} von 3 Sternen">${"★".repeat(st)}${"☆".repeat(3-st)}</span></h2><p>${text}</p>`,
    [...(offen?[[`Weiter: ${next.name}`,"haupt",()=>starteEbene(next)]]:[["Noch einmal","haupt",wieder[2]]]),
     ...(fehlerOffen(fb)?[[`Nur meine Fehler üben (${offeneFehler(fb).length})`,"neben",()=>starteFehler(fb)]]:[]),
     ...(offen?[wieder]:[]),["Zurück","neben",zurueck]]);
}
function huepfe(h){ if(h){ h.classList.remove("hilfe"); void h.offsetWidth; h.classList.add("hilfe"); h.addEventListener("animationend",()=>h.classList.remove("hilfe"),{once:true}); } }

// ---------- Jetzt du: eigener Text ----------
const THEMEN=["my bedroom","my living room","my kitchen","my bathroom"];
let thema=THEMEN[0], schreibEbene=null;
const saetze=t=>(t.match(/[^.!?]+[.!?]*/g)||[]).map(x=>x.trim()).filter(x=>/[a-z]/i.test(x));
const ORTSWORT=/\b(next to|in front of|behind|under|on the|on my|in the|in my)\b/i;
const PRUEFUNG=[
  ["mindestens fünf Sätze",t=>saetze(t).length>=5],
  ["mindestens einmal There is",t=>/\bthere is\b/i.test(t)],
  ["mindestens einmal There are",t=>/\bthere are\b/i.test(t)],
  ["eine Farbe",t=>/\b(red|blue|green|yellow|white|black|brown|grey|gray|pink|orange|purple)\b/i.test(t)],
  ["eine Größe (big, small)",t=>/\b(big|small|large|little|tiny|huge)\b/i.test(t)],
  ["ein Ortswort, und next immer mit to",t=>ORTSWORT.test(t)&&!/\bnext (?!to\b)/i.test(t)],
  ["jeder Satz beginnt groß und endet mit Punkt",t=>saetze(t).length>0&&saetze(t).every(x=>/^[A-Z]/.test(x)&&/[.!?]$/.test(x))],
  ["is bei einem, are bei mehreren Dingen",t=>t.trim()!==""&&!/\bthere is (two|three|four|five|six|seven|eight|nine|ten|\d+|many|some)\b/i.test(t)&&!/\bthere are (a|an|one)\b/i.test(t)],
  ["there richtig geschrieben",t=>/\bthere\b/i.test(t)&&!/\b(threre|thre|ther|thare|theres|their (is|are)|they're (is|are))\b/i.test(t)],
  ["nicht jeder Satz beginnt mit There",t=>saetze(t).length>1&&saetze(t).some(x=>!/^there\b/i.test(x))]
];
function starteSchreiben(e){
  schreibEbene=e; ort=e.bereich.id; lauf++; runde=-4; akt=null; xr=null; laeuft=false; zeige("schreiben");
  $("runde").textContent=e.name; $("punkte").textContent="";
  $("themen").replaceChildren(...THEMEN.map(t=>{ const b=document.createElement("button"); b.type="button"; b.textContent=t; b.setAttribute("aria-pressed",t===thema); b.onclick=()=>{thema=t;starteSchreiben(e);}; return b; }));
  $("auftrag").innerHTML=`Schreib fünf Sätze über <b>${thema}</b>. Sag auch, wo die Sachen sind.`;
  $("text").value=stand.texte[thema]||""; pruefeText(true); $("text").focus();
}
function pruefeText(still){
  const t=$("text").value, erg=PRUEFUNG.map(([n,f])=>[n,f(t)]), n=erg.filter(x=>x[1]).length;
  $("pruefliste").replaceChildren(...erg.map(([n,ok])=>{ const li=document.createElement("li"); li.textContent=n; if(ok) li.className="ok"; return li; }));
  $("punkte").textContent=`Geschafft: ${n} von ${erg.length}`;
  sag(n===erg.length?"Alle Punkte erfüllt. Lies den Text noch einmal laut und zeig ihn deinen Eltern.":"Der Text wird gespeichert. Die Liste prüft Grammatikpunkte, nicht jedes einzelne Wort.",n===erg.length?"gut":"");
  if(!still){ stand.texte[thema]=t; if(n===erg.length) stand.geschafft[schreibEbene.id]=true; merke(); }
}
$("text").addEventListener("input",()=>pruefeText(false));
function zeigeFrage(nr){
  frageNr=nr; $("haus").replaceChildren(zimmer[nr].el);
  $("runde").textContent=`Das ${akt.kurz}: Frage ${nr+1} von ${zimmer.length}`;
}
function zeigePunkte(){ if(modus==="tabelle"){ $("punkte").textContent=`Sitzt: ${sitzt()} von ${ZEILEN.length}`; return; }
  if(akt===FEHLER){ $("punkte").textContent=`Noch offen: ${offeneFehler(fehlerBereich).length}`; return; }
  if(modus==="karte"){ $("punkte").textContent=`Auf Anhieb richtig: ${xr.gut} von ${xr.keys.length}`; return; }
  $("punkte").textContent=`Auf Anhieb richtig: ${aufAnhieb} von ${gesamt}`; }
function sag(t,k){ $("tipp").textContent=t; $("tipp").className=k; }

// ---------- Ziehen (Maus, Finger, Stift) und Anklicken ----------
function baueSchild(s){
  const el=document.createElement("button");
  el.type="button"; el.className="wort"+(s.art==="de"?" de":""); el.textContent=s.text; s.el=el;
  el.setAttribute("aria-pressed","false");
  let start=null, geist=null, ziel=null, platz=null, gezogen=false;
  const ende=()=>{ geist?.remove(); geist=null; el.classList.remove("gezogen"); ziel?.el.classList.remove("ziel"); platz?.classList.remove("ziel"); start=null; };
  el.addEventListener("pointerdown",e=>{ if(e.button>0||!laeuft) return; const b=el.getBoundingClientRect();
    start={x:e.clientX,y:e.clientY,dx:e.clientX-b.left,dy:e.clientY-b.top}; gezogen=false; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove",e=>{
    if(!start) return;
    if(!geist){ if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<6) return;
      waehle(null); gezogen=true; geist=el.cloneNode(true); geist.classList.add("geist"); document.body.append(geist); el.classList.add("gezogen"); }
    geist.style.transform=`translate(${e.clientX-start.dx}px,${e.clientY-start.dy}px) rotate(-3deg)`;
    const treffer=document.elementFromPoint(e.clientX,e.clientY)?.closest(".zimmer,.zeile,.aufgabe");
    const neu=zimmer.find(r=>r.el===treffer)||null;
    if(neu?.x){ const pl=document.elementFromPoint(e.clientX,e.clientY)?.closest(".platz")||null;
      if(pl!==platz){ platz?.classList.remove("ziel"); platz=pl; platz?.classList.add("ziel"); } }
    if(neu!==ziel){ ziel?.el.classList.remove("ziel"); ziel=neu; ziel?.el.classList.add("ziel"); }
  });
  el.addEventListener("pointerup",()=>{ const r=ziel; const war=!!geist; const pl=platz; ende(); ziel=null; platz=null; if(war&&r) ablegen(s,r,pl); });
  el.addEventListener("pointercancel",()=>{ ende(); ziel=null; platz=null; });
  el.addEventListener("click",()=>{ if(gezogen){gezogen=false;return;} waehle(gewaehlt===s?null:s); });
  return el;
}
function waehle(s){
  if(gewaehlt){ gewaehlt.el.classList.remove("gewaehlt"); gewaehlt.el.setAttribute("aria-pressed","false"); }
  gewaehlt=s;
  if(s){ s.el.classList.add("gewaehlt"); s.el.setAttribute("aria-pressed","true"); sag(`${s.text}: Klick jetzt auf ${modus==="tabelle"?"die passende Person":modus==="karte"?"die Lücke":"das passende Fenster"}.`,""); }
}

// ---------- Prüfen ----------
function ablegen(s,r,platz){
  if(!laeuft) return;
  waehle(null);
  if(r.x) return ablegenX(s,r,platz);
  const p=r.plaetze.find(p=>p.art===s.art);
  if(!p) return;
  if(p.voll){ sag("Dieser Platz ist schon richtig besetzt.",""); return; }
  if(s.text===p.soll){
    p.voll=true; p.el.textContent=s.text; p.el.classList.add("voll");
    const zurWahl=new Set([...document.querySelectorAll("#schilder .wort:not(.weg)")].filter(e=>e.classList.contains("de")===(p.art==="de")).map(e=>e.textContent)).size;
    if(modus==="haus" && !p.fehler) buche(p.k,true,zurWahl>=3);
    if(!p.fehler) aufAnhieb++;
    if(modus==="tabelle"){ if(!p.fehler && serie(r.z.id)<ZIEL){ stand.serie[r.z.id]=serie(r.z.id)+1; merke(); } zeigeSerie(r); }
    if(!s.bleibt) s.el.classList.add("weg");
    if(r.plaetze.every(x=>x.voll)) r.el.classList.add("an");
    piep([[523,0,.15],[784,.1,.25]]);
    if(s.art==="en") sprich(modus==="tabelle"?r.z.wort:`${r.z.wort} ${r.z.ding}`);
    sag(modus==="tabelle"?`Richtig: ${r.z.en} = ${r.z.wort}`:s.art==="en"?`Richtig: ${r.z.wort} ${r.z.ding}`:`Richtig: ${r.z.wort} heißt ${r.z.de}.`,"gut");
    zeigePunkte();
    const R=akt, meinLauf=lauf;
    if(R===FEHLER){
      laeuft=false; geuebt.push(`${r.z.en} = ${r.z.wort}`); schlange.shift(); if(rest(p.k)) schlange.push(p.k);
      setTimeout(()=>{ if(lauf===meinLauf) naechsterFehler(); },1300); return;
    }
    const alle=zimmer.every(x=>x.plaetze.every(y=>y.voll));
    if(R?.verdeckt && !alle) setTimeout(()=>{ if(lauf===meinLauf && laeuft){ p.el.textContent="✓"; } },1200);
    if(R?.einzeln && !alle){ laeuft=false; setTimeout(()=>{ if(lauf!==meinLauf) return; laeuft=true; zeigeFrage(frageNr+1); sag(R.start,""); },1300); }
    if(modus==="haus") alle?bucheRunde():merkeRunde();
    if(alle){ laeuft=false; const m=modus; setTimeout(()=>{ if(modus!==m||laeuft||lauf!==meinLauf) return; m==="tabelle"?tabelleFertig():fertig(); },1300); }
  }else{
    p.fehler++;
    if(modus==="haus"){ if(p.fehler===1) buche(p.k,false); if(akt!==FEHLER) merkeRunde(); }
    if(modus==="tabelle" && serie(r.z.id)<ZIEL){ stand.serie[r.z.id]=0; merke(); zeigeSerie(r); }
    r.el.classList.remove("falsch"); void r.el.offsetWidth; r.el.classList.add("falsch");
    setTimeout(()=>r.el.classList.remove("falsch"),1200);
    piep([[220,0,.2],[175,.14,.25]]);
    sag(hinweis(s,r),"schlecht");
    if(p.fehler>=2){
      const h=[...document.querySelectorAll("#schilder .wort,#rechts .wort")].find(e=>e.textContent===p.soll && !e.classList.contains("weg") && e.classList.contains("de")===(p.art==="de"));
      huepfe(h);
    }
  }
}
function hinweis(s,r){
  const id=r.z.id, w=s.text;
  if(s.art==="de") return "Noch nicht. "+TIPP_DE[id];
  const deutsch=r.typ==="deutsch";
  if(deutsch && ((id==="they"&&w==="her")||(id==="she"&&w==="their")))
    return "ihr gibt es im Deutschen zweimal. Gehört es einem Mädchen oder mehreren Leuten?";
  if(deutsch && id==="it") return "Eine Sache ist im Englischen immer it, auch wenn es auf Deutsch der oder die heißt.";
  return "Noch nicht. "+TIPP[id];
}

// ---------- Rundenende ----------
function sterne(a,g){ return a===g?3:a/g>=.75?2:1; }
function fertig(){
  const st=sterne(aufAnhieb,gesamt);
  piep([[523,0,.2],[659,.15,.2],[784,.3,.2],[1047,.45,.5]]);
  const schwer=[...new Set(zimmer.filter(r=>r.plaetze.some(p=>p.fehler)).map(r=>`${r.z.en} → ${r.z.wort}, ${r.z.de}`))];
  if(akt.verdeckt) zimmer.forEach(x=>x.plaetze.forEach(y=>y.el.textContent=y.soll));
  const letzte=runde===RUNDEN.length-1;
  let titel=aufAnhieb===gesamt?"Alles auf Anhieb richtig!":(akt.einzeln?"Alle Fragen gelöst.":"Alle Lichter sind an.");
  let text=`${aufAnhieb} von ${gesamt} auf Anhieb richtig.`;
  if(schwer.length) text+=` Schau dir noch einmal an: ${schwer.join("; ")}.`;
  if(altBest && aufAnhieb>altBest) text+=" Das ist dein neuer Rekord."; else if(altBest) text+=` Dein bestes Ergebnis: ${stand.best[runde]}.`;
  $("schilder").hidden=true; sag("","");
  abschluss(`<h2>${titel} <span class="sterne" aria-label="${st} von 3 Sternen">${"★".repeat(st)}${"☆".repeat(3-st)}</span></h2><p>${text}</p>`,
    [letzte?["Weiter: Lückensätze","haupt",()=>starteEbene(EBENE.b_a)]:[`Weiter zu ${RUNDEN[runde+1].kurz}`,"haupt",()=>starte(runde+1)],
     ...(fehlerOffen("besitz")?[[`Nur meine Fehler üben (${offeneFehler("besitz").length})`,"neben",()=>starteFehler("besitz")]]:[]),
     ["Noch einmal","neben",()=>starte(runde)],["Zurück","neben",zurueck]]);
}

// ---------- Start ----------
$("besitzregeln").content.getElementById("tabellenzeilen").innerHTML=ZEILEN.map(z=>`<tr><td>${z.en}</td><td><b>${z.wort}</b> ${z.ding}</td><td>${z.de}</td></tr>`).join("");
const dlg=$("tabelle");
$("bTabelle").onclick=()=>{ const b=BEREICHE.find(b=>b.id===ort); if(!b) return;
  $("regeltitel").textContent=b.name;
  if(b.regeln==="tabelle") $("regeln").replaceChildren($("besitzregeln").content.cloneNode(true)); else $("regeln").innerHTML=b.regeln;
  dlg.showModal(); };
$("bMenue").onclick=zurueck;
$("bLos").onclick=()=>dlg.close();
$("bTon").onclick=()=>{ ton=!ton; $("bTon").textContent=ton?"🔊":"🔇"; $("bTon").setAttribute("aria-label",ton?"Ton ausschalten":"Ton einschalten"); if(!ton){ abspieler.pause(); try{speechSynthesis.cancel();}catch(e){} } };
try{ speechSynthesis.getVoices(); speechSynthesis.addEventListener("voiceschanged",()=>{ if(modus==="menue"&&ort==="zahlen") bereich("zahlen"); }); }catch(e){}
