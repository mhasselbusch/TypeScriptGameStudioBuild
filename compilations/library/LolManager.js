"use strict";
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
var VictoryType;
(function (VictoryType) {
    VictoryType[VictoryType["DESTINATION"] = 0] = "DESTINATION";
    VictoryType[VictoryType["GOODIECOUNT"] = 1] = "GOODIECOUNT";
    VictoryType[VictoryType["ENEMYCOUNT"] = 2] = "ENEMYCOUNT";
})(VictoryType || (VictoryType = {}));
class LolManager {
    /**
    * Construct the LolManager, build the scenes, set up the state machine, and clear the scores.
    *
    * @param config The game-wide configuration
    * @param media  All image and sound assets for the game
    * @param game   A reference to the top-level game object
    */
    constructor(config, media, game) {
        /// Modes of the game, for use by the state machine.  We can be showing the main splash
        /// screen, the help screens, the level chooser, the store, or a playable level
        this.SPLASH = 0;
        this.HELP = 1;
        this.CHOOSER = 2;
        this.STORE = 3;
        this.PLAY = 4;
        /// The level within each mode (e.g., we are in PLAY scene 4, and will return to CHOOSER 2)
        this.mModeStates = new Array(5);
        this.mGame = game;
        this.mConfig = config;
        this.mMedia = media;
        // Set up the API, so that any user code we call is able to reach this object
        this.mLevel = new Level(this.mConfig, this.mMedia, this.mGame);
        // build scenes and facts
        this.createScenes();
        this.mSessionFacts = new Map();
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
    resetScores() {
        this.mVictoryGoodieCount = new Array(4);
        this.mHeroesCreated = 0;
        this.mGoodiesCollected = new Array(0, 0, 0, 0);
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
    createScenes() {
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
    onScreenChange() {
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
    advanceLevel() {
        // Make sure to stop the music!
        //this.mWorld.stopMusic();
        if (this.mModeStates[this.PLAY] == this.mConfig.mNumLevels) {
            this.doChooser(1);
        }
        else {
            this.mModeStates[this.PLAY]++;
            this.doPlay(this.mModeStates[this.PLAY]);
        }
    }
    /**
    * Start a level over again.
    */
    repeatLevel() {
        this.doPlay(this.mModeStates[this.PLAY]);
    }
    /**
    * Load the splash screen
    */
    doSplash() {
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
    doChooser(index) {
        // if chooser disabled, then we either called this from splash, or from a game level
        if (!this.mConfig.mEnableChooser) {
            if (this.mMode == this.PLAY) {
                this.doSplash();
            }
            else {
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
    doPlay(index) {
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
    doHelp(index) {
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
    doLose(index) {
        this.onScreenChange();
        this.mConfig.mLose.display(index, this.mLevel);
    }
    /**
    * Load a win scene
    *
    * @param index The index of the help level to load
    */
    doWin(index) {
        this.onScreenChange();
        this.mConfig.mWin.display(index, this.mLevel);
    }
    /**
    * Load a screen of the store.
    *
    * @param index The index of the help level to load
    */
    doStore(index) {
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
    doQuit() {
        //this.mWorld.stopMusic();
        //Gdx.app.exit();
    }
    /**
    * Indicate that a hero has been defeated
    *
    * @param enemy The enemy who defeated the hero
    */
    defeatHero(enemy) {
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
    onGoodieCollected(goodie) {
        // Update goodie counts
        for (let i = 0; i < 4; ++i) {
            this.mGoodiesCollected[i] += goodie.mScore[i];
        }
        // possibly win the level, but only if we win on goodie count and all
        // four counts are high enough
        if (this.mVictoryType != VictoryType.GOODIECOUNT) {
            return;
        }
        let match = true;
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
    onDestinationArrive() {
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
    onDefeatEnemy() {
        // update the count of defeated enemies
        this.mEnemiesDefeated++;
        // if we win by defeating enemies, see if we've defeated enough of them:
        let win = false;
        if (this.mVictoryType == VictoryType.ENEMYCOUNT) {
            // -1 means "defeat all enemies"
            if (this.mVictoryEnemyCount == -1) {
                win = this.mEnemiesDefeated == this.mEnemiesCreated;
            }
            else {
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
    endLevel(win) {
        if (win) {
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
    updateTimeCounts() {
        // Check the countdown timers
        if (this.mLoseCountDownRemaining != -100) {
            this.mLoseCountDownRemaining -= PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
            if (this.mLoseCountDownRemaining < 0) {
                if (this.mLoseCountDownText !== "") {
                    this.mLoseScene.setDefaultText(this.mLoseCountDownText);
                }
                this.endLevel(false);
            }
        }
        if (this.mWinCountRemaining != -100) {
            this.mWinCountRemaining -= PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
            if (this.mWinCountRemaining < 0) {
                if (this.mWinCountText !== "") {
                    this.mWinScene.setDefaultText(this.mWinCountText);
                }
                this.endLevel(true);
            }
        }
        if (this.mStopWatchProgress != -100) {
            this.mStopWatchProgress += PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
        }
    }
}
