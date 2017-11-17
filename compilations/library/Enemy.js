"use strict";
/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
 * Enemies are things to be avoided or defeated by the Hero. Enemies do damage to heroes when they
 * collide with heroes, and enemies can be defeated by heroes, in a variety of ways.
 */
class Enemy extends WorldActor {
    /**
     * Create a basic Enemy.  The enemy won't yet have any physics attached to it.
     *
     * @param game    The currently active game
     * @param scene   The scene into which the destination is being placed
     * @param width   Width of this enemy
     * @param height  Height of this enemy
     * @param imgName Image to display
     */
    constructor(game, scene, width, height, imgName) {
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
    onCollide(other, contact) {
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
    defeat(increaseScore) {
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
}
