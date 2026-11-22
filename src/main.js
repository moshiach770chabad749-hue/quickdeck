// QuickDeck - main process
const { app, BrowserWindow, globalShortcut, ipcMain, shell, Tray, Menu, nativeImage, dialog, screen, protocol, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const { exec } = require('child_process');

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

// qd-media://media/<file>  -> user media (GIFs, images, videos copied into the app)
// qd-media://themes/<id>/<file> -> assets of an imported theme
protocol.registerSchemesAsPrivileged([{ scheme: 'qd-media', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const MEDIA_DIR = path.join(app.getPath('userData'), 'media');
const THEMES_DIR = path.join(app.getPath('userData'), 'themes');
const BUILTIN_THEMES = path.join(__dirname, 'themes');
const MIME = { gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', apng: 'image/apng', svg: 'image/svg+xml', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/mp4', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
const MEDIA_EXT = ['gif', 'png', 'jpg', 'jpeg', 'webp', 'apng', 'svg', 'avif', 'mp4', 'webm'];
let win = null;
let tray = null;
let config = null;
let appIndex = [];
const iconCache = new Map();

// ---------- config ----------
function uid() { return Math.random().toString(36).slice(2, 10); }

const STR = {
  en: { main: 'Main', work: 'Work', open: 'Open QuickDeck', refresh: 'Refresh app list', exit: 'Exit',
    keys: ['File Explorer', 'Desktop', 'Downloads', 'Documents', 'Calculator', 'Google', 'YouTube', 'WhatsApp', 'Screenshot', 'Settings', 'Lock PC', 'Task Manager', 'Notepad', 'Recycle Bin'] },
  he: { main: 'ראשי', work: 'עבודה', open: 'פתח את QuickDeck', refresh: 'רענן רשימת תוכנות', exit: 'יציאה',
    keys: ['סייר קבצים', 'שולחן עבודה', 'הורדות', 'מסמכים', 'מחשבון', 'Google', 'YouTube', 'WhatsApp', 'צילום מסך', 'הגדרות', 'נעילת מחשב', 'מנהל משימות', 'פנקס רשימות', 'סל מחזור'] }
};
const S = () => STR[config && config.lang === 'he' ? 'he' : 'en'];

function defaultConfig(lang = 'en') {
  const s = STR[lang === 'he' ? 'he' : 'en'];
  let n = 0;
  const t = (icon, color, type, target) => ({ id: uid(), label: s.keys[n++], icon, color, type, target });
  return {
    lang: lang === 'he' ? 'he' : 'en',
    theme: '1-classic',
    hotkey: 'Ctrl+Shift+Space',
    cols: 5,
    rows: 3,
    accent: '#7c5cff',
    openAtLogin: false,
    pages: [
      {
        id: uid(), name: s.main,
        tiles: [
          t('📁', '#f5a524', 'app', 'explorer.exe'),
          t('🖥️', '#3b82f6', 'folder', app.getPath('desktop')),
          t('⬇️', '#10b981', 'folder', app.getPath('downloads')),
          t('📄', '#6366f1', 'folder', app.getPath('documents')),
          t('🧮', '#64748b', 'app', 'calc.exe'),
          t('🔍', '#ea4335', 'url', 'https://www.google.com'),
          t('▶️', '#ff0033', 'url', 'https://www.youtube.com'),
          t('💬', '#25d366', 'url', 'https://web.whatsapp.com'),
          t('✂️', '#ec4899', 'url', 'ms-screenclip:'),
          t('⚙️', '#475569', 'url', 'ms-settings:'),
          t('🔒', '#ef4444', 'command', 'rundll32.exe user32.dll,LockWorkStation'),
          t('📊', '#0ea5e9', 'app', 'taskmgr.exe'),
          t('📝', '#a855f7', 'app', 'notepad.exe'),
          t('🗑️', '#78716c', 'url', 'shell:RecycleBinFolder'),
          null
        ]
      },
      { id: uid(), name: s.work, tiles: [] }
    ]
  };
}

function loadConfig() {
  try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { config = defaultConfig(); saveConfig(); }
}
function saveConfig() {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

// ---------- app index (Start Menu + Desktop) ----------
function walk(dir, out, depth = 0) {
  if (depth > 5) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out, depth + 1);
    else if (/\.(lnk|url|appref-ms)$/i.test(e.name)) {
      const name = e.name.replace(/\.(lnk|url|appref-ms)$/i, '');
      if (/uninstall|הסר|readme|help$/i.test(name)) continue;
      out.push({ name, path: full });
    }
  }
}

function buildIndex() {
  const dirs = [
    path.join(process.env.ProgramData || 'C:\\ProgramData', 'Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(app.getPath('appData'), 'Microsoft\\Windows\\Start Menu\\Programs'),
    app.getPath('desktop'),
    path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop')
  ];
  const out = [];
  dirs.forEach(d => walk(d, out));
  const seen = new Set();
  appIndex = out.filter(a => {
    const k = a.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- window ----------
function createWindow() {
  win = new BrowserWindow({
    width: 860, height: 620,
    frame: false, transparent: true, resizable: false,
    show: false, skipTaskbar: true, alwaysOnTop: true,
    backgroundColor: '#00000000', icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('blur', () => { if (!win.webContents.isDevToolsOpened() && !win.__pinned) hideWindow(); });
}

function showWindow() {
  const cursor = screen.getCursorScreenPoint();
  const { workArea } = screen.getDisplayNearestPoint(cursor);
  const [w, h] = win.getSize();
  win.setPosition(Math.round(workArea.x + (workArea.width - w) / 2), Math.round(workArea.y + workArea.height * 0.16));
  win.show(); win.focus();
  win.webContents.send('shown');
}
function hideWindow() { if (win && win.isVisible()) { win.hide(); win.webContents.send('hidden'); } }
function toggleWindow() { win.isVisible() ? hideWindow() : showWindow(); }

function registerHotkey(acc) {
  globalShortcut.unregisterAll();
  try { return globalShortcut.register(acc, toggleWindow); } catch { return false; }
}

function createTray() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(img.isEmpty() ? nativeImage.createEmpty() : img.resize({ width: 16, height: 16 }));
  tray.setToolTip('QuickDeck');
  updateTrayMenu();
  tray.on('click', toggleWindow);
}
function updateTrayMenu() {
  if (!tray) return;
  const s = S();
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: s.open, click: showWindow },
    { label: s.refresh, click: buildIndex },
    { type: 'separator' },
    { label: s.exit, click: () => { app.isQuitting = true; app.quit(); } }
  ]));
}

// ---------- launching ----------
async function launch(item) {
  const { type, target } = item;
  if (!target) return { ok: false, error: 'No target' };
  try {
    if (type === 'url' || /^(https?:|ms-[\w-]+:|shell:|mailto:)/i.test(target)) {
      if (/^shell:/i.test(target)) exec(`explorer.exe "${target}"`);
      else await shell.openExternal(target);
    } else if (type === 'command') {
      exec(target, { windowsHide: true, cwd: app.getPath('home') });
    } else if (!fs.existsSync(target) && /^(www\.)?[^\s\\/:]+(\.[^\s\\/:.]+)+([/?#]\S*)?$/i.test(target)
               && !/\.(exe|lnk|bat|cmd|msc|txt|pdf)$/i.test(target)) {
      // a bare domain like "ksp.co.il"
      await shell.openExternal('https://' + target);
    } else if (fs.existsSync(target)) {
      const err = await shell.openPath(target);
      if (err) return { ok: false, error: err };
    } else {
      // e.g. "calc.exe" on PATH
      exec(`start "" "${target}"`, { cwd: app.getPath('home') });
    }
    hideWindow();
    return { ok: true };
  } catch (e) { return { ok: false, error: String(e.message || e) }; }
}

// ---------- media (GIF / image / video for keys and backgrounds) ----------
const extOf = (p) => (path.extname(p).slice(1) || '').toLowerCase();
const kindOf = (p) => (/^(mp4|webm|mov)$/.test(extOf(p)) ? 'video' : 'image');

function serveFile(full, req) {
  const stat = fs.statSync(full);
  const type = MIME[extOf(full)] || 'application/octet-stream';
  const range = req.headers.get('range');
  const m = range && /bytes=(\d*)-(\d*)/.exec(range);
  if (m) {
    const start = m[1] ? +m[1] : 0;
    const end = Math.min(m[2] ? +m[2] : stat.size - 1, stat.size - 1);
    return new Response(Readable.toWeb(fs.createReadStream(full, { start, end })), {
      status: 206,
      headers: { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1) }
    });
  }
  return new Response(Readable.toWeb(fs.createReadStream(full)), { headers: { 'Content-Type': type, 'Content-Length': String(stat.size), 'Accept-Ranges': 'bytes' } });
}

function registerMediaProtocol() {
  protocol.handle('qd-media', (req) => {
    try {
      const u = new URL(req.url);
      const base = path.resolve(u.host === 'themes' ? THEMES_DIR : MEDIA_DIR);
      const full = path.resolve(base, decodeURIComponent(u.pathname).replace(/^\/+/, ''));
      if (!full.startsWith(base + path.sep) || !fs.existsSync(full)) return new Response('not found', { status: 404 });
      return serveFile(full, req);
    } catch { return new Response('error', { status: 500 }); }
  });
}

function importMedia(file) {
  if (!file || !fs.existsSync(file) || !MEDIA_EXT.includes(extOf(file))) return null;
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const name = uid() + '.' + extOf(file);
  fs.copyFileSync(file, path.join(MEDIA_DIR, name));
  return { src: 'qd-media://media/' + name, kind: kindOf(file), name: path.basename(file) };
}

// ---------- themes (.qdtheme = JSON, anyone can write one, e.g. with ChatGPT) ----------
function parseTheme(raw) {
  let s = String(raw || '').replace(/^﻿/, '');
  const fence = /```(?:json|qdtheme)?\s*([\s\S]*?)```/i.exec(s);
  if (fence) s = fence[1];
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('no JSON found');
  s = s.slice(a, b + 1).replace(/,\s*([}\]])/g, '$1'); // tolerate trailing commas
  const t = JSON.parse(s);
  if (!t || typeof t !== 'object' || !t.name) throw new Error('missing "name" field');
  return t;
}

function readThemeFile(file, id, builtin) {
  try { return { ...parseTheme(fs.readFileSync(file, 'utf8')), id, builtin }; } catch { return null; }
}

function listThemes() {
  const out = [];
  try {
    for (const f of fs.readdirSync(BUILTIN_THEMES).sort()) {
      if (f.endsWith('.qdtheme')) { const t = readThemeFile(path.join(BUILTIN_THEMES, f), f.replace(/\.qdtheme$/, ''), true); if (t) out.push(t); }
    }
  } catch {}
  try {
    const dirs = fs.readdirSync(THEMES_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    dirs.sort((x, y) => fs.statSync(path.join(THEMES_DIR, x.name)).mtimeMs - fs.statSync(path.join(THEMES_DIR, y.name)).mtimeMs);
    for (const d of dirs) { const t = readThemeFile(path.join(THEMES_DIR, d.name, 'theme.qdtheme'), d.name, false); if (t) out.push(t); }
  } catch {}
  return out;
}

// saves a theme (from a file or pasted text) into the themes folder, copying any GIF/image/video it uses
function saveTheme(raw, srcDir) {
  const t = parseTheme(raw);
  const slug = String(t.name).toLowerCase().replace(/[^a-z0-9֐-׿]+/gi, '-').replace(/^-|-$/g, '').slice(0, 24) || 'theme';
  const id = slug + '-' + uid().slice(0, 4);
  const dir = path.join(THEMES_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  const fix = (ref) => {
    if (!ref || typeof ref !== 'string' || /^(data:|https?:|qd-media:)/i.test(ref) || /^\s*</.test(ref) || !srcDir) return ref;
    const p = path.isAbsolute(ref) ? ref : path.join(srcDir, ref);
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return ref;
    const name = path.basename(p);
    fs.copyFileSync(p, path.join(dir, name));
    return `qd-media://themes/${id}/${encodeURIComponent(name)}`;
  };
  const bg = t.background;
  if (bg && typeof bg === 'object') for (const k of ['value', 'src']) if (bg[k]) bg[k] = fix(bg[k]);
  if (typeof t.css === 'string') t.css = t.css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => `url("${fix(u.trim())}")`);
  delete t.id; delete t.builtin;
  fs.writeFileSync(path.join(dir, 'theme.qdtheme'), JSON.stringify(t, null, 2), 'utf8');
  return id;
}

function importThemeFile(file) {
  const id = saveTheme(fs.readFileSync(file, 'utf8'), path.dirname(file));
  config.theme = id; saveConfig();
  return id;
}

// a .qdtheme double-clicked in Explorer arrives as a command-line argument
function handleThemeArgs(argv) {
  const f = (argv || []).find(a => /\.qdtheme$/i.test(a) && fs.existsSync(a));
  if (!f || !win) return;
  try {
    const id = importThemeFile(f);
    win.webContents.send('theme-imported', { id });
  } catch (e) { win.webContents.send('theme-error', String(e.message || e)); }
  showWindow();
}

// ---------- IPC ----------
ipcMain.handle('config:get', () => config);
ipcMain.handle('config:save', (_e, c) => {
  const hotkeyChanged = c.hotkey !== config.hotkey;
  const langChanged = c.lang !== config.lang;
  config = c; saveConfig();
  if (langChanged) updateTrayMenu();
  app.setLoginItemSettings({ openAtLogin: !!config.openAtLogin });
  if (hotkeyChanged) return { ok: registerHotkey(config.hotkey) };
  return { ok: true };
});
ipcMain.handle('apps:list', () => appIndex);
ipcMain.handle('apps:refresh', () => { buildIndex(); return appIndex; });
ipcMain.handle('launch', (_e, item) => launch(item));
ipcMain.handle('icon', async (_e, p) => {
  if (!p) return null;
  if (iconCache.has(p)) return iconCache.get(p);
  try {
    let src = p;
    if (/\.lnk$/i.test(p)) {
      try { const l = shell.readShortcutLink(p); if (l.icon && fs.existsSync(l.icon)) src = l.icon; else if (l.target && fs.existsSync(l.target)) src = l.target; } catch {}
    }
    const img = await app.getFileIcon(src, { size: 'large' });
    const url = img.isEmpty() ? null : img.toDataURL();
    iconCache.set(p, url); return url;
  } catch { iconCache.set(p, null); return null; }
});
ipcMain.handle('dialog:pick', async (_e, kind) => {
  win.__pinned = true;
  const r = await dialog.showOpenDialog(win, {
    properties: [kind === 'folder' ? 'openDirectory' : 'openFile'],
    filters: kind === 'folder' ? [] : [{ name: 'Apps and files', extensions: ['exe', 'lnk', 'bat', 'cmd', '*'] }]
  });
  win.__pinned = false; win.focus();
  return r.canceled ? null : r.filePaths[0];
});
async function pickWith(opts) {
  win.__pinned = true;
  const r = await dialog.showOpenDialog(win, opts);
  win.__pinned = false; win.focus();
  return r.canceled ? null : r.filePaths[0];
}
ipcMain.handle('media:pick', async () => importMedia(await pickWith({
  properties: ['openFile'],
  filters: [{ name: 'GIF, images and video', extensions: MEDIA_EXT }]
})));
ipcMain.handle('media:import', (_e, p) => importMedia(p));
ipcMain.handle('themes:list', () => listThemes());
ipcMain.handle('themes:import', async (_e, p) => {
  const f = p || await pickWith({ properties: ['openFile'], filters: [{ name: 'QuickDeck theme', extensions: ['qdtheme', 'json', 'txt'] }] });
  if (!f) return { ok: false };
  try { return { ok: true, id: importThemeFile(f) }; } catch (e) { return { ok: false, error: String(e.message || e) }; }
});
ipcMain.handle('themes:paste', async () => {
  try { const txt = String(await clipboard.readText() || ''); const id = saveTheme(txt, null); config.theme = id; saveConfig(); return { ok: true, id }; }
  catch (e) { return { ok: false, error: String(e.message || e) }; }
});
ipcMain.handle('themes:delete', (_e, id) => {
  const dir = path.resolve(THEMES_DIR, String(id));
  if (!dir.startsWith(path.resolve(THEMES_DIR) + path.sep)) return false;
  fs.rmSync(dir, { recursive: true, force: true }); return true;
});
ipcMain.handle('themes:export', async (_e, theme) => {
  win.__pinned = true;
  const r = await dialog.showSaveDialog(win, { defaultPath: (theme.name || 'theme') + '.qdtheme', filters: [{ name: 'QuickDeck Theme', extensions: ['qdtheme'] }] });
  win.__pinned = false; win.focus();
  if (r.canceled || !r.filePath) return false;
  const t = { ...theme }; delete t.id; delete t.builtin;
  fs.writeFileSync(r.filePath, JSON.stringify(t, null, 2), 'utf8'); return true;
});
ipcMain.on('themes:folder', () => { fs.mkdirSync(THEMES_DIR, { recursive: true }); shell.openPath(THEMES_DIR); });
ipcMain.on('clip', (_e, text) => clipboard.writeText(String(text)));
// opens a website from inside the app (https only), then gets out of the way
ipcMain.on('open-url', (_e, url) => {
  if (!/^https:\/\//i.test(String(url))) return;
  win.__pinned = false; shell.openExternal(String(url)); hideWindow();
});
ipcMain.on('pin', (_e, v) => { win.__pinned = !!v; });
ipcMain.on('hide', hideWindow);
ipcMain.handle('reset', (_e, lang) => { config = defaultConfig(lang); saveConfig(); registerHotkey(config.hotkey); updateTrayMenu(); return config; });

// ---------- lifecycle ----------
app.on('second-instance', (_e, argv) => { showWindow(); handleThemeArgs(argv); });
app.whenReady().then(() => {
  app.setAppUserModelId('QuickDeck');
  registerMediaProtocol();
  loadConfig();
  buildIndex();
  createWindow();
  createTray();
  // Ctrl+Alt+Space is used by Claude desktop - never use it as our hotkey
  if (config.hotkey === 'Ctrl+Alt+Space') { config.hotkey = 'Ctrl+Shift+Space'; saveConfig(); }
  if (!registerHotkey(config.hotkey)) {
    const fallbacks = ['Ctrl+Shift+Space', 'Alt+Q', 'Ctrl+Shift+Q', 'Alt+`'];
    for (const k of fallbacks) {
      if (registerHotkey(k)) { config.hotkey = k; saveConfig(); break; }
    }
  }
  win.webContents.once('did-finish-load', () => {
    showWindow();
    setTimeout(() => handleThemeArgs(process.argv.slice(1)), 600);
    // dev self-check: QD_SNAP=<file.png> captures the window and quits
    if (process.env.QD_SNAP) {
      win.__pinned = true;
      setTimeout(async () => {
        if (process.env.QD_JS) await win.webContents.executeJavaScript(process.env.QD_JS).catch(e => console.error(e));
        setTimeout(async () => {
          const img = await win.webContents.capturePage();
          fs.writeFileSync(process.env.QD_SNAP, img.toPNG());
          app.isQuitting = true; app.exit(0);
        }, 800);
      }, 1500);
    }
  });
  win.webContents.on('console-message', (e) => { if (e.level === 'error' || e.level === 3) console.error('[renderer]', e.message); });
});
app.on('window-all-closed', (e) => e.preventDefault());
app.on('will-quit', () => globalShortcut.unregisterAll());
