// QuickDeck - renderer
const $ = (s) => document.querySelector(s);
const qEl = $('#q'), deckEl = $('#deck'), resEl = $('#results'), tabsEl = $('#tabs');

const COLORS = ['#7c5cff', '#3b82f6', '#0ea5e9', '#10b981', '#22c55e', '#f5a524', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#64748b', '#1f2937'];
const EMOJIS = ['📁', '💻', '🌐', '🎮', '🎵', '🎬', '📷', '💬', '📧', '📝', '📊', '⚙️', '🔒', '🔍', '⭐', '🚀', '🛒', '💡', '🧮', '📅', '🎧', '🖨️', '☁️', '🏠', '🔥', '🎙️', '📺', '🕹️'];
const FX = ['none', 'shine', 'pulse', 'rainbow', 'breathe', 'float', 'flow', 'glitch'];

let cfg, apps = [], page = 0, editing = false;
let sel = 0;                 // selected index (deck or results)
let results = [];
let dragFrom = null;
let themes = [], theme = null;

// ---------- language ----------
const lang = () => (cfg && cfg.lang === 'he' ? 'he' : 'en');
const L = () => window.I18N[lang()];
function t(key, vars) {
  let s = L()[key] ?? window.I18N.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
const tr = (v) => (Array.isArray(v) ? (lang() === 'he' ? v[1] : v[0]) : v); // [en, he] pairs
const isRtl = () => L().dir === 'rtl';
function applyLang() {
  document.documentElement.lang = lang();
  document.documentElement.dir = L().dir;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
}
const themeName = (th) => (lang() === 'he' && th.nameHe) ? th.nameHe : th.name;
const themeDesc = (th) => (lang() === 'he' && th.descriptionHe) ? th.descriptionHe : (th.description || '');

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const safeUrl = (u) => /^(qd-media:|https:|data:image\/|data:video\/)/i.test(String(u || '')) ? String(u) : '';
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
}
const slots = () => cfg.cols * cfg.rows;
function normalize() {
  cfg.pages.forEach(p => {
    p.tiles = p.tiles || [];
    while (p.tiles.length < slots()) p.tiles.push(null);
  });
  if (page >= cfg.pages.length) page = 0;
}
const curTiles = () => cfg.pages[page].tiles;
async function persist() { await window.qd.saveConfig(cfg); }
function applyAccent() { document.documentElement.style.setProperty('--accent', cfg.accent); }

// in-app confirm: native confirm() takes focus away and the window hides itself
function askConfirm(text, title = t('confirmDelete'), yes = t('del')) {
  return new Promise((resolve) => {
    $('#askTitle').textContent = title; $('#askText').textContent = text; $('#askYes').textContent = yes;
    const m = $('#askModal'); m.classList.remove('hidden'); window.qd.pin(true);
    const done = (v) => {
      m.classList.add('hidden'); $('#askYes').onclick = $('#askNo').onclick = null; askConfirm.pending = null;
      if (['#tileModal', '#setModal', '#themeModal'].every(s => $(s).classList.contains('hidden'))) window.qd.pin(false);
      qEl.focus(); resolve(v);
    };
    askConfirm.pending = done;
    $('#askYes').onclick = () => done(true);
    $('#askNo').onclick = () => done(false);
    $('#askYes').focus();
  });
}

function mediaTag(m, cls) {
  const src = safeUrl(m && m.src);
  if (!src) return '';
  return m.kind === 'video'
    ? `<video class="${cls}" src="${esc(src)}" autoplay muted loop playsinline></video>`
    : `<img class="${cls}" src="${esc(src)}" alt="">`;
}

async function iconHtml(item) {
  if (item.media && item.media.mode === 'icon') return mediaTag(item.media, '');
  if (item.noIcon) return '';
  if (item.icon) return esc(item.icon);
  if (item.type === 'app' || item.type === 'folder' || !item.type) {
    const url = await window.qd.icon(item.target || item.path);
    if (url) return `<img src="${url}" alt="">`;
  }
  return item.type === 'folder' ? '📁' : item.type === 'url' ? '🌐' : item.type === 'command' ? '⚡' : '📄';
}

// builds the inner HTML of a key (screen + media + icon + label)
function keyInner(item) {
  const cover = item.media && item.media.mode !== 'icon' ? mediaTag(item.media, 'media') : '';
  return `<div class="screen">${cover}<div class="ico${item.media && item.media.mode === 'icon' ? ' big' : ''}"></div><div class="lbl">${esc(item.label || t('untitled'))}</div></div>`;
}
function keyClasses(item) {
  const fx = item.fx || (theme && theme.keys && theme.keys.effect) || 'none';
  return ['fx-' + (FX.includes(fx) ? fx : 'none'),
    item.media && item.media.mode !== 'icon' && safeUrl(item.media.src) ? 'has-media' : '',
    item.hideLabel ? 'no-label' : ''].filter(Boolean).join(' ');
}

// ---------- themes ----------
function cssUrl(u) { return `url("${String(u).replace(/["\\\n]/g, '')}")`; }
function svgUrl(svg) { return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}")`; }
function bgKind(b) {
  if (!b) return 'css';
  const v = String(b.value || b.src || '');
  if (b.type) return b.type;
  if (/^\s*<svg/i.test(v)) return 'svg';
  if (/\.(mp4|webm|mov)(\?|$)/i.test(v)) return 'video';
  if (/^(https?:|qd-media:|data:image)/i.test(v) || /\.(gif|png|jpe?g|webp|avif|svg)$/i.test(v)) return 'image';
  return 'css';
}

function applyTheme() {
  theme = themes.find(x => x.id === cfg.theme) || themes.find(x => x.id === '1-classic') || themes[0] || {};
  const d = theme.device || {}, k = theme.keys || {};
  const root = document.documentElement.style;
  const set = (n, v) => (v === undefined || v === null || v === '') ? root.removeProperty(n) : root.setProperty(n, String(v));
  const px = (v) => (v === undefined || v === '' ? '' : (typeof v === 'number' ? v + 'px' : v));
  set('--text', theme.text);
  set('--dev-body', d.body); set('--dev-border', d.border); set('--dev-glow', d.glow); set('--dev-radius', px(d.radius)); set('--bezel', d.bezel);
  set('--key-radius', px(k.radius)); set('--key-gap', px(k.gap)); set('--key-bg', k.background); set('--key-border', k.border);
  set('--label-color', k.labelColor); set('--label-font', k.labelFont);
  set('--tint', k.tint !== undefined ? Math.max(0, Math.min(100, +k.tint || 0)) + '%' : '');

  // background: the user's own file wins over the theme's
  const b = cfg.customBg ? { type: cfg.customBg.kind === 'video' ? 'video' : 'image', value: cfg.customBg.src, effect: (theme.background || {}).effect } : (theme.background || {});
  const kind = bgKind(b), val = String(b.value || b.src || '');
  const bg = $('#bg'); bg.innerHTML = ''; bg.removeAttribute('style');
  let wall = 'none';
  if (kind === 'video' && safeUrl(val)) {
    bg.innerHTML = `<video src="${esc(safeUrl(val))}" autoplay muted loop playsinline></video>`;
  } else if (kind === 'image' && safeUrl(val)) {
    wall = cssUrl(safeUrl(val)); bg.style.backgroundImage = wall;
  } else if (kind === 'svg') {
    wall = svgUrl(val); bg.style.backgroundImage = wall;
  } else if (val) {
    bg.style.background = val;
    wall = /(gradient\(|url\()/i.test(val) ? val.replace(/,?\s*#[0-9a-f]{3,8}\s*$/i, '') : `linear-gradient(${val}, ${val})`;
  }
  if (b.fit === 'contain') bg.style.backgroundSize = 'contain';
  else if (b.fit === 'repeat') { bg.style.backgroundSize = 'auto'; bg.style.backgroundRepeat = 'repeat'; }
  else if (kind === 'image' || kind === 'svg') bg.style.backgroundSize = 'cover';
  if (b.opacity !== undefined) bg.style.opacity = b.opacity;
  if (b.blur) bg.style.filter = `blur(${+b.blur || 0}px)`;
  $('#bgOverlay').style.background = b.overlay || '';
  $('#bgFx').className = 'bgfx-' + (b.effect || 'none');
  set('--wall', wall);

  let mode = k.colorMode || 'tile';
  if (mode === 'wallpaper' && wall === 'none') mode = 'tile'; // a video can't be sliced across keys
  const cls = [...document.body.classList].filter(c => !/^(ks|cm|kp|kh|ke)-/.test(c));
  document.body.className = [...cls, 'ks-' + (k.style || 'lcd'), 'cm-' + mode, 'kp-' + (k.press || 'sink'), 'kh-' + (k.hover || 'lift'), 'ke-' + (k.empty || 'key')].join(' ');
  $('#themeCss').textContent = typeof theme.css === 'string' ? theme.css : '';
}

// wallpaper mode: every key shows its own slice of one big picture
function layoutWall() {
  if (!document.body.classList.contains('cm-wallpaper')) return;
  const base = deckEl.getBoundingClientRect();
  deckEl.querySelectorAll('.tile').forEach(el => {
    const s = el.querySelector('.screen'); if (!s) return;
    const r = s.getBoundingClientRect();
    s.style.setProperty('--ww', base.width + 'px'); s.style.setProperty('--wh', base.height + 'px');
    s.style.setProperty('--wx', (base.left - r.left) + 'px'); s.style.setProperty('--wy', (base.top - r.top) + 'px');
  });
}

// ---------- tabs ----------
function renderTabs() {
  tabsEl.innerHTML = '';
  cfg.pages.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'tab' + (i === page ? ' active' : '');
    b.innerHTML = `<span>${esc(p.name)}</span>` + (editing && cfg.pages.length > 1 ? `<span class="x" title="${esc(t('deletePageTitle'))}">✕</span>` : '');
    b.onclick = async (e) => {
      if (e.target.classList.contains('x')) {
        if (await askConfirm(t('askDeletePage', { p: p.name }))) {
          cfg.pages.splice(i, 1);
          if (page >= i && page > 0) page--;
          persist(); renderAll();
        }
        return;
      }
      page = i; sel = 0; renderAll();
    };
    b.ondblclick = () => renameTab(b, p);
    // drop a key on a tab = move it to that page
    b.ondragover = (e) => { if (dragFrom !== null && i !== page) e.preventDefault(); };
    b.ondrop = (e) => {
      e.preventDefault(); if (dragFrom === null) return;
      const empty = cfg.pages[i].tiles.indexOf(null);
      if (empty < 0) return toast(t('noSpace'));
      cfg.pages[i].tiles[empty] = curTiles()[dragFrom]; curTiles()[dragFrom] = null; dragFrom = null;
      persist(); renderDeck(); toast(t('movedTo', { p: cfg.pages[i].name }));
    };
    tabsEl.appendChild(b);
  });
  if (editing) {
    const add = document.createElement('button');
    add.className = 'tab add'; add.textContent = t('newPage');
    add.onclick = () => { cfg.pages.push({ id: uid(), name: t('pageN', { n: cfg.pages.length + 1 }), tiles: [] }); page = cfg.pages.length - 1; normalize(); persist(); renderAll(); };
    tabsEl.appendChild(add);
  }
}
function renameTab(b, p) {
  const inp = document.createElement('input'); inp.value = p.name;
  b.innerHTML = ''; b.appendChild(inp); inp.focus(); inp.select();
  const done = () => { p.name = inp.value.trim() || p.name; persist(); renderTabs(); qEl.focus(); };
  inp.onblur = done; inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = p.name; inp.blur(); } };
}

