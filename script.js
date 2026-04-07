// ══════════════════════════════════════════════════════════
//  BASES DE DATOS (Dinamica + Fallback)
// ══════════════════════════════════════════════════════════
let CPUS = [];
let GPUS = [];

const fallbackData = {
  cpus: [
    {n:"AMD Ryzen 5 5600X (6c)",s:160,c:6},
    {n:"Intel Core i5-12400F (6c)",s:160,c:6},
    {n:"AMD Ryzen 9 7900X (12c)",s:450,c:12}
  ],
  gpus: [
    {n:"NVIDIA RTX 3060 — 12 GB",s:2400,v:12,rt:true,vk:true},
    {n:"AMD Radeon RX 6600 — 8 GB",s:1200,v:8,rt:true,vk:true},
    {n:"NVIDIA RTX 4070 — 12 GB",s:5500,v:12,rt:true,vk:true}
  ]
};
// ── Catálogo de upgrades recomendados ─────────────────────
const UPS={
  gpu_none:   {name:"NVIDIA RTX 3060 — 12 GB", why:"Sin GPU dedicada, Blender Cycles sólo usa CPU: 10-50x más lento. La RTX 3060 tiene la mejor relación VRAM/precio de entrada.", q:"RTX 3060 12GB comprar precio"},
  gpu_no_vk:  {name:"NVIDIA GTX 1650 / AMD RX 580 o superior", why:"Tu GPU no soporta Vulkan, requerido por Blender 5.x para Eevee Next. Necesitas actualizar para que Eevee funcione correctamente.", q:"GTX 1650 precio oferta"},
  gpu_no_rt:  {name:"NVIDIA RTX 3060 — 12 GB", why:"Sin Ray Tracing no puedes usar Cycles GPU con OptiX. La RTX 3060 soporta OptiX y tiene 12 GB VRAM — más que modelos más caros.", q:"RTX 3060 12GB precio 2024"},
  gpu_weak:   {name:"NVIDIA RTX 3060 Ti — 8 GB", why:"Tu GPU tiene bajo rendimiento para Blender. La RTX 3060 Ti ofrece excelente precio/rendimiento y acelera Cycles GPU con OptiX.", q:"RTX 3060 Ti precio oferta"},
  vram_crit:  {name:"NVIDIA RTX 3060 — 12 GB", why:"Con menos de 4 GB de VRAM Blender fallará al cargar escenas con texturas básicas. La RTX 3060 tiene 12 GB, la mayor VRAM en su rango de precio.", q:"RTX 3060 12GB precio"},
  vram_low:   {name:"GPU con 8+ GB VRAM (ej: RTX 3060 12 GB)", why:"Con 4-6 GB de VRAM Blender caerá a renderizado CPU al cargar texturas 4K. 8 GB es el mínimo práctico para escenas completas.", q:"GPU 8GB VRAM Blender precio"},
  ram_crit:   {name:"16 GB DDR4 3200 MHz (kit 2×8)", why:"Con menos de 8 GB Blender se cierra al abrir cualquier escena mediana. 16 GB elimina crashes y es la mejora más barata con mayor impacto.", q:"16GB DDR4 3200MHz kit precio"},
  ram_low:    {name:"32 GB DDR4 3200 MHz (kit 2×16)", why:"Con 8 GB Blender trabaja en límite. Pasar a 16 GB evita cierres; con 32 GB podrás hacer simulaciones de fluidos y texturas 4K sin problemas.", q:"32GB DDR4 3200MHz kit precio"},
  ram_med:    {name:"32 GB DDR4 3200 MHz", why:"16 GB es el mínimo recomendado pero limitará animaciones y simulaciones. 32 GB te da margen para escenas complejas y caché de simulaciones.", q:"32GB DDR4 kit precio"},
  cpu_crit:   {name:"AMD Ryzen 5 5600X", why:"Tu CPU limita gravemente Blender en renderizado, viewport y multitarea. El Ryzen 5 5600X (6 núcleos Zen3) es la actualización de mayor impacto a menor precio.", q:"Ryzen 5 5600X precio oferta"},
  cpu_low:    {name:"AMD Ryzen 7 5700X", why:"Tu CPU limita los renders Cycles en CPU. El Ryzen 7 5700X (8 núcleos Zen3) ofrece excelente relación precio/núcleo para animaciones y renders largos.", q:"Ryzen 7 5700X precio"},
  ssd_crit:   {name:"SSD SATA 480 GB (Samsung 870 EVO)", why:"Un HDD hace que Blender tarde minutos en cargar proyectos y escribe la caché de simulaciones lentísimo. Un SSD SATA económico cambia la experiencia por completo.", q:"SSD SATA 480GB Samsung 870 EVO precio"},
  gpu_ok_up:  {name:"NVIDIA RTX 4070 — 12 GB", why:"Para escenas más densas o renderizado 4K, la RTX 4070 duplica el rendimiento de tu GPU actual con la misma VRAM.", q:"RTX 4070 precio"},
  cpu_ok_up:  {name:"AMD Ryzen 9 5900X / 7900X", why:"Más núcleos reducen drásticamente los tiempos de render Cycles CPU y permiten simulaciones más complejas en menos tiempo.", q:"Ryzen 9 5900X precio"},
  ram_ok_up:  {name:"64 GB DDR4/DDR5", why:"Para renders con assets pesados, esculturas de alta densidad y simulaciones VFX de producción, 64 GB elimina cualquier límite de RAM.", q:"64GB DDR4 kit precio"},
};

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
let OS="windows";
function selOS(b){document.querySelectorAll('.osb').forEach(x=>x.classList.remove('on'));b.classList.add('on');OS=b.dataset.os;}
const AMAZON_TAG='tu-id-de-afiliado-20';
function amz(q){return"https://www.amazon.com/s?k="+encodeURIComponent(q)+"&tag="+AMAZON_TAG;}
function ggl(q){return"https://www.google.com/search?tbm=shop&q="+encodeURIComponent(q);}
function ramSc(r){return r>=64?100:r>=32?80:r>=16?55:r>=8?28:8;}

