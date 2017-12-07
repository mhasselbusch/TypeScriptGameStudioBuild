/// <reference path="./TouchEventHandler.ts"/>
/// <reference path="./LolScene.ts"/>
/// <reference path="./WorldActor.ts"/>

class MainScene extends LolScene {
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
  mProjectilePool: ProjectilePool;

  /// The music, if any
  mMusic: Sound;
  /// Whether the music is playing or not
  private mMusicPlaying: boolean;

  constructor(config: Config, media: Media) {
    super(config, media);
    this.configureCollisionHandlers();
  }

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
        } else if (a instanceof Projectile) {
          c0 = a as WorldActor;
          c1 = b as WorldActor;
        } else if (b instanceof Projectile) {
          c0 = b as WorldActor;
          c1 = a as WorldActor;
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
         let a = contact.GetFixtureA().GetBody().GetUserData();
         let b = contact.GetFixtureB().GetBody().GetUserData();
         if (!(a instanceof WorldActor) || !(b instanceof WorldActor))
             return;
         let gfoA = a as WorldActor;
         let gfoB = b as WorldActor;

        //  // go sticky obstacles... only do something if at least one actor is a sticky actor
        //  if (gfoA.mIsSticky[0] || gfoA.mIsSticky[1] || gfoA.mIsSticky[2] || gfoA.mIsSticky[3]) {
        //      handleSticky(gfoA, gfoB, contact);
        //      return;
        //  } else if (gfoB.mIsSticky[0] || gfoB.mIsSticky[1] || gfoB.mIsSticky[2] || gfoB.mIsSticky[3]) {
        //      handleSticky(gfoB, gfoA, contact);
        //      return;
        //  }

         // if the actors have the same passthrough ID, and it's  not zero, then disable the
         // contact
         if (gfoA.mPassThroughId != 0 && gfoA.mPassThroughId == gfoB.mPassThroughId) {
             contact.SetEnabled(false);
             return;
         }

         // is either one-sided? If not, we're done
         let oneSided: WorldActor;
         let other: WorldActor;
         if (gfoA.mIsOneSided > -1) {
           oneSided = gfoA;
           other = gfoB;
         } else if (gfoB.mIsOneSided > -1) {
           oneSided = gfoB;
           other = gfoA;
         } else {
           return;
         }

         //if we're here, see if we should be disabling a one-sided obstacle collision
         let worldManiFold = contact.GetWorldManifold();
         let numPoints = worldManiFold.points.length;
         for (let i = 0; i < numPoints; i++) {
           let vector2 = other.mBody.GetLinearVelocityFromWorldPoint(worldManiFold.points[i]);
           // disable based on the value of isOneSided and the vector between the actors
           if (oneSided.mIsOneSided == 0 && vector2.y < 0)
           contact.SetEnabled(false);
           else if (oneSided.mIsOneSided == 2 && vector2.y > 0)
           contact.SetEnabled(false);
           else if (oneSided.mIsOneSided == 1 && vector2.x > 0)
           contact.SetEnabled(false);
           else if (oneSided.mIsOneSided == 3 && vector2.x < 0)
           contact.SetEnabled(false);
         }
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

  /**
   * If the level has music attached to it, this starts playing it
   */
  playMusic(): void {
      if (!this.mMusicPlaying && this.mMusic) {
          this.mMusicPlaying = true;
          this.mMusic.play();
      }
  }

  /**
   * If the level has music attached to it, this pauses it
   */
  pauseMusic(): void {
      if (this.mMusicPlaying) {
          this.mMusicPlaying = false;
          this.mMusic.stop();
      }
  }

  /**
   * If the level has music attached to it, this stops it
   */
  stopMusic(): void {
      if (this.mMusicPlaying) {
          this.mMusicPlaying = false;
          this.mMusic.stop();
      }
  }

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
    if (x > this.mCamBound.x - (this.mConfig.mWidth / 2) * this.mCamera.getZoom()) {
      x = this.mCamBound.x - (this.mConfig.mWidth / 2) * this.mCamera.getZoom();
    }
    if (y > this.mCamBound.y - (this.mConfig.mHeight / 2) * this.mCamera.getZoom()) {
      y = this.mCamBound.y - (this.mConfig.mHeight / 2) * this.mCamera.getZoom();
    }
    // if x or y is too close to 0,0, stick with minimum acceptable values
    //
    // NB: we do MAX before MIN, so that if we're zoomed out, we show extra
    // space at the top instead of the bottom
    if (x < (this.mConfig.mWidth / 2) * this.mCamera.getZoom()) {
      x = (this.mConfig.mWidth / 2) * this.mCamera.getZoom();
    }
    if (y < (this.mConfig.mHeight / 2) * this.mCamera.getZoom()) {
      y = (this.mConfig.mHeight / 2) * this.mCamera.getZoom();
    }

    // update the camera position
    this.mCamera.centerOn(x, y);
    this.mCamera.setPosition(this.mConfig.mWidth/2, this.mConfig.mHeight/2);
  }

  /**
  * Draw the actors in this world
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
