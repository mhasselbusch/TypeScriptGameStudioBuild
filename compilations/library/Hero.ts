/// <reference path="./WorldActor.ts"/>
/// <reference path="./Obstacle.ts"/>
/// <reference path="./Destination.ts"/>
/// <reference path="./LolActorEvent.ts"/>
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
  private mStrengthChangeCallback: LolActorEvent;

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
  onRender(): void {
    // determine when to turn off throw animations
    // if (mThrowAnimationTimeRemaining > 0) {
    //   mThrowAnimationTimeRemaining -= delta;
    //   if (mThrowAnimationTimeRemaining <= 0) {
    //     mThrowAnimationTimeRemaining = 0;
    //     mAnimator.setCurrentAnimation(mDefaultAnimation);
    //   }
    // }
    //
    // // determine when to turn off invincibility and cease invincibility animation
    // if (mInvincibleRemaining > 0) {
    //   mInvincibleRemaining -= delta;
    //   if (mInvincibleRemaining <= 0) {
    //     mInvincibleRemaining = 0;
    //     if (mInvincibleAnimation != null)
    //     mAnimator.setCurrentAnimation(mDefaultAnimation);
    //   }
    // }
    super.onRender();
  }

  /**
  * Make the hero jump, unless it is in the air and not multi-jump
  */
  jump(): void {
    // NB: multi-jump prevents us from ever setting mInAir, so this is safe:
    if (this.mInAir)
    return;
    let v = this.mBody.GetLinearVelocity();
    v.Add(this.mJumpImpulses);
    this.updateVelocity(v.x, v.y);
    if (!this.mAllowMultiJump)
    this.mInAir = true;
    // if (this.mJumpAnimation != null)
    //     this.mAnimator.setCurrentAnimation(this.mJumpAnimation);
    // if (this.mJumpSound != null)
    //     this.mJumpSound.play(Lol.getGameFact(this.mScene.mConfig, "volume", 1));
    // suspend creation of sticky joints, so the hero can actually move
    // this.mStickyDelay = System.currentTimeMillis() + 10;
  }

  /**
  * Stop the jump animation for a hero, and make it eligible to jump again
  */
  private stopJump(): void {
    if (this.mInAir || this.mAllowMultiJump) {
      this.mInAir = false;
      // this.mAnimator.setCurrentAnimation(this.mDefaultAnimation);
    }
  }

  // /**
  // * Make the hero's throw animation play while it is throwing a projectile
  // */
  // void doThrowAnimation() {
  //   if (mThrowAnimation != null) {
  //     mAnimator.setCurrentAnimation(mThrowAnimation);
  //     mThrowAnimationTimeRemaining = mThrowAnimateTotalLength;
  //   }
  // }

  /**
  * Put the hero in crawl mode. Note that we make the hero rotate when it is crawling
  */
  crawlOn(): void {
    if (this.mCrawling) {
      return;
    }
    this.mCrawling = true;
    this.mBody.SetTransform(this.mBody.GetPosition(), -3.14159 / 2);
    // if (this.mCrawlAnimation != null)
    //   this.mAnimator.setCurrentAnimation(this.mCrawlAnimation);
  }

  /**
  * Take the hero out of crawl mode
  */
  crawlOff(): void {
    if (!this.mCrawling) {
      return;
    }
    this.mCrawling = false;
    this.mBody.SetTransform(this.mBody.GetPosition(), 0);
    // this.mAnimator.setCurrentAnimation(this.mDefaultAnimation);
  }

  /**
  * Change the rotation of the hero
  *
  * @param delta How much to add to the current rotation
  */
  increaseRotation(delta: number): void {
    if (this.mInAir) {
      this.mCurrentRotation += delta;
      this.mBody.SetAngularVelocity(0);
      this.mBody.SetTransform(this.mBody.GetPosition(), this.mCurrentRotation);
    }
  }


  /**
  * Code to run when a Hero collides with a WorldActor.
  *
  * The Hero is the dominant participant in all collisions. Whenever the hero collides with
  * something, we need to figure out what to do
  *
  * @param other   Other object involved in this collision
  * @param contact A description of the contact that caused this collision
  */
  //@Override
  onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    // NB: we currently ignore Projectile and Hero
    if (other instanceof Enemy) {
      this.onCollideWithEnemy(other as Enemy);
    } else if (other instanceof Destination) {
      this.onCollideWithDestination(other as Destination);
    } else if (other instanceof Obstacle) {
      this.onCollideWithObstacle(other as Obstacle, contact);
    } else if (other instanceof Goodie) {
      this.onCollideWithGoodie(other as Goodie);
    }
    if(other instanceof Goodie) {
      this.mGame.mManager.onGoodieCollected(other as Goodie);
    }
  }

  /**
  * Dispatch method for handling Hero collisions with Destinations
  *
  * @param destination The destination with which this hero collided
  */
  private onCollideWithDestination(destination: Destination): void {
    // The hero must have enough goodies, and the destination must have room
    let match = true;
    for (let i = 0; i < 4; ++i) {
      match = match && (this.mGame.mManager.mGoodiesCollected[i] >= destination.mActivation[i]);
    }
    if (match && (destination.mHolding < destination.mCapacity) && this.mEnabled) {
      // hide the hero quietly, since the destination might make a sound
      this.remove(true);
      destination.mHolding++;
      // if (destination.mArrivalSound != null) {
      //   destination.mArrivalSound.play(Lol.getGameFact(this.mScene.mConfig, "volume", 1));
      // }
      this.mGame.mManager.onDestinationArrive();
    }
  }

  /**
  * Dispatch method for handling Hero collisions with Enemies
  *
  * @param enemy The enemy with which this hero collided
  */
  private onCollideWithEnemy(enemy: Enemy): void {
    // if the enemy always defeats the hero, no matter what, then defeat the hero
    if (enemy.mAlwaysDoesDamage) {
      this.remove(false);
      this.mGame.mManager.defeatHero(enemy);
      if (this.mMustSurvive) {
        this.mGame.mManager.endLevel(false);
      }
      return;
    }
    // handle hero invincibility
    if (this.mInvincibleRemaining > 0) {
      // if the enemy is immune to invincibility, do nothing
      if (enemy.mImmuneToInvincibility) {
        return;
      }
      enemy.defeat(true);
    }
    // defeat by crawling?
    else if (this.mCrawling && enemy.mDefeatByCrawl) {
      enemy.defeat(true);
    }
    // defeat by jumping only if the hero's bottom is above the enemy's mid-section
    else if (this.mInAir && enemy.mDefeatByJump && this.getYPosition() > enemy.getYPosition() + enemy.mSize.y / 2) {
      enemy.defeat(true);
    }
    // when we can't defeat it by losing strength, remove the hero
    else if (enemy.mDamage >= this.mStrength) {
      this.remove(false);
      this.mGame.mManager.defeatHero(enemy);
      if (this.mMustSurvive) {
        this.mGame.mManager.endLevel(false);
      }
    }
    // when we can defeat it by losing strength
    else {
      this.addStrength(-enemy.mDamage);
      enemy.defeat(true);
    }
  }

  /**
  * Update the hero's strength, and then run the strength change callback (if any)
  *
  * @param amount The amount to add (use a negative value to subtract)
  */
  private addStrength(amount: number): void {
    this.mStrength += amount;
    if (this.mStrengthChangeCallback != null) {
      this.mStrengthChangeCallback.go(this);
    }
  }

  /**
  * Dispatch method for handling Hero collisions with Obstacles
  *
  * @param o The obstacle with which this hero collided
  */
  private onCollideWithObstacle(o: Obstacle, contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    // do we need to play a sound?
    //o.playCollideSound();

    let fixtures = o.mBody.GetFixtures();
    fixtures.MoveNext();
    let f = fixtures.Current();

    // reset rotation of hero if this obstacle is not a sensor
    if ((this.mCurrentRotation != 0) && !f.IsSensor()) {
      this.increaseRotation(-this.mCurrentRotation);
    }
    // if there is code attached to the obstacle for modifying the hero's behavior, run it
    if (o.mHeroCollision != null) {
      o.mHeroCollision.go(o, this, contact);
    }
    // If this is a wall, then mark us not in the air so we can do more jumps. Note that sensors
    // should not enable jumps for the hero.
    if ((this.mInAir || this.mAllowMultiJump) && !f.IsSensor() &&
    !o.mNoJumpReenable) {
      this.stopJump();
    }
  }

  /**
  * Dispatch method for handling Hero collisions with Goodies
  *
  * @param g The goodie with which this hero collided
  */
  private onCollideWithGoodie(g: Goodie): void {
    // hide the goodie, count it, and update strength
    g.remove(false);
    this.mGame.mManager.onGoodieCollected(g);
    this.addStrength(g.mStrengthBoost);

    // deal with invincibility by updating invincible time and running an animation
    if (g.mInvincibilityDuration > 0) {
      this.mInvincibleRemaining += g.mInvincibilityDuration;
      // if (this.mInvincibleAnimation != null)
      //  this.mAnimator.setCurrentAnimation(this.mInvincibleAnimation);
    }
  }

  /**
  * Return the hero's strength
  *
  * @return The strength of the hero
  */
  public getStrength(): number {
    return this.mStrength;
  }

  /**
  * Change the hero's strength.
  *
  * NB: calling this will not run any strength change callbacks... they only run in conjunction
  *     with collisions with goodies or enemies.
  *
  * @param amount The new strength of the hero
  */
  public setStrength(amount: number): void {
    this.mStrength = amount;
  }

  /**
   * Indicate that upon a touch, this hero should begin moving with a specific velocity
   *
   * @param x Velocity in X dimension
   * @param y Velocity in Y dimension
   */
  public setTouchAndGo(x: number, y: number): void {
      let out_this = this;
      this.mTapHandler = new (class _ extends TouchEventHandler {
          public go(worldX: number, worldY: number): boolean {
              out_this.mHover = null;
              // if it was hovering, its body type won't be Dynamic
              if (out_this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.DYNAMIC)
                  out_this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
              out_this.setAbsoluteVelocity(x, y);
              // turn off isTouchAndGo, so we can't double-touch
              out_this.mTapHandler = null;
              return true;
          }
      })();
  }

  /**
   * Specify the X and Y velocity to give to the hero whenever it is instructed to jump
   *
   * @param x Velocity in X direction
   * @param y Velocity in Y direction
   */
  public setJumpImpulses(x: number, y: number): void {
      this.mJumpImpulses = new PhysicsType2d.Vector2(x, y);
  }

  /**
   * Indicate that this hero can jump while it is in the air
   */
  public setMultiJumpOn(): void {
      this.mAllowMultiJump = true;
  }

  /**
  * Indicate that touching this hero should make it jump
  */
  public setTouchToJump(): void {
    let out_this = this;
    this.mTapHandler = new (class _ extends TouchEventHandler {
      public go(worldX: number, worldY: number): boolean {
        out_this.jump();
        return true;
      }
    })();
  }

  // /**
  //  * Register an animation sequence for when the hero is jumping
  //  *
  //  * @param animation The animation to display
  //  */
  // public setJumpAnimation(Animation animation): void {
  //     mJumpAnimation = animation;
  // }

  // /**
  //  * Set the sound to play when a jump occurs
  //  *
  //  * @param soundName The name of the sound file to use
  //  */
  // public void setJumpSound(String soundName) {
  //     mJumpSound = mScene.mMedia.getSound(soundName);
  // }

  // /**
  //  * Register an animation sequence for when the hero is throwing a projectile
  //  *
  //  * @param animation The animation to display
  //  */
  // public void setThrowAnimation(Animation animation) {
  //     mThrowAnimation = animation;
  //     // compute the length of the throw sequence, so that we can get our
  //     // timer right for restoring the default animation
  //     mThrowAnimateTotalLength = animation.getDuration() / 1000;
  // }

  // /**
  //  * Register an animation sequence for when the hero is crawling
  //  *
  //  * @param animation The animation to display
  //  */
  // public void setCrawlAnimation(Animation animation) {
  //     mCrawlAnimation = animation;
  // }

  // /**
  //  * Register an animation sequence for when the hero is invincible
  //  *
  //  * @param a The animation to display
  //  */
  // public void setInvincibleAnimation(Animation a) {
  //     mInvincibleAnimation = a;
  // }

  /**
   * Indicate that the level should end immediately if this hero is defeated
   */
  public setMustSurvive(): void {
      this.mMustSurvive = true;
  }

  /**
   * Provide code to run when the hero's strength changes
   *
   * @param callback The code to run.
   */
  public setStrengthChangeCallback(callback: LolActorEvent) {
      this.mStrengthChangeCallback = callback;
  }
}
