/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>


/**
 * The Hero is the focal point of a game. While it is technically possible to have many heroes, or
 * invisible heroes that exist just so that the player has to keep bad things from happening to the
 * hero, it is usually the case that a game has one hero who moves around on the screen, possibly
 * jumping and crawling.
 */
class Hero extends WorldActor {
    /// Strength of the hero. This determines how many collisions with enemies the hero can sustain
    /// before it is defeated. The default is 1, and the default enemy damage amount is 2, so that
    /// the default behavior is for the hero to be defeated on any collision with an enemy, with the
    /// enemy *not* disappearing
    private mStrength: number; //int
    /// For tracking if the game should end immediately when this hero is defeated
    private mMustSurvive: boolean;
    /// Code to run when the hero's strength changes
    //private LolActorEvent mStrengthChangeCallback: LolActorEvent;

    /// Time until the hero's invincibility runs out
    private mInvincibleRemaining: number; //float
    /// cells involved in animation for invincibility
    //private mInvincibleAnimation: Animation;

    /// cells involved in animation for throwing
    //private mThrowAnimation: Animation;
    /// seconds that constitute a throw action
    private mThrowAnimateTotalLength: number; //float
    /// how long until we stop showing the throw animation
    private mThrowAnimationTimeRemaining: number; //float

    /// Track if the hero is in the air, so that it can't jump when it isn't touching anything. This
    /// does not quite work as desired, but is good enough for LOL
    private mInAir: boolean;
    /// When the hero jumps, this specifies the amount of velocity to add to simulate a jump
    private mJumpImpulses: PhysicsType2d.Vector2;
    /// Indicate that the hero can jump while in the air
    private mAllowMultiJump: boolean;
    /// Sound to play when a jump occurs
    //private mJumpSound: Sound;
    /// cells involved in animation for jumping
    //private mJumpAnimation: Animation;

    /// Is the hero currently in crawl mode?
    private mCrawling: boolean;
    /// cells involved in animation for crawling
    //private mCrawlAnimation: Animation;

    /// For tracking the current amount of rotation of the hero
    private mCurrentRotation: number; //float

    /**
     * Construct a Hero, but don't give it any physics yet
     *
     * @param game    The currently active game
     * @param scene   The scene into which the Hero is being placed
     * @param width   The width of the hero
     * @param height  The height of the hero
     * @param imgName The name of the file that has the default image for this hero
     */
    constructor(game: Lol, scene: MainScene, width: number, height: number, imgName: string) {
        super(game, scene, imgName, width, height);
        this.mStrength = 1;
    }

    /**
     * Code to run when rendering the Hero.
     *
     * NB:  We can't just use the basic renderer, because we might need to adjust a one-off
     *      animation (invincibility or throw) first
     *
     * @param sb    The SpriteBatch to use for drawing this hero
     * @param delta The time since the last render
     */
    //@Override
    // void onRender(SpriteBatch sb, float delta) {
    //     // determine when to turn off throw animations
    //     if (mThrowAnimationTimeRemaining > 0) {
    //         mThrowAnimationTimeRemaining -= delta;
    //         if (mThrowAnimationTimeRemaining <= 0) {
    //             mThrowAnimationTimeRemaining = 0;
    //             mAnimator.setCurrentAnimation(mDefaultAnimation);
    //         }
    //     }
    //
    //     // determine when to turn off invincibility and cease invincibility animation
    //     if (mInvincibleRemaining > 0) {
    //         mInvincibleRemaining -= delta;
    //         if (mInvincibleRemaining <= 0) {
    //             mInvincibleRemaining = 0;
    //             if (mInvincibleAnimation != null)
    //                 mAnimator.setCurrentAnimation(mDefaultAnimation);
    //         }
    //     }
    //     super.onRender(sb, delta);

