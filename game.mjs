import {stages} from './stages.mjs';
import {initialState,step,solve,arrow,SLOTS,normalize} from './engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=0, state=initialState(stages[0]), previous=[], anim=null, busy=false, soundOn=true, showHint=false, audio;
let cleared;
try{cleared=new Set(JSON.parse(localStorage.getItem('ccw-or-cw-cleared')||'[]'));}catch{cleared=new Set();}
const current=()=>stages[selected];
const ang=s=>-Math.PI/2+s*Math.PI*2/SLOTS;
const point=(r,s)=>[300+Math.cos(ang(s))*r,300+Math.sin(ang(s))*r];
function radii(){
 const count=current().walls.length,spacing=count>1?Math.min(52,187/(count-1)):52,inner=count===1?152:260-(count-1)*spacing;
 return current().walls.map((_,i)=>inner+i*spacing);
}
function ballRadius(layer){
 const rr=radii();if(layer>=rr.length-1)return rr[rr.length-1]+35;
 const n=rr[layer+1],p=layer<0?Math.max(0,rr[0]-44):rr[layer];
 return n-Math.min(17,(n-p)*.5);
}
function tone(freq,duration=.08){
 if(!soundOn)return;
 try{
  audio??=new(window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  const osc=audio.createOscillator(),gain=audio.createGain();
  osc.type='triangle';osc.frequency.value=freq;gain.gain.value=.045;
  gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
  osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration+.01);
 }catch{}
}
function arc(r,a,b,width,color,shift=0){
 ctx.beginPath();ctx.arc(300,300,r+shift,a,b);
 ctx.lineWidth=width;ctx.lineCap='butt';ctx.strokeStyle=color;ctx.stroke();
}
function wall(r,holes,offset,active){
 const a=holes.map(n=>(ang(n+offset)+Math.PI*4)%(Math.PI*2)).sort((x,y)=>x-y);
 const half=.145;
 for(let i=0;i<a.length;i++){
  const from=a[i]+half,to=(i===a.length-1?a[0]+Math.PI*2:a[i+1])-half;
  if(to<=from)continue;
  arc(r,from,to,23,'#0b141e',4);
  arc(r,from,to,22,active?'#b98055':'#4b6172',2);
  arc(r,from,to,19,active?'#efc38a':'#8195a4',-2);
  arc(r,from,to,2,active?'#ffe5ae':'#bcd0d9',-11);
  arc(r,from,to,2,'#293f52',8);
 }
 for(const a0 of a){
  for(const sign of [-1,1]){
   const x=300+r*Math.cos(a0+sign*half),y=300+r*Math.sin(a0+sign*half);
   ctx.beginPath();ctx.arc(x,y,3,0,2*Math.PI);ctx.fillStyle=active?'#ffe4ac':'#9fbed0';ctx.fill();
  }
  const x=300+(r+8)*Math.cos(a0),y=300+(r+8)*Math.sin(a0);
  ctx.beginPath();ctx.arc(x,y,2.8,0,2*Math.PI);ctx.fillStyle=active?'#ffda92':'#a1f0da';ctx.fill();
 }
 for(let i=0;i<16;i++){
  const angle=ang(i+offset+.5),x=300+r*Math.cos(angle),y=300+r*Math.sin(angle);
  ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fillStyle=active?'#a76e4e':'#364c60';ctx.fill();
 }
}
function bead(x,y){
 const grad=ctx.createRadialGradient(x-4,y-5,1,x,y,13);
 grad.addColorStop(0,'#fff3e8');grad.addColorStop(.2,'#ffb5a0');grad.addColorStop(.55,'#ff5b57');grad.addColorStop(1,'#a71f39');
 ctx.save();ctx.shadowColor='#ff7770';ctx.shadowBlur=18;
 ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
 ctx.strokeStyle='#ffd1bf';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
}
function carrier(theta,layer,r){
 const a=ang(theta),[x,y]=point(r,theta),start=layer<0?18:radii()[layer]+10;
 const [bx,by]=point(start,theta);
 ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(x,y);ctx.strokeStyle='#5a8190';ctx.lineWidth=6;ctx.stroke();
 ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(x,y);ctx.strokeStyle='#b7d0ce';ctx.lineWidth=2;ctx.stroke();
 const tx=-Math.sin(a),ty=Math.cos(a);
 ctx.strokeStyle='#ffc987';ctx.lineWidth=4;ctx.lineCap='round';
 for(const sign of [-1,1]){
  ctx.beginPath();
  ctx.moveTo(x+tx*sign*15,y+ty*sign*15);
  ctx.lineTo(x+tx*sign*15-Math.cos(a)*9,y+ty*sign*15-Math.sin(a)*9);
  ctx.stroke();
 }
}
function draw(){
 ctx.clearRect(0,0,600,600);
 const rr=radii();
 ctx.lineWidth=1;ctx.strokeStyle='#213546';
 for(let i=0;i<8;i++){
  const a=ang(i*2);ctx.beginPath();ctx.moveTo(300+Math.cos(a)*18,300+Math.sin(a)*18);
  ctx.lineTo(300+Math.cos(a)*280,300+Math.sin(a)*280);ctx.stroke();
 }
 const active=anim?anim.from:state.layer;
 for(let i=rr.length-1;i>=0;i--){
  let offset=anim?anim.rotations[i]:state.rotations[i];
  if(anim&&anim.phase==='spin'&&i===anim.from)offset+=anim.direction*anim.distance*anim.p;
  wall(rr[i],current().walls[i],offset,i===active);
 }
 ctx.beginPath();ctx.arc(300,300,19,0,Math.PI*2);ctx.fillStyle='#182e41';ctx.fill();
 ctx.strokeStyle='#6f91a6';ctx.lineWidth=5;ctx.stroke();
 ctx.beginPath();ctx.arc(300,300,5,0,2*Math.PI);ctx.fillStyle='#d0dee2';ctx.fill();
 let a=state.angle,r=ballRadius(state.layer),layer=state.layer;
 if(anim){
  a=anim.phase==='spin'?anim.angle+anim.direction*anim.distance*anim.p:anim.target;
  layer=anim.from;
  r=anim.phase==='spin'?anim.radius:anim.startR+(anim.endR-anim.startR)*anim.p;
 }
 if((state.status!=='won'||anim)&&(!anim||anim.phase==='spin'))carrier(a,layer,r);
 if(state.status!=='won'||anim){const xy=point(r,a);bead(xy[0],xy[1]);}
 if(anim&&anim.phase==='burst'){
  const rr=anim.startR+(anim.endR-anim.startR)*.5,xy=point(rr,a);
  ctx.beginPath();ctx.arc(xy[0],xy[1],5+anim.p*24,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,211,145,'+((1-anim.p)*.7)+')';ctx.lineWidth=4;ctx.stroke();
 }
 ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#9eb4c4';ctx.fillText('OUT',300,22);
}
function resize(){
 const width=Math.max(1,canvas.getBoundingClientRect().width),dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.round(width*dpr);canvas.height=canvas.width;
 ctx.setTransform(canvas.width/600,0,0,canvas.height/600,0,0);draw();
}
function refresh(){
 $('stage-number').textContent='STAGE '+current().id;
 $('stage-title').textContent=current().title;
 $('stage-tip').textContent=current().tip;
 $('goal').textContent='OUT IN '+current().expected;
 $('move-readout').textContent='MOVES '+state.moves+' / '+current().expected;
 $('stage-insight').textContent=current().insight;
 $('completed').textContent=cleared.size+' / '+stages.length+' CLEAR';
 $('win').hidden=state.status!=='won';
 $('result-count').textContent='OUT IN '+state.moves;
 $('result-line').textContent=state.moves<=current().expected?'PERFECT! 最短手数で脱出':'CLEAR! 最短にも挑戦';
 $('next').textContent=selected===stages.length-1?'FIRST STAGE ↺':'NEXT STAGE →';
 $('undo').disabled=busy||!previous.length;
 $('left').disabled=busy||state.status==='won';$('right').disabled=busy||state.status==='won';
 for(const button of $('stage-grid').children){
  const i=Number(button.dataset.index);
  button.classList.toggle('selected',i===selected);
  button.classList.toggle('solved',cleared.has(stages[i].id));
  button.setAttribute('aria-current',i===selected?'step':'false');
 }
 $('hint-text').hidden=!showHint;
 if(showHint)$('hint-text').textContent='最短 '+solve(current()).moves+'手：'+current().answer.map(arrow).join(' → ');
 draw();
}
function reset(){
 state=initialState(current());previous=[];anim=null;busy=false;showHint=false;refresh();
}
function switchStage(i){if(busy)return;selected=(i+stages.length)%stages.length;reset();}
function tween(duration,callback){
 if(reduced){callback(1);return Promise.resolve();}
 return new Promise(resolve=>{
  const start=performance.now();
  const tick=now=>{
   const t=Math.min(1,(now-start)/duration);
   callback(t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2);
   if(t<1)requestAnimationFrame(tick);else resolve();
  };requestAnimationFrame(tick);
 });
}
async function turn(dir){
 if(busy||state.status==='won')return;
 busy=true;
 const old=state,updated=step(current(),old,dir),delta=updated.transition;
 previous.push(old);refresh();tone(260);
 anim={phase:'spin',from:old.layer,angle:old.angle,target:delta.toAngle,direction:dir,distance:delta.distance,p:0,rotations:old.rotations,radius:ballRadius(old.layer)};
 await tween(Math.min(760,220+delta.distance*45),p=>{anim.p=p;draw();});
 const passes=delta.crossed.length;
 anim={phase:'burst',from:old.layer,target:delta.toAngle,rotations:updated.rotations,startR:ballRadius(old.layer),endR:ballRadius(updated.layer),p:0};
 tone(580+passes*65,.14);
 await tween(210+passes*65,p=>{anim.p=p;draw();});
 anim=null;state=updated;busy=false;
 if(state.status==='won'){
  cleared.add(current().id);
  try{localStorage.setItem('ccw-or-cw-cleared',JSON.stringify([...cleared]));}catch{}
  tone(880,.22);
 }
 refresh();
}
for(let i=0;i<stages.length;i++){
 const b=document.createElement('button');
 b.type='button';b.className='stage-select';b.textContent=stages[i].id;b.dataset.index=i;
 b.setAttribute('aria-label','ステージ '+stages[i].id);
 b.addEventListener('click',()=>switchStage(i));$('stage-grid').append(b);
}
$('left').addEventListener('click',()=>turn(-1));
$('right').addEventListener('click',()=>turn(1));
$('restart').addEventListener('click',()=>{if(!busy)reset();});
$('undo').addEventListener('click',()=>{if(busy||!previous.length)return;state=previous.pop();anim=null;refresh();tone(330);});
$('hint').addEventListener('click',()=>{if(busy)return;showHint=!showHint;refresh();});
$('next').addEventListener('click',()=>switchStage(selected+1));
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').textContent=soundOn?'♫':'♪';if(soundOn)tone(660);});
const help=$('help');
$('rules').addEventListener('click',()=>help.showModal());
$('close-help').addEventListener('click',()=>help.close());
$('got-it').addEventListener('click',()=>help.close());
document.addEventListener('keydown',e=>{
 if(help.open||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
 if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}
 if(e.key==='ArrowRight'){e.preventDefault();turn(1);}
});
new ResizeObserver(resize).observe(canvas);
refresh();
