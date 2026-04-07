let CPUS = [];
let GPUS = [];


const UPS = {
  gpu_none:   {name:"RTX 3060 12GB", why:"Sin GPU, Cycles es 10-50x más lento.", q:"NVIDIA RTX 3060 12GB"},
  gpu_no_vk:  {name:"GTX 1650 / RX 580", why:"Sin soporte Vulkan, Eevee fallará.", q:"GTX 1650"},
  gpu_no_rt:  {name:"RTX 3060", why:"Sin Ray Tracing no tienes OptiX acelerado.", q:"RTX 3060"},
  gpu_weak:   {name:"RTX 4060", why:"GPU limitante para renders pro.", q:"NVIDIA RTX 4060"},
  vram_crit:  {name:"GPU 8+ GB VRAM", why:"Menos de 4 GB causa crashes al cargar texturas.", q:"NVIDIA RTX 3060"},
  vram_low:   {name:"GPU 12+ GB VRAM", why:"Quedarse sin VRAM tira Cycles por CPU.", q:"NVIDIA RTX 4070"},
  ram_crit:   {name:"16 GB RAM", why:"Blender se cerrará en escenas medias.", q:"16GB DDR4 kit"},
  ram_low:    {name:"32 GB RAM", why:"Mejor estabilidad para texturas 4K.", q:"32GB RAM kit"},
  ram_med:    {name:"32 GB/64 GB", why:"Para simulaciones se necesita más RAM.", q:"32GB RAM kit"},
  cpu_crit:   {name:"Ryzen 5 5600X", why:"Tu CPU frena exportados rápidos.", q:"Ryzen 5 5600X"},
  cpu_low:    {name:"Core i5-12400", why:"CPU frenando procesos generales.", q:"Intel Core i5-12400"},
  ssd_crit:   {name:"SSD 500GB", why:"HDD multiplica tiempos de carga x10.", q:"SSD SATA 500GB"},
  gpu_ok_up:  {name:"RTX 4070 / 4080", why:"Reducirás tiempos de minutos a segundos.", q:"RTX 4080"},
  cpu_ok_up:  {name:"Ryzen 9 / i9", why:"Para simulaciones destructivas veloces.", q:"Ryzen 9"},
  ram_ok_up:  {name:"64 GB RAM", why:"Recomendado para uso en estudios grandes.", q:"64GB RAM kit"}
};

let OS = "windows";
function selOS(b) { document.querySelectorAll('.osb').forEach(x => x.classList.remove('on')); b.classList.add('on'); OS=b.dataset.os; }

// --- AMAZON AFILIADOS ---
const AMAZON_TAG = 'alexriquelme-20';
function amz(q) { return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`; }
function ggl(q) { return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`; }
function sb(q) { return `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.55rem"><a href="${amz(q)}" target="_blank" class="sbtn s-amz">🛒 Amazon</a><a href="${ggl(q)}" target="_blank" class="sbtn s-ggl">🔍 Google Shopping</a></div>`; }

function ramSc(r) { return r>=64?100 : r>=32?80 : r>=16?55 : r>=8?28 : 8; }
function normCpu(s) { return Math.min(100, (s/250)*100); }
function normGpu(s) { return Math.min(100, (s/4000)*100); }
function totalSc(cpu, gpu, ram) { return Math.round(normCpu(cpu.s)*0.30 + normGpu(gpu.s)*0.45 + ramSc(ram)*0.25); }
// CPU >150 óptimo, GPU >1200 óptimo
function tier(s, critBelow, warnBelow) { return s<critBelow ? 'crit' : s<warnBelow ? 'warn' : 'ok'; }

function sdot(t) { return `<div class="sdot ${t==='crit'?'sdot-r':t==='warn'?'sdot-o':'sdot-g'}"></div>`; }
function minib(pct,t) { const col=t==='crit'?'#ef4444':t==='warn'?'#f97316':'#22c55e'; return `<div class="mbar"><div class="mfill" style="width:${Math.min(100,pct)}%;background:${col}"></div></div>`; }

