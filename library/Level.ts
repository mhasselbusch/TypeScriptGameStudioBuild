/// <reference path="./SceneActor.ts"/>

/**
* Level provides a broad, public, declarative interface to the core functionality of LibLOL.
* <p>
* Game designers will spend most of their time in the <code>display</code> function of the various
* <code>ScreenManager</code> objects that comprise the game (i.e., Chooser, Help, Levels, Splash,
* Store).  Within that function, a <code>Level</code> object is available.  It corresponds to a
* pre-configured, blank, interactive portion of the game.  By calling functions on the level, a
* programmer can realize their game.
* <p>
* Conceptually, a Level consists of many screens:
* <ul>
* <li>MainScreen: This is where the Actors of the game are drawn</li>
* <li>Hud: A heads-up display onto which text and input controls can be drawn</li>
* <li>PreScene: A quick scene to display before the level starts</li>
* <li>PostScene (WinScene or LoseScene): Two quick scenes to display at the end of the level</li>
* <li>PauseScene: A scene to show when the game is paused</li>
* </ul>
*/
class Level {
  /// A reference to the game object, so we can access session facts and the state machine
  private readonly mGame: Lol;
  /// A reference to the game-wide configuration variables
  protected readonly mConfig: Config;
  /// A reference to the object that stores all of the sounds and images we use in the game
  protected readonly mMedia: Media;

  /**
  * Construct a level.  Since Level is merely a facade, this method need only store references to
  * the actual game objects.
  *
  * @param config The configuration object describing this game
  * @param media  References to all image and sound assets
  * @param game   The top-level game object
  */
  constructor(config: Config, media: Media, game: Lol) {
    // save game configuration information
    this.mGame = game;
    this.mConfig = config;
    this.mMedia = media;
  }


  /**
  * Configure the camera bounds for a level
  * <p>
  * TODO: set upper and lower bounds, instead of assuming a lower bound of (0, 0)
  *
  * @param width  width of the camera
  * @param height height of the camera
  */
  public setCameraBounds(width: number, height: number): void {
    this.mGame.mManager.mWorld.mCamBound.Set(width, height);

    // warn on strange dimensions
    if (width < this.mConfig.mWidth / this.mConfig.mPixelMeterRatio)
      Lol.message(this.mConfig, "Warning", "Your game width is less than 1/10 of the screen width");
    if (height < this.mConfig.mHeight / this.mConfig.mPixelMeterRatio)
      Lol.message(this.mConfig, "Warning", "Your game height is less than 1/10 of the screen height");
  }

  /**
  * Identify the actor that the camera should try to keep on screen at all times
  *
  * @param actor The actor the camera should chase
  */
  public setCameraChase(actor: WorldActor): void {
    this.mGame.mManager.mWorld.mChaseActor = actor;
  }

  /**
  * Set the background music for this level
  *
  * @param musicName Name of the Music file to play
  */
  public setMusic(musicName: string): void {
    this.mGame.mManager.mWorld.mMusic = this.mMedia.getMusic(musicName);
  }

  // /**
  // * Specify that you want some code to run after a fixed amount of time passes.
  // *
  // * @param howLong  How long to wait before the timer code runs
  // * @param callback The code to run
  // */
  // public void setTimerCallback(float howLong, final LolAction callback) {
  //   Timer.schedule(new Timer.Task() {
  //     @Override
  //     public void run() {
  //       if (!mGame.mManager.mGameOver)
  //       callback.go();
  //     }
  //   }, howLong);
  // }
  //
  // /**
  // * Specify that you want some code to run repeatedly
  // *
  // * @param howLong  How long to wait before the timer code runs for the first time
  // * @param interval The time between subsequent executions of the code
  // * @param callback The code to run
  // */
  // public void setTimerCallback(float howLong, float interval, final LolAction callback) {
  //   Timer.schedule(new Timer.Task() {
  //     @Override
  //     public void run() {
  //       if (!mGame.mManager.mGameOver)
  //       callback.go();
  //     }
  //   }, howLong, interval);
  // }
  //
  // /**
  // * Turn on scribble mode, so that scene touch events draw circular objects
  // * <p>
  // * Note: this code should be thought of as serving to demonstrate, only. If you really wanted to
  // * do anything clever with scribbling, you'd certainly want to change this code.
  // *
  // * @param imgName          The name of the image to use for scribbling
  // * @param width            Width of the individual components of the scribble
  // * @param height           Height of the individual components of the scribble
  // * @param interval         Time (in milliseconds) that must transpire between scribble events...
  // *                         use this to avoid outrageously high rates of scribbling
  // * @param onCreateCallback A callback to run in order to modify the scribble behavior. The
  // *                         obstacle that is drawn in the scribble will be passed to the callback
  // */
  // public void setScribbleMode(final String imgName, final float width, final float height,
  //   final int interval, final LolActorEvent onCreateCallback) {
  //     // we set a callback on the Level, so that any touch to the level (down, drag, up) will
  //     // affect our scribbling
  //     mGame.mManager.mWorld.mPanHandlers.add(new PanEventHandler() {
  //       /// The time of the last touch event... we use this to prevent high rates of scribble
  //       long mLastTime;
  //
  //       /**
  //       * Draw a new obstacle if enough time has transpired
  //       */
  //       public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
  //         // check if enough milliseconds have passed
  //         long now = System.currentTimeMillis();
  //         if (now < mLastTime + interval) {
  //           return true;
  //         }
  //         mLastTime = now;
  //
  //         // make a circular obstacle
  //         final Obstacle o = makeObstacleAsCircle(worldX - width / 2, worldY - height / 2,
  //           width, height, imgName);
  //           if (onCreateCallback != null) {
  //             onCreateCallback.go(o);
  //           }
  //
  //           return true;
  //         }
  //       });
  //     }

  /**
  * Manually set the zoom level of the game
  *
  * @param zoom The amount of zoom (1 is no zoom, >1 zooms out)
  */
  public setZoom(zoom: number): void {
    this.mGame.mManager.mWorld.mCamera.setZoom(zoom);
    //this.mGame.mManager.mBackground.mBgCam.zoom = zoom;
    //this.mGame.mManager.mForeground.mBgCam.zoom = zoom;
  }

