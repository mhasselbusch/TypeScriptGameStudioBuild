/// <reference path="./BaseActor.ts"/>
//// <reference path="./MainScene.ts"/>
//// <reference path="./Lol.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

abstract class WorldActor extends BaseActor {
  /// A reference to the top-level Lol object
  readonly mGame: Lol;

  /**
   * Create a new actor that does not yet have physics, but that has a renderable picture
   *
   * @param game    The currently active game
   * @param scene   The scene into which the actor is being placed
   * @param imgName The image to display
   * @param width   The width
   * @param height  The height
   */
  constructor(game: Lol, scene: MainScene, imgName: string, width: number, height: number) {
      super(scene, imgName, width, height);
      this.mGame = game;
  }

  /**
   * Each descendant defines this to address any custom logic that we need to deal with on a
   * collision
   *
   * @param other   Other object involved in this collision
   * @param contact A description of the contact that caused this collision
   */
  abstract onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void;
}
