document.querySelectorAll('img[data-img]').forEach(im=>{im.src=IMG[im.dataset.img]});

(()=>{
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const HEAD=new Image();HEAD.src=IMG.head;const HEADR=new Image();HEADR.src=IMG.rock;
let GW=1280,GH=720,SC=1,DPR=1;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);const w=Math.max(1,cv.clientWidth),h=Math.max(1,cv.clientHeight);cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);SC=Math.min(cv.height/720,cv.width/640);GW=cv.width/SC;GH=cv.height/SC;try{if(pl){pl.x=Math.min(GW*.28,330);pl.y=Math.min(pl.y,GH-120)}}catch(e){}}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,250));if(window.visualViewport)visualViewport.addEventListener('resize',resize);resize();
const FLOOR=()=>GH-70;
const $=id=>document.getElementById(id);
let best=0;try{best=+localStorage.getItem('cata_best')||0}catch(e){}
let pname='';try{pname=localStorage.getItem('cata_name')||''}catch(e){}
let localRank=[];try{localRank=JSON.parse(localStorage.getItem('cata_rank')||'[]')}catch(e){localRank=[]}
const ACH=[{id:'primera',i:'📚',n:'Primera clase',d:'Termina tu primera partida'},{id:'ninja',i:'🥷',n:'Ninja del papeleo',d:'Esquiva 25 papeles en una partida'},
 {id:'racha',i:'🔥',n:'Racha rockera',d:'Llega a combo x4'},{id:'rock',i:'🎸',n:'Rockstar',d:'Activa el modo rockstar'},{id:'cafe',i:'☕',n:'Cafeína docente',d:'Toma 3 cafés en una partida'},
 {id:'intocable',i:'🛡️',n:'Intocable',d:'Llega a 50 puntos sin perder vida'},{id:'concierto',i:'🎤',n:'Concierto en el salón',d:'Llega al nivel 4'},{id:'cien',i:'💯',n:'Cien en la planilla',d:'Haz 100 puntos'},
 {id:'director',i:'🏆',n:'Ni el director me para',d:'Vence al director'},{id:'veterana',i:'📝',n:'Ya califiqué todo',d:'Esquiva 200 papeles en total'},{id:'constante',i:'⭐',n:'Profe constante',d:'Juega 10 partidas'},
 {id:'carta',i:'📩',n:'Correo especial',d:'Encuentra el mensaje sorpresa'},{id:'padres',i:'📱',n:'Sobreviví a la reunión',d:'Vence la reunión de padres'},{id:'notas',i:'📊',n:'Notas cerradas',d:'Vence el cierre de notas'},{id:'solo',i:'⚡',n:'Solo de guitarra',d:'Usa el solo de guitarra'}];
let ach={},tot={games:0,dodged:0};try{ach=JSON.parse(localStorage.getItem('cata_ach')||'{}');tot=Object.assign(tot,JSON.parse(localStorage.getItem('cata_tot')||'{}'))}catch(e){}
let toasts=[];
function unlock(id){if(ach[id])return;ach[id]=Date.now();try{localStorage.setItem('cata_ach',JSON.stringify(ach))}catch(e){}const A=ACH.find(x=>x.id===id);if(!A)return;toasts.push({A,l:3.2});SFX.ach()}
function renderAch(){const got=ACH.filter(a=>ach[a.id]).length;$('anote').textContent=got+' de '+ACH.length+' logros desbloqueados';
 $('alist').innerHTML=ACH.map(a=>'<li class="'+(ach[a.id]?'on':'off')+'"><span class="ai">'+(ach[a.id]?a.i:'🔒')+'</span><span>'+esc(a.n)+'<small>'+esc(a.d)+'</small></span></li>').join('')}
function openAch(){renderAch();$('achov').hidden=false;$('aclose').focus()}
let DB=null,canWrite=true,globalRank=null,rankTab='g',lastEntry=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
(async()=>{try{if(!window.claude||!claude.use)return;const db=await claude.use('db');if(!db)return;DB=db;
 try{const u=await claude.use('user');const w=u&&u.can?await u.can('data.write'):null;if(w===false)canWrite=false}catch(e){}
 const to=setTimeout(()=>{if(globalRank===null){globalRank=[];renderRank()}},10000);
 db.collection('scores').orderBy('score','desc').limit(25).onSnapshot(snap=>{clearTimeout(to);globalRank=snap.docs.map(d=>({id:d.id,...d.data()}));renderRank()},()=>{clearTimeout(to);DB=null;renderRank()});
}catch(e){}})();
function fmtDate(ms){try{return new Date(ms).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}catch(e){return ''}}
function renderRank(){const ol=$('rlist');if(!ol)return;const g=rankTab==='g'&&DB;$('tg').setAttribute('aria-selected',rankTab==='g');$('tl').setAttribute('aria-selected',rankTab==='l');
 let list=g?(globalRank||[]):localRank;
 $('rnote').textContent=rankTab==='g'?(DB?(globalRank===null?'Cargando puntajes…':(canWrite?'Puntajes de todos los que juegan aquí.':'Puedes ver el ranking; tus puntajes se guardan en este dispositivo.')):'El ranking compartido no está disponible aquí; se muestran los puntajes de este dispositivo.'):'Tus partidas en este dispositivo.';
 if(rankTab==='g'&&!DB)list=localRank;
 ol.innerHTML=list.length?list.slice(0,25).map((r,i)=>'<li class="'+((lastEntry&&(r.id===lastEntry.id||(r.t===lastEntry.t&&r.name===lastEntry.name)))?'me':'')+'"><span class="p">'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</span><span>'+esc(r.name||'Anónimo')+'<small>'+esc((r.diff?r.diff+' · ':'')+(r.levelName||'')+' · '+fmtDate(r.t))+'</small></span><span class="s">'+(r.score|0)+'</span></li>').join(''):'<li><span></span><span>Aún no hay puntajes. ¡Juega la primera clase!</span><span></span></li>'}
function openRank(){rankTab=DB?'g':'l';renderRank();$('rank').hidden=false;$('rclose').focus()}
async function saveScore(){const entry={name:(pname||'Anónimo').slice(0,18),score,diff:D().n,level:level+1,levelName:LEVELS[level].name,dodged,maxCombo,secs:Math.round(playT),t:Date.now()};
 localRank.push(entry);localRank.sort((a,b)=>b.score-a.score);localRank=localRank.slice(0,25);try{localStorage.setItem('cata_rank',JSON.stringify(localRank))}catch(e){}
 lastEntry=entry;let pos=localRank.indexOf(entry)+1;
 if(DB&&canWrite&&score>0){try{const ref=await DB.collection('scores').add(entry);lastEntry={...entry,id:ref.id};}catch(e){if(e&&e.code==='invalid_argument')canWrite=false}}
 if(DB&&globalRank&&canWrite){const all=[...globalRank.filter(r=>r.id!==(lastEntry&&lastEntry.id)),entry].sort((a,b)=>b.score-a.score);pos=all.indexOf(entry)+1}
 $('sp').textContent=pos?('#'+pos):'–';renderRank()}
$('name').value=pname;
const DIFF={facil:{n:'Fácil',lives:5,spd:.8,gap:45,haz:1.45,shot:1.4,boss:15,grav:1450,d:'5 vidas, más lento, más espacio y jefes de 15 s'},normal:{n:'Normal',lives:3,spd:1,gap:0,haz:1,shot:1,boss:20,grav:1650,d:'3 vidas y jefes de 20 s: la clase de siempre'},rock:{n:'Rockero',lives:3,spd:1.2,gap:-18,haz:.75,shot:.8,boss:25,grav:1800,d:'Más rápido, menos espacio y jefes de 25 s'}};
let diff='normal';try{const sd=localStorage.getItem('cata_diff');if(DIFF[sd])diff=sd}catch(e){}
const D=()=>DIFF[diff];
function renderDiff(){document.querySelectorAll('.diff').forEach(b=>{const on=b.dataset.d===diff;b.setAttribute('aria-selected',String(on));b.setAttribute('aria-checked',String(on))});$('ddesc').textContent=D().d}
document.querySelectorAll('.diff').forEach(b=>b.addEventListener('click',()=>{diff=b.dataset.d;try{localStorage.setItem('cata_diff',diff)}catch(e){}renderDiff();SFX.point()}));
renderDiff();
$('bestm').textContent=best?('Tu mejor puntaje: '+best):'';
// ---------- audio ----------
let AC=null,MASTER=null,MUS=null,SFXG=null,DIST=null,muted=false,musicOn=true,nextBeat=0,step=0,songNow='';
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(AC.destination);
 MASTER=AC.createGain();MASTER.gain.value=.9;MASTER.connect(comp);MUS=AC.createGain();MUS.gain.value=1.15;MUS.connect(MASTER);SFXG=AC.createGain();SFXG.gain.value=1;SFXG.connect(MASTER);
 DIST=AC.createWaveShaper();const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;c[i]=Math.tanh(x*6)}DIST.curve=c;const dg=AC.createGain();dg.gain.value=.5;DIST.connect(dg).connect(MUS);const sb=AC.createBuffer(1,1,22050),ss=AC.createBufferSource();ss.buffer=sb;ss.connect(AC.destination);ss.start(0)}catch(e){}}
 if(AC&&AC.state==='suspended')AC.resume();return AC}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function tone(f,d,type='square',v=.12,when=0,slide=0,dest){const a=ac();if(!a||muted)return;const t=a.currentTime+Math.max(0,when),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(dest||SFXG);o.start(t);o.stop(t+d+.03)}
