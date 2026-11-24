// estudio de diagramas · Aula Maker
// Convierte texto simple en diagramas SVG con el lenguaje gráfico de la memoria de Milla.
// Unidades: puntos (1 unidad SVG = 1 pt al abrir en Illustrator / InDesign).

/* ───────────── Lenguaje gráfico ───────────── */
const PAL = { rosado: '#FF639B', azul: '#2E90CF', rojo: '#FF4040', verde: '#3CBF96', amarillo: '#FFDF51' };
let TINTA = '#1E1E1E';
let GRIS = '#6F6F6E';
const F = { reg: 'NeutrifStudio-Regular', med: 'NeutrifStudio-Medium', semi: 'NeutrifStudio-SemiBold', bold: 'NeutrifStudio-Bold', mono: 'RobotoMono-Regular' };
let LINEA = 0.75;            // grosor de toda línea
let PUNTEADA = '3 2.5';   // patrón de la línea punteada
let PUNTO = 2.3;             // radio del punto negro
let AST = 2.9;              // grosor del asterisco
let ESC_T = 1, ESC_L = 1;   // escala de texto e interlineado (panel de estilo)
const tamT = n => Math.round(n * ESC_T * 100) / 100, lhT = n => Math.round(n * ESC_T * ESC_L * 100) / 100;
const PAG = { w: 792, h: 612 };  // carta apaisada

const T = {                  // estilos de texto
  titulo:   { fam: F.semi, size: 11.5, lh: 14, fill: TINTA },
  etiqueta: { fam: F.reg,  size: 10.5, lh: 13.5, fill: TINTA },
  cita:     { fam: F.reg,  size: 10.5, lh: 13.5 },
  meta:     { fam: F.reg,  size: 9.5,  lh: 12, fill: TINTA },
  nombre:   { fam: F.med,  size: 13,   lh: 15.5 },
  chico:    { fam: F.reg,  size: 9,    lh: 11.5, fill: GRIS },
};

/* ───────────── Medición y texto ───────────── */
// Las cursivas no están en este computador: se previsualizan inclinando la recta; el SVG pide la cursiva real.
const ALIAS = { 'NeutrifStudio-MediumItalic': 'NeutrifStudio-Medium', 'NeutrifStudio-RegularItalic': 'NeutrifStudio-Regular' };
const fuentesTodas = () => ({ ...window.FUENTES, ...Object.fromEntries(Object.entries(ALIAS).filter(([k]) => !window.FUENTES[k]).map(([k, v]) => [k, window.FUENTES[v]])) });
const lienzo = document.createElement('canvas').getContext('2d');
function ancho(txt, fam, size) { lienzo.font = `${/Italic/.test(fam) ? 'italic ' : ''}${size}px "${fam}"`; return lienzo.measureText(txt).width; }

