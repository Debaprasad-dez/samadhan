/* ============================================================
   SAMADHAN · art-pattachitra.js  — "Pattachitra Rust"
   Odisha/Bengal scroll painting — lacquer-red ground, chalk-white
   figures with bold lampblack outlines. Fish-eye border, lotus pond,
   peacock, geometric floral pattern. Turmeric gold + indigo accents.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const RED='#8C1C0E', RED_D='#6E1208', RED_L='#A02416';
const CHALK='#F5E8C0', INK='#1A0A04', GOLD='#D4A017', INDIGO='#1A5C8B', GREEN='#3A7A28';
const SX=300, SY=100;

// Bold outline helper
const O=(w,c)=>`stroke="${c||INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" fill="none"`;
const F=(c,o)=>`fill="${c}" fill-opacity="${o||1}"`;

// fish (classic Pattachitra fish — robust, decorative)
function pcFish(x,y,len,ang,col){
  col=col||CHALK; const L=len,hw=len*0.36;
  return `<g transform="rotate(${ang} ${x} ${y})">
    <path d="M${x-L/2} ${y} Q${x} ${y-hw} ${x+L/2-4} ${y} Q${x} ${y+hw} ${x-L/2} ${y} Z" ${F(col)} ${O(2.2)}/>
    <path d="M${x-L/2} ${y} Q${x} ${y-hw*0.72} ${x+L/2-4} ${y} Q${x} ${y+hw*0.72} ${x-L/2} ${y} Z" ${O(1.1,INK)}/>
    <path d="M${x+L/2-4} ${y} L${x+L/2+8} ${y-hw*0.88} L${x+L/2+12} ${y} L${x+L/2+8} ${y+hw*0.88} Z" ${F(col)} ${O(2)}/>
    <circle cx="${x-L*0.32}" cy="${y-3}" r="2.8" ${F(INK)}/><circle cx="${x-L*0.32}" cy="${y-3}" r="1.2" ${F(CHALK)} opacity=".9"/>
    <path d="M${x-L*0.1} ${y-hw*0.7} q5 -7 12 -4 q-4 5 -12 4Z" ${F(GOLD)} ${O(1.2)}/>
    <line x1="${x-L*0.28}" y1="${y-hw*0.55}" x2="${x+L*0.28}" y2="${y-hw*0.55}" ${O(0.8)} opacity=".5"/>
    <line x1="${x-L*0.14}" y1="${y-hw*0.3}" x2="${x+L*0.14}" y2="${y-hw*0.3}" ${O(0.8)} opacity=".5"/>
  </g>`;
}

// lotus (top view, Pattachitra style — pointed petals with veins)
function pcLotus(x,y,r,col){
  col=col||CHALK; const n=8;let m='<g>';
  for(let i=0;i<n;i++){const a=(i/n)*360;
    m+=`<path d="M${x} ${y} Q${x-r*0.24} ${y-r*0.72} ${x} ${y-r} Q${x+r*0.24} ${y-r*0.72} ${x} ${y}Z" transform="rotate(${a} ${x} ${y})" ${F(col)} ${O(1.8)}/>`;
    m+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-r*0.86}" ${O(0.7,INK)} transform="rotate(${a} ${x} ${y})" opacity=".45"/>`;}
  m+=`<circle cx="${x}" cy="${y}" r="${r*0.22}" ${F(GOLD)} ${O(1.4)}/>`;
  m+=`</g>`;return m;
}

// Pattachitra peacock (formal, heraldic)
function pcPeacock(bx,by){
  let m='<g>';
  // ground shadow
  m+=`<ellipse cx="${bx}" cy="${by+8}" rx="28" ry="5" ${F(INK)} opacity=".18"/>`;
  // tail fan
  const n=13;
  for(let i=0;i<n;i++){const ang=(-90+(i-(n-1)/2)*14)*Math.PI/180,tl=100+Math.abs((i-(n-1)/2))*2;
    const tx=bx+Math.cos(ang)*tl,ty=by-8+Math.sin(ang)*tl;
    m+=`<line x1="${bx}" y1="${by-8}" x2="${tx}" y2="${ty}" ${O(1.6,GREEN)} opacity=".85"/>`;
    // feather eye
    m+=`<ellipse cx="${tx}" cy="${ty}" rx="7.5" ry="5.5" transform="rotate(${ang*57.3+90} ${tx} ${ty})" ${F(INDIGO)} ${O(1.8)}/>`;
    m+=`<ellipse cx="${tx}" cy="${ty}" rx="4.8" ry="3.4" transform="rotate(${ang*57.3+90} ${tx} ${ty})" ${F(GOLD)} ${O(1.2)}/>`;
    m+=`<circle cx="${tx}" cy="${ty}" r="1.8" ${F(INK)}/>`;}
  // body + wings
  m+=`<path d="M${bx-14} ${by} C${bx-18} ${by-26} ${bx-8} ${by-42} ${bx+2} ${by-42} C${bx+18} ${by-40} ${bx+16} ${by-18} ${bx+12} ${by} Z" ${F(INDIGO)} ${O(2.4)}/>`;
  m+=`<path d="M${bx-14} ${by-14} C${bx-26} ${by-12} ${bx-32} ${by} ${bx-22} ${by+2} C${bx-12} ${by+4} ${bx-8} ${by-4} ${bx-6} ${by} Z" ${F(GREEN)} ${O(2)}/>`;
  // wing scales
  for(let i=0;i<4;i++)m+=`<path d="M${bx-10+i*5} ${by-18} q4 -7 8 0" ${O(1.2,CHALK)} opacity=".4"/>`;
  // neck
  m+=`<path d="M${bx-2} ${by-42} C${bx-10} ${by-54} ${bx-22} ${by-62} ${bx-24} ${by-74}" stroke="${INDIGO}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  m+=`<path d="M${bx-2} ${by-42} C${bx-10} ${by-54} ${bx-22} ${by-62} ${bx-24} ${by-74}" ${O(1.6,INK)}/>`;
  // head
  m+=`<circle cx="${bx-24}" cy="${bx>180?by-82:by-80}" r="7" ${F(INDIGO)} ${O(2)}/>`;
  m+=`<circle cx="${bx-21}" cy="${by-83}" r="1.8" ${F(CHALK)}/><circle cx="${bx-21}" cy="${by-83}" r="0.9" ${F(INK)}/>`;
  m+=`<path d="M${bx-30} ${by-82} l-8 -2" ${O(2.2,GOLD)} stroke-linecap="round"/>`;
  // crest
  for(let i=0;i<3;i++)m+=`<path d="M${bx-24+i*3} ${by-88} q${i*3-3} -7 ${i*3-3} -11" ${O(1.3,INK)}/><circle cx="${bx-24+i*3+(i*3-3)}" cy="${by-99}" r="2.2" ${F(GOLD)} ${O(1)}/>`;
  // legs
  m+=`<path d="M${bx-4} ${by} l-2 14M${bx+8} ${by} l2 14" ${O(2.4,INK)}/><path d="M${bx-9} ${by+14} h8M${bx+8} ${by+14} h8" ${O(1.8,INK)}/>`;
  return m+'</g>';
}

S.scenes.pattachitra=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED_L}"/><stop offset=".5" stop-color="${RED}"/><stop offset="1" stop-color="${RED_D}"/></linearGradient>
    <radialGradient id="pglow" cx="${SX}" cy="${SY}" r="180" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GOLD}" stop-opacity=".22"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <filter id="psoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="pdrop"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${INK}" flood-opacity=".25"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SX,'data-y':SY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lbg=L(0.02);
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#pbg)'}));
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#pglow)'}));
  // subtle vertical rib texture (like cloth grain)
  let tex='';const Rt=S.rng(33);
  for(let i=0;i<24;i++){const x=Rt()*W;tex+=`<line x1="${x}" y1="-10" x2="${x+Rt()*4-2}" y2="${H+10}" stroke="${INK}" stroke-width="${0.4+Rt()*0.3}" opacity="${0.07+Rt()*0.06}"/>`;}
  Lbg.innerHTML+=tex;

  // sun + rays (Pattachitra: geometric, stiff rays)
  const Lsun=L(0.06);
  const rays=S.el('g',{id:'rays',opacity:0});
  let rm='';
  for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2,w=6+(i%2)*4;
    rm+=`<path d="M${SX+Math.cos(a)*22} ${SY+Math.sin(a)*22} L${SX+Math.cos(a)*70} ${SY+Math.sin(a)*70} L${SX+Math.cos(a+0.05)*70} ${SY+Math.sin(a+0.05)*70} Z" fill="${GOLD}" opacity="${i%2?0.22:0.35}"/>`;}
  rays.innerHTML=rm; Lsun.appendChild(rays);
  let sm=`<circle cx="${SX}" cy="${SY}" r="28" ${F(GOLD)} ${O(3)}/>`; // bold outline
  sm+=`<circle cx="${SX}" cy="${SY}" r="20" ${F(CHALK)} opacity=".9"/>`;
  sm+=`<circle cx="${SX}" cy="${SY}" r="12" ${F(GOLD)}/>`;
  for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2;sm+=`<circle cx="${SX+Math.cos(a)*23}" cy="${SY+Math.sin(a)*23}" r="1.8" ${F(INK)}/>`;}
  Lsun.innerHTML+=sm;

  // TOP border: classic Pattachitra fish-eye border
  const Lbdr=L(0.04); let bd='';
  bd+=`<rect x="-10" y="20" width="${W+20}" height="28" fill="${INK}" opacity=".28"/>`;
  bd+=`<line x1="-10" y1="20" x2="${W+10}" y2="20" stroke="${GOLD}" stroke-width="1.8"/>`;
  bd+=`<line x1="-10" y1="48" x2="${W+10}" y2="48" stroke="${GOLD}" stroke-width="1.2"/>`;
  // fish-eye row in border
  for(let x=6;x<W;x+=20){
    bd+=`<ellipse cx="${x+7}" cy="34" rx="8.5" ry="11.5" ${F(RED_L)} ${O(1.6,GOLD)}/>`;
    bd+=`<ellipse cx="${x+7}" cy="34" rx="5.2" ry="7.5" ${F(GOLD)} opacity=".7"/>`;
    bd+=`<circle cx="${x+7}" cy="34" r="2.2" ${F(INK)}/>`;}
  // bottom border too
  bd+=`<rect x="-10" y="${H-46}" width="${W+20}" height="26" fill="${INK}" opacity=".22"/>`;
  bd+=`<line x1="-10" y1="${H-46}" x2="${W+10}" y2="${H-46}" stroke="${GOLD}" stroke-width="1.4"/>`;
  bd+=`<line x1="-10" y1="${H-20}" x2="${W+10}" y2="${H-20}" stroke="${GOLD}" stroke-width="1.2"/>`;
  for(let x=6;x<W;x+=22)bd+=`<ellipse cx="${x+8}" cy="${H-33}" rx="8" ry="10.5" ${F(INDIGO)} opacity=".8" ${O(1.4,GOLD)}/>`;
  Lbdr.innerHTML=bd;

  // background floral lattice (subtle, fills the red ground)
  const Lpat=L(0.08); let pat=''; const Rp=S.rng(8);
  for(let gx=30;gx<W;gx+=44)for(let gy=60;gy<H-50;gy+=44){
    pat+=`<circle cx="${gx}" cy="${gy}" r="2" fill="${GOLD}" opacity=".18"/>`;
    for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;
      pat+=`<path d="M${gx} ${gy} q${Math.cos(a)*10} ${Math.sin(a)*10} ${Math.cos(a)*16} ${Math.sin(a)*16}" stroke="${GOLD}" stroke-width="0.8" fill="none" opacity=".14"/>`;}
  }
  Lpat.innerHTML=pat;

  // mid: lotus pond
  const Llotus=L(0.14); let lot='';
  lot+=`<ellipse cx="195" cy="${H-90}" rx="180" ry="28" ${F(INDIGO)} opacity=".35" filter="url(#psoft)"/>`;
  lot+=pcLotus(138,H-104,18,CHALK)+pcLotus(195,H-114,22,GOLD)+pcLotus(252,H-104,16,CHALK);
  // fish in the pond
  lot+=pcFish(120,H-86,28,12,CHALK)+pcFish(196,H-80,34,-8,GOLD)+pcFish(264,H-88,26,6,CHALK);
  Llotus.innerHTML=lot;

  // hero: peacock (right of centre, above pond)
  const Lpk=L(0.18); const pk=S.el('g',{filter:'url(#pdrop)'}); pk.innerHTML=pcPeacock(276,366); Lpk.appendChild(pk);

  // left corner: small geometric motif (diamond + petals — kalamkari style)
  const Lcor=L(0.10); let cor='';
  const gem=(x,y,r)=>{let gm='';
    for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;gm+=`<path d="M${x} ${y} Q${x+Math.cos(a)*r*0.5} ${y+Math.sin(a)*r*0.5} ${x+Math.cos(a)*r} ${y+Math.sin(a)*r} Q${x+Math.cos(a+Math.PI/4)*r*0.5} ${y+Math.sin(a+Math.PI/4)*r*0.5} ${x} ${y}Z" ${F(i%2?GOLD:CHALK)} ${O(1.4)}/>`;}
    gm+=`<circle cx="${x}" cy="${y}" r="${r*0.2}" ${F(INK)}/>`;return gm;};
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)cor+=gem(24+i*26, 90+j*32, 10);
  Lcor.innerHTML=cor;

  // dust
  const Lf=L(0.5);let fp='';
  for(let i=0;i<12;i++){const x=20+Math.random()*350,y=60+Math.random()*320,r=0.7+Math.random()*1.4;
    fp+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" opacity="${0.18+Math.random()*0.3}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=fp;
};
})();