function noise(d,v=.15,when=0,hp=800,dest){const a=ac();if(!a||muted)return;const t=a.currentTime+Math.max(0,when),b=a.createBuffer(1,Math.ceil(a.sampleRate*d),a.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='highpass';f.frequency.value=hp;s.buffer=b;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f).connect(g).connect(dest||SFXG);s.start(t)}
function kick(w,v=.5){tone(190,.16,'sine',v,w,.45,MUS);tone(130,.05,'square',v*.25,w,.5,MUS);noise(.02,v*.3,w,2500,MUS)}function snare(w,v=.18){noise(.14,v,w,1400,MUS);tone(200,.08,'triangle',v*.5,w,.6,MUS)}function hat(w,v=.05){noise(.035,v*1.8,w,6000,MUS)}
const SFX={flap:()=>{noise(.07,.05,0,2500);tone(420,.1,'triangle',.07,0,1.7)},point:()=>tone(880,.1,'square',.05),dodge:()=>{tone(660,.07,'square',.05);tone(990,.11,'square',.05,.06)},
hit:()=>{tone(160,.32,'sawtooth',.2,0,.4);noise(.25,.14,0,300)},pick:()=>[784,988,1319].forEach((f,i)=>tone(f,.12,'square',.06,i*.05)),
coffee:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.14,'triangle',.09,i*.06)),rock:()=>{[82,123,165].forEach(f=>tone(f,1,'sawtooth',.08,0,0,DIST||undefined));noise(.4,.08,0,1500)},
level:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.16,'square',.05,i*.07)),over:()=>[392,330,262,196].forEach((f,i)=>tone(f,.3,'triangle',.11,i*.2)),
beep:(hi)=>tone(hi?1320:660,hi?.35:.14,'square',.07),shield:()=>{tone(1200,.25,'sine',.08,0,.5);noise(.2,.06,0,3000)},
siren:()=>{for(let i=0;i<3;i++){tone(520,.35,'sawtooth',.06,i*.7,1.8);tone(936,.35,'sawtooth',.06,i*.7+.35,.55)}},
shoot:()=>{noise(.12,.06,0,2000);tone(300,.12,'triangle',.05,0,.6)},
ach:()=>[784,1047,1319,1568,2093].forEach((f,i)=>tone(f,.18,'square',.05,i*.06)),
win:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,.22,'square',.07,i*.11));[131,196,262].forEach(f=>tone(f,1.2,'sawtooth',.05,.77,0,DIST||undefined))}};
const SONGS={
 class:{bpm:126,ch:[[60,64,67],[55,59,62],[57,60,64],[53,57,60]],mel:[72,-1,74,76,-1,79,76,74, 74,-1,71,74,-1,79,74,71, 72,76,-1,79,81,79,76,-1, 77,-1,76,74,72,-1,69,72]},
 rock:{bpm:150,ch:[[52,59,64],[55,62,67],[57,64,69],[55,62,67]],mel:[76,-1,79,-1,81,79,76,-1, 79,-1,83,-1,81,79,76,74, 76,-1,79,81,83,-1,81,79, 76,-1,74,-1,76,-1,-1,-1]},
 boss:{bpm:168,ch:[[57,60,64],[53,57,60],[52,56,59],[52,56,59]],mel:[81,80,81,76,72,76,69,-1, 77,76,77,72,69,72,65,-1, 76,75,76,71,68,71,64,-1, 76,77,79,80,81,-1,80,-1]}};
function music(){const a=AC;if(!a||muted||!musicOn||state!=='play'||count>0)return;
 const key=boss?'boss':(level>=3||rock>0)?'rock':'class';if(key!==songNow){songNow=key;step=0;nextBeat=Math.max(nextBeat,a.currentTime+.05)}
 const S=SONGS[key],E=60/S.bpm/2;
 while(nextBeat<a.currentTime+.2){const w=nextBeat-a.currentTime,st=step%8,bar=Math.floor(step/8)%4,c=S.ch[bar];
  if(key==='class'){if(st%2===0)tone(mtof(c[0]-12+(st%4?12:0)),E*1.6,'square',.07,w,0,MUS);tone(mtof(c[st%3]),E*.9,'triangle',.07,w,0,MUS);
   if(st===0||st===4)kick(w,.4);if(st===2||st===6)snare(w,.12);hat(w,.03)}
  else if(key==='rock'){tone(mtof(c[0]-12),E*.9,'sawtooth',.09,w,0,MUS);if(st===0||st===3||st===6){tone(mtof(c[0]-12),E*2.6,'sawtooth',.1,w,0,DIST);tone(mtof(c[1]-12),E*2.6,'sawtooth',.1,w,0,DIST)}
   if(st===0||st===3||st===4)kick(w,.55);if(st===2||st===6)snare(w,.2);hat(w,.05)}
  else {tone(mtof(c[0]-12),E*.8,'sawtooth',.09,w,0,MUS);tone(mtof(c[step%3]+12),E*.6,'square',.05,w,0,MUS);if(st%2===0)kick(w,.55);if(st===2||st===6)snare(w,.22);hat(w,.06);if(st===7)noise(.1,.05,w,4000,MUS)}
  const m=S.mel[step%32];if(m>0)tone(mtof(m),E*1.7,key==='class'?'square':'sawtooth',key==='class'?.1:.07,w,0,key==='rock'?DIST:MUS);
  step++;nextBeat+=E}}
// ---------- world ----------
const BOOKC=['#C0392B','#2E6FB7','#E2A21B','#3B8C5A','#8E44AD','#D35400','#16A085','#B03A5B','#5B6C8F'];
const TITLES=['Matemáticas','Ciencias','Historia','Lenguaje','Inglés','Geografía','Física','Química','Arte','Música','Ética','Biología'];
let rngS=1;const rnd=()=>{rngS=(rngS*16807)%2147483647;return (rngS-1)/2147483646};const R=(a,b)=>a+rnd()*(b-a);const pick=a=>a[Math.floor(rnd()*a.length)];
const MSG=['¡Feliz cumpleaños, profe Cata!','Tarea: esquivar el papeleo','2 + 2 = Rock','Hoy no hay examen, hay concierto','Profe del año 🤘','Silencio... ¡que suene la guitarra!'];
const LEVELS=[{at:0,name:'Lunes de clases'},{at:20,name:'Exámenes en la biblioteca'},{at:45,name:'Sala de profesores'},{at:80,name:'Festival de rock'},{at:130,name:'Leyenda del rock'}];
let slow=0,magnet=0,soloUsed=false,letterShown=false,bubble=null,bossCount=0,bossWin='';
const PHRASES=['¡Silencio!','¿Hiciste la tarea?','¡A la coordinación!','¡Eso no estaba en el examen!','¡Esto va para el observador!','¿Quién tiró eso?','Mañana hay quiz','¡Sáquese el chicle!','¡Hagan fila!','¡Nadie sale al recreo!'];
const say=(txt,l=1.6)=>{bubble={txt,l}};
let hitOnce=false,bossDone=0,boss=null,nextBoss=150,bossWarn=0,coffees=0;
let dodged=0,combo=0,maxCombo=0,playT=0,shield=false,count=0,trail=0;
let state='menu',t=0,score=0,lives=3,level=0,speed=240,dist=0,nextCol=0,hazT=2,pl,cols=[],haz=[],items=[],fx=[],floats=[],inv=0,shake=0,rock=0,banner=0,colsPassed=0;
function makeStack(h,dir){const parts=[];let y=0;while(y<h){const type=pick(['book','book','spiral','comp','binder','papers','book']);let hh=type==='papers'?R(14,26):type==='binder'?R(34,46):R(22,40);hh=Math.min(hh,h-y);if(hh<10)hh=h-y;
 parts.push({type,y,h:hh,w:R(98,124),dx:R(-8,8),c:pick(BOOKC),title:pick(TITLES),s:rnd()});y+=hh}return parts}
function addCol(){const lv=level,gap=Math.max(178,250-lv*14-colsPassed*.6)+D().gap,gy=R(150+gap/2-60,FLOOR()-gap/2-40);
 const top=Math.max(0,gy-gap/2),botY=gy+gap/2,bh=FLOOR()-botY;
 cols.push({x:GW+80,w:120,gy,gap,top:makeStack(top,1),topH:top,bot:makeStack(bh,-1),botY,passed:false});
 const r=rnd();if(r<.32){const q=rnd();let k=q<.5?'pick':q<.65?'coffee':q<.77?'apple':q<.88?'magnet':q<.96?'hourglass':'solo';if(k==='solo'&&(soloUsed||items.some(i=>i.k==='solo')))k='pick';items.push({k,x:GW+140,y:gy,ph:rnd()*6})}else if(r<.34&&rock<=0)items.push({k:'guitar',x:GW+140,y:gy,ph:0});}