// Corta en líneas según el ancho. "//" fuerza un salto.
function cortar(txt, est, max) {
  const out = [];
  for (const parte of String(txt).split('//')) {
    let linea = '';
    for (const p of parte.trim().split(/\s+/)) {
      const prueba = linea ? linea + ' ' + p : p;
      if (linea && ancho(prueba, est.fam, est.size) > max) { out.push(linea); linea = p; }
      else linea = prueba;
    }
    if (linea) out.push(linea);
  }
  return out;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r2 = n => Math.round(n * 100) / 100;

// Texto con alineación resuelta a mano (text-anchor="start") para que Illustrator lo importe igual.
function texto(lineas, x, y, est, alin = 'start', fill) {
  const color = fill || est.fill || TINTA;
  return lineas.map((l, i) => {
    const w = ancho(l, est.fam, est.size);
    const x0 = alin === 'middle' ? x - w / 2 : alin === 'end' ? x - w : x;
    return `<text x="${r2(x0)}" y="${r2(y + i * est.lh)}" font-family="${est.fam}" font-size="${est.size}"${est.italic ? ' font-style="italic"' : ''} fill="${color}">${esc(l)}</text>`;
  }).join('');
}

/* ───────────── Primitivas ───────────── */
const linea = (x1, y1, x2, y2, punteada) =>
  `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"${punteada ? ` stroke-dasharray="${PUNTEADA}"` : ''}/>`;
const camino = (d, punteada) =>
  `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"${punteada ? ` stroke-dasharray="${PUNTEADA}"` : ''}/>`;
const punto = (x, y, r = PUNTO, fill = TINTA) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${fill}"/>`;
const circulo = (x, y, r) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>`;
const flecha = (x, y, ang) => {          // punta de flecha como trazo cerrado (Illustrator no lee markers)
  const L = 6, A = 0.42, p = a => `${r2(x - L * Math.cos(a))},${r2(y - L * Math.sin(a))}`;
  return `<path d="M${r2(x)},${r2(y)} L${p(ang - A)} L${p(ang + A)} Z" fill="${TINTA}"/>`;
};
// Asterisco de Milla: tres trazos gruesos de punta redonda.
function asterisco(x, y, color, R = 5.4) {
  let d = '';
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 2 + k * Math.PI / 3, dx = R * Math.cos(a), dy = R * Math.sin(a);
    d += `M${r2(x - dx)},${r2(y - dy)} L${r2(x + dx)},${r2(y + dy)} `;
  }
  return `<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="${AST}" stroke-linecap="round"/>`;
}
const caja = (x, y, w, h, r = 22) =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r}" ry="${r}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}" stroke-dasharray="${PUNTEADA}"/>`;
const grupo = (id, contenido) => `<g id="${esc(id)}">${contenido}</g>`;

/* ───────────── Lector del texto ───────────── */
// Cada línea: palabra clave + argumentos separados por "|". Sangría = hijo del elemento anterior.
function leer(src) {
  const props = {}, items = [];
  for (const cruda of src.split('\n')) {
    if (!cruda.trim() || cruda.trim().startsWith('#')) continue;
    const hijo = /^\s/.test(cruda);
    let l = cruda.trim(), k;
    if (l[0] === '*' || l[0] === '-') { k = l[0]; l = l.slice(1).trim(); }
    else { const m = l.match(/^(\S+)\s*(.*)$/); k = m[1].toLowerCase(); l = m[2]; }
    const args = l.split('|').map(s => s.trim());
    if (hijo && items.length) items[items.length - 1].hijos.push({ k, args });
    else if (['color', 'formato', 'nombre', 'prefijo', 'eje', 'estilo', 'unidad', 'columnas', 'titulo', 'escala'].includes(k)) props[k] = args[0];
    else items.push({ k, args, hijos: [] });
  }
  return { props, items };
}
const colorDe = (nombre, porDefecto) => PAL[(nombre || '').toLowerCase()] || porDefecto;

// Aleja un punto del centro del pliego (la costura) si cae encima.
const lejosDelPliegue = (x, W, m = 36) => (W > PAG.w && Math.abs(x - PAG.w) < m ? (x < PAG.w ? PAG.w - m : PAG.w + m) : x);
function repartir(k, a, b) { return Array.from({ length: k }, (_, i) => a + (i + 0.5) * (b - a) / k); }

/* ───────────── Plantilla: eje de conceptos ─────────────
   Círculos sobre un eje horizontal, con ramas, citas y arcos punteados (como el cierre de Territorio). */
function ejeConceptos(d) {
  const doble = d.props.formato !== 'simple';
  const W = doble ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.rojo);
  const Y = +d.props.eje || 262;
  const nodos = d.items.filter(i => i.k === 'nodo');
  const n = nodos.length;
  const xs = doble
    ? [...repartir(Math.ceil(n / 2), 70, PAG.w - 40), ...repartir(n - Math.ceil(n / 2), PAG.w + 40, W - 70)]
    : repartir(n, 60, W - 60);

  let svg = '', fondo = Y;
  const geo = nodos.map((nd, i) => {
    const tam = (nd.args[1] || '').toLowerCase();
    let r = tam === 'grande' ? 74 : tam === 'chico' ? 44 : 54;
    const lineas = cortar(nd.args[0], T.titulo, r * 1.5);
    const dentro = nd.hijos.filter(h => h.k === 'dentro').flatMap(h => cortar(h.args[0], T.meta, r * 1.5));
    const alto = lineas.length * T.titulo.lh + (dentro.length ? 4 + dentro.length * T.meta.lh : 0);
    r = Math.max(r, alto / 2 + 16);
    return { nd, x: xs[i], r, lineas, dentro, alto };
  });

  // Eje: tramos entre círculos
  let eje = '';
  geo.forEach((g, i) => { if (i < n - 1) eje += linea(g.x + g.r, Y, geo[i + 1].x - geo[i + 1].r, Y); });
  svg += grupo('eje', eje);

  geo.forEach((g, i) => {
    const { nd, x, r } = g;
    let s = circulo(x, Y, r);
    let y0 = Y - g.alto / 2 + T.titulo.size * 0.78;
    s += texto(g.lineas, x, y0, T.titulo, 'middle');
    if (g.dentro.length) s += texto(g.dentro, x, y0 + g.lineas.length * T.titulo.lh + 4, T.meta, 'middle');

    const ramas = nd.hijos.filter(h => h.k === 'rama');
    const subs = nd.hijos.filter(h => h.k === 'sub');
    const citas = nd.hijos.filter(h => h.k === 'cita').map(h => h.args[0]);
    const maxW = 128;
    let bajo = Y + r;

    g.izq = x; g.der = x;                            // ancho ocupado bajo el círculo (para desviar arcos)
    const bloque = (cx, ty, txt, cita) => {          // etiqueta + cita centradas bajo un punto
      const ls = cortar(txt, T.etiqueta, maxW);
      const cs0 = cita ? cortar(cita, T.cita, maxW + 20) : [];
      const half = Math.max(0, ...ls.map(l => ancho(l, T.etiqueta.fam, T.etiqueta.size) / 2), ...cs0.map(l => ancho(l, T.cita.fam, T.cita.size) / 2));
      g.izq = Math.min(g.izq, cx - half); g.der = Math.max(g.der, cx + half);
      let out = texto(ls, cx, ty, T.etiqueta, 'middle');
      let fin = ty + (ls.length - 1) * T.etiqueta.lh;
      if (cita) { const cs = cortar(cita, T.cita, maxW + 20); out += texto(cs, cx, fin + T.cita.lh + 8, T.cita, 'middle', acc); fin += 8 + cs.length * T.cita.lh; }
      bajo = Math.max(bajo, fin);
      return out;
    };

    if (ramas.length) {
      const m = ramas.length;
      const sep = m === 1 ? [0] : m === 2 ? [-1.25, 1.25] : [-1.6, 0, 1.6];
      ramas.slice(0, 3).forEach((rm, j) => {
        const dx = Math.sign(sep[j]) * Math.max(Math.abs(sep[j]) * r * (m === 3 ? 0.95 : 1), (m === 3 ? 2 : 1) * (maxW / 2 + 10)), dy = r + 30;
        const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        s += linea(x + ux * r, Y + uy * r, x + dx, Y + dy);
        s += punto(x + dx, Y + dy);
        s += bloque(x + dx, Y + dy + 17, rm.args[0], rm.args[1]);
      });
      if (citas.length) {
        const c = citas.join(' / '), w = ancho(c, T.cita.fam, T.cita.size) / 2;
        g.izq = Math.min(g.izq, x - w); g.der = Math.max(g.der, x + w);
        s += texto([c], x, bajo + T.cita.lh + 8, T.cita, 'middle', acc); bajo += T.cita.lh + 8;
      }
    } else if (subs.length) {
      const py = Y + r + 40;
      s += linea(x, Y + r + 3, x, py, true) + punto(x, py);
      s += bloque(x, py + 17, subs.map(h => h.args[0]).join(' // '), citas.join(' / '));
    } else if (citas.length) {
      s += bloque(x, Y + r + 18, '', citas.join(' / '));
    }
    fondo = Math.max(fondo, bajo);
    g.bajo = bajo;
    svg += grupo(`nodo-${i + 1}`, s);
  });

  // Arcos: "arco arriba 1 4 | cita"  ·  "arco abajo 1 6 | etiqueta | cita"
  d.items.filter(i => i.k === 'arco').forEach((a, j) => {
    const p = a.args[0].split(/\s+/);
    const lado = p[0].toLowerCase(), A = geo[+p[1] - 1], B = geo[+p[2] - 1];
    if (!A || !B) return;
    let s = '';
    if (lado === 'arriba') {
      // Nace y muere sobre el borde superior de cada círculo
      const xa = A.x + A.r * 0.35, xb = B.x - B.r * 0.35;
      const ya = Y - Math.sqrt(A.r ** 2 - (A.r * 0.35) ** 2) - 3, yb = Y - Math.sqrt(B.r ** 2 - (B.r * 0.35) ** 2) - 3;
      const tope = Math.max(48, Math.min(ya, yb) - Math.min(210, (xb - xa) * 0.32));
      // Arranca dentro del círculo, como en el original
      s += camino(`M${r2(xa)},${r2(ya)} C${r2(xa)},${r2(tope)} ${r2(xb)},${r2(tope)} ${r2(xb)},${r2(yb)}`, true);
      const ap = 0.125 * ya + 0.75 * tope + 0.125 * yb;
      s += texto(cortar(a.args[1] || '', T.cita, 300), (xa + xb) / 2, ap - 12, T.cita, 'middle', acc);
    } else {
      const base = Math.min(H - 52, fondo + 46), R = 34;
      // Baja por fuera de los textos de cada nodo: sale del borde inferior del círculo y se abre en diagonal.
      const xa = Math.min(A.x - A.r * 0.6, A.izq - 12), xb = Math.max(B.x + B.r * 0.6, B.der + 12);
      const borde = (g, xt) => {                     // punto del círculo que mira hacia (xt, abajo)
        const vx = xt - g.x, vy = g.r + 18, L = Math.hypot(vx, vy);
        const u = Math.abs(vx) <= g.r * 0.6 ? null : [vx / L, vy / L];
        return u ? [g.x + u[0] * g.r, Y + u[1] * g.r, Y + g.r + 18] : [xt, Y + Math.sqrt(g.r ** 2 - (xt - g.x) ** 2), null];
      };
      const [sax, say, qa] = borde(A, xa), [sbx, sby, qb] = borde(B, xb);
      let dd = `M${r2(sax)},${r2(say)} `;
      if (qa) dd += `L${r2(xa)},${r2(qa)} `;
      dd += `L${r2(xa)},${r2(base - R)} Q${r2(xa)},${r2(base)} ${r2(xa + R)},${r2(base)} L${r2(xb - R)},${r2(base)} Q${r2(xb)},${r2(base)} ${r2(xb)},${r2(base - R)} `;
      dd += qb ? `L${r2(xb)},${r2(qb)} L${r2(sbx)},${r2(sby)}` : `L${r2(sbx)},${r2(sby)}`;
      s += camino(dd, true);
      const wl = Math.max(a.args[1] ? ancho(a.args[1], T.titulo.fam, T.titulo.size) : 0, a.args[2] ? ancho(a.args[2], T.cita.fam, T.cita.size) : 0);
      let lx = (xa + xb) / 2 - wl / 2;
      if (W > PAG.w && lx < PAG.w + 12 && lx + wl > PAG.w - 12) lx = (PAG.w + 12 + wl < xb - R) ? PAG.w + 12 : PAG.w - 12 - wl;
      const cx = lx + wl / 2;
      if (a.args[1]) s += texto([a.args[1]], cx, base - 6, T.titulo, 'middle');
      if (a.args[2]) s += texto([a.args[2]], cx, base + T.cita.lh + 4, T.cita, 'middle', acc);
    }
    svg += grupo(`arco-${j + 1}`, s);
  });

  return { W, H, svg };
}

