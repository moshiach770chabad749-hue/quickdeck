const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('qd', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (c) => ipcRenderer.invoke('config:save', c),
  listApps: () => ipcRenderer.invoke('apps:list'),
  refreshApps: () => ipcRenderer.invoke('apps:refresh'),
  launch: (item) => ipcRenderer.invoke('launch', item),
  icon: (p) => ipcRenderer.invoke('icon', p),
  pick: (kind) => ipcRenderer.invoke('dialog:pick', kind),
  pin: (v) => ipcRenderer.send('pin', v),
  hide: () => ipcRenderer.send('hide'),
  reset: () => ipcRenderer.invoke('reset'),
  pathForFile: (f) => { try { return webUtils.getPathForFile(f); } catch { return f.path || ''; } },
  on: (ch, fn) => ipcRenderer.on(ch, () => fn())
});
