// Fuentes. Neutrif Studio tiene licencia y NO se publica: en la web, la página la toma
// del computador de quien la usa (con permiso del navegador) o de archivos que elija.
// En local, si existe fuentes.js, se usa directo.
window.FUENTES = window.FUENTES || {};
const NEUTRIF = ['NeutrifStudio-Regular', 'NeutrifStudio-Medium', 'NeutrifStudio-SemiBold', 'NeutrifStudio-Bold'];
const NEUTRIF_CURSIVAS = ['NeutrifStudio-RegularItalic', 'NeutrifStudio-MediumItalic'];

function aBase64(buf) {
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
const faltan = () => NEUTRIF.filter(n => !FUENTES[n]);
const guardarFuente = (n, b64) => { FUENTES[n] = b64; try { localStorage.setItem('aulamaker:fuente:' + n, b64); } catch (e) {} };

// Reconoce el estilo por el nombre del archivo (p. ej. "NeutrifStudio-SemiBold.otf", "Neutrif Studio Medium Italic.ttf").
function estiloPorNombre(nombre) {
  const n = nombre.toLowerCase().replace(/\.(ttf|otf|woff2?)$/, '').replace(/[\s_-]/g, '');
  if (!n.includes('neutrif')) return null;
  const it = n.includes('italic');
  if (n.includes('semibold')) return it ? null : 'NeutrifStudio-SemiBold';
  if (n.includes('bold')) return it ? null : 'NeutrifStudio-Bold';
  if (n.includes('medium')) return it ? 'NeutrifStudio-MediumItalic' : 'NeutrifStudio-Medium';
  if (n.includes('regular') || n.endsWith('studio') || it) return it ? 'NeutrifStudio-RegularItalic' : 'NeutrifStudio-Regular';
  return null;
}

// Opción 1: leerlas directo de las fuentes instaladas (Chrome/Edge, pide permiso una vez).
async function desdeElComputador() {
  const fs = await window.queryLocalFonts();
  for (const f of fs) {
    if ([...NEUTRIF, ...NEUTRIF_CURSIVAS].includes(f.postscriptName)) guardarFuente(f.postscriptName, aBase64(await (await f.blob()).arrayBuffer()));
  }
}
// Opción 2: elegir los archivos .ttf / .otf.
async function desdeArchivos(files) {
  for (const f of files) { const n = estiloPorNombre(f.name); if (n) guardarFuente(n, aBase64(await f.arrayBuffer())); }
}

function pedirFuentes() {
  return new Promise(listo => {
    const capa = document.createElement('div');
    capa.id = 'pedirFuentes';
    const puede = 'queryLocalFonts' in window;
    capa.innerHTML = `<div class="tarjeta">
      <h2>Falta la tipografía</h2>
      <p>Los diagramas usan <b>Neutrif Studio</b>, que tiene licencia y por eso no viene con la página.
      Si la tienes instalada, la página la toma de tu computador. No se sube a ningún lado: queda guardada solo en este navegador.</p>
      ${puede ? '<button class="principal" id="fLocal">Usar Neutrif de este computador</button>' : ''}
      <label class="boton">Elegir archivos de Neutrif (.ttf / .otf)<input type="file" id="fArch" accept=".ttf,.otf" multiple hidden></label>
      <p class="estadoF" id="fEstado">${puede ? 'El navegador te va a pedir permiso para ver tus fuentes.' : 'Abre la página en Chrome para tomarla directo del computador, o elige los archivos.'}</p>
    </div>`;
    document.body.appendChild(capa);
    const estado = capa.querySelector('#fEstado');
    const revisar = () => {
      const f = faltan();
      if (!f.length) { capa.remove(); listo(); }
      else estado.textContent = `No encontré: ${f.map(n => n.replace('NeutrifStudio-', '')).join(', ')}. Revisa que esté instalada, o elige esos archivos.`;
    };
    const b = capa.querySelector('#fLocal');
    if (b) b.onclick = async () => {
      estado.textContent = 'Buscando…';
      try { await desdeElComputador(); } catch (e) { estado.textContent = 'No se pudo leer las fuentes (' + e.message + '). Elige los archivos.'; return; }
      revisar();
    };
    capa.querySelector('#fArch').onchange = async e => { await desdeArchivos(e.target.files); revisar(); };
  });
}

async function cargarFuentes() {
  for (const n of [...NEUTRIF, ...NEUTRIF_CURSIVAS]) if (!FUENTES[n]) { try { const b = localStorage.getItem('aulamaker:fuente:' + n); if (b) FUENTES[n] = b; } catch (e) {} }
  if (!FUENTES['RobotoMono-Regular']) { try { FUENTES['RobotoMono-Regular'] = aBase64(await (await fetch('fuentes/RobotoMono.ttf')).arrayBuffer()); } catch (e) {} }
  if (faltan().length) await pedirFuentes();
  for (const [k, b] of Object.entries(fuentesTodas())) {
    if (!b) continue;
    const f = new FontFace(k, Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer);
    await f.load(); document.fonts.add(f);
  }
}
