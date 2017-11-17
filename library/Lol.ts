/// <reference path="./LolManager.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

class Lol {
  mManager: LolManager;
  mRenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  mConfig: Config;
  mMedia: Media;

  constructor(config: Config) {
    this.mConfig = config;
    this.mRenderer = PIXI.autoDetectRenderer(config.mWidth, config.mHeight);
  }

  /**
   * App creation lifecycle event.
   * NB: This is an internal method for initializing a game. User code should never call this.
   */
  public create(): void {
      // We want to intercept 'back' button presses, so that we can poll for them in
      // <code>render</code> and react accordingly
      //Gdx.input.setCatchBackKey(true);

      // The config object has already been set, so we can load all assets
      this.mMedia = new Media(this.mConfig);

      // Configure the objects we need in order to render
      //mDebugRender = new Box2DDebugRenderer();
      //mSpriteBatch = new SpriteBatch();

      // Configure the input handlers.  We process gestures first, and if no gesture occurs, then
      // we look for a non-gesture touch event
      //InputMultiplexer mux = new InputMultiplexer();
      //mux.addProcessor(new GestureDetector(new LolGestureManager()));
      //mux.addProcessor(new LolInputManager());
      //Gdx.input.setInputProcessor(mux);

      // configure the volume
      //if (getGameFact(mConfig, "volume", 1) == 1)
      //    putGameFact(mConfig, "volume", 1);

      // this.mConfig.mImageNames.forEach( (e) => {
      //   PIXI.loader.add(e);
      // } );
      // PIXI.loader.load();

      // Create the level manager, and instruct it to transition to the Splash screen
      this.mManager = new LolManager(this.mConfig, this.mMedia, this);
      this.mManager.doSplash();
  }

  /**
   * This code is called every 1/45th of a second to update the game state and re-draw the screen
   * <p>
   * NB: This is an internal method. User code should never call this.
   */
  render() {
    this.mManager.mWorld.mWorld.Step(1/45, 8, 3);
    this.mManager.mWorld.adjustCamera();
    //this.mManager.mWorld.mCamera.updatePosition();
    this.mManager.mWorld.render();
    this.mManager.mHud.render();
    this.mRenderer.render(this.mManager.mContainer);
    this.mManager.mWorld.mOneTimeEvents.forEach((pe) => {
       pe.go();
    });
    this.mManager.mWorld.mOneTimeEvents.length = 0;
  }
}
