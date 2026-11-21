// QuickDeck - renderer
const $ = (s) => document.querySelector(s);
const qEl = $('#q'), deckEl = $('#deck'), resEl = $('#results'), tabsEl = $('#tabs');

const COLORS = ['#7c5cff', '#3b82f6', '#0ea5e9', '#10b981', '#22c55e', '#f5a524', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#64748b', '#1f2937'];
const EMOJIS = ['📁', '💻', '🌐', '🎮', '🎵', '🎬', '📷', '💬', '📧', '📝', '📊', '⚙️', '🔒', '🔍', '⭐', '🚀', '🛒', '💡', '🧮', '📅', '🎧', '🖨️', '☁️', '🏠'];

let cfg, apps = [], page = 0, editing = false;
let sel = 0;                 // selected index (deck or results)
let results = [];
let dragFrom = null;

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
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
function askConfirm(text, title = 'אישור מחיקה', yes = 'מחק') {
  return new Promise((resolve) => {
    $('#askTitle').textContent = title; $('#askText').textContent = text; $('#askYes').textContent = yes;
    const m = $('#askModal'); m.classList.remove('hidden'); window.qd.pin(true);
    const done = (v) => {
      m.classList.add('hidden'); $('#askYes').onclick = $('#askNo').onclick = null; askConfirm.pending = null;
      if ($('#tileModal').classList.contains('hidden') && $('#setModal').classList.contains('hidden')) window.qd.pin(false);
      qEl.focus(); resolve(v);
    };
    askConfirm.pending = done;
    $('#askYes').onclick = () => done(true);
    $('#askNo').onclick = () => done(false);
    $('#askYes').focus();
  });
}

async function iconHtml(item, size) {
  if (item.noIcon) return '';
  if (item.icon) return esc(item.icon);
  if (item.type === 'app' || item.type === 'folder' || !item.type) {
    const url = await window.qd.icon(item.target || item.path);
    if (url) return `<img src="${url}" alt="">`;
  }
  return item.type === 'folder' ? '📁' : item.type === 'url' ? '🌐' : item.type === 'command' ? '⚡' : '📄';
}

// ---------- tabs ----------
function renderTabs() {
  tabsEl.innerHTML = '';
  cfg.pages.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'tab' + (i === page ? ' active' : '');
    b.innerHTML = `<span>${esc(p.name)}</span>` + (editing && cfg.pages.length > 1 ? '<span class="x" title="מחק דף">✕</span>' : '');
    b.onclick = async (e) => {
      if (e.target.classList.contains('x')) {
        if (await askConfirm(`למחוק את הדף "${p.name}" וכל הכפתורים שבו?`)) {
          cfg.pages.splice(i, 1);
          if (page >= i && page > 0) page--;
          persist(); renderAll();
        }
        return;
      }
      page = i; sel = 0; renderAll();
    };
    b.ondblclick = () => renameTab(b, p);
    // drop a tile on a tab = move it to that page
    b.ondragover = (e) => { if (dragFrom !== null && i !== page) e.preventDefault(); };
    b.ondrop = (e) => {
      e.preventDefault(); if (dragFrom === null) return;
      const empty = cfg.pages[i].tiles.indexOf(null);
      if (empty < 0) return toast('אין מקום פנוי בדף הזה');
      cfg.pages[i].tiles[empty] = curTiles()[dragFrom]; curTiles()[dragFrom] = null; dragFrom = null;
      persist(); renderDeck(); toast(`הועבר לדף "${cfg.pages[i].name}"`);
    };
    tabsEl.appendChild(b);
  });
  if (editing) {
    const add = document.createElement('button');
    add.className = 'tab add'; add.textContent = '+ דף חדש';
    add.onclick = () => { cfg.pages.push({ id: uid(), name: 'דף ' + (cfg.pages.length + 1), tiles: [] }); page = cfg.pages.length - 1; normalize(); persist(); renderAll(); };
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
async function renderDeck() {
  deckEl.style.setProperty('--cols', cfg.cols);
  deckEl.style.setProperty('--rows', cfg.rows);
  deckEl.innerHTML = '';
  const tiles = curTiles().slice(0, slots());
  tiles.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'tile' + (t ? '' : ' empty') + (i === sel && !qEl.value ? ' sel' : '');
    el.dataset.i = i;
    if (t) {
      el.style.setProperty('--c', t.color || '#3b3b52');
      el.innerHTML = `<div class="ico"></div><div class="lbl">${esc(t.label)}</div>`;
      el.title = t.target;
      iconHtml(t).then(h => { const ico = el.querySelector('.ico'); if (ico) ico.innerHTML = h; });
    }
    el.onclick = () => {
      if (editing) return openEditor(i);
      if (t) runTile(t, el);
    };
    el.oncontextmenu = (e) => { e.preventDefault(); openEditor(i); };
    // reorder (edit mode)
    el.draggable = editing && !!t;
    el.ondragstart = (e) => { dragFrom = i; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
    el.ondragend = () => { dragFrom = null; el.classList.remove('dragging'); };
    el.ondragover = (e) => { e.preventDefault(); el.classList.add('drop'); };
    el.ondragleave = () => el.classList.remove('drop');
    el.ondrop = (e) => {
      e.preventDefault(); el.classList.remove('drop');
      if (dragFrom !== null) {
        const arr = curTiles(); [arr[dragFrom], arr[i]] = [arr[i], arr[dragFrom]]; dragFrom = null;
        persist(); renderDeck(); return;
      }
      const f = e.dataTransfer.files[0];
      if (f) addFromPath(window.qd.pathForFile(f), i);
    };
    deckEl.appendChild(el);
  });
}

