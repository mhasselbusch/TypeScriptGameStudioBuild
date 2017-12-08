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
    // Put in some catchy background muzak
    level.setMusic("https://s3.amazonaws.com/typescript-game-studio/standard/TitleTheme.mp3");
    // Add a background
    level.drawPicture(0, 0, 960, 540, "https://s3.amazonaws.com/typescript-game-studio/standard/TitleBack.png", -2);

    // Set up variables for the middle of the page to aid placement
    let midX = 960 / 2;
    let midY = 540 / 2;

    // Add a button for level select (text, button, and image are separate)
    // The text is centered so the x and y will be of the center of the text
    level.addStaticTextCentered(midX, midY - 50, "Arial", 0x0000FF, 24, "Play", 0);
    // This control however will use cooridinates starting in the top left corner
    level.addTapControl(midX - 50, midY - 75, 100, 50, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doChooser(1);
        return true;
      }
    })());
    // The picture is also drawn from the top left corner
    level.drawPicture(midX - 50, midY - 75, 100, 50, "https://s3.amazonaws.com/typescript-game-studio/standard/button.png", -1);


    // This button is for the help screen
    level.addStaticTextCentered(midX, midY + 50, "Arial", 0x0000FF, 24, "Help", 0);

    level.addTapControl(midX - 50, midY + 25, 100, 50, "", new (class _ extends LolAction {
      public go(): boolean {
        level.doHelp(1);
        return true;
      }
    })());

    level.drawPicture(midX - 50, midY + 25, 100, 50, "https://s3.amazonaws.com/typescript-game-studio/standard/button.png", -1);
  }
}
