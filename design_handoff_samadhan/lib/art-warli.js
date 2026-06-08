/* ============================================================
   SAMADHAN · art-warli.js  — "Warli Monochrome"
   White chalk stick figures on terracotta mud ground.
   Tarpa dance circle, geometric houses, fishbone trees.
   Maharashtra tribal tradition — purely geometric, never figurative
   in a "realistic" sense. Only circles, triangles, lines.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const CHALK='#F5EDD5', CHALK2='#EDE0C2', TERR1='#9A6030', TERR2='#8B5220', TERR3='#7A4418';
const SX=295, SY=108;

function rFig(cx,cy,ang,sc){
  sc=sc||1; const bh=14*sc, bw=8*sc;
  return `<g transform="rotate(${ang*180/Math.PI} ${cx} ${cy})" opacity=".92">
    <circle cx="${cx}" cy="${cy-24*sc}" r="${5*sc}" fill="${CHALK}"/>
    <path d="M${cx} ${cy-20*sc} L${cx-bw/2} ${cy-20*sc+bh} L${cx+bw/2} ${cy-20*sc+bh} Z" fill="${CHALK}"/>
    <path d="M${cx-bw/2} ${cy-20*sc+bh} L${cx-bw*0.7} ${cy} L${cx} ${cy-20*sc+bh} Z" fill="${CHALK}"/>
    <path d="M${cx+bw/2} ${cy-20*sc+bh} L${cx+bw*0.7} ${cy} L${cx} ${cy-20*sc+bh} Z" fill="${CHALK}"/>
    <line x1="${cx-bw/2}" y1="${cy-20*sc+bh*0.4}" x2="${cx-bw*1.45}" y2="${cy-20*sc+bh*1.1}" stroke="${CHALK}" stroke-width="${1.6*sc}" stroke-linecap="round"/>
    <line x1="${cx+bw/2}" y1="${cy-20*sc+bh*0.4}" x2="${cx+bw*1.45}" y2="${cy-20*sc+bh*1.1}" stroke="${CHALK}" stroke-width="${1.6*sc}" stroke-linecap="round"/>
  </g>`;
}
function rTree(x,y,h,sc){
  sc=sc||1; let m=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-h}" stroke="${CHALK}" stroke-width="${2*sc}" stroke-linecap="round" opacity=".88"/>`;
  const n=Math.round(h/14);
  for(let i=1;i<n;i++){const ty=y-i*(h/n),bw=(h-i*(h/n))*0.44*sc;
    m+=`<line x1="${x-bw}" y1="${ty}" x2="${x+bw}" y2="${ty}" stroke="${CHALK}" stroke-width="${1.4*sc}" stroke-linecap="round" opacity=".82"/>`;
    m+=`<circle cx="${x-bw}" cy="${ty}" r="${1.5*sc}" fill="${CHALK}" opacity=".8"/>`;
    m+=`<circle cx="${x+bw}" cy="${ty}" r="${1.5*sc}" fill="${CHALK}" opacity=".8"/>`;}
  m+=`<circle cx="${x}" cy="${y-h}" r="${2.8*sc}" fill="${CHALK}" opacity=".85"/>`;
  return m;
}
function rHouse(x,y,w,h){
  return `<rect x="${x}" y="${y-h}" width="${w}" height="${h}" fill="${CHALK}" opacity=".18" stroke="${CHALK}" stroke-width="1.5"/>
    <path d="M${x-2} ${y-h} L${x+w/2} ${y-h-w*0.52} L${x+w+2} ${y-h} Z" stroke="${CHALK}" stroke-width="1.4" fill="${CHALK}" opacity=".85"/>
    <rect x="${x+w*0.36}" y="${y-h*0.46}" width="${w*0.27}" height="${h*0.46}" fill="${TERR2}" opacity=".9"/>`;
}

S.scenes.warli=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="wbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TERR1}"/><stop offset=".55" stop-color="${TERR2}"/><stop offset="1" stop-color="${TERR3}"/></linearGradient>
    <radialGradient id="wglow" cx="${SX}" cy="${SY}" r="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${CHALK}" stop-opacity=".28"/><stop offset="1" stop-color="${CHALK}" stop-opacity="0"/></radialGradient>
    <filter id="wsoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SX,'data-y':SY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lbg=L(0.02);
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#wbg)'}));
  Lbg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#wglow)'}));
  // subtle horizontal texture
  let tex='';const R1=S.rng(17);
  for(let i=0;i<18;i++){const y=R1()*H;tex+=`<line x1="-10" y1="${y}" x2="${W+10}" y2="${y+R1()*3-1.5}" stroke="${CHALK}" stroke-width="${0.4+R1()*0.3}" opacity="${0.04+R1()*0.06}"/>`;}
  Lbg.innerHTML+=tex;

  // top + bottom geometric border
  const Lbdr=L(0.04); let bd='';
  bd+=`<line x1="-10" y1="26" x2="${W+10}" y2="26" stroke="${CHALK}" stroke-width="1.5" opacity=".55"/>`;
  bd+=`<line x1="-10" y1="46" x2="${W+10}" y2="46" stroke="${CHALK}" stroke-width="0.9" opacity=".35"/>`;
  for(let x=0;x<W;x+=14){
    bd+=`<path d="M${x} 46 L${x+7} 28 L${x+14} 46 Z" fill="${CHALK}" opacity=".42"/>`;
    bd+=`<circle cx="${x+7}" cy="${28}" r="1.8" fill="${CHALK}" opacity=".5"/>`;
  }
  bd+=`<line x1="-10" y1="${H-34}" x2="${W+10}" y2="${H-34}" stroke="${CHALK}" stroke-width="1.2" opacity=".4"/>`;
  for(let x=0;x<W;x+=14)bd+=`<path d="M${x} ${H-34} L${x+7} ${H-20} L${x+14} ${H-34} Z" fill="${CHALK}" opacity=".35"/>`;
  Lbdr.innerHTML=bd;

  // sun
  const Lsun=L(0.06);
  const rays=S.el('g',{id:'rays',opacity:0,filter:'url(#wsoft)'});
  let rm='';
  for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;
    rm+=`<path d="M${SX+Math.cos(a)*26} ${SY+Math.sin(a)*26} L${SX+Math.cos(a)*66} ${SY+Math.sin(a)*66} L${SX+Math.cos(a+0.06)*66} ${SY+Math.sin(a+0.06)*66} Z" fill="${CHALK}" opacity=".22"/>`;
    rm+=`<line x1="${SX+Math.cos(a)*27}" y1="${SY+Math.sin(a)*27}" x2="${SX+Math.cos(a)*46}" y2="${SY+Math.sin(a)*46}" stroke="${CHALK}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`;}
  rays.innerHTML=rm; Lsun.appendChild(rays);
  let sm=`<circle cx="${SX}" cy="${SY}" r="23" fill="${CHALK}" opacity=".88"/>`;
  sm+=`<circle cx="${SX}" cy="${SY}" r="16" fill="${CHALK}" opacity=".7"/>`;
  sm+=`<circle cx="${SX}" cy="${SY}" r="9" fill="${TERR2}"/>`;
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;sm+=`<circle cx="${SX+Math.cos(a)*19}" cy="${SY+Math.sin(a)*19}" r="1.6" fill="${TERR2}"/>`;}
  Lsun.innerHTML+=sm;

  // nature: trees and birds
  const Lnat=L(0.10); let nat='';
  nat+=rTree(52,318,78,1);nat+=rTree(344,306,62,0.9);nat+=rTree(22,348,46,0.7);
  nat+=`<path d="M72 196 q5 -5 10 0 q5 -5 10 0" stroke="${CHALK}" stroke-width="1.5" fill="none" stroke-linecap="round" class="bird" style="--i:0" opacity=".7"/>`;
  nat+=`<path d="M102 180 q4 -4 8 0 q4 -4 8 0" stroke="${CHALK}" stroke-width="1.2" fill="none" stroke-linecap="round" class="bird" style="--i:1" opacity=".65"/>`;
  Lnat.innerHTML=nat;

  // village: houses + ground line
  const Lvil=L(0.13); let vm='';
  vm+=rHouse(22,318,40,30);vm+=rHouse(70,318,28,22);
  vm+=`<line x1="-10" y1="318" x2="${W+10}" y2="318" stroke="${CHALK}" stroke-width="1.2" opacity=".4"/>`;
  // scattered field dots
  const R2=S.rng(44);
  for(let i=0;i<16;i++){const fx=20+R2()*340,fy=324+R2()*90;
    if(fx>155&&fx<295&&fy>330&&fy<430)continue;
    vm+=`<circle cx="${fx}" cy="${fy}" r="${1.2+R2()*1.4}" fill="${CHALK}" opacity="${0.28+R2()*0.32}"/>`;}
  // wave water bottom
  for(let w=0;w<2;w++){let wp=`M-10 ${416+w*14}`;
    for(let x=-10;x<=W+10;x+=22)wp+=` q11 -7 22 0`;
    vm+=`<path d="${wp}" stroke="${CHALK}" stroke-width="1.1" fill="none" opacity="${0.28-w*0.07}"/>`;}
  Lvil.innerHTML=vm;

  // HERO: Tarpa dance circle
  const Ldance=L(0.18); let dm='';
  const dcx=218,dcy=374,dr=70,nf=14;
  dm+=`<circle cx="${dcx}" cy="${dcy}" r="${dr+2}" stroke="${CHALK}" stroke-width="1.2" fill="none" stroke-dasharray="4 6" opacity=".3"/>`;
  for(let i=0;i<nf;i++){
    const a=(i/nf)*Math.PI*2-Math.PI/2;
    const fx=dcx+Math.cos(a)*dr,fy=dcy+Math.sin(a)*dr;
    dm+=rFig(fx,fy,a+Math.PI/2,0.86);
    const na=((i+1)/nf)*Math.PI*2-Math.PI/2;
    const nfx=dcx+Math.cos(na)*dr,nfy=dcy+Math.sin(na)*dr;
    const hax=fx+Math.cos(a+Math.PI/2)*9,hay=fy+Math.sin(a+Math.PI/2)*9;
    const hnx=nfx+Math.cos(na+Math.PI/2)*9,hny=nfy+Math.sin(na+Math.PI/2)*9;
    dm+=`<line x1="${hax}" y1="${hay}" x2="${hnx}" y2="${hny}" stroke="${CHALK}" stroke-width="1.1" opacity=".38"/>`;}
  // musician + tarpa horn
  dm+=rFig(dcx,dcy-10,0,1.12);
  dm+=`<path d="M${dcx-16} ${dcy+2} q-20 0 -26 -20" stroke="${CHALK}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>`;
  dm+=`<circle cx="${dcx-42}" cy="${dcy-18}" r="4.5" fill="${CHALK}" opacity=".8"/>`;
  Ldance.innerHTML=dm;

  // dust
  const Lf=L(0.5);let fp='';
  for(let i=0;i<10;i++){const x=20+Math.random()*350,y=100+Math.random()*280,r=0.7+Math.random()*1.2;
    fp+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${CHALK}" opacity="${0.2+Math.random()*0.28}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=fp;
};
})();
