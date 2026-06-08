/* ============================================================
   SAMADHAN · art-pichwai.js  — "Pichwai Cyan"
   Nathdwara cloth painting — deep peacock-teal ground, gold lotus
   blooms, moonlit night, cows/calves in pastoral scene, gold detail.
   Dense with flowers; no empty ground. Sacred but non-specific.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const TEAL='#083444', TEAL2='#0C3E50', TEAL3='#0E4A5C';
const GOLD='#D4A017', GOLD_L='#EBD584', GOLD_D='#A87C10';
const IVORY='#F5EDD5', GREEN='#1A6A3A', RED='#B52C2C', PINK='#D4789A';
const MX=310, MY=92;

const OG=(w)=>`stroke="${GOLD}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

// Gold lotus (the defining motif of Pichwai — seen everywhere)
function piLotus(cx,cy,r,col){
  col=col||GOLD; const n=12;let m='<g>';
  for(let i=0;i<n;i++){const a=(i/n)*360;
    m+=`<path d="M${cx} ${cy} Q${cx-r*0.28} ${cy-r*0.7} ${cx} ${cy-r} Q${cx+r*0.28} ${cy-r*0.7} ${cx} ${cy}Z" transform="rotate(${a} ${cx} ${cy})" fill="${col}" fill-opacity=".88" stroke="${GOLD_D}" stroke-width="1.2"/>`;}
  for(let i=0;i<n;i++){const a=(i/n)*360+15;
    m+=`<path d="M${cx} ${cy} Q${cx-r*0.18} ${cy-r*0.44} ${cx} ${cy-r*0.66} Q${cx+r*0.18} ${cy-r*0.44} ${cx} ${cy}Z" transform="rotate(${a} ${cx} ${cy})" fill="${GOLD_L}" opacity=".7"/>`;}
  m+=`<circle cx="${cx}" cy="${cy}" r="${r*0.22}" fill="${GOLD_L}" stroke="${GOLD_D}" stroke-width="1.2"/>`;
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;m+=`<circle cx="${cx+Math.cos(a)*r*0.14}" cy="${cy+Math.sin(a)*r*0.14}" r="0.9" fill="${GOLD_D}" opacity=".8"/>`;}
  return m+'</g>';
}
function piPad(cx,cy,r){
  return `<path d="M${cx-r} ${cy} a${r} ${r} 0 1 1 2 0 Z" fill="${GREEN}" fill-opacity=".75" stroke="${GOLD_D}" stroke-width="1.2"/>
    ${Array.from({length:5},(_,i)=>{const a=(-60+i*30)*Math.PI/180;return `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*r*0.9}" y2="${cy+Math.sin(a)*r*0.9}" stroke="${GOLD_D}" stroke-width="0.8" opacity=".55"/>`;}).join('')}`;
}

// cow silhouette (gau-mata, signature Pichwai element)
function piCow(bx,by,sc,col){
  sc=sc||1; col=col||IVORY; let m='<g>';
  const W28=28*sc,H18=18*sc,W13=13*sc,H10=10*sc;
  m+=`<ellipse cx="${bx}" cy="${by}" rx="${W28}" ry="${H18}" fill="${col}" fill-opacity=".82" stroke="${GOLD_D}" stroke-width="${1.4*sc}"/>`;
  // legs
  for(const dx of [-14,-6,6,14]){const lx=bx+dx*sc-2*sc,ly=by+14*sc;
    m+=`<rect x="${lx}" y="${ly}" width="${4*sc}" height="${18*sc}" rx="${2*sc}" fill="${col}" fill-opacity=".82" stroke="${GOLD_D}" stroke-width="${sc}"/>`;}
  // head
  const hx=bx-32*sc, hy=by-8*sc;
  m+=`<ellipse cx="${hx}" cy="${hy}" rx="${W13}" ry="${H10}" fill="${col}" fill-opacity=".85" stroke="${GOLD_D}" stroke-width="${1.4*sc}"/>`;
  // ear
  m+=`<path d="M${bx-38*sc} ${by-14*sc} q${-6*sc} ${-4*sc} ${-8*sc} 0" fill="${PINK}" fill-opacity=".8" stroke="${GOLD_D}" stroke-width="${sc}"/>`;
  // eye
  const ex=bx-37*sc, ey=by-9*sc;
  m+=`<circle cx="${ex}" cy="${ey}" r="${2.4*sc}" fill="${GOLD_D}"/><circle cx="${ex}" cy="${ey}" r="${1.1*sc}" fill="${IVORY}"/>`;
  // tail
  m+=`<path d="M${bx+28*sc} ${by} q${10*sc} ${-8*sc} ${8*sc} ${-18*sc}" stroke="${col}" stroke-width="${3*sc}" fill="none" stroke-linecap="round"/>`;
  m+=`<ellipse cx="${bx+36*sc}" cy="${by-18*sc}" rx="${4*sc}" ry="${7*sc}" fill="${col}" fill-opacity=".7" stroke="${GOLD_D}" stroke-width="${sc}"/>`;
  // hump + dewlap
  m+=`<path d="M${bx-10*sc} ${by-18*sc} q${6*sc} ${-12*sc} ${16*sc} ${-8*sc}" stroke="${col}" stroke-width="${6*sc}" fill="none" stroke-linecap="round"/>`;
  m+=`<path d="M${bx-28*sc} ${by} q${-6*sc} ${12*sc} ${-12*sc} ${10*sc}" stroke="${col}" stroke-width="${5*sc}" fill="none" stroke-linecap="round"/>`;
  // garland
  for(let g=0;g<6;g++){const gx=bx-22*sc+g*8*sc, gy=by-6*sc+Math.sin(g)*4*sc;
    m+=`<circle cx="${gx}" cy="${gy}" r="${3*sc}" fill="${g%2?RED:GOLD}" fill-opacity=".9" stroke="${GOLD_D}" stroke-width="0.8"/>`;}
  return m+'</g>';
}

// Full moon (central feature of Pichwai Sharad Purnima scenes)
function piMoon(cx,cy,r){
  return `<circle cx="${cx}" cy="${cy}" r="${r*1.5}" fill="${GOLD}" fill-opacity=".08"/>
    <circle cx="${cx}" cy="${cy}" r="${r*1.1}" fill="${GOLD}" fill-opacity=".14"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${GOLD_L}" fill-opacity=".92" stroke="${GOLD}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r*0.72}" fill="${GOLD_L}" opacity=".8"/>`;
}

// Gold arabesque garland (connects motifs)
function piGarland(x1,y1,x2,y2,n,sc){
  sc=sc||1; let m='';
  const dx=(x2-x1)/n,dy=(y2-y1)/n;
  const droop=20*sc;
  m+=`<path d="M${x1} ${y1}`;
  for(let i=0;i<=n;i++){const x=x1+i*dx,y=y1+i*dy+Math.sin(i/n*Math.PI)*droop;
    m+=` L${x} ${y}`;}
  m+=`" ${OG(1.4)} opacity=".6"/>`;
  for(let i=0;i<=n;i++){const x=x1+i*dx,y=y1+i*dy+Math.sin(i/n*Math.PI)*droop;
    if(i%2===0) m+=piLotus(x,y,7*sc,i%4===0?RED:GOLD);
    else m+=`<circle cx="${x}" cy="${y}" r="${2.5*sc}" fill="${GREEN}" stroke="${GOLD_D}" stroke-width="0.9"/>`;}
  return m;
}

S.scenes.pichwai=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="pbg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TEAL3}"/><stop offset=".5" stop-color="${TEAL2}"/><stop offset="1" stop-color="${TEAL}"/></linearGradient>
    <radialGradient id="pglow2" cx="${MX}" cy="${MY}" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GOLD_L}" stop-opacity=".42"/><stop offset=".5" stop-color="${GOLD}" stop-opacity=".12"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <filter id="pibm" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="pisoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':MX,'data-y':MY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lbg=L(0.02);
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#pbg2)'}));
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#pglow2)'}));
  // teal weave texture (cloth ground — Pichwai painted on cloth)
  let tex='';
  for(let i=-4;i<22;i++){tex+=`<line x1="${i*24}" y1="-10" x2="${i*24+220}" y2="${H+10}" stroke="${GOLD}" stroke-width="0.5" opacity=".055"/>`;
    tex+=`<line x1="${i*24}" y1="${H+10}" x2="${i*24+220}" y2="-10" stroke="${GOLD}" stroke-width="0.5" opacity=".04"/>`;}
  Lbg.innerHTML+=tex;

  // moon glow + full moon
  const Lmoon=L(0.06);
  Lmoon.appendChild(S.el('circle',{cx:MX,cy:MY,r:44,fill:GOLD_L,opacity:.16,filter:'url(#pibm)'}));
  Lmoon.innerHTML+=piMoon(MX,MY,26);
  // twinkling stars
  const R=S.rng(77); let st='';
  for(let i=0;i<22;i++){const x=14+R()*362,y=44+R()*260,r=0.8+R()*1.5;
    if(Math.hypot(x-MX,y-MY)<40) continue;
    st+=`<g class="twinkle" style="--i:${i%7}"><path d="M${x} ${y-r} l${r*0.3} ${r*0.7} l${r*0.7} 0 l-${r*0.55} ${r*0.5} l${r*0.22} ${r*0.7} l-${r*0.67} -${r*0.45} l-${r*0.67} ${r*0.45} l${r*0.22} -${r*0.7} l-${r*0.55} -${r*0.5} l${r*0.7} 0 Z" fill="${GOLD_L}" opacity=".7"/></g>`;}
  Lmoon.innerHTML+=st;

  // top hashiya border — gold lotus chain
  const Lbdr=L(0.04); let bd='';
  bd+=`<rect x="-10" y="20" width="${W+20}" height="24" fill="${GOLD}" fill-opacity=".14"/>`;
  bd+=`<line x1="-10" y1="20" x2="${W+10}" y2="20" ${OG(1.8)} opacity=".8"/>`;
  bd+=`<line x1="-10" y1="44" x2="${W+10}" y2="44" ${OG(1.2)} opacity=".55"/>`;
  for(let x=6;x<W;x+=26)bd+=piLotus(x+10,32,8,x%52<26?GOLD:RED);
  // connecting dots
  for(let x=19;x<W;x+=26)bd+=`<circle cx="${x}" cy="32" r="2.4" fill="${GREEN}" stroke="${GOLD_D}" stroke-width="0.8"/>`;
  bd+=`<rect x="-10" y="${H-40}" width="${W+20}" height="22" fill="${GOLD}" fill-opacity=".12"/>`;
  bd+=`<line x1="-10" y1="${H-40}" x2="${W+10}" y2="${H-40}" ${OG(1.6)} opacity=".7"/>`;
  for(let x=6;x<W;x+=22)bd+=piLotus(x+8,H-29,7,x%44<22?RED:GOLD);
  Lbdr.innerHTML=bd;

  // dense background lotus field (mid)
  const Lfield=L(0.08); let fld='';
  const Rf=S.rng(13);
  for(let i=0;i<16;i++){const x=30+Rf()*320,y=90+Rf()*320,r=10+Rf()*14,col=[GOLD,RED,PINK][Math.floor(Rf()*3)];
    if(Math.hypot(x-MX,y-MY)<50&&y<160)continue; // keep around moon clear
    fld+=piLotus(x,y,r,col);}
  // lotus pads scattered
  for(let i=0;i<10;i++){const x=20+Rf()*350,y=200+Rf()*200;fld+=piPad(x,y,12+Rf()*8);}
  Lfield.innerHTML=fld;

  // GARLAND — top drooping garland of lotuses (the signature Pichwai framing)
  const Lgar=L(0.12); Lgar.innerHTML=piGarland(0,56,W,56,16,0.92)+piGarland(0,88,W,88,18,0.76);

  // cows — the pastoral heart of Pichwai
  const Lcow=L(0.22); let cm='';
  cm+=piCow(104,390,0.84,IVORY);
  cm+=piCow(274,402,0.7,GOLD_L);
  // a calf (smaller, behind first cow)
  cm+=piCow(148,408,0.46,IVORY);
  // ground band
  cm+=`<path d="M-10 416 Q195 406 ${W+10} 416 L${W+10} ${H+10} L-10 ${H+10} Z" fill="${GREEN}" fill-opacity=".28" stroke="${GOLD_D}" stroke-width="1"/>`;
  // ground lotuses at feet
  cm+=piLotus(60,418,8,RED)+piLotus(200,422,7,GOLD)+piLotus(336,418,9,RED);
  Lcow.innerHTML=cm;

  // gold dust
  const Lf=L(0.5);let fp='';
  for(let i=0;i<18;i++){const x=20+Math.random()*350,y=60+Math.random()*380,r=0.7+Math.random()*1.4;
    fp+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD_L}" opacity="${0.2+Math.random()*0.35}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=fp;
};
})();