/* ───────────── Plantilla: convergencia de referentes ─────────────
   Cada referente baja con sus factores; los rescatados (*) llevan asterisco y todo converge en el proyecto. */
function convergencia(d) {
  const doble = d.props.formato !== 'simple';
  const W = doble ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.azul);
  const prefijo = d.props.prefijo || 'Referente';
  const refs = d.items.filter(i => i.k === 'referente');
  const dest = d.items.find(i => i.k === 'destino');
  const destColor = colorDe(dest && dest.args[2], PAL.verde);
  const n = refs.length;

  const boxW = 164, boxH = 112;
  const boxX = W - (doble ? 80 : 50) - boxW;
  const colW = doble ? 230 : 150;
  const xs = doble
    ? [...repartir(Math.ceil(n / 2), 70, PAG.w - 40), ...repartir(n - Math.ceil(n / 2), PAG.w + 40, boxX - 30)].map(x => x - colW / 2 + 10)
    : repartir(n, 40, boxX - 20).map(x => x - colW / 2 + 10);

  // 1ª pasada: medir cada columna (posiciones relativas a y = 0)
  const cols = refs.map(rf => {
    const nom = cortar(rf.args[0], T.nombre, colW);
    const org = rf.args[1] ? cortar(rf.args[1], T.chico, colW) : [];
    let y = T.nombre.lh * nom.length + (org.length ? 2 + org.length * T.chico.lh : 0);
    const top = y + 18;
    let fy = top + 24;
    const marcas = rf.hijos.filter(h => h.k === '*' || h.k === '-').map(h => {
      const ls = cortar(h.args[0], T.etiqueta, colW - 26);
      const m = { y: fy, h, ls };
      fy += Math.max(34, ls.length * T.etiqueta.lh + 20);
      return m;
    });
    const fin = marcas.length ? marcas[marcas.length - 1].y : top;
    return { rf, nom, org, top, marcas, fin };
  });
  const finCols = Math.max(0, ...cols.map(c => c.fin));
  const baseRel = finCols + 56;                       // línea de convergencia
  const altoTotal = baseRel + (dest ? boxH / 2 + 44 : 10);
  const y0 = Math.max(50, (H - altoTotal) / 2 + 6);  // composición centrada en la página
  const base = y0 + baseRel;

  let svg = '';
  const bajadas = [];
  cols.forEach((c, i) => {
    const x = xs[i], lx = x + 8;
    let s = '';
    s += texto([`${prefijo} ${String(i + 1).padStart(2, '0')}`], x, y0, T.meta);
    s += texto(c.nom, x, y0 + T.nombre.lh, T.nombre, 'start', acc);
    if (c.org.length) s += texto(c.org, x, y0 + T.nombre.lh * c.nom.length + T.chico.lh + 2, T.chico);
    const ultima = c.marcas[c.marcas.length - 1];
    s += linea(lx, y0 + c.top, lx, y0 + c.fin);
    c.marcas.forEach(m => {
      s += m.h.k === '*' ? asterisco(lx, y0 + m.y, acc) : punto(lx, y0 + m.y);
      s += texto(m.ls, lx + 16, y0 + m.y + 3.5, T.etiqueta);
    });
    // Bajada punteada hasta la línea de convergencia
    s += linea(lx, y0 + c.fin + (ultima && ultima.h.k === '*' ? 9 : 4), lx, base, true);
    s += punto(lx, base);
    bajadas.push(lx);
    svg += grupo(`referente-${i + 1}`, s);
  });

  if (dest) {
    let s = '';
    const bx = boxX, by = base - boxH / 2;
    s += linea(Math.min(...bajadas), base, bx - 3, base) + flecha(bx - 3, base, 0);
    s += caja(bx, by, boxW, boxH);
    s += punto(bx + boxW / 2, by, 7.5, destColor);
    const tl = cortar(dest.args[0], T.titulo, boxW - 28);
    const sl = dest.args[1] ? cortar(dest.args[1], T.meta, boxW - 28) : [];
    const alto = tl.length * T.titulo.lh + (sl.length ? 5 + sl.length * T.meta.lh : 0);
    const ty = base - alto / 2 + T.titulo.size * 0.78;
    s += texto(tl, bx + boxW / 2, ty, T.titulo, 'middle');
    if (sl.length) s += texto(sl, bx + boxW / 2, ty + tl.length * T.titulo.lh + 5, T.meta, 'middle');
    svg += grupo('destino', s);
    // Leyenda bajo la caja
    const ly = by + boxH + 26;
    svg += grupo('leyenda',
      asterisco(bx + 6, ly - 3.5, acc) + texto(['Factor que rescata el proyecto'], bx + 18, ly, T.chico) +
      punto(bx + 6, ly + 13) + texto(['Factor del referente'], bx + 18, ly + 16.5, T.chico));
  }
  return { W, H, svg };
}

