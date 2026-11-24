// Revisor de superposiciones. Mide el diagrama ya dibujado (en el navegador) y encuentra:
//  · textos que se montan entre sí
//  · líneas o marcadores que pasan por encima de un texto
//  · líneas que se cruzan o se tocan sin querer (las uniones en extremos sí valen)
//  · textos fuera de la página o sobre la costura del pliego
// Los trazos marcados con data-cruza="si" (Venn, cruces intencionales) se excluyen del cruce entre líneas.

function revisar(svg) {
  const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
  const fuera = el => el.closest('#guias, #revision');
  const problemas = [];
  const add = (tipo, caja, desc) => problemas.push({ tipo, caja, desc });
  // desplazamiento del centrado vertical (getBBox y getPointAtLength miden sin la transformación)
  const gC = svg.querySelector('#contenido');
  const DY = gC && gC.transform.baseVal.numberOfItems ? gC.transform.baseVal.consolidate().matrix.f : 0;

  // ── Textos ──
  const textos = [...svg.querySelectorAll('text')].filter(t => !fuera(t) && t.textContent.trim()).map(t => {
    const b = t.getBBox();
    // caja de la tinta: desde la altura de las mayúsculas/acentos hasta los descendentes, medida desde la línea base
    const base = +t.getAttribute('y'), tam = +t.getAttribute('font-size') || 10;
    return { el: t, x: b.x + 0.3, y: base + DY - tam * 0.78, w: b.width - 0.6, h: tam * 1.0, txt: t.textContent };
  });
  const cruzanCaja = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;
  for (let i = 0; i < textos.length; i++) for (let j = i + 1; j < textos.length; j++) {
    const a = textos[i], b = textos[j];
    // tramos de una misma línea (negrita + normal) van pegados a propósito
    const mismaLinea = Math.abs(a.y - b.y) < 0.5 && (Math.abs(a.x + a.w - b.x) < 6 || Math.abs(b.x + b.w - a.x) < 6);
    if (!mismaLinea && cruzanCaja(a, b, 1.5)) add('texto-texto', union(a, b), `"${corto(a.txt)}" choca con "${corto(b.txt)}"`);
  }
  textos.forEach(t => {
    if (t.x < 8 || t.y < 8 || t.x + t.w > W - 8 || t.y + t.h > H - 8) add('borde', t, `"${corto(t.txt)}" se sale de la página`);
    if (W > 800 && t.x < 792 - 4 && t.x + t.w > 792 + 4) add('pliegue', t, `"${corto(t.txt)}" cae sobre la costura del pliego`);
  });

  // ── Trazos: muestrear puntos de cada línea, camino, círculo o caja ──
  const trazos = [];
  const marcadores = [];
  [...svg.querySelectorAll('line, path, circle, rect, polyline')].forEach(el => {
    if (fuera(el)) return;
    const relleno = el.getAttribute('fill'), stroke = el.getAttribute('stroke');
    const esMarcador = (el.tagName === 'circle' && (+el.getAttribute('r') <= 8 || (relleno && relleno !== 'none' && (!stroke || stroke === 'none')))) ||                    // puntos y círculos-marca
      (el.tagName === 'path' && relleno && relleno !== 'none' && (!stroke || stroke === 'none')) ||   // flechas
      (el.getAttribute('stroke-linecap') === 'round');                                                // asteriscos
    if (esMarcador) { const b = el.getBBox(); marcadores.push({ el, x: b.x, y: b.y + DY, w: b.width, h: b.height }); return; }
    if (!stroke || stroke === 'none') return;
    let L = 0;
    try { L = el.getTotalLength(); } catch (e) { return; }
    const pts = [];
    const paso = 1.2;
    for (let s = 0; s <= L; s += paso) { const p = el.getPointAtLength(s); pts.push([p.x, p.y + DY]); }
    const pf = el.getPointAtLength(L); pts.push([pf.x, pf.y + DY]);
    const grosor = +(el.getAttribute('stroke-width') || 1);
    const cerrado = el.tagName === 'circle' || el.tagName === 'rect' || /z\s*$/i.test(el.getAttribute('d') || '');
    trazos.push({ el, pts, grosor, cerrado, extremos: cerrado ? [] : [pts[0], pts[pts.length - 1]], cruza: el.getAttribute('data-cruza') === 'si' });
  });

  // línea sobre texto
  textos.forEach(t => {
    const m = 1.2;
    for (const tr of trazos) {
      const g = tr.grosor / 2 + m;
      const hit = tr.pts.find(([x, y]) => x > t.x - g && x < t.x + t.w + g && y > t.y - g && y < t.y + t.h + g);
      if (hit) { add('linea-texto', t, `una línea pasa sobre "${corto(t.txt)}"`); break; }
    }
    for (const mk of marcadores) if (cruzanCaja(t, mk, 1)) { add('marca-texto', union(t, mk), `un punto o flecha toca "${corto(t.txt)}"`); break; }
  });

  // línea con línea: puntos de trazos distintos a menos de 1 pt, lejos de los extremos de ambos
  const celda = 3, grilla = new Map();
  trazos.forEach((tr, k) => tr.pts.forEach(p => {
    const key = Math.floor(p[0] / celda) + ',' + Math.floor(p[1] / celda);
    if (!grilla.has(key)) grilla.set(key, []);
    grilla.get(key).push([p, k]);
  }));
  const cercaDeExtremo = (p, tr, r = 7) => tr.extremos.some(e => Math.hypot(e[0] - p[0], e[1] - p[1]) < r);
  const vistos = new Set();
  for (const [key, lista] of grilla) {
    const [cx, cy] = key.split(',').map(Number);
    const vecinos = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const v = grilla.get((cx + dx) + ',' + (cy + dy)); if (v) vecinos.push(...v); }
    for (const [p, k] of lista) for (const [q, k2] of vecinos) {
      if (k2 <= k) continue;
      const A = trazos[k], B = trazos[k2];
      if (A.cruza && B.cruza) continue;
      const lim = (A.grosor + B.grosor) / 2 + 0.6;
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) > lim) continue;
      if (cercaDeExtremo(p, A) || cercaDeExtremo(p, B) || cercaDeExtremo(q, A) || cercaDeExtremo(q, B)) continue;
      const id = k + '-' + k2 + '-' + Math.round(p[0] / 12) + '-' + Math.round(p[1] / 12);
      if (vistos.has(id)) continue; vistos.add(id);
      add('linea-linea', { x: p[0] - 5, y: p[1] - 5, w: 10, h: 10 }, 'dos líneas se cruzan o se montan');
    }
  }
  // marcador sobre una línea que no le pertenece (p. ej. un punto que cae en otra línea)
  return compactar(problemas);
}
function union(a, b) { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; }
function corto(s) { s = s.trim(); return s.length > 28 ? s.slice(0, 26) + '…' : s; }
// junta problemas repetidos sobre la misma zona
function compactar(ps) {
  const out = [];
  ps.forEach(p => {
    if (!out.some(o => o.tipo === p.tipo && Math.abs(o.caja.x - p.caja.x) < 8 && Math.abs(o.caja.y - p.caja.y) < 8)) out.push(p);
  });
  return out;
}
// Dibuja los problemas en rojo encima del diagrama (no se exporta).
function marcarProblemas(svg, ps) {
  const NS = 'http://www.w3.org/2000/svg';
  let g = svg.querySelector('#revision');
  if (g) g.remove();
  g = document.createElementNS(NS, 'g'); g.setAttribute('id', 'revision'); g.setAttribute('pointer-events', 'none');
  ps.forEach(p => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', p.caja.x - 3); r.setAttribute('y', p.caja.y - 3);
    r.setAttribute('width', p.caja.w + 6); r.setAttribute('height', p.caja.h + 6);
    r.setAttribute('fill', 'rgba(255,64,64,.12)'); r.setAttribute('stroke', '#FF4040'); r.setAttribute('stroke-width', '1.2');
    const t = document.createElementNS(NS, 'title'); t.textContent = p.desc; r.appendChild(t);
    g.appendChild(r);
  });
  svg.appendChild(g);
}
