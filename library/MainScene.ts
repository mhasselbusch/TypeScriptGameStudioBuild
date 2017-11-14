//// <reference path="./Hero.ts"/>
//// <reference path="./Enemy.ts"/>
/// <reference path="./TouchEventHandler.ts"/>
//// <reference path="./LolAction.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./Config.ts"/>
//// <reference path="./Media.ts"/>
/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

class MainScene extends LolScene {
  /// A map for storing the level facts for the current level
  //final TreeMap<String, Integer> mLevelFacts;
  /// A map for storing the actors in the current level
  //final TreeMap<String, WorldActor> mLevelActors;

  /// All actors whose behavior should change due to tilt
  readonly mTiltActors: Array<WorldActor>;
  /// Magnitude of the maximum gravity the accelerometer can create
  mTiltMax: PhysicsType2d.Vector2;
  /// Track if we have an override for gravity to be translated into velocity
  mTiltVelocityOverride: boolean;
  /// A multiplier to make gravity change faster or slower than the accelerometer default
  mTiltMultiplier: number = 1;

  /// This is the WorldActor that the camera chases, if any
  mChaseActor: WorldActor;


  /// A handler to run in response to a screen Down event.  An actor will install this, if needed
  readonly mDownHandlers: Array<TouchEventHandler>;
  /// A handler to run in response to a screen Up event.  An actor will install this, if needed
  readonly mUpHandlers: Array<TouchEventHandler>;
  /// A handler to run in response to a screen Fling event.  An actor will install this, if needed
  readonly mFlingHandlers: Array<TouchEventHandler>;
  /// A handler to run in response to a screen PanStop event.  An actor will install it, if needed
  readonly mPanStopHandlers: Array<TouchEventHandler>;
  /// A handler to run in response to a screen Pan event.  An actor will install this, if needed
  //readonly mPanHandlers: Array<PanEventHandler>;

  /// A pool of projectiles for use by the hero
  //ProjectilePool mProjectilePool;

  /// The music, if any
  //Music mMusic;
  /// Whether the music is playing or not
  //private boolean mMusicPlaying;

  /// A random number generator... We provide this so that new game developers don't create lots
  /// of Random()s throughout their code
  //final Random mGenerator;


  constructor(config: Config, media: Media) {
    super(config, media);
    this.configureCollisionHandlers();
  }

