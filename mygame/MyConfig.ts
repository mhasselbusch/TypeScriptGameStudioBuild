/// <reference path="../library/Config.ts"/>
/// <reference path="./Levels.ts"/>
/// <reference path="./Chooser.ts"/>
/// <reference path="./Help.ts"/>
/// <reference path="./Splash.ts"/>
/// <reference path="./WinScene.ts"/>
/// <reference path="./LoseScene.ts"/>

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
    this.mHeight = 540;
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
     "https://s3.amazonaws.com/typescript-game-studio/standard/button.png", "https://s3.amazonaws.com/typescript-game-studio/standard/TitleBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/Angel.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Bat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Bullet.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/CloudBall.png", "https://s3.amazonaws.com/typescript-game-studio/standard/SkyBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/ArrowSign.png", "https://s3.amazonaws.com/typescript-game-studio/standard/ChristmasBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/Crate.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GoldCoin.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/LeftEndPlat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/MiddlePlat.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/Miser.png", "https://s3.amazonaws.com/typescript-game-studio/standard/OneTree.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/RightEndPlat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Santa.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/SnowMan.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Stone.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/ThreeTrees.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Igloo.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/Plane.png", "https://s3.amazonaws.com/typescript-game-studio/standard/PlaneBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/Ceiling.png", "https://s3.amazonaws.com/typescript-game-studio/standard/Floor.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/RockUp.png", "https://s3.amazonaws.com/typescript-game-studio/standard/RockDown.png"
    );

    // list the sound effects that the game will use
    this.mSoundNames = new Array<string>(
    "https://s3.amazonaws.com/typescript-game-studio/standard/Shooting.ogg", "https://s3.amazonaws.com/typescript-game-studio/standard/EnemyKilled.wav",
    "https://s3.amazonaws.com/typescript-game-studio/standard/MoneyGet.wav",
    "https://s3.amazonaws.com/typescript-game-studio/standard/Crash.ogg"
    );

    // list the background music files that the game will use
    this.mMusicNames = new Array<string>(
    "https://s3.amazonaws.com/typescript-game-studio/standard/TitleTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/AngelTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/ChristmasTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneTheme.ogg"
    );

    // don't change these lines unless you know what you are doing
    this.mLevels = new Levels();
    this.mChooser = new Chooser();
    this.mHelp = new Help();
    this.mSplash = new Splash();
    this.mWin = new WinScene();
    this.mLose = new LoseScene();
  }
}
