/* =====================================================
   Blender HW Checker — Motor de análisis v3.0
   ===================================================== */

// ── Bases de datos ────────────────────────────────────
const CPUS = [
  {n:"— Selecciona CPU —",     s:0,  c:0,  g:""},
  // AMD Ryzen Gen 5 / 7 (Zen3 / Zen4)
  {n:"AMD Ryzen 9 7950X",  s:100,c:16,g:"Zen4"},
  {n:"AMD Ryzen 9 7900X",  s:94, c:12,g:"Zen4"},
  {n:"AMD Ryzen 7 7700X",  s:82, c:8, g:"Zen4"},
  {n:"AMD Ryzen 5 7600X",  s:68, c:6, g:"Zen4"},
  {n:"AMD Ryzen 9 5950X",  s:96, c:16,g:"Zen3"},
  {n:"AMD Ryzen 9 5900X",  s:90, c:12,g:"Zen3"},
  {n:"AMD Ryzen 7 5800X",  s:76, c:8, g:"Zen3"},
  {n:"AMD Ryzen 7 5700X",  s:70, c:8, g:"Zen3"},
  {n:"AMD Ryzen 5 5600X",  s:58, c:6, g:"Zen3"},
  {n:"AMD Ryzen 5 5600G",  s:50, c:6, g:"Zen3"},
  // AMD Ryzen Gen 3 (Zen2)
  {n:"AMD Ryzen 7 3700X",  s:62, c:8, g:"Zen2"},
  {n:"AMD Ryzen 5 3600",   s:48, c:6, g:"Zen2"},
  {n:"AMD Ryzen 5 3400G",  s:30, c:4, g:"Zen+"},
  {n:"AMD Ryzen 3 3200G",  s:22, c:4, g:"Zen+"},
  // Intel 13th / 12th
  {n:"Intel Core i9-13900K",s:98,c:24,g:"Raptor"},
  {n:"Intel Core i7-13700K",s:84,c:16,g:"Raptor"},
  {n:"Intel Core i5-13600K",s:72,c:14,g:"Raptor"},
  {n:"Intel Core i9-12900K",s:92,c:16,g:"Alder"},
  {n:"Intel Core i7-12700K",s:80,c:12,g:"Alder"},
  {n:"Intel Core i5-12600K",s:67,c:10,g:"Alder"},
  {n:"Intel Core i5-12400",  s:54, c:6,g:"Alder"},
  {n:"Intel Core i3-12100",  s:34, c:4,g:"Alder"},
  // Intel older
  {n:"Intel Core i7-11700K",s:68,c:8, g:"RktLk"},
  {n:"Intel Core i7-10700K",s:62,c:8, g:"CmtLk"},
  {n:"Intel Core i5-10400",  s:42,c:6, g:"CmtLk"},
  {n:"Intel Core i3-10100",  s:28,c:4, g:"CmtLk"},
  {n:"Intel Core i5-9600K",  s:38,c:6, g:"CoffL"},
  {n:"Intel Core i3-8100",   s:20,c:4, g:"CoffL"},
  // Budget / old
  {n:"AMD FX-8350",          s:14,c:8, g:"Vishera"},
  {n:"Intel Core i5-7400",   s:18,c:4, g:"Kaby"},
  {n:"Intel Core i3-6100",   s:12,c:2, g:"Skylk"},
  {n:"Otro / No sé",         s:25,c:4, g:"?"},
];