function addHaz(){const lv=level,r=rnd();const y=R(80,FLOOR()-60);
 if(r<.42)haz.push({k:'sheet',x:GW+40,y0:y,y,w:46,h:58,amp:R(30,70),fr:R(1.5,3),ph:rnd()*6,vx:speed+R(40,110),rot:0,red:pick(['F','2.5','?','D'])});
 else if(r<.72){const vx=speed+R(220,330);haz.push({k:'plane',x:GW+40+vx*.9,y,y0:y,w:64,h:26,vx,vy:R(-30,30)})}
 else haz.push({k:'eraser',x:GW+40,y,w:62,h:30,vx:speed+R(120,200),vy:R(-520,-300),rot:0});
 if(lv>=2&&rnd()<.35)haz.push({k:'sheet',x:GW+110,y0:R(80,FLOOR()-60),y:0,w:46,h:58,amp:R(30,70),fr:R(1.5,3),ph:rnd()*6,vx:speed+R(40,110),rot:0,red:'F'});}
function reset(){rngS=(Date.now()%100000)+7;score=0;lives=D().lives;level=0;speed=240;dist=0;nextCol=420;hazT=2.5;cols=[];haz=[];items=[];fx=[];floats=[];inv=0;shake=0;rock=0;banner=0;colsPassed=0;dodged=0;combo=0;maxCombo=0;playT=0;shield=false;count=3;hitOnce=false;boss=null;bossDone=0;nextBoss=150;bossWarn=0;coffees=0;toasts=[];songNow='';slow=0;magnet=0;soloUsed=false;letterShown=false;bubble=null;bossCount=0;bossWin='';
 pl={x:Math.min(GW*.28,330),y:GH*.42,vy:0,r:36};}
function flap(){if(state!=='play')return;pl.vy=-560;SFX.flap();for(let i=0;i<4;i++)fx.push({k:'puff',x:pl.x-20,y:pl.y+20,vx:R(-120,-40),vy:R(20,90),l:.5,m:.5})}
function mult(){return 1+Math.min(3,Math.floor(combo/5))}
function addScore(n,x,y,label){const m=(rock>0?2:1)*mult();score+=n*m;floats.push({x,y,txt:(label?label+' ':'')+'+'+(n*m),l:1});
 const nl=LEVELS.reduce((a,L,i)=>score>=L.at?i:a,0);if(nl>level){level=nl;banner=2.4;SFX.level()}}
function hurt(){if(inv>0||rock>0)return;if(shield){shield=false;inv=1;SFX.shield();say('¡Ni lo intenten!',1.2);floats.push({x:pl.x,y:pl.y-60,txt:'¡Escudo!',l:1});for(let i=0;i<12;i++)fx.push({k:'spark',x:pl.x,y:pl.y,vx:R(-260,260),vy:R(-260,260),l:.6,m:.6});return}
 combo=0;hitOnce=true;say(pick(PHRASES));try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}lives--;inv=1.7;shake=.35;SFX.hit();for(let i=0;i<14;i++)fx.push({k:'paper',x:pl.x,y:pl.y,vx:R(-260,260),vy:R(-320,120),l:1,m:1,r:R(0,6),c:pick(['#fff','#F4F1E4','#FFE9A8'])});
 if(lives<=0)gameOver()}
function gameOver(){state='over';SFX.over();tot.games++;tot.dodged+=dodged;try{localStorage.setItem('cata_tot',JSON.stringify(tot))}catch(e){}unlock('primera');if(tot.games>=10)unlock('constante');if(tot.dodged>=200)unlock('veterana');const nb=score>best;if(nb){best=score;try{localStorage.setItem('cata_best',best)}catch(e){}}
 $('oscore').textContent=score+' puntos';$('omsg').textContent=nb&&score>0?'¡Nuevo récord! Calificación: 10 con estrellita.':score>=80?'Nivel leyenda del rock. ¡Feliz cumple, profe!':score>=30?'Buena clase. La próxima, más rock.':'El papeleo ganó esta vez. ¡Otra vez!';
 $('otitle').textContent=LEVELS[level].name;$('sd').textContent=dodged;$('sc').textContent=maxCombo;$('st').textContent=Math.round(playT)+' s';$('sp').textContent='…';
 $('omedal').textContent=score>=130?'🤘':score>=80?'🥇':score>=45?'🥈':score>=20?'🥉':'📚';saveScore();$('obest').textContent='Tu mejor puntaje: '+best;setTimeout(()=>{$('over').hidden=false;$('again').focus()},500)}
const hitRect=(cx,cy,r,x,y,w,h)=>{const nx=Math.max(x,Math.min(cx,x+w)),ny=Math.max(y,Math.min(cy,y+h));return (cx-nx)**2+(cy-ny)**2<r*r};
function solo(){soloUsed=true;unlock('solo');SFX.rock();SFX.win();say('¡Que suene el rock!',1.6);shake=.3;fx.push({k:'ring',x:pl.x,y:pl.y,vx:0,vy:0,l:.8,m:.8});
 for(const h of haz){if(h.x<GW+20){h.gone=true;addScore(2,h.x,h.y);for(let i=0;i<6;i++)fx.push({k:'paper',x:h.x,y:h.y,vx:R(-300,300),vy:R(-300,100),l:1,m:1,r:R(0,6),c:'#fff'})}}
 haz=haz.filter(h=>!h.gone);for(const c of cols){if(c.x<GW&&c.x>pl.x-60){c.gone=true;addScore(1,c.x+60,c.gy);for(let i=0;i<14;i++)fx.push({k:'paper',x:c.x+60,y:R(40,FLOOR()),vx:R(-300,300),vy:R(-300,100),l:1.2,m:1.2,r:R(0,6),c:pick(BOOKC)})}}
 cols=cols.filter(c=>!c.gone);if(boss)boss.bt+=4}
const BOSSES=[{name:'El director',win:'¡Director vencido!',ach:'director'},{name:'La reunión de padres',win:'¡Sobreviviste a la reunión!',ach:'padres'},{name:'El cierre de notas',win:'¡Notas cerradas!',ach:'notas'}];
function bossUpdate(B,wdt,pr){B.bt+=wdt;const ty=B.type;
 if(ty===2){B.x=Math.max(GW-220,GW+220-B.bt*300);B.y=110+14*Math.sin(B.bt*3)}else{B.x=Math.max(GW-180,GW+220-B.bt*300);B.y=GH*.42+170*Math.sin(B.bt*1.3)+40*Math.sin(B.bt*3.1)}
 B.shot-=wdt/D().shot;if(B.shot<=0&&B.x<GW-150){const fast=B.bt>12;B.n++;SFX.shoot();
  if(ty===0){B.shot=fast?.85:1.15;const sx=B.x-70,sy=B.y-10;const aim=(ang,sp)=>haz.push({k:'memo',x:sx,y:sy,w:58,h:40,vx:sp*Math.cos(ang),vy:sp*Math.sin(ang),rot:0});
   const base=Math.atan2(pl.y-sy,-(pl.x-sx));const p=B.n%3;if(p===0)aim(base,430+B.bt*8);else if(p===1){[-.28,0,.28].forEach(o=>aim(base+o,380))}else{[-.5,-.2,.15,.45].forEach(o=>aim(o,360))}}
  else if(ty===1){B.shot=fast?.42:.6;const k=B.n%4;const ys=k===3?[B.y-120,B.y+120]:[B.y+R(-60,60)];ys.forEach(y=>haz.push({k:'chat',x:B.x-60,y0:y,y,w:62,h:36,vx:330+B.bt*6,amp:R(20,55),fr:R(2,4),ph:rnd()*6,rot:0}))}
  else {B.shot=fast?.45:.65;const x=R(pl.x+60,GW-60);haz.push({k:'fall',x,y:-40,w:52,h:66,vx:speed*.35,vy:260+B.bt*7,rot:R(-.3,.3)})}}
 const body=ty===2?[B.x-110,B.y-60,220,120]:[B.x-80,B.y-120,170,240];if(hitRect(pl.x,pl.y,pr,...body))hurt();
 if(B.bt>=D().boss){const info=BOSSES[ty];boss=null;addScore(50,GW-260,GH*.4,info.win);unlock(info.ach);SFX.win();bossWin=info.win;banner=2.4;bossDone=2.4;for(let i=0;i<40;i++)fx.push({k:'paper',x:GW-180,y:GH*.42,vx:R(-400,200),vy:R(-400,100),l:1.6,m:1.6,r:R(0,6),c:pick(['#FF4FA3','#FFC94A','#fff','#6ED2FF'])})}}
