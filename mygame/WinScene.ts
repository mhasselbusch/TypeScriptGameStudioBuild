/// <reference path="../library/ScreenManager.ts"/>

/**
* Splash encapsulates the code that will be run to configure the opening screen of the game.
* Typically this has buttons for playing, getting help, and quitting.
*/
class WinScene implements ScreenManager {
  /**
  * There is usually only one splash screen. However, the ScreenManager interface requires
  * display() to take a parameter for which screen to display.  We ignore it.
  *
  * @param index Which splash screen should be displayed (typically you can ignore this)
  * @param level The physics-based world that comprises the splash screen
  */
  public display(index: number, level: Level): void {
    // Configure our win screen

    // This is the Play button... it switches to the first screen of the
    // level chooser. You could jump straight to the first level by using
    // "doLevel(1)", but check the configuration in MyConfig... there's a
    // field you should change if you don't want the 'back' button to go
    // from that level to the chooser.
    level.addStaticText(960/2 - 100, 640/2 - 10, "Arial", 0x00FFFF, 32, "You Win!!", 0);

    level.addTapControl(0, 0, 960, 640, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doChooser(1);
        return true;
      }
    })());
  }
}