// ---------- deck ----------
const isMediaFile = (p) => /\.(gif|png|jpe?g|webp|apng|avif|svg|mp4|webm)$/i.test(p || '');

async function renderDeck() {
  deckEl.style.setProperty('--cols', cfg.cols);
  deckEl.style.setProperty('--rows', cfg.rows);
  deckEl.innerHTML = '';
  const tiles = curTiles().slice(0, slots());
  tiles.forEach((tile, i) => {
    const el = document.createElement('div');
    el.className = 'tile' + (tile ? ' ' + keyClasses(tile) : ' empty') + (i === sel && !qEl.value ? ' sel' : '');
    el.dataset.i = i;
    el.style.setProperty('--d', (-(i * 0.37) % 4).toFixed(2) + 's');
    if (tile) {
      el.style.setProperty('--c', tile.color || '#3b3b52');
      el.innerHTML = keyInner(tile);
      el.title = tile.target;
      iconHtml(tile).then(h => { const ico = el.querySelector('.ico'); if (ico) ico.innerHTML = h; });
    } else el.innerHTML = '<div class="screen"></div>';
    el.onclick = (e) => {
      if (editing) return openEditor(i);
      if (tile) runTile(tile, el, e);
    };
    el.oncontextmenu = (e) => { e.preventDefault(); openEditor(i); };
    // reorder (edit mode)
    el.draggable = editing && !!tile;
    el.ondragstart = (e) => { dragFrom = i; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
    el.ondragend = () => { dragFrom = null; el.classList.remove('dragging'); };
    el.ondragover = (e) => { e.preventDefault(); el.classList.add('drop'); };
    el.ondragleave = () => el.classList.remove('drop');
    el.ondrop = async (e) => {
      e.preventDefault(); e.stopPropagation(); el.classList.remove('drop');
      if (dragFrom !== null) {
        const arr = curTiles(); [arr[dragFrom], arr[i]] = [arr[i], arr[dragFrom]]; dragFrom = null;
        persist(); renderDeck(); return;
      }
      const f = e.dataTransfer.files[0]; if (!f) return;
      const p = window.qd.pathForFile(f);
      if (/\.qdtheme$/i.test(p)) return importThemeResult(await window.qd.importTheme(p));
      // a GIF / image / video dropped on an existing key becomes its live background
      if (tile && isMediaFile(p)) {
        const m = await window.qd.importMedia(p);
        if (m) { tile.media = { src: m.src, kind: m.kind, mode: 'cover' }; persist(); renderDeck(); toast(t('mediaSet')); }
        return;
      }
      addFromPath(p, i);
    };
    deckEl.appendChild(el);
  });
  requestAnimationFrame(layoutWall);
}

function addFromPath(p, i) {
  if (!p) return;
  const name = p.split('\\').pop().replace(/\.(lnk|exe|url|bat|cmd)$/i, '');
  const isFolder = !/\.[a-z0-9]{1,5}$/i.test(p);
  curTiles()[i] = { id: uid(), label: name, icon: '', color: COLORS[i % COLORS.length], type: isFolder ? 'folder' : 'app', target: p };
  persist(); renderDeck(); toast(t('added', { n: name }));
}

async function runTile(item, el, ev) {
  if (el) {
    el.classList.add('flash');
    if (document.body.classList.contains('kp-ripple')) {
      const s = el.querySelector('.screen'), r = s.getBoundingClientRect();
      const rp = document.createElement('span'); rp.className = 'ripple';
      rp.style.left = ((ev && ev.clientX ? ev.clientX : r.left + r.width / 2) - r.left) + 'px';
      rp.style.top = ((ev && ev.clientY ? ev.clientY : r.top + r.height / 2) - r.top) + 'px';
      s.appendChild(rp); setTimeout(() => rp.remove(), 600);
    }
  }
  // let the press animation show before the window hides
  await new Promise(r => setTimeout(r, el ? 140 : 0));
  const res = await window.qd.launch(item);
  if (!res.ok) toast(t('error', { e: res.error }));
  if (el) setTimeout(() => el.classList.remove('flash'), 350);
}

// ---------- search ----------
function score(name, q) {
  const n = name.toLowerCase(); q = q.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.split(/[\s\-_.]+/).some(w => w.startsWith(q))) return 65;
  if (n.includes(q)) return 50;
  // initials, e.g. "vsc" -> Visual Studio Code
  const ini = n.split(/[\s\-_.]+/).map(w => w[0]).join('');
  if (ini.startsWith(q)) return 45;
  let j = 0; for (const c of n) if (c === q[j]) j++;
  return j === q.length ? 20 : 0;
}
function highlight(name, q) {
  const i = name.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(name);
  return esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) + '</mark>' + esc(name.slice(i + q.length));
}
const looksUrl = (q) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(q) && !/\s/.test(q);
const looksPath = (q) => /^[a-z]:\\/i.test(q) || q.startsWith('\\\\');

