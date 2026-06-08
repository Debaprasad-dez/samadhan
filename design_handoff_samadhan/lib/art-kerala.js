/* ============================================================
   SAMADHAN · art-kerala.js  — "Kerala Mural"
   Panchavarnam (five-colour) classical temple mural tradition.
   Natural plaster ground, lampblack outlines (VERY thick), flat
   areas of vermilion/turmeric/green/white/black. Nilavilakku lamp,
   classical dancer silhouette, lotus, elephant procession hint.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const PLASTER='#EDD8A0', PLASTER2='#E4CA88';
const INK='#1A0F06';          // lamp black (thickest outlines in any tradition)
const RED='#8B1A00';          // vermilion/lac red
const TGREEN='#1A6030';       // trefoil green (leaves, background)
const TYELL='#C47808';        // turmeric / orpiment
const TBLUE='#1A4070';        // indigo blue (rare accent)
const CHALK='#F5EDD5';        // chalk white
const SX=286, SY=110;

const OI=(w)=>`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" fill="none"`;
const FI=(c)=>`fill="${c}"`;

// Kerala lotus: stylised, with thick black outlines
function kLotus(cx,cy,r,col){
  col=col||RED; const n=8;let m='<g>';
  for(let i=0;i<n;i++){const a=(i/n)*360;
    m+=`<path d="M${cx} ${cy} Q${cx-r*0.3} ${cy-r*0.65} ${cx} ${cy-r} Q${cx+r*0.3} ${cy-r*0.65} ${cx} ${cy}Z" transform="rotate(${a} ${cx} ${cy})" ${FI(col)} ${OI(2.2)}/>`;}
  for(let i=0;i<n;i++){const a=(i/n)*360+22.5;
    m+=`<path d="M${cx} ${cy} Q${cx-r*0.22} ${cy-r*0.42} ${cx} ${cy-r*0.62} Q${cx+r*0.22} ${cy-r*0.42} ${cx} ${cy}Z" transform="rotate(${a} ${cx} ${cy})" ${FI(TYELL)} ${OI(1.4)}/>`;}
  m+=`<circle cx="${cx}" cy="${cy}" r="${r*0.25}" ${FI(TYELL)} ${OI(2.2)}/>`;
  return m+'</g>';
}

// nilavilakku (traditional Kerala oil lamp — stepped column with flame)
function vilakku(cx,by){
  const h=100;
  let m=`<g>`;
  // base (stepped)
  [[28,10],[22,7],[16,5],[11,6],[8,48],[6,14],[5,8]].reduce((y,[w,sh])=>{
    m+=`<rect x="${cx-w}" y="${y-sh}" width="${w*2}" height="${sh}" ${FI(TYELL)} ${OI(2.8)}/>`; return y-sh;
  },by);
  // stem rising from column top
  const stemTop=by-10-7-6-48-14-8-5;
  m+=`<line x1="${cx}" y1="${stemTop}" x2="${cx}" y2="${stemTop-18}" ${OI(3)}/>`; // neck rod
  // lamp dish
  m+=`<path d="M${cx-14} ${stemTop-18} q14 -10 28 0 q-2 8 -14 8 q-12 0 -14 -8Z" ${FI(RED)} ${OI(2.6)}/>`;
  // wicks + flames
  for(let i=-1;i<2;i++){
    const wx=cx+i*8,wy=stemTop-18;
    m+=`<path d="M${wx} ${wy} q2 -10 0 -18 q-2 8 0 18Z" ${FI(TYELL)} ${OI(1.6)} class="flame" style="--i:${i+1}"/>`;
    m+=`<path d="M${wx} ${wy} q1.5 -6 0 -12" ${FI(CHALK)} opacity=".7" class="flame" style="--i:${(i+2)%3}"/>`;
  }
  // halo ring
  m+=`<circle cx="${cx}" cy="${stemTop-28}" r="22" ${FI('none')} stroke="${TYELL}" stroke-width="2" opacity=".55"/>`;
  m+=`</g>`;return m;
}

// Kerala elephant (profile, simplified — thick outline, white eye, painted headgear)
function elephant(x,by,sc){
  sc=sc||1; let m='<g>';
  const bh=80*sc, bw=70*sc;
  // body
  m+=`<ellipse cx="${x}" cy="${by-bh*0.44}" rx="${bw*0.5}" ry="${bh*0.44}" ${FI(INK)} ${OI(3)}/>`;
  // front-left leg
  m+=`<path d="M${x-bw*0.28} ${by-bh*0.05} l-${4*sc} ${bh*0.38}" ${OI(13*sc,INK)} stroke-linecap="round"/>`;
  // back-right leg
  m+=`<path d="M${x+bw*0.2} ${by-bh*0.05} l${2*sc} ${bh*0.38}" ${OI(12*sc,INK)} stroke-linecap="round"/>`;
  // feet decorative line
  m+=`<path d="M${x-bw*0.38} ${by+bh*0.33} h${bw*0.14} M${x+bw*0.16} ${by+bh*0.33} h${bw*0.14}" ${OI(3)}/>`;
  // head
  m+=`<ellipse cx="${x-bw*0.36}" cy="${by-bh*0.7}" rx="${bw*0.28}" ry="${bh*0.26}" ${FI(INK)} ${OI(3)}/>`;
  // eye
  m+=`<circle cx="${x-bw*0.46}" cy="${by-bh*0.78}" r="${4*sc}" ${FI(CHALK)} ${OI(2.5)}/>`;
  m+=`<circle cx="${x-bw*0.46}" cy="${by-bh*0.78}" r="${2*sc}" ${FI(INK)}/>`;
  // trunk
  m+=`<path d="M${x-bw*0.6} ${by-bh*0.58} C${x-bw*0.74} ${by-bh*0.44} ${x-bw*0.72} ${by-bh*0.22} ${x-bw*0.54} ${by-bh*0.08}" ${OI(9*sc,INK)} stroke-linecap="round"/>`;
  // tusk
  m+=`<path d="M${x-bw*0.58} ${by-bh*0.62} Q${x-bw*0.78} ${by-bh*0.52} ${x-bw*0.84} ${by-bh*0.38}" stroke="${CHALK}" stroke-width="${3*sc}" fill="none" stroke-linecap="round"/>`;
  // caparison (head cloth — red with gold dots)
  m+=`<path d="M${x-bw*0.2} ${by-bh*0.88} Q${x-bw*0.36} ${by-bh*1.02} ${x-bw*0.56} ${by-bh*0.96}" stroke="${RED}" stroke-width="${8*sc}" fill="none" stroke-linecap="round"/>`;
  m+=`<path d="M${x-bw*0.2} ${by-bh*0.88} Q${x-bw*0.36} ${by-bh*1.02} ${x-bw*0.56} ${by-bh*0.96}" ${OI(2)}/>`;
  for(let i=0;i<3;i++)m+=`<circle cx="${x-bw*(0.26+i*0.14)}" cy="${by-bh*(0.9+i*0.02)}" r="${2.5*sc}" ${FI(TYELL)} opacity=".9"/>`;
  return m+'</g>';
}

// Classical dancer pose (Bharatanatyam-style silhouette, Kerala) — facing left
function dancer(cx,by){
  let m='<g>';
  // legs — turned out, bent knees (araimandi)
  const lh=by, lw=28;
  m+=`<path d="M${cx-lw} ${lh} L${cx-8} ${lh-30} L${cx+8} ${lh-30} L${cx+lw} ${lh} Z" ${FI(RED)} ${OI(3)}/>`;
  m+=`<path d="M${cx-lw} ${lh} L${cx-lw-6} ${lh+14}" ${OI(4)} stroke-linecap="round"/>`;
  m+=`<path d="M${cx+lw} ${lh} L${cx+lw+6} ${lh+14}" ${OI(4)} stroke-linecap="round"/>`;
  // skirt detail
  for(let i=0;i<5;i++)m+=`<line x1="${cx-lw+i*12}" y1="${lh}" x2="${cx-8+i*4}" y2="${lh-30}" ${OI(1.2)} opacity=".4"/>`;
  // torso
  m+=`<rect x="${cx-10}" y="${by-68}" width="20" height="38" rx="4" ${FI(RED)} ${OI(3)}/>`;
  // right arm raised (natyarambha position)
  m+=`<path d="M${cx+10} ${by-62} C${cx+26} ${by-70} ${cx+36} ${by-86} ${cx+28} ${by-96}" ${OI(5)} stroke-linecap="round"/>`;
  m+=`<path d="M${cx+28} ${by-96} q4 -6 0 -12 q-6 4 0 12Z" ${FI(RED)} ${OI(2.2)}/>`;
  // left arm gesture (lower)
  m+=`<path d="M${cx-10} ${by-62} C${cx-22} ${by-58} ${cx-34} ${by-64} ${cx-38} ${by-56}" ${OI(5)} stroke-linecap="round"/>`;
  m+=`<path d="M${cx-38} ${by-56} q-8 0 -8 8" ${OI(3.5)} stroke-linecap="round"/>`;
  // neck + head
  m+=`<rect x="${cx-4}" y="${by-82}" width="8" height="14" rx="2" ${FI(INK)}/>`;
  m+=`<ellipse cx="${cx}" cy="${by-92}" rx="14" ry="16" ${FI(RED)} ${OI(3.5)}/>`;
  // face features
  m+=`<path d="M${cx-6} ${by-94} q3 -4 12 -2" ${OI(1.8)}/>`; // eye right (stylised)
  m+=`<path d="M${cx-4} ${by-94} q2 2 4 0" ${OI(1.4)}/>`; // brow
  m+=`<path d="M${cx-3} ${by-90} q3 2 6 0" ${OI(1.2)}/>`; // nose
  // crown (kiritam)
  m+=`<path d="M${cx-14} ${by-106} L${cx-8} ${by-120} L${cx} ${by-126} L${cx+8} ${by-120} L${cx+14} ${by-106}" ${OI(2.5)}/> `;
  m+=`<circle cx="${cx}" cy="${by-126}" r="4" ${FI(TYELL)} ${OI(2)}/>`;
  // jewels at each crown point
  for(const pt of [[-14,by-106],[-8,by-120],[8,by-120],[14,by-106]])m+=`<circle cx="${cx+pt[0]}" cy="${pt[1]}" r="2.4" ${FI(TYELL)}/>`;
  m+=`</g>`;return m;
}

S.scenes.kerala=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="kbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PLASTER}"/><stop offset=".6" stop-color="${PLASTER2}"/><stop offset="1" stop-color="#D8C078"/></linearGradient>
    <radialGradient id="kglow" cx="${SX}" cy="${SY}" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${TYELL}" stop-opacity=".3"/><stop offset="1" stop-color="${TYELL}" stop-opacity="0"/></radialGradient>
    <filter id="ksoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SX,'data-y':SY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lbg=L(0.02);
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#kbg)'}));
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#kglow)'}));
  // plaster crack texture (very faint)
  let tex='';const Rt=S.rng(21);
  for(let i=0;i<8;i++){const x1=Rt()*W,y1=Rt()*H,l=40+Rt()*60,a=Rt()*Math.PI;
    tex+=`<path d="M${x1} ${y1} l${Math.cos(a)*l} ${Math.sin(a)*l}" stroke="${INK}" stroke-width="0.5" opacity="${0.04+Rt()*0.04}"/>`;}
  Lbg.innerHTML+=tex;

  // border: double black lines with red band + lotus rosette row
  const Lbdr=L(0.04); let bd='';
  bd+=`<rect x="-10" y="20" width="${W+20}" height="28" ${FI(RED)} opacity=".85"/>`;
  bd+=`<line x1="-10" y1="20" x2="${W+10}" y2="20" stroke="${INK}" stroke-width="2.4"/>`;
  bd+=`<line x1="-10" y1="48" x2="${W+10}" y2="48" stroke="${INK}" stroke-width="2"/>`;
  // lotus bud row in border
  for(let x=4;x<W;x+=24){
    bd+=`<circle cx="${x+12}" cy="34" r="10" ${FI(PLASTER)} ${OI(1.8)}/>`;
    bd+=`<path d="M${x+4} 40 L${x+12} 22 L${x+20} 40 Z" ${FI(PLASTER)} ${OI(1.4)}/>`;
    bd+=`<circle cx="${x+12}" cy="34" r="3.5" ${FI(RED)}/>`;}
  bd+=`<rect x="-10" y="${H-42}" width="${W+20}" height="22" ${FI(TGREEN)} opacity=".7"/>`;
  bd+=`<line x1="-10" y1="${H-42}" x2="${W+10}" y2="${H-42}" stroke="${INK}" stroke-width="2.4"/>`;
  bd+=`<line x1="-10" y1="${H-20}" x2="${W+10}" y2="${H-20}" stroke="${INK}" stroke-width="2"/>`;
  Lbdr.innerHTML=bd;

  // sun / lamp glow
  const Lsun=L(0.06);
  const rays=S.el('g',{id:'rays',opacity:0,filter:'url(#ksoft)'});
  let rm='';
  for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;
    rm+=`<path d="M${SX+Math.cos(a)*28} ${SY+Math.sin(a)*28} L${SX+Math.cos(a)*90} ${SY+Math.sin(a)*90} L${SX+Math.cos(a+0.05)*90} ${SY+Math.sin(a+0.05)*90} Z" fill="${TYELL}" opacity="${i%2?0.28:0.18}"/>`;}
  rays.innerHTML=rm; Lsun.appendChild(rays);
  let sm=`<circle cx="${SX}" cy="${SY}" r="28" ${FI(TYELL)} stroke="${INK}" stroke-width="3"/>`;
  sm+=`<circle cx="${SX}" cy="${SY}" r="18" ${FI(RED)} stroke="${INK}" stroke-width="2.2"/>`;
  sm+=`<circle cx="${SX}" cy="${SY}" r="9" ${FI(TYELL)} stroke="${INK}" stroke-width="1.8"/>`;
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;sm+=`<circle cx="${SX+Math.cos(a)*23}" cy="${SY+Math.sin(a)*23}" r="2.4" ${FI(INK)}/>`;}
  Lsun.innerHTML+=sm;

  // background: keli leaf vine (Kerala characteristic — bold trefoil leaves)
  const Lvine=L(0.09); let vine='';
  function trefoilLeaf(x,y,ang,r){
    const cos=Math.cos(ang),sin=Math.sin(ang),cx=x+cos*r*0.5,cy=y+sin*r*0.5;
    return `<path d="M${x} ${y} Q${cx-sin*r} ${cy+cos*r} ${cx+cos*r} ${cy+sin*r} Q${cx+sin*r} ${cy-cos*r} ${x} ${y}Z" ${FI(TGREEN)} stroke="${INK}" stroke-width="2"/>
      <line x1="${x}" y1="${y}" x2="${cx+cos*r}" y2="${cy+sin*r}" stroke="${INK}" stroke-width="1.4" opacity=".6"/>`;
  }
  // vine on left side going down
  let vx=36,vy=70;
  for(let i=0;i<9;i++){const a=(i%2?-0.6:0.6)+Math.PI*0.35;
    vine+=trefoilLeaf(vx,vy,i%2?Math.PI*0.75:Math.PI*1.25,20);
    vine+=`<line x1="${vx}" y1="${vy}" x2="${vx+Math.sin(Math.PI/6)*16}" y2="${vy+Math.cos(Math.PI/6)*18}" stroke="${INK}" stroke-width="2.2"/>`;
    vy+=32;}
  vine+=`<line x1="36" y1="70" x2="36" y2="${vy-26}" stroke="${INK}" stroke-width="2.4"/>`;
  Lvine.innerHTML=vine;

  // central dancer
  const Ldancer=L(0.18); const dg=S.el('g',{});dg.innerHTML=dancer(230,362);Ldancer.appendChild(dg);

  // lotus row at mid
  const Llotus=L(0.15); let lot='';
  lot+=kLotus(80,310,16,RED)+kLotus(160,326,20,TYELL)+kLotus(252,316,14,RED);
  // lotus leaves (pads)
  lot+=`<path d="M50 318 a18 18 0 1 1 1 0 Z" ${FI(TGREEN)} stroke="${INK}" stroke-width="2"/>`;
  lot+=`<path d="M180 328 a14 14 0 1 1 1 0 Z" ${FI(TGREEN)} stroke="${INK}" stroke-width="2"/>`;
  Llotus.innerHTML=lot;

  // lamp (nilavilakku) — iconic Kerala
  const Llamp=L(0.20); Llamp.innerHTML=vilakku(338,418);

  // elephant procession hint (right-far, faded)
  const Leleph=L(0.12); const eg=S.el('g',{opacity:.65,filter:'url(#ksoft)'}); eg.innerHTML=elephant(360,450,0.72); Leleph.appendChild(eg);

  // dust
  const Lf=L(0.5);let fp='';
  for(let i=0;i<10;i++){const x=20+Math.random()*350,y=60+Math.random()*360,r=0.7+Math.random()*1.2;
    fp+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${TYELL}" opacity="${0.15+Math.random()*0.25}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=fp;
};
})();
