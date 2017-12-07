/// <reference path="../library/ScreenManager.ts"/>
/// <reference path="../library/LolAction.ts"/>

/**
 * Technically, Help can be anything... even playable levels. In this
 * demonstration, it's just a bit of information. It's a good place to put
 * instructions, credits, etc.
 */
 class Help implements ScreenManager {

   /**
  * Describe how to draw each level of help. Our help will have 2 screens
  */
  public display(index: number, level: Level): void {
    // Our first scene describes the color coding that we use for the
    // different entities in the game
    if (index == 1) {
      // Put in some catchy background muzak
      level.setMusic("https://s3.amazonaws.com/typescript-game-studio/standard/TitleTheme.mp3");
      // Add a background
      level.drawPicture(0, 0, 960, 540, "https://s3.amazonaws.com/typescript-game-studio/standard/TitleBack.png", -2);

      // Set up variables for the middle of the page to aid placement
      let midX = 960 / 2;
      let midY = 540 / 2;

      // Set up a control to go to the splash screen on screen press
      level.addTapControl(0, 0, 960, 540, "", new (class _ extends LolAction {
        public go() {
          level.doSplash();
          return true;
        }
      })());

      // Add some help messages
      level.addStaticTextCentered(midX, 50, "Arial", 0x0000FF, 24, "INSTRUCTIONS", 0);
      level.addStaticTextCentered(midX, 100, "Arial", 0x0000FF, 24, "Sky Fight", 0);
      level.addStaticTextCentered(midX, 130, "Arial", 0x0000FF, 24, "Drop pebbles on the bats using spacebar", 0);
      level.addStaticTextCentered(midX, 160, "Arial", 0x0000FF, 24, "Rid the skies of all the bats before the time runs out", 0);

      level.addStaticTextCentered(midX, 230, "Arial", 0x0000FF, 24, "Christmas Scramble", 0);
      level.addStaticTextCentered(midX, 260, "Arial", 0x0000FF, 24, "Move with WASD", 0);
      level.addStaticTextCentered(midX, 290, "Arial", 0x0000FF, 24, "Collect all the coins and reach the end to win", 0);
      level.addStaticTextCentered(midX, 320, "Arial", 0x0000FF, 24, "Jump on santas to defeat them", 0);

      level.addStaticTextCentered(midX, 390, "Arial", 0x0000FF, 24, "Dodgy Plane", 0);
      level.addStaticTextCentered(midX, 420, "Arial", 0x0000FF, 24, "Move up with spacebar, dodge the rocks", 0);
      level.addStaticTextCentered(midX, 450, "Arial", 0x0000FF, 24, "Reach the end to win", 0);
     }
   }
}