function update(dt){t+=dt;if(state!=='play'){return}
 if(count>0){count-=dt;if(!letterShown)pl.y=GH*.42+10*Math.sin(t*4);pl.vy=0;if(count<=0){banner=2.4;SFX.beep(true);if(AC){nextBeat=AC.currentTime+.05;step=0}}else if(Math.ceil(count)!==Math.ceil(count+dt))SFX.beep(false);return}
 if(!letterShown&&score>=100){letterShown=true;state='letter';$('letter').hidden=false;$('lclose').focus();unlock('carta');SFX.ach();return}
 const wdt=slow>0?dt*.55:dt;
 playT+=dt;if(dodged>=25)unlock('ninja');if(mult()>=4)unlock('racha');if(level>=3)unlock('concierto');if(score>=100)unlock('cien');if(score>=50&&!hitOnce)unlock('intocable');if(coffees>=3)unlock('cafe');
 trail+=dt;if(trail>.03){trail=0;fx.push({k:'chalk',x:pl.x-24,y:pl.y+R(-10,10),vx:-speed*.4,vy:R(-20,20),l:.5,m:.5})}
 speed=Math.min(520,240+score*1.6)*D().spd;dist+=speed*wdt;
 pl.vy+=D().grav*dt;pl.vy=Math.min(pl.vy,900);pl.y+=pl.vy*dt;
 const pr=pl.r*.78;
 if(pl.y<pr){pl.y=pr;pl.vy=Math.max(0,pl.vy)}
 if(pl.y>FLOOR()-pr){pl.y=FLOOR()-pr;pl.vy=-520;hurt()}
 if(!boss&&bossWarn<=0){nextCol-=speed*wdt;if(nextCol<=0){addCol();nextCol=R(330,420)-level*12}
  hazT-=wdt;if(hazT<=0){addHaz();hazT=Math.max(.9,R(1.6,2.8)-level*.25)*D().haz}}
 if(!boss&&bossWarn<=0&&score>=nextBoss){bossWarn=2.6;SFX.siren();nextBoss+=150}
 if(bossWarn>0){bossWarn-=dt;if(bossWarn<=0){boss={type:bossCount%3,x:GW+220,y:GH*.42,bt:0,shot:1.6,n:0};bossCount++}}
 if(boss)bossUpdate(boss,wdt,pr);
 if(bossDone>0)bossDone-=dt;
 for(const c of cols){c.x-=speed*wdt;
  if(hitRect(pl.x,pl.y,pr,c.x,0,c.w,c.topH-4)||hitRect(pl.x,pl.y,pr,c.x,c.botY+4,c.w,FLOOR()-c.botY))hurt();
  if(!c.passed&&c.x+c.w<pl.x-pr){c.passed=true;colsPassed++;combo++;maxCombo=Math.max(maxCombo,combo);addScore(1,pl.x,pl.y-50);SFX.point()}}
 cols=cols.filter(c=>c.x>-200);
 for(const h of haz){h.x-=h.vx*wdt;
  if(h.k==='sheet'||h.k==='chat'){h.y=h.y0+h.amp*Math.sin(t*h.fr+h.ph);h.rot=(h.k==='sheet'?.4:.12)*Math.sin(t*h.fr*1.3+h.ph)}
  else if(h.k==='plane'){h.y+=h.vy*wdt}
  else if(h.k==='memo'){h.y+=h.vy*wdt;h.rot=.25*Math.sin(t*6+h.x*.01)}
  else if(h.k==='fall'){h.y+=h.vy*wdt;h.rot+=.8*wdt;if(h.y>FLOOR()+10&&!h.done&&!h.hit){h.done=true;dodged++;combo++;maxCombo=Math.max(maxCombo,combo);addScore(2,h.x,FLOOR()-30,'¡Esquivado!');SFX.dodge();h.y=GH+500}}
  else {h.vy+=900*wdt;h.y+=h.vy*wdt;h.rot+=8*wdt;if(h.y>FLOOR()-15){h.y=FLOOR()-15;h.vy*=-.55}}
  if(!h.hit&&hitRect(pl.x,pl.y,pr*.95,h.x-h.w/2,h.y-h.h/2,h.w,h.h)){h.hit=true;hurt()}
  if(!h.done&&!h.hit&&h.x+h.w/2<pl.x-pr){h.done=true;dodged++;combo++;maxCombo=Math.max(maxCombo,combo);addScore(2,pl.x,pl.y+50,'¡Esquivado!');SFX.dodge()}}
 haz=haz.filter(h=>h.x>-120&&h.y>-160&&h.y<GH+120);
 for(const it of items){it.x-=speed*wdt;
  if(magnet>0&&(it.k==='pick')){const dx=pl.x-it.x,dy=pl.y-it.y,d=Math.hypot(dx,dy);if(d<420){it.x+=dx/d*620*dt;it.y+=dy/d*620*dt}}
  const yy=it.y+8*Math.sin(t*3+it.ph);
  if(!it.got&&Math.hypot(pl.x-it.x,pl.y-yy)<pr+26){it.got=true;
   if(it.k==='pick'){addScore(5,it.x,yy,'Púa');SFX.pick()}
   else if(it.k==='coffee'){coffees++;if(lives<D().lives){lives++;floats.push({x:it.x,y:yy,txt:'+1 vida',l:1})}else addScore(3,it.x,yy,'Café');SFX.coffee()}
   else if(it.k==='apple'){shield=true;SFX.coffee();floats.push({x:it.x,y:yy,txt:'Escudo',l:1})}
   else if(it.k==='magnet'){magnet=7;SFX.pick();floats.push({x:it.x,y:yy,txt:'¡Imán!',l:1})}
   else if(it.k==='hourglass'){slow=5;SFX.shield();floats.push({x:it.x,y:yy,txt:'Cámara lenta',l:1.2})}
   else if(it.k==='solo'){solo()}
   else {rock=6;SFX.rock();unlock('rock');say('¡Que suene el rock!',1.4);floats.push({x:it.x,y:yy,txt:'¡Modo rockstar!',l:1.4})}
   for(let i=0;i<10;i++)fx.push({k:'spark',x:it.x,y:yy,vx:R(-200,200),vy:R(-200,200),l:.6,m:.6})}}
 items=items.filter(i=>i.x>-80&&!i.got);
 for(const p of fx){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='paper'){p.vy+=500*dt;p.r+=4*dt}}fx=fx.filter(p=>p.l>0);
 for(const f of floats){f.l-=dt*.9;f.y-=50*dt}floats=floats.filter(f=>f.l>0);
 if(rock>0){rock-=dt;if(Math.random()<dt*14)fx.push({k:'note',x:pl.x-30,y:pl.y,vx:R(-160,-60),vy:R(-90,-20),l:1,m:1})}
 slow=Math.max(0,slow-dt);magnet=Math.max(0,magnet-dt);if(bubble){bubble.l-=dt;if(bubble.l<=0)bubble=null}
 inv=Math.max(0,inv-dt);shake=Math.max(0,shake-dt);banner=Math.max(0,banner-dt);music()}