    //
    // /**
    // * Code to run when a Hero collides with a WorldActor.
    // *
    // * The Hero is the dominant participant in all collisions. Whenever the hero collides with
    // * something, we need to figure out what to do
    // *
    // * @param other   Other object involved in this collision
    // * @param contact A description of the contact that caused this collision
    // */
    // //@Override
    onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    //   // NB: we currently ignore Projectile and Hero
    //   if (other instanceof Enemy)
    //   onCollideWithEnemy(other as Enemy);
    //   else if (other instanceof Destination)
    //   onCollideWithDestination(other as Destination);
    //   else if (other instanceof Obstacle)
    //   onCollideWithObstacle(other as Obstacle, contact);
    //   else if (other instanceof Goodie)
    //   onCollideWithGoodie(other as Goodie);
      console.log("Hero collision");
    }
    //
    // /**
    // * Dispatch method for handling Hero collisions with Destinations
    // *
    // * @param destination The destination with which this hero collided
    // */
    // private onCollideWithDestination(destination: Destination): void {
    //   // The hero must have enough goodies, and the destination must have room
    //   let match = true;
    //   for (let i = 0; i < 4; ++i)
    //   match = match && (this.mGame.mManager.mGoodiesCollected[i] >= destination.mActivation[i]);
    //   if (match && (destination.mHolding < destination.mCapacity) && this.mEnabled) {
    //     // hide the hero quietly, since the destination might make a sound
    //     this.remove(true);
    //     destination.mHolding++;
    //     if (destination.mArrivalSound != null)
    //     destination.mArrivalSound.play(Lol.getGameFact(this.mScene.mConfig, "volume", 1));
    //     this.mGame.mManager.onDestinationArrive();
    //   }
    // }
    //
    // /**
    // * Dispatch method for handling Hero collisions with Enemies
    // *
    // * @param enemy The enemy with which this hero collided
    // */
    // private onCollideWithEnemy(enemy: Enemy): void {
    //   // if the enemy always defeats the hero, no matter what, then defeat the hero
    //   if (enemy.mAlwaysDoesDamage) {
    //     this.remove(false);
    //     this.mGame.mManager.defeatHero(enemy);
    //     if (this.mMustSurvive)
    //     this.mGame.mManager.endLevel(false);
    //     return;
    //   }
    //   // handle hero invincibility
    //   if (this.mInvincibleRemaining > 0) {
    //     // if the enemy is immune to invincibility, do nothing
    //     if (enemy.mImmuneToInvincibility)
    //     return;
    //     enemy.defeat(true);
    //   }
    //   // defeat by crawling?
    //   else if (this.mCrawling && enemy.mDefeatByCrawl) {
    //     enemy.defeat(true);
    //   }
    //   // defeat by jumping only if the hero's bottom is above the enemy's mid-section
    //   else if (this.mInAir && enemy.mDefeatByJump &&
    //     this.getYPosition() > enemy.getYPosition() + enemy.mSize.y / 2) {
    //       enemy.defeat(true);
    //     }
    //     // when we can't defeat it by losing strength, remove the hero
    //     else if (enemy.mDamage >= this.mStrength) {
    //       this.remove(false);
    //       this.mGame.mManager.defeatHero(enemy);
    //       if (this.mMustSurvive)
    //       this.mGame.mManager.endLevel(false);
    //     }
    //     // when we can defeat it by losing strength
    //     else {
    //       this.addStrength(-enemy.mDamage);
    //       enemy.defeat(true);
    //     }
    //   }
    //
    //   /**
    //   * Update the hero's strength, and then run the strength change callback (if any)
    //   *
    //   * @param amount The amount to add (use a negative value to subtract)
    //   */
    //   private addStrength(amount: number): void {
    //     this.mStrength += amount;
    //     if (this.mStrengthChangeCallback != null) {
    //       this.mStrengthChangeCallback.go(this);
    //     }
    //   }
    //
    //   /**
    //   * Dispatch method for handling Hero collisions with Obstacles
    //   *
    //   * @param o The obstacle with which this hero collided
    //   */
    //   private onCollideWithObstacle(o: Obstacle, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    //     // do we need to play a sound?
    //     o.playCollideSound();
    //
    //     // reset rotation of hero if this obstacle is not a sensor
    //     if ((this.mCurrentRotation != 0) && !o.mBody.getFixtureList().get(0).isSensor())
    //     this.increaseRotation(-this.mCurrentRotation);
    //
    //     // if there is code attached to the obstacle for modifying the hero's behavior, run it
    //     if (o.mHeroCollision != null)
    //     o.mHeroCollision.go(o, this, contact);
    //
    //     // If this is a wall, then mark us not in the air so we can do more jumps. Note that sensors
    //     // should not enable jumps for the hero.
    //     if ((this.mInAir || this.mAllowMultiJump) && !o.mBody.getFixtureList().get(0).isSensor() &&
    //     !o.mNoJumpReenable) {
    //       this.stopJump();
    //     }
    //   }
    //
    //   /**
    //   * Dispatch method for handling Hero collisions with Goodies
    //   *
    //   * @param g The goodie with which this hero collided
    //   */
    //   private onCollideWithGoodie(g: Goodie): void {
    //     // hide the goodie, count it, and update strength
    //     g.remove(false);
    //     this.mGame.mManager.onGoodieCollected(g);
    //     this.addStrength(g.mStrengthBoost);
    //
    //     // deal with invincibility by updating invincible time and running an animation
    //     if (g.mInvincibilityDuration > 0) {
    //       this.mInvincibleRemaining += g.mInvincibilityDuration;
    //       if (this.mInvincibleAnimation != null)
    //       this.mAnimator.setCurrentAnimation(this.mInvincibleAnimation);
    //     }
    //   }
    //
    //   /**
    //   * Return the hero's strength
    //   *
    //   * @return The strength of the hero
    //   */
    //   public getStrength(): number {
    //     return this.mStrength;
    //   }
    //
    //   /**
    //   * Change the hero's strength.
    //   *
    //   * NB: calling this will not run any strength change callbacks... they only run in conjunction
    //   *     with collisions with goodies or enemies.
    //   *
    //   * @param amount The new strength of the hero
    //   */
    //   public setStrength(amount: number): void {
    //     this.mStrength = amount;
    //   }
}
