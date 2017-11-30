/// <reference path="./Camera.ts" />
/// <reference path="./LolAction.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
// ^this isn't working properly right now

/**
 * LolScene is the parent of all Scene types
 * <p>
 * A Scene consists of a physics world and a bunch of actors who exist within that world.  Notably,
 * a Scene can be rendered, which advances its physics world.
 * <p>
 * There is a close relationship between a BaseActor and a LolScene, namely that a BaseActor should
 * not need any scene functionality that is not present in LolScene.
 */
abstract class LolScene {
  /// A reference to the game-wide configuration variables
  readonly mConfig: Config;
  /// A reference to the object that stores all of the sounds and images we use in the game
  readonly mMedia: Media;

  /// The physics world in which all actors interact
  readonly mWorld: PhysicsType2d.Dynamics.World;
  /// Anything in the world that can be rendered, in 5 planes [-2, -1, 0, 1, 2]
  readonly mRenderables: Array<Array<Renderable>>;

  // The container to group sprites for rendering
  mContainer: PIXI.Container;

  // The camera will make sure important actors are on screen
  readonly mCamera: Camera;

  /// We use this to avoid garbage collection when converting screen touches to camera coordinates
  readonly mCamBound: PhysicsType2d.Vector2;

  /// This callback is used to get a touched actor from the physics world
  //final mTouchCallback: QueryCallback;
  /// When there is a touch of an actor in the physics world, this is how we find it
  mHitActor: BaseActor

  /// Use this for determining bounds of text boxes
  //private final mGlyphLayout: GlyphLayout;
  /// Actions that run in response to a screen tap
  //final mTapHandlers: ArrayList<TouchEventHandler>;

  /// Events that get processed on the next render, then discarded
  readonly mOneTimeEvents: Array<LolAction>;
  /// Events that get processed on every render
  readonly mRepeatEvents: Array<LolAction>;

  /**
   * Construct a new scene
   *
   * @param media  All image and sound assets for the game
   * @param config The game-wide configuration
   */
  constructor(config: Config, media: Media) {
    this.mContainer = new PIXI.Container();

    this.mConfig = config;
    this.mMedia = media;

    let w = config.mWidth / config.mPixelMeterRatio;
    let h = config.mHeight / config.mPixelMeterRatio;

    this.mContainer.position.x = 0;
    this.mContainer.position.y = 0;
    // set up the event lists
    this.mOneTimeEvents = new Array<LolAction>();
    //this.mRepeatEvents = new ArrayList<>();

    // set up the game camera, with (0, 0) in the bottom left
    this.mCamera = new Camera(w, h);
    this.mCamera.setPosition(w / 2, h / 2);
    this.mCamera.setZoom(1);

    // set default camera bounds
    this.mCamBound = new PhysicsType2d.Vector2(w, h);

    // create a world with no default gravitational forces
    this.mWorld = new PhysicsType2d.Dynamics.World(new PhysicsType2d.Vector2(0, 0));

    // set up the containers for holding anything we can render
    this.mRenderables = new Array<Array<Renderable>>(5);
    for (let i = 0; i < 5; ++i) {
      this.mRenderables[i] = new Array<Renderable>();
    }
  }

  /**
   * Add an actor to the level, putting it into the appropriate z plane
   *
   * @param actor  The actor to add
   * @param zIndex The z plane. valid values are -2, -1, 0, 1, and 2. 0 is the default.
   */
  addActor(actor: Renderable, zIndex: number) {
    // Coerce index into legal range, then add the actor
    zIndex = (zIndex < -2) ? -2 : zIndex;
    zIndex = (zIndex > 2) ? 2 : zIndex;
    this.mRenderables[zIndex+2].push(actor);

    if(actor.mSprite) this.mContainer.addChild(actor.mSprite);
    if(actor.mText) this.mContainer.addChild(actor.mText);
    this.mCamera.mContainer.addChild(this.mContainer);
  }

  /**
  * Remove an actor from its z plane
  *
  * @param actor  The actor to remove
  * @param zIndex The z plane where it is expected to be
  */
  removeActor(actor: Renderable, zIndex: number): void {
    // Coerce index into legal range, then remove the actor
    zIndex = (zIndex < -2) ? -2 : zIndex;
    zIndex = (zIndex > 2) ? 2 : zIndex;
    let i = this.mRenderables[zIndex + 2].indexOf(actor);
    this.mRenderables[zIndex + 2].splice(i, 1);
  }

  /**
  * Reset a scene by clearing all of its lists
  */
  reset(): void {
    //this.mTapHandlers.length = 0;
    this.mOneTimeEvents.length = 0;
    this.mRepeatEvents.length = 0;
    for (let a of this.mRenderables) {
      a.length = 0;
    }
  }