function search(q) {
  q = q.trim();
  const out = [];
  if (looksPath(q)) out.push({ kind: t('kOpen'), name: q, sub: t('kOpenPath'), type: 'app', target: q, emoji: '📂' });
  if (looksUrl(q)) out.push({ kind: t('kSite'), name: q, sub: t('kOpenBrowser'), type: 'url', target: /^https?:/i.test(q) ? q : 'https://' + q, emoji: '🌐' });

  const tiles = [];
  cfg.pages.forEach(p => p.tiles.forEach(x => { if (x) { const s = score(x.label, q); if (s) tiles.push({ ...x, s, kind: t('kKey'), isKey: true, name: x.label, sub: p.name }); } }));
  tiles.sort((a, b) => b.s - a.s);

  const ap = [];
  for (const a of apps) { const s = score(a.name, q); if (s) ap.push({ kind: t('kApp'), name: a.name, sub: a.path, type: 'app', target: a.path, s }); }
  ap.sort((a, b) => b.s - a.s || a.name.length - b.name.length);

  out.push(...tiles.slice(0, 5), ...ap.slice(0, 30));
  out.push({ kind: t('kSearch'), name: t('searchGoogle', { q }), sub: 'google.com', type: 'url', target: 'https://www.google.com/search?q=' + encodeURIComponent(q), emoji: '🔍', noPin: true });
  return out;
}

