/// <reference path="./LolManager.ts"/>
/// <reference path="./LolScene.ts"/>

class Lol {
  /// The Manager object handles scores, screen management, and transitions among screens
  mManager: LolManager;
  /// mRenderer renders the game
  mRenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  /// mConfig stores the configuration state of the game.
  readonly mConfig: Config;
  /// mMedia stores all the images, sounds, and fonts for the game
  mMedia: Media;

  constructor(config: Config) {
    this.mConfig = config;
    this.mRenderer = PIXI.autoDetectRenderer(config.mWidth, config.mHeight);
  }

  /**
   * We use this to write messages to the console
   *
   * @param config The game-wide configuration
   * @param tag    The message tag
   * @param text   The message text
   */
  static message(config: Config, tag: string, text: string): void {
    console.log(tag + " " +  text);
  }

  /**
   * App creation lifecycle event.
   * NB: This is an internal method for initializing a game. User code should never call this.
   */
  public create(): void {
      // The config object has already been set, so we can load all assets
      this.mMedia = new Media(this.mConfig);

      // Create the level manager, and instruct it to transition to the Splash screen
      this.mManager = new LolManager(this.mConfig, this.mMedia, this);
      // This makes sure all textures are loaded before we show the splash screen
      PIXI.loader.load(() => this.mManager.doSplash());
  }

  /**
   * This code is called every 1/45th of a second to update the game state and re-draw the screen
   * <p>
   * NB: This is an internal method. User code should never call this.
   */
  render() {
    this.mManager.mWorld.mWorld.Step(1 / 45, 8, 3);

    // Make sure the music is playing... Note that we start music before the PreScene shows
    this.mManager.mWorld.playMusic();
    // Adjust camera in case it is following an actor
    this.mManager.mWorld.adjustCamera();
    this.mManager.mWorld.render();
    this.mManager.mHud.render();
    // Render everything using the PIXI renderer
    this.mRenderer.render(this.mManager.mContainer);
    // Execute any one time events
    this.mManager.mWorld.mOneTimeEvents.forEach((pe) => {
      if(pe.mIsActive)
        pe.go();
    });
    // This empties the list so we don't execute the events again
    this.mManager.mWorld.mOneTimeEvents.length = 0;

    this.mManager.mWorld.mRepeatEvents.forEach((pe) => {
      if(pe.mIsActive)
        pe.go();
    });

    // Update the win/lose timers
    this.mManager.updateTimeCounts();
  }
}