// ---------- drawing ----------
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function scene(){return (level>=3||rock>0||boss&&boss.type===1&&false)?'stage':['salon','biblio','sala'][Math.min(2,level)]}
const SPINE=['#9C2F2F','#2D5C8C','#B5832A','#3D7A4F','#6E3F82','#A65221','#1F6F66','#7D2E4A','#4C5A78','#C9A44A'];
function bg(){const sc=scene(),stage=sc==='stage';
 const W1={salon:['#E9DCC2','#D8C6A4'],biblio:['#C7A77A','#9E7B52'],sala:['#D7E6DE','#B7CEC3'],stage:['#2A0F3A','#120818']}[sc];
 const g=ctx.createLinearGradient(0,0,0,GH);g.addColorStop(0,W1[0]);g.addColorStop(1,W1[1]);ctx.fillStyle=g;ctx.fillRect(0,0,GW,GH);
 const off=-(dist*.25)%900;ctx.textAlign='center';
 for(let k=-1;k<GW/900+2;k++){const bx=off+k*900,idx=Math.floor((dist*.25)/900)+k,ii=((idx%97)+97)%97;
  if(sc==='salon'){
   ctx.fillStyle='#8DB7C9';rr(bx+40,110,170,210,8);ctx.fill();ctx.fillStyle='#6B8F5E';ctx.beginPath();ctx.moveTo(bx+40,280);ctx.quadraticCurveTo(bx+120,220,bx+210,270);ctx.lineTo(bx+210,320);ctx.lineTo(bx+40,320);ctx.fill();
   ctx.strokeStyle='#7A5A3A';ctx.lineWidth=10;ctx.strokeRect(bx+40,110,170,210);ctx.beginPath();ctx.moveTo(bx+125,110);ctx.lineTo(bx+125,320);ctx.moveTo(bx+40,215);ctx.lineTo(bx+210,215);ctx.stroke();
   ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#FFF6D8';ctx.beginPath();ctx.moveTo(bx+40,110);ctx.lineTo(bx+210,110);ctx.lineTo(bx+420,FLOOR());ctx.lineTo(bx+150,FLOOR());ctx.closePath();ctx.fill();ctx.restore();
   ctx.fillStyle='#6B4A2E';rr(bx+270,90,520,300,10);ctx.fill();ctx.fillStyle='#1E3A32';ctx.fillRect(bx+284,104,492,272);
   ctx.fillStyle='rgba(244,241,228,.9)';ctx.font='34px "Patrick Hand",cursive';wrap(MSG[ii%MSG.length],bx+530,190,440,40);
   ctx.strokeStyle='rgba(244,241,228,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx+330,320);ctx.quadraticCurveTo(bx+530,300,bx+730,330);ctx.stroke();
   ctx.fillStyle='#8A6A4A';ctx.fillRect(bx+284,376,492,12);ctx.fillStyle='#fff';ctx.fillRect(bx+600,370,40,8);
   if(ii%2===0){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx+850,150,36,0,7);ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.moveTo(bx+850,150);ctx.lineTo(bx+850+20*Math.cos(t),150+20*Math.sin(t));ctx.moveTo(bx+850,150);ctx.lineTo(bx+850,126);ctx.stroke()}
   else{ctx.fillStyle='#FF4FA3';rr(bx+815,95,80,110,6);ctx.fill();ctx.font='40px serif';ctx.fillText('🎸',bx+855,165)}}
  else if(sc==='biblio'){
   for(let sh=0;sh<2;sh++){const sx=bx+30+sh*440;ctx.fillStyle='#5A3A22';ctx.fillRect(sx,70,400,FLOOR()-130);ctx.fillStyle='#3E2714';ctx.fillRect(sx+12,82,376,FLOOR()-154);
    for(let row=0;row<5;row++){const y=96+row*((FLOOR()-200)/5);let x=sx+16;let j=row*7+sh*3+ii;while(x<sx+380){const w=12+((j*7)%14),h=40+((j*13)%26);ctx.fillStyle=SPINE[j%SPINE.length];ctx.fillRect(x,y+62-h,w,h);ctx.fillStyle='rgba(255,230,160,.5)';ctx.fillRect(x+2,y+62-h+8,w-4,2);x+=w+2;j++}
     ctx.fillStyle='#6E4A2C';ctx.fillRect(sx+12,y+62,376,8)}}
   ctx.fillStyle='#F4F1E4';rr(bx+340,40,220,46,8);ctx.fill();ctx.strokeStyle='#5A3A22';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#5A3A22';ctx.font='26px Bungee,Impact,sans-serif';ctx.fillText('SILENCIO',bx+450,74);
   ctx.save();ctx.globalAlpha=.18;const lg=ctx.createRadialGradient(bx+450,FLOOR()-140,10,bx+450,FLOOR()-140,260);lg.addColorStop(0,'#FFE7A0');lg.addColorStop(1,'rgba(255,231,160,0)');ctx.fillStyle=lg;ctx.fillRect(bx+190,FLOOR()-400,520,400);ctx.restore()}
  else if(sc==='sala'){
   ctx.fillStyle='#A9754A';rr(bx+60,100,330,220,8);ctx.fill();ctx.fillStyle='#C9965E';ctx.fillRect(bx+72,112,306,196);
   const notes=['Reunión 3 pm','Entregar notas','Cumple Cata 🎂','Turno de patio','¡Café gratis!','Izada de bandera'];
   for(let n=0;n<4;n++){const nx=bx+90+(n%2)*150,ny=128+Math.floor(n/2)*90;ctx.save();ctx.translate(nx+60,ny+35);ctx.rotate(((n+ii)%3-1)*.06);ctx.fillStyle=['#FFF27A','#FFB3D1','#A8E6CF','#FFD59E'][n];ctx.fillRect(-60,-35,120,70);ctx.fillStyle='#3A2A20';ctx.font='19px "Patrick Hand",cursive';ctx.fillText(notes[(n+ii)%notes.length],0,6);ctx.fillStyle='#C62828';ctx.beginPath();ctx.arc(0,-28,5,0,7);ctx.fill();ctx.restore()}
   for(let l=0;l<3;l++){const lx=bx+470+l*80;ctx.fillStyle=['#5E8DA8','#6FA28A','#8C7AA8'][l];rr(lx,150,72,FLOOR()-150,4);ctx.fill();ctx.fillStyle='rgba(0,0,0,.2)';for(let v=0;v<4;v++)ctx.fillRect(lx+16,170+v*10,40,4);ctx.fillStyle='#ddd';ctx.fillRect(lx+58,300,6,24)}
   ctx.fillStyle='#3A3A44';rr(bx+740,250,110,170,10);ctx.fill();ctx.fillStyle='#C62828';ctx.fillRect(bx+756,266,78,30);ctx.fillStyle='#fff';ctx.font='18px Bungee,sans-serif';ctx.fillText('CAFÉ',bx+795,288);
   ctx.fillStyle='#fff';ctx.fillRect(bx+780,360,30,34);ctx.fillStyle='rgba(255,255,255,.5)';for(let v=0;v<3;v++){ctx.beginPath();ctx.arc(bx+788+v*8,350-10*((t*1.5+v*.3)%1),3,0,7);ctx.fill()}}
  else {
   ctx.fillStyle='#3A2A44';ctx.fillRect(bx,40,900,16);for(let x=0;x<900;x+=40){ctx.strokeStyle='#5A4A66';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx+x,40);ctx.lineTo(bx+x+20,56);ctx.lineTo(bx+x+40,40);ctx.stroke()}
   ctx.fillStyle='#120A1A';rr(bx+220,90,460,250,10);ctx.fill();ctx.strokeStyle='#FF4FA3';ctx.lineWidth=4;ctx.stroke();
   ctx.fillStyle='rgba(255,79,163,'+(.25+.15*Math.sin(t*3))+')';ctx.fillRect(bx+232,102,436,226);
   ctx.font='44px Bungee,Impact,sans-serif';ctx.fillStyle='#FFC94A';ctx.fillText('FESTIVAL',bx+450,190);ctx.fillStyle='#F4F1E4';ctx.font='40px Bungee,Impact,sans-serif';ctx.fillText('ROCK CATA',bx+450,250);ctx.font='30px serif';ctx.fillText('🎸 🤘 🎤',bx+450,305);
   for(const sx of [bx+60,bx+720]){ctx.fillStyle='#1A1022';rr(sx,160,120,FLOOR()-160,8);ctx.fill();for(let v=0;v<3;v++){const pr2=26*(1+.06*Math.max(0,Math.sin(t*8)));ctx.fillStyle='#2E2240';ctx.beginPath();ctx.arc(sx+60,220+v*110,pr2,0,7);ctx.fill();ctx.strokeStyle='#FF4FA3';ctx.lineWidth=3;ctx.stroke()}}}}
 if(stage){ctx.save();ctx.globalCompositeOperation='lighter';[['rgba(255,79,163,.18)',.2],['rgba(110,210,255,.16)',.5],['rgba(255,201,74,.16)',.8]].forEach(([c,f],i)=>{const x=GW*f,a=Math.PI/2+.35*Math.sin(t*1.4+i*2);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x+900*Math.cos(a-.13),900*Math.sin(a-.13));ctx.lineTo(x+900*Math.cos(a+.13),900*Math.sin(a+.13));ctx.fill()});ctx.restore()}
 const o2=-(dist*.6)%260;
 for(let k=-1;k<GW/260+2;k++){const x=o2+k*260;
  if(sc==='salon'){ctx.fillStyle='#A57A4E';rr(x+20,FLOOR()-110,190,18,4);ctx.fill();ctx.fillStyle='#7E5A36';ctx.fillRect(x+34,FLOOR()-92,10,92);ctx.fillRect(x+186,FLOOR()-92,10,92)}
  else if(sc==='biblio'){ctx.fillStyle='#6E4A2C';rr(x+10,FLOOR()-96,220,16,4);ctx.fill();ctx.fillRect(x+30,FLOOR()-80,12,80);ctx.fillRect(x+198,FLOOR()-80,12,80);ctx.fillStyle='#2E6B4A';ctx.fillRect(x+110,FLOOR()-150,6,54);ctx.beginPath();ctx.moveTo(x+90,FLOOR()-150);ctx.lineTo(x+136,FLOOR()-150);ctx.lineTo(x+124,FLOOR()-172);ctx.lineTo(x+102,FLOOR()-172);ctx.fill();ctx.fillStyle='rgba(255,231,160,.35)';ctx.beginPath();ctx.moveTo(x+92,FLOOR()-150);ctx.lineTo(x+134,FLOOR()-150);ctx.lineTo(x+170,FLOOR()-96);ctx.lineTo(x+56,FLOOR()-96);ctx.fill()}
  else if(sc==='sala'){ctx.fillStyle='#8C5A6E';rr(x+20,FLOOR()-80,200,60,14);ctx.fill();ctx.fillStyle='#A86E86';rr(x+20,FLOOR()-112,200,40,14);ctx.fill();ctx.fillStyle='#6E4A5A';ctx.fillRect(x+30,FLOOR()-20,10,20);ctx.fillRect(x+200,FLOOR()-20,10,20)}
  else {const b=Math.max(0,Math.sin(t*6+k));ctx.fillStyle='#0E0814';for(let p=0;p<4;p++){const hx=x+30+p*58,hy=FLOOR()-40-14*Math.max(0,Math.sin(t*6+k+p));ctx.beginPath();ctx.arc(hx,hy,18,0,7);ctx.fill();ctx.fillRect(hx-20,hy+10,40,60);if(p%2===0){ctx.fillRect(hx+12,hy-70-10*b,8,56)}}}}
 const FC={salon:['#9C7B57','#8A6A48','#6E5236'],biblio:['#7A5636','#68472B','#4E3420'],sala:['#9FA7A3','#8B9490','#6F7A75'],stage:['#160B1C','#2B1636','#FF4FA3']}[sc];
 ctx.fillStyle=FC[0];ctx.fillRect(0,FLOOR(),GW,GH-FLOOR());ctx.fillStyle=FC[1];const o3=-(dist)%80;for(let x=o3;x<GW;x+=80)ctx.fillRect(x,FLOOR(),3,GH-FLOOR());ctx.fillStyle=FC[2];ctx.fillRect(0,FLOOR(),GW,6);
 if(slow>0){ctx.fillStyle='rgba(110,210,255,.12)';ctx.fillRect(0,0,GW,GH)}}
