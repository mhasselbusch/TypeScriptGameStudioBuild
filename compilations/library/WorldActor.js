"use strict";
/// <reference path="./BaseActor.ts"/>
/// <reference path="./TouchEventHandler.ts"/>
//// <reference path="./Lol.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class WorldActor extends BaseActor {
    /**
    * Create a new actor that does not yet have physics, but that has a renderable picture
    *
    * @param game    The currently active game
    * @param scene   The scene into which the actor is being placed
    * @param imgName The image to display
    * @param width   The width
    * @param height  The height
    */
    constructor(game, scene, imgName, width, height) {
        super(scene, imgName, width, height);
        /// When the camera follows the actor without centering on it, this gives us the difference
        /// between the actor and camera
        this.mCameraOffset = new PhysicsType2d.Vector2(0, 0);
        /// Track if Heros stick to this WorldActor. The array has 4 positions, corresponding to top,
        /// right, bottom, left
        //boolean[] mIsSticky = new boolean[4];
        /// Disable 3 of 4 sides of a Actors, to allow walking through walls. The value reflects the
        /// side that remains active. 0 is top, 1 is right, 2 is bottom, 3 is left
        this.mIsOneSided = -1;
        /// Actors with a matching nonzero Id don't collide with each other
        this.mPassThroughId = 0;
        this.mGame = game;
    }
    /**
    * Indicate that when this actor stops, we should run custom code
    *
    * @param callback The callback to run when the actor stops
    */
    setStopCallback(callback) {
        let out_this = this;
        this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
            constructor() {
                super(...arguments);
                this.moving = false;
            }
            //@Override
            go() {
                let speed = out_this.mBody.GetLinearVelocity();
                if (!this.moving && (Math.abs(speed.x) > 0 || Math.abs(speed.y) > 0)) {
                    this.moving = true;
                }
                else if (this.moving && speed.x == 0 && speed.y == 0) {
                    callback.go(out_this);
                    this.moving = false;
                }
            }
        })());
    }
    /**
    * Make the camera follow the actor, but without centering the actor on the screen
    *
    * @param x Amount of x distance between actor and center
    * @param y Amount of y distance between actor and center
    */
    setCameraOffset(x, y) {
        this.mCameraOffset.x = x;
        this.mCameraOffset.y = y;
    }
    /**
    * Indicate that the actor should move with the tilt of the phone
    */
    setMoveByTilting() {
        // If we've already added this to the set of tiltable objects, don't do it again
        if (this.mScene.mTiltActors.indexOf(this) < 0) {
            return;
        }
        // make sure it is moveable, add it to the list of tilt actors
        if (this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.DYNAMIC) {
            this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
        }
        this.mScene.mTiltActors.push(this);
        // turn off sensor behavior, so this collides with stuff...
        this.setCollisionsEnabled(true);
    }
}