function addFromPath(p, i) {
  if (!p) return;
  const name = p.split('\\').pop().replace(/\.(lnk|exe|url|bat|cmd)$/i, '');
  const isFolder = !/\.[a-z0-9]{1,5}$/i.test(p);
  curTiles()[i] = { id: uid(), label: name, icon: '', color: COLORS[i % COLORS.length], type: isFolder ? 'folder' : 'app', target: p };
  persist(); renderDeck(); toast(`נוסף: ${name}`);
}

async function runTile(t, el) {
  if (el) el.classList.add('flash');
  const r = await window.qd.launch(t);
  if (!r.ok) toast('שגיאה: ' + r.error);
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
  if (looksPath(q)) out.push({ kind: 'פתח', name: q, sub: 'פתח נתיב', type: 'app', target: q, emoji: '📂' });
  if (looksUrl(q)) out.push({ kind: 'אתר', name: q, sub: 'פתח בדפדפן', type: 'url', target: /^https?:/i.test(q) ? q : 'https://' + q, emoji: '🌐' });

  const tiles = [];
  cfg.pages.forEach(p => p.tiles.forEach(t => { if (t) { const s = score(t.label, q); if (s) tiles.push({ ...t, s, kind: 'כפתור', name: t.label, sub: p.name }); } }));
  tiles.sort((a, b) => b.s - a.s);

  const ap = [];
  for (const a of apps) { const s = score(a.name, q); if (s) ap.push({ kind: 'תוכנה', name: a.name, sub: a.path, type: 'app', target: a.path, s }); }
  ap.sort((a, b) => b.s - a.s || a.name.length - b.name.length);

  out.push(...tiles.slice(0, 5), ...ap.slice(0, 30));
  out.push({ kind: 'חיפוש', name: `חפש "${q}" בגוגל`, sub: 'google.com', type: 'url', target: 'https://www.google.com/search?q=' + encodeURIComponent(q), emoji: '🔍', noPin: true });
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
      + (r.noPin || r.kind === 'כפתור' ? '' : '<button class="pin">📌 הוסף ללוח</button>')
      + `<span class="tag">${r.kind}</span>`;
    el.onclick = (e) => {
      if (e.target.classList.contains('pin')) { e.stopPropagation(); return pinResult(r); }
      runTile(r);
    };
    el.onmousemove = () => { if (sel !== i) { sel = i; markSel(); } };
    resEl.appendChild(el);
    const ri = el.querySelector('.ri');
    if (r.emoji) ri.textContent = r.emoji;
    else iconHtml(r).then(h => ri.innerHTML = h);
  });
}