function normalizedCpu(s){ return Math.min(100, (s / 250) * 100); }
function normalizedGpu(s){ return Math.min(100, (s / 3000) * 100); }

function totalSc(cpu,gpu,ram){
  return Math.round(normalizedCpu(cpu.s)*0.30 + normalizedGpu(gpu.s)*0.45 + ramSc(ram)*0.25);
}

async function populate(){
  try {
    const res = await fetch('benchmarks.json');
    if(!res.ok) throw new Error('Network error');
    const data = await res.json();
    CPUS = data.cpus;
    GPUS = data.gpus;
  } catch(e) {
    console.warn("Usando fallback DB por error (ej: CORS local):", e);
    CPUS = fallbackData.cpus;
    GPUS = fallbackData.gpus;
  }
  
  const cs=document.getElementById('cpuList'),gs=document.getElementById('gpuList');
  if(!cs || !gs) return;
  CPUS.forEach(c=>{const o=document.createElement('option');o.value=c.n;cs.appendChild(o);});
  GPUS.forEach(g=>{const o=document.createElement('option');o.value=g.n;gs.appendChild(o);});
}

// Clasifica un score en nivel: 'crit', 'warn', 'ok'
function tier(s,critBelow,warnBelow){return s<critBelow?'crit':s<warnBelow?'warn':'ok';}

function sdot(t){return`<div class="sdot ${t==='crit'?'sdot-r':t==='warn'?'sdot-o':'sdot-g'}"></div>`;}
function minib(pct,t){
  const col=t==='crit'?'#ef4444':t==='warn'?'#f97316':'#22c55e';
  return`<div class="mbar"><div class="mfill" style="width:${Math.min(100,pct)}%;background:${col}"></div></div>`;
}
// Shop buttons
function sb(q){return`<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.55rem"><a href="${amz(q)}" target="_blank" class="sbtn s-amz">🛒 Amazon</a><a href="${ggl(q)}" target="_blank" class="sbtn s-ggl">🔍 Google Shopping</a></div>`;}