  /**
  * Register a callback so that custom code will run when the level is won
  *
  * @param callback The code to run
  */
  public setWinCallback(callback: LolAction): void {
    this.mGame.mManager.mWinCallback = callback;
  }

  /**
  * Register a callback so that custom code will run when the level is lost
  *
  * @param callback The code to run
  */
  public setLoseCallback(callback: LolAction): void {
    this.mGame.mManager.mLoseCallback = callback;
  }


  /**
  * Manually increment the number of goodies of type 1 that have been collected.
  */
  public incrementGoodiesCollected1(): void {
    this.mGame.mManager.mGoodiesCollected[0]++;
  }

  /**
  * Manually increment the number of goodies of type 2 that have been collected.
  */
  public incrementGoodiesCollected2(): void {
    this.mGame.mManager.mGoodiesCollected[1]++;
  }

  /**
  * Manually increment the number of goodies of type 3 that have been collected.
  */
  public incrementGoodiesCollected3(): void {
    this.mGame.mManager.mGoodiesCollected[2]++;
  }

  /**
  * Manually increment the number of goodies of type 4 that have been collected.
  */
  public incrementGoodiesCollected4(): void {
    this.mGame.mManager.mGoodiesCollected[3]++;
  }

  /**
  * Getter for number of goodies of type 1 that have been collected.
  *
  * @return The number of goodies collected.
  */
  public getGoodiesCollected1(): number {
    return this.mGame.mManager.mGoodiesCollected[0];
  }

  /**
  * Manually set the number of goodies of type 1 that have been collected.
  *
  * @param value The new value
  */
  public setGoodiesCollected1(value: number): void {
    this.mGame.mManager.mGoodiesCollected[0] = value;
  }

  /**
  * Getter for number of goodies of type 2 that have been collected.
  *
  * @return The number of goodies collected.
  */
  public getGoodiesCollected2(): number {
    return this.mGame.mManager.mGoodiesCollected[1];
  }

  /**
  * Manually set the number of goodies of type 2 that have been collected.
  *
  * @param value The new value
  */
  public setGoodiesCollected2(value: number): void {
    this.mGame.mManager.mGoodiesCollected[1] = value;
  }

  /**
  * Getter for number of goodies of type 3 that have been collected.
  *
  * @return The number of goodies collected.
  */
  public getGoodiesCollected3(): number {
    return this.mGame.mManager.mGoodiesCollected[2];
  }

  /**
  * Manually set the number of goodies of type 3 that have been collected.
  *
  * @param value The new value
  */
  public setGoodiesCollected3(value: number): void {
    this.mGame.mManager.mGoodiesCollected[2] = value;
  }

  /**
  * Getter for number of goodies of type 4 that have been collected.
  *
  * @return The number of goodies collected.
  */
  public getGoodiesCollected4(): number {
    return this.mGame.mManager.mGoodiesCollected[3];
  }

  /**
  * Manually set the number of goodies of type 4 that have been collected.
  *
  * @param value The new value
  */
  public setGoodiesCollected4(value: number): void {
    this.mGame.mManager.mGoodiesCollected[3] = value;
  }

  /**
  * Indicate that the level is won by defeating a certain number of enemies or by defeating
  * all of the enemies if not given an argument. This version is useful if the number of
  * enemies isn't known, or if the goal is to defeat all enemies before more are are created.
  *
  * @param howMany The number of enemies that must be defeated to win the level
  */
  public setVictoryEnemyCount(howMany?: number): void {
    this.mGame.mManager.mVictoryType = VictoryType.ENEMYCOUNT;
    if (howMany) {
      this.mGame.mManager.mVictoryEnemyCount = howMany;
    } else {
      this.mGame.mManager.mVictoryEnemyCount = -1;
    }
  }

  /**
  * Indicate that the level is won by collecting enough goodies
  *
  * @param v1 Number of type-1 goodies that must be collected to win the level
  * @param v2 Number of type-2 goodies that must be collected to win the level
  * @param v3 Number of type-3 goodies that must be collected to win the level
  * @param v4 Number of type-4 goodies that must be collected to win the level
  */
  public setVictoryGoodies(v1: number, v2: number, v3: number, v4: number): void {
    this.mGame.mManager.mVictoryType = VictoryType.GOODIECOUNT;
    this.mGame.mManager.mVictoryGoodieCount[0] = v1;
    this.mGame.mManager.mVictoryGoodieCount[1] = v2;
    this.mGame.mManager.mVictoryGoodieCount[2] = v3;
    this.mGame.mManager.mVictoryGoodieCount[3] = v4;
  }

  /**
  * Indicate that the level is won by having a certain number of heroes reach destinations
  *
  * @param howMany Number of heroes that must reach destinations
  */
  public setVictoryDestination(howMany: number): void {
    this.mGame.mManager.mVictoryType = VictoryType.DESTINATION;
    this.mGame.mManager.mVictoryHeroCount = howMany;
  }

  /**
  * Change the amount of time left in a countdown timer
  *
  * @param delta The amount of time to add before the timer expires
  */
  public updateTimerExpiration(delta: number): void {
    this.mGame.mManager.mLoseCountDownRemaining += delta;
  }


  /**
  * Report the number of enemies that have been defeated
  *
  * @return the number of defeated enemies
  */
  public getEnemiesDefeated(): number {
    return this.mGame.mManager.mEnemiesDefeated;
  }

  /**
  * Force the level to end in victory
  * <p>
  * This is useful in callbacks, where we might want to immediately end the game
  */
  public winLevel(): void {
    this.mGame.mManager.endLevel(true);
  }

  /**
  * Force the level to end in defeat
  * <p>
  * This is useful in callbacks, where we might want to immediately end the game
  */
  public loseLevel(): void {
    this.mGame.mManager.endLevel(false);
  }