function wrap(s,x,y,maxw,lh){const w=s.split(' ');let line='',yy=y;for(const word of w){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxw&&line){ctx.fillText(line,x,yy);line=word;yy+=lh}else line=test}ctx.fillText(line,x,yy)}
function drawPart(p,x,y,top){const w=p.w,X=x+(120-w)/2+p.dx,h=p.h;ctx.save();
 if(p.type==='book'){ctx.fillStyle='#F3EAD3';ctx.fillRect(X+4,y+3,w-8,h-6);ctx.fillStyle=p.c;rr(X,y,w,h,3);ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(X,y+h-5,w,5);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(X,y+2,w,3);
  ctx.fillStyle='#FFE9A8';ctx.fillRect(X+10,y+h/2-1,8,2);ctx.fillRect(X+w-18,y+h/2-1,8,2);if(h>24){ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='bold 13px "Patrick Hand",sans-serif';ctx.textAlign='center';ctx.fillText(p.title,X+w/2,y+h/2+5)}}
 else if(p.type==='spiral'){ctx.fillStyle=p.c;rr(X,y,w,h,4);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(X+10,y+3,w-14,h-6);ctx.strokeStyle='#9FB8D8';ctx.lineWidth=1;for(let ly=y+8;ly<y+h-4;ly+=6){ctx.beginPath();ctx.moveTo(X+12,ly);ctx.lineTo(X+w-6,ly);ctx.stroke()}
  ctx.strokeStyle='#888';ctx.lineWidth=2;for(let ly=y+4;ly<y+h-2;ly+=7){ctx.beginPath();ctx.arc(X+6,ly,4,0,7);ctx.stroke()}}
 else if(p.type==='comp'){ctx.fillStyle='#1d1d1d';rr(X,y,w,h,3);ctx.fill();ctx.fillStyle='#e8e8e8';for(let i=0;i<14;i++){const sx=X+((p.s*997+i*37)%w),sy=y+((p.s*571+i*13)%h);ctx.fillRect(sx,sy,6,3)}ctx.fillStyle='#fff';ctx.fillRect(X+w/2-22,y+h/2-6,44,12);ctx.fillStyle='#111';ctx.fillRect(X,y,8,h)}
 else if(p.type==='binder'){ctx.fillStyle=p.c;rr(X,y,w,h,6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(X+w/2-20,y+h/2-8,40,16);ctx.fillStyle='#ccc';ctx.beginPath();ctx.arc(X+w-14,y+h/2,6,0,7);ctx.fill()}
 else {for(let i=0;i<h;i+=4){ctx.fillStyle=i%8?'#FFFFFF':'#F2EEDF';ctx.fillRect(X+((i*7)%9)-4,y+i,w,4)}ctx.fillStyle='#D33';ctx.fillRect(X+w-30,y+2,20,3)}
 ctx.strokeStyle='rgba(26,15,30,.55)';ctx.lineWidth=2;ctx.strokeRect(X,y,w,h);ctx.restore()}
const MOTES=Array.from({length:40},(_,i)=>({x:(i*137)%1280,y:(i*251)%600+40,s:1+(i%3),p:i}));
function motes(){ctx.save();ctx.fillStyle=(level>=3||rock>0)?'rgba(255,200,255,.45)':'rgba(255,255,255,.55)';for(const m of MOTES){const x=((m.x-dist*.15)%GW+GW)%GW,y=m.y+12*Math.sin(t*.7+m.p);ctx.beginPath();ctx.arc(x,y,m.s,0,7);ctx.fill()}ctx.restore()}
function drawCol(c){for(const p of c.top)drawPart(p,c.x,c.topH-p.y-p.h,true);for(const p of c.bot)drawPart(p,c.x,FLOOR()-p.y-p.h,false);
 if(c.topH>30){ctx.fillStyle='#E2D2B0';ctx.fillRect(c.x+56,0,8,Math.max(0,c.topH-c.top.reduce((a,p)=>a+p.h,0)))}}
function drawHaz(h){if(h.k==='plane'&&h.x>GW+20){ctx.save();const a=.6+.4*Math.sin(t*12);ctx.globalAlpha=a;ctx.fillStyle='#FF4FA3';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(GW-16,h.y);ctx.lineTo(GW-58,h.y-24);ctx.lineTo(GW-58,h.y+24);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='26px Bungee,sans-serif';ctx.textAlign='center';ctx.fillText('!',GW-44,h.y+10);ctx.restore();return}
 ctx.save();ctx.translate(h.x,h.y);
 if(h.k==='sheet'){ctx.rotate(h.rot);ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(-20,-26,46,58);ctx.fillStyle='#fff';ctx.fillRect(-23,-29,46,58);ctx.strokeStyle='#A9C1E0';ctx.lineWidth=1.5;for(let y=-18;y<26;y+=7){ctx.beginPath();ctx.moveTo(-18,y);ctx.lineTo(18,y);ctx.stroke()}
  ctx.strokeStyle='#E57373';ctx.beginPath();ctx.moveTo(-14,-29);ctx.lineTo(-14,29);ctx.stroke();ctx.fillStyle='#D32F2F';ctx.font='bold 20px "Patrick Hand",sans-serif';ctx.textAlign='center';ctx.fillText(h.red,8,-8);ctx.strokeStyle='#D32F2F';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(8,-14,13,0,7);ctx.stroke()}
 else if(h.k==='plane'){ctx.rotate(Math.atan2(h.vy,-h.vx)+Math.PI);ctx.fillStyle='#fff';ctx.strokeStyle='#557';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(30,-14);ctx.lineTo(16,0);ctx.lineTo(30,14);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(16,0);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(36,-6);ctx.lineTo(70,-6);ctx.moveTo(36,6);ctx.lineTo(60,6);ctx.stroke()}
 else if(h.k==='chat'){ctx.rotate(h.rot);ctx.fillStyle='rgba(0,0,0,.2)';rr(-28,-15,62,36,14);ctx.fill();ctx.fillStyle='#5BD27A';rr(-31,-18,62,36,14);ctx.fill();ctx.beginPath();ctx.moveTo(18,14);ctx.lineTo(30,24);ctx.lineTo(10,16);ctx.fill();
  ctx.strokeStyle='#1A0F1E';ctx.lineWidth=2;rr(-31,-18,62,36,14);ctx.stroke();ctx.fillStyle='#fff';for(let d=0;d<3;d++){ctx.beginPath();ctx.arc(-12+d*12,0,4+1.5*Math.max(0,Math.sin(t*8-d)),0,7);ctx.fill()}}
 else if(h.k==='fall'){ctx.rotate(h.rot);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-23,-30,52,66);ctx.fillStyle='#fff';ctx.fillRect(-26,-33,52,66);ctx.fillStyle='#2E7D32';ctx.fillRect(-26,-33,52,10);ctx.strokeStyle='#9BB8A0';ctx.lineWidth=1;
  for(let y=-23;y<33;y+=8){ctx.beginPath();ctx.moveTo(-26,y);ctx.lineTo(26,y);ctx.stroke()}for(let x=-12;x<26;x+=13){ctx.beginPath();ctx.moveTo(x,-23);ctx.lineTo(x,33);ctx.stroke()}ctx.strokeStyle='#1A0F1E';ctx.lineWidth=2;ctx.strokeRect(-26,-33,52,66)}
 else if(h.k==='memo'){ctx.rotate(h.rot);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-26,-17,58,40);ctx.fillStyle='#FFF7E0';ctx.fillRect(-29,-20,58,40);ctx.fillStyle='#C62828';ctx.fillRect(-29,-20,58,9);
  ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('CIRCULAR',0,-12);ctx.fillStyle='#9AA';for(let y=-4;y<16;y+=5)ctx.fillRect(-22,y,44,2);ctx.strokeStyle='#1A0F1E';ctx.lineWidth=2;ctx.strokeRect(-29,-20,58,40)}
 else {ctx.rotate(h.rot);ctx.fillStyle='#6D4C33';rr(-31,-15,62,18,4);ctx.fill();ctx.fillStyle='#3D3D52';rr(-31,1,62,14,3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(-28,10,56,5)}
 ctx.restore()}
