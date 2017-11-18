/// <reference path="../library/ScreenManager.ts"/>

/**
* Levels is where all of the code goes for describing the different levels of
* the game. If you know how to create methods and classes, you're free to make
* the big "if" statement in this code simply call to your classes and methods.
* Otherwise, put your code directly into the parts of the "if" statement.
*/
class Levels implements ScreenManager {

  /**
  * We currently have 94 levels, each of which is described in part of the
  * following function.
  */
  public display(index: number, level: Level): void {
    /*
    * In this level, all we have is a hero (the green ball) who needs to
    * make it to the destination (a mustard colored ball). The game is
    * configured to use tilt to control the level.
    */
    if (index == 1) {
      // set the screen to 48 meters wide by 32 meters high... this is
      // important, because Config.java says the screen is 480x320, and
      // LOL likes a 20:1 pixel to meter ratio. If we went smaller than
      // 48x32, things would getLoseScene really weird. And, of course, if you make
      // your screen resolution higher in Config.java, these numbers would
      // need to getLoseScene bigger.
      //

      //level.configureGravity

      //level.resetGravity(0, 90);

      // now let's create a hero, and indicate that the hero can move by
      // tilting the phone. "greenball.png" must be registered in
      // the registerMedia() method, which is also in this file. It must
      // also be in your android game's assets folder.
      let h: Hero = level.makeHeroAsBox(960/2, 640/2, 30, 30, "./images/OrangeBox.png");
      level.setCameraChase(h);
      level.setArrowKeyControls(h, 50);


      let e: Enemy = level.makeEnemyAsBox(960/2 - 80, 640/2 + 100, 30, 30, "./images/BlueBox.png")

      //let o: Obstacle = level.makeObstacleAsBox(0, 500, 960, 1, "./images/BlueBox.png");

      // draw a destination, and indicate that the level is won
      // when the hero reaches the level.
      level.makeDestinationAsBox(960/2 + 55, 640/2 + 155, 100, 100, "./images/fun.jpg");
      level.setVictoryDestination(1);
    }
  }
}