async function renderResults() {
  const q = qEl.value.trim();
  results = search(q);
  if (sel >= results.length) sel = 0;
  resEl.innerHTML = '';
  results.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = 'res' + (i === sel ? ' sel' : '');
    el.innerHTML = `<div class="ri"></div><div class="rt"><div class="rn">${highlight(r.name, q)}</div><div class="rs">${esc(r.sub)}</div></div>`
      + (r.noPin || r.isKey ? '' : `<button class="pin">${esc(t('pin'))}</button>`)
      + `<span class="tag">${esc(r.kind)}</span>`;
    el.onclick = (e) => {
      if (e.target.classList.contains('pin')) { e.stopPropagation(); return pinResult(r); }
      runTile(r);
    };
    el.onmousemove = () => { if (sel !== i) { sel = i; markSel(); } };
    resEl.appendChild(el);
    const ri = el.querySelector('.ri');
    if (r.emoji) ri.textContent = r.emoji;
    else iconHtml({ ...r, media: null }).then(h => ri.innerHTML = h);
  });
}

function pinResult(r) {
  const i = curTiles().indexOf(null);
  if (i < 0) return toast(t('pageFull'));
  curTiles()[i] = { id: uid(), label: r.name.slice(0, 24), icon: '', color: COLORS[i % COLORS.length], type: r.type, target: r.target };
  persist(); toast(t('addedTo', { n: r.name, p: cfg.pages[page].name }));
}

function markSel() {
  const list = qEl.value ? resEl.children : deckEl.children;
  [...list].forEach((el, i) => el.classList.toggle('sel', i === sel));
  if (qEl.value) list[sel]?.scrollIntoView({ block: 'nearest' });
}

function renderAll() {
  normalize();
  document.body.classList.toggle('editing', editing);
  $('#editBtn').classList.toggle('on', editing);
  $('#editBanner').classList.toggle('hidden', !editing);
  $('#foot').classList.toggle('hidden', editing);
  $('#hotkeyHint').textContent = cfg.hotkey;
  const searching = !!qEl.value.trim();
  deckEl.classList.toggle('hidden', searching);
  resEl.classList.toggle('hidden', !searching);
  renderTabs();
  searching ? renderResults() : renderDeck();
}

