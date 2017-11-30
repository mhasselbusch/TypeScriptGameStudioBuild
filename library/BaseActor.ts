/// <reference path="./Renderable.ts"/>

/**
* BaseActor is the parent of all Actor types.
*
* We use BaseActor as parent of both WorldActor (MainScene) and SceneActor (all other scenes), so that
* core functionality (physics, animation) can be in one place, even though many of the features of
* an WorldActor (MainScene) require a Score object, and are thus incompatible with non-Main scenes.
*/
class BaseActor extends Renderable {
  /// The level in which this Actor exists
  readonly mScene: LolScene;

  /// Physics body for this WorldActor
  mBody: PhysicsType2d.Dynamics.Body;

  /// Track if the underlying body is a circle
  private mIsCircleBody: boolean;
  /// Track if the underlying body is a box
  private mIsBoxBody: boolean;
  /// Track if the underlying body is a polygon
  private mIsPolygonBody: boolean;
  /// The dimensions of the WorldActor... x is width, y is height
  mSize: PhysicsType2d.Vector2;

  /// The z index of this actor. Valid range is [-2, 2]
  private mZIndex: number;

  /// Does this WorldActor follow a route? If so, the Driver will be used to advance the
  /// actor along its route.
  mRoute: Route.Driver;

  /// Sound to play when the actor disappears
  mDisappearSound: Sound;

  /// Text that game designer can modify to hold additional information about the actor
  private mInfoText: string;
  /// Integer that the game designer can modify to hold additional information about the actor
  private mInfoInt: number;

  /// Code to run when this actor is tapped
  mTapHandler: TouchEventHandler | null;
  /// Code to run when this actor is held or released
  //mToggleHandler: ToggleEventHandler | null;

  /// A temporary vertex that we use when resizing
  private mTempVector: PhysicsType2d.Vector2;


  constructor(scene: LolScene, imgName: string, width: number, height: number) {
    super();
    this.mScene = scene;
    this.mSize = new PhysicsType2d.Vector2(width, height);
    this.mZIndex = 0;
    this.mInfoText = "";

    if (imgName === "") {
      this.mSprite = new PIXI.Sprite();
      this.mSprite.texture = PIXI.Texture.EMPTY;
    } else {
      this.mSprite = PIXI.Sprite.fromImage(imgName);
    }
    this.mSprite.width = this.mSize.x;
    this.mSprite.height = this.mSize.y;
    this.mSprite.anchor.x = 0.5;
    this.mSprite.anchor.y = 0.5;
  }

  /**
  * Specify that this actor should have a rectangular physics shape
  *
  * @param type Is the actor's body static or dynamic?
  * @param x    The X coordinate of the bottom left corner, in meters
  * @param y    The Y coordinate of the bottom left corner, in meters
  */
  setBoxPhysics(type: PhysicsType2d.Dynamics.BodyType, x: number, y: number): void {
    let shape = new PhysicsType2d.Collision.Shapes.PolygonShape();
    shape.SetAsBoxAtOrigin(this.mSize.x / 2, this.mSize.y / 2);
    let boxBodyDef = new PhysicsType2d.Dynamics.BodyDefinition();
    boxBodyDef.type = type;
    boxBodyDef.position.x = x + this.mSize.x / 2;
    boxBodyDef.position.y = y + this.mSize.y / 2;
    this.mBody = this.mScene.mWorld.CreateBody(boxBodyDef);

    let fd = new PhysicsType2d.Dynamics.FixtureDefinition();
    fd.shape = shape;
    // fd.density = 0;
    // fd.friction = 0;
    // fd.restitution = 0;
    this.mBody.CreateFixtureFromDefinition(fd);
    //no shape.dispose()
    this.setPhysics(0, 0, 0);

    this.mBody.SetUserData(this);

    // remember this is a box
    this.mIsCircleBody = false;
    this.mIsBoxBody = true;
    this.mIsPolygonBody = false;
  }


