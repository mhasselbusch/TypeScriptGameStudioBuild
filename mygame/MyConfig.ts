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
     "./GameAssets/button.png", "./GameAssets/TitleBack.png",
     "./GameAssets/AngelGame/Angel.png", "./GameAssets/AngelGame/Bat.png", "./GameAssets/AngelGame/Bullet.png",
     "./GameAssets/AngelGame/CloudBall.png", "./GameAssets/AngelGame/SkyBack.png",
     "./GameAssets/ChristmasGame/ArrowSign.png", "./GameAssets/ChristmasGame/ChristmasBack.png",
     "./GameAssets/ChristmasGame/Crate.png", "./GameAssets/ChristmasGame/GoldCoin.png",
     "./GameAssets/ChristmasGame/LeftEndPlat.png", "./GameAssets/ChristmasGame/MiddlePlat.png",
     "./GameAssets/ChristmasGame/Miser.png", "./GameAssets/ChristmasGame/OneTree.png",
     "./GameAssets/ChristmasGame/RightEndPlat.png", "./GameAssets/ChristmasGame/Santa.png",
     "./GameAssets/ChristmasGame/SnowMan.png", "./GameAssets/ChristmasGame/Stone.png",
     "./GameAssets/ChristmasGame/ThreeTrees.png", "./GameAssets/ChristmasGame/Igloo.png",
     "./GameAssets/PlaneGame/Plane.png", "./GameAssets/PlaneGame/PlaneBack.png",
     "./GameAssets/PlaneGame/Ceiling.png", "./GameAssets/PlaneGame/Floor.png",
     "./GameAssets/PlaneGame/RockUp.png", "./GameAssets/PlaneGame/RockDown.png"
    );

    // list the sound effects that the game will use
    this.mSoundNames = new Array<string>(
    "./GameAssets/AngelGame/Shooting.ogg", "./GameAssets/AngelGame/EnemyKilled.wav",
    "./GameAssets/ChristmasGame/MoneyGet.wav",
    "./GameAssets/PlaneGame/Crash.ogg"
    );

    // list the background music files that the game will use
    this.mMusicNames = new Array<string>(
    "./GameAssets/TitleTheme.mp3",
    "./GameAssets/AngelGame/AngelTheme.mp3",
    "./GameAssets/ChristmasGame/ChristmasTheme.mp3",
    "./GameAssets/PlaneGame/PlaneTheme.ogg"
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
