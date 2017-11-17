/// <reference path="../library/ScreenManager.ts"/>

/**
* Splash encapsulates the code that will be run to configure the opening screen of the game.
* Typically this has buttons for playing, getting help, and quitting.
*/
class Splash implements ScreenManager {
  /**
  * There is usually only one splash screen. However, the ScreenManager interface requires
  * display() to take a parameter for which screen to display.  We ignore it.
  *
  * @param index Which splash screen should be displayed (typically you can ignore this)
  * @param level The physics-based world that comprises the splash screen
  */
  public display(index: number, level: Level): void {
    // set up a simple level. We could make interesting things happen, since
    // we've got a physics world, but we won't.

    // draw the background. Note that "Play", "Help", and "Quit" are part of
    // this background image.
    //level.drawPicture(0, 0, 48, 32, "splash.png", 0);

    // start the music
    //level.setMusic("tune.ogg");

    // This is the Play button... it switches to the first screen of the
    // level chooser. You could jump straight to the first level by using
    // "doLevel(1)", but check the configuration in MyConfig... there's a
    // field you should change if you don't want the 'back' button to go
    // from that level to the chooser.
    level.addStaticText(300, 200, "Arial", 0xFFFF00, 24, "Play", 0);

    level.addTapControl(300, 200, 100, 50, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doChooser(1);
        return true;
      }
    })());

    // This is the Help button... it switches to the first screen of the
    // help system
    level.addStaticText(500, 200, "Arial", 0xFFFF00, 24, "Help", 0);

    level.addTapControl(500, 200, 100, 50, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doHelp(1);
        return true;
      }
    })());
  }
}
