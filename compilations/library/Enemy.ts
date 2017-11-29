/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

/**
 * Enemies are things to be avoided or defeated by the Hero. Enemies do damage to heroes when they
 * collide with heroes, and enemies can be defeated by heroes, in a variety of ways.
 */
class Enemy extends WorldActor {
    /// Amount of damage this enemy does to a hero on a collision. The default is 2, so that an
    /// enemy will defeat a hero and not disappear.
    mDamage: number; //int
    /// Message to display when this enemy defeats the last hero
    mOnDefeatHeroText: string;
    /// Does a crawling hero automatically defeat this enemy?
    mDefeatByCrawl: boolean;
    /// Does an in-air hero automatically defeat this enemy
    mDefeatByJump: boolean;
    /// When the enemy collides with an invincible hero, does the enemy stay alive?
    mImmuneToInvincibility: boolean;
    /// When the enemy collides with an invincible hero, does it stay alive and damage the hero?
    mAlwaysDoesDamage: boolean;
    /// A callback to run when the enemy is defeated
    private mDefeatCallback: LolActorEvent;

    /**
     * Create a basic Enemy.  The enemy won't yet have any physics attached to it.
     *
     * @param game    The currently active game
     * @param scene   The scene into which the destination is being placed
     * @param width   Width of this enemy
     * @param height  Height of this enemy
     * @param imgName Image to display
     */
    constructor(game: Lol, scene: MainScene, width: number, height: number, imgName: string) {
        super(game, scene, imgName, width, height);
        this.mDamage = 2;
        this.mOnDefeatHeroText = "";
    }

    // /**
    //  * Code to run when an Enemy collides with a WorldActor.
    //  * <p>
    //  * Based on our WorldActor numbering scheme, the only concerns are collisions with Obstacles
    //  * and Projectiles
    //  *
    //  * @param other   Other actor involved in this collision
    //  * @param contact A description of the collision
    //  */
    // @Override
    onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    //     // collision with obstacles
    //     if (other instanceof Obstacle)
    //         onCollideWithObstacle((Obstacle) other, contact);
    //     // collision with projectiles
    //     if (other instanceof Projectile)
    //         onCollideWithProjectile((Projectile) other);
    }
    //
    // /**
    //  * Dispatch method for handling Enemy collisions with Obstacles
    //  *
    //  * @param obstacle The obstacle with which this Enemy collided
    //  * @param contact A description of the collision
    //  */
    // private void onCollideWithObstacle(final Obstacle obstacle, Contact contact) {
    //     // handle any callbacks the obstacle has
    //     if (obstacle.mEnemyCollision != null)
    //         obstacle.mEnemyCollision.go(obstacle, this, contact);
    // }
    //
    // /**
    //  * Dispatch method for handling Enemy collisions with Projectiles
    //  *
    //  * @param projectile The projectile with which this Enemy collided
    //  */
    // private void onCollideWithProjectile(Projectile projectile) {
    //     // ignore inactive projectiles
    //     if (!projectile.mEnabled)
    //         return;
    //     // compute damage to determine if the enemy is defeated
    //     mDamage -= projectile.mDamage;
    //     if (mDamage <= 0) {
    //         // hide the projectile quietly, so that the sound of the enemy can
    //         // be heard
    //         projectile.remove(true);
    //         // remove this enemy
    //         defeat(true);
    //     } else {
    //         // hide the projectile
    //         projectile.remove(false);
    //     }
    // }
    //
    // /**
    //  * Set the amount of damage that this enemy does to a hero
    //  *
    //  * @param amount Amount of damage. The default is 2, since heroes have a default strength of 1,
    //  *               so that the enemy defeats the hero but does not disappear.
    //  */
    // public void setDamage(int amount) {
    //     mDamage = amount;
    // }
    //
    // /**
    //  * If this enemy defeats the last hero of the board, this is the message that will be displayed
    //  *
    //  * @param message The message to display
    //  */
    // public void setDefeatHeroText(String message) {
    //     mOnDefeatHeroText = message;
    // }
    //
    /**
     * When an enemy is defeated, this this code figures out how gameplay should change.
     *
     * @param increaseScore Indicate if we should increase the score when this enemy is defeated
     */
    public defeat(increaseScore: boolean): void {
        // remove the enemy from the screen
        this.remove(false);

        // possibly update score
        if (increaseScore) {
            this.mGame.mManager.onDefeatEnemy();

        }
        // run any defeat callbacks
        if (this.mDefeatCallback != null)
            this.mDefeatCallback.go(this);
    }
    //
    // /**
    //  * Indicate that this enemy can be defeated by crawling into it
    //  */
    // public void setDefeatByCrawl() {
    //     mDefeatByCrawl = true;
    //     // make sure heroes don't ricochet off of this enemy when defeating it via crawling
    //     setCollisionsEnabled(false);
    // }
    //
    // /**
    //  * Mark this enemy as one that can be defeated by jumping
    //  */
    // public void setDefeatByJump() {
    //     mDefeatByJump = true;
    // }
    //
    // /**
    //  * Make this enemy resist invincibility
    //  */
    // public void setResistInvincibility() {
    //     mImmuneToInvincibility = true;
    // }
    //
    // /**
    //  * Make this enemy damage the hero even when the hero is invincible
    //  */
    // public void setImmuneToInvincibility() {
    //     mAlwaysDoesDamage = true;
    // }
    //
    // /**
    //  * Indicate that if the player touches this enemy, the enemy will be removed from the game
    //  */
    // public void setDisappearOnTouch() {
    //     mTapHandler = new TouchEventHandler() {
    //         public boolean go(float worldX, float worldY) {
    //             Lol.vibrate(mScene.mConfig, 100);
    //             defeat(true);
    //             mTapHandler = null;
    //             return true;
    //         }
    //     };
    // }
    //
    // /**
    //  * Provide code to run when this Enemy is defeated
    //  *
    //  * @param callback The callback to run when the enemy is defeated.  Note that a value of
    //  *                 <code>null</code> will remove a previously-set callback
    //  */
    // public void setDefeatCallback(LolActorEvent callback) {
    //     mDefeatCallback = callback;
    // }
}
