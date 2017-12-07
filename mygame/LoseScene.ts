/// <reference path="../library/ScreenManager.ts"/>

/**
* This is the scene that is displayed when you lose a level
*/
class LoseScene implements ScreenManager {
  /**
  * Implement the display function
  *
  * @param index The level you lost on
  * @param level The physics-based world that comprises the splash screen
  */
  public display(index: number, level: Level): void {
    // Configure our win screen

    // Add a background
    level.drawPicture(0, 0, 960, 540, "https://s3.amazonaws.com/typescript-game-studio/standard/TitleBack.png", -2);
    // Add a degrading message to make the player feel bad about themself
    level.addStaticTextCentered(960/2, 540/2, "Arial", 0x0000FF, 32, "You lost, try being better", 0);
    // Make it so they can click to go back to the level select screen
    level.addTapControl(0, 0, 960, 540, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doLevel(index);
        return true;
      }
    })());
    // Make it so we can use the spacebar
    level.setKeyAction(32, new (class _ extends LolAction {
      public go(): boolean {
        level.doLevel(index);
        return true;
      }
    })(), null, false);
  }
}
