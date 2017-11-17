/// <reference path="./HudScene.ts"/>
/// <reference path="./MainScene.ts"/>
/// <reference path="./Enemy.ts"/>
/// <reference path="./Goodie.ts"/>
/// <reference path="./QuickScene.ts"/>
/// <reference path="./Media.ts"/>
/// <reference path="./Lol.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

/**
* These are the ways you can complete a level: you can reach the destination, you can collect
* enough stuff, or you can reach a certain number of enemies defeated.
* <p>
* Technically, there's also 'survive for x seconds', but that doesn't need special support
*/
enum VictoryType {
  DESTINATION, GOODIECOUNT, ENEMYCOUNT
}

class LolManager {
  mContainer: PIXI.Container;

  /// A reference to the top-level game object
  private readonly mGame: Lol;
  /// A reference to the game configuration object
  private readonly mConfig: Config;
  /// The set of loaded assets
  private readonly mMedia: Media;
  /// The object that comprises the public API
  mLevel: Level;

  /// The physics world in which all actors exist
  mWorld: MainScene;
  /// A heads-up display
  mHud: HudScene;
  /// The scene to show when the level is created (if any)
  mPreScene: QuickScene;
  /// The scene to show when the level is won
  mWinScene: QuickScene;
  /// The scene to show when the level is lost
  mLoseScene: QuickScene;
  /// The scene to show when the level is paused (if any)
  mPauseScene: QuickScene;
  /// The background layers
  // mBackground: ParallaxScene;
  /// The foreground layers
  // mForeground: ParallaxScene;

  /// Store string/integer pairs that get reset whenever we restart the program, but which persist
  /// across levels
  readonly mSessionFacts: Map<string, number>;

  /// Modes of the game, for use by the state machine.  We can be showing the main splash
  /// screen, the help screens, the level chooser, the store, or a playable level
  private readonly SPLASH = 0;
  private readonly HELP = 1;
  private readonly CHOOSER = 2;
  private readonly STORE = 3;
  private readonly PLAY = 4;
  /// The current state (e.g., are we showing a STORE)
  private mMode: number;
  /// The level within each mode (e.g., we are in PLAY scene 4, and will return to CHOOSER 2)
  private mModeStates = new Array<number>(5);

  /// This is the number of goodies that must be collected, if we're in GOODIECOUNT mode
  mVictoryGoodieCount: Array<number>;
  /// Track the number of heroes that have been created
  mHeroesCreated: number;
  /// Count of the goodies that have been collected in this level
  mGoodiesCollected: Array<number>;
  /// Count the number of enemies that have been created
  mEnemiesCreated: number;
  /// Count the enemies that have been defeated
  mEnemiesDefeated: number;
  /// Track if the level has been lost (true) or the game is still being played (false)
  mGameOver: boolean;
  /// In levels that have a lose-on-timer feature, we store the timer here, so that we can extend
  /// the time left to complete a game
  ///
  /// NB: -1 indicates the timer is not active
  mLoseCountDownRemaining: number;
  /// Text to display when a Lose Countdown completes
  mLoseCountDownText: string;
  /// Time that must pass before the level ends in victory
  mWinCountRemaining: number;
  ///  Text to display when a Win Countdown completes
  mWinCountText: string;
  /// This is a stopwatch, for levels where we count how long the game has been running
  mStopWatchProgress: number;
  /// This is how far the hero has traveled
  mDistance: number;
  /// Track the number of heroes that have been removed/defeated
  private mHeroesDefeated: number;
  /// Number of heroes who have arrived at any destination yet
  private mDestinationArrivals: number;
  /// Describes how a level is won.
  mVictoryType: VictoryType;
  /// This is the number of heroes who must reach destinations, if we're in DESTINATION mode
  mVictoryHeroCount: number;
  /// The number of enemies that must be defeated, if we're in ENEMYCOUNT mode. -1 means "all"
  mVictoryEnemyCount: number;
  /// When the level is won or lost, this is where we store the event that needs to run
  mEndGameEvent: LolAction | null;
  /// Code to run when a level is won
  mWinCallback: LolAction | null;
  /// Code to run when a level is lost
  mLoseCallback: LolAction | null;

