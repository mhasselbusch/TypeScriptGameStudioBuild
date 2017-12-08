/// <reference path="./WorldActor.ts"/>


/**
* Goodies are actors that a hero can collect.
* <p>
* Collecting a goodie has three possible consequences: it can change the score, it can change the
* hero's strength, and it can make the hero invincible
*/
class Goodie extends WorldActor {
  /// The "score" of this goodie... it is the amount that will be added to the score when the
  /// goodie is collected. This is different than a hero's strength because this actually bumps
  /// the score, which in turn lets us have "super goodies" that turn on callback obstacles.
  mScore: Array<number>;
  ///  How much strength does the hero get by collecting this goodie
  mStrengthBoost: number;
  ///  How long will the hero be invincible if it collects this goodie
  mInvincibilityDuration: number;

  /**
  * Create a basic Goodie.  The goodie won't yet have any physics attached to it.
  *
  * @param game    The currently active game
  * @param scene   The scene into which the destination is being placed
  * @param width   width of this Goodie
  * @param height  height of this Goodie
  * @param imgName image to use for this Goodie
  */
  constructor(game: Lol, scene: MainScene, width: number, height: number, imgName: string) {
    super(game, scene, imgName, width, height);
    this.mStrengthBoost = 0;
    this.mInvincibilityDuration = 0;
    this.mScore = new Array<number>();
    this.mScore[0] = 1;
    this.mScore[1] = 0;
    this.mScore[2] = 0;
    this.mScore[3] = 0;
  }

  /**
  * Code to run when a Goodie collides with a WorldActor.
  * <p>
  * NB: Goodies are at the end of the collision hierarchy, so we don't do anything when
  * they are in a collision that hasn't already been handled by a higher-ranked WorldActor.
  *
  * @param other   Other object involved in this collision
  * @param contact A description of the contact that caused this collision
  */
  //@Override
  onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
  }
}