  /**
  * Change the gravity in a running level
  *
  * @param newXGravity The new X gravity
  * @param newYGravity The new Y gravity
  */
  public resetGravity(newXGravity: number, newYGravity: number): void {
    this.mGame.mManager.mWorld.mWorld.SetGravity(new PhysicsType2d.Vector2(newXGravity, newYGravity));
  }


  /**
  * Generate text that doesn't change
  *
  * @param text The text to generate each time the TextProducer is called
  * @return A TextProducer who generates the text
  */
  public DisplayFixedText(text: string): TextProducer {
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return text;
      }
    })();
  }


  /**
  * Generate text indicating the current count of Type 1 Goodies
  */
  public DisplayGoodies1(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mGoodiesCollected[0];
      }
    })();
  }

  /**
  * Generate text indicating the current count of Type 2 Goodies
  */
  public DisplayGoodies2(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mGoodiesCollected[1];
      }
    })();
  }

  /**
  * Generate text indicating the current count of Type 3 Goodies
  */
  public DisplayGoodies3(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mGoodiesCollected[2];
      }
    })();
  }

  /**
  * Generate text indicating the current count of Type 4 Goodies
  */
  public DisplayGoodies4(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mGoodiesCollected[3];
      }
    })();
  }


  /**
  * Generate text indicating the time until the level is lost
  */
  public DisplayLoseCountdown(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mLoseCountDownRemaining;
      }
    })();
  }

  /**
  * Generate text indicating the time until the level is won
  */
  public DisplayWinCountdown(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mWinCountRemaining;
      }
    })();
  }

  /**
  * Generate text indicating the number of defeated enemies
  */
  public DisplayEnemiesDefeated(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mEnemiesDefeated;
      }
    })();
  }

  /**
  * Generate text indicating the number of defeated enemies
  */
  public DisplayRemainingProjectiles(): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + out_this.mGame.mManager.mWorld.mProjectilePool.mProjectilesRemaining;
      }
    })();
  }

  /**
  * Generate text indicating the strength of a hero
  *
  * @param h The hero whose strength is to be displayed
  * @return A TextProducer who produces the hero's strength
  */
  public DisplayStrength(h: Hero): TextProducer {
    let out_this = this;
    return new (class _ implements TextProducer {
      //@Override
      public makeText(): string {
        return "" + h.getStrength();
      }
    })();
  }

  /**
  * Place some text on the screen.  The text will be generated by tp, which is called on every
  * screen render
  *
  * @param x         The X coordinate of the bottom left corner (in pixels)
  * @param y         The Y coordinate of the bottom left corner (in pixels)
  * @param fontName  The name of the font to use
  * @param fontColor The color to use for the text
  * @param size      The font size
  * @param prefix    Text to display before the produced text
  * @param suffix    Text to display after the produced text
  * @param tp        The TextProducer
  * @param zIndex    The z index where the text should go
  * @return The display, so that it can be controlled further if needed
  */
  public addDisplay(x: number, y: number, fontName: string, fontColor: string, size: number,
    prefix: string, suffix: string, tp: TextProducer, zIndex: number): Renderable {
      return this.mGame.mManager.mHud.addText(x, y, fontName, fontColor, size, prefix, suffix, tp, zIndex);
  }

  /**
  * Indicate that the level will end in defeat if it is not completed in a given amount of time.
  *
  * @param timeout The amount of time until the level will end in defeat
  * @param text    The text to display when the level ends in defeat
  */
  public setLoseCountdown(timeout: number, text: string): void {
    // Once the Lose CountDown is not -100, it will start counting down
    this.mGame.mManager.mLoseCountDownRemaining = timeout;
    this.mGame.mManager.mLoseCountDownText = text;
  }

  /**
  * Indicate that the level will end in victory if the hero survives for a given amount of time
  *
  * @param timeout The amount of time until the level will end in victory
  * @param text    The text to display when the level ends in victory
  */
  public setWinCountdown(timeout: number, text: string): void {
    // Once the Win CountDown is not -100, it will start counting down
    this.mGame.mManager.mWinCountRemaining = timeout;
    this.mGame.mManager.mWinCountText = text;
  }


  /**
  * Add a button that performs an action when clicked.
  *
  * @param x       The X coordinate of the bottom left corner (in pixels)
  * @param y       The Y coordinate of the bottom left corner (in pixels)
  * @param width   The width of the image
  * @param height  The height of the image
  * @param imgName The name of the image to display. Use "" for an invisible button
  * @param action  The action to run in response to a tap
  */
  public addTapControl(x: number, y: number, width: number, height: number,
    imgName: string, action: LolAction): SceneActor {
      let c: SceneActor = new SceneActor(this.mGame.mManager.mHud, imgName, width, height);
      c.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
      //c.mTapHandler = action;
      //action.mSource = c;
      c.mSprite.interactive = true;
      c.mSprite.on('click', () => action.go());
      this.mGame.mManager.mHud.addActor(c, 0);
      return c;
  }


  /**
  * Create an action that makes a hero jump.
  *
  * @param hero The hero who we want to jump
  * @return The action object
  */
  public JumpAction(hero: Hero): LolAction {
    return new (class _ extends LolAction {
      //@Override
      public go(): void {
        hero.jump();
      }
    })();
  }

  /**
  * Create an action that makes a hero throw a projectile
  *
  * @param hero      The hero who should throw the projectile
  * @param offsetX   specifies the x distance between the bottom left of the projectile and the
  *                  bottom left of the hero throwing the projectile
  * @param offsetY   specifies the y distance between the bottom left of the projectile and the
  *                  bottom left of the hero throwing the projectile
  * @param velocityX The X velocity of the projectile when it is thrown
  * @param velocityY The Y velocity of the projectile when it is thrown
  * @return The action object
  */
  public ThrowFixedAction(hero: Hero, offsetX: number, offsetY: number,
    velocityX: number, velocityY: number): LolAction {
      let out_this = this;
      return new (class _ extends LolAction {
        public go() {
          out_this.mGame.mManager.mWorld.mProjectilePool.throwFixed(hero, offsetX, offsetY, velocityX, velocityY);
          return true;
        }
      })();
  }

  /**
  * Create an action that makes a hero throw a projectile in a direction that relates to how the
  * screen was touched
  *
  * @param hero    The hero who should throw the projectile
  * @param offsetX specifies the x distance between the bottom left of the projectile and the
  *                bottom left of the hero throwing the projectile
  * @param offsetY specifies the y distance between the bottom left of the projectile and the
  *                bottom left of the hero throwing the projectile
  * @return The action object
  */
  public ThrowDirectionalAction(hero: Hero, offsetX: number, offsetY: number): TouchEventHandler {
      let out_this = this;
      return new (class _ extends TouchEventHandler {
        public go(worldX: number, worldY: number): boolean {
          out_this.mGame.mManager.mWorld.mProjectilePool.throwAt(hero.mBody.GetPosition().x,
          hero.mBody.GetPosition().y, worldX, worldY, hero, offsetX, offsetY);
          return true;
        }
      })();
  }

  /**
  * Create an action that makes the screen zoom out
  *
  * @param maxZoom The maximum zoom factor to allow
  * @return The action object
  */
  public ZoomOutAction(maxZoom: number): LolAction {
    let out_this = this;
    return new (class _ extends LolAction {
      public go(): void {
        let curzoom = out_this.mGame.mManager.mWorld.mCamera.getZoom();
        if (curzoom < maxZoom) {
          out_this.mGame.mManager.mWorld.mCamera.zoomInOut(2);
          //out_this.mGame.mManager.mBackground.mBgCam.zoom *= 2;
          //out_this.mGame.mManager.mForeground.mBgCam.zoom *= 2;
        }
      }
    })();
  }

  /**
  * Create an action that makes the screen zoom in
  *
  * @param minZoom The minimum zoom factor to allow
  * @return The action object
  */
  public ZoomInAction(minZoom: number): LolAction {
    let out_this = this;
    return new (class _ extends LolAction {
      public go(): void {
        let curzoom = out_this.mGame.mManager.mWorld.mCamera.getZoom();
        if (curzoom > minZoom) {
          out_this.mGame.mManager.mWorld.mCamera.zoomInOut(0.5);
          //out_this.mGame.mManager.mBackground.mBgCam.zoom /= 2;
          //out_this.mGame.mManager.mForeground.mBgCam.zoom /= 2;
        }
      }
    })();
  }


  /**
  * Create an action for moving an actor in the X direction.  This action can be used by a
  * Control.
  *
  * @param actor The actor to move
  * @param xRate The rate at which the actor should move in the X direction (negative values are
  *              allowed)
  * @return The action
  */
  public makeXMotionAction(actor: WorldActor, xRate: number): LolAction {
    return new (class _ extends LolAction {
      //@Override
      public go(): void {
        let v = actor.mBody.GetLinearVelocity();
        v.x = xRate;
        actor.updateVelocity(v.x, v.y);
      }
    })();
  }

  /**
  * Create an action for moving an actor in the Y direction.  This action can be used by a
  * Control.
  *
  * @param actor The actor to move
  * @param yRate The rate at which the actor should move in the Y direction (negative values are
  *              allowed)
  * @return The action
  */
  public makeYMotionAction(actor: WorldActor, yRate: number): LolAction {
    return new (class _ extends LolAction {
      //@Override
      public go(): void {
        let v = actor.mBody.GetLinearVelocity();
        v.y = yRate;
        actor.updateVelocity(v.x, v.y);
      }
    })();
  }


  /**
  * Create an action for moving an actor in the X and Y directions.  This action can be used by a
  * Control.
  *
  * @param actor The actor to move
  * @param xRate The rate at which the actor should move in the X direction (negative values are
  *              allowed)
  * @param yRate The rate at which the actor should move in the Y direction (negative values are
  *              allowed)
  * @return The action
  */
  public makeXYMotionAction(actor: WorldActor, xRate: number, yRate: number): LolAction {
    return new (class _ extends LolAction {
      public go(): void {
        actor.updateVelocity(xRate, yRate);
      }
    })();
  }


  /**
  * Let an actor be controlled by arrow keys
  *
  * @param actor     The actor to move
  * @param speed     Speed to move an actor
  * @param dampening The dampening factor
  */
  public setArrowKeyControls(actor: WorldActor, speed: number): void {
    let up = this.makeYMotionAction(actor, -speed);
    let down = this.makeYMotionAction(actor, speed,);
    let left = this.makeXMotionAction(actor, -speed);
    let right = this.makeXMotionAction(actor, speed);

    document.onkeydown = (e) => {
      if(e.key == "ArrowUp") {
        up.go();
      }
      else if(e.key == "ArrowDown") {
        down.go();
      }
      else if(e.key == "ArrowLeft") {
        left.go();
      }
      else if(e.key == "ArrowRight") {
        right.go();
      }
    };

    document.onkeyup = (e) => {
      if(e.key == "ArrowUp") {
        actor.updateVelocity(actor.mBody.GetLinearVelocity().x, 0);
      }
      else if(e.key == "ArrowDown") {
        actor.updateVelocity(actor.mBody.GetLinearVelocity().x, 0);
      }
      else if(e.key == "ArrowLeft") {
        actor.updateVelocity(0, actor.mBody.GetLinearVelocity().y);
      }
      else if(e.key == "ArrowRight") {
        actor.updateVelocity(0, actor.mBody.GetLinearVelocity().y);
      }
    };
  }

  /**
  * Set a key to perform an action when it is pressed
  *
  * @param key        The key that performs the action
  * @param action     An action to perform
  * @param repeat     Whether holding the button repeats the action
  */
  public setKeyAction(key: string, action: LolAction, repeat: boolean): void {
    let loop = repeat;
    document.onkeydown = (e) => {
      if(e.key == key) {
        do {
          action.go();
        } while(loop);
      }
    };

    document.onkeyup = (e) => {
      if(e.key == key) {
        loop = false;
      }
    };
  }


  /**
  * Create an action for moving an actor in the X and Y directions, with dampening on release.
  * This action can be used by a Control.
  *
  * @param actor     The actor to move
  * @param xRate     The rate at which the actor should move in the X direction (negative values
  *                  are allowed)
  * @param yRate     The rate at which the actor should move in the Y direction (negative values
  *                  are allowed)
  * @param dampening The dampening factor
  * @return The action
  */
  public makeXYDampenedMotionAction(actor: WorldActor, xRate: number,
    yRate: number, dampening: number): LolAction {
       let action = new (class _ extends LolAction {
        //@Override
        public go(): void {
          actor.updateVelocity(xRate, yRate);
          actor.mBody.SetLinearDamping(dampening);
        }
      })();
      return action;
  }

  /**
  * Create an action for making a hero either start or stop crawling
  *
  * @param hero       The hero to control
  * @param crawlState True to start crawling, false to stop
  * @return The action
  */
  public makeCrawlToggle(hero: Hero, crawlState: boolean): LolAction {
    return new (class _ extends LolAction {
      //@Override
      public go(): void {
        if (crawlState)
          hero.crawlOn();
        else
          hero.crawlOff();
      }
    })();
  }

  /**
  * Create an action for making a hero rotate
  *
  * @param hero The hero to rotate
  * @param rate Amount of rotation to apply to the hero on each press
  * @return The action
  */
  public makeRotator(hero: Hero, rate: number): LolAction {
    return new (class _ extends LolAction {
      //@Override
      public go(): void {
        hero.increaseRotation(rate);
      }
    })();
  }

  /**
  * Create an action for making a hero throw a projectile
  *
  * @param hero       The hero who should throw the projectile
  * @param milliDelay A delay between throws, so that holding doesn't lead to too many throws at
  *                   once
  * @param offsetX    specifies the x distance between the bottom left of the projectile and the
  *                   bottom left of the hero throwing the projectile
  * @param offsetY    specifies the y distance between the bottom left of the projectile and the
  *                   bottom left of the hero throwing the projectile
  * @param velocityX  The X velocity of the projectile when it is thrown
  * @param velocityY  The Y velocity of the projectile when it is thrown
  * @return The action object
  */
  public makeRepeatThrow(hero: Hero, milliDelay: number, offsetX: number, offsetY: number,
    velocityX: number, velocityY: number): LolAction {
      let out_this = this;
      return new (class _ extends LolAction {
        mLastThrow: number;

        //@Override
        public go(): void {
        let now = new Date().getTime();
        if (this.mLastThrow + milliDelay < now) {
          this.mLastThrow = now;
          out_this.mGame.mManager.mWorld.mProjectilePool.throwFixed(hero, offsetX, offsetY, velocityX, velocityY);
        }
      }
    })();
  }