// ══════════════════════════════════════════════════════════
//  RUNNER
// ══════════════════════════════════════════════════════════
function run(){
  const cpu=CPUS.find(c=>c.n===document.getElementById('sCPU').value);
  const gpu=GPUS.find(g=>g.n===document.getElementById('sGPU').value);
  const ram=parseInt(document.getElementById('sRAM').value);
  const stg=document.getElementById('sSTG').value;
  const use=document.getElementById('sUSE').value;
  if(!cpu||cpu.s===0){toast('⚠️ Selecciona tu CPU.','warn');return;}
  if(!gpu||gpu.s===0){toast('⚠️ Selecciona tu GPU.','warn');return;}

  const btn=document.getElementById('btnA');
  btn.disabled=true;btn.innerHTML='<span class="spin"></span> Generando plan…';
  const pp=document.getElementById('pp'),pb=document.getElementById('pBar'),pt=document.getElementById('pt');
  pp.style.display='block';document.getElementById('results').style.display='none';

  const steps=[[18,"Clasificando CPU…"],[38,"Clasificando GPU y VRAM…"],[55,"Analizando RAM…"],[72,"Estableciendo prioridades…"],[90,"Buscando upgrades óptimos…"],[100,"¡Plan listo!"]];
  let i=0;
  const iv=setInterval(()=>{
    if(i>=steps.length){clearInterval(iv);setTimeout(()=>{pp.style.display='none';btn.disabled=false;btn.innerHTML='<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Nuevo Análisis';render(cpu,gpu,ram,stg,use);},300);return;}
    pb.style.width=steps[i][0]+'%';pt.textContent=steps[i][1];i++;
  },450);
}