// ---------- keyboard ----------
const anyOpen = (...ids) => ids.some(id => !$(id).classList.contains('hidden'));
qEl.addEventListener('input', () => { sel = 0; renderAll(); });
document.addEventListener('keydown', (e) => {
  if (askConfirm.pending) {
    if (e.key === 'Escape') askConfirm.pending(false);
    return;
  }
  if (anyOpen('#ideasModal')) {
    if (e.key === 'Escape') $('#ideasModal').classList.add('hidden');
    return;
  }
  if (anyOpen('#tileModal', '#setModal', '#themeModal')) {
    if (e.key === 'Escape') { if (anyOpen('#setModal')) { applyAccent(); } closeModals(); }
    return;
  }
  const searching = !!qEl.value.trim();
  if (e.ctrlKey && /^[1-9]$/.test(e.key)) { const p = +e.key - 1; if (cfg.pages[p]) { page = p; sel = 0; renderAll(); } e.preventDefault(); return; }
  if (e.ctrlKey && e.key.toLowerCase() === 'e') { toggleEdit(); e.preventDefault(); return; }
  if (e.key === 'Escape') {
    if (editing) toggleEdit();
    else if (qEl.value) { qEl.value = ''; sel = 0; renderAll(); }
    else window.qd.hide();
    return;
  }
  if (e.key === 'Tab') { e.preventDefault(); page = (page + (e.shiftKey ? cfg.pages.length - 1 : 1)) % cfg.pages.length; sel = 0; renderAll(); return; }
  if (searching) {
    if (e.key === 'ArrowDown') { sel = Math.min(results.length - 1, sel + 1); markSel(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); markSel(); e.preventDefault(); }
    else if (e.key === 'Enter') { if (results[sel]) runTile(results[sel]); }
    return;
  }
  const n = slots();
  const h = isRtl() ? 1 : -1;
  const moves = { ArrowLeft: h, ArrowRight: -h, ArrowDown: cfg.cols, ArrowUp: -cfg.cols };
  if (moves[e.key] !== undefined) {
    const nx = sel + moves[e.key];
    if (nx >= 0 && nx < n) { sel = nx; markSel(); }
    e.preventDefault();
  } else if (e.key === 'Enter') {
    const x = curTiles()[sel];
    if (editing) openEditor(sel); else if (x) runTile(x, deckEl.children[sel]);
  }
});

function toggleEdit() { editing = !editing; qEl.value = ''; renderAll(); qEl.focus(); }
$('#editBtn').onclick = toggleEdit;

