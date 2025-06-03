const { contextBridge, ipcRenderer } = require("electron");

console.log('[preload] Loaded!');

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  chooseFile: () => ipcRenderer.invoke("dialog:selectFile"),
  loadImageBase64: (filePath) => ipcRenderer.invoke("load-image-base64", filePath),
  dirReadImages: (directory) => ipcRenderer.invoke("directory:readImages", directory),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printPhoto: (printData) => ipcRenderer.invoke('print-photo', printData),
  compressImages: (folder, output) => ipcRenderer.invoke('compress-images-folder', folder, output),
  alert: (title, message) => ipcRenderer.invoke('alert', title, message),
  unmaximizeWindow: () => ipcRenderer.invoke('unmaximize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  
  // Data Communication Main Process with Renderer
  sendChannel: (channel, data) => ipcRenderer.send(channel, data),
  receiveChannel: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },

  getTemplates: () => ipcRenderer.invoke("db:getTemplates"),
  getTemplate: (id) => ipcRenderer.invoke("db:getTemplate", id),
  saveTemplate: (id, data) => ipcRenderer.invoke("db:saveTemplate", id, data),
  deleteTemplate: (id) => ipcRenderer.invoke("db:deleteTemplate", id),
  saveFrame: (tplId, frame) => ipcRenderer.invoke("db:saveFrame", tplId, frame),
  updateFrame: (tplId, frameId, update) => ipcRenderer.invoke("db:updateFrame", tplId, frameId, update),
  deleteFrame: (tplId, frameId) => ipcRenderer.invoke("db:deleteFrame", tplId, frameId),
  uploadTemplate: (fileName, dataUrl) => ipcRenderer.invoke("template:upload", fileName, dataUrl),

  getSetting: () => ipcRenderer.invoke("db:getSetting"),
  saveSetting: (data) => ipcRenderer.invoke("db:saveSetting", data),
});