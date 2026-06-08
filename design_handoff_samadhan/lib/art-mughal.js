/* ============================================================
   SAMADHAN · art-mughal.js  — "Mughal Indigo" (miniature)
   Cusped arch + onion dome + jali lattice + crescent moon,
   cypresses & gold arabesque. Deep indigo, gold-leaf, emerald.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const GOLD='#D4AF37', GOLD_L='#EBD584', IND='#1B2356', IND_L='#2A3576', EM='#1F9E72', EM_D='#15724F', IVORY='#F3ECDA', CRIM='#B5322F';
const MX=300, MY=92;

function cubic(p,t){const u=1-t;return [u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6], u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]];}
function archPath(cx,sy,w,h){const hf=w/2;
  return `M${cx-hf} ${sy} C${cx-hf} ${sy-h*0.55} ${cx-hf*0.2} ${sy-h} ${cx} ${sy-h} C${cx+hf*0.2} ${sy-h} ${cx+hf} ${sy-h*0.55} ${cx+hf} ${sy} Z`;}

function onionDome(cx,by,r){
  let m=`<path d="M${cx-r} ${by} C${cx-r} ${by-r*1.05} ${cx-r*0.5} ${by-r*1.5} ${cx} ${by-r*1.55} C${cx+r*0.5} ${by-r*1.5} ${cx+r} ${by-r*1.05} ${cx+r} ${by} Z" fill="${IND_L}" stroke="${GOLD}" stroke-width="1.6"/>`;
  m+=`<rect x="${cx-r}" y="${by}" width="${r*2}" height="${r*0.5}" fill="${IND_L}" stroke="${GOLD}" stroke-width="1.2"/>`;
  m+=`<line x1="${cx}" y1="${by-r*1.55}" x2="${cx}" y2="${by-r*1.9}" stroke="${GOLD}" stroke-width="1.4"/><circle cx="${cx}" cy="${by-r*1.98}" r="2.6" fill="${GOLD}"/><path d="M${cx} ${by-r*2.05} l0 -5" stroke="${GOLD}" stroke-width="1.2"/>`;
  // flanking minaret hints
  m+=`<rect x="${cx-r*1.5}" y="${by-r*1.2}" width="3" height="${r*1.2+r*0.5}" fill="${IND_L}" stroke="${GOLD}" stroke-width="0.8"/><circle cx="${cx-r*1.5+1.5}" cy="${by-r*1.2}" r="3" fill="${IND_L}" stroke="${GOLD}" stroke-width="0.8"/>`;
  m+=`<rect x="${cx+r*1.5-3}" y="${by-r*1.2}" width="3" height="${r*1.2+r*0.5}" fill="${IND_L}" stroke="${GOLD}" stroke-width="0.8"/><circle cx="${cx+r*1.5-1.5}" cy="${by-r*1.2}" r="3" fill="${IND_L}" stroke="${GOLD}" stroke-width="0.8"/>`;
  return m;
}
function cypress(x,by,h){const w=h*0.13;
  return `<path d="M${x} ${by-h} C${x-w} ${by-h*0.55} ${x-w} ${by-h*0.12} ${x} ${by} C${x+w} ${by-h*0.12} ${x+w} ${by-h*0.55} ${x} ${by-h} Z" fill="${EM_D}" stroke="${EM}" stroke-width="1.2"/>`+
    `<path d="M${x} ${by-h*0.9} q-2 ${h*0.4} 0 ${h*0.85}" stroke="${EM}" stroke-width="0.7" fill="none" opacity=".6"/>`+
    `<rect x="${x-1}" y="${by}" width="2" height="6" fill="${GOLD}" opacity=".6"/>`;
}
function crescent(cx,cy,r){
  return `<path d="M${cx} ${cy-r} a${r} ${r} 0 1 0 ${r*0.55} ${r*1.9} a${r*0.82} ${r*0.82} 0 1 1 ${-r*0.55} ${-r*1.9} Z" fill="${GOLD}" opacity=".92"/>`;
}
function star(x,y,r){return `<path d="M${x} ${y-r} l${r*0.28} ${r*0.7} L${x+r} ${y} l${-r*0.72} ${r*0.28} L${x} ${y+r} l${-r*0.28} ${-r*0.72} L${x-r} ${y} l${r*0.72} ${-r*0.28} Z" fill="${GOLD_L}"/>`;}
function arabesque(x,y,sc,flip){const f=flip?-1:1;
  return `<g transform="translate(${x} ${y}) scale(${f*sc} ${sc})">
    <path d="M0 0 C18 -2 30 -14 34 -34 C36 -20 30 -6 12 0 C30 4 40 14 40 30" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M34 -34 c-6 -2 -10 2 -8 8 c5 1 9 -2 8 -8Z" fill="${EM}" stroke="${GOLD}" stroke-width="0.8"/>
    <path d="M12 0 c-4 4 -3 10 3 11 c2 -5 0 -9 -3 -11Z" fill="${GOLD}" opacity=".8"/>
    <circle cx="40" cy="30" r="3" fill="${CRIM}" stroke="${GOLD}" stroke-width="0.8"/>
  </g>`;
}

S.scenes.mughal=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="ind" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3576"/><stop offset=".5" stop-color="#1A2256"/><stop offset="1" stop-color="#0C1030"/></linearGradient>
    <radialGradient id="moon" cx="${MX}" cy="${MY}" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E9D38A" stop-opacity=".5"/><stop offset=".4" stop-color="#D4AF37" stop-opacity=".18"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></radialGradient>
    <radialGradient id="archglow" cx="0.5" cy="0.62" r="0.6"><stop offset="0" stop-color="#3A4690" stop-opacity=".9"/><stop offset="1" stop-color="#161D49" stop-opacity=".95"/></radialGradient>
    <linearGradient id="chan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243072"/><stop offset="1" stop-color="#10153A"/></linearGradient>
    <clipPath id="archClip"><path d="${archPath(202,432,182,210)}"/></clipPath>
    <filter id="gsoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="gbloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':MX,'data-y':MY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  // sky + moon glow
  const Lsky=L(0.02);
  Lsky.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#ind)'}));
  Lsky.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#moon)'}));

  // stars (twinkling)
  const Lstar=L(0.05); let st=''; const R=S.rng(11);
  for(let i=0;i<26;i++){const x=14+R()*362,y=46+R()*250,r=1+R()*1.8,op=y<150&&x<200?0.4:1;
    st+=`<g class="twinkle" style="--i:${i%6};opacity:${op}">${star(x,y,r)}</g>`;}
  Lstar.innerHTML=st;
  // crescent moon
  const Lmoon=L(0.06); Lmoon.innerHTML=`<g filter="url(#gbloom)"><circle cx="${MX}" cy="${MY}" r="20" fill="${GOLD}" opacity=".35"/></g>`+crescent(MX,MY,15);

  // top hashiya (gold border with floral)
  const Lborder=L(0.04); let bd='';
  bd+=`<line x1="-6" y1="30" x2="${W+6}" y2="30" stroke="${GOLD}" stroke-width="1.4" opacity=".8"/><line x1="-6" y1="35" x2="${W+6}" y2="35" stroke="${GOLD}" stroke-width="0.8" opacity=".5"/>`;
  for(let x=8;x<W;x+=26)bd+=`<g transform="translate(${x} 32.5)"><path d="M0 0 q3 -4 6 0 q-3 4 -6 0Z" fill="${GOLD}" opacity=".7"/><circle cx="3" cy="0" r="1" fill="${EM}"/></g>`;
  Lborder.innerHTML=bd;

  // corner arabesque flourishes
  const Larab=L(0.07);
  Larab.innerHTML=arabesque(20,52,0.7,false)+arabesque(370,52,0.7,true);

  // === central cusped arch with jali + dome ===
  const Larch=L(0.16); let am='';
  const ax=202, asy=432, aw=182, ah=210;
  // interior
  am+=`<path d="${archPath(ax,asy,aw,ah)}" fill="url(#archglow)"/>`;
  // clipped interior content
  am+=`<g clip-path="url(#archClip)">`;
  // jali trellis
  for(let i=-10;i<22;i++){am+=`<line x1="${i*22}" y1="200" x2="${i*22+260}" y2="460" stroke="${GOLD}" stroke-width="0.8" opacity=".22"/><line x1="${i*22}" y1="460" x2="${i*22+260}" y2="200" stroke="${GOLD}" stroke-width="0.8" opacity=".18"/>`;}
  // crossing studs
  for(let gx=120;gx<290;gx+=22)for(let gy=240;gy<430;gy+=22)am+=`<circle cx="${gx}" cy="${gy}" r="1.1" fill="${GOLD_L}" opacity=".5"/>`;
  // moon glow behind dome
  am+=`<circle cx="${ax}" cy="320" r="60" fill="${GOLD}" opacity=".10" filter="url(#gbloom)"/>`;
  // onion-domed pavilion
  am+=onionDome(ax,372,30);
  // a slim emerald cypress pair inside, flanking the dome
  am+=cypress(ax-58,400,84)+cypress(ax+58,400,84);
  am+=`</g>`;
  // arch outline (thick gold) + inner concentric line
  am+=`<path d="${archPath(ax,asy,aw,ah)}" fill="none" stroke="${GOLD}" stroke-width="3"/>`;
  am+=`<path d="${archPath(ax,asy-6,aw*0.9,ah*0.9)}" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity=".7"/>`;
  // cusp studs along inner arch
  const pL=[ax-aw*0.45,asy-6,ax-aw*0.45,asy-6-ah*0.9*0.55,ax-aw*0.45*0.2,asy-6-ah*0.9,ax,asy-6-ah*0.9];
  for(let i=0;i<=7;i++){const [px,py]=cubic(pL,i/7);am+=`<circle cx="${px}" cy="${py}" r="2.2" fill="${GOLD}"/><circle cx="${2*ax-px}" cy="${py}" r="2.2" fill="${GOLD}"/>`;}
  // keystone
  am+=`<path d="M${ax-5} ${asy-ah-2} l5 -8 5 8 -5 4Z" fill="${GOLD}"/>`;
  Larch.innerHTML=am;

  // flanking cypresses (outside arch, foreground garden)
  const Lcyp=L(0.24);
  Lcyp.innerHTML=cypress(34,438,150)+cypress(370,438,150)+
    `<ellipse cx="34" cy="438" rx="14" ry="4" fill="#05071c" opacity=".5"/><ellipse cx="370" cy="438" rx="14" ry="4" fill="#05071c" opacity=".5"/>`;

  // reflecting water channel (mostly behind the card, gives a luxe base)
  const Lchan=L(0.3);
  Lchan.appendChild(S.el('rect',{x:-20,y:436,width:W+40,height:H-436+40,fill:'url(#chan)'}));
  let rip=`<g transform="translate(0 ${2*436}) scale(1 -1)" opacity=".25" clip-path="url(#archClip)">${onionDome(ax,372,30)}</g>`;
  for(let r=0;r<5;r++)rip+=`<rect x="-20" y="${446+r*9}" width="${W+40}" height="1.1" fill="${GOLD_L}" opacity="${0.18-r*0.03}"/>`;
  rip+=`<rect x="${ax-22}" y="436" width="44" height="40" fill="${GOLD}" opacity=".08" filter="url(#gsoft)"/>`;
  Lchan.innerHTML+=rip;

  // gold dust
  const Ldust=L(0.55); let dm='';
  for(let i=0;i<16;i++){const x=20+Math.random()*350,y=120+Math.random()*240,r=0.7+Math.random()*1.4;
    dm+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD_L}" opacity="${0.25+Math.random()*0.4}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Ldust.innerHTML=dm;
};
})();
