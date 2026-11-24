// Interfaz: dashboard de todos los diagramas + editor con revisor de superposiciones.
const $ = s => document.querySelector(s);
const guardar = (k, v) => { try { localStorage.setItem('aulamaker:' + k, v); } catch (e) {} };
const recuperar = k => { try { return localStorage.getItem('aulamaker:' + k); } catch (e) { return null; } };
const borrar = k => { try { localStorage.removeItem('aulamaker:' + k); } catch (e) {} };

const textoDe = dg => recuperar('dg:' + dg.id) ?? dg.texto;
const plantillaDe = dg => recuperar('pl:' + dg.id) || dg.plantilla;
const limpiarExport = svg => svg.replace(/ data-cruza="si"/g, '');

// Estilo: lineamientos de Milla + ajustes para todos + ajustes propios del diagrama.
const leerJSON = k => { try { return JSON.parse(recuperar(k) || '{}'); } catch (e) { return {}; } };
const estiloGeneral = () => leerJSON('est:global');
const estiloPropio = dg => leerJSON('est:' + dg.id);
const tieneEstiloPropio = dg => Object.keys(estiloPropio(dg)).length > 0;
const estiloDe = dg => estiloFinal(estiloGeneral(), estiloPropio(dg));
// Dibuja un diagrama con su estilo aplicado (siempre antes de medir y ubicar).
function armarDg(dg, src, opts = {}) {
  const e = estiloDe(dg);
  aplicarEstilo(e);
  return armar(plantillaDe(dg), src, { ...opts, acento: e.acento });
}

const estados = {};          // id → { problemas: [...] }
let filtro = recuperar('filtro') || 'Todos';
let actual = null;

