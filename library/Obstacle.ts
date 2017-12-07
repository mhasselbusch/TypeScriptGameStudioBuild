/// <reference path="./WorldActor.ts"/>
/// <reference path="./CollisionCallback.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Level.ts"/>

/**
 * Obstacles are usually walls, except they can move, and can be used to run all sorts of arbitrary
 * code that changes the game, or the behavior of the things that collide with them. It's best to
 * think of them as being both "a wall" and "a catch-all for any behavior that we don't have
 * anywhere else".
 */
class Obstacle extends WorldActor {
    /// One of the main uses of obstacles is to use hero/obstacle collisions as a way to run custom
    /// code. This callback defines what code to run when a hero collides with this obstacle.
    mHeroCollision: CollisionCallback;
    /// This callback is for when an enemy collides with an obstacle
    mEnemyCollision: CollisionCallback;
    /// This callback is for when a projectile collides with an obstacle
    mProjectileCollision: CollisionCallback;
    /// Indicate that this obstacle does not re-enableTilt jumping for the hero
    mNoJumpReenable: boolean;
    /// a sound to play when the obstacle is hit by a hero
    private mCollideSound: Sound;
    /// how long to delay (in nanoseconds) between attempts to play the collide sound
    private mCollideSoundDelay: number; //long
    /// Time of last collision sound
    private mLastCollideSoundTime: number; //long

    /**
     * Build an obstacle, but do not give it any Physics body yet
     *
     * @param width   width of this Obstacle
     * @param height  height of this Obstacle
     * @param imgName Name of the image file to use
     */
    constructor(game: Lol, level: MainScene, width: number, height: number, imgName: string) { //TODO: protected?
        super(game, level, imgName, width, height);
    }

    /**
     * Internal method for playing a sound when a hero collides with this obstacle
     */
    playCollideSound(): void {
        if (this.mCollideSound == null)
            return;

        // Make sure we have waited long enough since the last time we played the sound
        let now = (new Date()).getTime();
        if (now < this.mLastCollideSoundTime + this.mCollideSoundDelay)
            return;
        this.mLastCollideSoundTime = now;
        this.mCollideSound.play();
    }

