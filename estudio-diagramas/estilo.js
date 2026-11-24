// Panel de estilo: permite variar colores y lineamientos gráficos sin salirse del lenguaje de Milla.
// El estilo se aplica ANTES de dibujar (cambia las constantes del motor), así cada plantilla mide
// y ubica todo con los valores nuevos y el revisor de superposiciones sigue siendo válido.

// Lineamientos originales de la memoria (lo que se restablece).
const MILLA = {
  acento: '',                 // '' = el color que dice el texto de cada diagrama
  modo: 'color',              // color | monocromo
  paleta: { ...PAL },
  tinta: TINTA,
  gris: GRIS,
  linea: LINEA,
  punteada: PUNTEADA,
  punto: PUNTO,
  asterisco: AST,
  texto: 1,                   // escala del tamaño de texto
  interlineado: 1,
  pesoTitulo: 'semi',         // med | semi | bold
};
// Opciones acotadas: variaciones que siguen el lenguaje (trazo fino, punteado corto, punto chico).
const OPCIONES = {
  linea: [[0.5, '0,5'], [0.75, '0,75'], [1, '1'], [1.25, '1,25']],
  punteada: [['3 2.5', 'Milla'], ['2 2', 'Corto'], ['0.8 2', 'Puntos'], ['6 3', 'Largo']],
  pesoTitulo: [['med', 'Medium'], ['semi', 'SemiBold'], ['bold', 'Bold']],
  modo: [['color', 'Color'], ['monocromo', 'Solo tinta']],
};
const NOMBRES_COLOR = { rosado: 'Rosado', azul: 'Azul', rojo: 'Rojo', verde: 'Verde', amarillo: 'Amarillo' };

// Copia de los estilos de texto originales para escalar siempre desde la base.
const copiar = o => JSON.parse(JSON.stringify(o));
const BASE_T = copiar(T), BASE_T2 = copiar(T2);

// Junta el estilo de Milla + el estilo general + el del diagrama.
function estiloFinal(...capas) {
  const e = copiar(MILLA);
  capas.filter(Boolean).forEach(c => { Object.entries(c).forEach(([k, v]) => { if (k === 'paleta') Object.assign(e.paleta, v); else e[k] = v; }); });
  return e;
}
// Diferencias respecto de Milla (lo que se guarda).
function diferencias(e) {
  const out = {};
  for (const k of Object.keys(MILLA)) {
    if (k === 'paleta') {
      const p = Object.fromEntries(Object.entries(e.paleta).filter(([c, v]) => v.toLowerCase() !== MILLA.paleta[c].toLowerCase()));
      if (Object.keys(p).length) out.paleta = p;
    } else if (String(e[k]) !== String(MILLA[k])) out[k] = e[k];
  }
  return out;
}

function aplicarEstilo(e) {
  TINTA = e.tinta; GRIS = e.gris; ESC_T = +e.texto; ESC_L = +e.interlineado;
  LINEA = +e.linea; PUNTEADA = e.punteada; PUNTO = +e.punto; AST = +e.asterisco;
  for (const c of Object.keys(PAL)) PAL[c] = e.modo === 'monocromo' ? e.tinta : e.paleta[c];
  const escalar = (dest, base) => {
    for (const [k, b] of Object.entries(base)) {
      const s = dest[k];
      s.size = Math.round(b.size * e.texto * 100) / 100;
      s.lh = Math.round(b.lh * e.texto * e.interlineado * 100) / 100;
      if (b.fill === MILLA.tinta) s.fill = e.tinta;
      else if (b.fill === MILLA.gris) s.fill = e.gris;
    }
  };
  escalar(T, BASE_T); escalar(T2, BASE_T2);
  T.titulo.fam = F[e.pesoTitulo] || F.semi;
}