/* ───────────── Ayudas de forma ───────────── */
// Marca trazos que se cruzan a propósito (círculos del Venn, cruz del FODA) para que el revisor no los cuente.
const cruza = s => s.replace(/<(line|path|circle|rect)(?= )/g, '<$1 data-cruza="si"');
// Polilínea (o polígono) con vértices redondeados de radio r.
function curva(pts, r, cerrada = false) {
  const n = pts.length;
  const P = i => pts[(i + n) % n];
  const hacia = (a, b, dist) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) * dist / L, a[1] + (b[1] - a[1]) * dist / L]; };
  const seg = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const esquina = i => {
    const a = P(i - 1), b = P(i), c = P(i + 1);
    const rr = Math.min(r, seg(a, b) / 2, seg(b, c) / 2);
    return [hacia(b, a, rr), b, hacia(b, c, rr)];
  };
  let d = '';
  if (cerrada) {
    const e0 = esquina(0);
    d = `M${r2(e0[2][0])},${r2(e0[2][1])} `;
    for (let i = 1; i <= n; i++) { const [p, b, q] = esquina(i); d += `L${r2(p[0])},${r2(p[1])} Q${r2(b[0])},${r2(b[1])} ${r2(q[0])},${r2(q[1])} `; }
    return d + 'Z';
  }
  d = `M${r2(pts[0][0])},${r2(pts[0][1])} `;
  for (let i = 1; i < n - 1; i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1);
    const colineal = Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 0.01;
    if (colineal) { d += `L${r2(b[0])},${r2(b[1])} `; continue; }
    const [p, , q] = esquina(i);
    d += `L${r2(p[0])},${r2(p[1])} Q${r2(b[0])},${r2(b[1])} ${r2(q[0])},${r2(q[1])} `;
  }
  return d + `L${r2(pts[n - 1][0])},${r2(pts[n - 1][1])}`;
}
const trazo = (d, punteada, color = TINTA) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${LINEA}"${punteada ? ` stroke-dasharray="${PUNTEADA}"` : ''}/>`;
// Etiqueta de dos niveles: dato pequeño en negro + título en color. y = línea base del dato.
function dosNiveles(x, y, meta, titulo, acc, max = 130, alin = 'start') {
  const tl = titulo ? cortar(titulo, T.nombre2, max) : [];
  return { svg: texto([meta], x, y, T.meta, alin) + texto(tl, x, y + T.nombre2.lh, T.nombre2, alin, acc), alto: T.meta.lh + tl.length * T.nombre2.lh };
}
T.nombre2 = { fam: F.reg, size: 12, lh: 14.5 };
T.seccion = { fam: 'NeutrifStudio-MediumItalic', size: 12, lh: 15, italic: true };

