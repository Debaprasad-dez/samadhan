/* ============================================================
   SAMADHAN · art-core.js
   Shared SVG helpers, motifs, motion + the SAMADHAN namespace.
   Theme scenes register into SAMADHAN.scenes[name].
   ============================================================ */
(function(){
const NS="http://www.w3.org/2000/svg";
const W=390, H=478;
const S = window.SAMADHAN = window.SAMADHAN || {};
S.NS=NS; S.W=W; S.H=H; S.scenes={};

S.el=function(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
S.rng=function(seed){let s=(seed>>>0)||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};};
S.layer=function(scene,depth){const g=S.el('g',{class:'layer'});g.dataset.depth=depth;scene.appendChild(g);return g;};

/* ---------------- shared motif markup (return SVG strings) ---------------- */
S.marigold=function(x,y,R,white){
  const c1=white?'#E7D8C0':'#C8501E', c2=white?'#F3ECDD':'#E0782A', c3=white?'#FBF6EC':'#F2A640';
  let m=`<g class="bloom" style="--i:${(x*7)%5}">`;
  m+=`<ellipse cx="${x}" cy="${y+R*0.8}" rx="${R*0.9}" ry="${R*0.4}" fill="#3A2410" opacity=".10"/>`;
  for(const [rr,col,n] of [[R,c1,16],[R*0.74,c2,13],[R*0.5,c3,10]]){
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+rr*0.3, px=x+Math.cos(a)*rr*0.62, py=y+Math.sin(a)*rr*0.62;
      m+=`<ellipse cx="${px}" cy="${py}" rx="${rr*0.34}" ry="${rr*0.26}" fill="${col}" transform="rotate(${a*57.3} ${px} ${py})"/>`;}
  }
  m+=`<circle cx="${x}" cy="${y}" r="${R*0.28}" fill="${white?'#E9C56A':'#F4B747'}"/>`;
  m+=`<circle cx="${x}" cy="${y}" r="${R*0.16}" fill="${white?'#D9A23B':'#C8501E'}" opacity=".8"/></g>`;
  return m;
};
S.leaf=function(x,y){return `<g class="bloom" style="--i:${(x*3)%5}">
  <path d="M${x} ${y-2} q-9 6 -7 16 q9 -2 7 -16Z" fill="#5C8C3F"/>
  <path d="M${x} ${y-2} q9 6 7 16 q-9 -2 -7 -16Z" fill="#4F7A36"/>
  <path d="M${x} ${y-2} q-2 9 0 18" stroke="#3C5E29" stroke-width="0.8" fill="none" opacity=".6"/></g>`;};
S.figure=function(x,y,col,sc){sc=sc||1;return `<g opacity=".88"><ellipse cx="${x}" cy="${y-1}" rx="${2.2*sc}" ry="${sc}" fill="#3A2410" opacity=".2"/>
  <circle cx="${x}" cy="${y-12*sc}" r="${1.9*sc}" fill="${col}"/>
  <path d="M${x-2.4*sc} ${y} q0 -8 ${2.4*sc} -10 q${2.4*sc} 2 ${2.4*sc} 10 Z" fill="${col}"/></g>`;};
S.sunRays=function(size,color,op){
  const cx=size/2, cy=size*0.74, n=11; let p='';
  for(let i=0;i<n;i++){const a=(-90+(i-(n-1)/2)*15)*Math.PI/180;
    p+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*size*0.66}" y2="${cy+Math.sin(a)*size*0.66}" stroke="${color}" stroke-opacity="${op}" stroke-width="1.4" stroke-linecap="round"/>`;}
  p+=`<path d="M${cx-size*0.19} ${cy} a${size*0.19} ${size*0.19} 0 0 1 ${size*0.38} 0Z" fill="${color}" fill-opacity="${op*1.4}"/>`;
  p+=`<line x1="${cx-size*0.4}" y1="${cy}" x2="${cx+size*0.4}" y2="${cy}" stroke="${color}" stroke-opacity="${op*1.4}" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>`;
};
S.lotusMandala=function(size,color,op){
  const c=size/2,R=size*0.46,n=8;let p='';
  for(let i=0;i<n;i++)p+=`<path d="M${c} ${c} q ${R*0.2} -${R*0.55} 0 -${R} q -${R*0.2} ${R*0.55} 0 ${R}Z" transform="rotate(${i*360/n} ${c} ${c})" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.2"/>`;
  for(let i=0;i<n;i++)p+=`<path d="M${c} ${c} q ${R*0.16} -${R*0.4} 0 -${R*0.7} q -${R*0.16} ${R*0.4} 0 ${R*0.7}Z" transform="rotate(${i*360/n+22.5} ${c} ${c})" fill="${color}" fill-opacity="${op*0.7}"/>`;
  p+=`<circle cx="${c}" cy="${c}" r="${R*0.15}" fill="${color}" fill-opacity="${op}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>`;
};

/* small section-header glyph per theme */
S.headGlyph=function(theme){
  if(theme==='mithila') // lotus bud
    return `<svg class="hmotif" width="16" height="16" viewBox="0 0 16 16"><g fill="none" stroke="#0E7C7B" stroke-width="1.3" stroke-linecap="round"><path d="M8 13c-3 0-5-2-5-4 2 0 5 1 5 4Z" fill="#E0A211" fill-opacity=".5"/><path d="M8 13c3 0 5-2 5-4-2 0-5 1-5 4Z" fill="#B5322F" fill-opacity=".4"/><path d="M8 13c0-4 0-6 0-8" /></g></svg>`;
  if(theme==='mughal') // gold lozenge / star
    return `<svg class="hmotif" width="16" height="16" viewBox="0 0 16 16"><g fill="none" stroke="#D4AF37" stroke-width="1.2"><path d="M8 2l2.2 3.8L14 8l-3.8 2.2L8 14l-2.2-3.8L2 8l3.8-2.2Z" fill="#D4AF37" fill-opacity=".25"/></g></svg>`;
  // default: rising sun
  return `<svg class="hmotif" width="16" height="16" viewBox="0 0 16 16"><g fill="none" stroke="#C9962E" stroke-width="1.3" stroke-linecap="round"><path d="M2.5 12.4h11"/><path d="M4.6 12.4a3.4 3.4 0 0 1 6.8 0" fill="#E9C56A" fill-opacity=".45"/><path d="M8 3.3v1.5M3.6 5.3l1 1M12.4 5.3l-1 1"/></g></svg>`;
};

/* theme accent colours for UI ornaments / hot-art */
S.PAL={
  bharat:{wm:'#C8501E',wm2:'#C9962E',sky1:'#FBE6C2',sky2:'#F3CE94',sun:'#F6B45A',sunCore:'#FBD27A',ground:'#E2BD86',ink:'#7C5836'},
  mithila:{wm:'#B5322F',wm2:'#0E7C7B',sky1:'#F3E6C8',sky2:'#E9D199',sun:'#E0A211',sunCore:'#F0C64B',ground:'#D8C49A',ink:'#241A12'},
  mughal:{wm:'#D4AF37',wm2:'#1F9E72',sky1:'#1A2150',sky2:'#10153A',sun:'#D4AF37',sunCore:'#EBD584',ground:'#0C1030',ink:'#0A0D28'}
};

/* ---------------- decorate the home UI with blended ornament ---------------- */
S.decorate=function(theme){
  const pal=S.PAL[theme]||S.PAL.bharat;
  document.querySelectorAll('.sec-head h3').forEach(h=>{ if(!h.querySelector('.hmotif')) h.insertAdjacentHTML('afterbegin', S.headGlyph(theme)); });
  const body=document.querySelector('.body');
  if(body && !body.querySelector('.body-paper')){const bp=document.createElement('div');bp.className='body-paper';body.insertBefore(bp,body.firstChild);}
  const cta=document.querySelector('.cta');
  if(cta && !cta.querySelector('.cta-wm')){const wm=document.createElement('div');wm.className='cta-wm';wm.innerHTML=S.sunRays(132,pal.wm,0.07);cta.appendChild(wm);}
  const btn=document.querySelector('.btn-file');
  if(btn && !btn.querySelector('.btn-ray')){const br=document.createElement('span');br.className='btn-ray';br.innerHTML=S.sunRays(120, theme==='mughal'?'#1A1330':'#FFFFFF',0.15);btn.appendChild(br);}
  // marigold-style sprig only for bharat (other themes get their own corner motif via scene)
  if(theme==='bharat' && body && !body.querySelector('.cta-sprig')){
    const sprig=document.createElement('div');sprig.className='cta-sprig';
    sprig.style.cssText='position:absolute;top:-32px;right:24px;z-index:12;pointer-events:none;filter:drop-shadow(0 8px 13px rgba(120,52,16,.3));';
    sprig.innerHTML=`<svg width="98" height="60" viewBox="0 0 98 60">${S.leaf(64,22)}${S.leaf(22,40)}${S.marigold(36,30,12,false)}${S.marigold(62,40,9,false)}${S.marigold(50,22,7,true)}</svg>`;
    body.appendChild(sprig);
  }
  document.querySelectorAll('.case').forEach(c=>{ if(!c.querySelector('.case-wm')){const wm=document.createElement('div');wm.className='case-wm';wm.innerHTML=S.lotusMandala(82,pal.wm2,0.09);c.appendChild(wm);} });
};

/* ---------------- hot-card mini illustrations (theme-tinted) ---------------- */
S.hotArt=function(node, kind, theme){
  const pal=S.PAL[theme]||S.PAL.bharat;
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 208 104');svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  const gid='hg'+Math.random().toString(36).slice(2,7);
  let inner=`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.sky1}"/><stop offset="1" stop-color="${pal.sky2}"/></linearGradient></defs><rect width="208" height="104" fill="url(#${gid})"/>`;
  inner+=`<circle cx="${kind==='pothole'?44:158}" cy="28" r="20" fill="${pal.sun}" opacity=".5"/><circle cx="${kind==='pothole'?44:158}" cy="28" r="12" fill="${pal.sunCore}"/>`;
  if(kind==='garbage'){
    inner+=`<rect x="-4" y="74" width="216" height="34" fill="${pal.ground}"/>
      <rect x="28" y="58" width="26" height="26" rx="3" fill="#7FA24A"/><path d="M26 58h30l-2-6H28l-2 6Z" fill="#6E8E3E"/>
      <rect x="64" y="64" width="22" height="20" rx="3" fill="#9CB96A"/><path d="M62 64h26l-2-5H64l-2 5Z" fill="#86A356"/>
      <circle cx="100" cy="78" r="5" fill="${pal.wm}" opacity=".85"/><circle cx="112" cy="82" r="4" fill="${pal.wm2}" opacity=".8"/>`;
  } else {
    inner+=`<rect x="-4" y="58" width="216" height="50" fill="${theme==='mughal'?'#1B2356':'#8A8076'}"/>
      <ellipse cx="120" cy="86" rx="34" ry="14" fill="#3C342C"/><ellipse cx="120" cy="83" rx="28" ry="10" fill="#26201A"/>
      <path d="M40 70 H80 M150 96 H190" stroke="${pal.sunCore}" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round" opacity=".7"/>`;
  }
  svg.innerHTML=inner;
  node.insertBefore(svg, node.firstChild);
};

/* ---------------- motion: parallax + ambient ---------------- */
S.motion=function(scene, heroEl, scrollEl){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  const layers=[...scene.querySelectorAll('.layer')];
  const rays=scene.querySelector('#rays');
  const ripples=scene.querySelector('#ripples');
  const sunC=scene.querySelector('#sunCenter');
  let cx=302, cy=238; if(sunC){cx=+sunC.getAttribute('data-x');cy=+sunC.getAttribute('data-y');}
  if(rays){requestAnimationFrame(()=>{rays.style.transition='opacity 1.6s ease';rays.style.opacity='1';});}
  const t0=performance.now();
  function ambient(now){const t=(now-t0)/1000;
    if(rays) rays.setAttribute('transform',`rotate(${(t*1.1)%360} ${cx} ${cy})`);
    if(ripples) ripples.setAttribute('transform',`translate(${Math.sin(t*0.6)*2},0)`);
    requestAnimationFrame(ambient);}
  requestAnimationFrame(ambient);

  let px=0,py=0,tx=0,ty=0,scrollY=0;
  if(heroEl){
    heroEl.addEventListener('pointermove',e=>{const r=heroEl.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-0.5)*2;ty=((e.clientY-r.top)/r.height-0.5)*2;});
    heroEl.addEventListener('pointerleave',()=>{tx=0;ty=0;});
  }
  if(scrollEl) scrollEl.addEventListener('scroll',e=>{scrollY=e.target.scrollTop;});
  function parax(){px+=(tx-px)*0.06;py+=(ty-py)*0.06;
    for(const L of layers){const d=parseFloat(L.dataset.depth);L.style.transform=`translate3d(${(px*d*16).toFixed(2)}px,${(py*d*10-scrollY*d*0.5).toFixed(2)}px,0)`;}
    requestAnimationFrame(parax);}
  requestAnimationFrame(parax);

  const grain=document.querySelector('.grain');
  if(grain){let gi=0;const ax=[0,17,34,8,23,40],ay=[0,29,9,40,17,30];
    setInterval(()=>{gi=(gi+1)%6;grain.style.backgroundPosition=`${ax[gi]}px ${ay[gi]}px`;},90);}
};

/* ---------------- high-level builders ---------------- */
S.buildHero=function(theme){
  const scene=document.getElementById('scene');
  if(!scene) return;
  (S.scenes[theme]||S.scenes.bharat)(scene);
};
S.initHome=function(theme){
  S.buildHero(theme);
  document.querySelectorAll('.hot .art').forEach(a=>S.hotArt(a, a.dataset.art, theme));
  S.decorate(theme);
  S.motion(document.getElementById('scene'), document.getElementById('hero'), document.getElementById('scroll'));
};
S.initIllustration=function(theme){
  const scene=document.getElementById('scene');
  (S.scenes[theme]||S.scenes.bharat)(scene);
  S.motion(scene, scene.parentElement, null);
};
})();