//   /**
//   * The default behavior for throwing is to throw in a straight line. If we instead desire that
//   * the projectiles have some sort of aiming to them, we need to use this method, which throws
//   * toward where the screen was pressed
//   * <p>
//   * Note: you probably want to use an invisible button that covers the screen...
//   *
//   * @param x          The X coordinate of the bottom left corner (in pixels)
//   * @param y          The Y coordinate of the bottom left corner (in pixels)
//   * @param width      The width of the image
//   * @param height     The height of the image
//   * @param imgName    The name of the image to display. Use "" for an invisible button
//   * @param h          The hero who should throw the projectile
//   * @param milliDelay A delay between throws, so that holding doesn't lead to too many throws at
//   *                   once
//   * @param offsetX    specifies the x distance between the bottom left of the projectile and the
//   *                   bottom left of the hero throwing the projectile
//   * @param offsetY    specifies the y distance between the bottom left of the projectile and the
//   *                   bottom left of the hero throwing the projectile
//   * @return The button that was created
//   */
//   public SceneActor addDirectionalThrowButton(int x, int y, int width, int height, String imgName,
//     final Hero h, final long milliDelay,
//     final float offsetX, final float offsetY) {
//       final SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
//       c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
//       final Vector2 v = new Vector2();
//       c.mToggleHandler = new ToggleEventHandler() {
//         public boolean go(boolean isUp, float worldX, float worldY) {
//           if (isUp) {
//             isHolding = false;
//           } else {
//             isHolding = true;
//             v.x = worldX;
//             v.y = worldY;
//           }
//           return true;
//         }
//       };
//       c.mPanHandler = new PanEventHandler() {
//         public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
//           if (c.mToggleHandler.isHolding) {
//             v.x = worldX;
//             v.y = worldY;
//           }
//           return c.mToggleHandler.isHolding;
//         }
//       };
//       mGame.mManager.mHud.addActor(c, 0);
//       // on toggle, we start or stop throwing; on pan, we change throw direction
//       mGame.mManager.mHud.mToggleControls.add(c);
//
//       c.mToggleHandler.mSource = c;
//       c.mPanHandler.mSource = c;
//
//       mGame.mManager.mWorld.mRepeatEvents.add(new LolAction() {
//         long mLastThrow;
//
//         @Override
//         public void go() {
//           if (c.mToggleHandler.isHolding) {
//             long now = System.currentTimeMillis();
//             if (mLastThrow + milliDelay < now) {
//               mLastThrow = now;
//               mGame.mManager.mWorld.mProjectilePool.throwAt(h.mBody.getPosition().x,
//               h.mBody.getPosition().y, v.x, v.y, h, offsetX, offsetY);
//             }
//           }
//         }
//       });
//       return c;
//     }
//
//

  /**
  * Add an image to the heads-up display. Touching the image has no effect
  *
  * @param x       The X coordinate of the bottom left corner (in pixels)
  * @param y       The Y coordinate of the bottom left corner (in pixels)
  * @param width   The width of the image
  * @param height  The height of the image
  * @param imgName The name of the image to display. Use "" for an invisible button
  * @return The image that was created
  */
  public addImage(x: number, y: number, width: number, height: number, imgName: string): SceneActor {
    let c: SceneActor = new SceneActor(this.mGame.mManager.mHud, imgName, width, height);
    c.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
    this.mGame.mManager.mHud.addActor(c, 0);
    return c;
  }


  // /**
  // * Set the background color for the current level
  // *
  // * @param color The color, formatted as a hex number
  // */
  // public setBackgroundColor(color: number) {
  //   //this.mGame.mRenderer = PIXI.autoDetectRenderer(this.mConfig.mWidth, this.mConfig.mHeight, {backgroundColor: color});
  //   //mGame.mManager.mBackground.mColor = Color.valueOf(color);
  //
  // }


  /**
  * Make an enemy that has an underlying rectangular shape.
  *
  * @param x       The X coordinate of the bottom left corner
  * @param y       The Y coordinate of the bottom right corner
  * @param width   The width of the enemy
  * @param height  The height of the enemy
  * @param imgName The name of the image to display
  * @return The enemy, so that it can be modified further
  */
  public makeEnemyAsBox(x: number, y: number, width: number, height: number, imgName: string): Enemy {
    let e: Enemy = new Enemy(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    this.mGame.mManager.mEnemiesCreated++;
    e.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
    this.mGame.mManager.mWorld.addActor(e, 0);
    return e;
  }

  /**
  * Draw an enemy with an underlying polygon shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                x0,y0,x1,y1,x2,y2,...
  * @return The enemy, so that it can be further modified
  */
  public makeEnemyAsPolygon(x: number, y: number, width: number, height: number,
    imgName: string, verts: number[]): Enemy {
      let e: Enemy = new Enemy(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      this.mGame.mManager.mEnemiesCreated++;
      e.setPolygonPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, verts);
      this.mGame.mManager.mWorld.addActor(e, 0);
      return e;
  }

  /**
  * Make an enemy that has an underlying circular shape.
  *
  * @param x       The X coordinate of the bottom left corner
  * @param y       The Y coordinate of the bottom right corner
  * @param width   The width of the enemy
  * @param height  The height of the enemy
  * @param imgName The name of the image to display
  * @return The enemy, so that it can be modified further
  */
  public makeEnemyAsCircle(x: number, y: number, width: number, height: number, imgName: string): Enemy {
    let radius = Math.max(width, height);
    let e: Enemy = new Enemy(this.mGame, this.mGame.mManager.mWorld, radius, radius, imgName);
    this.mGame.mManager.mEnemiesCreated++;
    e.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, radius / 2);
    this.mGame.mManager.mWorld.addActor(e, 0);
    return e;
  }


  /**
  * Make a destination that has an underlying rectangular shape.
  *
  * @param x       The X coordinate of the bottom left corner
  * @param y       The Y coordinate of the bottom right corner
  * @param width   The width of the destination
  * @param height  The height of the destination
  * @param imgName The name of the image to display
  * @return The destination, so that it can be modified further
  */
  public makeDestinationAsBox(x: number, y: number, width: number,
    height: number, imgName: string): Destination {
      let d: Destination = new Destination(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      d.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
      d.setCollisionsEnabled(false);
      this.mGame.mManager.mWorld.addActor(d, 0);
      return d;
  }

  /**
  * Draw a destination with an underlying polygon shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                x0,y0,x1,y1,x2,y2,...
  * @return The destination, so that it can be further modified
  */
  public makeDestinationAsPolygon(x: number, y: number, width: number, height: number,
    imgName: string, verts: number[]): Destination {
      let d: Destination = new Destination(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      d.setPolygonPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, verts);
      d.setCollisionsEnabled(false);
      this.mGame.mManager.mWorld.addActor(d, 0);
      return d;
  }

  /**
  * Make a destination that has an underlying circular shape.
  *
  * @param x       The X coordinate of the bottom left corner
  * @param y       The Y coordinate of the bottom right corner
  * @param width   The width of the destination
  * @param height  The height of the destination
  * @param imgName The name of the image to display
  * @return The destination, so that it can be modified further
  */
  public makeDestinationAsCircle(x: number, y: number, width: number, height: number,
    imgName: string): Destination {
      let radius = Math.max(width, height);
      let d: Destination = new Destination(this.mGame, this.mGame.mManager.mWorld, radius, radius, imgName);
      d.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, radius / 2);
      d.setCollisionsEnabled(false);
      this.mGame.mManager.mWorld.addActor(d, 0);
      return d;
  }


  /**
  * Draw an obstacle with an underlying box shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @return The obstacle, so that it can be further modified
  */
  public makeObstacleAsBox(x: number, y: number, width: number, height: number, imgName: string): Obstacle {
    let o: Obstacle = new Obstacle(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    o.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
    this.mGame.mManager.mWorld.addActor(o, 0);
    return o;
  }

  /**
  * Draw an obstacle with an underlying polygon shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                x0,y0,x1,y1,x2,y2,...
  * @return The obstacle, so that it can be further modified
  */
  public makeObstacleAsPolygon(x: number, y: number, width: number, height: number,
    imgName: string, verts: number[]): Obstacle {
      let o: Obstacle = new Obstacle(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      o.setPolygonPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, verts);
      this.mGame.mManager.mWorld.addActor(o, 0);
      return o;
  }

  /**
  * Draw an obstacle with an underlying circle shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @return The obstacle, so that it can be further modified
  */
  public makeObstacleAsCircle(x: number, y: number, width: number, height: number,
    imgName: string): Obstacle {
      let radius: number = Math.max(width, height);
      let o: Obstacle = new Obstacle(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      o.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, radius / 2);
      this.mGame.mManager.mWorld.addActor(o, 0);
      return o;
  }

  /**
  * Draw a goodie with an underlying box shape, and a default score of [1,0,0,0]
  *
  * @param x       X coordinate of bottom left corner
  * @param y       Y coordinate of bottom left corner
  * @param width   Width of the image
  * @param height  Height of the image
  * @param imgName Name of image file to use
  * @return The goodie, so that it can be further modified
  */
  public makeGoodieAsBox(x: number, y: number, width: number, height: number, imgName: string): Goodie {
    let g: Goodie = new Goodie(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    g.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
    g.setCollisionsEnabled(false);
    this.mGame.mManager.mWorld.addActor(g, 0);
    return g;
  }

  /**
  * Draw a goodie with an underlying circle shape, and a default score of [1,0,0,0]
  *
  * @param x       X coordinate of bottom left corner
  * @param y       Y coordinate of bottom left corner
  * @param width   Width of the image
  * @param height  Height of the image
  * @param imgName Name of image file to use
  * @return The goodie, so that it can be further modified
  */
  public makeGoodieAsCircle(x: number, y: number, width: number, height: number, imgName: string): Goodie {
    let radius: number = Math.max(width, height);
    let g: Goodie = new Goodie(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    g.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, radius / 2);
    g.setCollisionsEnabled(false);
    this.mGame.mManager.mWorld.addActor(g, 0);
    return g;
  }

  /**
  * Draw a goodie with an underlying polygon shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                x0,y0,x1,y1,x2,y2,...
  * @return The goodie, so that it can be further modified
  */
  public makeGoodieAsPolygon(x: number, y: number, width: number, height: number,
    imgName: string, verts: number[]): Goodie {
      let g: Goodie = new Goodie(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      g.setPolygonPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, verts);
      g.setCollisionsEnabled(false);
      this.mGame.mManager.mWorld.addActor(g, 0);
      return g;
  }

  /**
  * Make a Hero with an underlying rectangular shape
  *
  * @param x       X coordinate of the hero
  * @param y       Y coordinate of the hero
  * @param width   width of the hero
  * @param height  height of the hero
  * @param imgName File name of the default image to display
  * @return The hero that was created
  */
  public makeHeroAsBox(x: number, y: number, width: number, height: number, imgName: string): Hero {
    let h: Hero = new Hero(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    this.mGame.mManager.mHeroesCreated++;
    h.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y);
    this.mGame.mManager.mWorld.addActor(h, 0);
    return h;
  }

  /**
  * Make a Hero with an underlying circular shape
  *
  * @param x       X coordinate of the hero
  * @param y       Y coordinate of the hero
  * @param width   width of the hero
  * @param height  height of the hero
  * @param imgName File name of the default image to display
  * @return The hero that was created
  */
  public makeHeroAsCircle(x: number, y: number, width: number, height: number, imgName: string): Hero {
    let radius: number = Math.max(width, height);
    let h: Hero = new Hero(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
    this.mGame.mManager.mHeroesCreated++;
    h.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y, radius / 2);
    this.mGame.mManager.mWorld.addActor(h, 0);
    return h;
  }

  /**
  * Draw a hero with an underlying polygon shape
  *
  * @param x       X coordinate of the bottom left corner
  * @param y       Y coordinate of the bottom left corner
  * @param width   Width of the obstacle
  * @param height  Height of the obstacle
  * @param imgName Name of image file to use
  * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                x0,y0,x1,y1,x2,y2,...
  * @return The hero, so that it can be further modified
  */
  public makeHeroAsPolygon(x: number, y: number, width: number, height: number, imgName: string, verts: number[]): Hero {
      let h: Hero = new Hero(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
      this.mGame.mManager.mHeroesCreated++;
      h.setPolygonPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y, verts);
      this.mGame.mManager.mWorld.addActor(h, 0);
      return h;
  }

  /**
  * Specify a limit on how far away from the Hero a projectile can go.  Without this, projectiles
  * could keep on traveling forever.
  *
  * @param distance Maximum distance from the hero that a projectile can travel
  */
  public setProjectileRange(distance: number): void {
    for (let p of this.mGame.mManager.mWorld.mProjectilePool.mPool)
      p.mRange = distance;
  }

  /**
  * Indicate that projectiles should feel the effects of gravity. Otherwise, they will be (more
  * or less) immune to gravitational forces.
  */
  public setProjectileGravityOn(): void {
    for (let p of this.mGame.mManager.mWorld.mProjectilePool.mPool)
      p.mBody.SetGravityScale(1);
  }



  /**
  * The "directional projectile" mechanism might lead to the projectiles moving too fast. This
  * will cause the speed to be multiplied by a factor
  *
  * @param factor The value to multiply against the projectile speed.
  */
  public setProjectileVectorDampeningFactor(factor: number): void {
    this.mGame.mManager.mWorld.mProjectilePool.mDirectionalDamp = factor;
  }

  /**
  * Indicate that all projectiles should participate in collisions, rather than disappearing when
  * they collide with other actors
  */
  public enableCollisionsForProjectiles(): void {
    this.mGame.mManager.mWorld.mProjectilePool.mSensorProjectiles = false;
  }

  /**
  * Indicate that projectiles thrown with the "directional" mechanism should have a fixed
  * velocity
  *
  * @param velocity The magnitude of the velocity for projectiles
  */
  public setFixedVectorThrowVelocityForProjectiles(velocity: number): void {
    this.mGame.mManager.mWorld.mProjectilePool.mEnableFixedVectorVelocity = true;
    this.mGame.mManager.mWorld.mProjectilePool.mFixedVectorVelocity = velocity;
  }

  /**
  * Indicate that projectiles thrown via the "directional" mechanism should be rotated to face in
  * their direction or movement
  */
  public setRotateVectorThrowForProjectiles(): void {
    this.mGame.mManager.mWorld.mProjectilePool.mRotateVectorThrow = true;
  }

  /**
  * Indicate that when two projectiles collide, they should both remain on screen
  */
  public setCollisionOkForProjectiles(): void {
    for (let p of this.mGame.mManager.mWorld.mProjectilePool.mPool)
      p.mDisappearOnCollide = false;
  }

  /**
  * Describe the behavior of projectiles in a scene. You must call this if you intend to use
  * projectiles in your scene.
  *
  * @param size     number of projectiles that can be thrown at once
  * @param width    width of a projectile
  * @param height   height of a projectile
  * @param imgName  image to use for projectiles
  * @param strength specifies the amount of damage that a projectile does to an enemy
  * @param zIndex   The z plane on which the projectiles should be drawn
  * @param isCircle Should projectiles have an underlying circle or box shape?
  */
  public configureProjectiles(size: number, width: number, height: number, imgName: string,
    strength: number, zIndex: number, isCircle: boolean): void {
      this.mGame.mManager.mWorld.mProjectilePool = new ProjectilePool(this.mGame, this.mGame.mManager.mWorld,
        size, width, height, imgName, strength, zIndex, isCircle);
  }

  /**
  * Set a limit on the total number of projectiles that can be thrown
  *
  * @param number How many projectiles are available
  */
  public setNumberOfProjectiles(number: number): void {
    this.mGame.mManager.mWorld.mProjectilePool.mProjectilesRemaining = number;
  }

  /**
  * Specify a sound to play when the projectile is thrown
  *
  * @param soundName Name of the sound file to play
  */
  public setThrowSound(soundName: string): void {
    this.mGame.mManager.mWorld.mProjectilePool.mThrowSound = this.mMedia.getSound(soundName);
  }

  /**
  * Specify the sound to play when a projectile disappears
  *
  * @param soundName the name of the sound file to play
  */
  public setProjectileDisappearSound(soundName: string): void {
    this.mGame.mManager.mWorld.mProjectilePool.mProjectileDisappearSound =
    this.mMedia.getSound(soundName);
  }


  /**
  * Draw a box on the scene
  * <p>
  * Note: the box is actually four narrow rectangles
  *
  * @param x0         X coordinate of left side
  * @param y0         Y coordinate of top
  * @param x1         X coordinate of right side
  * @param y1         Y coordinate of bottom
  * @param imgName    name of the image file to use when drawing the rectangles
  * @param density    Density of the rectangle. When in doubt, use 1
  * @param elasticity Elasticity of the rectangle. When in doubt, use 0
  * @param friction   Friction of the rectangle. When in doubt, use 1
  */
  public drawBoundingBox(x0: number, y0: number, x1: number, y1: number, imgName: string,
    density: number, elasticity: number, friction: number): void {
      let bottom: Obstacle = this.makeObstacleAsBox(x0 - 1, y1, Math.abs(x0 - x1) + 2, 1, imgName);
      bottom.setPhysics(density, elasticity, friction);

      let top: Obstacle = this.makeObstacleAsBox(x0 - 1, y0 - 1, Math.abs(x0 - x1) + 2, 1, imgName);
      top.setPhysics(density, elasticity, friction);

      let left: Obstacle = this.makeObstacleAsBox(x0 - 1, y0 - 1, 1, Math.abs(y0 - y1) + 2, imgName);
      left.setPhysics(density, elasticity, friction);

      let right: Obstacle = this.makeObstacleAsBox(x1, y0 - 1, 1, Math.abs(y0 - y1) + 2, imgName);
      right.setPhysics(density, elasticity, friction);
  }


  /**
  * Draw a picture on the current level
  * <p>
  * Note: the order in which this is called relative to other actors will determine whether they
  * go under or over this picture.
  *
  * @param x       X coordinate of bottom left corner
  * @param y       Y coordinate of bottom left corner
  * @param width   Width of the picture
  * @param height  Height of this picture
  * @param imgName Name of the picture to display
  * @param zIndex  The z index of the image. There are 5 planes: -2, -2, 0, 1, and 2. By default,
  *                everything goes to plane 0
  */
  public drawPicture(x: number, y: number, width: number, height: number,
    imgName: string, zIndex: number): void {
      this.mGame.mManager.mWorld.makePicture(x, y, width, height, imgName, zIndex);
  }

  /**
  * Draw some text in the scene, using a bottom-left coordinate
  *
  * @param x         The x coordinate of the bottom left corner
  * @param y         The y coordinate of the bottom left corner
  * @param fontName  The name of the font to use
  * @param fontColor The color of the font
  * @param fontSize  The size of the font
  * @param prefix    Prefix text to put before the generated text
  * @param suffix    Suffix text to put after the generated text
  * @param tp        A TextProducer that will generate the text to display
  * @param zIndex    The z index of the text
  * @return A Renderable of the text, so it can be enabled/disabled by program code
  */
  public addText(x: number, y: number, fontName: string, fontColor: string, fontSize: number,
    prefix: string, suffix: string, tp: TextProducer, zIndex: number): Renderable {
      return this.mGame.mManager.mWorld.addText(x, y, fontName, fontColor, fontSize, prefix, suffix, tp, zIndex);
  }

  /**
  * Draw some text in the scene, using a top-left coordinate
  *
  * @param x         The x coordinate of the bottom left corner
  * @param y         The y coordinate of the bottom left corner
  * @param fontName  The name of the font to use
  * @param fontColor The color of the font
  * @param fontSize  The size of the font
  * @param text      Text text to put before the generated text
  * @param zIndex    The z index of the text
  * @return A Renderable of the text, so it can be enabled/disabled by program code
  */
  public addStaticText(x: number, y: number, fontName: string, fontColor: number, fontSize: number, text: string, zIndex: number): Renderable {
      return this.mGame.mManager.mWorld.addStaticText(x, y, fontName, fontColor, fontSize, text, zIndex);
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
  public addTextCentered(centerX: number, centerY: number, fontName: string, fontColor: string,
    fontSize: number, prefix: string, suffix: string, tp: TextProducer, zIndex: number): Renderable {
      return this.mGame.mManager.mWorld.addTextCentered(centerX, centerY, fontName, fontColor,
        fontSize, prefix, suffix, tp, zIndex);
  }

  /**
  * Generate a random number x in the range [0,max)
  *
  * @param max The largest number returned will be one less than max
  * @return a random integer
  */
  public getRandom(max: number) {
    return Math.floor(Math.random() * max);
  }


  /**
  * load the splash screen
  */
  public doSplash(): void {
    this.mGame.mManager.doSplash();
  }

  /**
  * load the level-chooser screen. Note that when the chooser is disabled, we jump straight to
  * level 1.
  *
  * @param whichChooser The chooser screen to create
  */
  public doChooser(whichChooser: number) {
    this.mGame.mManager.doChooser(whichChooser);
  }

  /**
  * load a playable level.
  *
  * @param which The index of the level to load
  */
  public doLevel(which: number) {
    this.mGame.mManager.doPlay(which);
  }

  /**
  * load a help level.
  *
  * @param which The index of the help level to load
  */
  public doHelp(which: number) {
    this.mGame.mManager.doHelp(which);
  }
}