  /**
  * Specify that this actor should have a polygon physics shape.
  * <p>
  * You must take extreme care when using this method. Polygon vertices must be given in
  * counter-clockwise order, and they must describe a convex shape.
  *
  * @param type     Is the actor's body static or dynamic?
  * @param x        The X coordinate of the bottom left corner, in meters
  * @param y        The Y coordinate of the bottom left corner, in meters
  * @param vertices Up to 16 coordinates representing the vertexes of this polygon, listed as
  *                 x0,y0,x1,y1,x2,y2,...
  */
  setPolygonPhysics(type: PhysicsType2d.Dynamics.BodyType, x: number, y: number, vertices: number[]): void {
    let shape = new PhysicsType2d.Collision.Shapes.PolygonShape();
    let verts = new Array<PhysicsType2d.Vector2>(vertices.length / 2);
    for (let i = 0; i < vertices.length; i += 2)
    verts[i / 2] = new PhysicsType2d.Vector2(vertices[i], vertices[i + 1]);
    // print some debug info, since vertices are tricky
    //for (let vert of verts)
    //Lol.message(mScene.mConfig, "vert", "at " + vert.x + "," + vert.y);
    shape.Set(verts);
    let boxBodyDef = new PhysicsType2d.Dynamics.BodyDefinition();
    boxBodyDef.type = type;
    boxBodyDef.position.x = x + this.mSize.x / 2;
    boxBodyDef.position.y = y + this.mSize.y / 2;
    this.mBody = this.mScene.mWorld.CreateBody(boxBodyDef);

    let fd = new PhysicsType2d.Dynamics.FixtureDefinition();
    fd.shape = shape;
    //fd.density = 0;
    //fd.friction = 0;
    //fd.restitution = 0;
    this.mBody.CreateFixtureFromDefinition(fd);
    this.setPhysics(0, 0, 0);
    //no shape.dispose()

    // link the body to the actor
    this.mBody.SetUserData(this);

    // remember this is a polygon
    this.mIsCircleBody = false;
    this.mIsBoxBody = false;
    this.mIsPolygonBody = true;
  }


  /**
  * Specify that this actor should have a circular physics shape
  *
  * @param type   Is the actor's body static or dynamic?
  * @param x      The X coordinate of the bottom left corner, in meters
  * @param y      The Y coordinate of the bottom left corner, in meters
  * @param radius The radius of the underlying circle
  */
  setCirclePhysics(type: PhysicsType2d.Dynamics.BodyType, x: number, y: number, radius: number): void {
    let shape = new PhysicsType2d.Collision.Shapes.CircleShape();
    shape.m_radius = radius;

    let boxBodyDef = new PhysicsType2d.Dynamics.BodyDefinition();
    boxBodyDef.type = type;
    boxBodyDef.position.x = x + this.mSize.x / 2;
    boxBodyDef.position.y = y + this.mSize.y / 2;
    this.mBody = this.mScene.mWorld.CreateBody(boxBodyDef);

    let fd = new PhysicsType2d.Dynamics.FixtureDefinition();
    fd.shape = shape;
    // fd.density = 0;
    // fd.friction = 0;
    // fd.restitution = 0;
    this.mBody.CreateFixtureFromDefinition(fd);
    //no shape.dispose()
    this.setPhysics(0, 0, 0);

    // link the body to the actor
    this.mBody.SetUserData(this);

    // remember this is a circle
    this.mIsCircleBody = true;
    this.mIsBoxBody = false;
    this.mIsPolygonBody = false;
  }


  /**
  * Indicate whether this actor is fast-moving, so that the physics simulator can do a better job
  * dealing with tunneling effects.
  *
  * @param state True or false, depending on whether it is fast-moving or not
  */
  setFastMoving(state: boolean): void {
    this.mBody.SetBullet(state);
  }


