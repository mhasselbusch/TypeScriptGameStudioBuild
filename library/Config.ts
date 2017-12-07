/// <reference path="./ScreenManager.ts"/>

/**
* Config stores game-specific configuration values.
* <p>
* A programmer should extend Config, and change these values in their class constructor.
*/
class Config {
  /// The default game width
  public mWidth: number;
  /// The default game height
  public mHeight: number;

  /// The game title.
  public mGameTitle: string;
  /// Default text to display when a level is won
  /* protected */ mDefaultWinText: string;
  /// Default text to display when a level is lost
  /* protected */ mDefaultLoseText: string;

  /// Total number of levels. This helps the transition when a level is won
  /* protected */ mNumLevels: number;
  /// Should the level chooser be activated?
  /* protected */ mEnableChooser: boolean;
  /// Should all levels be unlocked?
  /* protected */ mUnlockAllLevels: boolean;

  /// The default font face to use when writing text to the screen
  /* protected */ mDefaultFontFace: string;
  /// Default font size
  /* protected */ mDefaultFontSize: number; //int
  /// Default font color, as #RRGGBB value
  /* protected */ mDefaultFontColor: string;

  /// The list of image files that will be used by the game
  /* protected */ mImageNames: Array<string>;
  /// The list of audio files that will be used as sound effects by the game
  /* protected */ mSoundNames: Array<string>;
  /// The list of audio files that will be used as (looping) background music by the game
  /* protected */ mMusicNames: Array<string>;

  /// An object to draw the main levels of the game
  /* protected */ mLevels: ScreenManager;
  /// An object to draw the level chooser
  /* protected */ mChooser: ScreenManager;
  /// An object to draw the help screens
  /* protected */ mHelp: ScreenManager;
  /// An object to draw the opening "splash" screen
  /* protected */ mSplash: ScreenManager;
  /// An object to draw the store screens
  /* protected */ mStore: ScreenManager;
  /// An object to draw the victory screen
  /* protected */ mWin: ScreenManager;
  /// An object to draw the lose screen
  /* protected */ mLose: ScreenManager;

  constructor() {}
}