/* ───────── Dashboard ───────── */
function dashboard() {
  $('#dash').classList.remove('oculto'); $('#editor').classList.add('oculto');
  $('#botonesDash').classList.remove('oculto'); $('#botonesEditor').classList.add('oculto');
  const caps = [...new Set(DIAGRAMAS.map(d => d.cap))];
  // filtros
  const opciones = ['Todos', 'Con superposiciones', 'Para revisar contenido', 'Pendientes', ...caps];
  $('#filtros').innerHTML = opciones.map(o => `<span class="chip${o === filtro ? ' on' : ''}" data-f="${o}">${o}</span>`).join('');
  $('#filtros').onclick = e => { const f = e.target.dataset.f; if (!f) return; filtro = f; guardar('filtro', f); dashboard(); };

  const pasa = dg => filtro === 'Todos' || filtro === dg.cap ||
    (filtro === 'Pendientes' && dg.pendiente) ||
    (filtro === 'Para revisar contenido' && dg.revisar) ||
    (filtro === 'Con superposiciones' && estados[dg.id] && estados[dg.id].problemas.length);
  let html = '';
  caps.forEach(cap => {
    const ds = DIAGRAMAS.filter(d => d.cap === cap && pasa(d));
    if (!ds.length) return;
    html += `<section class="capitulo"><h2>${cap} <small>${ds.length} diagrama${ds.length > 1 ? 's' : ''}</small></h2><div class="grilla">`;
    ds.forEach(dg => {
      const pl = PLANTILLAS[plantillaDe(dg)];
      html += `<article class="card" data-id="${dg.id}">
        <div class="mini${dg.pendiente ? ' pendiente' : ''}" id="mini-${dg.id}">${dg.pendiente ? dg.pendiente : ''}</div>
        <div class="meta"><b>${dg.titulo}</b>
          <div class="sub">p. ${dg.pag}${pl ? ' · ' + pl.nombre : ''}</div>
          <div class="badges" id="badges-${dg.id}">${badges(dg)}</div></div></article>`;
    });
    html += `</div></section>`;
  });
  $('#capitulos').innerHTML = html || '<p class="capitulo nota">Nada que mostrar con este filtro.</p>';
  $('#capitulos').onclick = e => { const c = e.target.closest('.card'); if (c) abrir(c.dataset.id); };
  pintarMiniaturas();
  resumen();
}
function badges(dg) {
  const b = [];
  if (dg.pendiente) b.push('<span class="badge pend">Pendiente</span>');
  else if (estados[dg.id]) {
    const n = estados[dg.id].problemas.length;
    b.push(n ? `<span class="badge mal">${n} superposición${n > 1 ? 'es' : ''}</span>` : '<span class="badge ok">Sin superposiciones</span>');
  }
  if (dg.revisar) b.push('<span class="badge rev">Revisar contenido</span>');
  if (!dg.pendiente && tieneEstiloPropio(dg)) b.push('<span class="badge est">Estilo propio</span>');
  if (dg.prioridad === 'alta') b.push('<span class="badge alta">Prioridad alta</span>');
  else if (dg.prioridad === 'existe') b.push('<span class="badge">Ya está en la memoria</span>');
  else if (dg.prioridad) b.push(`<span class="badge">Prioridad ${dg.prioridad}</span>`);
  return b.join('');
}
function resumen() {
  const hechos = DIAGRAMAS.filter(d => !d.pendiente);
  const rev = hechos.filter(d => estados[d.id]);
  const limpios = rev.filter(d => !estados[d.id].problemas.length).length;
  const conProb = rev.length - limpios;
  const k = (n, t, c = '') => `<div class="kpi ${c}"><div class="n">${n}</div><div class="t">${t}</div></div>`;
  $('#resumen').innerHTML =
    k(hechos.length, 'diagramas generados') +
    k(limpios, rev.length < hechos.length ? `sin superposiciones (de ${rev.length} a la vista)` : 'sin superposiciones', 'ok') +
    k(conProb, 'con superposiciones', conProb ? 'mal' : 'ok') +
    k(DIAGRAMAS.filter(d => d.revisar).length, 'para que Milla revise el contenido') +
    k(DIAGRAMAS.filter(d => d.pendiente).length, 'pendientes por falta de datos', 'pend') +
    k(new Set(DIAGRAMAS.map(d => d.cap)).size, 'capítulos cubiertos') +
    (() => { const n = Object.keys(diferencias(estiloFinal(estiloGeneral()))).length;
      return k(n ? n : '✓', n ? `ajuste${n > 1 ? 's' : ''} de estilo para todos` : 'lineamientos de Milla', n ? '' : 'ok'); })();
}
// Dibuja las miniaturas de a una para no bloquear la página, y revisa cada una.
function pintarMiniaturas() {
  const cola = DIAGRAMAS.filter(d => !d.pendiente && document.getElementById('mini-' + d.id));
  const sig = () => {
    const dg = cola.shift(); if (!dg) { resumen(); return; }
    const caja = document.getElementById('mini-' + dg.id);
    try {
      caja.innerHTML = armarDg(dg, textoDe(dg)).svg;
      const svg = caja.querySelector('svg');
      estados[dg.id] = { problemas: revisar(svg) };
      if (estados[dg.id].problemas.length) marcarProblemas(svg, estados[dg.id].problemas);
    } catch (e) { caja.textContent = 'Error: ' + e.message; estados[dg.id] = { problemas: [{ desc: e.message, caja: { x: 0, y: 0, w: 0, h: 0 } }] }; }
    const bd = document.getElementById('badges-' + dg.id); if (bd) bd.innerHTML = badges(dg);
    setTimeout(sig, 0);
  };
  sig();
}