  /**
  * Internal method for updating an actor's velocity
  * <p>
  * We use this because we need to be careful about possibly breaking joints when we make the
  * actor move
  *
  * @param x The new x velocity
  * @param y The new y velocity
  */
  updateVelocity(x: number, y: number) {
    // make sure it is not static... heroes are already Dynamic, let's just set everything else
    // that is static to kinematic... that's probably safest.
    if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC)
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
    this.breakJoints();
    this.mBody.SetLinearVelocity(new PhysicsType2d.Vector2(x, y));
  }


  /**
  * Break any joints that involve this actor, so that it can move freely.
  * <p>
  * NB: BaseActors don't have any joints to break, but classes that derive from BaseActor do
  */
  breakJoints(): void {
  }


  // /**
  //  * When this actor is touched, play its mTouchSound and then execute its mTapHandler
  //  *
  //  * @param touchVec The coordinates of the touch, in meters
  //  * @return True if the event was handled, false otherwise
  //  */
  // boolean onTap(Vector3 touchVec) {
  //     if (mTouchSound != null)
  //         mTouchSound.play(Lol.getGameFact(mScene.mConfig, "volume", 1));
  //     return mTapHandler != null && mTapHandler.go(touchVec.x, touchVec.y);
  // }

  /**
  * Every time the world advances by a timestep, we call this code to update the actor route and
  * animation, and then draw the actor
  *
  * @param sb    The spritebatch to use in order to draw this actor
  * @param delta The amount of time since the last render event
  */
  //@Override
  onRender() {
    if(this.mBody) this.mSprite.position.x = this.mBody.GetPosition().x;
    if(this.mBody) this.mSprite.position.y = this.mBody.GetPosition().y;
  }

  /**
  * Indicate whether this actor engages in physics collisions or not
  *
  * @param state True or false, depending on whether the actor will participate in physics
  *              collisions or not
  */
  setCollisionsEnabled(state: boolean): void {
    // The default is for all fixtures of a actor have the same sensor state
    let fixtures = this.mBody.GetFixtures();

    while(fixtures.MoveNext()) {
      fixtures.Current().SetSensor(!state);
    }

    fixtures.Reset();
  }


  /**
  * Adjust the default physics settings (density, elasticity, friction) for this actor
  *
  * @param density    New density of the actor
  * @param elasticity New elasticity of the actor
  * @param friction   New friction of the actor
  */
  setPhysics(density: number, elasticity: number, friction: number): void {
    let fixtures = this.mBody.GetFixtures();
    while(fixtures.MoveNext()) {
      let f = fixtures.Current();
      f.SetDensity(density);
      f.SetRestitution(elasticity);
      f.SetFriction(friction);
    }
    fixtures.Reset();
    this.mBody.ResetMassData();
  }


  /**
  * Indicate that this actor should be immune to the force of gravity
  */
  public setGravityDefy(): void {
    this.mBody.SetGravityScale(0);
  }


  /**
  * Ensure that an actor is subject to gravitational forces.
  * <p>
  * By default, non-hero actors are not subject to gravity or forces until they are given a path,
  * velocity, or other form of motion. This lets an actor be subject to forces.  In practice,
  * using this in a side-scroller means the actor will fall to the ground.
  */
  public setCanFall(): void {
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
  }

  /**
  * Force an actor to have a Kinematic body type.  Kinematic bodies can move, but are not subject
  * to forces in the same way as Dynamic bodies.
  */
  public setKinematic(): void {
    if (this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.KINEMATIC)
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
  }

  /**
  * Retrieve any additional text information for this actor
  *
  * @return The string that the programmer provided
  */
  public getInfoText(): string {
    return this.mInfoText;
  }

  /**
  * Retrieve any additional numerical information for this actor
  *
  * @return The integer that the programmer provided
  */
  public getInfoInt(): number {
    return this.mInfoInt;
  }

  /**
  * Set additional text information for this actor
  *
  * @param text Text to attach to the actor
  */
  public setInfoText(text: string): void {
    this.mInfoText = text;
  }

  /**
  * Set additional numerical information for this actor
  *
  * @param newVal An integer to attach to the actor
  */
  public setInfoInt(newVal: number): void {
    this.mInfoInt = newVal;
  }

  /**
  * Returns the X coordinate of this actor
  *
  * @return x coordinate of bottom left corner, in meters
  */
  public getXPosition(): number {
    return this.mBody.GetPosition().x - this.mSize.x / 2;
  }

  /**
  * Returns the Y coordinate of this actor
  *
  * @return y coordinate of bottom left corner, in meters
  */
  public getYPosition(): number {
    return this.mBody.GetPosition().y - this.mSize.y / 2;
  }

  /**
  * Change the position of an actor
  *
  * @param x The new X position, in meters
  * @param y The new Y position, in meters
  */
  public setPosition(x: number, y: number): void {
    this.mBody.SetTransform(new PhysicsType2d.Vector2(x + this.mSize.x / 2, y + this.mSize.y / 2), this.mBody.GetAngle());
  }

  /**
  * Returns the width of this actor
  *
  * @return the actor's width, in meters
  */
  public getWidth(): number {
    return this.mSize.x;
  }

  /**
  * Return the height of this actor
  *
  * @return the actor's height, in meters
  */
  public getHeight(): number {
    return this.mSize.y;
  }


  /**
  * Change the size of an actor, and/or change its position
  *
  * @param x      The new X coordinate of its bottom left corner, in meters
  * @param y      The new Y coordinate of its bototm left corner, in meters
  * @param width  The new width of the actor, in meters
  * @param height The new height of the actor, in meters
  */
  public resize(x: number, y: number, width: number, height: number): void {
    // set new height and width
    this.mSize.Set(width, height);
    // read old body information
    let oldBody = this.mBody;
    let oldFix = oldBody.GetFixtures().Current();
    // make a new body
    if (this.mIsCircleBody) {
      this.setCirclePhysics(oldBody.GetType(), x, y, (width > height) ? width / 2 : height / 2);
    } else if (this.mIsBoxBody) {
      this.setBoxPhysics(oldBody.GetType(), x, y);
    } else if (this.mIsPolygonBody) {
      // we need to manually scale all the vertices
      let xScale = height / this.mSize.y;
      let yScale = width / this.mSize.x;
      let ps = oldFix.GetShape() as PhysicsType2d.Collision.Shapes.PolygonShape;
      let verts = new Array<number>(ps.GetChildCount() * 2); //TEST: GetChildCount == GetVertexCount ??
      for (let i = 0; i < ps.GetChildCount(); ++i) {
        let mTempVector = ps.GetVertex(i);
        verts[2 * i] = mTempVector.x * xScale;
        verts[2 * i + 1] = mTempVector.y * yScale;
      }
      this.setPolygonPhysics(oldBody.GetType(), x, y, verts);
    }
    // Update the user-visible physics values
    this.setPhysics(oldFix.GetDensity(), oldFix.GetRestitution(), oldFix.GetFriction());
    this.setFastMoving(oldBody.IsBullet());
    // clone forces
    this.mBody.SetAngularVelocity(oldBody.GetAngularVelocity());
    this.mBody.SetTransform(this.mBody.GetPosition(), oldBody.GetAngle());
    this.mBody.SetGravityScale(oldBody.GetGravityScale());
    this.mBody.SetLinearDamping(oldBody.GetLinearDamping());
    this.mBody.SetLinearVelocity(oldBody.GetLinearVelocity());
    // disable the old body
    oldBody.SetActive(false);
  }


  /**
  * Use this to find the current rotation of an actor
  *
  * @return The rotation, in radians
  */
  public getRotation(): number {
    return this.mBody.GetAngle();
  }


  /**
  * Call this on an actor to rotate it. Note that this works best on boxes.
  *
  * @param rotation amount to rotate the actor (in radians)
  */
  public setRotation(rotation: number): void {
    this.mBody.SetTransform(this.mBody.GetPosition(), rotation);
  }

  /**
  * Make the actor continuously rotate. This is usually only useful for fixed objects.
  *
  * @param duration Time it takes to complete one rotation
  */
  public setRotationSpeed(duration: number): void {
    if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC)
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
    this.mBody.SetAngularVelocity(duration);
  }

  /**
  * Indicate that this actor should not rotate due to torque
  */
  public disableRotation(): void {
    this.mBody.SetFixedRotation(true);
  }

  /**
  * Make an actor disappear
  *
  * @param quiet True if the disappear sound should not be played
  */
  public remove(quiet: boolean): void {
    // set it invisible immediately, so that future calls know to ignore this actor
    this.mEnabled = false;
    this.mBody.SetActive(false);

    // play a sound when we remove this actor?
     if (this.mDisappearSound != null && !quiet)
         this.mDisappearSound.play();

    // To do a disappear animation after we've removed the actor, we draw an actor, so that
    // we have a clean hook into the animation system, but we disable its physics
    //  if (this.mDisappearAnimation != null) {
    //      float x = getXPosition() + mDisappearAnimateOffset.x;
    //      float y = getYPosition() + mDisappearAnimateOffset.y;
    //      BaseActor o = new BaseActor(mScene, "", mDisappearAnimateSize.x, mDisappearAnimateSize.y);
    //      o.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //      mScene.addActor(o, 0);
    //      o.mBody.setActive(false);
    //      o.setDefaultAnimation(mDisappearAnimation);
    //  }
  }

  /**
  * Returns the X velocity of of this actor
  *
  * @return Velocity in X dimension, in meters per second
  */
  public getXVelocity(): number {
    return this.mBody.GetLinearVelocity().x;
  }

  /**
  * Returns the Y velocity of of this actor
  *
  * @return Velocity in Y dimension, in meters per second
  */
  public getYVelocity(): number {
    return this.mBody.GetLinearVelocity().y;
  }

  /**
  * Add velocity to this actor
  *
  * @param x Velocity in X dimension, in meters per second
  * @param y Velocity in Y dimension, in meters per second
  */
  public addVelocity(x: number, y: number): void {
    // ensure this is a moveable actor
    if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC)
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
    // Add to the velocity of the actor
    let v = this.mBody.GetLinearVelocity();
    v.x += x;
    v.y += y;
    this.updateVelocity(v.x, v.y);
    // Disable sensor, or else this actor will go right through walls
    this.setCollisionsEnabled(true);
  }

  /**
  * Set the absolute velocity of this actor
  *
  * @param x Velocity in X dimension, in meters per second
  * @param y Velocity in Y dimension, in meters per second
  */
  public setAbsoluteVelocity(x: number, y: number): void {
    // ensure this is a moveable actor
    if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC)
    this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
    // change its velocity
    this.updateVelocity(x, y);
    // Disable sensor, or else this actor will go right through walls
    this.setCollisionsEnabled(true);
  }

  /**
  * Set a dampening factor to cause a moving body to slow down without colliding with anything
  *
  * @param amount The amount of damping to apply
  */
  public setDamping(amount: number): void {
    this.mBody.SetLinearDamping(amount);
  }

  /**
  * Set a dampening factor to cause a spinning body to decrease its rate of spin
  *
  * @param amount The amount of damping to apply
  */
  public setAngularDamping(amount: number): void {
    this.mBody.SetAngularDamping(amount);
  }

  //  /**
  //   * Specify some code to run when this actor is tapped
  //   *
  //   * @param handler The TouchEventHandler to run in response to the tap
  //   */
  //  public void setTapCallback(TouchEventHandler handler) {
  //      mTapHandler = handler;
  //  }

  //  /**
  //   * Specify some code to run while this actor is down-pressed and when it is released
  //   *
  //   * @param whileDownAction The code to run for as long as the actor is being pressed
  //   * @param onUpAction      The code to run when the actor is released
  //   */
  //  public void setToggleCallback(final LolAction whileDownAction, final LolAction onUpAction) {
  //      whileDownAction.mIsActive = false;
  //
  //      // set up the toggle behavior
  //      mToggleHandler = new ToggleEventHandler() {
  //          public boolean go(boolean isUp, float worldX, float worldY) {
  //              if (isUp) {
  //                  whileDownAction.mIsActive = false;
  //                  if (onUpAction != null)
  //                      onUpAction.go();
  //              } else {
  //                  whileDownAction.mIsActive = true;
  //              }
  //              return true;
  //          }
  //      };
  //      mScene.mRepeatEvents.add(whileDownAction);
  //  }

  /**
  * Request that this actor moves according to a fixed route
  *
  * @param route    The route to follow
  * @param velocity speed at which to travel along the route
  * @param loop     When the route completes, should we start it over again?
  */
  public setRoute(route: Route, velocity: number, loop: boolean): void {
    // This must be a KinematicBody or a Dynamic Body!
    if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC) {
      this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
    }

    // Create a Driver to advance the actor's position according to the route
    this.mRoute = new Route.Driver(route, velocity, loop, this);
  }

  //  /**
  //   * Request that a sound plays whenever the player touches this actor
  //   *
  //   * @param sound The name of the sound file to play
  //   */
  //  public void setTouchSound(String sound) {
  //      mTouchSound = mScene.mMedia.getSound(sound);
  //  }

   /**
    * Request that a sound plays whenever this actor disappears
    *
    * @param soundName The name of the sound file to play
    */
   public setDisappearSound(soundName: string): void {
       this.mDisappearSound = this.mScene.mMedia.getSound(soundName);
   }

  /**
  * Change the image being used to display the actor
  *
  * @param imgName The name of the new image file to use
  */
  public setImage(imgName: string) {
    //mAnimator.updateImage(mScene.mMedia, imgName);
    this.mSprite = new PIXI.Sprite(PIXI.loader.resources[imgName].texture);
  }

  /**
  * Set the z plane for this actor
  *
  * @param zIndex The z plane. Values range from -2 to 2. The default is 0.
  */
  public setZIndex(zIndex: number): void {
    // Coerce index into legal range, then move it
    zIndex = (zIndex < -2) ? -2 : zIndex;
    zIndex = (zIndex > 2) ? 2 : zIndex;
    this.mScene.removeActor(this, this.mZIndex);
    this.mZIndex = zIndex;
    this.mScene.addActor(this, this.mZIndex);
  }

  //  /**
  //   * Set the default animation sequence for this actor, and start playing it
  //   *
  //   * @param animation The animation to display
  //   */
  //  public void setDefaultAnimation(Animation animation) {
  //      mDefaultAnimation = animation;
  //      mAnimator.setCurrentAnimation(mDefaultAnimation);
  //  }
  //
  //  /**
  //   * Set the animation sequence to use when the actor is moving in the negative X direction
  //   *
  //   * @param animation The animation to display
  //   */
  //  public void setDefaultReverseAnimation(Animation animation) {
  //      mDefaultReverseAnimation = animation;
  //  }

  //  /**
  //   * Set the animation sequence to use when the actor is removed from the world
  //   *
  //   * @param animation The animation to display
  //   * @param offsetX   Distance between the animation and the left side of the actor
  //   * @param offsetY   Distance between the animation and the bottom of the actor
  //   * @param width     The width of the animation, in case it's not the same as the actor width
  //   * @param height    The height of the animation, in case it's not the same as the actor height
  //   */
  //  public void setDisappearAnimation(Animation animation, float offsetX, float offsetY, float width, float height) {
  //      mDisappearAnimation = animation;
  //      mDisappearAnimateOffset.set(offsetX, offsetY);
  //      mDisappearAnimateSize.set(width, height);
  //  }

  /**
  * Set a time that should pass before this actor appears on the screen
  *
  * @param delay How long to wait before displaying the actor, in milliseconds
  */
  //TODO: Timer vs setTimeout?
  public setAppearDelay(delay: number): void {
    this.mEnabled = false;
    this.mBody.SetActive(false);
    setTimeout(() => {
      this.mEnabled = true;
      this.mBody.SetActive(true);
    }, delay);
  }

  /**
  * Request that this actor disappear after a specified amount of time
  *
  * @param delay How long to wait before hiding the actor, in milliseconds
  * @param quiet Should the item should disappear quietly, or play its disappear sound?
  */
  public setDisappearDelay(delay: number, quiet: boolean): void {
    setTimeout(() => {
      this.remove(quiet);
    }, delay);
  }

  //  /**
  //   * Indicate that this actor should shrink over time.  Note that using negative values will lead
  //   * to growing instead of shrinking.
  //   *
  //   * @param shrinkX      The number of meters by which the X dimension should shrink each second
  //   * @param shrinkY      The number of meters by which the Y dimension should shrink each second
  //   * @param keepCentered Should the actor's center point stay the same as it shrinks, or should
  //   *                     its bottom left corner stay in the same position
  //   */
  //  public void setShrinkOverTime(final float shrinkX, final float shrinkY, final boolean keepCentered) {
  //      // NB: we shrink 20 times per second
  //      final Timer.Task t = new Timer.Task() {
  //          @Override
  //          public void run() {
  //              if (mEnabled) {
  //                  float x, y;
  //                  if (keepCentered) {
  //                      x = getXPosition() + shrinkX / 20 / 2;
  //                      y = getYPosition() + shrinkY / 20 / 2;
  //                  } else {
  //                      x = getXPosition();
  //                      y = getYPosition();
  //                  }
  //                  float w = mSize.x - shrinkX / 20;
  //                  float h = mSize.y - shrinkY / 20;
  //                  // if the area remains >0, resize it and schedule a timer to run again
  //                  if ((w > 0.05f) && (h > 0.05f)) {
  //                      resize(x, y, w, h);
  //                      Timer.schedule(this, .05f);
  //                  } else {
  //                      remove(false);
  //                  }
  //              }
  //          }
  //      };
  //      Timer.schedule(t, .05f);
  //  }

  /**
  * Indicate that this actor's rotation should change in response to its direction of motion
  */
  public setRotationByDirection(): void {
    let out_this = this;
    this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
      //@Override
      public go(): void {
        if (out_this.mEnabled) {
          let x = out_this.mBody.GetLinearVelocity().x;
          let y = out_this.mBody.GetLinearVelocity().y;
          let angle = Math.atan2(y, x) + Math.atan2(-1, 0);
          out_this.mBody.SetTransform(out_this.mBody.GetPosition(), angle);
        }
      }
    })());
  }


  //  /**
  //   * Specify that a limited amount of the actor should be displayed (image clipping)
  //   *
  //   * @param x The starting X position of the displayed portion, as a fraction from 0 to 1
  //   * @param y The starting Y position of the displayed portion, as a fraction from 0 to 1
  //   * @param w The width to display, as a fraction from 0 to 1
  //   * @param h The height to display, as a fraction from 0 to 1
  //   */
  //  public void setFlipAndClipRatio(float x, float y, float w, float h) {
  //      if (mClippingBL == null) {
  //          mClippingBL = new Vector2(x, y);
  //          mClippingWH = new Vector2(w, h);
  //      } else {
  //          mClippingBL.set(x, y);
  //          mClippingWH.set(w, h);
  //      }
  //  }
}