function drawItem(it){const y=it.y+8*Math.sin(t*3+it.ph);ctx.save();ctx.translate(it.x,y);ctx.fillStyle='rgba(255,201,74,.25)';ctx.beginPath();ctx.arc(0,0,30+3*Math.sin(t*4),0,7);ctx.fill();
 if(it.k==='pick'){ctx.rotate(.3*Math.sin(t*2));ctx.fillStyle='#FF4FA3';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-17,-16);ctx.quadraticCurveTo(0,-26,17,-16);ctx.quadraticCurveTo(18,4,0,22);ctx.quadraticCurveTo(-18,4,-17,-16);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 13px Bungee,sans-serif';ctx.textAlign='center';ctx.fillText('+5',0,4)}
 else{ctx.font=(it.k==='guitar'?'44px':'38px')+' serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({guitar:'🎸',apple:'🍎',coffee:'☕',magnet:'🧲',hourglass:'⏳',solo:'⚡'}[it.k]||'⭐',0,2)}
 ctx.restore()}
function drawBoss(){if(!boss)return;if(boss.type===1)drawPhone();else if(boss.type===2)drawPrinter();else drawDirector();bossBar()}
function drawPhone(){const B=boss;ctx.save();ctx.translate(B.x,B.y);ctx.rotate(.08*Math.sin(t*2));ctx.fillStyle='#1A1A22';rr(-80,-130,160,260,26);ctx.fill();ctx.strokeStyle='#FF4FA3';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#E9F5EC';rr(-68,-110,136,210,12);ctx.fill();
 ctx.fillStyle='#2E7D5B';ctx.fillRect(-68,-110,136,30);ctx.fillStyle='#fff';ctx.font='15px Bungee,sans-serif';ctx.textAlign='center';ctx.fillText('PADRES 5°B',0,-89);
 for(let i=0;i<5;i++){const y=-70+i*34-((t*40)%34),me=i%2;ctx.fillStyle=me?'#C9F2D2':'#fff';rr(me?-10:-60,y,70,24,8);ctx.fill();ctx.fillStyle='#9AA';ctx.fillRect(me?-2:-52,y+10,50,4)}
 ctx.fillStyle='#C62828';ctx.beginPath();ctx.arc(64,-122,22,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='18px Bungee,sans-serif';ctx.fillText(String(99),64,-115);ctx.restore()}
function drawPrinter(){const B=boss;ctx.save();ctx.translate(B.x,B.y);ctx.fillStyle='#D9D9DE';rr(-110,-50,220,100,16);ctx.fill();ctx.strokeStyle='#1A0F1E';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#A9A9B2';ctx.fillRect(-90,32,180,14);
 ctx.fillStyle='#fff';const pp=(t*2)%1;ctx.fillRect(-60,40,120,20+pp*20);ctx.fillStyle='#2E7D32';ctx.fillRect(-60,40+pp*20,120,6);ctx.fillStyle=Math.sin(t*6)>0?'#5BD27A':'#2E7D32';ctx.beginPath();ctx.arc(80,-20,8,0,7);ctx.fill();
 ctx.fillStyle='#1A0F1E';ctx.font='16px Bungee,sans-serif';ctx.textAlign='center';ctx.fillText('NOTAS',-20,-12);ctx.restore()}
function bossBar(){const B=boss,hp=Math.max(0,1-B.bt/D().boss),bw=Math.min(520,GW*.6);ctx.save();ctx.fillStyle='rgba(26,15,30,.75)';rr(GW/2-bw/2-6,14,bw+12,44,12);ctx.fill();ctx.fillStyle='#C62828';rr(GW/2-bw/2,34,bw*hp,16,6);ctx.fill();
 ctx.fillStyle='#F4F1E4';ctx.font='18px Bungee,Impact,sans-serif';ctx.textAlign='center';ctx.fillText(BOSSES[B.type].name+' · aguanta '+Math.ceil(D().boss-B.bt)+' s',GW/2,30);ctx.restore()}
function drawDirector(){const B=boss;ctx.save();ctx.translate(B.x,B.y);
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,150,90,14,0,0,7);ctx.fill();
 // jet flames
 const fl=1+.2*Math.sin(t*30);ctx.fillStyle='#FFC94A';ctx.beginPath();ctx.moveTo(-40,118);ctx.lineTo(-30,118+28*fl);ctx.lineTo(-20,118);ctx.fill();ctx.beginPath();ctx.moveTo(20,118);ctx.lineTo(30,118+28*fl);ctx.lineTo(40,118);ctx.fill();
 // figure silhouette behind lectern
 ctx.fillStyle='#2B2440';ctx.beginPath();ctx.ellipse(0,-78,34,40,0,0,7);ctx.fill();ctx.fillStyle='#3A3356';rr(-58,-40,116,90,26);ctx.fill();
 ctx.fillStyle='#C62828';ctx.beginPath();ctx.moveTo(-8,-38);ctx.lineTo(8,-38);ctx.lineTo(12,20);ctx.lineTo(0,34);ctx.lineTo(-12,20);ctx.closePath();ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(-26,-84,52,10);ctx.fillStyle='#1A0F1E';ctx.fillRect(-24,-82,20,6);ctx.fillRect(4,-82,20,6);
 // megaphone
 ctx.save();ctx.translate(-50,-30);ctx.rotate(-.2+.08*Math.sin(t*4));ctx.fillStyle='#FFC94A';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(-46,-26);ctx.lineTo(-46,26);ctx.lineTo(0,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 // lectern
 ctx.fillStyle='#7A5233';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-80,20);ctx.lineTo(80,20);ctx.lineTo(64,120);ctx.lineTo(-64,120);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#F4F1E4';rr(-52,46,104,30,6);ctx.fill();ctx.fillStyle='#1A0F1E';ctx.font='18px Bungee,Impact,sans-serif';ctx.textAlign='center';ctx.fillText('DIRECCIÓN',0,68);
 ctx.restore()}
function drawPlayer(){if(!pl)return;const img=rock>0?HEADR:HEAD;ctx.save();ctx.translate(pl.x,pl.y);ctx.rotate(Math.max(-.45,Math.min(.6,pl.vy/1100)));
 if(inv>0)ctx.globalAlpha=.45+.45*(.5+.5*Math.cos(inv*Math.PI*2*2.5));
 if(rock>0){ctx.fillStyle='rgba(255,79,163,.35)';ctx.beginPath();ctx.arc(0,0,58+4*Math.sin(t*8),0,7);ctx.fill()}
 const s=pl.r*2.3;if(img.complete)ctx.drawImage(img,-s/2,-s/2*1.05,s,s*1.055);
 if(shield){ctx.strokeStyle='rgba(120,220,255,.85)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,s*.62+2*Math.sin(t*5),0,7);ctx.stroke();ctx.fillStyle='rgba(120,220,255,.15)';ctx.fill()}
 ctx.fillStyle='#FFC94A';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,-s*.52);ctx.lineTo(16,-s*.5);ctx.lineTo(4,-s*.85);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.restore()}
function drawBubble(){if(!bubble||!pl)return;ctx.save();ctx.font='26px "Patrick Hand",cursive';const w=ctx.measureText(bubble.txt).width+30,x=Math.min(GW-w-10,pl.x-10),y=Math.max(10,pl.y-pl.r-80);ctx.globalAlpha=Math.min(1,bubble.l*3);
 ctx.fillStyle='#fff';ctx.strokeStyle='#1A0F1E';ctx.lineWidth=3;rr(x,y,w,46,16);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x+24,y+44);ctx.lineTo(x+18,y+64);ctx.lineTo(x+42,y+44);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(x+22,y+40,22,6);
 ctx.fillStyle='#1A0F1E';ctx.textAlign='left';ctx.fillText(bubble.txt,x+15,y+32);ctx.restore()}