  // chaseActor(hero: WorldActor) {
  //   this.mChaseActor = hero;
  //   this.mCamera.setChase(hero);
  // }

//   /**
//  * The main render loop calls this to determine what to do when there is a phone tilt
//  */
// void handleTilt() {
//     if (mTiltMax == null)
//         return;
//
//     // these temps are for storing the accelerometer forces we measure
//     float xGravity = 0;
//     float yGravity = 0;
//
//     // if we're on a phone, read from the accelerometer device, taking into account the rotation
//     // of the device
//     Application.ApplicationType appType = Gdx.app.getType();
//     if (appType == Application.ApplicationType.Android || appType == Application.ApplicationType.iOS) {
//         float rot = Gdx.input.getRotation();
//         if (rot == 0) {
//             xGravity = -Gdx.input.getAccelerometerX();
//             yGravity = -Gdx.input.getAccelerometerY();
//         } else if (rot == 90) {
//             xGravity = Gdx.input.getAccelerometerY();
//             yGravity = -Gdx.input.getAccelerometerX();
//         } else if (rot == 180) {
//             xGravity = Gdx.input.getAccelerometerX();
//             yGravity = Gdx.input.getAccelerometerY();
//         } else if (rot == 270) {
//             xGravity = -Gdx.input.getAccelerometerY();
//             yGravity = Gdx.input.getAccelerometerX();
//         }
//     }
//     // if we're on a computer, we simulate tilt with the arrow keys
//     else {
//         if (Gdx.input.isKeyPressed(Input.Keys.DPAD_LEFT))
//             xGravity = -15f;
//         else if (Gdx.input.isKeyPressed(Input.Keys.DPAD_RIGHT))
//             xGravity = 15f;
//         else if (Gdx.input.isKeyPressed(Input.Keys.DPAD_UP))
//             yGravity = 15f;
//         else if (Gdx.input.isKeyPressed(Input.Keys.DPAD_DOWN))
//             yGravity = -15f;
//     }
//
//     // Apply the gravity multiplier
//     xGravity *= mTiltMultiplier;
//     yGravity *= mTiltMultiplier;
//
//     // ensure x is within the -GravityMax.x : GravityMax.x range
//     xGravity = (xGravity > mConfig.mPixelMeterRatio * mTiltMax.x) ?
//             mConfig.mPixelMeterRatio * mTiltMax.x : xGravity;
//     xGravity = (xGravity < mConfig.mPixelMeterRatio * -mTiltMax.x) ?
//             mConfig.mPixelMeterRatio * -mTiltMax.x : xGravity;
//
//     // ensure y is within the -GravityMax.y : GravityMax.y range
//     yGravity = (yGravity > mConfig.mPixelMeterRatio * mTiltMax.y) ?
//             mConfig.mPixelMeterRatio * mTiltMax.y : yGravity;
//     yGravity = (yGravity < mConfig.mPixelMeterRatio * -mTiltMax.y) ?
//             mConfig.mPixelMeterRatio * -mTiltMax.y : yGravity;
//
//     // If we're in 'velocity' mode, apply the accelerometer reading to each
//     // actor as a fixed velocity
//     if (mTiltVelocityOverride) {
//         // if X is clipped to zero, set each actor's Y velocity, leave X
//         // unchanged
//         if (mTiltMax.x == 0) {
//             for (WorldActor gfo : mTiltActors)
//                 if (gfo.mBody.isActive())
//                     gfo.updateVelocity(gfo.mBody.getLinearVelocity().x, yGravity);
//         }
//         // if Y is clipped to zero, set each actor's X velocity, leave Y
//         // unchanged
//         else if (mTiltMax.y == 0) {
//             for (WorldActor gfo : mTiltActors)
//                 if (gfo.mBody.isActive())
//                     gfo.updateVelocity(xGravity, gfo.mBody.getLinearVelocity().y);
//         }
//         // otherwise we set X and Y velocity
//         else {
//             for (WorldActor gfo : mTiltActors)
//                 if (gfo.mBody.isActive())
//                     gfo.updateVelocity(xGravity, yGravity);
//         }
//     }
//     // when not in velocity mode, apply the accelerometer reading to each
//     // actor as a force
//     else {
//         for (WorldActor gfo : mTiltActors)
//             if (gfo.mBody.isActive())
//                 gfo.mBody.applyForceToCenter(xGravity, yGravity, true);
//     }
// }
//
// /**
//  * When a hero collides with a "sticky" obstacle, this figures out what to do
//  *
//  * @param sticky  The sticky actor... it should always be an obstacle for now
//  * @param other   The other actor... it should always be a hero for now
//  * @param contact A description of the contact event
//  */
// private void handleSticky(final WorldActor sticky, final WorldActor other, Contact contact) {
//     // don't create a joint if we've already got one
//     if (other.mDJoint != null)
//         return;
//     // don't create a joint if we're supposed to wait
//     if (System.currentTimeMillis() < other.mStickyDelay)
//         return;
//     // go sticky obstacles... only do something if we're hitting the
//     // obstacle from the correct direction
//     if ((sticky.mIsSticky[0] && other.getYPosition() >= sticky.getYPosition() + sticky.mSize.y)
//             || (sticky.mIsSticky[1] && other.getXPosition() + other.mSize.x <= sticky.getXPosition())
//             || (sticky.mIsSticky[3] && other.getXPosition() >= sticky.getXPosition() + sticky.mSize.x)
//             || (sticky.mIsSticky[2] && other.getYPosition() + other.mSize.y <= sticky.getYPosition())) {
//         // create distance and weld joints... somehow, the combination is needed to get this to
//         // work. Note that this function runs during the box2d step, so we need to make the
//         // joint in a callback that runs later
//         final Vector2 v = contact.getWorldManifold().getPoints()[0];
//         mOneTimeEvents.add(new LolAction() {
//             @Override
//             public void go() {
//                 other.mBody.setLinearVelocity(0, 0);
//                 DistanceJointDef d = new DistanceJointDef();
//                 d.initialize(sticky.mBody, other.mBody, v, v);
//                 d.collideConnected = true;
//                 other.mDJoint = (DistanceJoint) mWorld.createJoint(d);
//                 WeldJointDef w = new WeldJointDef();
//                 w.initialize(sticky.mBody, other.mBody, v);
//                 w.collideConnected = true;
//                 other.mWJoint = (WeldJoint) mWorld.createJoint(w);
//             }
//         });
//     }
// }

