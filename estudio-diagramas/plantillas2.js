// Plantillas del mapeo (segunda tanda). Todas miden sus textos antes de ubicarlos
// para que nada se monte: líneas, textos y marcadores tienen su propio espacio.

const anchoMax = (ls, est) => Math.max(0, ...ls.map(l => ancho(l, est.fam, est.size)));
const lienzoDe = (d, dobleDefecto) => {
  const doble = d.props.formato ? d.props.formato === 'doble' : dobleDefecto;
  return { doble, W: doble ? PAG.w * 2 : PAG.w, H: PAG.h };
};
const T2 = {
  anio:   { fam: F.med, size: 13, lh: 15 },
  cuerpo: { fam: F.reg, size: 10, lh: 13 },
  grande: { fam: F.med, size: 40, lh: 44 },
  medio:  { fam: F.med, size: 22, lh: 26 },
};
// Reparte intervalos [a,b] en niveles para que no se toquen (de izquierda a derecha).
function niveles(items, sep = 14) {
  const fin = [];
  return items.map(it => {
    let k = 0;
    while (fin[k] !== undefined && fin[k] + sep > it.a) k++;
    fin[k] = it.b;
    return k;
  });
}
// Mantiene un bloque [x, x+w] dentro de la página y fuera de la costura del pliego.
function acomodar(x, w, W, m = 40) {
  x = Math.max(m, Math.min(W - m - w, x));
  if (W > PAG.w && x < PAG.w + 12 && x + w > PAG.w - 12) x = (x + w / 2 < PAG.w) ? PAG.w - 12 - w : PAG.w + 12;
  return x;
}