function pinResult(r) {
  const i = curTiles().indexOf(null);
  if (i < 0) return toast('הדף מלא. עבור לדף אחר או הוסף דף');
  curTiles()[i] = { id: uid(), label: r.name.slice(0, 24), icon: '', color: COLORS[i % COLORS.length], type: r.type, target: r.target };
  persist(); toast(`"${r.name}" נוסף לדף "${cfg.pages[page].name}"`);
}

function markSel() {
  const list = qEl.value ? resEl.children : deckEl.children;
  [...list].forEach((el, i) => el.classList.toggle('sel', i === sel));
  if (qEl.value) list[sel]?.scrollIntoView({ block: 'nearest' });
}

function renderAll() {
  normalize();
  document.body.classList.toggle('editing', editing);
  $('#panel').classList.toggle('editing', editing);
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
qEl.addEventListener('input', () => { sel = 0; renderAll(); });
document.addEventListener('keydown', (e) => {
  if (askConfirm.pending) {
    if (e.key === 'Escape') askConfirm.pending(false);
    return;
  }
  if (!$('#ideasModal').classList.contains('hidden')) {
    if (e.key === 'Escape') $('#ideasModal').classList.add('hidden');
    return;
  }
  if (!$('#tileModal').classList.contains('hidden') || !$('#setModal').classList.contains('hidden')) {
    if (e.key === 'Escape') closeModals();
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
  const moves = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: cfg.cols, ArrowUp: -cfg.cols }; // RTL
  if (moves[e.key] !== undefined) {
    const nx = sel + moves[e.key];
    if (nx >= 0 && nx < n) { sel = nx; markSel(); }
    e.preventDefault();
  } else if (e.key === 'Enter') {
    const t = curTiles()[sel];
    if (editing) openEditor(sel); else if (t) runTile(t, deckEl.children[sel]);
  }
});

function toggleEdit() { editing = !editing; qEl.value = ''; renderAll(); qEl.focus(); }
$('#editBtn').onclick = toggleEdit;

// "ksp.co.il" -> "https://ksp.co.il" (also turns a typed domain into a website button)
function normalizeTarget(type, t) {
  t = (t || '').trim();
  const hasScheme = /^[a-z][\w+.-]*:(?!\d)/i.test(t) && !/^[a-z]:[\\/]/i.test(t);
  const isDomain = /^(www\.)?[\w֐-׿-]+(\.[\w֐-׿-]+)+(:\d+)?([/?#]\S*)?$/i.test(t);
  const isFile = /\.(exe|lnk|bat|cmd|msc|ps1|txt|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|mp[34]|zip|url)$/i.test(t);
  if (!hasScheme && isDomain && !isFile && !t.includes('\\')) return { type: 'url', target: 'https://' + t };
  return { type, target: t };
}

// ---------- tile editor ----------
let edIndex = -1, ed = null, edPage = 0;
function renderPageSeg() {
  const box = $('#fPage'); box.innerHTML = '';
  cfg.pages.forEach((p, i) => {
    const b = document.createElement('button');
    b.textContent = p.name + (i === page ? ' (נוכחי)' : '');
    b.classList.toggle('on', i === edPage);
    b.onclick = () => { edPage = i; renderPageSeg(); };
    box.appendChild(b);
  });
}
function openEditor(i) {
  edIndex = i; edPage = page;
  const t = curTiles()[i];
  ed = t ? { ...t } : { id: uid(), label: '', icon: '', color: COLORS[i % COLORS.length], type: 'app', target: '' };
  $('#tileModalTitle').textContent = t ? 'עריכת כפתור' : 'כפתור חדש';
  $('#tileDelete').style.visibility = t ? 'visible' : 'hidden';
  $('#fLabel').value = ed.label; $('#fTarget').value = ed.target; $('#fIcon').value = ed.icon;
  renderSeg(); renderPageSeg(); renderSwatches($('#swatches'), ed.color, (c) => { ed.color = c; updatePreview(); });
  updatePreview();
  window.qd.pin(true);
  $('#tileModal').classList.remove('hidden');
  $('#fLabel').focus();
}
function renderSeg() {
  [...$('#fType').children].forEach(b => b.classList.toggle('on', b.dataset.v === ed.type));
  const L = { app: ['נתיב לתוכנה או קובץ', 'C:\\Program Files\\...\\app.exe'], folder: ['נתיב לתיקייה', 'C:\\Users\\...'], url: ['כתובת אתר', 'https://...'], command: ['פקודה להרצה', 'shutdown /s /t 0'] }[ed.type];
  $('#fTargetLabel').textContent = L[0]; $('#fTarget').placeholder = L[1];
  $('#fBrowse').style.display = (ed.type === 'app' || ed.type === 'folder') ? '' : 'none';
}
$('#fType').onclick = (e) => { const v = e.target.dataset.v; if (v) { ed.type = v; renderSeg(); updatePreview(); } };
function renderSwatches(box, current, onPick) {
  box.innerHTML = '';
  COLORS.forEach(c => {
    const s = document.createElement('div'); s.className = 'sw' + (c === current ? ' on' : ''); s.style.background = c;
    s.onclick = () => { onPick(c); [...box.querySelectorAll('.sw')].forEach(x => x.classList.toggle('on', x === s)); };
    box.appendChild(s);
  });
  const custom = document.createElement('input'); custom.type = 'color'; custom.className = 'sw-custom'; custom.value = current;
  custom.title = 'צבע מותאם אישית';
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
  pv.style.setProperty('--c', ed.color);
  pv.innerHTML = `<div class="ico">${await iconHtml(ed)}</div><div class="lbl">${esc(ed.label || 'ללא שם')}</div>`;
}
$('#tileSave').onclick = () => {
  if (!ed.target) return toast('צריך למלא נתיב / כתובת');
  Object.assign(ed, normalizeTarget(ed.type, ed.target));
  if (!ed.label) ed.label = ed.target.replace(/^https?:\/\/(www\.)?/i, '').split(/[\\/]/).filter(Boolean)[0] || 'כפתור';
  if (edPage !== page) {
    const dest = cfg.pages[edPage].tiles;
    const slot = dest.indexOf(null);
    if (slot < 0) return toast(`הדף "${cfg.pages[edPage].name}" מלא`);
    dest[slot] = ed; curTiles()[edIndex] = null;
    toast(`הכפתור עבר לדף "${cfg.pages[edPage].name}"`);
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
    const b = document.createElement('button'); b.textContent = c.cat; b.classList.toggle('on', i === ideaCat);
    b.onclick = () => { ideaCat = i; renderIdeas(); };
    cats.appendChild(b);
  });
  const list = $('#ideaList'); list.innerHTML = '';
  window.IDEAS[ideaCat].items.forEach(it => {
    const b = document.createElement('button'); b.className = 'idea';
    b.innerHTML = `<span class="ie" style="background:${it.color}">${esc(it.icon)}</span><span class="it"><div class="in">${esc(it.label)}</div><div class="id">${esc(it.d)}</div></span>`;
    b.onclick = () => useIdea(it);
    list.appendChild(b);
  });
}
function useIdea(it) {
  Object.assign(ed, { label: it.label.replace(/\s*(ל|של)?\.\.\.$/, ''), icon: it.icon, color: it.color, type: it.type, target: it.target, noIcon: false });
  $('#fLabel').value = ed.label; $('#fTarget').value = ed.target; $('#fIcon').value = ed.icon;
  renderSeg(); renderSwatches($('#swatches'), ed.color, (c) => { ed.color = c; updatePreview(); }); updatePreview();
  $('#ideasModal').classList.add('hidden');
  if (it.ask) {
    // select the placeholder so the user just types the real number / email
    const t = $('#fTarget'), s = ed.target.indexOf(it.ask);
    t.focus(); t.setSelectionRange(s, s + it.ask.length);
    toast('הקלד את הפרטים במקום הטקסט המסומן');
  }
}
$('#ideasBtn').onclick = () => { renderIdeas(); $('#ideasModal').classList.remove('hidden'); };
$('#ideasClose').onclick = () => $('#ideasModal').classList.add('hidden');
$('#tileDelete').onclick = async () => {
  if (!(await askConfirm(`למחוק את הכפתור "${ed.label || 'ללא שם'}"?`))) return;
  window.qd.pin(true);
  curTiles()[edIndex] = null; persist(); closeModals(); renderDeck(); toast('הכפתור נמחק');
};
$('#tileCancel').onclick = closeModals;

function closeModals() {
  if (askConfirm.pending) askConfirm.pending(false);
  $('#tileModal').classList.add('hidden'); $('#setModal').classList.add('hidden'); $('#ideasModal').classList.add('hidden');
  window.qd.pin(false); qEl.focus();
}
document.querySelectorAll('.modal').forEach(m => m.addEventListener('mousedown', (e) => { if (e.target === m) closeModals(); }));

// ---------- settings ----------
let tmp = null;
$('#settingsBtn').onclick = () => {
  tmp = { hotkey: cfg.hotkey, accent: cfg.accent };
  $('#sHotkey').value = cfg.hotkey; $('#sCols').value = cfg.cols; $('#sRows').value = cfg.rows;
  $('#sLogin').checked = !!cfg.openAtLogin; $('#sMsg').textContent = '';
  renderSwatches($('#sAccent'), cfg.accent, (c) => { tmp.accent = c; document.documentElement.style.setProperty('--accent', c); });
  window.qd.pin(true);
  $('#setModal').classList.remove('hidden');
};
$('#sHotkey').onkeydown = (e) => {
  e.preventDefault(); e.stopPropagation();
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
  const mods = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Super'].filter(Boolean);
  if (!mods.length) { $('#sMsg').textContent = 'צריך לפחות מקש אחד מ-Ctrl / Alt / Shift / Win'; return; }
  let k = e.code.startsWith('Key') ? e.code.slice(3) : e.code.startsWith('Digit') ? e.code.slice(5) : e.key === ' ' ? 'Space' : e.key;
  const combo = [...mods, k].join('+');
  if (combo === 'Ctrl+Alt+Space') { $('#sMsg').textContent = 'הצירוף הזה שמור ל-Claude, בחר צירוף אחר'; return; }
  tmp.hotkey = combo; $('#sHotkey').value = tmp.hotkey; $('#sMsg').textContent = '';
};
$('#sRefresh').onclick = async () => { apps = await window.qd.refreshApps(); $('#sMsg').textContent = `נמצאו ${apps.length} תוכנות`; };
$('#sReset').onclick = async () => {
  if (!(await askConfirm('לאפס את כל הכפתורים, הדפים וההגדרות לברירת המחדל? אי אפשר לבטל את זה.', 'איפוס', 'אפס'))) return;
  cfg = await window.qd.reset(); page = 0; applyAccent(); closeModals(); renderAll();
};
$('#setCancel').onclick = () => { applyAccent(); closeModals(); };
$('#setSave').onclick = async () => {
  const cols = Math.min(8, Math.max(3, +$('#sCols').value || 5));
  const rows = Math.min(6, Math.max(2, +$('#sRows').value || 3));
  const oldHotkey = cfg.hotkey;
  cfg.cols = cols; cfg.rows = rows; cfg.accent = tmp.accent; cfg.hotkey = tmp.hotkey; cfg.openAtLogin = $('#sLogin').checked;
  normalize();
  const r = await window.qd.saveConfig(cfg);
  if (!r.ok) { cfg.hotkey = oldHotkey; await window.qd.saveConfig(cfg); $('#sMsg').textContent = 'הקיצור תפוס ע"י תוכנה אחרת, נסה צירוף אחר'; return; }
  applyAccent(); closeModals(); renderAll(); toast('ההגדרות נשמרו');
};

// ---------- drop files anywhere (when not over a tile) ----------
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.target.closest('.tile')) return;
  const f = e.dataTransfer.files[0]; if (!f) return;
  const i = curTiles().indexOf(null);
  if (i < 0) return toast('הדף מלא');
  addFromPath(window.qd.pathForFile(f), i);
});

// ---------- lifecycle ----------
window.qd.on('shown', () => { qEl.value = ''; sel = 0; if (!editing) renderAll(); qEl.focus(); });
window.qd.on('hidden', () => { closeModals(); if (editing) { editing = false; } });

(async () => {
  cfg = await window.qd.getConfig();
  apps = await window.qd.listApps();
  applyAccent(); renderAll(); qEl.focus();
})();
