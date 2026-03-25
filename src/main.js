import { Game } from "./core/Game.js";

const appRoot = document.getElementById("app");
const hudRoot = document.getElementById("hud");

if (!appRoot || !hudRoot) {
  throw new Error("Missing app or HUD root element in index.html");
}

const game = new Game({
  mountElement: appRoot,
  hudElement: hudRoot,
});

game.start();
