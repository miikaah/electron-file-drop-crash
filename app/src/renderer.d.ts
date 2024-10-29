export type ElectronApi = {
  crashTheApp: (paths: FileList) => Promise<any[]>;
};

declare global {
  interface Window {
    electron: ElectronApi;
  }
}
