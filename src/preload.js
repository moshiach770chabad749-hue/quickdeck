const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('qd', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (c) => ipcRenderer.invoke('config:save', c),
  listApps: () => ipcRenderer.invoke('apps:list'),
  refreshApps: () => ipcRenderer.invoke('apps:refresh'),
  launch: (item) => ipcRenderer.invoke('launch', item),
  icon: (p) => ipcRenderer.invoke('icon', p),
  pick: (kind) => ipcRenderer.invoke('dialog:pick', kind),
  pickMedia: () => ipcRenderer.invoke('media:pick'),
  importMedia: (p) => ipcRenderer.invoke('media:import', p),
  listThemes: () => ipcRenderer.invoke('themes:list'),
  importTheme: (p) => ipcRenderer.invoke('themes:import', p),
  pasteTheme: () => ipcRenderer.invoke('themes:paste'),
  deleteTheme: (id) => ipcRenderer.invoke('themes:delete', id),
  exportTheme: (t) => ipcRenderer.invoke('themes:export', t),
  themesFolder: () => ipcRenderer.send('themes:folder'),
  copy: (text) => ipcRenderer.send('clip', text),
  openUrl: (url) => ipcRenderer.send('open-url', url),
  pin: (v) => ipcRenderer.send('pin', v),
  hide: () => ipcRenderer.send('hide'),
  reset: (lang) => ipcRenderer.invoke('reset', lang),
  pathForFile: (f) => { try { return webUtils.getPathForFile(f); } catch { return f.path || ''; } },
  on: (ch, fn) => ipcRenderer.on(ch, (_e, data) => fn(data))
});
