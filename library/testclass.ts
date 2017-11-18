// Testing file
/// <reference path="./MainScene.ts"/>
/// <reference path="./Hero.ts"/>
/// <reference path="./LolScene.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Obstacle.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference types="pixi.js"/>

let heroImg = "./images/OrangeBox.png";
let obstImg = "./images/BlueBox.png"
let zoomInImg = "./images/ZoomIn.png";
let zoomOutImg = "./images/ZoomOut.png";
let upImg = "./images/up_arrow.png";
let downImg = "./images/down_arrow.png"
let leftImg = "./images/left_arrow.png";
let rightImg = "./images/right_arrow.png";

PIXI.loader
.add(heroImg)
.add(obstImg)
.add(zoomInImg)
.add(zoomOutImg)
.add(upImg)
.add(downImg)
.add(leftImg)
.add(rightImg)
.load(() => main(20));


function main(speed: number) {
  let myConfig = new (class _ extends Config {
    constructor() {
      super();
      this.mWidth = 512;
      this.mHeight = 512;
      this.mPixelMeterRatio = 1;
    }
  })

  //let myMedia = new Media();
  //let mainScene = new MainScene(myConfig, myMedia);
  //let hud = new HudScene(myConfig, myMedia);
  let game = new Lol(myConfig);
  game.create();
  document.body.appendChild(game.mRenderer.view);

  //mgr.mHud.addText(400, 0, "Arial", "Blue", 24, "Score: ", "", mgr.mGoodiesCollected[1], 2);

  //let myHero = new Hero(game, mainScene, 25, 25, heroImg);
  //myHero.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, 100, 100);
  //myHero.updateVelocity(speed, 0);

  let myHero = game.mManager.mLevel.makeHeroAsBox(100, 100, 25, 25, heroImg);
  game.mManager.mLevel.setCameraChase(myHero);
  game.mManager.mLevel.setArrowKeyControls(myHero, 25);
  //game.mManager.mWorld.mChaseActor = myHero;

  // let Obstacle1 = new Obstacle(game, mainScene, 25, 25, obstImg);
  // Obstacle1.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 0, 0);
  let Obstacle1 = game.mManager.mLevel.makeObstacleAsBox(0, 0, 25, 25, obstImg);

  // let Obstacle2 = new Obstacle(game, mainScene, 50, 50, obstImg);
  // Obstacle2.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 200, 200);
  let Obstacle2 = game.mManager.mLevel.makeObstacleAsBox(200, 200, 50, 50, obstImg);

  // let Obstacle3 = new Obstacle(game, mainScene, 50, 50, obstImg);
  // Obstacle3.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 75, 25);
  let Obstacle3 = game.mManager.mLevel.makeObstacleAsBox(75, 75, 50, 50, obstImg);

  // mainScene.addActor(Obstacle1, 0);
  // mainScene.addActor(Obstacle2, 0);
  // mainScene.addActor(Obstacle3, 0);

  let zoominBtn = new SceneActor(game.mManager.mHud, zoomInImg, 25, 25);
  let zoomoutBtn = new SceneActor(game.mManager.mHud, zoomOutImg, 25, 25);
  zoominBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 50, 10);
  zoomoutBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 10, 10);

  game.mManager.mHud.addActor(zoominBtn, 2);
  game.mManager.mHud.addActor(zoomoutBtn, 2);

  let upBtn = new SceneActor(game.mManager.mHud, upImg, 25, 25);
  let downBtn = new SceneActor(game.mManager.mHud, downImg, 25, 25);
  upBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 380);
  downBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 420);
  game.mManager.mHud.addActor(upBtn, 2);
  game.mManager.mHud.addActor(downBtn, 2);

  let leftBtn = new SceneActor(game.mManager.mHud, leftImg, 25, 25);
  let rightBtn = new SceneActor(game.mManager.mHud, rightImg, 25, 25);
  leftBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 380, 400);
  rightBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 420, 400);
  game.mManager.mHud.addActor(leftBtn, 2);
  game.mManager.mHud.addActor(rightBtn, 2);

  game.mManager.mContainer.interactive = true;
  zoominBtn.mSprite.interactive = true;
  zoomoutBtn.mSprite.interactive = true;
  upBtn.mSprite.interactive = true;
  downBtn.mSprite.interactive = true;
  leftBtn.mSprite.interactive = true;
  rightBtn.mSprite.interactive = true;
  zoominBtn.mSprite.on('click', () => game.mManager.mWorld.mCamera.zoomInOut(1.25));
  zoomoutBtn.mSprite.on('click', () => game.mManager.mWorld.mCamera.zoomInOut(0.75));
  upBtn.mSprite.on('click', () =>   myHero.updateVelocity(0, -speed));
  downBtn.mSprite.on('click', () =>   myHero.updateVelocity(0, speed));
  leftBtn.mSprite.on('click', () =>   myHero.updateVelocity(-speed, 0));
  rightBtn.mSprite.on('click', () =>   myHero.updateVelocity(speed, 0));

  requestAnimationFrame(() => gameLoop2(game));
}

function gameLoop2(game: Lol) {
  game.render();
  requestAnimationFrame(() => gameLoop2(game));
}