// ══════════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════════
function render(cpu,gpu,ram,stg,use){
  const ramS=ramSc(ram),score=totalSc(cpu,gpu,ram);
  const stgS=stg==='nvme'?100:stg==='sata'?65:18;

  // Clasificar cada componente con reglas actualizadas
  const vramS=gpu.v>=12?100:gpu.v>=8?75:gpu.v>=6?50:gpu.v>=4?28:5;
  const cpuT =tier(cpu.s,80,150);
  const gpuT =tier(gpu.s,600,1200);
  const vramT=tier(vramS,30,60);
  const ramT =tier(ramS, 30,60);
  const stgT =tier(stgS, 30,65);

  // Cuello de botella = componente con menor score ponderado
  const ranked=[
    {id:'cpu',  label:'CPU',             s:Math.round(normalizedCpu(cpu.s)), t:cpuT,  name:cpu.n.split('(')[0].trim()},
    {id:'gpu',  label:'GPU',             s:Math.round(normalizedGpu(gpu.s)), t:gpuT,  name:gpu.n.split('—')[0].trim()},
    {id:'vram', label:'VRAM GPU',        s:vramS, t:vramT, name:gpu.v>0?gpu.v+' GB':'Sin dedicada'},
    {id:'ram',  label:'RAM del sistema', s:ramS,  t:ramT,  name:ram+' GB'},
    {id:'stg',  label:'Almacenamiento',  s:stgS,  t:stgT,  name:stg==='nvme'?'NVMe':stg==='sata'?'SSD SATA':'HDD'},
  ];
  const worst=ranked.reduce((a,b)=>a.s<b.s?a:b);

  // ── Columna izquierda: estado actual ──────────────────
  function compRow(r){
    const tLabel={crit:'🔴 Crítico',warn:'🟠 Regular',ok:'✅ Óptimo'}[r.t];
    const tCol  ={crit:'#fca5a5',warn:'#fdba74',ok:'#86efac'}[r.t];
    const tBg   ={crit:'rgba(239,68,68,.1)',warn:'rgba(249,115,22,.1)',ok:'rgba(34,197,94,.08)'}[r.t];
    const tBd   ={crit:'rgba(239,68,68,.3)',warn:'rgba(249,115,22,.3)',ok:'rgba(34,197,94,.25)'}[r.t];
    const isBN  =worst.id===r.id;
    return`<div class="comp-item" style="${isBN?'border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.06)':''}">
      ${sdot(r.t)}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:.35rem;margin-bottom:.15rem">
          <span style="font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6b7280">${r.label}</span>
          <span style="font-size:.68rem;font-weight:800;padding:1px 7px;border-radius:9999px;background:${tBg};border:1px solid ${tBd};color:${tCol}">${tLabel}</span>
          ${isBN?'<span style="font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:1px 7px;border-radius:9999px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.45);color:#fca5a5">⚡ Cuello de botella</span>':''}
        </div>
        <p style="font-size:.83rem;font-weight:600;color:#f3f4f6;margin-bottom:.1rem;font-family:'JetBrains Mono',monospace">${r.name}</p>
        ${minib(r.s,r.t)}
        <p style="font-size:.66rem;color:#4b5563;margin-top:.2rem">${r.s}/100 pts</p>
      </div>
    </div>`;
  }

  const leftCol=`<div style="display:flex;flex-direction:column;gap:.55rem">${ranked.map(compRow).join('')}</div>`;

  // ── Columna derecha: plan de mejora priorizado ────────
  const crits=[],warns=[],opts=[];

  // — GPU crítica —
  if(gpu.v===0||gpu.s<=5){crits.push({label:'GPU — Sin GPU dedicada',up:UPS.gpu_none});}
  else if(!gpu.vk)       {crits.push({label:'GPU — Sin soporte Vulkan',up:UPS.gpu_no_vk});}
  else if(!gpu.rt)       {crits.push({label:'GPU — Sin Ray Tracing (Cycles GPU limitado)',up:UPS.gpu_no_rt});}
  else if(gpuT==='crit') {crits.push({label:'GPU — Rendimiento muy bajo',up:UPS.gpu_weak});}
  else if(gpuT==='warn') {warns.push({label:'GPU — Rendimiento limitado',up:UPS.gpu_weak});}
  else                   {opts.push({label:'GPU — Ya es óptima',up:UPS.gpu_ok_up});}

  // — VRAM crítica —
  if(gpu.v>0&&gpu.v<4)       {crits.push({label:'VRAM — Insuficiente (cierres garantizados)',up:UPS.vram_crit});}
  else if(gpu.v>=4&&gpu.v<8) {warns.push({label:'VRAM — Ajustada para escenas medianas',up:UPS.vram_low});}

  // — RAM —
  if(ram<8)       {crits.push({label:'RAM — Crítica (cierres en escenas medias)',up:UPS.ram_crit});}
  else if(ram<16) {crits.push({label:'RAM — Insuficiente para Blender estable',up:UPS.ram_low});}
  else if(ram<32) {warns.push({label:'RAM — Mínimo para Blender pero limitante',up:UPS.ram_med});}
  else            {opts.push({label:'RAM — Suficiente',up:UPS.ram_ok_up});}

  // — CPU —
  if(cpuT==='crit')     {crits.push({label:'CPU — Cuello de botella en renderizado',up:UPS.cpu_crit});}
  else if(cpuT==='warn'){warns.push({label:'CPU — Limita tiempos de render',up:UPS.cpu_low});}
  else                  {opts.push({label:'CPU — Suficiente',up:UPS.cpu_ok_up});}

  // — Storage —
  if(stg==='hdd')  {crits.push({label:'Almacenamiento — HDD muy lento para Blender',up:UPS.ssd_crit});}

  // — Caso de uso extra —
  if((use==='vfx'||use==='animation')&&ram<32&&ramT!=='crit')
    warns.push({label:'RAM insuficiente para '+( use==='vfx'?'simulaciones VFX':'animaciones largas'),up:UPS.ram_med});
  if(OS==='mac'&&gpu.s>0&&!gpu.vk)
    crits.push({label:'GPU incompatible con Metal en macOS',up:{name:'Actualizar a GPU con soporte Metal',why:'En macOS Blender 5.x usa Metal. GPUs antiguas o sin soporte Metal causarán fallos.',q:'GPU Metal macOS Blender compatible'}});

  // — Construir tarjetas —
  function upCard(item){
    return`<div class="up-card">
      <p style="font-size:.72rem;font-weight:700;color:#f3f4f6;margin-bottom:.25rem">${item.up.name}</p>
      <p style="font-size:.76rem;color:#9ca3af;line-height:1.6">${item.up.why}</p>
      ${sb(item.up.q)}
    </div>`;}

  function upItem(item){
    return`<div style="margin-bottom:.45rem">
      <p style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:.1rem">${item.label}</p>
      ${upCard(item)}
    </div>`;}

  let rightCol='';

  // PRIORIDAD ALTA (Críticos)
  if(crits.length){
    rightCol+=`<div class="tier-crit" style="margin-bottom:.75rem">
      <div class="tier-crit-head">
        <svg width="16" height="16" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        <span class="badge-crit">¡Prioridad Alta!</span>
        <span style="font-size:.75rem;font-weight:700;color:#fca5a5">Impide el funcionamiento correcto</span>
      </div>
      ${crits.map(upItem).join('')}
    </div>`;}

  // MEJORA DE RENDIMIENTO (Regulares)
  if(warns.length){
    rightCol+=`<div class="tier-warn" style="margin-bottom:.75rem">
      <div class="tier-warn-head">
        <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01"/></svg>
        <span class="badge-warn">Mejora de Rendimiento</span>
        <span style="font-size:.75rem;font-weight:700;color:#fdba74">Funciona, pero limita tu productividad</span>
      </div>
      ${warns.map(upItem).join('')}
    </div>`;}

  // OPCIONAL (Óptimos con sugerencia gama alta)
  if(opts.length){
    rightCol+=`<div class="tier-ok">
      <button class="opt-toggle" onclick="toggleOpt()">
        <svg id="optArrow" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="transition:transform .2s"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="badge-ok" style="margin-right:.25rem">✅ Componentes óptimos</span>
        Ver sugerencias opcionales de gama alta
      </button>
      <div id="optSection">${opts.map(upItem).join('')}</div>
    </div>`;}

  if(!crits.length&&!warns.length){
    rightCol=`<div class="tier-ok" style="padding:1.25rem">
      <p style="font-weight:700;color:#86efac;font-size:.95rem;margin-bottom:.4rem">🎉 ¡Setup sólido para Blender!</p>
      <p style="font-size:.82rem;color:#9ca3af;line-height:1.6">Tu hardware cumple o supera los requisitos recomendados de Blender 5.x para tu uso declarado. No hay upgrades urgentes.</p>
    </div>`;}

  // ── Score ring ────────────────────────────────────────
  const sc=score>=65?'#22c55e':score>=40?'#f59e0b':'#ef4444';
  const circ=2*Math.PI*44;
  const tierLabel=score>=68?'Preparado (Gama Media+)':score>=42?'Funcional (Gama Baja)':'Necesita Upgrades';
  const cycT=gpu.s>=4000?'~2-5 min/frame 1080p':gpu.s>=1500?'~10-25 min/frame':gpu.s>=500?'~45-90 min/frame':'Solo CPU: 90+ min/frame';
  const eeveeT=gpu.s>=2000?'60 FPS estable':gpu.s>=800?'Inestable / lenta':'Inutilizable';
  const stgLabel={hdd:'HDD',sata:'SSD SATA',nvme:'NVMe'}[stg];

  const html=`
  <!-- Score Banner -->
  <div class="card fu" style="margin-bottom:1.15rem;display:flex;flex-wrap:wrap;align-items:center;gap:1.25rem">
    <div style="position:relative;width:96px;height:96px;flex-shrink:0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="44" fill="none" stroke="#2d3748" stroke-width="8"/>
        <circle id="sRing" cx="48" cy="48" r="44" fill="none" stroke="${sc}" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
          transform="rotate(-90 48 48)"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span id="sNum" style="font-size:1.6rem;font-weight:900;line-height:1;color:${sc}">0</span>
        <span style="font-size:.62rem;color:#6b7280">/100</span>
      </div>
    </div>
    <div style="flex:1;min-width:200px">
      <p style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#6b7280;margin-bottom:.2rem">Puntaje de Rendimiento Blender 5.x</p>
      <p style="font-size:1.25rem;font-weight:900;color:#f3f4f6;margin-bottom:.1rem">${tierLabel}</p>
      <p style="font-size:.75rem;color:#6b7280;margin-bottom:.6rem">GPU 45% · CPU 30% · RAM 25%</p>
      <div style="display:flex;gap:1.4rem;flex-wrap:wrap">
        <div><p style="font-size:.62rem;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">Cycles GPU estimado</p><p style="font-size:.78rem;font-weight:700;color:#f59e0b;font-family:'JetBrains Mono',monospace">${cycT}</p></div>
        <div><p style="font-size:.62rem;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">Eevee Next</p><p style="font-size:.78rem;font-weight:700;color:#f59e0b;font-family:'JetBrains Mono',monospace">${eeveeT}</p></div>
        <div><p style="font-size:.62rem;color:#6b7280;text-transform:uppercase;letter-spacing:.06em">Almacenamiento</p><p style="font-size:.78rem;font-weight:700;color:#f59e0b;font-family:'JetBrains Mono',monospace">${stgLabel}</p></div>
      </div>
    </div>
  </div>

  <!-- Two columns -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1.1rem">

    <!-- LEFT: Setup actual -->
    <div class="card fu" style="animation-delay:.06s">
      <h3 style="font-size:.9rem;font-weight:800;color:#fff;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid #2d3748;display:flex;align-items:center;gap:.5rem">
        <span style="background:#2d3748;border:1px solid #374151;border-radius:.45rem;padding:.2rem .55rem;font-size:.68rem;color:#9ca3af;font-weight:700">TU PC</span>
        Estado de tus componentes
      </h3>
      ${leftCol}
      <div style="margin-top:.85rem;padding:.75rem .9rem;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.22);border-radius:.75rem">
        <p style="font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#fca5a5;margin-bottom:.2rem">⚡ Mayor limitante identificado</p>
        <p style="font-size:.88rem;font-weight:700;color:#fff">${worst.label}: ${worst.name}</p>
        <p style="font-size:.74rem;color:#9ca3af;margin-top:.2rem">Score: ${worst.s}/100 — Este componente es el principal freno para Blender en tu setup actual.</p>
      </div>
    </div>

    <!-- RIGHT: Plan de mejora -->
    <div class="card fu" style="animation-delay:.12s">
      <h3 style="font-size:.9rem;font-weight:800;color:#fff;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid #2d3748;display:flex;align-items:center;gap:.5rem">
        <span style="background:rgba(232,125,13,.15);border:1px solid rgba(232,125,13,.4);border-radius:.45rem;padding:.2rem .55rem;font-size:.68rem;color:#f59e0b;font-weight:700">PLAN</span>
        Lista de prioridades de mejora
      </h3>
      ${rightCol}
    </div>
  </div>`;

  const el=document.getElementById('results');
  el.innerHTML=html;el.style.display='block';
  el.scrollIntoView({behavior:'smooth',block:'start'});

  // Score animation
  setTimeout(()=>{
    const ring=document.getElementById('sRing'),num=document.getElementById('sNum');
    if(!ring)return;
    ring.style.strokeDashoffset=circ-(score/100*circ);
    let c=0;const st=score/60;
    const iv=setInterval(()=>{c=Math.min(c+st,score);num.textContent=Math.round(c);if(c>=score)clearInterval(iv);},16);
  },200);

  // Mini bar animation
  setTimeout(()=>{
    document.querySelectorAll('.mfill').forEach(b=>{const w=b.style.width;b.style.width='0';setTimeout(()=>b.style.width=w,50);});
  },300);
}