/* ───────────── Plantilla: etapas isométricas (metodología) ───────────── */
function etapas(d) {
  const doble = d.props.formato !== 'simple';
  const W = doble ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.rojo);
  const prefijo = d.props.prefijo || 'Etapa';
  const es = d.items.filter(i => i.k === 'etapa');
  const n = es.length;
  const sc = doble ? 1 : 0.7;
  const u = [104 * sc, -29 * sc], v = [78 * sc, 48 * sc];     // lados del rombo
  const x0 = doble ? 150 : 90, x1 = W - (doble ? 150 : 90);
  const paso = n > 1 ? (x1 - x0) / (n - 1) : 0;
  // En pliego: la mitad de las etapas en cada página, sin rombos ni textos sobre la costura
  const k1 = Math.ceil(n / 2);
  const cxDe = i => !doble || n < 2 ? x0 + i * paso
    : i < k1 ? x0 + i * ((PAG.w - 130 - x0) / Math.max(1, k1 - 1)) : (PAG.w + 150) + (i - k1) * ((x1 - PAG.w - 150) / Math.max(1, n - k1 - 1));
  const sube = n > 1 ? Math.min(34, 210 / (n - 1)) : 0;
  const baseY = doble ? 420 : 400;
  let svg = '';
  es.forEach((e, i) => {
    const cx = cxDe(i), cy = baseY - i * sube;
    const abierta = /abiert/i.test(e.args[1] || '');
    const mas = !/menos/i.test(e.args[2] || '');
    const L = [cx - (u[0] + v[0]) / 2, cy - (u[1] + v[1]) / 2];
    const Tp = [L[0] + u[0], L[1] + u[1]], R = [Tp[0] + v[0], Tp[1] + v[1]], B = [L[0] + v[0], L[1] + v[1]];
    let s = trazo(curva([L, Tp, R, B], 13 * sc, true), abierta);
    // Llamada: sube vertical desde el borde superior y quiebra en diagonal hacia la etiqueta
    const lx = cx - 12 * sc, ly = L[1] + (lx - L[0]) / u[0] * u[1];
    const finV = ly;                                   // la llamada termina en el borde, sin cruzarlo
    const codo = [lx, ly - 52], extremo = [lx - 56, ly - 88];
    s += trazo(`M${r2(lx)},${r2(finV)} L${r2(codo[0])},${r2(codo[1])} L${r2(extremo[0])},${r2(extremo[1])}`);
    if (abierta) s += punto(lx, finV - 0.5);
    const tl = cortar(e.args[0], T.nombre2, 130);
    const yMeta = extremo[1] - 8 - tl.length * T.nombre2.lh;
    s += dosNiveles(extremo[0] - 30, yMeta, `${prefijo} ${String(i + 1).padStart(2, '0')}`, e.args[0], acc).svg;
    // Descripción con asterisco
    const desc = e.hijos.filter(h => h.k === 'desc').map(h => h.args[0]).join(' ');
    if (desc) {
      const ax = L[0] + 58 * sc, ay = B[1] + 22;
      s += asterisco(ax, ay, mas ? acc : '#3A3A3A', 5.8);
      s += texto(cortar(desc, T.meta, 118), ax + 16, ay - 1, T.meta);
    }
    svg += grupo(`etapa-${i + 1}`, s);
  });
  // Leyenda
  const gx = W - (doble ? 330 : 280), gy = H - 82;
  svg += grupo('leyenda',
    asterisco(gx, gy, acc, 5.8) + texto(['Más tiempo'], gx + 30, gy + 3.5, T.meta) +
    asterisco(gx, gy + 26, '#3A3A3A', 5.8) + texto(['Menos tiempo'], gx + 30, gy + 29.5, T.meta) +
    `<rect x="${gx + 125}" y="${gy - 9}" width="30" height="18" rx="5" fill="none" stroke="${TINTA}" stroke-width="${LINEA}" stroke-dasharray="${PUNTEADA}"/>` + texto(['Etapa abierta'], gx + 166, gy + 3.5, T.meta) +
    `<rect x="${gx + 125}" y="${gy + 17}" width="30" height="18" rx="5" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>` + texto(['Etapa cerrada'], gx + 166, gy + 29.5, T.meta));
  return { W, H, svg };
}

