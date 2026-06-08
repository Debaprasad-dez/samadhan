/* ============================================================
   SAMADHAN · art-mithila.js  — "Mithila Bloom" (Madhubani)
   Peacock + Surya + lotus pond with fish, bold black outlines,
   madder-red / peacock-teal / turmeric on cream paper.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const INK='#241A12', RED='#B5322F', TEAL='#0E7C7B', TEAL_D='#0A5E5D', TUR='#E0A211', GREEN='#5C8C3F', PINK='#D17A93', CREAM='#FBF1D8';
const SX=322, SY=88;

const O=(w)=>`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---- Surya: a sun with a face, ring of alternating petals ---- */
function surya(cx,cy,r){
  let m='<g>';
  const n=18;
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2,col=i%2?RED:TUR,r1=r*1.08,r2=r*1.62,wn=0.09;
    const x1=cx+Math.cos(a-wn)*r1,y1=cy+Math.sin(a-wn)*r1,x2=cx+Math.cos(a)*r2,y2=cy+Math.sin(a)*r2,x3=cx+Math.cos(a+wn)*r1,y3=cy+Math.sin(a+wn)*r1;
    m+=`<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z" fill="${col}" ${O(1.4)}/>`;}
  m+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${TUR}" ${O(2)}/>`;
  m+=`<circle cx="${cx}" cy="${cy}" r="${r*0.78}" fill="${CREAM}" ${O(1.2)}/>`;
  // dotted ring
  for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;m+=`<circle cx="${cx+Math.cos(a)*r*0.88}" cy="${cy+Math.sin(a)*r*0.88}" r="1.3" fill="${RED}"/>`;}
  // face
  m+=`<circle cx="${cx-r*0.3}" cy="${cy-r*0.12}" r="2.4" fill="${INK}"/><circle cx="${cx+r*0.3}" cy="${cy-r*0.12}" r="2.4" fill="${INK}"/>`;
  m+=`<path d="M${cx-1.5} ${cy} q1.5 3 3 0" ${O(1.4)} fill="none"/>`;
  m+=`<path d="M${cx-r*0.42} ${cy+r*0.28} q${r*0.42} ${r*0.42} ${r*0.84} 0" ${O(1.6)} fill="none"/>`;
  m+=`<path d="M${cx-r*0.46} ${cy-r*0.4} q${r*0.18} -${r*0.16} ${r*0.34} 0M${cx+r*0.12} ${cy-r*0.4} q${r*0.18} -${r*0.16} ${r*0.34} 0" ${O(1.4)} fill="none"/>`;
  return m+'</g>';
}

