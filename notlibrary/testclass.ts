// Testing file
/// <reference path="./MainScene.ts"/>
/// <reference path="./Hero.ts"/>
/// <reference path="./LolScene.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Obstacle.ts"/>
/// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
/// <reference types="pixi.js"/>

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

  let myMedia = new Media();
  let mainScene = new MainScene(myConfig, myMedia);
  let hud = new HudScene(myConfig, myMedia);
  let mgr = new LolManager(mainScene, hud);
  let game = new Lol(mgr, myConfig);
  document.body.appendChild(game.mRenderer.view);

  let myHero = new Hero(game, mainScene, 25, 25, heroImg);
  myHero.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, 100, 100);
  myHero.updateVelocity(speed, 0);

  mainScene.addActor(myHero, 1);
  mainScene.chaseActor(myHero);

  let Obstacle1 = new Obstacle(game, mainScene, 25, 25, obstImg);
  Obstacle1.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 0, 0);

  let Obstacle2 = new Obstacle(game, mainScene, 50, 50, obstImg);
  Obstacle2.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 200, 200);

  let Obstacle3 = new Obstacle(game, mainScene, 50, 50, obstImg);
  Obstacle3.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 75, 25);

  mainScene.addActor(Obstacle1, 0);
  mainScene.addActor(Obstacle2, 0);
  mainScene.addActor(Obstacle3, 0);

  let zoominBtn = new SceneActor(hud, zoomInImg, 25, 25);
  let zoomoutBtn = new SceneActor(hud, zoomOutImg, 25, 25);
  zoominBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 50, 10);
  zoomoutBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 10, 10);

  hud.addActor(zoominBtn, 2);
  hud.addActor(zoomoutBtn, 2);

  let upBtn = new SceneActor(hud, upImg, 25, 25);
  let downBtn = new SceneActor(hud, downImg, 25, 25);
  upBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 380);
  downBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 420);
  hud.addActor(upBtn, 2);
  hud.addActor(downBtn, 2);

  let leftBtn = new SceneActor(hud, leftImg, 25, 25);
  let rightBtn = new SceneActor(hud, rightImg, 25, 25);
  leftBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 380, 400);
  rightBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 420, 400);
  hud.addActor(leftBtn, 2);
  hud.addActor(rightBtn, 2);

  mgr.mContainer.interactive = true;
  zoominBtn.mSprite.interactive = true;
  zoomoutBtn.mSprite.interactive = true;
  upBtn.mSprite.interactive = true;
  downBtn.mSprite.interactive = true;
  leftBtn.mSprite.interactive = true;
  rightBtn.mSprite.interactive = true;
  zoominBtn.mSprite.on('click', () => mgr.mWorld.mCamera.zoomInOut(1.25));
  zoomoutBtn.mSprite.on('click', () => mgr.mWorld.mCamera.zoomInOut(0.75));
  upBtn.mSprite.on('click', () =>   myHero.updateVelocity(0, -speed));
  downBtn.mSprite.on('click', () =>   myHero.updateVelocity(0, speed));
  leftBtn.mSprite.on('click', () =>   myHero.updateVelocity(-speed, 0));
  rightBtn.mSprite.on('click', () =>   myHero.updateVelocity(speed, 0));

  // mgr.mWorld.mWorld.SetContactListener(new (class myContactListener extends PhysicsType2d.Dynamics.ContactListener {
  //   constructor() {
  //     super();
  //   }
  //   public BeginContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
  //     console.log("CONTACT!");
  //   }
  //   public EndContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
  //   }
  //   public PreSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, oldManifold: PhysicsType2d.Collision.Manifold): void {
  //   }
  //   public PostSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, impulse: PhysicsType2d.Dynamics.ContactImpulse): void {
  //   }
  // })());

  requestAnimationFrame(() => gameLoop2(game));
}

function gameLoop2(game: Lol) {
  game.render();
  requestAnimationFrame(() => gameLoop2(game));
}