/* ───────────── Plantilla: recorrido en zigzag con hitos ───────────── */
function recorrido(d) {
  const doble = d.props.formato !== 'simple';
  const W = doble ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.azul);
  const tramos = d.items.filter(i => ['hito', 'punto', 'valle'].includes(i.k));
  const m0 = doble ? 170 : 70, m1 = W - (doble ? 200 : 70);
  // anchos relativos: subida 1, bajada 0.8, + entrada y salida
  const pesos = [0.45, ...tramos.map(t => (t.k === 'valle' ? 1.6 : 1)), 0.45];
  const ux = (m1 - m0) / pesos.reduce((a, b) => a + b, 0);
  let k = 0.55;
  // Puntos crudos
  const calc = kk => {
    let x = m0, y = 0; const pts = [[x, y]], marcas = [];
    const sube = w => { x += w; y -= kk * w; pts.push([x, y]); };
    sube(0.45 * ux);
    tramos.forEach(t => {
      if (t.k === 'valle') { sube(0.4 * ux); x += 0.8 * ux; y += kk * 0.8 * ux; pts.push([x, y]); sube(0.4 * ux); }
      else { const a = [x, y]; sube(ux); marcas.push({ t, p: [(a[0] + x) / 2, (a[1] + y) / 2] }); }
    });
    sube(0.45 * ux);
    return { pts, marcas };
  };
  let g = calc(k);
  const ys = g.pts.map(p => p[1]), alto = Math.max(...ys) - Math.min(...ys);
  const disp = 250;
  if (alto > disp) { k *= disp / alto; g = calc(k); }
  const ys2 = g.pts.map(p => p[1]);
  const dy = (H / 2 + 20) - (Math.max(...ys2) + Math.min(...ys2)) / 2;
  const mv = p => [p[0], p[1] + dy];
  const pts = g.pts.map(mv);
  let svg = grupo('linea', trazo(curva(pts, 11), false) + punto(...pts[0]) + punto(...pts[pts.length - 1]));
  g.marcas.forEach(({ t, p }, i) => {
    const [x, y] = mv(p);
    let s = t.k === 'hito' ? asterisco(x, y, acc, 6) : punto(x, y);
    const [meta, titulo, desc, lado] = t.args;
    const abajoEtiq = /abajo/i.test(lado || '') || (t.k === 'punto' && /abajo/i.test(desc || ''));
    const descTxt = /^(abajo|arriba)$/i.test(desc || '') ? '' : desc;
    // Etiqueta arriba (o abajo)
    if (meta || titulo) {
      const tlw = Math.max(ancho(meta || '', T.meta.fam, T.meta.size), anchoMax(cortar(titulo || '', T.nombre2, 140), T.nombre2));
      const fijar = (vx0, off) => { const bx = acomodar(vx0 + off, tlw, W); return Math.min(Math.max(vx0, bx + 6), bx + tlw - 6) === vx0 ? [vx0, bx] : [bx - off, bx]; };
      if (!abajoEtiq) {
        const [vx] = fijar(x - 56, -26), codoY = y - 32, topY = codoY - 58;
        s += trazo(`M${r2(x - 6)},${r2(y - 3.5)} L${r2(vx)},${r2(codoY)} L${r2(vx)},${r2(topY)}`, true);
        const tl = cortar(titulo || '', T.nombre2, 140);
        s += dosNiveles(vx - 26, topY - 8 - tl.length * T.nombre2.lh, meta || '', titulo, acc, 140).svg;
      } else {
        const [vx] = fijar(x + 56, -26), codoY = y + 32, botY = codoY + 50;
        s += trazo(`M${r2(x + 6)},${r2(y + 3.5)} L${r2(vx)},${r2(codoY)} L${r2(vx)},${r2(botY)}`, true);
        s += dosNiveles(vx - 26, botY + 18, meta || '', titulo, acc, 140).svg;
      }
    }
    if (descTxt) {
      const dl = cortar(descTxt, T.meta, 140), dw = anchoMax(dl, T.meta);
      const bx = acomodar(x + 52 - 56, dw, W);
      const vx = Math.min(Math.max(x + 52, bx + 6), bx + dw - 6), codoY = y + 30, botY = codoY + 64;
      s += trazo(`M${r2(x + 6)},${r2(y + 3.5)} L${r2(vx)},${r2(codoY)} L${r2(vx)},${r2(botY)}`, true);
      s += texto(dl, bx, botY + 18, { ...T.meta, lh: lhT(14) });
    }
    svg += grupo(`hito-${i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Plantilla: Venn de tres ámbitos ───────────── */
function venn(d) {
  const W = d.props.formato === 'doble' ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.rojo);
  const original = /original/i.test(d.props.estilo || '');
  const am = d.items.filter(i => i.k === 'ambito').slice(0, 3);
  const r = 104, cx = W / 2, cy = 300;
  const C = [[cx, cy - 58], [cx - 70, cy + 54], [cx + 70, cy + 54]];
  let svg = '';
  am.forEach((a, i) => {
    const c = C[i], vx = c[0] - cx, vy = c[1] - (cy + 17), L = Math.hypot(vx, vy) || 1;
    const lx = c[0] + vx / L * r * 0.42, lyc = c[1] + vy / L * r * 0.42;
    const est = original ? { fam: F.reg, size: tamT(12), lh: lhT(14.5), fill: GRIS } : T.titulo;
    const txt = original ? a.args[0].toUpperCase() : a.args[0];
    const ls = cortar(txt, est, r * 0.95);
    let s = cruza(circulo(c[0], c[1], r).replace(`stroke="${TINTA}"`, `stroke="${original ? GRIS : TINTA}"`));
    s += texto(ls, lx, lyc - (ls.length - 1) * est.lh / 2 + est.size * 0.35, est, 'middle');
    svg += grupo(`ambito-${i + 1}`, s);
  });
  const est = { ...T.meta, size: tamT(10), lh: lhT(12) };
  d.items.filter(i => i.k === 'cruce').forEach((cr, j) => {
    const ids = cr.args[0].split(/\s+/).map(n => +n - 1).sort();
    let p;
    if (ids.length === 3) p = [cx, cy + 32];
    else {
      const [a, b] = ids, o = [0, 1, 2].find(n => !ids.includes(n));
      const mx = (C[a][0] + C[b][0]) / 2, my = (C[a][1] + C[b][1]) / 2;
      const vx = mx - C[o][0], vy = my - C[o][1], L = Math.hypot(vx, vy);
      p = [mx + vx / L * 30, my + vy / L * 30];
    }
    const ls = cortar(cr.args[1] || '', est, 170);
    let s = punto(...p);
    const abajo = ids.length === 3 || (ids.includes(1) && ids.includes(2));
    if (abajo) {
      const yb = cy + 54 + r + 34;
      s += linea(p[0], p[1] + 3, p[0], yb, true) + punto(p[0], yb);
      s += texto(ls, p[0], yb + 17, est, 'middle', acc);
    } else {
      const izq = p[0] < cx, xl = izq ? cx - r * 1.85 : cx + r * 1.85, yt = cy - 58 - r * 0.45;
      s += trazo(`M${r2(p[0] + (izq ? -3 : 3))},${r2(p[1])} L${r2(xl)},${r2(p[1])} L${r2(xl)},${r2(yt)}`, true) + punto(xl, yt);
      s += texto(ls, xl, yt - 10 - (ls.length - 1) * est.lh, est, 'middle', acc);
    }
    svg += grupo(`cruce-${j + 1}`, cruza(s));
  });
  return { W, H, svg };
}

/* ───────────── Plantilla: cuadrantes (FODA, 2×2) ───────────── */
// Texto con un comienzo en negrita: "Título: resto". Corta palabra por palabra midiendo cada estilo.
function textoMixto(txt, x, y, max, est, estB) {
  const i = txt.indexOf(':');
  const tok = [];
  const push = (s, b) => s.split(/\s+/).filter(Boolean).forEach(w => tok.push({ w, b }));
  if (i > 0 && i < 60) { push(txt.slice(0, i + 1), true); push(txt.slice(i + 1), false); } else push(txt, false);
  const lineas = [[]]; let ancho0 = 0;
  const sp = ancho(' ', est.fam, est.size);
  tok.forEach(t => {
    const w = ancho(t.w, t.b ? estB.fam : est.fam, est.size);
    if (lineas[lineas.length - 1].length && ancho0 + sp + w > max) { lineas.push([]); ancho0 = 0; }
    ancho0 += (lineas[lineas.length - 1].length ? sp : 0) + w;
    lineas[lineas.length - 1].push(t);
  });
  const svg = lineas.map((ln, k) => {
    let out = '', xx = x;
    // agrupa tramos del mismo estilo en un solo <text> para que quede editable como frase
    let grupoT = [];
    const vaciar = () => {
      if (!grupoT.length) return;
      const s = grupoT.map(t => t.w).join(' '), fam = grupoT[0].b ? estB.fam : est.fam;
      out += `<text x="${r2(xx)}" y="${r2(y + k * est.lh)}" font-family="${fam}" font-size="${est.size}" fill="${TINTA}">${esc(s)}</text>`;
      xx += ancho(s, fam, est.size) + sp; grupoT = [];
    };
    ln.forEach(t => { if (grupoT.length && grupoT[0].b !== t.b) vaciar(); grupoT.push(t); });
    vaciar();
    return out;
  }).join('');
  return { svg, alto: lineas.length * est.lh };
}
function cuadrantes(d) {
  const W = d.props.formato === 'doble' ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.rosado);
  const qs = d.items.filter(i => i.k === 'cuadrante').slice(0, 4);
  const est = { fam: F.reg, size: tamT(10), lh: lhT(13.2) }, estB = { fam: F.semi };
  const mx = 70, midX = W / 2;
  const maxDe = i => (i % 2 ? W - mx - midX : midX - mx) - 50;
  // Alto de cada cuadrante (encabezado + lista), para que la cruz no pise el texto
  const altoDe = (q, i) => 32 + q.hijos.filter(h => h.k === '-' || h.k === '*')
    .reduce((a, h) => a + textoMixto(h.args.join(' | '), 0, 0, maxDe(i) - 12, est, estB).alto + 8, 0);
  const altos = qs.map(altoDe);
  const filaA = Math.max(altos[0] || 0, altos[1] || 0) + 40, filaB = Math.max(altos[2] || 0, altos[3] || 0) + 40;
  const top = Math.max(60, (H - (filaA + filaB + 20)) / 2), midY = top + filaA + 10, bot = midY + filaB + 10;
  let svg = '';
  qs.forEach((q, i) => {
    const x = (i % 2 ? midX : mx) + 22, y = (i < 2 ? top : midY) + 32;
    const max = maxDe(i);
    let s = texto([q.args[0]], x, y, T.seccion, 'start', acc);
    let yy = y + 32;
    q.hijos.filter(h => h.k === '-' || h.k === '*').forEach(h => {
      s += punto(x + 2, yy - 3.4, 1.3);
      const m = textoMixto(h.args.join(' | '), x + 12, yy, max - 12, est, estB);
      s += m.svg; yy += m.alto + 8;
    });
    svg += grupo(`cuadrante-${i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Plantilla: trayectorias comparadas ───────────── */
function trayectorias(d) {
  const W = d.props.formato === 'simple' ? PAG.w : PAG.w * 2, H = PAG.h;
  const org = d.items.find(i => i.k === 'origen');
  const arr = d.items.find(i => i.k === 'arriba');
  const abj = d.items.find(i => i.k === 'abajo');
  const bw = 112, bh = 126, by0 = 306;
  const ox = 76;
  const dx = W - 76 - bw;
  const yA = 160, yB = 448;
  let svg = '';
  const contenedor = (id, x, cy, txt, color, lado) => {
    const h = id === 'origen' ? 170 : bh;
    let s = caja(x, cy - h / 2, bw, h, 26);
    const dp = lado === 'izq' ? [x, cy] : lado === 'arriba' ? [x + bw / 2, cy - h / 2] : [x + bw / 2, cy + h / 2];
    s += punto(...dp, 9, color);
    s += texto([txt], x + bw / 2 + (lado === 'izq' ? 6 : 0), cy + 4, T.titulo, 'middle');
    return grupo(id, s);
  };
  if (org) svg += contenedor('origen', ox, by0, org.args[0], colorDe(org.args[1], PAL.azul), 'izq');
  const x0 = ox + bw + 8, x1 = dx - 6;
  if (arr) {
    const pasos = arr.hijos.filter(h => h.k === 'paso').map(h => h.args[0]);
    const n = pasos.length;
    const xs = repartir(n, x0 + 60, x1 - 40).map(x => lejosDelPliegue(x, W, 40));
    const alto = [158, 218], jit = [0, 8, -14, 10, 4, 16, -6, 12];
    const pts = [[x0, by0 - 50]];
    let s = '';
    pasos.forEach((p, i) => {
      const y = (i % 2 ? alto[1] : alto[0]) + jit[i % jit.length] * 0.6 + (i % 2 ? 0 : 0);
      pts.push([xs[i], y]);
    });
    pts.push([x1, yA]);
    s += trazo(curva(pts, 0), false) + flecha(x1, yA, Math.atan2(yA - pts[pts.length - 2][1], x1 - pts[pts.length - 2][0]));
    pasos.forEach((p, i) => {
      const [x, y] = pts[i + 1];
      s += punto(x, y, 2.8);
      s += i % 2 ? texto([p], x, y + 20, T.titulo, 'middle') : texto([p], x, y - 12, T.titulo, 'middle');
    });
    svg += grupo('trayectoria-arriba', s) + contenedor('destino-arriba', dx, yA, arr.args[0], colorDe(arr.args[1], PAL.verde), 'arriba');
  }
  if (abj) {
    const pasos = abj.hijos.filter(h => h.k === 'paso').map(h => h.args[0]);
    let s = '';
    const xp0 = x0 + 72;
    s += linea(x0, by0 + 50, xp0, yB) + linea(xp0, yB, x1, yB) + flecha(x1, yB, 0);
    const xs = [xp0, ...repartir(Math.max(0, pasos.length - 1), xp0 + 200, x1 - 300).slice(0, pasos.length - 1).map(x => lejosDelPliegue(x, W, 140))];
    pasos.forEach((p, i) => { s += punto(xs[i], yB, 2.8) + texto([p], xs[i], yB + 20, T.titulo, 'middle'); });
    svg += grupo('trayectoria-abajo', s) + contenedor('destino-abajo', dx, yB, abj.args[0], colorDe(abj.args[1], PAL.verde), 'abajo');
  }
  svg += grupo('separador', linea(x0 + 4, by0, x1 - 120, by0, true));
  return { W, H, svg };
}

/* ───────────── Plantilla: barras proporcionales ───────────── */
function barras(d) {
  const W = d.props.formato === 'doble' ? PAG.w * 2 : PAG.w, H = PAG.h;
  const acc = colorDe(d.props.color, PAL.rojo);
  const suf = d.props.unidad || '';
  const pre = d.props.prefijo || '';
  const bs = d.items.filter(i => i.k === 'barra');
  const total = d.items.find(i => i.k === 'total');
  const num = s => +String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const fmt = v => pre + Math.round(v).toLocaleString('es-CL') + suf;
  const vals = bs.map(b => num(b.args[1]));
  const max = Math.max(...vals, 1);
  const etW = Math.max(80, ...bs.map(b => ancho(b.args[0], T.titulo.fam, T.titulo.size))) + 16;
  const x0 = 90 + etW, x1 = W - 170;
  const paso = Math.min(58, 300 / Math.max(1, bs.length));
  const y0 = H / 2 - (bs.length - 1) * paso / 2 - (total ? 20 : 0);
  let svg = '';
  bs.forEach((b, i) => {
    const y = y0 + i * paso, v = vals[i], x = x0 + (x1 - x0) * v / max;
    const resalta = /\*/.test(b.args[2] || '') || b.args[2] === 'resaltar';
    let s = texto([b.args[0]], x0 - 16, y + 4, T.titulo, 'end');
    if (x < x1 - 14) s += linea(x + 9, y, x1, y, true);     // pista punteada: solo lo que falta
    s += `<line x1="${r2(x0)}" y1="${r2(y)}" x2="${r2(x)}" y2="${r2(y)}" stroke="${resalta ? acc : TINTA}" stroke-width="${resalta ? 3 : 1.6}"/>`;
    s += punto(x0, y, 2.8) + (resalta ? asterisco(x, y, acc, 6) : punto(x, y, 2.8));
    s += texto([fmt(v)], x + 12, y - 8, T.cita, 'start', resalta ? acc : TINTA);
    if (b.args[3] || (b.args[2] && !resalta)) s += texto([b.args[3] || b.args[2]], x0, y + 18, T.chico);
    svg += grupo(`barra-${i + 1}`, s);
  });
  if (total) {
    const y = y0 + bs.length * paso + 10;
    svg += grupo('total', linea(x0 - etW, y - 22, x1 + 80, y - 22) + texto([total.args[0] || 'Total'], x0 - 16, y + 4, T.titulo, 'end') +
      texto([total.args[1] ? pre + total.args[1] + suf : fmt(vals.reduce((a, b) => a + b, 0))], x0, y + 4, { ...T.titulo, size: tamT(13) }, 'start', acc));
  }
  return { W, H, svg };
}

/* ───────────── Catálogo ───────────── */
const PLANTILLAS = {
  eje: {
    nombre: 'Eje de conceptos', fn: ejeConceptos, archivo: 'eje-conceptos',
    ayuda: `color rojo · formato doble | simple
nodo Título | chico · grande
  dentro texto dentro del círculo
  sub etiqueta bajo línea punteada
  rama etiqueta | Cita (año)   (hasta 3)
  cita Autor (año)
arco arriba 1 4 | Cita (año)
arco abajo 2 6 | Etiqueta | Cita (año)
"//" fuerza un salto de línea`,
  },
  convergencia: {
    nombre: 'Convergencia de referentes', fn: convergencia, archivo: 'referentes',
    ayuda: `color azul · formato doble | simple
prefijo Referente
referente Nombre | quién lo organiza
  * factor que el proyecto rescata (asterisco)
  - factor del referente (punto)
destino Proyecto | bajada | color del punto`,
  },
  etapas: {
    nombre: 'Etapas isométricas', fn: etapas, archivo: 'etapas',
    ayuda: `color rojo · formato doble | simple
prefijo Etapa
etapa Título | abierta · cerrada | más · menos tiempo
  desc texto junto al asterisco`,
  },
  recorrido: {
    nombre: 'Recorrido con hitos', fn: recorrido, archivo: 'recorrido',
    ayuda: `color azul · formato doble | simple
punto Dato | Título            (punto negro)
punto Dato | Título | abajo    (etiqueta abajo)
hito Dato | Título | descripción   (asterisco)
valle                         (sube, baja y vuelve a subir)`,
  },
  venn: {
    nombre: 'Venn de tres ámbitos', fn: venn, archivo: 'venn',
    ayuda: `color rojo · formato simple | doble
estilo original   (mayúsculas grises, como p. 41)
ambito Nombre      (3 veces: arriba, izquierda, derecha)
cruce 1 2 | texto  (cruce de dos ámbitos)
cruce 1 2 3 | texto`,
  },
  cuadrantes: {
    nombre: 'Cuadrantes (FODA)', fn: cuadrantes, archivo: 'cuadrantes',
    ayuda: `color rosado · formato simple | doble
cuadrante Título    (4: arriba izq, arriba der, abajo izq, abajo der)
  - Negrita: texto normal`,
  },
  trayectorias: {
    nombre: 'Trayectorias comparadas', fn: trayectorias, archivo: 'trayectorias',
    ayuda: `formato doble | simple
origen Título | color del punto
arriba Destino | color
  paso Palabra      (zigzag)
abajo Destino | color
  paso Palabra      (línea recta)`,
  },
  barras: {
    nombre: 'Barras proporcionales', fn: barras, archivo: 'barras',
    ayuda: `color rojo · formato simple | doble
prefijo $ · unidad  pts
barra Etiqueta | valor | * (resaltar) | nota
total Total | valor (si no, se suma)`,
  },
};

/* ───────────── SVG completo ───────────── */
// Centra el contenido en la altura de la página (mide el dibujo real en el navegador).
function centrarVertical(svg, W, H) {
  if (typeof document === 'undefined') return svg;
  const NS = 'http://www.w3.org/2000/svg';
  const tmp = document.createElementNS(NS, 'svg');
  tmp.setAttribute('viewBox', `0 0 ${W} ${H}`);
  tmp.setAttribute('style', 'position:absolute;left:-99999px;top:0;width:800px;visibility:hidden');
  tmp.innerHTML = svg;
  document.body.appendChild(tmp);
  let b;
  try { b = tmp.getBBox(); } catch (e) { b = null; }
  tmp.remove();
  if (!b || !b.height) return svg;
  const dy = Math.round((H - b.height) / 2 - b.y);
  if (Math.abs(dy) < 6) return svg;
  return `<g id="contenido" transform="translate(0 ${dy})">${svg}</g>`;
}

function armar(id, src, { guias = false, fuentes = false, acento = "" } = {}) {
  const pl = PLANTILLAS[id];
  const d = leer(src);
  if (acento) d.props.color = acento;   // color principal elegido en el panel de estilo
  let { W, H, svg } = pl.fn(d);
  svg = centrarVertical(svg, W, H);
  let extra = '';
  if (fuentes) {
    extra = `<style>${Object.entries(fuentesTodas()).map(([k, b]) => `@font-face{font-family:"${k}";src:url(data:font/ttf;base64,${b})}`).join('')}</style>`;
  }
  let guia = '';
  if (guias) {
    guia = `<g id="guias" pointer-events="none">${W > PAG.w ? `<line x1="${PAG.w}" y1="0" x2="${PAG.w}" y2="${H}" stroke="#c9c9c9" stroke-width="0.6" stroke-dasharray="2 3"/>` : ''}</g>`;
  }
  const nombre = d.props.nombre || pl.archivo;
  return {
    nombre, W, H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${extra}${guia}${svg}</svg>`,
  };
}

