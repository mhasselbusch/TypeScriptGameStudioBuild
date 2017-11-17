"use strict";
/// <reference path="./WorldActor.ts"/>
/**
 * Destinations are actors that the Hero should try to reach. When a Hero reaches a destination, the
 * Hero disappears, and the score updates.
 */
class Destination extends WorldActor {
    /// Sound to play when a hero arrives at this destination
    //Sound mArrivalSound;
    /**
     * Create a basic Destination.  The destination won't yet have any physics attached to it.
     *
     * @param game    The currently active game
     * @param scene   The scene into which the destination is being placed
     * @param width   Width of this destination
     * @param height  Height of this destination
     * @param imgName Name of the image to display
     */
    constructor(game, scene, width, height, imgName) {
        super(game, scene, imgName, width, height);
        this.mCapacity = 1;
        this.mHolding = 0;
        this.mActivation = new Array(4);
        for (let i = 0; i < 4; i++) {
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
    onCollide(other, contact) {
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
    setActivationScore(score1, score2, score3, score4) {
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
    setHeroCount(heroes) {
        this.mCapacity = heroes;
    }
}