async function init() {
  try {
    const response = await fetch('benchmarks.json');
    if(!response.ok) throw new Error('Error al cargar archivo local');
    const data = await response.json();
    
    CPUS = [{n:"— Selecciona CPU —", s:0, c:0}];
    GPUS = [{n:"— Selecciona GPU —", s:0, v:0, rt:false, vk:false}];
    
    data.forEach(item => {
      if (item.tipo === "CPU") {
        CPUS.push({ n: item.nombre, s: item.score, c: 8 }); 
      } else if (item.tipo === "GPU") {
        const vMatch = item.nombre.match(/(\d+)\s*GB/i);
        let vram = vMatch ? parseInt(vMatch[1]) : (item.score > 4000 ? 12 : (item.score > 1500 ? 8 : 4));
        let rt = item.nombre.includes("RTX") || item.nombre.includes("RX 6") || item.nombre.includes("RX 7");
        let vk = !item.nombre.includes("Iris") && !item.nombre.includes("M1") && !item.nombre.includes("M2"); 
        
        GPUS.push({ n: item.nombre, s: item.score, v: vram, rt: rt, vk: vk });
      }
    });

  } catch(error) {
    console.warn("⚠️ Error cargando benchmarks.json:", error);
    toast("Error cargando la base de datos de componentes.", "error");
  }

  const cList = document.getElementById('cpuList');
  const gList = document.getElementById('gpuList');
  if(cList && gList) {
    CPUS.forEach(c => { const o = document.createElement('option'); o.value = c.n; cList.appendChild(o); });
    GPUS.forEach(g => { const o = document.createElement('option'); o.value = g.n; gList.appendChild(o); });
  }
}

function run() {
  const inputCpu = document.getElementById('sCPU').value;
  const inputGpu = document.getElementById('sGPU').value;
  const cpu = CPUS.find(c => c.n === inputCpu);
  const gpu = GPUS.find(g => g.n === inputGpu);
  const ram = parseInt(document.getElementById('sRAM').value);
  const stg = document.getElementById('sSTG').value;
  const use = document.getElementById('sUSE').value;
  
  if(!cpu || typeof cpu.s === 'undefined') { toast('⚠️ Por favor elige un procesador de la lista.','warn'); return; }
  if(!gpu || typeof gpu.s === 'undefined') { toast('⚠️ Por favor elige una GPU de la lista.','warn'); return; }

  const btn = document.getElementById('btnA');
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Generando diagnóstico…';
  const pp = document.getElementById('pp'), pb = document.getElementById('pBar'), pt = document.getElementById('pt');
  pp.style.display = 'block'; document.getElementById('results').style.display = 'none';

  const steps = [[18,"Analizando OpenData…"],[38,"Buscando Cuellos de Botella…"],[55,"Filtrando recomendaciones…"],[72,"Generando enlaces Amazon Afiliados…"],[100,"¡Plan listo!"]];
  let i = 0;
  const iv = setInterval(() => {
    if(i >= steps.length) { clearInterval(iv); setTimeout(() => { pp.style.display='none'; btn.disabled=false; btn.innerHTML='Nuevo Análisis'; render(cpu,gpu,ram,stg,use); }, 300); return; }
    pb.style.width = steps[i][0] + '%'; pt.textContent = steps[i][1]; i++;
  }, 200);
}

