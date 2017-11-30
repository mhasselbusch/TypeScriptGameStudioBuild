/// <reference path="./WorldActor.ts"/>

/**
 * Destinations are actors that the Hero should try to reach. When a Hero reaches a destination, the
 * Hero disappears, and the score updates.
 */
class Destination extends WorldActor {
    /// the number of heroes who can fit at /this/ destination
    mCapacity: number;
    /// the number of heroes already in /this/ destination
    mHolding: number;
    /// the number of type each type of Goodie that must be collected before this Destination
    /// accepts any heroes
    mActivation: Array<number>;
    /// Sound to play when a hero arrives at this destination
    mArrivalSound: Sound;

    /**
     * Create a basic Destination.  The destination won't yet have any physics attached to it.
     *
     * @param game    The currently active game
     * @param scene   The scene into which the destination is being placed
     * @param width   Width of this destination
     * @param height  Height of this destination
     * @param imgName Name of the image to display
     */
    constructor(game: Lol, scene: MainScene, width: number, height: number, imgName: string) {
        super(game, scene, imgName, width, height);
        this.mCapacity = 1;
        this.mHolding = 0;
        this.mActivation = new Array<number>(4);
        for(let i = 0; i < 4; i++) {
          this.mActivation[i] = 0;
        }
    }

    /**
     * Code to run when a Destination collides with a WorldActor.
     * <p>
     * NB: Destinations are at the end of the collision hierarchy, so we don't do anything when
     * they are in a collision that hasn't already been handled by a higher-ranked WorldActor.
     *
     * @param other   Other actor involved in this collision
     * @param contact A description of the collision
     */
    //@Override
    onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    }

    /**
     * Change the number of goodies that must be collected before the destination accepts any heroes
     * (the default is 0,0,0,0)
     *
     * @param score1 The number of type-1 goodies that must be collected.
     * @param score2 The number of type-2 goodies that must be collected.
     * @param score3 The number of type-3 goodies that must be collected.
     * @param score4 The number of type-4 goodies that must be collected.
     */
    public setActivationScore(score1: number, score2: number, score3: number, score4: number): void {
        this.mActivation[0] = score1;
        this.mActivation[1] = score2;
        this.mActivation[2] = score3;
        this.mActivation[3] = score4;
    }

    /**
     * Change the number of heroes that can be accepted by this destination (the default is 1)
     *
     * @param heroes The number of heroes that can be accepted
     */
    public setHeroCount(heroes: number): void {
        this.mCapacity = heroes;
    }

    // /**
    //  * Specify the sound to play when a hero arrives at this destination
    //  *
    //  * @param soundName The name of the sound file that should play
    //  */
    // public setArrivalSound(String soundName): void {
    //     this.mArrivalSound = this.mScene.mMedia.getSound(soundName);
    // }
}