  /**
  * Add an image to the scene.  The image will not have any physics attached to it.
  *
  * @param x       The X coordinate of the top left corner, in meters
  * @param y       The Y coordinate of the top left corner, in meters
  * @param width   The image width, in meters
  * @param height  The image height, in meters
  * @param imgName The file name for the image, or ""
  * @param zIndex  The z index of the text
  * @return A Renderable of the image, so it can be enabled/disabled by program code
  */
  public makePicture(x: number, y: number, width: number,
    height: number, imgName: string, zIndex: number): Renderable {
      // set up the image to display
      // NB: this will fail gracefully (no crash) for invalid file names
      //final TextureRegion tr = mMedia.getImage(imgName);
      let r: Renderable = new (class _ extends Renderable {
        //@Override
        public onRender(): void {
        }
      })();
      r.mSprite = PIXI.Sprite.fromImage(imgName);
      this.addActor(r, zIndex);
      return r;
    }

  /**
   * Draw some text in the scene, using a top-left coordinate
   *
   * @param x         The x coordinate of the top left corner
   * @param y         The y coordinate of the top left corner
   * @param fontName  The name of the font to use
   * @param fontColor The color of the font
   * @param fontSize  The size of the font
   * @param prefix    Prefix text to put before the generated text
   * @param suffix    Suffix text to put after the generated text
   * @param tp        A TextProducer that will generate the text to display
   * @param zIndex    The z index of the text
   * @return A Renderable of the text, so it can be enabled/disabled by program code
   */
   public addText(x: number, y: number, fontName: string,
                   fontColor: string, fontSize: number, prefix: string,
                   suffix: string, tp: TextProducer, zIndex: number): Renderable {

      // Create a renderable that updates its text on every render, and add it to the scene
      let d: Renderable = new (class _ extends Renderable {
          //@Override
          onRender(): void {}
      })();
      let txt: string = prefix + tp.makeText() + suffix;
      let newText = new PIXI.Text(txt, {fontFamily: fontName, fontSize: fontSize, fill: fontColor, align: 'center'});
      d.mText = newText;
      d.mText.position.x = x;
      d.mText.position.y = y;
      this.addActor(d, zIndex);
      return d;
  }

  /**
   * Draw some text in the scene, using a bottom-left coordinate
   *
   * @param x         The x coordinate of the bottom left corner
   * @param y         The y coordinate of the bottom left corner
   * @param fontName  The name of the font to use
   * @param fontColor The color of the font
   * @param fontSize  The size of the font
   * @param text      Text to put on screen
   * @param zIndex    The z index of the text
   * @return A Renderable of the text, so it can be enabled/disabled by program code
   */
  public addStaticText(x: number, y: number, fontName: string, fontColor: number,
                fontSize: number, text: string, zIndex: number): Renderable {

      // Create a renderable that updates its text on every render, and add it to the scene
      let d: Renderable = new (class _ extends Renderable {
          //@Override
          onRender(): void {}
      })();
      let newText = new PIXI.Text(text, {fontFamily: fontName, fontSize: fontSize, fill: fontColor, align: 'center'});
      d.mText = newText;
      d.mText.position.x = x;
      d.mText.position.y = y;
      this.addActor(d, zIndex);
      return d;
  }

  /**
   * Draw some text in the scene, centering it on a specific point
   *
   * @param centerX   The x coordinate of the center
   * @param centerY   The y coordinate of the center
   * @param fontName  The name of the font to use
   * @param fontColor The color of the font
   * @param fontSize  The size of the font
   * @param prefix    Prefix text to put before the generated text
   * @param suffix    Suffix text to put after the generated text
   * @param tp        A TextProducer that will generate the text to display
   * @param zIndex    The z index of the text
   * @return A Renderable of the text, so it can be enabled/disabled by program code
   */
  public addTextCentered(centerX: number, centerY: number, fontName: string,
                          fontColor: string, fontSize: number, prefix: string,
                          suffix: string, tp: TextProducer, zIndex: number): Renderable {

      // Create a renderable that updates its text on every render, and add it to the scene
      let d: Renderable = new (class _ extends Renderable {
          //@Override
          onRender(): void {}
      })();
      let txt: string = prefix + tp.makeText() + suffix;
      let newText = new PIXI.Text(txt, {fontFamily: fontName, fontSize: fontSize, fill: fontColor, align: 'center'});
      d.mText = newText;
      d.mText.position.x = centerX;
      d.mText.position.y = centerY;
      this.addActor(d, zIndex);
      return d;
  }

  /**
   * Render this scene
   *
   * @param sb    The SpriteBatch used to render the scene
   * @param delta The time since the last render
   * @return True if the scene was rendered, false if it was not
   */
  abstract render(): boolean;
}
