const { contextBridge, ipcRenderer: ipc, webUtils } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  crashTheApp: (files) => {
    const paths = [];
    for (let i = 0; i < Object.keys(files).length; i++) {
      paths.push(webUtils.getPathForFile(files[i]));
    }
    return ipc.invoke("crashTheApp", paths);
  },
});
