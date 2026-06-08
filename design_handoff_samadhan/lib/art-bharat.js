/* ============================================================
   SAMADHAN · art-bharat.js  — "Bharat Dawn"
   Sunrise over the Varanasi ghats + the empty-state scene.
   ============================================================ */
(function(){
const S=window.SAMADHAN, W=S.W, H=S.H;
const SUNX=302, SUNY=238;

function rng(seed){return S.rng(seed);}

// organic Varanasi riverfront
function skyline(baseY, scale, fill, opts){
  opts=opts||{}; const flat=!!opts.flat, detail=!flat, R=S.rng(opts.seed||7), s=scale, dk='#7C5836';
  let m=`<g><rect x="-24" y="${baseY-3*s}" width="${W+48}" height="64" fill="${fill}"/>`;
  const list=[]; let x=-26;
  while(x<W+16){const r=R();let t,w,h;
    if(r<0.15){t='spire';w=13+R()*9;h=(48+R()*34)*s;}
    else if(r<0.28){t='chhatri';w=17+R()*9;h=(22+R()*12)*s;}
    else if(r<0.50){t='palace';w=36+R()*30;h=(24+R()*16)*s;}
    else if(r<0.64){t='tower';w=11+R()*7;h=(32+R()*22)*s;}
    else{t='block';w=22+R()*26;h=(15+R()*15)*s;}
    list.push({t,w,h,x}); x+=w*(0.60+R()*0.34);}
  for(const b of list){
    const bx=b.x,w=b.w,h=b.h,by=baseY-3*s+(R()*2.4-1.1),mx=bx+w/2,top=by-h;
    m+=`<rect x="${bx}" y="${top}" width="${w}" height="${h+12}" fill="${fill}"/>`;
    if(b.t==='spire'){const tw=w*0.66,th=h*0.6,tx=mx-tw/2,ty=top;
      m+=`<path d="M${tx} ${ty} C${mx-tw*0.18} ${ty-th*0.42} ${mx-tw*0.06} ${ty-th*0.8} ${mx} ${ty-th} C${mx+tw*0.06} ${ty-th*0.8} ${mx+tw*0.18} ${ty-th*0.42} ${tx+tw} ${ty} Z" fill="${fill}"/>`;
      m+=`<circle cx="${mx}" cy="${ty-th-2.2*s}" r="${2.3*s}" fill="${fill}"/><rect x="${mx-0.7}" y="${ty-th-7*s}" width="1.5" height="${5*s}" fill="${fill}"/>`;
      if(detail)for(let k=1;k<=3;k++){const ry=ty-th*k/3.6;m+=`<line x1="${mx-tw*0.42*(1-k/4.5)}" y1="${ry}" x2="${mx+tw*0.42*(1-k/4.5)}" y2="${ry}" stroke="${dk}" stroke-width="0.7" opacity=".4"/>`;}
    } else if(b.t==='chhatri'){const dr=w*0.42;
      m+=`<path d="M${mx-dr} ${top} q0 -${dr*1.25} ${dr} -${dr*1.25} q${dr} 0 ${dr} ${dr*1.25} Z" fill="${fill}"/>`;
      m+=`<rect x="${mx-0.7}" y="${top-dr*1.25-4*s}" width="1.5" height="${4.5*s}" fill="${fill}"/><circle cx="${mx}" cy="${top-dr*1.25-5*s}" r="1.4" fill="${fill}"/>`;
      if(detail)m+=`<rect x="${bx+2}" y="${top}" width="${w-4}" height="3" fill="${dk}" opacity=".2"/>`;
    } else if(b.t==='palace'){
      m+=`<rect x="${bx-1.5}" y="${top-3}" width="${w+3}" height="4" fill="${fill}"/>`;
      if(detail){m+=`<circle cx="${bx+3}" cy="${top-3}" r="2.3" fill="${fill}"/><circle cx="${bx+w-3}" cy="${top-3}" r="2.3" fill="${fill}"/>`;
        const cols=Math.max(2,Math.round(w/11)),rows=Math.max(2,Math.round(h/13)),gw=(w-8)/cols,gh=Math.min(11,(h-6)/rows);
        for(let c=0;c<cols;c++)for(let rr=0;rr<rows;rr++){const wx=bx+5+c*gw,wy=top+5+rr*gh;if(wy>by-4)continue;
          m+=`<path d="M${wx} ${wy+gh*0.5} v-${gh*0.28} a${gw*0.28} ${gw*0.28} 0 0 1 ${gw*0.56} 0 v${gh*0.28} Z" fill="${dk}" opacity="${(0.2+R()*0.16).toFixed(2)}"/>`;}}
    } else if(b.t==='tower'){const dr=w*0.6;
      m+=`<path d="M${mx-dr*0.5} ${top} a${dr*0.5} ${dr*0.5} 0 0 1 ${dr} 0 Z" fill="${fill}"/><rect x="${mx-0.7}" y="${top-dr*0.5-4*s}" width="1.5" height="${4*s}" fill="${fill}"/>`;
      if(detail)for(let k=0;k<3;k++)m+=`<rect x="${mx-1.3}" y="${top+6+k*7}" width="2.6" height="4" rx="1.3" fill="${dk}" opacity=".28"/>`;
    } else { if(detail){m+=`<rect x="${bx-1}" y="${top-2}" width="${w+2}" height="3" fill="${fill}"/>`;
        for(let c=0;c<Math.round(w/9);c++)m+=`<rect x="${bx+4+c*9}" y="${top+5}" width="3" height="5" fill="${dk}" opacity=".22"/>`;}}
    if(detail&&h>34*s)m+=`<rect x="${bx+w-1.6}" y="${top}" width="1.6" height="${h*0.8}" fill="url(#rim)" opacity=".5"/>`;
  }
  return m+`</g>`;
}

function defs(){return `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FDF3E2"/><stop offset=".34" stop-color="#FBE6C6"/><stop offset=".60" stop-color="#F8D29A"/><stop offset=".80" stop-color="#F4BE79"/><stop offset="1" stop-color="#F2B069"/>
  </linearGradient>
  <radialGradient id="sunglow" cx="${SUNX}" cy="${SUNY}" r="200" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFF0CB" stop-opacity=".96"/><stop offset=".26" stop-color="#FCD98C" stop-opacity=".72"/><stop offset=".52" stop-color="#F6AE5A" stop-opacity=".34"/><stop offset=".80" stop-color="#F0A24A" stop-opacity=".10"/><stop offset="1" stop-color="#F0A24A" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="sundisc" cx="${SUNX}" cy="${SUNY}" r="44" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFF7E0"/><stop offset=".42" stop-color="#FCDD8C"/><stop offset=".78" stop-color="#F6B257"/><stop offset="1" stop-color="#EE9A3F"/>
  </radialGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4C886"/><stop offset=".30" stop-color="#E6B280"/><stop offset=".64" stop-color="#CFA084"/><stop offset="1" stop-color="#B8918F"/></linearGradient>
  <linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".95"/><stop offset="1" stop-color="#F6B257" stop-opacity="0"/></linearGradient>
  <linearGradient id="templeFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7C7A6"/><stop offset="1" stop-color="#DEB994"/></linearGradient>
  <linearGradient id="templeFar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD6BA"/><stop offset="1" stop-color="#E4CAA8"/></linearGradient>
  <linearGradient id="templeMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98E5C"/><stop offset="1" stop-color="#A56E42"/></linearGradient>
  <linearGradient id="ghatFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7B488"/><stop offset="1" stop-color="#BC9263"/></linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FCE0A0" stop-opacity="0"/><stop offset="1" stop-color="#FCE0A0" stop-opacity=".9"/></linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEBCF" stop-opacity="0"/><stop offset=".5" stop-color="#FBE9CB" stop-opacity=".9"/><stop offset="1" stop-color="#F6DAAE" stop-opacity="0"/></linearGradient>
  <linearGradient id="reflFadeDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B184" stop-opacity="0"/><stop offset="1" stop-color="#CFA083" stop-opacity=".82"/></linearGradient>
  <radialGradient id="diya" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#FFF3CE"/><stop offset=".4" stop-color="#FBC95F"/><stop offset="1" stop-color="#EE7B23" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
  <filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>`;
}

S.scenes.bharat=function(scene){
  scene.setAttribute('viewBox',`0 0 ${W} ${H}`);
  scene.innerHTML=`<defs>${defs()}</defs>`;
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SUNX,'data-y':SUNY,r:0,fill:'none'}));
  const L=d=>S.layer(scene,d);

  const Lsky=L(0.02);
  Lsky.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#sky)'}));
  Lsky.appendChild(S.el('rect',{x:-20,y:-20,width:W+40,height:H+40,fill:'url(#sunglow)'}));
  Lsky.appendChild(S.el('ellipse',{cx:80,cy:178,rx:190,ry:150,fill:'#FFFBF2',opacity:.6,filter:'url(#softer)'}));

  const Lrays=L(0.05); const rays=S.el('g',{id:'rays',opacity:0,filter:'url(#softer)'});
  let rm=''; const NR=18;
  for(let i=0;i<NR;i++){const a=(i/NR)*Math.PI*2,w=(i%2?4:8);
    rm+=`<path d="M${SUNX+Math.cos(a)*26} ${SUNY+Math.sin(a)*26} L${SUNX+Math.cos(a-0.01*w)*440} ${SUNY+Math.sin(a-0.01*w)*440} L${SUNX+Math.cos(a+0.01*w)*440} ${SUNY+Math.sin(a+0.01*w)*440} Z" fill="#FFE7B0" opacity="${i%2?0.026:0.046}"/>`;}
  rays.innerHTML=rm; Lrays.appendChild(rays);

  const Lsun=L(0.04);
  Lsun.appendChild(S.el('circle',{cx:SUNX,cy:SUNY,r:58,fill:'#FCD98C',opacity:.5,filter:'url(#bloom)'}));
  Lsun.appendChild(S.el('circle',{cx:SUNX,cy:SUNY,r:33,fill:'url(#sundisc)'}));
  Lsun.appendChild(S.el('circle',{cx:SUNX,cy:SUNY,r:33,fill:'none',stroke:'#FFF3D6','stroke-width':1.2,opacity:.6}));

  const Lfar2=L(0.07); const far2=S.el('g',{filter:'url(#softer)',opacity:.55}); far2.innerHTML=skyline(298,0.82,'url(#templeFar2)',{flat:true,seed:21}); Lfar2.appendChild(far2);

  const Lbird=L(0.06); let bm='';
  [[252,110,1],[270,104,0.9],[286,111,0.85],[316,99,0.8]].forEach(([x,y,sc],i)=>{bm+=`<path d="M${x} ${y} q${4*sc} -${3.4*sc} ${8*sc} 0 q${4*sc} -${3.4*sc} ${8*sc} 0" stroke="#7C5A3E" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="${0.3-i*0.03}" class="bird" style="--i:${i}"/>`;});
  Lbird.innerHTML=bm;

  const Lfar=L(0.10); const far=S.el('g',{filter:'url(#soft)',opacity:.9}); far.innerHTML=skyline(304,1.0,'url(#templeFar)',{flat:true,seed:9}); Lfar.appendChild(far);
  const Lhaze=L(0.085); Lhaze.appendChild(S.el('rect',{x:-20,y:288,width:W+40,height:50,fill:'#FBE7C4',opacity:.5,filter:'url(#softer)'}));

  const Lmid=L(0.18); const mid=S.el('g',{}); const midMarkup=skyline(315,1.18,'url(#templeMid)',{flat:false,seed:4}); mid.innerHTML=midMarkup; Lmid.appendChild(mid);

  const waterY=332;
  const Lghat=L(0.24); const ghat=S.el('g',{}); let gm='';
  for(let s=0;s<6;s++){const stepY=308+s*4.4,x0=-12+s*3,x1=W+12;
    gm+=`<path d="M${x0} ${stepY} L${x1} ${stepY} L${x1} ${stepY+4.4} L${x0} ${stepY+4.4} Z" fill="url(#ghatFace)"/>`;
    gm+=`<path d="M${x0} ${stepY} L${x1} ${stepY}" stroke="#FBE3B4" stroke-width="0.8" opacity="${0.42-s*0.05}"/>`;}
  gm+=S.figure(92,308,'#7A5238',0.95)+S.figure(140,312,'#6E4A33',1.05)+S.figure(212,310,'#73503A',0.9)+S.figure(316,309,'#7A5238',1.0);
  ghat.innerHTML=gm; Lghat.appendChild(ghat);

  const Lmist=L(0.26); Lmist.appendChild(S.el('rect',{x:-20,y:waterY-24,width:W+40,height:42,fill:'url(#mist)',opacity:.85,filter:'url(#softer)'}));

  const Lwater=L(0.30);
  Lwater.appendChild(S.el('rect',{x:-20,y:waterY,width:W+40,height:H-waterY+40,fill:'url(#water)'}));
  const refl=S.el('g',{transform:`translate(0 ${2*waterY}) scale(1 -1)`,opacity:.13,filter:'url(#soft)'}); refl.innerHTML=midMarkup; Lwater.appendChild(refl);
  Lwater.appendChild(S.el('rect',{x:-20,y:waterY,width:W+40,height:62,fill:'url(#reflFadeDown)'}));
  Lwater.appendChild(S.el('ellipse',{cx:SUNX,cy:waterY+28,rx:28,ry:36,fill:'url(#reflect)',opacity:.7,filter:'url(#soft)'}));
  let rip='';
  for(let r=0;r<22;r++){const ry=waterY+5+r*5.4,spread=10+r*2.5,jx=Math.sin(r*1.7)*7,segs=2+Math.floor(Math.random()*3);
    for(let sg=0;sg<segs;sg++){const sw=spread*(0.28+Math.random()*0.5),sx=SUNX+jx+(Math.random()*2-1)*spread-sw/2;
      rip+=`<rect x="${sx}" y="${ry}" width="${sw}" height="1.7" rx="0.85" fill="#FFF0C6" opacity="${((0.5-r*0.017)*(0.45+Math.random()*0.55)).toFixed(3)}"/>`;}}
  for(let r=0;r<6;r++){const ry=waterY+26+r*19;rip+=`<rect x="-20" y="${ry}" width="${W+40}" height="1.1" rx="1" fill="#FFFFFF" opacity="${(0.075-r*0.008).toFixed(3)}"/>`;}
  const ripG=S.el('g',{id:'ripples'}); ripG.innerHTML=rip; Lwater.appendChild(ripG);

  const Lboat=L(0.36);
  Lboat.innerHTML=`<g opacity=".92"><path d="M150 372 q18 9 40 0 l-5 7 q-15 5 -30 0 Z" fill="#5E3E2E"/><rect x="169" y="356" width="1.6" height="16" fill="#5E3E2E"/>${S.figure(165,360,'#4A3022',0.8)}</g>
    <g opacity=".82"><path d="M276 392 q22 11 48 0 l-6 8 q-18 6 -36 0 Z" fill="#6E4A33"/><rect x="298" y="374" width="1.8" height="18" fill="#6E4A33"/></g>`;

  const Ldiya=L(0.5); let di=''; const spots=[[112,438],[196,458],[298,444],[252,468],[64,460]];
  spots.forEach(([x,y],i)=>{di+=`<circle cx="${x}" cy="${y}" r="18" fill="url(#diya)" class="diyaglow" style="--i:${i}"/>`;
    di+=`<ellipse cx="${x}" cy="${y+2}" rx="6" ry="2.4" fill="#7A4A2A"/><path d="M${x-5} ${y+1} q5 4 10 0 q-1 4 -5 5 q-4 -1 -5 -5Z" fill="#8A5630"/>`;
    di+=`<path d="M${x} ${y-9} q2.4 5 0 8 q-2.4 -3 0 -8Z" fill="#FFD974" class="flame" style="--i:${i}"/>`;});
  Ldiya.innerHTML=di;

  const Lgar=L(0.72); const gar=S.el('g',{}); let gmk='';
  const ax=-8,bx=W+8,topY=20,dip=16; const dy=t=>topY+Math.sin(t*Math.PI)*dip;
  let sp=`M${ax} ${topY}`; for(let t=0;t<=1;t+=0.05)sp+=` L${ax+(bx-ax)*t} ${dy(t)}`;
  gmk+=`<path d="${sp}" stroke="#4F7A3A" stroke-width="1.4" fill="none" opacity=".75"/>`;
  const Nf=13; for(let i=0;i<Nf;i++){const t=i/(Nf-1),x=ax+(bx-ax)*t,y=dy(t)+6;
    if(i%3===1)gmk+=S.leaf(x,y); else gmk+=S.marigold(x,y,i%2?9:11,i%4===0);}
  gar.innerHTML=gmk; Lgar.appendChild(gar);

  const Lpart=L(0.6); let pm='';
  for(let i=0;i<16;i++){const x=20+Math.random()*350,y=120+Math.random()*240,r=0.8+Math.random()*1.6;
    pm+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE6A6" opacity="${0.25+Math.random()*0.4}" class="dust" style="--dx:${(Math.random()*2-1).toFixed(2)};--dy:${(-0.5-Math.random()).toFixed(2)};--dt:${(7+Math.random()*8).toFixed(1)}s;--dd:${(Math.random()*-8).toFixed(1)}s"/>`;}
  Lpart.innerHTML=pm;
};

