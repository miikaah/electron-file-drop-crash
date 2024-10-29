export const crashTheApp = async (paths: FileList): Promise<any[]> => {
  return window.electron.crashTheApp(paths);
};