/* ───────────── Línea de tiempo ───────────── */
// hito Año | texto | cita
function lineaTiempo(d) {
  const { W, H, doble } = lienzoDe(d, true);
  const acc = colorDe(d.props.color, PAL.rojo);
  const hs = d.items.filter(i => i.k === 'hito');
  const n = hs.length, Y = H / 2 + 6;
  const x0 = doble ? 110 : 70, x1 = W - (doble ? 110 : 70);
  const xs = repartir(n, x0, x1).map(x => lejosDelPliegue(x, W, 30));
  const maxW = Math.min(170, Math.max(96, (x1 - x0) / n * 1.7 - 16));
  const bloques = hs.map((h, i) => {
    const anio = h.args[0] || '', txt = cortar(h.args[1] || '', T2.cuerpo, maxW), cita = h.args[2] ? cortar(h.args[2], T.chico, maxW) : [];
    const w = Math.max(ancho(anio, T2.anio.fam, T2.anio.size), anchoMax(txt, T2.cuerpo), anchoMax(cita, T.chico));
    const alto = T2.anio.lh + 4 + txt.length * T2.cuerpo.lh + (cita.length ? 4 + cita.length * T.chico.lh : 0);
    const lado = i % 2 ? 1 : -1;            // -1 arriba, 1 abajo
    const bx = acomodar(xs[i] - w / 2, w, W);
    return { h, i, anio, txt, cita, w, alto, lado, bx };
  });
  // niveles por lado
  for (const lado of [-1, 1]) {
    const bs = bloques.filter(b => b.lado === lado);
    const ks = niveles(bs.map(b => ({ a: b.bx, b: b.bx + b.w })), 18);
    bs.forEach((b, j) => { b.nivel = ks[j]; });
    const altoNivel = [];
    bs.forEach(b => { altoNivel[b.nivel] = Math.max(altoNivel[b.nivel] || 0, b.alto); });
    bs.forEach(b => {
      let off = 34;
      for (let k = 0; k < b.nivel; k++) off += altoNivel[k] + 22;
      b.off = off;
    });
  }
  let svg = grupo('eje', linea(x0 - 30, Y, x1 + 30, Y) + flecha(x1 + 30, Y, 0));
  bloques.forEach(b => {
    const x = xs[b.i];
    let s = punto(x, Y, 3.2, acc);
    const cx = Math.min(Math.max(x, b.bx + 4), b.bx + b.w - 4);     // la llamada cae dentro del bloque
    const al = b.bx + b.w / 2;
    if (b.lado < 0) {
      const top = Y - b.off;                       // base del bloque
      s += trazo(`M${r2(x)},${r2(Y - 6)} L${r2(x)},${r2(top + 4)}${cx !== x ? ` L${r2(cx)},${r2(top + 4)}` : ''}`, true);
      let y = top - b.alto + T2.anio.size;
      s += texto([b.anio], al, y, T2.anio, 'middle', acc);
      y += T2.anio.lh + 4 - T2.anio.size + T2.cuerpo.size;
      s += texto(b.txt, al, y, T2.cuerpo, 'middle');
      if (b.cita.length) s += texto(b.cita, al, y + b.txt.length * T2.cuerpo.lh + 4, T.chico, 'middle');
    } else {
      const top = Y + b.off;
      s += trazo(`M${r2(x)},${r2(Y + 6)} L${r2(x)},${r2(top - 14)}${cx !== x ? ` L${r2(cx)},${r2(top - 14)}` : ''}`, true);
      let y = top;
      s += texto([b.anio], al, y, T2.anio, 'middle', acc);
      y += T2.anio.lh + 4 - T2.anio.size + T2.cuerpo.size;
      s += texto(b.txt, al, y, T2.cuerpo, 'middle');
      if (b.cita.length) s += texto(b.cita, al, y + b.txt.length * T2.cuerpo.lh + 4, T.chico, 'middle');
    }
    svg += grupo(`hito-${b.i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Árbol (uno a varios) ───────────── */
// raiz Etiqueta | texto     ·    hijo Título | texto | vínculo (opcional, con asterisco)
function arbol(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const pre = d.props.prefijo || '';
  const raiz = d.items.find(i => i.k === 'raiz');
  const hs = d.items.filter(i => i.k === 'hijo');
  const n = hs.length, m = doble ? 110 : 56;
  const k1 = Math.ceil(n / 2);
  const xs = doble ? [...repartir(k1, m, PAG.w - 30), ...repartir(n - k1, PAG.w + 30, W - m)] : repartir(n, m, W - m);
  const colW = Math.min(doble ? 230 : 150, (doble ? (PAG.w - m - 30) / k1 : (W - 2 * m) / n) - 22);
  let svg = '', y = 70;
  const rx = doble ? PAG.w / 2 : W / 2;
  if (raiz) {
    let s = '';
    const rl = cortar(raiz.args[1] || '', T2.cuerpo, Math.min(520, PAG.w - 2 * m));
    s += texto([raiz.args[0]], rx, y, T.seccion, 'middle', acc);
    s += texto(rl, rx, y + 22, T2.cuerpo, 'middle');
    y += 22 + rl.length * T2.cuerpo.lh + 14;
    s += linea(rx, y, rx, y + 30);
    svg += grupo('raiz', s);
    y += 30;
  }
  const barra = y, bajo = y + 28;
  svg += grupo('ramas', linea(Math.min(xs[0], rx), barra, Math.max(xs[n - 1], rx), barra) + xs.map(x => linea(x, barra, x, bajo)).join(''));
  hs.forEach((h, i) => {
    const x = xs[i];
    let s = punto(x, bajo, 3);
    const tit = cortar(h.args[0], T.nombre2, colW);
    const meta = pre ? `${pre} ${String(i + 1).padStart(2, '0')}` : '';
    let yy = bajo + 22;
    if (meta) { s += texto([meta], x, yy, T.meta, 'middle'); yy += T.meta.lh; }
    s += texto(tit, x, yy + 2, T.nombre2, 'middle', acc);
    yy += tit.length * T.nombre2.lh + 8;
    const tl = cortar(h.args[1] || '', T2.cuerpo, colW);
    s += texto(tl, x, yy, T2.cuerpo, 'middle');
    yy += tl.length * T2.cuerpo.lh;
    if (h.args[2]) {
      const vl = cortar(h.args[2], T.meta, colW - 18);
      const vw = anchoMax(vl, T.meta) + 16;
      const vx = x - vw / 2;
      s += linea(x, yy + 2, x, yy + 22, true);
      s += asterisco(vx + 5, yy + 33, acc, 5) + texto(vl, vx + 16, yy + 36.5, T.meta);
    }
    svg += grupo(`hijo-${i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Tabla en T (dos columnas) ───────────── */
// titulo (prop) · columna Título · - Negrita: texto
function tablaT(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const cols = d.items.filter(i => i.k === 'columna').slice(0, 2);
  const m = doble ? 120 : 70, mid = W / 2;
  const est = T2.cuerpo, estB = { fam: F.semi };
  const ancho0 = mid - m - 46;
  // medir
  const alturas = cols.map(c => c.hijos.filter(h => h.k === '-' || h.k === '*')
    .reduce((a, h) => a + textoMixto(h.args.join(' | '), 0, 0, ancho0 - 14, est, estB).alto + 10, 0));
  const tituloL = d.props.titulo ? cortar(d.props.titulo, T.titulo, W - 2 * m) : [];
  const altoTot = (tituloL.length ? tituloL.length * T.titulo.lh + 26 : 0) + 30 + 16 + Math.max(...alturas, 0);
  let y = Math.max(60, (H - altoTot) / 2);
  let svg = '';
  if (tituloL.length) { svg += grupo('titulo', texto(tituloL, mid, y, T.titulo, 'middle')); y += tituloL.length * T.titulo.lh + 18; }
  const yH = y + 4, yL = y + 18;
  cols.forEach((c, i) => {
    const x = i ? mid + 28 : m + 6;
    let s = texto(cortar(c.args[0], T.seccion, ancho0)[0] ? cortar(c.args[0], T.seccion, ancho0) : [''], i ? x : mid - 28, yH, T.seccion, i ? 'start' : 'end', acc);
    let yy = yL + 30;
    c.hijos.filter(h => h.k === '-' || h.k === '*').forEach(h => {
      s += h.k === '*' ? asterisco(x + 3, yy - 3.5, acc, 4.6) : punto(x + 2, yy - 3.4, 1.4);
      const mm = textoMixto(h.args.join(' | '), x + 14, yy, ancho0 - 14, est, estB);
      s += mm.svg; yy += mm.alto + 10;
    });
    svg += grupo(`columna-${i + 1}`, s);
  });
  const fondo = yL + 30 + Math.max(...alturas, 0);
  svg += grupo('t', linea(m, yL, W - m, yL) + linea(mid, yL, mid, fondo));
  return { W, H, svg };
}

/* ───────────── Matriz de puntos ───────────── */
// encabezado A | B | C     ·    fila Nombre | si | no | ? | ~
function matriz(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const cab = (d.items.find(i => i.k === 'encabezado') || { args: [] }).args;
  const filas = d.items.filter(i => i.k === 'fila');
  const nc = cab.length;
  const m = doble ? 120 : 60;
  const etW = Math.min(230, Math.max(...filas.map(f => ancho(f.args[0], T.titulo.fam, T.titulo.size)))) + 10;
  const colW = Math.min(118, (W - 2 * m - etW - 30) / nc);
  const gridW = etW + 30 + colW * nc;
  const gx = (W - gridW) / 2, cx0 = gx + etW + 30;
  const cabL = cab.map(c => cortar(c, T.meta, colW - 10));
  const cabH = Math.max(...cabL.map(l => l.length)) * T.meta.lh;
  const filaH = 34;
  const altoTot = cabH + 18 + filas.length * filaH + 50;
  const y0 = Math.max(60, (H - altoTot) / 2) + cabH;
  let svg = '';
  let s = '';
  cabL.forEach((l, j) => { s += texto(l, cx0 + colW * (j + 0.5), y0 - (l.length - 1) * T.meta.lh, T.meta, 'middle'); });
  svg += grupo('encabezado', s);
  filas.forEach((f, i) => {
    const y = y0 + 22 + i * filaH + filaH / 2;
    const resalta = /\*/.test(f.args[0]);
    const nombre = f.args[0].replace(/\*/g, '').trim();
    let s = texto([nombre], gx + etW, y + 4, T.titulo, 'end', resalta ? acc : TINTA);
    if (i > 0) s += linea(gx, y - filaH / 2, gx + gridW, y - filaH / 2, true);
    for (let j = 0; j < nc; j++) {
      const v = (f.args[j + 1] || '').toLowerCase().trim(), x = cx0 + colW * (j + 0.5);
      if (v === 'si' || v === 'sí' || v === 'x') s += punto(x, y, 5, resalta ? acc : TINTA);
      else if (v === '~') s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="4.6" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>` + punto(x, y, 2);
      else if (v === 'no') s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="4.6" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>`;
      else s += linea(x - 4, y, x + 4, y);       // sin dato
    }
    svg += grupo(`fila-${i + 1}`, s);
  });
  // leyenda
  const ly = y0 + 22 + filas.length * filaH + 30;
  const lx = gx;
  const usados = new Set(filas.flatMap(f => f.args.slice(1).map(v => v.toLowerCase().trim())));
  let L = '', xx = lx;
  const item = (marca, txt) => { L += marca(xx + 5) + texto([txt], xx + 16, ly + 3.5, T.chico); xx += 16 + ancho(txt, T.chico.fam, T.chico.size) + 26; };
  item(x => punto(x, ly, 5), d.props.si || 'Sí');
  if (usados.has('~')) item(x => `<circle cx="${r2(x)}" cy="${ly}" r="4.6" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>` + punto(x, ly, 2), 'En parte');
  if (usados.has('no')) item(x => `<circle cx="${r2(x)}" cy="${ly}" r="4.6" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>`, 'No');
  if ([...usados].some(v => !['si', 'sí', 'x', '~', 'no'].includes(v))) item(x => linea(x - 4, ly, x + 4, ly), 'Sin dato en la memoria');
  svg += grupo('leyenda', L);
  return { W, H, svg };
}

/* ───────────── Ciclo ───────────── */
// centro Título | cita   ·   paso Nombre | descripción
function ciclo(d) {
  const { W, H } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const centro = d.items.find(i => i.k === 'centro');
  const ps = d.items.filter(i => i.k === 'paso');
  const n = ps.length, R = 150, cx = W / 2, cy = H / 2 + 4;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  let svg = '';
  const gap = 15 / R;                           // espacio angular libre alrededor de cada punto
  let arcos = '';
  for (let i = 0; i < n; i++) {
    const a0 = ang(i) + gap, a1 = ang(i + 1) - gap - 0.02;
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
    arcos += `<path d="M${r2(p0[0])},${r2(p0[1])} A${R},${R} 0 0 1 ${r2(p1[0])},${r2(p1[1])}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>`;
    arcos += flecha(p1[0], p1[1], a1 + Math.PI / 2);
  }
  svg += grupo('ciclo', arcos);
  ps.forEach((p, i) => {
    const a = ang(i), x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    let s = punto(x, y, 3.6, acc);
    const c = Math.cos(a), sn = Math.sin(a);
    const al = Math.abs(c) < 0.3 ? 'middle' : c > 0 ? 'start' : 'end';
    const off = 16;
    const lx = x + c * off + (al === 'start' ? 2 : al === 'end' ? -2 : 0);
    const tl = cortar(p.args[0], T.titulo, 150), dl = p.args[1] ? cortar(p.args[1], T.meta, 150) : [];
    const alto = tl.length * T.titulo.lh + dl.length * T.meta.lh;
    let ly = y + sn * off - alto / 2 + T.titulo.size * 0.8;
    if (al === 'middle') ly = sn < 0 ? y - off - alto + T.titulo.size * 0.8 : y + off + T.titulo.size;
    s += texto(tl, lx, ly, T.titulo, al);
    if (dl.length) s += texto(dl, lx, ly + tl.length * T.titulo.lh, T.meta, al, GRIS);
    svg += grupo(`paso-${i + 1}`, s);
  });
  if (centro) {
    const tl = cortar(centro.args[0], T.nombre2, R * 1.2);
    let s = texto(tl, cx, cy - (tl.length - 1) * T.nombre2.lh / 2 + 2, T.nombre2, 'middle', TINTA);
    if (centro.args[1]) s += texto(cortar(centro.args[1], T.cita, R * 1.2), cx, cy + tl.length * T.nombre2.lh / 2 + 14, T.cita, 'middle', acc);
    svg += grupo('centro', s);
  }
  return { W, H, svg };
}

/* ───────────── Cadena (secuencia argumental) ───────────── */
// eslabon Nombre | texto
function cadena(d) {
  const { W, H, doble } = lienzoDe(d, true);
  const acc = colorDe(d.props.color, PAL.rojo);
  const pre = d.props.prefijo === 'no' ? '' : (d.props.prefijo || '');
  const es = d.items.filter(i => i.k === 'eslabon');
  const n = es.length, m = doble ? 110 : 60;
  const xs = repartir(n, m, W - m).map(x => lejosDelPliegue(x, W, 30));
  const paso = (W - 2 * m) / n;
  const tW = Math.min(doble ? 210 : 140, paso - 26);
  const desc = es.map(e => cortar(e.args[1] || '', T2.cuerpo, tW));
  const tits = es.map(e => cortar(e.args[0], T.nombre2, tW));
  const altoArriba = Math.max(...tits.map(t => t.length)) * T.nombre2.lh + (pre ? T.meta.lh : 0);
  const altoAbajo = Math.max(...desc.map(l => l.length)) * T2.cuerpo.lh;
  const Y = Math.max(altoArriba + 90, (H - (altoAbajo + 70) + altoArriba + 40) / 2);
  let svg = '';
  let l = '';
  for (let i = 0; i < n - 1; i++) l += linea(xs[i] + 8, Y, xs[i + 1] - 10, Y) + flecha(xs[i + 1] - 9, Y, 0);
  svg += grupo('cadena', l);
  es.forEach((e, i) => {
    const x = xs[i];
    let s = punto(x, Y, 3.6, acc);
    // etiqueta arriba alineada a la izquierda del punto
    const yt = Y - 22 - (tits[i].length - 1) * T.nombre2.lh;
    if (pre) s += texto([`${pre} ${String(i + 1).padStart(2, '0')}`], x - 4, yt - T.nombre2.lh, T.meta);
    s += texto(tits[i], x - 4, yt, T.nombre2, 'start', acc);
    // descripción abajo con bajada punteada
    s += linea(x, Y + 7, x, Y + 34, true);
    s += texto(desc[i], x - 4, Y + 50, T2.cuerpo);
    svg += grupo(`eslabon-${i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Territorio (columna norte → sur) ───────────── */
// region Nombre | n° (vacío = sin dato) | nota con asterisco   ·   dato Cifra | texto | fuente
function territorio(d) {
  const { W, H } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const rs = d.items.filter(i => i.k === 'region');
  const dato = d.items.find(i => i.k === 'dato');
  const n = rs.length, top = 64, paso = Math.min(31, (H - 2 * top) / (n - 1));
  const x = 250;
  let svg = grupo('eje', linea(x, top - 14, x, top + paso * (n - 1) + 14));
  rs.forEach((r, i) => {
    const y = top + i * paso;
    const v = r.args[1] === undefined || r.args[1] === '' ? null : +r.args[1];
    let s = texto([r.args[0]], x - 18, y + 3.6, v ? { ...T.titulo } : T.meta, 'end', v ? acc : TINTA);
    let rr = 2.4, xx = x + 16;
    if (v === 0) { s += `<circle cx="${x}" cy="${r2(y)}" r="4.5" fill="#fff" stroke="${TINTA}" stroke-width="${LINEA}"/>`; rr = 4.5; }
    else if (v) { rr = Math.max(4.5, Math.sqrt(v) * 3.1); s += punto(x, y, r2(rr), acc); }
    else s += punto(x, y, 2.4);
    xx = x + rr + 12;
    if (v) { s += texto([`${v} Fab Labs`], xx, y + 4, T.titulo, 'start', acc); xx += ancho(`${v} Fab Labs`, T.titulo.fam, T.titulo.size) + 18; }
    if (v === 0) { s += texto(['sin laboratorio'], xx, y + 3.4, T.meta, 'start', GRIS); xx += ancho('sin laboratorio', T.meta.fam, T.meta.size) + 18; }
    if (r.args[2]) { s += asterisco(xx + 4, y, acc, 5) + texto([r.args[2]], xx + 16, y + 3.5, T.meta); }
    svg += grupo(`region-${i + 1}`, s);
  });
  if (dato) {
    const dx = 560, dy = H / 2 - 60;
    let s = texto([dato.args[0]], dx, dy, T2.grande, 'start', acc);
    const tl = cortar(dato.args[1] || '', T2.cuerpo, 180);
    s += texto(tl, dx, dy + 24, T2.cuerpo);
    if (dato.args[2]) s += texto(cortar(dato.args[2], T.chico, 180), dx, dy + 30 + tl.length * T2.cuerpo.lh, T.chico);
    // leyenda
    const ly = dy + 80 + tl.length * T2.cuerpo.lh;
    s += punto(dx + 5, ly, 5, acc) + texto(['Fab Labs inscritos'], dx + 18, ly + 3.5, T.chico);
    s += `<circle cx="${dx + 5}" cy="${ly + 20}" r="4.5" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"/>` + texto(['Sin laboratorio'], dx + 18, ly + 23.5, T.chico);
    s += punto(dx + 5, ly + 40, 2.4) + texto(['Sin dato desagregado'], dx + 18, ly + 43.5, T.chico);
    s += asterisco(dx + 5, ly + 60, acc, 5) + texto(['Red NodoLab (piloto 2025)'], dx + 18, ly + 63.5, T.chico);
    svg += grupo('dato', s);
  }
  return { W, H, svg };
}

/* ───────────── Escala de desempeño ───────────── */
// rango 200 | 320 · umbral 292 | texto · punto valor | etiqueta | nota · brecha · nota texto | fuente
function escala(d) {
  const { W, H } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const [a, b] = (d.items.find(i => i.k === 'rango') || { args: [0, 100] }).args.map(Number);
  const m = 80, x0 = m, x1 = W - m, Y = H / 2 + 20;
  const X = v => x0 + (v - a) / (b - a) * (x1 - x0);
  let svg = '';
  let s = linea(x0, Y, x1, Y);
  const paso = (b - a) / 6;
  for (let v = a; v <= b + 0.01; v += paso) { s += linea(X(v), Y, X(v), Y + 6) + texto([String(Math.round(v))], X(v), Y + 20, T.chico, 'middle'); }
  svg += grupo('escala', s);
  const ps = d.items.filter(i => i.k === 'punto');
  ps.forEach((p, i) => {
    const v = +p.args[0], x = X(v);
    const resalta = i === ps.length - 1;
    let s = punto(x, Y, 6, resalta ? acc : TINTA);
    s += linea(x, Y - 10, x, Y - 46, true);
    s += texto([String(v)], x, Y - 56, T2.medio, 'middle', resalta ? acc : TINTA);
    s += texto([p.args[1] || ''], x, Y - (p.args[2] ? 104 : 90), T.titulo, 'middle');
    if (p.args[2]) s += texto([p.args[2]], x, Y - 88, T.meta, 'middle', GRIS);
    svg += grupo(`punto-${i + 1}`, s);
  });
  const um = d.items.find(i => i.k === 'umbral');
  if (um) {
    const x = X(+um.args[0]);
    svg += grupo('umbral', linea(x, Y + 28, x, Y + 64, true) + punto(x, Y + 64) + texto([um.args[1] || ''], x, Y + 80, T.meta, 'middle'));
  }
  if (d.items.find(i => i.k === 'brecha') && ps.length >= 2) {
    const v1 = +ps[0].args[0], v2 = +ps[1].args[0];
    const xa = X(Math.min(v1, v2)), xb = X(Math.max(v1, v2)), yb = Y + 44;
    const um2 = um ? X(+um.args[0]) : null;
    const libre = (um2 !== null && um2 >= xa - 1 && um2 <= xb + 1);
    const yy = libre ? Y + 110 : yb;
    let s = linea(xa, yy - 6, xa, yy + 6) + linea(xb, yy - 6, xb, yy + 6) + linea(xa, yy, xb, yy);
    s += texto([`${Math.abs(v1 - v2)} puntos de diferencia`], (xa + xb) / 2, yy + 20, T.titulo, 'middle', acc);
    svg += grupo('brecha', s);
  }
  const nota = d.items.find(i => i.k === 'nota');
  if (nota) svg += grupo('nota', texto([nota.args[0]], x0, 70, T.seccion, 'start', acc) + (nota.args[1] ? texto([nota.args[1]], x0, 88, T.chico) : ''));
  return { W, H, svg };
}

/* ───────────── Barra de tiempos (ritmo del taller) ───────────── */
// total 90 · modalidad Nombre | color · sesion Título | bajada · momento Nombre | min | modalidad
function tiempos(d) {
  const { W, H, doble } = lienzoDe(d, true);
  const total = +(d.items.find(i => i.k === 'total') || { args: [90] }).args[0];
  const mods = d.items.filter(i => i.k === 'modalidad');
  const colorMod = Object.fromEntries(mods.map(mm => [mm.args[0].toLowerCase(), colorDe(mm.args[1], TINTA)]));
  const ses = d.items.filter(i => i.k === 'sesion');
  const m = doble ? 90 : 50, etW = 120;
  const x0 = m + etW, x1 = W - m;
  const hueco = doble ? 36 : 0;                                   // la costura no lleva barra
  const util = x1 - x0 - hueco;
  const X = t => { const x = x0 + t / total * util; return doble && x > PAG.w - hueco / 2 ? x + hueco : x; };
  const est = { fam: F.reg, size: tamT(8.6), lh: lhT(10.6) };
  // medir alto de cada fila
  const filas = ses.map(se => {
    let t = 0;
    const ms = se.hijos.filter(h => h.k === 'momento').map(h => {
      const min = +h.args[1], a = X(t), b = X(t + min); t += min;
      // si el tramo cruza la costura se parte en dos y el texto va en el trozo más largo
      let trozos = [[a, b]];
      if (doble && a < PAG.w && b > PAG.w) trozos = [[a, PAG.w - hueco / 2], [PAG.w + hueco / 2, b]];
      const [ta, tb] = trozos.reduce((p, q) => (q[1] - q[0] > p[1] - p[0] ? q : p));
      const ls = cortar(h.args[0], est, tb - ta - 6);
      return { h, min, a, b, ta, tb, trozos, ls, mod: (h.args[2] || '').toLowerCase() };
    });
    const alto = 24 + Math.max(...ms.map(mm => mm.ls.length)) * est.lh + 16;
    return { se, ms, alto };
  });
  const altoTot = filas.reduce((s2, f) => s2 + f.alto + 26, 0) + 60;
  let y = Math.max(96, (H - altoTot) / 2 + 30);
  let svg = '';
  // leyenda arriba
  let L = '', lx = x0;
  mods.forEach(mm => {
    const c = colorDe(mm.args[1], TINTA);
    L += `<line x1="${r2(lx)}" y1="${r2(y - 52)}" x2="${r2(lx + 22)}" y2="${r2(y - 52)}" stroke="${c}" stroke-width="6"/>` + texto([mm.args[0]], lx + 30, y - 48.5, T.meta);
    lx += 30 + ancho(mm.args[0], T.meta.fam, T.meta.size) + 28;
  });
  svg += grupo('leyenda', L);
  filas.forEach((f, i) => {
    let s = texto([f.se.args[0]], x0 - 20, y + 3, T.titulo, 'end');
    if (f.se.args[1]) s += texto([f.se.args[1]], x0 - 20, y + 17, T.meta, 'end', GRIS);
    f.ms.forEach((mm, j) => {
      const c = colorMod[mm.mod] || TINTA;
      mm.trozos.forEach(([a, b]) => { s += `<line x1="${r2(a + 1.2)}" y1="${r2(y)}" x2="${r2(b - 1.2)}" y2="${r2(y)}" stroke="${c}" stroke-width="7"/>`; });
      s += texto([`${String(j + 1).padStart(2, '0')} · ${mm.min}'`], mm.ta + 3, y - 9, T.chico);
      s += texto(mm.ls, mm.ta + 3, y + 18, est);
    });
    svg += grupo(`sesion-${i + 1}`, s);
    y += f.alto + 26;
  });
  // escala de minutos
  let e = '';
  for (let t = 0; t <= total; t += 15) e += linea(X(t), y - 8, X(t), y - 2) + texto([`${t}'`], X(t), y + 10, T.chico, 'middle');
  const ejeMin = doble ? linea(x0, y - 8, PAG.w - hueco / 2, y - 8) + linea(PAG.w + hueco / 2, y - 8, x1, y - 8) : linea(x0, y - 8, x1, y - 8);
  svg += grupo('minutos', ejeMin + e);
  return { W, H, svg };
}

/* ───────────── Flujo (software → máquina) ───────────── */
// etapas A | B | C | D    ·    ruta a | b | c | resultado
function flujo(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const et = (d.items.find(i => i.k === 'etapas') || { args: [] }).args;
  const rutas = d.items.filter(i => i.k === 'ruta');
  const nc = Math.max(et.length, ...rutas.map(r => r.args.length));
  const m = doble ? 110 : 54;
  // ancho de cada columna según su texto más largo
  const anchos = Array.from({ length: nc }, (_, j) => {
    const ult = j === nc - 1;
    return Math.max(ancho(et[j] || '', T.seccion.fam, T.seccion.size), ...rutas.map(r => ult ? anchoMax(cortar(r.args[j] || '', T.meta, 150), T.meta) : ancho(r.args[j] || '', T.titulo.fam, T.titulo.size) + 12));
  });
  const libre = (W - 2 * m - anchos.reduce((a, b) => a + b, 0)) / (nc - 1);
  const xs = []; let xx = m;
  anchos.forEach(a => { xs.push(xx); xx += a + libre; });
  const filaH = 64, y0 = Math.max(130, (H - rutas.length * filaH) / 2 + 20);
  let svg = grupo('etapas', et.map((e, j) => texto([e], xs[j], y0 - 44, T.seccion, 'start', acc)).join(''));
  rutas.forEach((r, i) => {
    const y = y0 + i * filaH;
    let s = '', fin = null;
    for (let j = 0; j < nc; j++) {
      const v = r.args[j] || '';
      if (!v) continue;
      const ult = j === nc - 1;
      if (fin !== null) s += linea(fin, y, xs[j] - 10, y) + flecha(xs[j] - 9, y, 0);
      if (ult) {
        const ls = cortar(v, T.meta, 150);
        s += texto(ls, xs[j], y + 3.4 - (ls.length - 1) * T.meta.lh / 2, T.meta, 'start', GRIS);
        fin = null;
      } else {
        s += punto(xs[j] + 3, y, 3);
        s += texto([v], xs[j] + 12, y + 4, T.titulo);
        fin = xs[j] + 12 + ancho(v, T.titulo.fam, T.titulo.size) + 10;
      }
    }
    svg += grupo(`ruta-${i + 1}`, s);
  });
  return { W, H, svg };
}

/* ───────────── Antes / después ───────────── */
// antes Título | bajada · despues Título | bajada · par izquierda | derecha
function antesDespues(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const an = d.items.find(i => i.k === 'antes'), de = d.items.find(i => i.k === 'despues');
  const pares = d.items.filter(i => i.k === 'par');
  const mid = W / 2, colW = Math.min(doble ? 320 : 240, mid - 110);
  const pl = pares.map(p => [cortar(p.args[0], T2.cuerpo, colW), cortar(p.args[1] || '', T2.cuerpo, colW)]);
  const altos = pl.map(([a, b]) => Math.max(a.length, b.length) * T2.cuerpo.lh);
  const altoTot = 70 + altos.reduce((s2, h) => s2 + h + 30, 0);
  let y = Math.max(80, (H - altoTot) / 2 + 20);
  let svg = '';
  const cab = (item, x, alin, meta) => item ? dosNiveles(x, y, meta, item.args[0], acc, colW, alin).svg + (item.args[1] ? texto([item.args[1]], x, y + 34, T.chico, alin) : '') : '';
  svg += grupo('encabezados', cab(an, mid - 40, 'end', d.props.prefijo ? 'Antes' : 'Antes') + cab(de, mid + 40, 'start', 'Después'));
  y += 70;
  let eje = '', prev = y - 24;
  pl.forEach(([a, b], i) => {
    const h = altos[i], yc = y + h / 2 - 4;
    let s = texto(a, mid - 40, y, T2.cuerpo, 'end');
    s += texto(b, mid + 40, y, T2.cuerpo, 'start');
    s += linea(mid - 30, yc, mid + 24, yc) + flecha(mid + 30, yc, 0);
    eje += linea(mid, prev, mid, yc - 8, true);
    prev = yc + 8;
    svg += grupo(`par-${i + 1}`, s);
    y += h + 30;
  });
  eje += linea(mid, prev, mid, y - 14, true);
  svg += grupo('eje', eje);
  return { W, H, svg };
}

/* ───────────── Anillos concéntricos ───────────── */
// anillo Nombre | bajada | directo · indirecto
function anillos(d) {
  const { W, H } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const as = d.items.filter(i => i.k === 'anillo');
  const n = as.length, r0 = 58, dr = Math.min(64, (H / 2 - 40 - r0) / Math.max(1, n - 1));
  const cx = W / 2 - 70, cy = H / 2 + 6;
  let svg = '';
  as.forEach((a, i) => {
    const r = r0 + i * dr, ri = i ? r0 + (i - 1) * dr : 0;
    const indirecto = /indirect/i.test(a.args[2] || '');
    let s = `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="none" stroke="${TINTA}" stroke-width="${LINEA}"${indirecto ? ` stroke-dasharray="${PUNTEADA}"` : ''}/>`;
    if (i === 0) {
      const tl = cortar(a.args[0], T.titulo, r * 1.5), dl = a.args[1] ? cortar(a.args[1], T.chico, r * 1.5) : [];
      const h = tl.length * T.titulo.lh + dl.length * T.chico.lh;
      let y = cy - h / 2 + T.titulo.size * 0.8;
      s += texto(tl, cx, y, T.titulo, 'middle', acc) + texto(dl, cx, y + tl.length * T.titulo.lh, T.chico, 'middle');
    } else {
      // texto en la franja superior, ajustado al ancho que deja el arco
      const est = { ...T.titulo, size: tamT(10.5), lh: lhT(12.5) };
      let w = 2 * r * 0.75, tl, dl, h;
      for (let k = 0; k < 12; k++) {
        tl = cortar(a.args[0], est, w); dl = a.args[1] ? cortar(a.args[1], T.chico, w) : [];
        h = tl.length * est.lh + dl.length * T.chico.lh;
        const yTop = (r + ri) / 2 + h / 2 + 2;            // distancia al centro del borde superior del bloque
        const cuerda = 2 * Math.sqrt(Math.max(0, r * r - yTop * yTop)) - 14;
        if (Math.max(anchoMax(tl, est), anchoMax(dl, T.chico)) <= cuerda && (r + ri) / 2 - h / 2 > ri + 4) break;
        w *= 0.88;
      }
      let y = cy - (r + ri) / 2 - h / 2 + est.size * 0.8;
      s += texto(tl, cx, y, est, 'middle') + texto(dl, cx, y + tl.length * est.lh, T.chico, 'middle');
    }
    svg += grupo(`anillo-${i + 1}`, s);
  });
  const lx = cx + r0 + (n - 1) * dr + 50, ly = cy - 20;
  svg += grupo('leyenda',
    linea(lx, ly, lx + 26, ly) + texto(['Usuarios directos'], lx + 36, ly + 3.5, T.meta) +
    linea(lx, ly + 22, lx + 26, ly + 22, true) + texto(['Usuarios indirectos'], lx + 36, ly + 25.5, T.meta));
  return { W, H, svg };
}

/* ───────────── Dato comparado ───────────── */
// valor Cifra | año | texto · nota Texto | fuente
function datoComparado(d) {
  const { W, H } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rojo);
  const vs = d.items.filter(i => i.k === 'valor');
  const nota = d.items.find(i => i.k === 'nota');
  const Y = H / 2 + 10, xs = repartir(vs.length, 150, W - 150);
  let svg = '';
  let l = '';
  for (let i = 0; i < vs.length - 1; i++) l += linea(xs[i] + 12, Y, xs[i + 1] - 14, Y) + flecha(xs[i + 1] - 13, Y, 0);
  svg += grupo('linea', l);
  vs.forEach((v, i) => {
    const ult = i === vs.length - 1;
    let s = punto(xs[i], Y, 6, ult ? acc : TINTA);
    s += texto([v.args[0]], xs[i], Y - 26, T2.grande, 'middle', ult ? acc : TINTA);
    s += texto([v.args[1] || ''], xs[i], Y + 28, T.titulo, 'middle');
    if (v.args[2]) s += texto(cortar(v.args[2], T.meta, 180), xs[i], Y + 44, T.meta, 'middle', GRIS);
    svg += grupo(`valor-${i + 1}`, s);
  });
  if (nota) {
    const tl = cortar(nota.args[0], T.seccion, W - 200);
    svg += grupo('nota', texto(tl, W / 2, 110, T.seccion, 'middle', acc) + (nota.args[1] ? texto([nota.args[1]], W / 2, 112 + tl.length * T.seccion.lh, T.chico, 'middle') : ''));
  }
  return { W, H, svg };
}

/* ───────────── Rejilla de bloques (FODA, preguntas, Canvas) ───────────── */
// columnas 2 · bloque Título | ancho (1–2) · - Negrita: texto · texto libre con "texto"
function rejilla(d) {
  const { W, H, doble } = lienzoDe(d, false);
  const acc = colorDe(d.props.color, PAL.rosado);
  const nc = +(d.props.columnas || 2);
  const bs = d.items.filter(i => i.k === 'cuadrante' || i.k === 'bloque');
  const mx = doble ? 80 : (nc > 3 ? 40 : 60);
  const cw = (W - 2 * mx) / nc;
  // bordes de columna; en pliego, la costura siempre es un borde
  const k1 = Math.ceil(nc / 2);
  const bordes = !doble ? Array.from({ length: nc + 1 }, (_, j) => mx + j * cw)
    : [...Array.from({ length: k1 }, (_, j) => mx + j * (PAG.w - mx) / k1), ...Array.from({ length: nc - k1 + 1 }, (_, j) => PAG.w + j * (W - mx - PAG.w) / (nc - k1))];
  const est = { fam: F.reg, size: doble ? 9.6 : 10, lh: doble ? 12.6 : 13.2 }, estB = { fam: F.semi };
  // ubicar bloques en filas (cada bloque ocupa 1 o más columnas)
  const filas = [[]]; let usado = 0;
  bs.forEach(b => {
    const span = Math.min(nc, +(b.args[1] || 1) || 1);
    if (usado + span > nc) { filas.push([]); usado = 0; }
    filas[filas.length - 1].push({ b, col: usado, span }); usado += span;
  });
  const cuerpo = (b, w) => {
    const tl = cortar(b.args[0], T.seccion, w);           // el título se corta si no cabe en la columna
    let alto = 30 + (tl.length - 1) * T.seccion.lh, parts = [];
    b.hijos.forEach(h => {
      if (h.k === '-' || h.k === '*') { const mm = textoMixto(h.args.join(' | '), 0, 0, w - 12, est, estB); alto += mm.alto + 7; parts.push(['-', h]); }
      else if (h.k === 'texto') { const ls = cortar(h.args.join(' | '), est, w); alto += ls.length * est.lh + 7; parts.push(['t', ls]); }
    });
    return { alto, parts, tl };
  };
  filas.forEach(f => f.forEach(c => { c.w = bordes[c.col + c.span] - bordes[c.col] - 40; c.m = cuerpo(c.b, c.w); }));
  const altosF = filas.map(f => Math.max(...f.map(c => c.m.alto)) + 34);
  const totalH = altosF.reduce((a, b) => a + b, 0);
  let y = Math.max(50, (H - totalH) / 2);
  let svg = '', lineas = '';
  filas.forEach((f, fi) => {
    const hF = altosF[fi];
    if (fi > 0) lineas += linea(mx, y, W - mx, y, true);
    f.forEach((c, ci) => {
      const x = bordes[c.col] + 20;
      if (c.col > 0) lineas += linea(bordes[c.col], y + (fi > 0 ? 6 : 0), bordes[c.col], y + hF - (fi < filas.length - 1 ? 6 : 0), true);
      let s = texto(c.m.tl, x, y + 26, T.seccion, 'start', acc);
      let yy = y + 26 + (c.m.tl.length - 1) * T.seccion.lh + 26;
      c.m.parts.forEach(([k, v]) => {
        if (k === '-') {
          s += punto(x + 2, yy - 3.4, 1.3);
          const mm = textoMixto(v.args.join(' | '), x + 12, yy, c.w - 12, est, estB);
          s += mm.svg; yy += mm.alto + 7;
        } else { s += texto(v, x, yy, est); yy += v.length * est.lh + 7; }
      });
      svg += grupo(`bloque-${fi + 1}-${ci + 1}`, s);
    });
    y += hF;
  });
  svg = grupo('rejilla', lineas) + svg;
  return { W, H, svg };
}

/* ───────────── Registro ───────────── */
Object.assign(PLANTILLAS, {
  linea:     { nombre: 'Línea de tiempo', fn: lineaTiempo, archivo: 'linea-tiempo', ayuda: `color rojo\nhito Año | texto | cita` },
  arbol:     { nombre: 'Árbol (uno a varios)', fn: arbol, archivo: 'arbol', ayuda: `color rojo · prefijo Específico\nraiz Etiqueta | texto\nhijo Título | texto | vínculo con asterisco` },
  tablaT:    { nombre: 'Tabla en T', fn: tablaT, archivo: 'tabla-t', ayuda: `titulo Texto sobre la T (opcional)\ncolumna Título\n  - Negrita: texto\n  * punto con asterisco` },
  matriz:    { nombre: 'Matriz de puntos', fn: matriz, archivo: 'matriz', ayuda: `encabezado A | B | C\nfila Nombre | si | no | ~ | ?\n  si = punto · no = círculo · ~ = en parte · ? = sin dato\nfila Nombre * (resalta la fila)` },
  ciclo:     { nombre: 'Ciclo', fn: ciclo, archivo: 'ciclo', ayuda: `centro Título | cita\npaso Nombre | descripción` },
  cadena:    { nombre: 'Cadena', fn: cadena, archivo: 'cadena', ayuda: `prefijo 01 (o "no")\neslabon Nombre | texto` },
  territorio:{ nombre: 'Territorio (norte a sur)', fn: territorio, archivo: 'territorio', ayuda: `region Nombre | cantidad (vacío = sin dato) | nota con asterisco\ndato Cifra | texto | fuente` },
  escala:    { nombre: 'Escala de desempeño', fn: escala, archivo: 'escala', ayuda: `rango 200 | 320\npunto valor | etiqueta | nivel\numbral valor | texto\nbrecha\nnota Título | fuente` },
  tiempos:   { nombre: 'Barra de tiempos', fn: tiempos, archivo: 'tiempos', ayuda: `total 90\nmodalidad Nombre | color\nsesion Título | bajada\n  momento Nombre | minutos | modalidad` },
  flujo:     { nombre: 'Flujo', fn: flujo, archivo: 'flujo', ayuda: `etapas A | B | C | Resultado\nruta a | b | c | resultado  (deja vacío para saltar)` },
  antes:     { nombre: 'Antes / después', fn: antesDespues, archivo: 'antes-despues', ayuda: `antes Título | bajada\ndespues Título | bajada\npar texto antes | texto después` },
  anillos:   { nombre: 'Anillos', fn: anillos, archivo: 'anillos', ayuda: `anillo Nombre | bajada | directo · indirecto\n(el primero va al centro)` },
  dato:      { nombre: 'Dato comparado', fn: datoComparado, archivo: 'dato', ayuda: `valor Cifra | año | texto\nnota Título | fuente` },
});
PLANTILLAS.cuadrantes.fn = rejilla;
PLANTILLAS.cuadrantes.nombre = 'Bloques (FODA, Canvas)';
PLANTILLAS.cuadrantes.ayuda = `color rosado\ncolumnas 2\nbloque Título | columnas que ocupa\n  - Negrita: texto\n  texto párrafo libre`;