  /**
  * Configure physics for the current level
  */
  private configureCollisionHandlers(): void {
    // set up the collision handlers
    this.mWorld.SetContactListener(new (class myContactListener extends PhysicsType2d.Dynamics.ContactListener {
      superThis: MainScene;
      constructor(superThis: MainScene) {
        super();
        this.superThis = superThis;
      }

      /**
      * When two bodies start to collide, we can use this to forward to our onCollide methods
      *
      * @param contact A description of the contact event
      */
      //@Override
      public BeginContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
        console.log("Begin Contact");
        // Get the bodies, make sure both are actors
        let a = contact.GetFixtureA().GetBody().GetUserData(); //any type
        let b = contact.GetFixtureB().GetBody().GetUserData(); //any type
        if (!(a instanceof WorldActor) || !(b instanceof WorldActor)) {
          console.log("Not a WorldActor");
          return;
        }

        // the order is Hero, Enemy, Goodie, Projectile, Obstacle, Destination
        //
        // Of those, Hero, Enemy, and Projectile are the only ones with
        // a non-empty onCollide
        let c0: WorldActor;
        let c1: WorldActor;
        if (a instanceof Hero) {
          c0 = a as WorldActor;
          c1 = b as WorldActor;
        } else if (b instanceof Hero) {
          c0 = b as WorldActor;
          c1 = a as WorldActor;
        } else if (a instanceof Enemy) {
          c0 = a as WorldActor;
          c1 = b as WorldActor;
        } else if (b instanceof Enemy) {
          c0 = b as WorldActor;
          c1 = a as WorldActor;
        // } else if (a instanceof Projectile) {
        //   c0 = a as WorldActor;
        //   c1 = b as WorldActor;
        // } else if (b instanceof Projectile) {
        //   c0 = b as WorldActor;
        //   c1 = a as WorldActor;
        } else {
          return;
        }

        // Schedule an event to run as soon as the physics world finishes its step.
        //
        // NB: this is called from render, while world is updating.  We can't modify the
        // world or its actors until the update finishes, so we have to schedule
        // collision-based updates to run after the world update.
        this.superThis.mOneTimeEvents.push(new (class _ extends LolAction {
          //@Override
          public go(): void {
            c0.onCollide(c1, contact);
          }
        })());
      }

      /**
      * We ignore endcontact
      *
      * @param contact A description of the contact event
      */
      //@Override
      public EndContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
        console.log("End Contact");
      }

      /**
      * Presolve is a hook for disabling certain collisions. We use it
      * for collision immunity, sticky obstacles, and one-way walls
      *
      * @param contact A description of the contact event
      * @param oldManifold The manifold from the previous world step
      */
      //@Override
      public PreSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, oldManifold: PhysicsType2d.Collision.Manifold): void {
        // get the bodies, make sure both are actors
        //  let a = contact.GetFixtureA().GetBody().GetUserData();
        //  let b = contact.GetFixtureB().GetBody().GetUserData();
        //  if (!(a instanceof WorldActor) || !(b instanceof WorldActor))
        //      return;
        //  let gfoA = a as WorldActor;
        //  let gfoB = b as WorldActor;

        //TODO: This stuff here
        //  // go sticky obstacles... only do something if at least one actor is a sticky actor
        //  if (gfoA.mIsSticky[0] || gfoA.mIsSticky[1] || gfoA.mIsSticky[2] || gfoA.mIsSticky[3]) {
        //      handleSticky(gfoA, gfoB, contact);
        //      return;
        //  } else if (gfoB.mIsSticky[0] || gfoB.mIsSticky[1] || gfoB.mIsSticky[2] || gfoB.mIsSticky[3]) {
        //      handleSticky(gfoB, gfoA, contact);
        //      return;
        //  }
        //
        //  // if the actors have the same passthrough ID, and it's  not zero, then disable the
        //  // contact
        //  if (gfoA.mPassThroughId != 0 && gfoA.mPassThroughId == gfoB.mPassThroughId) {
        //      contact.SetEnabled(false);
        //      return;
        //  }
        //
        //  // is either one-sided? If not, we're done
        //  let oneSided: WorldActor;
        // let other: WorldActor;
        //  if (gfoA.mIsOneSided > -1) {
        //      oneSided = gfoA;
        //      other = gfoB;
        //  } else if (gfoB.mIsOneSided > -1) {
        //      oneSided = gfoB;
        // other = gfoA;
        //  } else {
        //      return;
        //  }

        // if we're here, see if we should be disabling a one-sided obstacle collision
        //let worldManiFold = contact.GetWorldManifold();
        //  let numPoints = worldManiFold.points.length;
        //  for (let i = 0; i < numPoints; i++) {
        //      let vector2 = other.mBody.GetLinearVelocityFromWorldPoint(worldManiFold.points[i]);
        //      // disable based on the value of isOneSided and the vector between the actors
        //      if (oneSided.mIsOneSided == 0 && vector2.y < 0)
        //          contact.SetEnabled(false);
        //      else if (oneSided.mIsOneSided == 2 && vector2.y > 0)
        //          contact.SetEnabled(false);
        //      else if (oneSided.mIsOneSided == 1 && vector2.x > 0)
        //          contact.SetEnabled(false);
        //      else if (oneSided.mIsOneSided == 3 && vector2.x < 0)
        //          contact.SetEnabled(false);
        //  }
      }

      /**
      * We ignore postsolve
      *
      * @param contact A description of the contact event
      * @param impulse The impulse of the contact
      */
      //@Override
      public PostSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, impulse: PhysicsType2d.Dynamics.ContactImpulse): void {
      }
    })(this));
  }

  // /**
  //  * If the level has music attached to it, this starts playing it
  //  */
  // void playMusic() {
  //     if (!mMusicPlaying && mMusic != null) {
  //         mMusicPlaying = true;
  //         mMusic.play();
  //     }
  // }
  //
  // /**
  //  * If the level has music attached to it, this pauses it
  //  */
  // void pauseMusic() {
  //     if (mMusicPlaying) {
  //         mMusicPlaying = false;
  //         mMusic.pause();
  //     }
  // }
  //
  // /**
  //  * If the level has music attached to it, this stops it
  //  */
  // void stopMusic() {
  //     if (mMusicPlaying) {
  //         mMusicPlaying = false;
  //         mMusic.stop();
  //     }
  // }

  /**
  * If the camera is supposed to follow an actor, this code will handle updating the camera
  * position
  */
  adjustCamera(): void {
    if (!this.mChaseActor) {
      return;
    }
    // figure out the actor's position
    let x: number = this.mChaseActor.mBody.GetWorldCenter().x + this.mChaseActor.mCameraOffset.x;
    let y: number = this.mChaseActor.mBody.GetWorldCenter().y + this.mChaseActor.mCameraOffset.y;

    // if x or y is too close to MAX,MAX, stick with max acceptable values
    if (x > this.mCamBound.x - this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
      x = this.mCamBound.x - this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
    }
    if (y > this.mCamBound.y - this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
      y = this.mCamBound.y - this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
    }
    // if x or y is too close to 0,0, stick with minimum acceptable values
    //
    // NB: we do MAX before MIN, so that if we're zoomed out, we show extra
    // space at the top instead of the bottom
    if (x < this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
      x = this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
    }
    if (y < this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
      y = this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
    }

    // update the camera position
    this.mCamera.setPosition(x, y);
  }

  // /**
  // * Respond to a fling gesture
  // *
  // * @param velocityX The X velocity of the fling
  // * @param velocityY The Y velocity of the fling
  // * @return True if the gesture was handled
  // */
  // handleFling(velocityX: number, velocityY: number): boolean {
  //   // we only fling at the whole-level layer
  //   mCamera.unproject(mTouchVec.set(velocityX, velocityY, 0));
  //   for (TouchEventHandler ga : mFlingHandlers) {
  //     if (ga.go(mTouchVec.x, mTouchVec.y))
  //     return true;
  //   }
  //   return false;
  // }

  // /**
  // * Respond to a Pan gesture
  // *
  // * @param x      The screen X of the pan
  // * @param y      The screen Y of the pan
  // * @param deltaX The change in X since last pan
  // * @param deltaY The change in Y since last pan
  // * @return True if the pan was handled, false otherwise
  // */
  // boolean handlePan(float x, float y, float deltaX, float deltaY) {
  //   mCamera.unproject(mTouchVec.set(x, y, 0));
  //   for (PanEventHandler ga : mPanHandlers) {
  //     if (ga.go(mTouchVec.x, mTouchVec.y, deltaX, deltaY))
  //     return true;
  //   }
  //   return false;
  // }

  // /**
  // * Respond to a pan stop event
  // *
  // * @param x The screen X of the pan stop event
  // * @param y The screen Y of the pan stop event
  // * @return True if the pan stop was handled, false otherwise
  // */
  // boolean handlePanStop(float x, float y) {
  //   // go panstop on level
  //   mCamera.unproject(mTouchVec.set(x, y, 0));
  //   for (TouchEventHandler ga : mPanStopHandlers)
  //   if (ga.go(mTouchVec.x, mTouchVec.y))
  //   return true;
  //   return false;
  // }

  // /**
  // * Respond to a Down screenpress
  // *
  // * @param screenX The screen X coordinate of the Down
  // * @param screenY The screen Y coordinate of the Down
  // * @return True if the Down was handled, false otherwise
  // */
  // handleDown(screenX: number, screenY: number): boolean {
  //   // check for actor touch by looking at gameCam coordinates... on touch, hitActor will change
  //   this.mHitActor = null;
  //   //this.mCamera.unproject(mTouchVec.set(screenX, screenY, 0));
  //   this.mWorld.QueryAABB(this.mTouchCallback, new PhysicsType2d.Collision.AxisAlignedBoundingBox(this.mTouchVec.x - 0.1, this.mTouchVec.y - 0.1,
  //     this.mTouchVec.x + 0.1, this.mTouchVec.y + 0.1));
  //
  //     // actors don't respond to DOWN... if it's a down on an actor, we are supposed to remember
  //     // the most recently touched actor, and that's it
  //     if (this.mHitActor != null) {
  //       if (this.mHitActor.mToggleHandler != null) {
  //         if (this.mHitActor.mToggleHandler.go(false, this.mTouchVec.x, this.mTouchVec.y)) {
  //           return true;
  //         }
  //       }
  //     }
  //
  //     // forward to the level's handler
  //     for (TouchEventHandler ga : mDownHandlers) {
  //       if (ga.go(mTouchVec.x, mTouchVec.y)) {
  //         return true;
  //       }
  //     }
  //     return false;
  //   }

      // /**
      //  * Respond to a Up screen event
      //  *
      //  * @param screenX The screen X coordinate of the Up
      //  * @param screenY The screen Y coordinate of the Up
      //  * @return True if the Up was handled, false otherwise
      //  */
      // boolean handleUp(float screenX, float screenY) {
      //     mCamera.unproject(mTouchVec.set(screenX, screenY, 0));
      //     if (mHitActor != null) {
      //         if (mHitActor.mToggleHandler != null) {
      //             if (mHitActor.mToggleHandler.go(true, mTouchVec.x, mTouchVec.y)) {
      //                 mHitActor = null;
      //                 return true;
      //             }
      //         }
      //     }
      //     return false;
      // }

      // /**
      //  * Respond to a Drag screen event
      //  *
      //  * @param screenX The screen X coordinate of the Drag
      //  * @param screenY The screen Y coordinate of the Drag
      //  * @return True if the Drag was handled, false otherwise
      //  */
      // boolean handleDrag(float screenX, float screenY) {
      //     if (mHitActor != null && ((WorldActor) mHitActor).mDragHandler != null) {
      //         mCamera.unproject(mTouchVec.set(screenX, screenY, 0));
      //         return ((WorldActor) mHitActor).mDragHandler.go(mTouchVec.x, mTouchVec.y);
      //     }
      //     return false;
      // }
      //
      // /**
      //  * A hack for stopping events when a pause screen is opened
      //  *
      //  * @param touchX The x coordinate of the touch that is being lifted
      //  * @param touchY The y coordinate of the touch that is being lifted
      //  */
      // void liftAllButtons(float touchX, float touchY) {
      //     for (TouchEventHandler ga : mPanStopHandlers) {
      //         ga.go(touchX, touchY);
      //     }
      //     for (TouchEventHandler ga : mUpHandlers) {
      //         ga.go(touchX, touchY);
      //     }
      // }

      /**
      * Draw the actors in this world
      *
      * @param sb    The spritebatch to use when drawing
      * @param delta The time since the last render
      */
      render(): boolean {
        for(let zA of this.mRenderables) {
          for(let r of zA) {
            r.render();
          }
        }
        return true;
      }
}