  /**
  * Construct the LolManager, build the scenes, set up the state machine, and clear the scores.
  *
  * @param config The game-wide configuration
  * @param media  All image and sound assets for the game
  * @param game   A reference to the top-level game object
  */
  constructor(config: Config, media: Media, game: Lol) {
    this.mGame = game;
    this.mConfig = config;
    this.mMedia = media;
    // Set up the API, so that any user code we call is able to reach this object
    this.mLevel = new Level(this.mConfig, this.mMedia, this.mGame);
    // build scenes and facts
    this.createScenes();
    this.mSessionFacts = new Map<string, number>();
    // set current mode states, and reset the scores
    for (let i = 0; i < 5; ++i)
    this.mModeStates[i] = 1;
    this.resetScores();

    //
    // this.mGoodiesCollected = new Array<number>();
  }

  /**
  * Reset all scores.  This should be called at the beginning of every level.
  */
  private resetScores(): void {
    this.mVictoryGoodieCount = new Array<number>(4);
    this.mHeroesCreated = 0;
    this.mGoodiesCollected = new Array<number>(0, 0, 0, 0);
    this.mEnemiesCreated = 0;
    this.mEnemiesDefeated = 0;
    this.mGameOver = false;
    this.mLoseCountDownRemaining = -100;
    this.mLoseCountDownText = "";
    this.mWinCountRemaining = -100;
    this.mWinCountText = "";
    this.mStopWatchProgress = -100;
    this.mDistance = 0;
    this.mHeroesDefeated = 0;
    this.mDestinationArrivals = 0;
    this.mVictoryType = VictoryType.DESTINATION;
    this.mVictoryHeroCount = 0;
    this.mVictoryEnemyCount = 0;
    this.mEndGameEvent = null;
    this.mWinCallback = null;
    this.mLoseCallback = null;
  }

  /**
  * Create all scenes for a playable level.
  */
  private createScenes(): void {
    // Create the easy scenes
    this.mWorld = new MainScene(this.mConfig, this.mMedia);
    this.mHud = new HudScene(this.mConfig, this.mMedia);
    //this.mBackground = new ParallaxScene(this.mConfig);
    //this.mForeground = new ParallaxScene(this.mConfig);
    // the win/lose/pre/pause scenes are a little bit complicated
    // this.mWinScene = new QuickScene(this.mConfig, this.mMedia, this.mConfig.mDefaultWinText);
    // let out_this = this;
    // this.mWinScene.setDismissAction(new (class _ extends LolAction {
    //   //@Override
    //   public go(): void {
    //     out_this.doChooser(1);
    //   }
    // })());
    // this.mLoseScene = new QuickScene(this.mConfig, this.mMedia, this.mConfig.mDefaultLoseText);
    // this.mLoseScene.setDismissAction(new (class _ extends LolAction {
    //   //@Override
    //   public go(): void {
    //     out_this.repeatLevel();
    //   }
    // })());

    this.mContainer = new PIXI.Container();
    this.mContainer.addChild(this.mWorld.mCamera.mContainer);
    this.mContainer.addChild(this.mHud.mCamera.mContainer);
    //this.mWorld.mContainer.addChild(new PIXI.Text("Hello", {fontFamily: "Arial", fontSize: 24, fill: 0x0000FF, align: 'center'}));
    // this.mPreScene = new QuickScene(this.mConfig, this.mMedia, "");
    // this.mPreScene.setShowAction(null);
    // this.mPauseScene = new QuickScene(this.mConfig, this.mMedia, "");
    // this.mPauseScene.setAsPauseScene();
  }



  /**
  * Before we call programmer code to load a new scene, we call this to ensure that everything is
  * in a clean state.
  */
  private onScreenChange(): void {
    //this.mWorld.pauseMusic();
    this.createScenes();
    // When debug mode is on, print the frames per second
    // if (this.mConfig.mShowDebugBoxes)
    //   this.mLevel.addDisplay(800, 15, mConfig.mDefaultFontFace, mConfig.mDefaultFontColor, 12, "fps: ", "", mLevel.DisplayFPS, 2);
  }

  // /**
  // * If the level that follows this level has not yet been unlocked, unlock it.
  // * <p>
  // * NB: we only track one value for locking/unlocking, so this actually unlocks all levels up to
  // * and including the level after the current level.
  // */
  // private unlockNext(): void {
  //   if (Lol.getGameFact(this.mConfig, "unlocked", 1) <= this.mModeStates[this.PLAY]) {
  //     Lol.putGameFact(this.mConfig, "unlocked", this.mModeStates[this.PLAY] + 1);
  //   }
  // }

