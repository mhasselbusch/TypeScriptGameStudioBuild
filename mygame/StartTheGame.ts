/// <reference path="../library/Config.ts"/>
/// <reference path="../library/Lol.ts"/>
/// <reference path="../library/Level.ts"/>
/// <reference path="./MyConfig.ts"/>
/// <reference path="../library/typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
/// <reference path="../library/typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

function runGame(id : string){
  PIXI.utils.sayHello("Hello");

  let myConfig = new MyConfig();

  let game = new Lol(myConfig);
  game.create();
  document.getElementById(id).appendChild(game.mRenderer.view);
  requestAnimationFrame(() => gameLoop(game));
}

function gameLoop(game: Lol) {
  game.render();
  requestAnimationFrame(() => gameLoop(game));
}
