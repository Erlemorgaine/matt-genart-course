const electron = require("electron");

const { app, BrowserWindow } = electron;

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
  });

  mainWindow.setTitle("Rock_shader");
  mainWindow.loadFile("shader-sphere.js");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});