/* ───────── Editor ───────── */
function abrir(id) {
  const dg = DIAGRAMAS.find(d => d.id === id);
  if (!dg || dg.pendiente) { aviso(dg ? dg.pendiente : ''); return; }
  actual = dg; guardar('ultimo', id); location.hash = id;
  $('#dash').classList.add('oculto'); $('#editor').classList.remove('oculto');
  $('#botonesDash').classList.add('oculto'); $('#botonesEditor').classList.remove('oculto');
  $('#edTitulo').textContent = dg.titulo;
  $('#edSub').textContent = `${dg.cap} · p. ${dg.pag}${dg.revisar ? ' · revisar contenido con Milla' : ''}`;
  $('#plantilla').value = plantillaDe(dg);
  $('#texto').value = textoDe(dg);
  $('#ayuda').textContent = PLANTILLAS[plantillaDe(dg)].ayuda;
  panelEstilo();
  dibujar();
  window.scrollTo(0, 0);
}
function dibujar() {
  try {
    $('#vista').innerHTML = armarDg(actual, $('#texto').value, { guias: true }).svg;
    const svg = $('#vista svg');
    const ps = revisar(svg);
    estados[actual.id] = { problemas: ps };
    marcarProblemas(svg, ps);
    const e = $('#estado');
    if (!ps.length) { e.className = 'estado ok'; e.textContent = '✓ Sin superposiciones: ningún texto, línea o marca se monta.'; }
    else { e.className = 'estado mal'; e.innerHTML = `<b>${ps.length} superposición${ps.length > 1 ? 'es' : ''}</b> (marcadas en rojo)<ul>${ps.map(p => `<li>${p.desc}</li>`).join('')}</ul>`; }
  } catch (err) { $('#estado').className = 'estado mal'; $('#estado').textContent = 'No pude dibujarlo: ' + err.message; }
}
function descargar(nombre, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const xml = svg => '<?xml version="1.0" encoding="UTF-8"?>\n' + limpiarExport(svg);
function exportarSVG() { const r = armarDg(actual, $('#texto').value); descargar(r.nombre + '.svg', new Blob([xml(r.svg)], { type: 'image/svg+xml' })); }
async function copiarSVG() {
  const r = armarDg(actual, $('#texto').value);
  try { await navigator.clipboard.writeText(limpiarExport(r.svg)); aviso('SVG copiado. Pégalo en Illustrator.'); } catch (e) { aviso('No pude copiar; usa Descargar SVG.'); }
}
function exportarPNG() {
  const { nombre, svg, W, H } = armarDg(actual, $('#texto').value, { fuentes: true });
  const esc = 300 / 72, img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = Math.round(W * esc); c.height = Math.round(H * esc);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => descargar(nombre + '.png', b), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(limpiarExport(svg));
}
function descargarTodos() {
  const ds = DIAGRAMAS.filter(d => !d.pendiente);
  ds.forEach((dg, i) => setTimeout(() => {
    const r = armarDg(dg, textoDe(dg));
    descargar(r.nombre + '.svg', new Blob([xml(r.svg)], { type: 'image/svg+xml' }));
  }, i * 350));
  aviso(`Descargando ${ds.length} SVG…`);
}
/* ───────── Panel de estilo ───────── */
let alcance = recuperar('alcance') || 'diagrama';   // diagrama | todos
const ETIQUETAS = {
  acento: v => `Color principal: ${v ? NOMBRES_COLOR[v] : 'según el texto'}`,
  modo: v => v === 'monocromo' ? 'Acentos en solo tinta' : 'Acentos en color',
  tinta: v => `Tinta ${v}`, gris: v => `Gris ${v}`,
  linea: v => `Línea ${String(v).replace('.', ',')} pt (Milla: 0,75)`,
  punteada: v => `Punteado ${(OPCIONES.punteada.find(o => o[0] === v) || [, v])[1].toLowerCase()}`,
  punto: v => `Punto de ${String(v).replace('.', ',')} pt de radio (Milla: 2,3)`,
  asterisco: v => `Asterisco de ${String(v).replace('.', ',')} pt (Milla: 2,9)`,
  texto: v => `Texto al ${Math.round(v * 100)} %`,
  interlineado: v => `Interlineado al ${Math.round(v * 100)} %`,
  pesoTitulo: v => `Títulos en ${(OPCIONES.pesoTitulo.find(o => o[0] === v) || [, v])[1]}`,
};
const seg = (k, ops, val, fmt = t => t, cls = '') => `<div class="seg ${cls}">${ops.map(([v, t]) => `<span data-k="${k}" data-v="${v}" class="${String(v) === String(val) ? 'on' : ''}">${fmt(t, v)}</span>`).join('')}</div>`;
const rango = (k, txt, min, max, paso, val, fmt) => `<div class="rango"><label>${txt}<input type="range" data-k="${k}" min="${min}" max="${max}" step="${paso}" value="${val}"></label><output>${fmt(val)}</output></div>`;
const coma = n => String(Math.round(n * 100) / 100).replace('.', ',');

function panelEstilo() {
  const e = estiloDe(actual);
  const difs = diferencias(e);
  const listaDifs = Object.entries(difs).flatMap(([k, v]) => k === 'paleta'
    ? Object.entries(v).map(([c, h]) => `${NOMBRES_COLOR[c]} ajustado a ${h}`) : [ETIQUETAS[k](v)]);
  $('#panelEstilo').innerHTML = `
    <h3>Estilo gráfico</h3>
    <div class="grupoE"><h4>Aplicar cambios a</h4>
      <div class="seg" id="alcance"><span data-a="diagrama" class="${alcance === 'diagrama' ? 'on' : ''}">Este diagrama</span><span data-a="todos" class="${alcance === 'todos' ? 'on' : ''}">Todos</span></div>
      <p class="nota">${alcance === 'todos' ? 'Cambia el estilo de todos los diagramas (los que tienen estilo propio lo conservan).' : 'Solo cambia este diagrama.'}</p></div>

    <div class="grupoE"><h4>Color principal</h4>
      <div class="muestras">
        <span class="muestra auto${!e.acento ? ' on' : ''}" data-k="acento" data-v="" title="Según el texto (línea color …)"></span>
        ${Object.keys(PAL).map(c => `<span class="muestra${e.acento === c ? ' on' : ''}" data-k="acento" data-v="${c}" title="${NOMBRES_COLOR[c]}" style="background:${e.modo === 'monocromo' ? e.tinta : e.paleta[c]}"></span>`).join('')}
      </div>
      <p class="nota">El color va en textos y marcas, nunca en rellenos. El amarillo se lee poco en textos chicos.</p></div>

    <div class="grupoE"><h4>Acentos</h4>${seg('modo', OPCIONES.modo, e.modo)}</div>

    <div class="grupoE"><h4>Paleta</h4>
      ${Object.keys(PAL).map(c => `<div class="fila"><input type="color" data-k="paleta.${c}" value="${e.paleta[c]}"><span>${NOMBRES_COLOR[c]}</span><code>${e.paleta[c].toUpperCase()}</code></div>`).join('')}
      <div class="fila"><input type="color" data-k="tinta" value="${e.tinta}"><span>Tinta (líneas y texto)</span><code>${e.tinta.toUpperCase()}</code></div>
      <div class="fila"><input type="color" data-k="gris" value="${e.gris}"><span>Gris (notas)</span><code>${e.gris.toUpperCase()}</code></div></div>

    <div class="grupoE"><h4>Líneas</h4>
      <span class="nota">Grosor (pt)</span>${seg('linea', OPCIONES.linea, e.linea)}
      <span class="nota">Punteado</span>${seg('punteada', OPCIONES.punteada, e.punteada, (t, v) => `<svg width="30" height="4"><line x1="0" y1="2" x2="30" y2="2" stroke="#1E1E1E" stroke-width="1.2" stroke-dasharray="${v}"/></svg>${t}`, 'punt')}
      ${rango('punto', 'Radio del punto', 1.6, 3.2, 0.1, e.punto, coma)}
      ${rango('asterisco', 'Grosor del asterisco', 2, 3.6, 0.1, e.asterisco, coma)}</div>

    <div class="grupoE"><h4>Texto</h4>
      ${rango('texto', 'Tamaño', 0.9, 1.15, 0.05, e.texto, v => Math.round(v * 100) + '%')}
      ${rango('interlineado', 'Interlineado', 1, 1.25, 0.05, e.interlineado, v => Math.round(v * 100) + '%')}
      <span class="nota">Peso de los títulos</span>${seg('pesoTitulo', OPCIONES.pesoTitulo, e.pesoTitulo)}
      <p class="nota">Al cambiar tamaños, las plantillas vuelven a medir y ubicar todo; si algo se monta, el revisor lo marca.</p></div>

    <div class="cambios${listaDifs.length ? '' : ' milla'}">${listaDifs.length
      ? `<b>${listaDifs.length} cambio${listaDifs.length > 1 ? 's' : ''} respecto de la memoria</b><ul>${listaDifs.map(t => `<li>${t}</li>`).join('')}</ul>`
      : '✓ Usa los lineamientos de la memoria de Milla.'}</div>
    <button id="restEstilo">${alcance === 'todos' ? 'Volver todos a los lineamientos de Milla' : 'Quitar el estilo propio de este diagrama'}</button>`;
}
function cambiarEstilo(k, v) {
  const clave = alcance === 'todos' ? 'est:global' : 'est:' + actual.id;
  const capa = leerJSON(clave);
  if (k.startsWith('paleta.')) { capa.paleta = { ...(capa.paleta || {}), [k.slice(7)]: v }; }
  else capa[k] = v;
  if (alcance === 'todos') {      // que el cambio general se vea también en este diagrama
    const propio = estiloPropio(actual);
    if (k.startsWith('paleta.') && propio.paleta) delete propio.paleta[k.slice(7)]; else delete propio[k];
    guardar('est:' + actual.id, JSON.stringify(propio));
  }
  guardar(clave, JSON.stringify(capa));
}
function iniciarPanel() {
  const p = $('#panelEstilo');
  let espera;
  const redibujar = (repanel = true) => { clearTimeout(espera); espera = setTimeout(() => { if (repanel) panelEstilo(); dibujar(); }, 90); };
  p.addEventListener('click', ev => {
    const a = ev.target.closest('[data-a]');
    if (a) { alcance = a.dataset.a; guardar('alcance', alcance); panelEstilo(); return; }
    const o = ev.target.closest('[data-k][data-v]');
    if (o) { const v = o.dataset.v, n = +v; cambiarEstilo(o.dataset.k, v !== '' && !isNaN(n) && o.dataset.k !== 'punteada' ? n : v); redibujar(); return; }
    if (ev.target.id === 'restEstilo') {
      if (alcance === 'todos') {
        if (!confirm('¿Volver todos los diagramas a los lineamientos de Milla? Se borran también los estilos propios.')) return;
        borrar('est:global'); DIAGRAMAS.forEach(d => borrar('est:' + d.id));
      } else borrar('est:' + actual.id);
      redibujar();
    }
  });
  p.addEventListener('input', ev => {
    const el = ev.target; if (!el.dataset.k) return;
    const v = el.type === 'range' ? +el.value : el.value;
    if (el.type === 'range') el.closest('.rango').querySelector('output').textContent = el.dataset.k === 'texto' || el.dataset.k === 'interlineado' ? Math.round(v * 100) + '%' : coma(v);
    if (el.type === 'color') el.closest('.fila').querySelector('code').textContent = v.toUpperCase();
    cambiarEstilo(el.dataset.k, v);
    redibujar(false);
  });
  p.addEventListener('change', () => redibujar());   // al soltar: refresca la lista de cambios
}

function aviso(t) { $('#aviso').textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(() => { $('#aviso').textContent = ''; }, 4000); }

async function iniciar() {
  await cargarFuentes();
  const sel = $('#plantilla');
  for (const [id, p] of Object.entries(PLANTILLAS)) sel.add(new Option(p.nombre, id));
  sel.onchange = () => { guardar('pl:' + actual.id, sel.value); $('#ayuda').textContent = PLANTILLAS[sel.value].ayuda; dibujar(); };
  let espera;
  $('#texto').oninput = () => { guardar('dg:' + actual.id, $('#texto').value); clearTimeout(espera); espera = setTimeout(dibujar, 120); };
  $('#restaurar').onclick = () => { borrar('dg:' + actual.id); borrar('pl:' + actual.id); abrir(actual.id); };
  $('#svg').onclick = exportarSVG; $('#copiar').onclick = copiarSVG; $('#png').onclick = exportarPNG;
  $('#todos').onclick = descargarTodos;
  iniciarPanel();
  $('#volver').onclick = $('#inicio').onclick = () => { location.hash = ''; dashboard(); };
  window.onhashchange = () => { const id = location.hash.slice(1); if (!id) dashboard(); else if (!actual || actual.id !== id) abrir(id); };
  const id = location.hash.slice(1);
  if (id && DIAGRAMAS.some(d => d.id === id)) abrir(id); else dashboard();
}
iniciar();