/* ---------------- empty state: a citizen looking toward the dawn city ---------------- */
S.scenes.empty=function(scene){
  const VW=320, VH=300, SX=210, SY=120;
  scene.setAttribute('viewBox',`0 0 ${VW} ${VH}`);
  scene.innerHTML=`<defs>
    <linearGradient id="esky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF4E6"/><stop offset=".55" stop-color="#FBE3C0"/><stop offset="1" stop-color="#F6C98A"/></linearGradient>
    <radialGradient id="eglow" cx="${SX}" cy="${SY}" r="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF0CB" stop-opacity=".95"/><stop offset=".5" stop-color="#F6B45A" stop-opacity=".3"/><stop offset="1" stop-color="#F0A24A" stop-opacity="0"/></radialGradient>
    <radialGradient id="esun" cx="${SX}" cy="${SY}" r="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF7E0"/><stop offset=".6" stop-color="#FBD27A"/><stop offset="1" stop-color="#F2A24A"/></radialGradient>
    <linearGradient id="ewater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C184"/><stop offset="1" stop-color="#D6A98A"/></linearGradient>
    <linearGradient id="ecity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B58A"/><stop offset="1" stop-color="#C39A6B"/></linearGradient>
    <linearGradient id="eplat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98B5C"/><stop offset="1" stop-color="#9A6E44"/></linearGradient>
    <filter id="esoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`;
  const L=d=>S.layer(scene,d);
  scene.appendChild(S.el('circle',{id:'sunCenter','data-x':SX,'data-y':SY,r:0,fill:'none'}));

  const sky=L(0.03); sky.appendChild(S.el('rect',{x:0,y:0,width:VW,height:VH,fill:'url(#esky)'})); sky.appendChild(S.el('rect',{x:0,y:0,width:VW,height:VH,fill:'url(#eglow)'}));
  const Lr=L(0.05); const rays=S.el('g',{id:'rays',opacity:0,filter:'url(#esoft)'}); let rm='';
  for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;rm+=`<path d="M${SX+Math.cos(a)*18} ${SY+Math.sin(a)*18} L${SX+Math.cos(a-0.04)*260} ${SY+Math.sin(a-0.04)*260} L${SX+Math.cos(a+0.04)*260} ${SY+Math.sin(a+0.04)*260} Z" fill="#FFE7B0" opacity="${i%2?0.03:0.05}"/>`;}
  rays.innerHTML=rm; Lr.appendChild(rays);
  const Lsun=L(0.04); Lsun.appendChild(S.el('circle',{cx:SX,cy:SY,r:20,fill:'url(#esun)'}));
  // distant city
  const Lc=L(0.12); const c=S.el('g',{filter:'url(#esoft)',opacity:.92});
  c.innerHTML=(function(){let m='';const R=S.rng(33);let x=120;while(x<315){const w=10+R()*22,h=24+R()*40,top=170-h;
    m+=`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#ecity)"/>`;
    if(R()<0.4){const mx=x+w/2;m+=`<path d="M${mx-w*0.3} ${top} Q${mx} ${top-h*0.4} ${mx+w*0.3} ${top} Z" fill="url(#ecity)"/><rect x="${mx-0.6}" y="${top-h*0.4-4}" width="1.2" height="4" fill="url(#ecity)"/>`;}
    x+=w*0.85;}return m;})();
  Lc.appendChild(c);
  // water
  const Lw=L(0.2); Lw.appendChild(S.el('rect',{x:0,y:170,width:VW,height:VH-170,fill:'url(#ewater)'}));
  Lw.appendChild(S.el('ellipse',{cx:SX,cy:178,rx:16,ry:10,fill:'#FFE9B8',opacity:.6,filter:'url(#esoft)'}));
  let rip=''; for(let r=0;r<5;r++)rip+=`<rect x="0" y="${178+r*8}" width="${VW}" height="1.1" fill="#FFFFFF" opacity="${0.12-r*0.02}"/>`;
  Lw.innerHTML+=rip;
  // foreground platform + figure (back view, contemplative)
  const Lf=L(0.34); let fm='';
  fm+=`<path d="M0 214 Q150 204 ${VW} 214 L${VW} ${VH} L0 ${VH} Z" fill="url(#eplat)"/>`;
  fm+=`<ellipse cx="150" cy="216" rx="70" ry="9" fill="#7A5436" opacity=".35"/>`;
  // standing citizen seen from behind, shawl draped
  const fx=150, fb=216;
  fm+=`<ellipse cx="${fx}" cy="${fb}" rx="15" ry="5" fill="#3A2410" opacity=".22"/>`;
  fm+=`<path d="M${fx-12} ${fb} C${fx-15} ${fb-34} ${fx-10} ${fb-50} ${fx} ${fb-52} C${fx+10} ${fb-50} ${fx+15} ${fb-34} ${fx+12} ${fb} Z" fill="#7B4A2E"/>`; // body/shawl
  fm+=`<path d="M${fx-12} ${fb} C${fx-15} ${fb-34} ${fx-10} ${fb-50} ${fx} ${fb-52} C${fx+3} ${fb-50} ${fx+6} ${fb-34} ${fx+5} ${fb} Z" fill="#8A5634" opacity=".7"/>`; // shawl fold
  fm+=`<circle cx="${fx}" cy="${fb-58}" r="7" fill="#6E4327"/>`; // head
  fm+=`<path d="M${fx-7} ${fb-58} a7 7 0 0 1 14 0 q-7 -3 -14 0Z" fill="#5A3620"/>`; // hair/scarf top
  fm+=`<path d="M${fx-12} ${fb-30} l-7 14 M${fx+12} ${fb-30} l7 14" stroke="#6E4327" stroke-width="3.4" stroke-linecap="round"/>`; // arms hint
  Lf.innerHTML=fm;
};
})();