function render(cpu,gpu,ram,stg,use) {
  const score = totalSc(cpu,gpu,ram);
  const stgS = stg==='nvme'?100 : stg==='sata'?65 : 18;

  const vramS = gpu.v>=12?100 : gpu.v>=8?75 : gpu.v>=6?50 : gpu.v>=4?28 : 5;
  const cpuT = tier(cpu.s, 80, 150);
  const gpuT = tier(gpu.s, 600, 1200);
  const vramT = tier(vramS, 30, 60);
  const ramT = tier(ramSc(ram), 30, 60);
  const stgT = tier(stgS, 30, 65);

  const ranked = [
    {id:'gpu', label:'GPU', s:Math.round(normGpu(gpu.s)), t:gpuT, name:gpu.n},
    {id:'cpu', label:'CPU', s:Math.round(normCpu(cpu.s)), t:cpuT, name:cpu.n},
    {id:'vram', label:'VRAM GPU', s:vramS, t:vramT, name:gpu.v>0 ? gpu.v+' GB' : 'Sin dedicada'},
    {id:'ram', label:'RAM', s:ramSc(ram), t:ramT, name:ram+' GB'},
    {id:'stg', label:'Disco', s:stgS, t:stgT, name:stg==='nvme'?'NVMe':stg==='sata'?'SSD SATA':'HDD'}
  ];
  const worst = ranked.reduce((a,b) => a.s<b.s ? a : b);

  function compRow(r) {
    const tLabel = {crit:'🔴 Crítico', warn:'🟠 Regular', ok:'✅ Óptimo'}[r.t];
    const tCol = {crit:'#fca5a5', warn:'#fdba74', ok:'#86efac'}[r.t];
    const tBg = {crit:'rgba(239,68,68,.1)', warn:'rgba(249,115,22,.1)', ok:'rgba(34,197,94,.08)'}[r.t];
    const isBN = worst.id === r.id;
    return `<div class="comp-item" style="${isBN ? 'border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.06)' : ''}">
      ${sdot(r.t)}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:.35rem;margin-bottom:.15rem">
          <span style="font-size:.66rem;font-weight:700;color:#6b7280">${r.label}</span>
          <span style="font-size:.68rem;padding:1px 7px;border-radius:9999px;background:${tBg};color:${tCol}">${tLabel}</span>
        </div>
        <p style="font-size:.83rem;font-weight:600;color:#f3f4f6;margin-bottom:.1rem;">${r.name}</p>
        ${minib(r.s,r.t)}
      </div>
    </div>`;
  }
  const leftCol = `<div style="display:flex;flex-direction:column;gap:.55rem">${ranked.map(compRow).join('')}</div>`;

  const crits=[], warns=[], opts=[];
  if(!gpu.rt && gpu.v>0) {crits.push({label:'GPU - Sin Ray Tracing',up:UPS.gpu_no_rt});}
  if(!gpu.vk && gpu.v>0) {crits.push({label:'GPU - Sin Vulkan (Eevee Fallará)',up:UPS.gpu_no_vk});}
  else if(gpuT==='crit') {crits.push({label:'GPU - Muy Lenta en Render',up:UPS.gpu_weak});}
  else if(gpuT==='warn') {warns.push({label:'GPU - Rendimiento Regular',up:UPS.gpu_weak});}
  else {opts.push({label:'GPU - Óptima',up:UPS.gpu_ok_up});}

  if(gpu.v>0 && gpu.v<4) {crits.push({label:'VRAM Insuficiente (Crashes)',up:UPS.vram_crit});}
  else if(gpu.v>=4 && gpu.v<8) {warns.push({label:'VRAM Ajustada',up:UPS.vram_low});}

  if(ram<16) {crits.push({label:'RAM Crítica',up:UPS.ram_crit});}
  else if(ram<32) {warns.push({label:'RAM Limitante',up:UPS.ram_med});}
  else {opts.push({label:'RAM OK',up:UPS.ram_ok_up});}

  if(cpuT==='crit') {crits.push({label:'CPU Limitante',up:UPS.cpu_crit});}
  else if(cpuT==='warn') {warns.push({label:'CPU Regular',up:UPS.cpu_low});}
  else {opts.push({label:'CPU OK',up:UPS.cpu_ok_up});}

  if(stg==='hdd') {crits.push({label:'Sin Disco SSD',up:UPS.ssd_crit});}

  function upItem(item) {
    return `<div style="margin-bottom:.45rem">
      <p style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:.1rem">${item.label}</p>
      <div class="up-card">
        <p style="font-weight:700;color:#f3f4f6;font-size:.76rem;margin-bottom:.2rem">${item.up.name}</p>
        <p style="font-size:.76rem;color:#9ca3af;line-height:1.6">${item.up.why}</p>
        ${sb(item.up.q)}
      </div>
    </div>`;
  }
  let rightCol='';
  if(crits.length) rightCol+=`<div class="tier-crit" style="margin-bottom:.75rem"><div class="tier-crit-head"><span class="badge-crit">¡Prioridad Alta!</span></div>${crits.map(upItem).join('')}</div>`;
  if(warns.length) rightCol+=`<div class="tier-warn" style="margin-bottom:.75rem"><div class="tier-warn-head"><span class="badge-warn">Mejoras Sugeridas</span></div>${warns.map(upItem).join('')}</div>`;
  if(opts.length) rightCol+=`<div class="tier-ok"><button class="opt-toggle" onclick="toggleOpt()"><span class="badge-ok">✅ Óptimos</span></button><div id="optSection" style="display:none;margin-top:.5rem">${opts.map(upItem).join('')}</div></div>`;

  const sc = score>=65?'#22c55e':score>=40?'#f59e0b':'#ef4444';
  const html = `
  <div class="card fu" style="margin-bottom:1.15rem;display:flex;align-items:center;gap:1.25rem">
    <div style="position:relative;width:96px;height:96px;">
      <svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" fill="none" stroke="#2d3748" stroke-width="8"/><circle id="sRing" cx="48" cy="48" r="44" fill="none" stroke="${sc}" stroke-width="8" stroke-dasharray="276" stroke-dashoffset="276" transform="rotate(-90 48 48)"/></svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span id="sNum" style="font-size:1.6rem;font-weight:900;color:${sc}">0</span><span style="font-size:.62rem;color:#6b7280">/100</span></div>
    </div>
    <div>
      <p style="font-size:.65rem;color:#6b7280;margin-bottom:.2rem;">PUNTAJE GLOBAL BLENDER 5.X</p>
      <p style="font-size:1.25rem;font-weight:900;color:#f3f4f6;">Resultado: OpenData</p>
      <p style="font-size:.78rem;font-weight:700;color:#f59e0b;margin-top:.3rem">Cycles Rendimiento: ${gpu.s>=1200?'Excelente':gpu.s>=600?'Regular':'Lento / Solo CPU'}</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1.1rem">
    <div class="card fu"><h3 style="color:#fff;margin-bottom:1rem;font-size:.9rem;font-weight:800;">TU SETUP</h3>${leftCol}</div>
    <div class="card fu"><h3 style="color:#fff;margin-bottom:1rem;font-size:.9rem;font-weight:800;">PLAN DE MEJORA</h3>${rightCol}</div>
  </div>`;

  const el = document.getElementById('results'); el.innerHTML = html; el.style.display = 'block'; el.scrollIntoView({behavior:'smooth'});
  setTimeout(() => { const r=document.getElementById('sRing'),n=document.getElementById('sNum'); if(r){ r.style.strokeDashoffset=276-(score/100*276); let c=0; const iv=setInterval(()=>{c=Math.min(c+2,score);n.textContent=Math.round(c);if(c>=score)clearInterval(iv);},16); } }, 200);
  setTimeout(()=>document.querySelectorAll('.mfill').forEach(b=>{const w=b.style.width;b.style.width='0';setTimeout(()=>b.style.width=w,50);}), 300);
}

function toggleOpt() { const s=document.getElementById('optSection'); if(s) s.style.display=s.style.display==='block'?'none':'block'; }
function toast(msg,t='info') {
  const o=document.getElementById('_t'); if(o)o.remove();
  const d=document.createElement('div'); d.id='_t'; d.style.cssText=`position:fixed;bottom:1.25rem;right:1.25rem;z-index:999;padding:.65rem 1.1rem;border-radius:.8rem;font-size:.83rem;backdrop-filter:blur(14px);background:rgba(55,65,81,.9);color:#fff`;
  d.textContent=msg; document.body.appendChild(d); setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),300);},3000);
}
document.addEventListener('DOMContentLoaded', init);
