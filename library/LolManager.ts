/// <reference path="./HudScene.ts"/>
/// <reference path="./MainScene.ts"/>
/// <reference path="./Enemy.ts"/>
/// <reference path="./Hero.ts"/>
/// <reference path="./Goodie.ts"/>
/// <reference path="./QuickScene.ts"/>
/// <reference path="./Media.ts"/>
/// <reference path="./Lol.ts"/>

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
  /// The events placed on the webpage
  mFunctions = new Array<EventListener | EventListenerObject>();
  mEventTypes = new Array<string>();
  /// Keys being pressed
  mKeysPressed = new Array<boolean>();

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
    // Create the main scene and hud
    this.mWorld = new MainScene(this.mConfig, this.mMedia);
    this.mHud = new HudScene(this.mConfig, this.mMedia);

    this.mContainer = new PIXI.Container();
    // All of a scene's renderables should be in its camera's container
    this.mContainer.addChild(this.mWorld.mCamera.mContainer);
    this.mContainer.addChild(this.mHud.mCamera.mContainer);
  }

  /**
  * Before we call programmer code to load a new scene, we call this to ensure that everything is
  * in a clean state.
  */
  private onScreenChange(): void {
    for(let i=0; i < this.mFunctions.length; i++) {
      document.removeEventListener(this.mEventTypes[i], this.mFunctions[i]);
    }
    this.mFunctions.length = 0;
    this.mEventTypes.length = 0;

    this.mWorld.pauseMusic();
    this.createScenes();
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
    this.mWorld.stopMusic();
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
  * @param index The index of the level that was lost
  */
  doLose(index: number): void {
    this.onScreenChange();
    this.resetScores();
    this.mConfig.mLose.display(index, this.mLevel);
  }

  /**
  * Load a win scene
  *
  * @param index The index of the level that was won
  */
  doWin(index: number): void {
    this.onScreenChange();
    this.resetScores();
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

  /**
  * Quit the game
  */
  doQuit(): void {
    this.mWorld.stopMusic();
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
    for (let i = 0; i < 4; i++) {
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

  /*
   *  Returns number of enemies defeated
   */
  getEnemiesDefeated(): number {
    return this.mEnemiesDefeated;
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
  }

  /**
  * Update all timer counters associated with the current level
  */
  updateTimeCounts(): void {
    // Check the countdown timers
    if (this.mLoseCountDownRemaining != -100) {
      this.mLoseCountDownRemaining -= (PIXI.ticker.shared.deltaTime / 100);
      if (this.mLoseCountDownRemaining < 0) {
        this.endLevel(false);
      }
    }
    if (this.mWinCountRemaining != -100) {
      this.mWinCountRemaining -= PIXI.ticker.shared.deltaTime / 100;
      if (this.mWinCountRemaining < 0) {
        this.endLevel(true);
      }
    }
    if (this.mStopWatchProgress != -100) {
      this.mStopWatchProgress += PIXI.ticker.shared.deltaTime / 100;
    }
  }
}
