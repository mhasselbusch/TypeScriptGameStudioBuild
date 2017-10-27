/// <reference path="./Renderable.ts"/>
//// <reference path="./LolScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

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

  /// The sprite associated with this actor
  mSprite: PIXI.Sprite;

  constructor(scene: LolScene, imgName: string, width: number, height: number) {
    super();
    this.mScene = scene;
    this.mSprite = new PIXI.Sprite(PIXI.loader.resources[imgName].texture);
    this.mSize = new PhysicsType2d.Vector2(width, height);
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
  setBoxPhysics(type: PhysicsType2d.Dynamics.BodyType, x: number, y: number) {
    let shape = new PhysicsType2d.Collision.Shapes.PolygonShape();
    shape.SetAsBoxAtOrigin(this.mSize.x / 2, this.mSize.y / 2);
    let boxBodyDef = new PhysicsType2d.Dynamics.BodyDefinition();
    boxBodyDef.type = type;
    boxBodyDef.position.x = x + this.mSize.x / 2;
    boxBodyDef.position.y = y + this.mSize.y / 2;
    this.mBody = this.mScene.mWorld.CreateBody(boxBodyDef);

    let fd = new PhysicsType2d.Dynamics.FixtureDefinition();
    fd.shape = shape;
    fd.density = 0;
    fd.friction = 0;
    fd.restitution = 0;
    this.mBody.CreateFixtureFromDefinition(fd);
    //no shape.dispose()

    this.mBody.SetUserData(this);

    // remember this is a box
    this.mIsCircleBody = false;
    this.mIsBoxBody = true;
    this.mIsPolygonBody = false;
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
    // // make sure it is not static... heroes are already Dynamic, let's just set everything else
    // // that is static to kinematic... that's probably safest.
    // if (mBody.getType() == BodyDef.BodyType.StaticBody)
    //    mBody.setType(BodyDef.BodyType.KinematicBody);
    // breakJoints();
    this.mBody.SetLinearVelocity(new PhysicsType2d.Vector2(x, y));
  }

  /**
   * Add velocity to this actor
   *
   * @param x Velocity in X dimension, in meters per second
   * @param y Velocity in Y dimension, in meters per second
   */
  addVelocity(x: number, y: number) {
    // ensure this is a moveable actor
    // if (mBody.getType() == BodyDef.BodyType.StaticBody)
    //   mBody.setType(BodyDef.BodyType.DynamicBody);
    let v = this.mBody.GetLinearVelocity();
    v.x += x;
    v.y += y;
    this.updateVelocity(v.x, v.y);
    // Disable sensor, or else this actor will go right through walls
    //this.setCollisionsEnabled(true);
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
   * Every time the world advances by a timestep, we call this code to update the actor route and
   * animation, and then draw the actor
   *
   * @param sb    The spritebatch to use in order to draw this actor
   * @param delta The amount of time since the last render event
   */
  //@Override
  onRender() {
    if(this.mBody) this.mSprite.position.x = this.mBody.GetWorldCenter().x;
    if(this.mBody) this.mSprite.position.y = this.mBody.GetWorldCenter().y;
  }
}
