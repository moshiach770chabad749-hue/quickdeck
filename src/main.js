// QuickDeck - main process
const { app, BrowserWindow, globalShortcut, ipcMain, shell, Tray, Menu, nativeImage, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
let win = null;
let tray = null;
let config = null;
let appIndex = [];
const iconCache = new Map();

// ---------- config ----------
function uid() { return Math.random().toString(36).slice(2, 10); }

function defaultConfig() {
  const t = (label, icon, color, type, target) => ({ id: uid(), label, icon, color, type, target });
  return {
    hotkey: 'Ctrl+Shift+Space',
    cols: 5,
    rows: 3,
    accent: '#7c5cff',
    openAtLogin: false,
    pages: [
      {
        id: uid(), name: 'ראשי',
        tiles: [
          t('סייר קבצים', '📁', '#f5a524', 'app', 'explorer.exe'),
          t('שולחן עבודה', '🖥️', '#3b82f6', 'folder', app.getPath('desktop')),
          t('הורדות', '⬇️', '#10b981', 'folder', app.getPath('downloads')),
          t('מסמכים', '📄', '#6366f1', 'folder', app.getPath('documents')),
          t('מחשבון', '🧮', '#64748b', 'app', 'calc.exe'),
          t('Google', '🔍', '#ea4335', 'url', 'https://www.google.com'),
          t('YouTube', '▶️', '#ff0033', 'url', 'https://www.youtube.com'),
          t('WhatsApp', '💬', '#25d366', 'url', 'https://web.whatsapp.com'),
          t('צילום מסך', '✂️', '#ec4899', 'url', 'ms-screenclip:'),
          t('הגדרות', '⚙️', '#475569', 'url', 'ms-settings:'),
          t('נעילת מחשב', '🔒', '#ef4444', 'command', 'rundll32.exe user32.dll,LockWorkStation'),
          t('מנהל משימות', '📊', '#0ea5e9', 'app', 'taskmgr.exe'),
          t('פנקס רשימות', '📝', '#a855f7', 'app', 'notepad.exe'),
          t('סל מחזור', '🗑️', '#78716c', 'url', 'shell:RecycleBinFolder'),
          null
        ]
      },
      { id: uid(), name: 'עבודה', tiles: [] }
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
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'פתח את QuickDeck', click: showWindow },
    { label: 'רענן רשימת תוכנות', click: buildIndex },
    { type: 'separator' },
    { label: 'יציאה', click: () => { app.isQuitting = true; app.quit(); } }
  ]));
  tray.on('click', toggleWindow);
}

// ---------- launching ----------
async function launch(item) {
  const { type, target } = item;
  if (!target) return { ok: false, error: 'אין יעד' };
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

// ---------- IPC ----------
ipcMain.handle('config:get', () => config);
ipcMain.handle('config:save', (_e, c) => {
  const hotkeyChanged = c.hotkey !== config.hotkey;
  config = c; saveConfig();
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
    filters: kind === 'folder' ? [] : [{ name: 'תוכנות וקבצים', extensions: ['exe', 'lnk', 'bat', 'cmd', '*'] }]
  });
  win.__pinned = false; win.focus();
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.on('pin', (_e, v) => { win.__pinned = !!v; });
ipcMain.on('hide', hideWindow);
ipcMain.handle('reset', () => { config = defaultConfig(); saveConfig(); registerHotkey(config.hotkey); return config; });

// ---------- lifecycle ----------
app.on('second-instance', showWindow);
app.whenReady().then(() => {
  app.setAppUserModelId('QuickDeck');
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
