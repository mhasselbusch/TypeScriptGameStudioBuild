/// <reference path="./LolManager.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

class Lol {
  mManager: LolManager;
  mRenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  mConfig: Config;

  constructor(manager: LolManager, config: Config) {
    this.mManager = manager;
    this.mConfig = config;
    this.mRenderer = PIXI.autoDetectRenderer(config.mWidth, config.mHeight);
  }

  /**
   * This code is called every 1/45th of a second to update the game state and re-draw the screen
   * <p>
   * NB: This is an internal method. User code should never call this.
   */
  render() {
    this.mManager.mWorld.mWorld.Step(1/45, 8, 3);
    this.mManager.mWorld.mCamera.updatePosition();
    this.mManager.mWorld.render();
    this.mManager.mHud.render();
    this.mRenderer.render(this.mManager.mContainer);
    this.mManager.mWorld.mOneTimeEvents.forEach((pe) => {
       pe.go();
    });
    this.mManager.mWorld.mOneTimeEvents.length = 0;
  }
}
