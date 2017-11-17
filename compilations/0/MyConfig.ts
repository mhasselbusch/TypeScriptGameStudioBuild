/// <reference path="../library/Config.ts"/>

/**
* Any configuration that the programmer needs to provide to Lol should go here.
* <p/>
* Config stores things like screen dimensions, default text and font configuration,
* and the names of all the assets (images and sounds) used by the game.
* <p/>
* Be sure to look at the Levels.java file for how each level of the game is
* drawn, as well as Splash.ts, Chooser.ts, Help.ts.
*/
class MyConfig extends Config {

  /**
  * The MyConfig object is used to pass configuration information to the LOL
  * system.
  * <p/>
  * To see documentation for any of these variables, hover your mouse
  * over the word on the left side of the equals sign.
  */
  constructor() {
    super();
    // The size of the screen, and some game behavior configuration
    this.mWidth = 960;
    this.mHeight = 640;
    this.mPixelMeterRatio = 20;
    this.mEnableVibration = true;
    this.mGameTitle = "Micah's Basic Game";
    this.mDefaultWinText = "Good Job";
    this.mDefaultLoseText = "Try Again";
    //this.mShowDebugBoxes = true;

    // Chooser configuration
    this.mNumLevels = 1;
    this.mEnableChooser = true;
    this.mUnlockAllLevels = true;

    // Font configuration
    this.mDefaultFontFace = "Arial";
    this.mDefaultFontSize = 32;
    this.mDefaultFontColor = "#FFFFFF";

    // list the images that the game will use
    this.mImageNames = new Array<string>(
    "https://s3.amazonaws.com/typescript-game-studio/standard/fun.jpg", 
    "https://s3.amazonaws.com/typescript-game-studio/standard/BlueBox.png", 
    "https://s3.amazonaws.com/typescript-game-studio/standard/OrangeBox.png");

    // list the sound effects that the game will use
    //this.mSoundNames = new string[]();

    // list the background music files that the game will use
    //this.mMusicNames = new string[]();

    // don't change these lines unless you know what you are doing
    this.mLevels = new Levels();
    this.mChooser = new Chooser();
    this.mHelp = new Help();
    this.mSplash = new Splash();
    this.mWin = new WinScene();
    this.mLose = new LoseScene();
  }
}
