/// <reference path="../library/ScreenManager.ts"/>

/**
* This is the scene that is displayed when you win a level
*/
class WinScene implements ScreenManager {
  /**
  * Implement the display function
  *
  * @param index Which level you won
  * @param level The public api
  */
  public display(index: number, level: Level): void {
    // Configure our win screen
    // Add a background
    level.drawPicture(0, 0, 960, 540, "./GameAssets/TitleBack.png", -2);
    // Add an uplifting message
    level.addStaticTextCentered(960/2, 540/2, "Arial", 0x0000FF, 32, "You win!! You must be super cool!", 0);
    // Make it so they can click to go back to the level select screen
    level.addTapControl(0, 0, 960, 540, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doChooser(1);
        return true;
      }
    })());
    // Make it so we can use the spacebar
    level.setKeyAction(32, new (class _ extends LolAction {
      public go(): boolean {
        level.doChooser(1);
        return true;
      }
    })(), null, false);
  }
}