function drawFx(){drawBubble();for(const p of fx){ctx.save();ctx.globalAlpha=Math.max(0,p.l/p.m);
 if(p.k==='ring'){const r=(1-p.l/p.m)*900;ctx.strokeStyle='#FFC94A';ctx.lineWidth=14;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.stroke();ctx.restore();continue}
 if(p.k==='paper'){ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-8,-10,16,20)}
 else if(p.k==='note'){ctx.fillStyle='#FF4FA3';ctx.font='28px serif';ctx.fillText('♪',p.x,p.y)}
 else if(p.k==='chalk'){ctx.fillStyle=rock>0?'rgba(255,79,163,.6)':'rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(p.x,p.y,5*(p.l/p.m)+1,0,7);ctx.fill()}
 else if(p.k==='spark'){ctx.fillStyle='#FFC94A';ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill()}
 else {ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(p.x,p.y,8*(1-p.l/p.m)+3,0,7);ctx.fill()}ctx.restore()}
 for(const f of floats){ctx.save();ctx.globalAlpha=Math.min(1,f.l*1.5);ctx.font='28px Bungee,Impact,sans-serif';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#1A0F1E';ctx.strokeText(f.txt,f.x,f.y);ctx.fillStyle='#FFC94A';ctx.fillText(f.txt,f.x,f.y);ctx.restore()}}
function heart(x,y,s,full){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,6);ctx.bezierCurveTo(-14,-4,-10,-16,0,-8);ctx.bezierCurveTo(10,-16,14,-4,0,6);ctx.fillStyle=full?'#FF4FA3':'rgba(255,255,255,.25)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#1A0F1E';ctx.stroke();ctx.restore()}
function hud(){if(state==='menu')return;ctx.save();
 for(let i=0;i<D().lives;i++)heart(36+i*44,40,1.8,i<lives);
 ctx.font='40px Bungee,Impact,sans-serif';ctx.textAlign='left';ctx.lineWidth=7;ctx.strokeStyle='#1A0F1E';ctx.strokeText(String(score),18,104);ctx.fillStyle='#FFC94A';ctx.fillText(String(score),18,104);
 ctx.font='22px "Patrick Hand",cursive';ctx.fillStyle=scene()==='stage'?'#F4F1E4':'#3A2A20';ctx.fillText('Nivel '+(level+1)+' · '+LEVELS[level].name,20,134);
 if(rock>0){ctx.fillStyle='#FF4FA3';ctx.fillRect(20,146,120*(rock/6),8)}
 if(shield){ctx.font='30px serif';ctx.fillText('🛡️',D().lives*44+36,52)}
 {let px=D().lives*44+80;ctx.font='26px serif';if(magnet>0){ctx.fillText('🧲',px,52);ctx.fillStyle='#6ED2FF';ctx.fillRect(px,60,34*(magnet/7),5);px+=44}if(slow>0){ctx.fillText('⏳',px,52);ctx.fillStyle='#6ED2FF';ctx.fillRect(px,60,34*(slow/5),5);px+=44}if(!soloUsed&&false)ctx.fillText('⚡',px,52)}
 if(mult()>1&&state==='play'){ctx.font='30px Bungee,Impact,sans-serif';ctx.lineWidth=6;ctx.strokeStyle='#1A0F1E';const tx='Combo x'+mult();ctx.strokeText(tx,20,186);ctx.fillStyle='#FF4FA3';ctx.fillText(tx,20,186)}
 if(bossWarn>0&&state==='play'){const a=.55+.45*Math.sin(t*9);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='50px Bungee,Impact,sans-serif';ctx.lineWidth=10;ctx.strokeStyle='#1A0F1E';const wn='¡Viene '+BOSSES[bossCount%3].name.replace(/^El /,'el ').replace(/^La /,'la ')+'!';ctx.strokeText(wn,GW/2,GH*.32);ctx.fillStyle='#FF4F4F';ctx.fillText(wn,GW/2,GH*.32);
  ctx.font='28px "Patrick Hand",cursive';ctx.lineWidth=6;const ws=['Esquiva sus circulares','Esquiva los mensajes','Esquiva las planillas que caen'][bossCount%3]+' durante '+D().boss+' segundos';ctx.strokeText(ws,GW/2,GH*.32+44);ctx.fillStyle='#F4F1E4';ctx.fillText(ws,GW/2,GH*.32+44);ctx.restore()}
 toasts.forEach((o,i)=>{o.l-=1/60;const y=GH-110-i*76,a=Math.min(1,o.l*2,(3.2-o.l)*5);ctx.save();ctx.globalAlpha=Math.max(0,a);const w=Math.min(460,GW-40);ctx.fillStyle='rgba(26,15,30,.88)';rr(GW/2-w/2,y,w,64,16);ctx.fill();ctx.strokeStyle='#FFC94A';ctx.lineWidth=3;ctx.stroke();
  ctx.font='34px serif';ctx.textAlign='left';ctx.fillText(o.A.i,GW/2-w/2+14,y+44);ctx.font='16px Bungee,Impact,sans-serif';ctx.fillStyle='#FFC94A';ctx.fillText('Logro desbloqueado',GW/2-w/2+66,y+26);ctx.font='24px "Patrick Hand",cursive';ctx.fillStyle='#F4F1E4';ctx.fillText(o.A.n,GW/2-w/2+66,y+52);ctx.restore()});toasts=toasts.filter(o=>o.l>0);
 if(state==='play'&&count>0){const n=Math.ceil(count),f=count-Math.floor(count);ctx.textAlign='center';ctx.font=(110+60*f)+'px Bungee,Impact,sans-serif';ctx.lineWidth=12;ctx.strokeStyle='#1A0F1E';ctx.strokeText(String(n),GW/2,GH*.45);ctx.fillStyle='#FFC94A';ctx.fillText(String(n),GW/2,GH*.45);
  ctx.font='32px "Patrick Hand",cursive';ctx.lineWidth=6;ctx.strokeText('Hola, '+(pname||'profe')+'. ¡Prepárate!',GW/2,GH*.45+60);ctx.fillStyle='#F4F1E4';ctx.fillText('Hola, '+(pname||'profe')+'. ¡Prepárate!',GW/2,GH*.45+60)}
 if(banner>0&&state==='play'){const a=Math.min(1,banner*2,(2.4-banner)*4);ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='54px Bungee,Impact,sans-serif';ctx.lineWidth=10;const bn=bossDone>0?bossWin:LEVELS[level].name;ctx.strokeText(bn,GW/2,GH*.3);ctx.fillStyle='#FFC94A';ctx.fillText(bn,GW/2,GH*.3);
  ctx.font='30px "Patrick Hand",cursive';ctx.lineWidth=6;const sub='Nivel '+(level+1);ctx.strokeText(sub,GW/2,GH*.3+44);ctx.fillStyle='#F4F1E4';ctx.fillText(sub,GW/2,GH*.3+44)}
 ctx.restore()}
let last=performance.now();
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(state==='play')update(dt);else t+=dt;
 ctx.setTransform(SC,0,0,SC,0,0);if(shake>0)ctx.translate(R(-6,6)*shake/.35,R(-6,6)*shake/.35);
 if(state==='menu'){dist+=60*dt}
 bg();motes();for(const c of cols)drawCol(c);for(const i of items)drawItem(i);for(const h of haz)drawHaz(h);drawBoss();drawPlayer();drawFx();hud();
 requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function start(){pname=($('name').value||'').trim().slice(0,18);try{localStorage.setItem('cata_name',pname)}catch(e){}if(!pname){$('name').focus();$('name').placeholder='Primero escribe tu nombre';$('menu').hidden=false;$('over').hidden=true;return}
 ac();reset();$('rank').hidden=true;state='play';$('menu').hidden=true;$('over').hidden=true;if(AC){nextBeat=AC.currentTime+.1;step=0}cv.focus()}
$('go').onclick=start;$('again').onclick=start;$('rk1').onclick=openRank;$('rk2').onclick=openRank;$('rclose').onclick=()=>{$('rank').hidden=true};
$('lclose').onclick=()=>{$('letter').hidden=true;state='play';count=1.5;last=performance.now()};
$('ac1').onclick=openAch;$('ac2').onclick=openAch;$('aclose').onclick=()=>{$('achov').hidden=true};
$('mus').onclick=()=>{musicOn=!musicOn;$('mus').style.opacity=musicOn?1:.45;$('mus').setAttribute('aria-pressed',String(!musicOn));if(musicOn&&AC){nextBeat=AC.currentTime+.05}};
$('tg').onclick=()=>{rankTab='g';renderRank()};$('tl').onclick=()=>{rankTab='l';renderRank()};
$('name').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();start()}e.stopPropagation()});
function togglePause(){if(state==='play'){state='paused';$('pause').hidden=false;$('resume').focus()}else if(state==='paused'){state='play';$('pause').hidden=true;last=performance.now();if(AC)nextBeat=AC.currentTime+.05}}
$('pau').onclick=togglePause;$('resume').onclick=togglePause;
$('snd').onclick=()=>{muted=!muted;$('snd').textContent=muted?'🔇':'🔊';if(!muted&&AC)nextBeat=AC.currentTime+.05};
addEventListener('pointerdown',()=>ac(),{once:true});
cv.addEventListener('pointerdown',e=>{e.preventDefault();flap()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();if(!$('rank').hidden||!$('achov').hidden||!$('letter').hidden)return;if(state==='menu'||state==='over'){if(state==='over'&&$('over').hidden)return;start()}else flap()}if(e.code==='KeyP'||e.code==='Escape')togglePause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')togglePause()});

// ---------- instalable (PWA) ----------
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let deferred=null;
const showInst=on=>{['inst1'].forEach(id=>$(id).hidden=!on);$('offer').hidden=!on};
if(!standalone&&isIOS)showInst(true);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(!standalone)showInst(true)});
addEventListener('appinstalled',()=>{deferred=null;showInst(false)});
async function install(){if(deferred){deferred.prompt();try{const r=await deferred.userChoice;if(r.outcome==='accepted')showInst(false)}catch(e){}deferred=null}else if(isIOS){$('ios').hidden=false;$('iosclose').focus()}}
$('inst1').onclick=install;$('inst2').onclick=install;$('iosclose').onclick=()=>{$('ios').hidden=true};
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