    /**
     * Code to run when an Obstacle collides with a WorldActor.
     *
     * The Obstacle always comes last in the collision hierarchy, so no code is needed here
     *
     * @param other   Other object involved in this collision
     * @param contact A description of the contact that caused this collision
     */
    //@Override
    onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    }

    /**
     * Make the Obstacle into a pad that changes the hero's speed when the hero glides over it.
     * <p>
     * These "pads" will multiply the hero's speed by the factor given as a parameter. Factors can
     * be negative to cause a reverse direction, less than 1 to cause a slowdown (friction pads), or
     * greater than 1 to serve as zoom pads.
     *
     * @param factor Value to multiply the hero's velocity when it collides with this Obstacle
     */
    public setPad(factor: number): void {
        // disable collisions on this obstacle
        this.setCollisionsEnabled(false);
        // register a callback to multiply the hero's speed by factor
        this.mHeroCollision = new (class _ implements CollisionCallback {
            //@Override
            public go(self: WorldActor, h: WorldActor, c: PhysicsType2d.Dynamics.Contacts.Contact): void {
                let v: PhysicsType2d.Vector2 = h.mBody.GetLinearVelocity();
                v.Multiply(factor);
                h.updateVelocity(v.x, v.y);
            }
        })();
    }

 /**
  * Call this on an obstacle to make it behave like a "pad" obstacle, except with a constant
  * additive (or subtractive) effect on the hero's speed.
  *
  * @param boostAmountX  The amount to add to the hero's X velocity
  * @param boostAmountY  The amount to add to the hero's Y velocity
  * @param boostDuration How long should the speed boost last (use -1 to indicate "forever")
  */
 public setSpeedBoost(boostAmountX: number, boostAmountY: number, boostDuration: number): void {
     // disable collisions on this obstacle
     this.setCollisionsEnabled(false);
     // register a callback to change the hero's speed
     this.mHeroCollision = new (class _ implements CollisionCallback {
         //@Override
         public go(self: WorldActor, h: WorldActor, c: PhysicsType2d.Dynamics.Contacts.Contact): void {
             // boost the speed
             let v: PhysicsType2d.Vector2 = h.mBody.GetLinearVelocity();
             v.x += boostAmountX;
             v.y += boostAmountY;
             h.updateVelocity(v.x, v.y);
             // now set a timer to un-boost the speed
             if (boostDuration > 0) {
                 // set up a timer to shut off the boost
                 setTimeout(() => {
                     let v: PhysicsType2d.Vector2 = h.mBody.GetLinearVelocity();
                     v.x -= boostAmountX;
                     v.y -= boostAmountY;
                     h.updateVelocity(v.x, v.y);
                 }, boostDuration);
             }
         }
     })();
 }

    /**
     * Control whether the hero can jump if it collides with this obstacle while in the air
     *
     * @param enable true if the hero can jump again, false otherwise
     */
    public setReJump(enable: boolean): void {
        this.mNoJumpReenable = !enable;
    }

    /**
     * Make the object a callback object, so that custom code will run when a hero collides with it
     *
     * @param activationGoodies1 Number of type-1 goodies needed before this callback works
     * @param activationGoodies2 Number of type-2 goodies needed before this callback works
     * @param activationGoodies3 Number of type-3 goodies needed before this callback works
     * @param activationGoodies4 Number of type-4 goodies needed before this callback works
     * @param delay              The time between when the collision happens, and when the callback
     *                           code runs. Use 0 for immediately
     * @param callback           The code to run when the collision happens
     */
    public setHeroCollisionCallback(activationGoodies1: number, activationGoodies2: number,
                                         activationGoodies3: number, activationGoodies4: number,
                                         delay: number, callback: CollisionCallback): void {
        // save the required goodie counts, turn off collisions
        const counts: number[] = [activationGoodies1, activationGoodies2, activationGoodies3, activationGoodies4];
        this.setCollisionsEnabled(false);

        let outer_this = this;
        // register a callback
        this.mHeroCollision = new (class _ implements CollisionCallback {
            //@Override
            public go(self: WorldActor, ps: WorldActor, c: PhysicsType2d.Dynamics.Contacts.Contact): void {
                // Make sure the contact is active (it's not if this is a pass-through event)
                if (c.IsEnabled()) {
                    // check if callback is activated, if so run Callback code
                    let match: boolean = true;
                    for (let i = 0; i < 4; ++i)
                        match = match && (counts[i] <= outer_this.mGame.mManager.mGoodiesCollected[i]);
                    if (match) {
                        // run now, or delay?
                        if (delay <= 0) {
                            callback.go(self, ps, c);
                        } else {
                            setTimeout(() => {
                                    callback.go(self, ps, c);
                            }, delay);
                        }
                    }
                }
            }
        })();
    }

    /**
     * Make the object a callback object, so custom code will run when an enemy collides with it
     *
     * @param delay    The time between when the collision happens, and when the callback code runs.
     *                 Use 0 for immediately
     * @param callback The code to run when an enemy collides with this obstacle
     */
    public setEnemyCollisionCallback(delay: number, callback: CollisionCallback) {
        this.mEnemyCollision = new (class _ implements CollisionCallback {
            //@Override
            public go(self: WorldActor, ps: WorldActor, c: PhysicsType2d.Dynamics.Contacts.Contact): void {
                // run the callback after a delay, or immediately?
                if (delay <= 0) {
                    callback.go(self, ps, c);
                } else {
                    setTimeout(() => {
                       callback.go(self, ps, c);
                    }, delay);
                }
            }
        })();
    }

    /**
     * Make the object a callback object, so custom code will run when a projectile collides with it
     *
     * @param callback The code to run on a collision
     */
    public setProjectileCollisionCallback(callback: CollisionCallback): void {
        this.mProjectileCollision = callback;
    }

    /**
     * Indicate that when the hero collides with this obstacle, we should make a sound
     *
     * @param sound The name of the sound file to play
     * @param delay How long to wait before playing the sound again, in milliseconds
     */
    public setCollideSound(sound: string, delay: number): void {
        this.mCollideSound = this.mScene.mMedia.getSound(sound);
        this.mCollideSoundDelay = delay * 1000000;
    }
}
