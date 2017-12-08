/// <reference path="./BaseActor.ts"/>


abstract class WorldActor extends BaseActor {
  /// A reference to the top-level Lol object
  readonly mGame: Lol;
  /// Some actors run custom code when they are touched. This is a reference to the code to run.
  mDragHandler: TouchEventHandler;
  /// When the camera follows the actor without centering on it, this gives us the difference
  /// between the actor and camera
  mCameraOffset: PhysicsType2d.Vector2 = new PhysicsType2d.Vector2(0, 0);
  /// A vector for computing hover placement
  mHover: PhysicsType2d.Vector3 | null;
  /// Disable 3 of 4 sides of a Actors, to allow walking through walls. The value reflects the
  /// side that remains active. 0 is top, 1 is right, 2 is bottom, 3 is left
  mIsOneSided: number = -1;
  /// Actors with a matching nonzero Id don't collide with each other
  mPassThroughId: number = 0;
  /// If this actor is chasing another actor, we track who is being chased via this field
  private mChaseTarget: WorldActor;


  /**
  * Create a new actor that does not yet have physics, but that has a renderable picture
  *
  * @param game    The currently active game
  * @param scene   The scene into which the actor is being placed
  * @param imgName The image to display
  * @param width   The width
  * @param height  The height
  */
  constructor(game: Lol, scene: MainScene, imgName: string, width: number, height: number) {
    super(scene, imgName, width, height);
    this.mGame = game;
  }

  /**
  * Indicate that when this actor stops, we should run custom code
  *
  * @param callback The callback to run when the actor stops
  */
  public setStopCallback(callback: LolActorEvent): void {
    let out_this = this;
    this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
      moving: boolean = false;
      //@Override
      public go(): void {
        let speed: PhysicsType2d.Vector2 = out_this.mBody.GetLinearVelocity();
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
  * Each descendant defines this to address any custom logic that we need to deal with on a
  * collision
  *
  * @param other   Other object involved in this collision
  * @param contact A description of the contact that caused this collision
  */
  abstract onCollide(other: WorldActor, contact: PhysicsType2d.Dynamics.Contacts.Contact): void;

  /**
  * Make the camera follow the actor, but without centering the actor on the screen
  *
  * @param x Amount of x distance between actor and center
  * @param y Amount of y distance between actor and center
  */
  public setCameraOffset(x: number, y: number): void {
    this.mCameraOffset.x = x;
    this.mCameraOffset.y = y;
  }

  /**
  * Indicate that the actor should move with the tilt of the phone
  */
  public setMoveByTilting(): void {
    // If we've already added this to the set of tiltable objects, don't do it again
    if ((this.mScene as MainScene).mTiltActors.indexOf(this) < 0) {
      return;
    }
    // make sure it is moveable, add it to the list of tilt actors
    if (this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.DYNAMIC) {
      this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
    }
    (this.mScene as MainScene).mTiltActors.push(this);
    // turn off sensor behavior, so this collides with stuff...
    this.setCollisionsEnabled(true);
  }

  /**
  * Indicate that this obstacle only registers collisions on one side.
  *
  * @param side The side that registers collisions. 0 is top, 1 is right, 2 is bottom, 3 is left,
  *             -1 means "none"
  */
  public setOneSided(side: number): void {
    this.mIsOneSided = side;
  }

  /**
  * Indicate that this actor should not have collisions with any other actor that has the same ID
  *
  * @param id The number for this class of non-interacting actors
  */
  public setPassThrough(id: number): void {
    this.mPassThroughId = id;
  }

  /**
  * Specify that this actor is supposed to chase another actor, but using fixed X/Y velocities
  *
  * @param target     The actor to chase
  * @param xMagnitude The magnitude in the x direction, if ignoreX is false
  * @param yMagnitude The magnitude in the y direction, if ignoreY is false
  * @param ignoreX    False if we should apply xMagnitude, true if we should keep the hero's
  *                   existing X velocity
  * @param ignoreY    False if we should apply yMagnitude, true if we should keep the hero's
  *                   existing Y velocity
  */
  public setChaseFixedMagnitude(target: WorldActor, xMagnitude: number,
    yMagnitude: number, ignoreX: boolean, ignoreY: boolean): void {
      this.mChaseTarget = target;
      this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
      let out_this = this;
      this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
        public go(): void {
          // don't chase something that isn't visible
          if (!target.mEnabled)
            return;
          // don't run if this actor isn't visible
          if (!out_this.mEnabled)
            return;
          // determine directions for X and Y
          let xDir = (target.getXPosition() > out_this.getXPosition()) ? 1 : -1;
          let yDir = (target.getYPosition() > out_this.getYPosition()) ? 1 : -1;
          let x = (ignoreX) ? out_this.getXVelocity() : xDir * xMagnitude;
          let y = (ignoreY) ? out_this.getYVelocity() : yDir * yMagnitude;
          // apply velocity
          out_this.updateVelocity(x, y);
        }
      })());
    }

    /**
    * Get the actor being chased by this actor
    *
    * @return The actor being chased
    */
    public getChaseActor(): WorldActor {
      return this.mChaseTarget;
    }
}