const GPUS = [
  {n:"— Selecciona GPU —",         s:0,  v:0,  rt:false, vendor:""},
  // NVIDIA RTX 40 series
  {n:"NVIDIA RTX 4090 (24 GB)",    s:100,v:24, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 4080 Super (16 GB)",s:88,v:16,rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 4070 Ti (12 GB)", s:80, v:12, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 4070 (12 GB)",    s:72, v:12, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 4060 Ti (8 GB)",  s:60, v:8,  rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 4060 (8 GB)",     s:52, v:8,  rt:true,  vendor:"NVIDIA"},
  // NVIDIA RTX 30 series
  {n:"NVIDIA RTX 3090 (24 GB)",    s:86, v:24, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3080 (10 GB)",    s:80, v:10, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3070 Ti (8 GB)",  s:70, v:8,  rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3070 (8 GB)",     s:65, v:8,  rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3060 Ti (8 GB)",  s:60, v:8,  rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3060 (12 GB)",    s:54, v:12, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 3050 (8 GB)",     s:42, v:8,  rt:true,  vendor:"NVIDIA"},
  // NVIDIA RTX 20 series
  {n:"NVIDIA RTX 2080 Ti (11 GB)", s:76, v:11, rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 2070 Super (8 GB)",s:60,v:8,  rt:true,  vendor:"NVIDIA"},
  {n:"NVIDIA RTX 2060 (6 GB)",     s:46, v:6,  rt:true,  vendor:"NVIDIA"},
  // NVIDIA GTX 16 series
  {n:"NVIDIA GTX 1660 Super (6 GB)",s:38,v:6,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1660 (6 GB)",     s:33, v:6,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1650 (4 GB)",     s:24, v:4,  rt:false, vendor:"NVIDIA"},
  // NVIDIA GTX 10 series
  {n:"NVIDIA GTX 1080 Ti (11 GB)", s:50, v:11, rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1080 (8 GB)",     s:42, v:8,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1070 (8 GB)",     s:36, v:8,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1060 (6 GB)",     s:28, v:6,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1050 Ti (4 GB)",  s:18, v:4,  rt:false, vendor:"NVIDIA"},
  {n:"NVIDIA GTX 1050 (2 GB)",     s:12, v:2,  rt:false, vendor:"NVIDIA"},
  // AMD RX 7000
  {n:"AMD RX 7900 XTX (24 GB)",    s:92, v:24, rt:true,  vendor:"AMD"},
  {n:"AMD RX 7800 XT (16 GB)",     s:68, v:16, rt:true,  vendor:"AMD"},
  {n:"AMD RX 7600 (8 GB)",         s:46, v:8,  rt:true,  vendor:"AMD"},
  // AMD RX 6000
  {n:"AMD RX 6800 XT (16 GB)",     s:72, v:16, rt:true,  vendor:"AMD"},
  {n:"AMD RX 6700 XT (12 GB)",     s:56, v:12, rt:true,  vendor:"AMD"},
  {n:"AMD RX 6600 XT (8 GB)",      s:44, v:8,  rt:true,  vendor:"AMD"},
  {n:"AMD RX 6600 (8 GB)",         s:38, v:8,  rt:true,  vendor:"AMD"},
  // AMD RX 5000 / Vega
  {n:"AMD RX 5700 XT (8 GB)",      s:50, v:8,  rt:false, vendor:"AMD"},
  {n:"AMD RX 580 (8 GB)",          s:28, v:8,  rt:false, vendor:"AMD"},
  {n:"AMD RX 570 (4 GB)",          s:20, v:4,  rt:false, vendor:"AMD"},
  // Intel Arc
  {n:"Intel Arc A770 (16 GB)",     s:48, v:16, rt:true,  vendor:"Intel"},
  {n:"Intel Arc A750 (8 GB)",      s:38, v:8,  rt:true,  vendor:"Intel"},
  // iGPU / None
  {n:"Gráficos integrados Intel (iGPU)",s:5,v:0,rt:false,vendor:"Intel"},
  {n:"Gráficos integrados AMD (APU)",   s:8,v:0,rt:false,vendor:"AMD"},
  {n:"Sin GPU dedicada / No sé",        s:3,v:0,rt:false,vendor:""},
];

// ── Tiers de referencia ───────────────────────────────
const TIERS = {
  low: { label:"🎮 Gama Baja",  cpu:"Ryzen 5 3600",  gpu:"GTX 1660 Super (6 GB)",  ram:16, storage:"SSD SATA", cycles:"~50 min / frame 1080p", eevee:"Fluida 60 FPS", cpuS:48, gpuS:38 },
  mid: { label:"⚡ Gama Media", cpu:"Ryzen 7 5700X", gpu:"RTX 3060 Ti (8 GB)",      ram:32, storage:"NVMe",     cycles:"~6 min / frame 1080p",  eevee:"60 FPS estable", cpuS:70, gpuS:60 },
  hi:  { label:"🚀 Gama Alta",  cpu:"Ryzen 9 7900X", gpu:"RTX 4080 Super (16 GB)", ram:64, storage:"NVMe Gen4", cycles:"~1 min / frame 4K",    eevee:"60 FPS máximos", cpuS:94, gpuS:88 },
};

// ── OS selector ───────────────────────────────────────
let selectedOS = "windows";
function selectOS(btn) {
  document.querySelectorAll('.os-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedOS = btn.dataset.os;
}

// ── Poblar selects ────────────────────────────────────
function populateSelects() {
  const cs = document.getElementById('sel-cpu');
  const gs = document.getElementById('sel-gpu');
  CPUS.forEach(c => { const o = document.createElement('option'); o.value=c.n; o.textContent=c.n; cs.appendChild(o); });
  GPUS.forEach(g => { const o = document.createElement('option'); o.value=g.n; o.textContent=g.n; gs.appendChild(o); });
}

// ── Análisis principal ────────────────────────────────
function runAnalysis() {
  const cpuName   = document.getElementById('sel-cpu').value;
  const gpuName   = document.getElementById('sel-gpu').value;
  const ram       = parseInt(document.getElementById('sel-ram').value);
  const storage   = document.getElementById('sel-storage').value;
  const useCase   = document.getElementById('sel-usecase').value;
  const os        = selectedOS;

  const cpu = CPUS.find(c => c.n === cpuName);
  const gpu = GPUS.find(g => g.n === gpuName);

  if (!cpu || cpu.s === 0) { showToast('⚠️ Selecciona tu CPU primero.','warn'); return; }
  if (!gpu || gpu.s === 0) { showToast('⚠️ Selecciona tu GPU primero.','warn'); return; }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analizando…';

  const prog = document.getElementById('progressPanel');
  const bar  = document.getElementById('progressBar');
  const txt  = document.getElementById('progressText');
  prog.classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');

  const steps = [
    [20,  `Evaluando ${cpu.n.split(' ').slice(0,4).join(' ')}…`],
    [45,  `Analizando ${gpu.n.split(' ').slice(0,3).join(' ')} (${gpu.v} GB VRAM)…`],
    [65,  'Detectando cuellos de botella para Blender…'],
    [82,  'Comparando con setups de referencia…'],
    [95,  'Generando recomendaciones personalizadas…'],
    [100, '¡Diagnóstico listo!'],
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(iv);
      setTimeout(() => {
        prog.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Volver a analizar';
        renderResults({ cpu, gpu, ram, storage, useCase, os });
      }, 300);
      return;
    }
    bar.style.width = steps[i][0] + '%';
    txt.textContent = steps[i][1];
    i++;
  }, 550);
}

// ── Score global (ponderado para Blender) ────────────
function blenderScore(cpu, gpu, ram) {
  const ramS = ram >= 64 ? 100 : ram >= 32 ? 80 : ram >= 16 ? 55 : ram >= 8 ? 30 : 10;
  return Math.round(cpu.s * 0.30 + gpu.s * 0.45 + ramS * 0.25);
}

function userTier(score) {
  return score >= 68 ? 'hi' : score >= 42 ? 'mid' : 'low';
}

// ── Diagnóstico inteligente ───────────────────────────
function getDiagnosis(cpu, gpu, ram, storage, useCase, os) {
  const errors = [], warns = [], goods = [];

  // CPU
  if (cpu.s >= 80)      goods.push(`Tu CPU <strong>${cpu.n}</strong> (${cpu.c} núcleos) es excelente para Blender. El renderizado CPU con Cycles será rápido.`);
  else if (cpu.s >= 55) warns.push(`Tu CPU <strong>${cpu.n}</strong> es aceptable pero notarás tiempos de render largos en escenas complejas con Cycles CPU.`);
  else if (cpu.s >= 30) errors.push(`Tu CPU <strong>${cpu.n}</strong> es el principal cuello de botella. Con pocos núcleos o baja velocidad, los renders Cycles CPU serán muy lentos.`);
  else                  errors.push(`Tu CPU <strong>${cpu.n}</strong> limitará severamente Blender. Considera actualizar incluso a un Ryzen 5 3600 para notar una mejora enorme.`);

  // GPU + VRAM
  if (gpu.v === 0)
    errors.push(`No tienes GPU dedicada. Blender Cycles en GPU no funcionará — sólo renderizado por CPU, que es mucho más lento. Una GPU dedicada es la mejora más impactante que puedes hacer.`);
  else if (!gpu.rt)
    errors.push(`Tu GPU <strong>${gpu.n}</strong> no soporta Ray Tracing (RTX/RDN2+). No podrás usar OptiX ni RDNA2 para Cycles GPU, lo que reduce drásticamente la velocidad de render.`);
  else if (gpu.s >= 60)
    goods.push(`Tu GPU <strong>${gpu.n}</strong> soporta Ray Tracing y es competente para Cycles GPU con OptiX/HIP. Los renders serán significativamente más rápidos que en CPU.`);
  else
    warns.push(`Tu GPU <strong>${gpu.n}</strong> soporta Ray Tracing pero tiene rendimiento limitado. Funciona, pero escenas complejas o 4K serán lentas.`);

  if (gpu.v > 0 && gpu.v < 4)
    errors.push(`<strong>${gpu.v} GB de VRAM</strong> es insuficiente. Blender agotará la VRAM con texturas básicas y caerá al renderizado por CPU automáticamente.`);
  else if (gpu.v >= 4 && gpu.v < 8)
    warns.push(`Con <strong>${gpu.v} GB de VRAM</strong> podrás trabajar escenas simples a medias texturas. Para proyectos con texturas 4K o escenas complejas necesitarás 8+ GB.`);
  else if (gpu.v >= 8)
    goods.push(`Tus <strong>${gpu.v} GB de VRAM</strong> son suficientes para la mayoría de proyectos con texturas PBR. Escenas muy densas (4K+) pueden pedir más.`);

  // RAM
  if (ram < 8)
    errors.push(`<strong>${ram} GB de RAM</strong> es crítico para Blender. El sistema tendrá que usar la memoria virtual del disco (swap), haciendo Blender casi inutilizable con escenas medianas.`);
  else if (ram < 16)
    errors.push(`Con <strong>${ram} GB de RAM</strong> tendrás problemas. Blender recomienda mínimo 16 GB: con 8 GB sufrirás cuelgues y crashes al trabajar con escenas de tamaño medio.`);
  else if (ram < 32)
    warns.push(`Tus <strong>${ram} GB de RAM</strong> son el mínimo recomendado. Funcionará para proyectos medianos, pero animaciones, simulaciones de fluidos o escenas muy densas pedirán 32 GB.`);
  else
    goods.push(`Tus <strong>${ram} GB de RAM</strong> son más que suficientes para trabajar cómodamente con escenas complejas, simulaciones y múltiples viewports abiertos.`);

  // Storage
  if (storage === 'hdd')
    errors.push(`Usar Blender en un <strong>HDD</strong> ralentiza enormemente la carga de assets, caché de simulaciones y escritura de frames de render. Un SSD SATA económico cambiaría completamente la experiencia.`);
  else if (storage === 'sata')
    warns.push(`Tu <strong>SSD SATA</strong> es buena mejora sobre HDD. Para hacer render farms locales o simulaciones pesadas, un NVMe reduciría los tiempos de escritura y lectura de caché.`);
  else
    goods.push(`Tu <strong>SSD NVMe</strong> garantiza cargas ultrarrápidas de proyectos, assets pesados y caché de simulaciones. Perfecto para Blender.`);

  // Use-case específico
  if (useCase === 'cycles' && gpu.v < 6)
    errors.push(`Para <strong>Cycles fotorrealista</strong> es imprescindible una GPU con mínimo 6 GB de VRAM para no quedarse sin memoria GPU en escenas con texturas.`);
  if (useCase === 'vfx' && ram < 32)
    errors.push(`Las <strong>simulaciones VFX</strong> (fluidos, humo, partículas) son muy intensivas en RAM. Con menos de 32 GB tendrás simulaciones incompletas o crashes.`);
  if (useCase === 'animation' && cpu.s < 55)
    warns.push(`Para <strong>animación</strong> necesitas una CPU potente con muchos núcleos para renderizar frames de forma eficiente. Considera al menos un Ryzen 5 5600X.`);
  if (useCase === 'sculpting' && ram < 16)
    warns.push(`El <strong>sculpting de alta densidad</strong> con Dyntopo puede requerir varios GB de RAM adicionales para el historial de cambios. 16 GB es el mínimo recomendado.`);
  if (useCase === 'eevee' && gpu.s < 20)
    errors.push(`<strong>Eevee</strong> depende completamente de la GPU. Sin GPU dedicada o con una GPU muy débil, no tendrás una vista previa fluida ni podrás renderizar en tiempo real.`);

  // macOS + CUDA
  if (os === 'mac' && gpu.vendor === 'NVIDIA')
    errors.push(`En <strong>macOS</strong> las GPUs NVIDIA no tienen soporte desde macOS 10.14 (Mojave). Blender no podrá usar tu GPU NVIDIA para Cycles GPU. Usa CPU o considera Metal (Apple Silicon).`);
  if (os === 'mac')
    warns.push(`En <strong>macOS</strong>, Blender usa Metal para renderizado GPU (Cycles). Si tienes un Mac con chip Apple Silicon (M1/M2/M3), el rendimiento es muy bueno. En Intel Mac, el soporte es limitado.`);

  return { errors, warns, goods };
}

// ── Upgrades sugeridos ────────────────────────────────
function getUpgrades(cpu, gpu, ram, storage) {
  const ups = [];
  if (ram < 16)
    ups.push({ tag:'RAM 🔴 Urgente', name:'Kit 16 GB DDR4 3200 MHz', reason:`Pasar de ${ram} GB a 16 GB es la mejora más barata y de mayor impacto inmediato en estabilidad.`, q:'16GB DDR4 3200MHz kit precio' });
  else if (ram < 32)
    ups.push({ tag:'RAM 🟡 Recomendado', name:'Kit 32 GB DDR4 3200 MHz', reason:'32 GB permite trabajar con animaciones y simulaciones sin limitaciones de memoria.', q:'32GB DDR4 3200MHz kit precio' });

  if (gpu.v === 0)
    ups.push({ tag:'GPU 🔴 Crítico', name:'NVIDIA RTX 3060 (12 GB)', reason:'Sin GPU dedicada Blender sólo puede usar CPU para renderizar. Una RTX 3060 acelera Cycles hasta 10-20x.', q:'RTX 3060 precio mejor oferta' });
  else if (!gpu.rt)
    ups.push({ tag:'GPU 🔴 Urgente', name:'NVIDIA RTX 3060 / AMD RX 6600 XT', reason:'Sin Ray Tracing no puedes usar Cycles GPU con OptiX/HIP. Cualquier RTX 2060+ mejora drásticamente.', q:'RTX 3060 precio oferta 2024' });
  else if (gpu.s < 42)
    ups.push({ tag:'GPU 🟡 Mejora', name:'NVIDIA RTX 3060 Ti (8 GB)', reason:'Tu GPU actual tiene rendimiento bajo para Cycles. La RTX 3060 Ti ofrece excelente precio/rendimiento.', q:'RTX 3060 Ti precio' });

  if (gpu.v > 0 && gpu.v < 6)
    ups.push({ tag:'VRAM 🔴 Urgente', name:'GPU con 8+ GB VRAM', reason:`Con ${gpu.v} GB de VRAM te quedarás sin memoria en escenas medianas. 8 GB es el mínimo real para Blender.`, q:'GPU 8GB VRAM Blender precio' });

  if (cpu.s < 35)
    ups.push({ tag:'CPU 🔴 Urgente', name:'AMD Ryzen 5 5600X', reason:'Tu CPU actual limita severamente Blender. Un Ryzen 5 5600X (6 núcleos Zen3) ofrece un salto enorme a bajo precio.', q:'Ryzen 5 5600X precio oferta' });
  else if (cpu.s < 55)
    ups.push({ tag:'CPU 🟡 Mejora', name:'AMD Ryzen 7 5700X', reason:'Con más núcleos Zen3 notarás renders Cycles CPU mucho más rápidos y mejor multitarea.', q:'Ryzen 7 5700X precio' });

  if (storage === 'hdd')
    ups.push({ tag:'SSD 🟡 Recomendado', name:'SSD SATA 480 GB (Samsung 870 EVO)', reason:'Pasar de HDD a SSD SATA reduce enormemente los tiempos de carga de proyectos y caché.', q:'SSD SATA 480GB precio oferta' });

  return ups;
}

// ── Links de tiendas ──────────────────────────────────
const amazon = q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
const gshop  = q => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;

// ── Renderizar resultados ─────────────────────────────
function renderResults({ cpu, gpu, ram, storage, useCase, os }) {
  const score = blenderScore(cpu, gpu, ram);
  const tier  = userTier(score);
  const diag  = getDiagnosis(cpu, gpu, ram, storage, useCase, os);
  const ups   = getUpgrades(cpu, gpu, ram, storage);
  const tRef  = TIERS[tier];

  const sc = score >= 68 ? '#22c55e' : score >= 42 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 46; // r=46

  // ── Score card ────────────────────────────────────────
  const scoreCard = `
  <div class="card fade-in">
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <div class="relative flex-shrink-0" style="width:110px;height:110px">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(15,52,96,.6)" stroke-width="9"/>
          <circle id="scoreRing" cx="55" cy="55" r="46" fill="none" stroke="${sc}" stroke-width="9"
            stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 55 55)"/>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span id="scoreNum" class="text-3xl font-black" style="color:${sc}">0</span>
          <span class="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <div class="flex-1 text-center sm:text-left">
        <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Puntuación Blender</p>
        <h3 class="text-xl font-black text-white mb-1">Clasificación: <span style="color:${sc}">${TIERS[tier].label}</span></h3>
        <p class="text-sm text-gray-400 leading-relaxed">Score ponderado: GPU 45% · CPU 30% · RAM 25%.<br/>Basado en workloads reales de Blender Cycles + Eevee.</p>
      </div>
    </div>
  </div>`;

  // ── Diagnóstico ───────────────────────────────────────
  let diagItems = '';
  diag.errors.forEach(m => { diagItems += `<div class="diag-error">🚨 <span>${m}</span></div>`; });
  diag.warns.forEach(m  => { diagItems += `<div class="diag-warn">⚠️ <span>${m}</span></div>`; });
  diag.goods.forEach(m  => { diagItems += `<div class="diag-ok">✅ <span>${m}</span></div>`; });
  const diagCard = `
  <div class="card fade-in">
    <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
      <span>🔍</span> Diagnóstico técnico completo
    </h3>
    <div class="space-y-2.5">${diagItems}</div>
  </div>`;

  // ── Tabla comparativa Tu PC vs Gama Baja vs Gama Media ─
  const ramStr = ram >= 64 ? '64+ GB' : ram + ' GB';
  const stMap  = { hdd:'HDD', sata:'SSD SATA', nvme:'SSD NVMe' };
  const stStr  = stMap[storage] || storage;

  function scoreBar(val, max=100) {
    const pct = Math.min(100, Math.round(val / max * 100));
    const col  = pct >= 68 ? '#22c55e' : pct >= 42 ? '#f59e0b' : '#ef4444';
    return `<div style="height:6px;background:rgba(15,52,96,.4);border-radius:9999px;overflow:hidden;min-width:60px">
      <div style="height:100%;width:${pct}%;background:${col};border-radius:9999px"></div></div>`;
  }

  function ramScore(r) { return r >= 64?100:r>=32?80:r>=16?55:r>=8?30:10; }
  const myRamS = ramScore(ram);
  const loRamS = ramScore(TIERS.low.ram);
  const midRamS= ramScore(TIERS.mid.ram);

  const cmpCard = `
  <div class="card fade-in overflow-x-auto">
    <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
      <span>📊</span> Tu PC vs Setups Recomendados
    </h3>
    <table class="cmp-table">
      <thead>
        <tr>
          <th>Componente</th>
          <th><span class="badge-you">Tu PC</span></th>
          <th><span class="badge-low">${TIERS.low.label}</span></th>
          <th><span class="badge-mid">${TIERS.mid.label}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">CPU</td>
          <td>${cpu.n.replace('AMD ','').replace('Intel ','')}</td>
          <td>${TIERS.low.cpu}</td>
          <td>${TIERS.mid.cpu}</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">CPU Score</td>
          <td>${scoreBar(cpu.s)} ${cpu.s}/100</td>
          <td>${scoreBar(TIERS.low.cpuS)} ${TIERS.low.cpuS}/100</td>
          <td>${scoreBar(TIERS.mid.cpuS)} ${TIERS.mid.cpuS}/100</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">GPU</td>
          <td>${gpu.n.replace('NVIDIA ','').replace('AMD ','')}</td>
          <td>${TIERS.low.gpu}</td>
          <td>${TIERS.mid.gpu}</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">GPU Score</td>
          <td>${scoreBar(gpu.s)} ${gpu.s}/100</td>
          <td>${scoreBar(TIERS.low.gpuS)} ${TIERS.low.gpuS}/100</td>
          <td>${scoreBar(TIERS.mid.gpuS)} ${TIERS.mid.gpuS}/100</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">RAM</td>
          <td>${ramStr}</td><td>${TIERS.low.ram} GB</td><td>${TIERS.mid.ram} GB</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">RAM Score</td>
          <td>${scoreBar(myRamS)} ${myRamS}/100</td>
          <td>${scoreBar(loRamS)} ${loRamS}/100</td>
          <td>${scoreBar(midRamS)} ${midRamS}/100</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">Storage</td>
          <td>${stStr}</td><td>${TIERS.low.storage}</td><td>${TIERS.mid.storage}</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">Cycles</td>
          <td style="color:#f59e0b">~${estimateCycles(cpu.s, gpu.s)}</td>
          <td>${TIERS.low.cycles}</td>
          <td>${TIERS.mid.cycles}</td>
        </tr>
        <tr>
          <td class="text-gray-500 font-bold uppercase tracking-wider" style="font-size:.65rem">Eevee</td>
          <td>${gpu.s >= 40 ? '60 FPS':'Lenta / inestable'}</td>
          <td>${TIERS.low.eevee}</td>
          <td>${TIERS.mid.eevee}</td>
        </tr>
      </tbody>
    </table>
  </div>`;

  // ── Upgrades ──────────────────────────────────────────
  let upHTML = '';
  if (ups.length === 0) {
    upHTML = `<div class="card fade-in" style="border-color:rgba(34,197,94,.3)">
      <h3 class="text-base font-bold text-green-400 mb-2">✅ ¡Buen setup!</h3>
      <p class="text-sm text-gray-400">Tu hardware está bien equilibrado para Blender. No hay upgrades urgentes, aunque siempre puedes aumentar RAM o GPU para escenas más complejas.</p>
    </div>`;
  } else {
    const cards = ups.map(u => `
    <div class="upgrade-card">
      <div class="flex-1 min-w-0">
        <span class="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1.5"
          style="background:rgba(15,52,96,.6);color:#9ca3af;border:1px solid rgba(15,52,96,.8)">${u.tag}</span>
        <p class="font-bold text-white text-sm">${u.name}</p>
        <p class="text-xs text-gray-400 mt-0.5 leading-relaxed">${u.reason}</p>
      </div>
      <div class="flex gap-2 flex-wrap flex-shrink-0">
        <a href="${amazon(u.q)}" target="_blank" rel="noopener" class="btn-shop btn-amazon">🛒 Amazon</a>
        <a href="${gshop(u.q)}"  target="_blank" rel="noopener" class="btn-shop btn-google">🔍 Google</a>
      </div>
    </div>`).join('');
    upHTML = `<div class="card fade-in">
      <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2"><span>🛠️</span> Mejoras recomendadas</h3>
      <p class="text-xs text-gray-500 mb-4">Ordenadas por impacto en rendimiento Blender · Links a tiendas sin afiliados</p>
      <div class="space-y-3">${cards}</div>
    </div>`;
  }

  // ── Montar todo ───────────────────────────────────────
  const res = document.getElementById('results');
  res.innerHTML = scoreCard + diagCard + cmpCard + upHTML;
  res.classList.remove('hidden');
  res.scrollIntoView({ behavior:'smooth', block:'start' });

  // Animar scoreRing
  setTimeout(() => {
    const ring = document.getElementById('scoreRing');
    const numEl = document.getElementById('scoreNum');
    if (!ring) return;
    ring.style.strokeDashoffset = circ - (score / 100 * circ);
    let cur = 0; const step = score / 60;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, score);
      numEl.textContent = Math.round(cur);
      if (cur >= score) clearInterval(iv);
    }, 16);
  }, 200);
}