  /**
  * Move forward to the next level, if there is one, and otherwise go back to the chooser.
  */
  advanceLevel(): void {
    // Make sure to stop the music!
    //this.mWorld.stopMusic();
    if (this.mModeStates[this.PLAY] == this.mConfig.mNumLevels) {
      this.doChooser(1);
    } else {
      this.mModeStates[this.PLAY]++;
      this.doPlay(this.mModeStates[this.PLAY]);
    }
  }

  /**
  * Start a level over again.
  */
  repeatLevel(): void {
    this.doPlay(this.mModeStates[this.PLAY]);
  }

  /**
  * Load the splash screen
  */
  doSplash(): void {
    for (let i = 0; i < 5; ++i) {
      this.mModeStates[i] = 1;
    }
    this.mMode = this.SPLASH;
    this.onScreenChange();
    this.mConfig.mSplash.display(1, this.mLevel);
  }

  /**
  * Load the level-chooser screen. If the chooser is disabled, jump straight to level 1.
  *
  * @param index The chooser screen to create
  */
  doChooser(index: number): void {
    // if chooser disabled, then we either called this from splash, or from a game level
    if (!this.mConfig.mEnableChooser) {
      if (this.mMode == this.PLAY) {
        this.doSplash();
      } else {
        this.doPlay(this.mModeStates[this.PLAY]);
      }
      return;
    }
    // the chooser is not disabled... save the choice of level, configure it, and show it.
    this.mMode = this.CHOOSER;
    this.mModeStates[this.CHOOSER] = index;
    this.onScreenChange();
    this.mConfig.mChooser.display(index, this.mLevel);
  }

  /**
  * Load a playable level
  *
  * @param index The index of the level to load
  */
  doPlay(index: number): void {
    this.mModeStates[this.PLAY] = index;
    this.mMode = this.PLAY;
    this.onScreenChange();
    this.resetScores();
    this.mConfig.mLevels.display(index, this.mLevel);
  }

  /**
  * Load a help level
  *
  * @param index The index of the help level to load
  */
  doHelp(index: number): void {
    this.mModeStates[this.HELP] = index;
    this.mMode = this.HELP;
    this.onScreenChange();
    this.mConfig.mHelp.display(index, this.mLevel);
  }

  /**
  * Load a lose scene
  *
  * @param index The index of the help level to load
  */
  doLose(index: number): void {
    this.onScreenChange();
    this.mConfig.mLose.display(index, this.mLevel);
  }

  /**
  * Load a win scene
  *
  * @param index The index of the help level to load
  */
  doWin(index: number): void {
    this.onScreenChange();
    this.mConfig.mWin.display(index, this.mLevel);
  }

  /**
  * Load a screen of the store.
  *
  * @param index The index of the help level to load
  */
  doStore(index: number): void {
    this.mModeStates[this.STORE] = index;
    this.mMode = this.STORE;
    this.onScreenChange();
    this.mConfig.mStore.display(index, this.mLevel);
  }

  // TODO: What does quitting the game look like??
  // With a webpage, closing the browser tab should be sufficient?
  /**
  * Quit the game
  */
  doQuit(): void {
    //this.mWorld.stopMusic();
    //Gdx.app.exit();
  }


  /**
  * Indicate that a hero has been defeated
  *
  * @param enemy The enemy who defeated the hero
  */
  defeatHero(enemy: Enemy): void {
    this.mHeroesDefeated++;
    if (this.mHeroesDefeated == this.mHeroesCreated) {
      // possibly change the end-of-level text
      if (enemy.mOnDefeatHeroText !== "") {
        this.mLoseScene.setDefaultText(enemy.mOnDefeatHeroText);
      }
      this.endLevel(false);
    }
  }

  /**
  * Indicate that a goodie has been collected
  *
  * @param goodie The goodie that was collected
  */
  onGoodieCollected(goodie: Goodie): void {
    // Update goodie counts
    for (let i = 0; i < 4; ++i) {
      this.mGoodiesCollected[i] += goodie.mScore[i];
    }
    // possibly win the level, but only if we win on goodie count and all
    // four counts are high enough
    if (this.mVictoryType != VictoryType.GOODIECOUNT) {
      return;
    }
    let match: boolean = true;
    for (let i = 0; i < 4; ++i) {
      match = match && (this.mVictoryGoodieCount[i] <= this.mGoodiesCollected[i]);
    }
    if (match) {
      this.endLevel(true);
    }
  }