function toggleOpt(){
  const s=document.getElementById('optSection'),a=document.getElementById('optArrow');
  if(!s)return;
  const open=s.style.display==='block';
  s.style.display=open?'none':'block';
  if(a)a.style.transform=open?'':'rotate(90deg)';
}

// ══════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════
let _tt=null;
function toast(msg,t='info'){
  const o=document.getElementById('_t');if(o)o.remove();if(_tt)clearTimeout(_tt);
  const bg={warn:'rgba(245,158,11,.12)',error:'rgba(239,68,68,.12)',ok:'rgba(34,197,94,.12)',info:'rgba(55,65,81,.5)'}[t]||'rgba(55,65,81,.5)';
  const d=document.createElement('div');d.id='_t';
  d.style.cssText=`position:fixed;bottom:1.25rem;right:1.25rem;z-index:999;padding:.65rem 1.1rem;border-radius:.8rem;font-size:.83rem;font-weight:600;backdrop-filter:blur(14px);border:1px solid rgba(55,65,81,.7);background:${bg};color:#f3f4f6`;
  d.textContent=msg;document.body.appendChild(d);
  _tt=setTimeout(()=>{d.style.cssText+=';opacity:0;transition:opacity .3s';setTimeout(()=>d.remove(),320);},3000);
}

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',populate);
