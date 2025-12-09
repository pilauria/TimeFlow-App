export {};

declare global {
  interface Window {
    ipcRenderer: {
      toggleMiniMode: (shouldBeMini: boolean) => void;
      send: typeof import('electron').ipcRenderer.send;
      invoke: typeof import('electron').ipcRenderer.invoke;
      on: typeof import('electron').ipcRenderer.on;
      off: typeof import('electron').ipcRenderer.off;
    };
  }
}
