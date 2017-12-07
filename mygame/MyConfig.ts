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
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/button.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/TitleBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/Angel.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/Bat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/Bullet.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/CloudBall.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/SkyBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/ArrowSign.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/ChristmasBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/Crate.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/GoldCoin.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/LeftEndPlat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/MiddlePlat.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/Miser.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/OneTree.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/RightEndPlat.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/Santa.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/SnowMan.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/Stone.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/ThreeTrees.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/Igloo.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/Plane.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/PlaneBack.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/Ceiling.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/Floor.png",
     "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/RockUp.png", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/RockDown.png"
    );

    // list the sound effects that the game will use
    this.mSoundNames = new Array<string>(
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/Shooting.ogg", "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/EnemyKilled.wav",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/MoneyGet.wav",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/Crash.ogg"
    );

    // list the background music files that the game will use
    this.mMusicNames = new Array<string>(
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/TitleTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/AngelGame/AngelTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/ChristmasGame/ChristmasTheme.mp3",
    "https://s3.amazonaws.com/typescript-game-studio/standard/GameAssets/PlaneGame/PlaneTheme.ogg"
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