/* ---- peacock eye-feather ---- */
function feather(ox,oy,tx,ty){
  let m='';
  // stalk with barbs
  m+=`<path d="M${ox} ${oy} Q${(ox+tx)/2+ (oy-ty)*0.04} ${(oy+ty)/2} ${tx} ${ty}" ${O(1.3)} fill="none"/>`;
  // eye
  m+=`<ellipse cx="${tx}" cy="${ty}" rx="7.5" ry="9.5" fill="${TEAL}" ${O(1.6)} transform="rotate(${Math.atan2(ty-oy,tx-ox)*57.3+90} ${tx} ${ty})"/>`;
  m+=`<ellipse cx="${tx}" cy="${ty}" rx="5" ry="6.6" fill="${TUR}" ${O(1)} transform="rotate(${Math.atan2(ty-oy,tx-ox)*57.3+90} ${tx} ${ty})"/>`;
  m+=`<path d="M${tx} ${ty-4} q4 4 0 8 q-4 -4 0 -8Z" fill="${RED}" ${O(1)}/>`;
  m+=`<circle cx="${tx}" cy="${ty}" r="1.4" fill="${INK}"/>`;
  return m;
}
function peacock(bx,by,sc){
  sc=sc||1; let m='<g>';
  // ground shadow
  m+=`<ellipse cx="${bx}" cy="${by+14}" rx="${30*sc}" ry="6" fill="${INK}" opacity=".12"/>`;
  // tail fan (behind body)
  const fanO_x=bx+6, fanO_y=by-22;
  const a0=-126, a1=-20, n=11;
  for(let i=0;i<n;i++){const a=(a0+(a1-a0)*i/(n-1))*Math.PI/180, R=118+ (i%2?6:-4);
    feather; m+=feather(fanO_x,fanO_y, fanO_x+Math.cos(a)*R, fanO_y+Math.sin(a)*R);}
  // legs
  m+=`<path d="M${bx-4} ${by+6} l-1 12M${bx+5} ${by+6} l1 12" ${O(2)}/>`;
  m+=`<path d="M${bx-7} ${by+18} h6M${bx+3} ${by+18} h6" ${O(1.6)}/>`;
  // body teardrop
  m+=`<path d="M${bx-16} ${by-8} C${bx-20} ${by+8} ${bx-6} ${by+16} ${bx+6} ${by+12} C${bx+20} ${by+6} ${bx+18} ${by-22} ${bx} ${by-26} C${bx-10} ${by-26} ${bx-14} ${by-18} ${bx-16} ${by-8} Z" fill="${TEAL}" ${O(2)}/>`;
  // belly scallops
  for(let i=0;i<3;i++)m+=`<path d="M${bx-12+i*9} ${by+4} a4 4 0 0 1 8 0" ${O(1)} fill="none"/>`;
  m+=`<circle cx="${bx-2}" cy="${by-6}" r="3" fill="${TUR}"/>`;
  // neck S-curve up-left to head
  const hx=bx-30, hy=by-42;
  m+=`<path d="M${bx-12} ${by-18} C${bx-26} ${by-26} ${hx-2} ${hy+18} ${hx} ${hy+4}" stroke="${TEAL_D}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  m+=`<path d="M${bx-12} ${by-18} C${bx-26} ${by-26} ${hx-2} ${hy+18} ${hx} ${hy+4}" ${O(1)} fill="none"/>`;
  // head
  m+=`<circle cx="${hx}" cy="${hy}" r="7" fill="${TEAL}" ${O(1.8)}/>`;
  m+=`<circle cx="${hx-2}" cy="${hy-1}" r="1.7" fill="${CREAM}"/><circle cx="${hx-2}" cy="${hy-1}" r="0.9" fill="${INK}"/>`;
  m+=`<path d="M${hx-7} ${hy} l-7 -1 7 3Z" fill="${TUR}" ${O(1)}/>`; // beak
  // crest (3 dotted stalks)
  for(let i=-1;i<2;i++)m+=`<path d="M${hx+i*3} ${hy-6} q${i*2} -6 ${i*2} -9" ${O(1.2)} fill="none"/><circle cx="${hx+i*3+i*2}" cy="${hy-15}" r="2" fill="${TEAL}" ${O(0.9)}/>`;
  return m+'</g>';
}

/* ---- double-outline fish (matsya) ---- */
function fish(x,y,len,ang,col){
  col=col||TUR; let m=`<g transform="rotate(${ang} ${x} ${y})">`;
  const L=len, hw=len*0.32;
  m+=`<path d="M${x-L/2} ${y} Q${x} ${y-hw} ${x+L/2} ${y} Q${x} ${y+hw} ${x-L/2} ${y} Z" fill="${col}" ${O(2)}/>`;
  m+=`<path d="M${x-L/2} ${y} Q${x} ${y-hw*0.72} ${x+L/2} ${y} Q${x} ${y+hw*0.72} ${x-L/2} ${y} Z" ${O(0.9)} fill="none"/>`; // inner double line
  // tail
  m+=`<path d="M${x+L/2-2} ${y} l${L*0.3} -${hw*0.8} v${hw*1.6} Z" fill="${col}" ${O(1.6)}/>`;
  // scales
  for(let i=0;i<3;i++)m+=`<path d="M${x-L*0.3+i*L*0.22} ${y-hw*0.5} q3 ${hw*0.5} 0 ${hw}" ${O(0.9)} fill="none"/>`;
  // fins
  m+=`<path d="M${x-2} ${y-hw*0.7} q5 -6 10 -3 q-3 4 -10 3Z" fill="${RED}" ${O(1)}/>`;
  m+=`<circle cx="${x-L*0.3}" cy="${y-2}" r="2.4" fill="${CREAM}" ${O(0.9)}/><circle cx="${x-L*0.3}" cy="${y-2}" r="1.1" fill="${INK}"/>`;
  return m+'</g>';
}

/* ---- top-view lotus (kamal) ---- */
function lotus(x,y,sc){
  sc=sc||1; let m='<g>'; const n=8, R=14*sc;
  for(let i=0;i<n;i++){const a=(i/n)*360;
    m+=`<path d="M${x} ${y} Q${x-R*0.34} ${y-R*0.7} ${x} ${y-R} Q${x+R*0.34} ${y-R*0.7} ${x} ${y}Z" transform="rotate(${a} ${x} ${y})" fill="${i%2?PINK:RED}" ${O(1.4)}/>`;}
  for(let i=0;i<n;i++){const a=(i/n)*360+22.5;
    m+=`<path d="M${x} ${y} Q${x-R*0.22} ${y-R*0.46} ${x} ${y-R*0.66} Q${x+R*0.22} ${y-R*0.46} ${x} ${y}Z" transform="rotate(${a} ${x} ${y})" fill="${PINK}" ${O(1)}/>`;}
  m+=`<circle cx="${x}" cy="${y}" r="${R*0.28}" fill="${TUR}" ${O(1.2)}/>`;
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;m+=`<circle cx="${x+Math.cos(a)*R*0.16}" cy="${y+Math.sin(a)*R*0.16}" r="0.9" fill="${INK}"/>`;}
  return m+'</g>';
}
function pad(x,y,r){return `<path d="M${x} ${y} a${r} ${r} 0 1 1 ${-2} 0 Z" fill="${GREEN}" ${O(1.4)}/>`+
  Array.from({length:5},(_, i)=>{const a=(-60+i*30)*Math.PI/180;return `<line x1="${x-1}" y1="${y}" x2="${x-1+Math.cos(a)*r*0.9}" y2="${y+Math.sin(a)*r*0.9}" ${O(0.8)}/>`;}).join('');}

/* ---- pattern fillers (the Madhubani "no empty space") ---- */
function leafVine(x1,y1,x2,y2,col){
  let m=`<path d="M${x1} ${y1} L${x2} ${y2}" ${O(1.1)} fill="none"/>`;
  const n=Math.round(Math.hypot(x2-x1,y2-y1)/14);
  for(let i=1;i<n;i++){const t=i/n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t,s=(i%2?1:-1);
    m+=`<path d="M${x} ${y} q${s*7} -4 ${s*9} -10 q${-s*5} 4 ${-s*9} 10Z" fill="${col||GREEN}" ${O(0.9)}/>`;}
  return m;
}
function dotsField(x,y,w,h,col,seed){const R=S.rng(seed||5);let m='';
  for(let i=0;i<Math.round(w*h/700);i++)m+=`<circle cx="${x+R()*w}" cy="${y+R()*h}" r="${0.9+R()*0.8}" fill="${col}" opacity=".5"/>`;return m;}

S.scenes.mithila=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>
    <linearGradient id="mground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EBCF"/><stop offset=".55" stop-color="#F1E2C0"/><stop offset=".56" stop-color="#E7E6C9"/><stop offset="1" stop-color="#D8E2C8"/></linearGradient>
    <radialGradient id="msun" cx="${SX}" cy="${SY}" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FBE9B8" stop-opacity=".85"/><stop offset=".5" stop-color="#F0C64B" stop-opacity=".25"/><stop offset="1" stop-color="#E0A211" stop-opacity="0"/></radialGradient>
    <filter id="msoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="mdrop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#241A12" flood-opacity="0.18"/></filter>
  </defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SX,'data-y':SY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  // ground
  const Lg=L(0.02);
  Lg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#mground)'}));
  Lg.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#msun)'}));
  // faint kohbar lattice in the sky (light)
  let lat=''; for(let i=-1;i<14;i++){lat+=`<path d="M${i*34} 40 L${i*34+90} 300" stroke="${TUR}" stroke-width="0.8" opacity=".10"/><path d="M${i*34} 300 L${i*34+90} 40" stroke="${RED}" stroke-width="0.8" opacity=".08"/>`;}
  Lg.innerHTML+=lat;

  // top decorative double-line border with a row of little lotuses
  const Lb=L(0.04); let bd='';
  bd+=`<line x1="-10" y1="30" x2="${W+10}" y2="30" ${O(1.6)}/><line x1="-10" y1="36" x2="${W+10}" y2="36" ${O(1.1)}/>`;
  for(let x=10;x<W;x+=28)bd+=`<path d="M${x} 33 l5 -5 5 5 -5 5Z" fill="${x%56<28?RED:TEAL}" ${O(0.9)}/>`;
  // bottom pond divider (wavy)
  let wav='M-10 372'; for(let x=-10;x<=W+10;x+=20)wav+=` q10 -6 20 0`;
  bd+=`<path d="${wav}" ${O(1.4)} fill="none"/>`;
  Lb.innerHTML=bd;

  // sun with glow
  const Lsun=L(0.06); const sg=S.el('g',{filter:'url(#mdrop)'}); sg.innerHTML=surya(SX,SY,24); Lsun.appendChild(sg);
  // a couple of birds (simple)
  Lsun.innerHTML+=`<g class="bird" style="--i:0"><path d="M70 120 q5 -5 10 0 q5 -5 10 0" stroke="${INK}" stroke-width="1.3" fill="none"/></g><g class="bird" style="--i:1"><path d="M120 100 q4 -4 8 0 q4 -4 8 0" stroke="${INK}" stroke-width="1.1" fill="none"/></g>`;

  // pattern fill upper-left (light, so greeting reads)
  const Lp=L(0.08); let pf='';
  pf+=leafVine(14,252,14,362,GREEN);     // left side vine (lower, clear of headline)
  pf+=leafVine(378,122,378,322,GREEN);   // right side vine
  pf+=dotsField(150,302,230,66,RED,7);   // dots filling the lower-right gap
  Lp.innerHTML=pf;

  // peacock (hero subject, right of centre)
  const Lpk=L(0.16); const pk=S.el('g',{filter:'url(#mdrop)'}); pk.innerHTML=peacock(286,350,1.05); Lpk.appendChild(pk);

  // lotus pond: lotuses, pads, fish (lower-left band, partly above the card fade)
  const Lpond=L(0.24); let pond='';
  pond+=pad(70,360,12)+pad(150,372,10)+pad(118,352,8);
  pond+=lotus(60,344,1)+lotus(132,360,0.85)+lotus(96,372,0.7);
  pond+=fish(96,392,30,8,TUR)+fish(168,388,26,-12,TEAL)+fish(46,386,22,18,RED);
  // wavy water lines
  for(let r=0;r<3;r++){let wl=`M-10 ${398+r*12}`;for(let x=-10;x<W;x+=22)wl+=` q11 -5 22 0`;pond+=`<path d="${wl}" stroke="${TEAL}" stroke-width="1" fill="none" opacity=".5"/>`;}
  Lpond.innerHTML=pond;

  // foreground floating dots/petals
  const Lf=L(0.4); let ff='';
  for(let i=0;i<12;i++){const x=20+Math.random()*350,y=130+Math.random()*200;
    ff+=`<circle cx="${x}" cy="${y}" r="${1+Math.random()*1.4}" fill="${i%2?TUR:RED}" opacity="${0.3+Math.random()*0.3}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*7).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lf.innerHTML=ff;
};
})();
