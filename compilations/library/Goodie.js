"use strict";
/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
* Goodies are actors that a hero can collect.
* <p>
* Collecting a goodie has three possible consequences: it can change the score, it can change the
* hero's strength, and it can make the hero invincible
*/
class Goodie extends WorldActor {
    /**
    * Create a basic Goodie.  The goodie won't yet have any physics attached to it.
    *
    * @param game    The currently active game
    * @param scene   The scene into which the destination is being placed
    * @param width   width of this Goodie
    * @param height  height of this Goodie
    * @param imgName image to use for this Goodie
    */
    constructor(game, scene, width, height, imgName) {
        super(game, scene, imgName, width, height);
        this.mStrengthBoost = 0;
        this.mInvincibilityDuration = 0;
        this.mScore = new Array();
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
    onCollide(other, contact) {
    }
}
