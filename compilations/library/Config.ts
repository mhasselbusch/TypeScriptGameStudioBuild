/// <reference path="./ScreenManager.ts"/>

/**
* Config stores game-specific configuration values.
* <p>
* A programmer should extend Config, and change these values in their class constructor.
*/
class Config {
  /// The number of pixels on screen that correspond to a meter in the game.
  ///
  /// NB: 'pixels' are relative to <code>mWidth</code> and <code>mHeight</code>
  public mPixelMeterRatio: number; //float
  /// The default screen width (note: it will be stretched to fill the phone screen)
  public mWidth: number; //int
  /// The default screen height (note: it will be stretched to fill the phone screen)
  public mHeight: number; //int
  /// Should the phone vibrate on certain events?
  /* protected */ mEnableVibration: boolean;

  /// The game title.  This only matters in Desktop mode.
  public mGameTitle: string;
  /// Default text to display when a level is won
  /* protected */ mDefaultWinText: string;
  /// Default text to display when a level is lost
  /* protected */ mDefaultLoseText: string;

  /// When this is true, the game will show an outline corresponding to the physics body behind
  /// each WorldActor
  /* protected */ mShowDebugBoxes: boolean;

  /// Total number of levels. This helps the transition when a level is won
  /* protected */ mNumLevels: number; //int
  /// Should the level chooser be activated?
  /* protected */ mEnableChooser: boolean;
  /// Should all levels be unlocked?
  /* protected */ mUnlockAllLevels: boolean;

  /// A per-game string, to use for storing information on an Android device
  /* protected */ //mStorageKey: string;

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
