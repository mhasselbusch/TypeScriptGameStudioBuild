/// <reference path="../library/ScreenManager.ts"/>

/**
* Chooser draws the level chooser screens. Our chooser code is pretty straightforward.
*/
class Chooser implements ScreenManager {
  /**
  * Describe how to draw the buttons to go to each level.
  */
  public display(index: number, level: Level): void {
    if (index == 1) {
      // Put in some catchy background muzak
      level.setMusic("./GameAssets/TitleTheme.mp3");
      // Add a background
      level.drawPicture(0, 0, 960, 540, "./GameAssets/TitleBack.png", -2);

      // Set variables for easy placement of objects
      let midX = 960 / 2;
      let midY = 540 / 2;

      // Back to splash button
      // This adds text for the button
      level.addStaticTextCentered(midX, midY + 100, "Arial", 0x0000FF, 24, "Menu", 1);
      // This makes the button functional
      level.addTapControl(midX - 50, midY + 75, 100, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doSplash();
          return true;
        }
      })());
      // This draws the button picture
      level.drawPicture(midX - 50, midY + 75, 100, 50, "./GameAssets/button.png", -1);


      // Play level 1 button
      // Colors are written in hex values
      level.addStaticTextCentered(150, midY - 100, "Arial", 0x0000FF, 24, "Sky Fighter", 1);
      // No image, so that it doesn't cover the text
      level.addTapControl(50, midY - 125, 200, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doLevel(1);
          return true;
        }
      })());
      // Draw the image behind the text
      level.drawPicture(50, midY - 125, 200, 50, "./GameAssets/button.png", -1);


      // Play level 2 button
      level.addStaticTextCentered(midX, midY - 100, "Arial", 0x0000FF, 24, "Christmas Scramble", 1);

      level.addTapControl(midX - 125, midY - 125, 250, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doLevel(2);
          return true;
        }
      })());

      level.drawPicture(midX - 125, midY - 125, 250, 50, "./GameAssets/button.png", -1);


      // Play level 3 button
      level.addStaticTextCentered(960 - 150, midY - 100, "Arial", 0x0000FF, 24, "Dodgy Plane", 1);

      level.addTapControl(960 - 250, midY - 125, 200, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doLevel(3);
          return true;
        }
      })());

      level.drawPicture(960 - 250, midY - 125, 200, 50, "./GameAssets/button.png", -1);
    }
  }
}