// "ksp.co.il" -> "https://ksp.co.il" (also turns a typed domain into a website key)
function normalizeTarget(type, v) {
  v = (v || '').trim();
  const hasScheme = /^[a-z][\w+.-]*:(?!\d)/i.test(v) && !/^[a-z]:[\\/]/i.test(v);
  const isDomain = /^(www\.)?[\w\u0590-\u05FF-]+(\.[\w\u0590-\u05FF-]+)+(:\d+)?([/?#]\S*)?$/i.test(v);
  const isFile = /\.(exe|lnk|bat|cmd|msc|ps1|txt|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|mp[34]|zip|url)$/i.test(v);
  if (!hasScheme && isDomain && !isFile && !v.includes('\\')) return { type: 'url', target: 'https://' + v };
  return { type, target: v };
}

// ---------- key editor ----------
let edIndex = -1, ed = null, edPage = 0;
function renderPageSeg() {
  const box = $('#fPage'); box.innerHTML = '';
  cfg.pages.forEach((p, i) => {
    const b = document.createElement('button');
    b.textContent = p.name + (i === page ? ' ' + t('current') : '');
    b.classList.toggle('on', i === edPage);
    b.onclick = () => { edPage = i; renderPageSeg(); };
    box.appendChild(b);
  });
}
function openEditor(i) {
  edIndex = i; edPage = page;
  const x = curTiles()[i];
  ed = x ? JSON.parse(JSON.stringify(x)) : { id: uid(), label: '', icon: '', color: COLORS[i % COLORS.length], type: 'app', target: '' };
  $('#tileModalTitle').textContent = x ? t('editKey') : t('newKey');
  $('#tileDelete').style.visibility = x ? 'visible' : 'hidden';
  $('#fLabel').value = ed.label; $('#fTarget').value = ed.target; $('#fIcon').value = ed.icon || '';
  $('#fHideLabel').checked = !!ed.hideLabel;
  renderSeg(); renderPageSeg(); renderMediaSeg(); renderFxSeg();
  renderSwatches($('#swatches'), ed.color, (c) => { ed.color = c; updatePreview(); });
  updatePreview();
  window.qd.pin(true);
  $('#tileModal').classList.remove('hidden');
  $('#fLabel').focus();
}
function renderSeg() {
  [...$('#fType').children].forEach(b => b.classList.toggle('on', b.dataset.v === ed.type));
  const map = { app: ['tgApp', 'C:\\Program Files\\...\\app.exe'], folder: ['tgFolder', 'C:\\Users\\...'], url: ['tgUrl', 'example.com'], command: ['tgCommand', 'shutdown /s /t 0'] }[ed.type];
  $('#fTargetLabel').textContent = t(map[0]); $('#fTarget').placeholder = map[1];
  $('#fBrowse').style.display = (ed.type === 'app' || ed.type === 'folder') ? '' : 'none';
}
function renderMediaSeg() {
  const has = !!(ed.media && ed.media.src);
  [...$('#fMediaMode').children].forEach(b => b.classList.toggle('on', has && b.dataset.v === (ed.media.mode || 'cover')));
  $('#fMediaMode').style.display = has ? '' : 'none';
  $('#fMediaClear').style.display = has ? '' : 'none';
  $('#fMediaName').textContent = has ? (ed.media.name || (ed.media.kind === 'video' ? 'video' : 'image')) : t('mediaNone');
}
function renderFxSeg() { [...$('#fFx').children].forEach(b => b.classList.toggle('on', b.dataset.v === (ed.fx || ''))); }
$('#fType').onclick = (e) => { const v = e.target.dataset.v; if (v) { ed.type = v; renderSeg(); updatePreview(); } };
$('#fMediaMode').onclick = (e) => { const v = e.target.dataset.v; if (v && ed.media) { ed.media.mode = v; renderMediaSeg(); updatePreview(); } };
$('#fFx').onclick = (e) => { const v = e.target.dataset.v; if (v !== undefined) { ed.fx = v; renderFxSeg(); updatePreview(); } };
$('#fMediaPick').onclick = async () => {
  const m = await window.qd.pickMedia();
  if (!m) return;
  ed.media = { src: m.src, kind: m.kind, mode: (ed.media && ed.media.mode) || 'cover', name: m.name };
  renderMediaSeg(); updatePreview();
};
$('#fMediaClear').onclick = () => { delete ed.media; renderMediaSeg(); updatePreview(); };
$('#fHideLabel').onchange = () => { ed.hideLabel = $('#fHideLabel').checked; updatePreview(); };
function renderSwatches(box, current, onPick) {
  box.innerHTML = '';
  COLORS.forEach(c => {
    const s = document.createElement('div'); s.className = 'sw' + (c === current ? ' on' : ''); s.style.background = c;
    s.onclick = () => { onPick(c); [...box.querySelectorAll('.sw')].forEach(x => x.classList.toggle('on', x === s)); };
    box.appendChild(s);
  });
  const custom = document.createElement('input'); custom.type = 'color'; custom.className = 'sw-custom'; custom.value = current;
  custom.oninput = () => { onPick(custom.value); box.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); };
  box.appendChild(custom);
}
$('#emojiPick').innerHTML = EMOJIS.map(e => `<span>${e}</span>`).join('');
$('#emojiPick').onclick = (e) => { if (e.target.tagName === 'SPAN') { ed.icon = e.target.textContent; ed.noIcon = false; $('#fIcon').value = ed.icon; updatePreview(); } };
$('#fLabel').oninput = () => { ed.label = $('#fLabel').value; updatePreview(); };
$('#fIcon').onfocus = () => $('#fIcon').select();
$('#fIcon').oninput = () => {
  // keep only the last emoji/character typed so it replaces the old one
  const parts = [...new Intl.Segmenter().segment($('#fIcon').value)].map(s => s.segment);
  ed.icon = parts.length ? parts[parts.length - 1] : '';
  if (ed.icon !== $('#fIcon').value) $('#fIcon').value = ed.icon;
  ed.noIcon = false; updatePreview();
};
$('#fTarget').oninput = () => { ed.target = $('#fTarget').value.trim(); updatePreview(); };
$('#fUseFileIcon').onclick = () => { ed.icon = ''; ed.noIcon = false; $('#fIcon').value = ''; updatePreview(); };
$('#fNoIcon').onclick = () => { ed.icon = ''; ed.noIcon = true; $('#fIcon').value = ''; updatePreview(); };
$('#fBrowse').onclick = async () => {
  const p = await window.qd.pick(ed.type === 'folder' ? 'folder' : 'file');
  if (!p) return;
  ed.target = p; $('#fTarget').value = p;
  if (!ed.label) { ed.label = p.split('\\').pop().replace(/\.(lnk|exe|url|bat|cmd)$/i, '').slice(0, 24); $('#fLabel').value = ed.label; }
  updatePreview();
};
async function updatePreview() {
  const pv = $('#tilePreview');
  pv.className = 'tile preview ' + keyClasses(ed);
  pv.style.setProperty('--c', ed.color);
  pv.innerHTML = keyInner(ed);
  pv.querySelector('.ico').innerHTML = await iconHtml(ed);
}
$('#tileSave').onclick = () => {
  if (!ed.target) return toast(t('needTarget'));
  Object.assign(ed, normalizeTarget(ed.type, ed.target));
  if (!ed.label) ed.label = ed.target.replace(/^https?:\/\/(www\.)?/i, '').split(/[\\/]/).filter(Boolean)[0] || 'Key';
  if (!ed.fx) delete ed.fx;
  if (edPage !== page) {
    const dest = cfg.pages[edPage].tiles;
    const slot = dest.indexOf(null);
    if (slot < 0) return toast(t('pageFullNamed', { p: cfg.pages[edPage].name }));
    dest[slot] = ed; curTiles()[edIndex] = null;
    toast(t('keyMoved', { p: cfg.pages[edPage].name }));
  } else {
    curTiles()[edIndex] = ed;
  }
  persist(); closeModals(); renderAll();
};

// ---------- ready-made ideas ----------
let ideaCat = 0;
function renderIdeas() {
  const cats = $('#ideaCats'); cats.innerHTML = '';
  window.IDEAS.forEach((c, i) => {
    const b = document.createElement('button'); b.textContent = tr(c.cat); b.classList.toggle('on', i === ideaCat);
    b.onclick = () => { ideaCat = i; renderIdeas(); };
    cats.appendChild(b);
  });
  const list = $('#ideaList'); list.innerHTML = '';
  window.IDEAS[ideaCat].items.forEach(it => {
    const b = document.createElement('button'); b.className = 'idea';
    b.innerHTML = `<span class="ie" style="background:${it.color}">${esc(it.icon)}</span><span class="it"><div class="in">${esc(tr(it.label))}</div><div class="id">${esc(tr(it.d))}</div></span>`;
    b.onclick = () => useIdea(it);
    list.appendChild(b);
  });
}
function useIdea(it) {
  const label = tr(it.label).replace(/\s*(to|of|ל|של)?\s*\.\.\.$/i, '').trim();
  Object.assign(ed, { label, icon: it.icon, color: it.color, type: it.type, target: it.target, noIcon: false });
  $('#fLabel').value = ed.label; $('#fTarget').value = ed.target; $('#fIcon').value = ed.icon;
  renderSeg(); renderSwatches($('#swatches'), ed.color, (c) => { ed.color = c; updatePreview(); }); updatePreview();
  $('#ideasModal').classList.add('hidden');
  if (it.ask) {
    // select the placeholder so the user just types the real number / email
    const el = $('#fTarget'), s = ed.target.indexOf(it.ask);
    el.focus(); el.setSelectionRange(s, s + it.ask.length);
    toast(t('typeDetails'));
  }
}
$('#ideasBtn').onclick = () => { renderIdeas(); $('#ideasModal').classList.remove('hidden'); };
$('#ideasClose').onclick = () => $('#ideasModal').classList.add('hidden');
$('#tileDelete').onclick = async () => {
  if (!(await askConfirm(t('askDeleteKey', { n: ed.label || t('untitled') })))) return;
  window.qd.pin(true);
  curTiles()[edIndex] = null; persist(); closeModals(); renderDeck(); toast(t('deleted'));
};
$('#tileCancel').onclick = closeModals;

function closeModals() {
  if (askConfirm.pending) askConfirm.pending(false);
  ['#tileModal', '#setModal', '#ideasModal', '#themeModal'].forEach(s => $(s).classList.add('hidden'));
  window.qd.pin(false); qEl.focus();
}
document.querySelectorAll('.modal').forEach(m => m.addEventListener('mousedown', (e) => {
  if (e.target !== m) return;
  if (m.id === 'setModal') applyAccent();
  closeModals();
}));

// ---------- settings ----------
let tmp = null;
function renderLangSeg() { [...$('#sLang').children].forEach(b => b.classList.toggle('on', b.dataset.v === tmp.lang)); }
$('#settingsBtn').onclick = () => {
  tmp = { hotkey: cfg.hotkey, accent: cfg.accent, lang: lang() };
  $('#sHotkey').value = cfg.hotkey; $('#sCols').value = cfg.cols; $('#sRows').value = cfg.rows;
  $('#sLogin').checked = !!cfg.openAtLogin; $('#sMsg').textContent = '';
  renderLangSeg();
  renderSwatches($('#sAccent'), cfg.accent, (c) => { tmp.accent = c; document.documentElement.style.setProperty('--accent', c); });
  window.qd.pin(true);
  $('#setModal').classList.remove('hidden');
};
$('#sLang').onclick = (e) => {
  const v = e.target.dataset.v; if (!v) return;
  tmp.lang = v; renderLangSeg();
  // preview the language right away
  const keep = cfg.lang; cfg.lang = v; applyLang(); cfg.lang = keep;
};
$('#sHotkey').onkeydown = (e) => {
  e.preventDefault(); e.stopPropagation();
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
  const mods = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Super'].filter(Boolean);
  if (!mods.length) { $('#sMsg').textContent = t('needMod'); return; }
  const k = e.code.startsWith('Key') ? e.code.slice(3) : e.code.startsWith('Digit') ? e.code.slice(5) : e.key === ' ' ? 'Space' : e.key;
  const combo = [...mods, k].join('+');
  if (combo === 'Ctrl+Alt+Space') { $('#sMsg').textContent = t('claudeKey'); return; }
  tmp.hotkey = combo; $('#sHotkey').value = tmp.hotkey; $('#sMsg').textContent = '';
};
$('#sRefresh').onclick = async () => { apps = await window.qd.refreshApps(); $('#sMsg').textContent = t('appsFound', { n: apps.length }); };
$('#sReset').onclick = async () => {
  if (!(await askConfirm(t('askReset'), t('resetTitle'), t('resetBtn')))) return;
  const keepLang = tmp ? tmp.lang : lang();
  cfg = await window.qd.reset(keepLang); page = 0; applyLang(); applyAccent(); applyTheme(); closeModals(); renderAll();
};
$('#setCancel').onclick = () => { applyAccent(); applyLang(); closeModals(); };
$('#setSave').onclick = async () => {
  const cols = Math.min(8, Math.max(3, +$('#sCols').value || 5));
  const rows = Math.min(6, Math.max(2, +$('#sRows').value || 3));
  const oldHotkey = cfg.hotkey;
  cfg.cols = cols; cfg.rows = rows; cfg.accent = tmp.accent; cfg.hotkey = tmp.hotkey; cfg.openAtLogin = $('#sLogin').checked; cfg.lang = tmp.lang;
  normalize();
  const r = await window.qd.saveConfig(cfg);
  if (!r.ok) { cfg.hotkey = oldHotkey; await window.qd.saveConfig(cfg); $('#sMsg').textContent = t('hotkeyTaken'); return; }
  applyLang(); applyAccent(); closeModals(); renderAll(); toast(t('saved'));
};

// ---------- themes modal ----------
function previewBg(th) {
  const b = th.background || {}, kind = bgKind(b), v = String(b.value || b.src || '');
  if (kind === 'svg') return `background-image:${svgUrl(v)}`;
  if (kind === 'image' && safeUrl(v)) return `background-image:${cssUrl(safeUrl(v))}`;
  if (kind === 'video') return `background:${(th.device && th.device.body) || '#111'}`;
  return `background:${v || (th.device && th.device.body) || '#111'}`;
}
function renderThemes() {
  const box = $('#themeList'); box.innerHTML = '';
  themes.forEach(th => {
    const k = th.keys || {};
    const card = document.createElement('div');
    card.className = 'tcard' + (theme && th.id === theme.id ? ' on' : '');
    const keys = COLORS.slice(0, 8).map(c => {
      const bgk = k.colorMode === 'theme' ? (k.background || '#222') : k.colorMode === 'wallpaper' ? 'rgba(255,255,255,.08)' : c;
      const ring = k.style === 'neon' ? `border:1px solid ${c};box-shadow:0 0 5px ${c};background:rgba(0,0,0,.6)` : `background:${bgk}`;
      return `<i style="${ring.replace(/"/g, "'")};border-radius:${Math.max(3, (+k.radius || 14) / 3)}px"></i>`;
    }).join('');
    card.innerHTML = `<div class="tprev" style="${previewBg(th).replace(/"/g, "'")}">${keys}</div>`
      + `<div class="tname">${esc(themeName(th))}</div><div class="tdesc">${esc(themeDesc(th) || th.author || '')}</div>`
      + (th.builtin ? '' : `<span class="tbadge">${esc(t('mine'))}</span><button class="tdel" title="${esc(t('del'))}">✕</button>`);
    card.onclick = async (e) => {
      if (e.target.classList.contains('tdel')) {
        if (!(await askConfirm(t('askDeleteTheme', { n: themeName(th) })))) return;
        window.qd.pin(true);
        await window.qd.deleteTheme(th.id);
        if (cfg.theme === th.id) cfg.theme = '1-classic';
        themes = await window.qd.listThemes(); applyTheme(); persist(); renderThemes(); renderDeck(); toast(t('themeDeleted'));
        return;
      }
      pickTheme(th.id);
    };
    box.appendChild(card);
  });
  $('#bgName').textContent = cfg.customBg ? (cfg.customBg.name || '✓') : '';
  $('#bgClear').style.display = cfg.customBg ? '' : 'none';
}
function pickTheme(id) {
  cfg.theme = id;
  const th = themes.find(x => x.id === id);
  if (th && th.accent) cfg.accent = th.accent;
  applyAccent(); applyTheme(); persist(); renderThemes(); renderDeck();
  if (th) toast(t('themeApplied', { n: themeName(th) }));
}
async function importThemeResult(r) {
  if (!r || !r.ok) { if (r && r.error) toast(t('themeError', { e: r.error })); return; }
  themes = await window.qd.listThemes();
  pickTheme(r.id);
  const th = themes.find(x => x.id === r.id);
  if (th) toast(t('themeImported', { n: themeName(th) }));
}
$('#themeBtn').onclick = () => { renderThemes(); window.qd.pin(true); $('#themeModal').classList.remove('hidden'); };
$('#themeClose').onclick = closeModals;
$('#copyPrompt').onclick = () => { window.qd.copy(window.THEME_PROMPT); toast(t('promptCopied')); };
$('#pasteTheme').onclick = async () => importThemeResult(await window.qd.pasteTheme());
$('#themeImport').onclick = async () => importThemeResult(await window.qd.importTheme());
$('#themeFolder').onclick = () => window.qd.themesFolder();
$('#themeExport').onclick = async () => { if (theme && await window.qd.exportTheme(theme)) toast(t('exported')); };
$('#bgPick').onclick = async () => {
  const m = await window.qd.pickMedia(); if (!m) return;
  cfg.customBg = m; applyTheme(); persist(); renderThemes(); renderDeck(); toast(t('bgSet'));
};
$('#bgClear').onclick = () => { delete cfg.customBg; applyTheme(); persist(); renderThemes(); renderDeck(); toast(t('bgCleared')); };

// ---------- drop files anywhere (when not over a key) ----------
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', async (e) => {
  e.preventDefault();
  if (e.target.closest('.deck .tile')) return;
  const f = e.dataTransfer.files[0]; if (!f) return;
  const p = window.qd.pathForFile(f);
  if (/\.qdtheme$/i.test(p)) return importThemeResult(await window.qd.importTheme(p));
  const i = curTiles().indexOf(null);
  if (i < 0) return toast(t('pageFullShort'));
  addFromPath(p, i);
});

// ---------- lifecycle ----------
window.qd.on('shown', () => {
  qEl.value = ''; sel = 0; if (!editing) renderAll(); qEl.focus();
  document.querySelectorAll('video').forEach(v => v.play().catch(() => {}));
});
window.qd.on('hidden', () => {
  closeModals(); if (editing) { editing = false; }
  document.querySelectorAll('video').forEach(v => v.pause()); // no CPU use while hidden
});
window.qd.on('theme-imported', async (d) => { if (cfg) importThemeResult({ ok: true, id: d.id }); });
window.qd.on('theme-error', (msg) => toast(t('themeError', { e: msg })));

(async () => {
  cfg = await window.qd.getConfig();
  [apps, themes] = await Promise.all([window.qd.listApps(), window.qd.listThemes()]);
  applyLang(); applyAccent(); applyTheme(); renderAll(); qEl.focus();
})();
