/// <reference path="./MainScene.ts"/>
/// <reference path="./HudScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

class LolManager {

  mWorld: MainScene;
  mHud: HudScene;
  mContainer: PIXI.Container;

  constructor(world: MainScene, hud?: HudScene) {
    this.mWorld = world;
    if (hud) this.mHud = hud;
    this.mContainer = new PIXI.Container();
    this.mContainer.addChild(this.mWorld.mCamera.mContainer);
    if (hud) this.mContainer.addChild(this.mHud.mCamera.mContainer);
  }
}
