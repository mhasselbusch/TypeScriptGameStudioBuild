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
            // set up a basic screen
            //level.setBackgroundColor(0x00FFFF);

            //set up a control to go to the splash screen on screen press
            level.addTapControl(0, 0, 960, 640, "", new (class _ extends LolAction {
                public go() {
                    level.doSplash();
                    return true;
                }
            })());

            //PIXI.loader.add("./images/fun.jpg").load();
            //let Obstacle1 = level.makeObstacleAsBox(0, 0, 25, 25, "https://s3.amazonaws.com/typescript-game-studio/standard/fun.jpg");

            level.addStaticText(280, 220, "Arial", 0xFFFFFF, 24, "This is an example Help screen", 0);
            level.addStaticText(280, 320, "Arial", 0xFFFFFF, 24, "You are the heroic orange box", 0);
            level.addStaticText(280, 420, "Arial", 0xFFFFFF, 24, "Your enemies are the evil blue boxes", 0);

            //level.addImage(400, 490, 150, 150, "./images/fun.jpg");
        }
    }
}
