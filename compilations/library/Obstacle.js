"use strict";
/// <reference path="./WorldActor.ts"/>
/// <reference path="./CollisionCallback.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Level.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
 * Obstacles are usually walls, except they can move, and can be used to run all sorts of arbitrary
 * code that changes the game, or the behavior of the things that collide with them. It's best to
 * think of them as being both "a wall" and "a catch-all for any behavior that we don't have
 * anywhere else".
 */
class Obstacle extends WorldActor {
    /**
     * Build an obstacle, but do not give it any Physics body yet
     *
     * @param width   width of this Obstacle
     * @param height  height of this Obstacle
     * @param imgName Name of the image file to use
     */
    constructor(game, level, width, height, imgName) {
        super(game, level, imgName, width, height);
    }
    // /**
    //  * Internal method for playing a sound when a hero collides with this obstacle
    //  */
    // playCollideSound(): void {
    //     if (this.mCollideSound == null)
    //         return;
    //
    //     // Make sure we have waited long enough since the last time we played the sound
    //     let now = System.currentTimeMillis(); //TODO: find an equivalent for this
    //     if (now < this.mLastCollideSoundTime + this.mCollideSoundDelay)
    //         return;
    //     this.mLastCollideSoundTime = now;
    //     this.mCollideSound.play(Lol.getGameFact(this.mScene.mConfig, "volume", 1));
    // }
    /**
     * Code to run when an Obstacle collides with a WorldActor.
     *
     * The Obstacle always comes last in the collision hierarchy, so no code is needed here
     *
     * @param other   Other object involved in this collision
     * @param contact A description of the contact that caused this collision
     */
    //@Override
    onCollide(other, contact) {
    }
}