// ── Estimar tiempo Cycles ─────────────────────────────
function estimateCycles(cs, gs) {
  const total = cs * 0.3 + gs * 0.7;
  if (total >= 80) return '2-5 min / frame 1080p';
  if (total >= 60) return '8-15 min / frame 1080p';
  if (total >= 40) return '30-60 min / frame 1080p';
  return '60+ min / frame 1080p';
}

// ── Toast ─────────────────────────────────────────────
let _tt = null;
function showToast(msg, type='info') {
  const old = document.getElementById('_toast');
  if (old) old.remove();
  if (_tt) clearTimeout(_tt);
  const c = { warn:'border-yellow-500/50 bg-yellow-500/10 text-yellow-300', error:'border-red-500/50 bg-red-500/10 text-red-300', ok:'border-green-500/50 bg-green-500/10 text-green-300', info:'border-brand-border/50 bg-brand-card/80 text-gray-300' };
  const t = document.createElement('div');
  t.id = '_toast';
  t.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:999;display:flex;align-items:center;gap:.75rem;padding:.75rem 1.25rem;border-radius:.75rem;font-size:.82rem;font-weight:600;backdrop-filter:blur(12px);animation:fadeIn .3s ease';
  t.className = `border ${c[type]||c.info}`;
  t.textContent = msg;
  document.body.appendChild(t);
  _tt = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(6px)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),300); }, 3500);
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { populateSelects(); });