  /**
  * Indicate that a hero has reached a destination
  */
  onDestinationArrive(): void {
    // check if the level is complete
    this.mDestinationArrivals++;
    if ((this.mVictoryType == VictoryType.DESTINATION) && (this.mDestinationArrivals >= this.mVictoryHeroCount)) {
      console.log("Win");
      this.endLevel(true);
    }
  }

  /**
  * Indicate that an enemy has been defeated
  */
  onDefeatEnemy(): void {
    // update the count of defeated enemies
    this.mEnemiesDefeated++;
    // if we win by defeating enemies, see if we've defeated enough of them:
    let win: boolean = false;
    if (this.mVictoryType == VictoryType.ENEMYCOUNT) {
      // -1 means "defeat all enemies"
      if (this.mVictoryEnemyCount == -1) {
        win = this.mEnemiesDefeated == this.mEnemiesCreated;
      } else {
        win = this.mEnemiesDefeated >= this.mVictoryEnemyCount;
      }
    }
    if (win) {
      this.endLevel(true);
    }
  }

  /**
  * When a level ends, we run this code to shut it down, print a message, and
  * then let the user resume play
  *
  * @param win true if the level was won, false otherwise
  */
  endLevel(win: boolean): void {

    if(win) {
      this.doWin(this.mModeStates[this.PLAY]);
    }
    else {
      this.doLose(this.mModeStates[this.PLAY]);
    }
    // if (this.mEndGameEvent == null) {
    //   let out_this = this;
    //   this.mEndGameEvent = new (class _ extends LolAction {
    //     //@Override
    //     public go(): void {
    //       // Safeguard: only call this method once per level
    //       if (out_this.mGameOver){
    //         return;
    //       }
    //       out_this.mGameOver = true;
    //
    //       // Run the level-complete callback
    //       if (win && out_this.mWinCallback != null){
    //         out_this.mWinCallback.go();
    //       } else if (!win && out_this.mLoseCallback != null){
    //         out_this.mLoseCallback.go();
    //       }
    //       // if we won, unlock the next level
    //       // if (win){
    //       //   out_this.mGame.mManager.unlockNext();
    //       // }
    //       // drop everything from the hud
    //       out_this.mGame.mManager.mHud.reset();
    //
    //       //TODO: clear setInterval calls or create a timer class
    //       // clear any pending timers
    //       //PhysicsType2d.Timer.clear();
    //
    //       // display the PostScene before we retry/start the next level
    //       if (win) {
    //         out_this.mGame.mManager.mWinScene.show();
    //       } else {
    //         out_this.mGame.mManager.mLoseScene.show();
    //       }
    //     }
    //   })();
    //}
  }

  /**
  * Update all timer counters associated with the current level
  */
  // TODO: This uses PIXI.ticker, which may require some adjustments
  updateTimeCounts(): void {
    // Check the countdown timers
    if (this.mLoseCountDownRemaining != -100) {
      this.mLoseCountDownRemaining -= PIXI.ticker.shared.deltaTime;  //Gdx.graphics.getDeltaTime();
      if (this.mLoseCountDownRemaining < 0) {
        if (this.mLoseCountDownText !== "") {
          this.mLoseScene.setDefaultText(this.mLoseCountDownText);
        }
        this.endLevel(false);
      }
    }
    if (this.mWinCountRemaining != -100) {
      this.mWinCountRemaining -= PIXI.ticker.shared.deltaTime;  //Gdx.graphics.getDeltaTime();
      if (this.mWinCountRemaining < 0) {
        if (this.mWinCountText !== "") {
          this.mWinScene.setDefaultText(this.mWinCountText);
        }
        this.endLevel(true);
      }
    }
    if (this.mStopWatchProgress != -100) {
      this.mStopWatchProgress += PIXI.ticker.shared.deltaTime //Gdx.graphics.getDeltaTime();
    }
  }

  // /**
  // * Code to run when the back key is pressed, or when we are simulating a back key pressed
  // */
  // handleBack(): void {
  //   // clear all timers, just in case...
  //   Timer.instance().clear();
  //   // if we're looking at main menu, then exit
  //   if (mMode == SPLASH) {
  //     // TODO: return a bool, let game dispose of itself?
  //     mGame.dispose();
  //     Gdx.app.exit();
  //   }
  //   // if we're looking at the chooser or help, switch to the splash screen
  //   else if (mMode == CHOOSER || mMode == HELP || mMode == STORE) {
  //     doSplash();
  //   }
  //   // ok, we're looking at a game scene... switch to chooser
  //   else {
  //     doChooser(mModeStates[CHOOSER]);
  //   }
  //}
}
