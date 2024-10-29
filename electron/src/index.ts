import { app, BrowserWindow, ipcMain as ipc, protocol } from "electron";
import path, { sep } from "node:path";

const { NODE_ENV } = process.env;
const isTest = NODE_ENV === "test";
const isDev = NODE_ENV === "local";
const isDevOrTest = isDev || isTest;

// Note: This method can only be used before the ready event of the app module gets emitted
// and can be called only once.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: { bypassCSP: true },
  },
]);

ipc.handle("crashTheApp", async (_, paths: string[]) => {
  return [];
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1050,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      spellcheck: false,
    },
  });

  const getURL = () => {
    return isDevOrTest
      ? "http://localhost:3000"
      : `file://${path.join(app.getAppPath(), "/build/index.html")}`;
  };
  // and load the index.html of the app.
  void mainWindow.loadURL(getURL()); // Needs to be void Promise or the window won't open for whatever reason

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "right" });
  }

  // Prevent visual flash of empty frame
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // @ts-expect-error typecheck doesn't add any value here
    mainWindow = null;
  });
}

// Enable sandbox for all renderers
app.enableSandbox();

app
  .whenReady()
  .then(createWindow)
  .catch((error) => {
    console.error("Failed in whenReady", error);
    process.exit(1);
  });

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
