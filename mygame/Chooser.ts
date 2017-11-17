/// <reference path="../library/ScreenManager.ts"/>

/**
* Chooser draws the level chooser screens. Our chooser code is pretty
* straightforward. However, the different screens are drawn in different ways,
* to show how we can write more effective code once we are comfortable with
* loops and basic geometry.
*/
class Chooser implements ScreenManager {
  /**
  * Describe how to draw each level of the chooser. Our chooser will have 15
  * levels per screen, so we need 7 screens.
  */
  public display(index: number, level: Level): void {
    // screen 1: show 1-->15
    //
    // NB: in this screen, we assume you haven't done much programming, so
    // we draw each button with its own line of code, and we don't use any
    // variables.
    if (index == 1) {

      // Back to splash
      level.addStaticText(300, 200, "Arial", 0xFFFF00, 24, "Back to Menu", 0);

      level.addTapControl(300, 200, 100, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doSplash();
          return true;
        }
      })());

      // Play level 1
      level.addStaticText(500, 200, "Arial", 0xFFFF00, 24, "Play Level 1", 0);

      level.addTapControl(500, 200, 100, 50, "", new (class _ extends LolAction {
        public go(): boolean {
          level.doLevel(1);
          return true;
        }
      })());
    }
  }
}
