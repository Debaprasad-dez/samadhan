/* ============================================================
   SAMADHAN · art-deccan.js  — "Deccan Noir"
   Bidriware inlay — near-black zinc alloy ground with silver/white
   arabesque inlay. Geometric stars, interlace knots, scrolling vine.
   Hyderabad / Bidar tradition. Zero colour, maximum geometry.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const BLK='#080A0C', BLK2='#0E1014', SILV='#D0D0D8', SILV_D='#A8A8B0', SILV_F='#707078', VER='#4A7C50';
const MX=300, MY=100;

const O=(w,c)=>`stroke="${c||SILV}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

// n-pointed geometric star (Bidriware hallmark)
function star(cx,cy,r,n,inner,col){
  col=col||SILV; inner=inner||r*0.44;
  let d=`M${cx+r} ${cy}`;
  for(let i=0;i<n*2;i++){const a=((i+0.5)/n)*Math.PI,ri=i%2?inner:r;
    d+=` L${cx+Math.cos(a)*ri} ${cy+Math.sin(a)*ri}`;}
  return `<path d="${d} Z" fill="${col}" fill-opacity="0.88" stroke="${BLK}" stroke-width="0.7"/>`;
}

// arabesque scroll unit: a curved branch with split ends
function scroll(x,y,sc,ang){
  sc=sc||1; ang=ang||0;
  return `<g transform="rotate(${ang} ${x} ${y})">
    <path d="M${x} ${y} C${x+22*sc} ${y-4*sc} ${x+34*sc} ${y-18*sc} ${x+36*sc} ${y-36*sc}" ${O(1.6*sc)} opacity=".82"/>
    <path d="M${x+36*sc} ${y-36*sc} C${x+38*sc} ${y-52*sc} ${x+28*sc} ${y-56*sc} ${x+22*sc} ${y-48*sc} C${x+16*sc} ${y-40*sc} ${x+22*sc} ${y-34*sc} ${x+30*sc} ${y-38*sc}" ${O(1.2*sc)} opacity=".75"/>
    <circle cx="${x}" cy="${y}" r="${2.4*sc}" fill="${SILV}" opacity=".8"/>
    <path d="M${x+36*sc} ${y-36*sc} q${6*sc} -4*sc ${4*sc} ${-8*sc}" ${O(1*sc)} opacity=".65"/>
  </g>`;
}

// interlace knot module (a simple 4-fold Celtic-style knot approximation)
function knot(cx,cy,r){
  let m='';
  for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2,b=a+Math.PI/4;
    const x1=cx+Math.cos(a)*r*0.5,y1=cy+Math.sin(a)*r*0.5;
    const x2=cx+Math.cos(b)*r,y2=cy+Math.sin(b)*r;
    const x3=cx+Math.cos(a+Math.PI/2)*r*0.5,y3=cy+Math.sin(a+Math.PI/2)*r*0.5;
    m+=`<path d="M${x1} ${y1} Q${x2} ${y2} ${x3} ${y3}" ${O(2)} opacity=".7"/>`;
    m+=`<path d="M${x1} ${y1} Q${cx} ${cy} ${x3} ${y3}" ${O(1.2)} opacity=".45"/>`;
    m+=`<circle cx="${x2}" cy="${y2}" r="1.8" fill="${SILV}" opacity=".75"/>`;}
  m+=`<circle cx="${cx}" cy="${cy}" r="${r*0.22}" fill="${SILV}" opacity=".85"/>`;
  return m;
}

// jali grid (geometric trellis — Deccan variation is more angular than Mughal)
function jali(x,y,w,h,unit){
  unit=unit||18; let m='';
  for(let gx=x;gx<x+w;gx+=unit){
    m+=`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y+h}" stroke="${SILV_F}" stroke-width="0.7" opacity=".25"/>`;
    for(let gy=y;gy<y+h;gy+=unit){
      m+=`<line x1="${x}" y1="${gy}" x2="${x+w}" y2="${gy}" stroke="${SILV_F}" stroke-width="0.7" opacity=".2"/>`;
      m+=`<circle cx="${gx}" cy="${gy}" r="1.2" fill="${SILV_F}" opacity=".35"/>`;
      // diamond at crossing
      if((Math.round((gx-x)/unit)+(Math.round((gy-y)/unit)))%2===0)
        m+=`<path d="M${gx} ${gy-4} L${gx+4} ${gy} L${gx} ${gy+4} L${gx-4} ${gy} Z" fill="${SILV}" opacity=".25"/>`;
    }
  }
  return m;
}

// crescent + star (Deccan Islamic motif)
function crescentStar(cx,cy,r){
  return `<path d="M${cx} ${cy-r} a${r} ${r} 0 1 0 ${r*0.5} ${r*1.86} a${r*0.78} ${r*0.78} 0 1 1 ${-r*0.5} ${-r*1.86} Z" fill="${SILV}" opacity=".9"/>
    ${star(cx+r*0.9,cy-r*0.9,r*0.3,5,r*0.13,SILV)}`;
}

S.scenes.deccan=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLK2}"/><stop offset=".5" stop-color="${BLK}"/><stop offset="1" stop-color="#060608"/></linearGradient>
    <radialGradient id="dmoon" cx="${MX}" cy="${MY}" r="220" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${SILV}" stop-opacity=".14"/><stop offset="1" stop-color="${SILV}" stop-opacity="0"/></radialGradient>
    <filter id="dbloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="dsoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':MX,'data-y':MY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lbg=L(0.02);
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#dbg)'}));
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#dmoon)'}));
  // very faint diagonal lines (metal casting grain)
  let tex='';for(let i=-14;i<24;i++)tex+=`<line x1="${i*34}" y1="-10" x2="${i*34+260}" y2="${H+10}" stroke="${SILV}" stroke-width="0.5" opacity=".04"/>`;
  Lbg.innerHTML+=tex;

  // background jali overall trellis
  const Ljali=L(0.05);Ljali.innerHTML=jali(-10,-10,W+20,H+20,28);

  // silver border — double line + diamond row
  const Lbdr=L(0.06); let bd='';
  bd+=`<line x1="-10" y1="28" x2="${W+10}" y2="28" stroke="${SILV}" stroke-width="1.8" opacity=".7"/>`;
  bd+=`<line x1="-10" y1="38" x2="${W+10}" y2="38" stroke="${SILV}" stroke-width="0.9" opacity=".45"/>`;
  for(let x=4;x<W;x+=18)bd+=star(x+7,33,7,6,3,SILV);
  bd+=`<line x1="-10" y1="${H-36}" x2="${W+10}" y2="${H-36}" stroke="${SILV}" stroke-width="1.4" opacity=".55"/>`;
  for(let x=4;x<W;x+=20)bd+=`<path d="M${x+8} ${H-36} L${x+12} ${H-28} L${x+16} ${H-36} L${x+12} ${H-44} Z" fill="${SILV}" opacity=".45"/>`;
  Lbdr.innerHTML=bd;

  // moon glow + crescent
  const Lmoon=L(0.07);
  Lmoon.appendChild(S.el('circle',{cx:MX,cy:MY,r:30,fill:SILV,opacity:.12,filter:'url(#dbloom)'}));
  Lmoon.innerHTML+=crescentStar(MX,MY,18);
  // twinkling stars scattered
  const R=S.rng(19); let st='';
  for(let i=0;i<30;i++){const x=20+R()*350,y=50+R()*300,r=0.9+R()*1.6;
    st+=`<g class="twinkle" style="--i:${i%7};opacity:${0.4+R()*0.5}">${star(x,y,r,4,r*0.45,SILV)}</g>`;}
  Lmoon.innerHTML+=st;

  // hero zone: large geometric medallion (centre-right, lower-mid)
  const Lmed=L(0.14); let md='';
  const mcx=222,mcy=350,mr=78;
  // outer ring
  md+=`<circle cx="${mcx}" cy="${mcy}" r="${mr}" ${O(2.2)} opacity=".5"/>`;
  md+=`<circle cx="${mcx}" cy="${mcy}" r="${mr*0.88}" ${O(1.1)} opacity=".35"/>`;
  // 12-point star outer
  md+=star(mcx,mcy,mr*0.82,12,mr*0.38,SILV);
  // 8-point inner
  md+=star(mcx,mcy,mr*0.52,8,mr*0.22,SILV);
  // central knot
  md+=knot(mcx,mcy,mr*0.26);
  // radiating arabesque arms
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;
    md+=scroll(mcx+Math.cos(a)*mr*0.6,mcy+Math.sin(a)*mr*0.6,0.44,a*57.3-90);}
  // corner accent: geometric floral (upper-left, lower-right)
  md+=knot(38,62,22);md+=knot(352,62,22);md+=knot(38,H-58,18);md+=knot(352,H-58,18);
  Lmed.innerHTML=md;

  // side scrolls (left + right flanks)
  const Lscroll=L(0.10); let sc2='';
  [[22,100,0.65,0],[22,160,0.65,30],[22,220,0.65,-20],
   [368,100,0.65,180],[368,160,0.65,150],[368,220,0.65,200]].forEach(([x,y,s,a])=>sc2+=scroll(x,y,s,a));
  Lscroll.innerHTML=sc2;

  // verdigris accent circles (patina)
  const Lv=L(0.22); let vm='';
  [[84,156,10],[322,186,8],[66,400,12],[344,414,9]].forEach(([x,y,r])=>{
    vm+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${VER}" opacity=".45"/>`;
    vm+=star(x,y,r*0.7,6,r*0.3,SILV);});
  Lv.innerHTML=vm;

  // silver dust
  const Lf=L(0.5);let fp='';
  for(let i=0;i<14;i++){const x=20+Math.random()*350,y=50+Math.random()*380,r=0.6+Math.random()*1.2;
    fp+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${SILV}" opacity="${0.18+Math.random()*0.28}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=fp;
};
})();
