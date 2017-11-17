"use strict";
/**
* Renderable is the base of all objects that can be displayed on the screen.  At its most simple
* level, a Renderable is simply a function (<code>onRender</code>), and a flag to indicate whether
* the object is currently active and enabled, or disabled.
*/
class Renderable {
    constructor() {
        /// Track if the object is currently allowed to be rendered.
        /// When it is false, we don't run any updates on the object
        this.mEnabled = true;
    }
    /**
    * Specify whether this Renderable object is enabled or disabled.  When it is disabled, it
    * effectively does not exist in the game.
    *
    * @param val The new state (true for enabled, false for disabled)
    */
    setEnabled(val) {
        this.mEnabled = val;
    }
    /**
    * Return the current enabled/disabled state of this Renderable
    *
    * @return The state of the renderable
    */
    getEnabled() {
        return this.mEnabled;
    }
    /**
    * Render something to the screen.  This doesn't do the actual rendering,
    * instead it forwards to the onRender function, but only if the object
    * is enabled.
    */
    render() {
        if (!this.mEnabled)
            return;
        this.onRender();
    }
}
/**
 * ToggleEventHandler is a wrapper for code that ought to run in response to a toggle event.
 */
class ToggleEventHandler {
    constructor() {
        /// A flag to control whether the event is allowed to execute or not
        this.mIsActive = true;
        /// The actor who generated this touch event
        this.mSource = null;
        /// A flag to track if we are in a 'hold' state
        this.isHolding = false;
    }
}
/// <reference path="./Renderable.ts"/>
/// <reference path="./ToggleEventHandler.ts"/>
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
    constructor(scene, imgName, width, height) {
        super();
        this.mScene = scene;
        this.mSize = new PhysicsType2d.Vector2(width, height);
        this.mZIndex = 0;
        this.mInfoText = "";
        if (imgName === "") {
            this.mSprite = new PIXI.Sprite();
            this.mSprite.texture = PIXI.Texture.EMPTY;
        }
        else {
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
    setBoxPhysics(type, x, y) {
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
    setPolygonPhysics(type, x, y, vertices) {
        let shape = new PhysicsType2d.Collision.Shapes.PolygonShape();
        let verts = new Array(vertices.length / 2);
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
    setCirclePhysics(type, x, y, radius) {
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
    setFastMoving(state) {
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
    updateVelocity(x, y) {
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
    breakJoints() {
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
        if (this.mBody)
            this.mSprite.position.x = this.mBody.GetPosition().x;
        if (this.mBody)
            this.mSprite.position.y = this.mBody.GetPosition().y;
    }
    /**
    * Indicate whether this actor engages in physics collisions or not
    *
    * @param state True or false, depending on whether the actor will participate in physics
    *              collisions or not
    */
    //TODO: This needs to be tested
    setCollisionsEnabled(state) {
        // The default is for all fixtures of a actor have the same sensor state
        let fixtures = this.mBody.GetFixtures();
        while (fixtures.MoveNext()) {
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
    setPhysics(density, elasticity, friction) {
        let fixtures = this.mBody.GetFixtures();
        while (fixtures.MoveNext()) {
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
    setGravityDefy() {
        this.mBody.SetGravityScale(0);
    }
    /**
    * Ensure that an actor is subject to gravitational forces.
    * <p>
    * By default, non-hero actors are not subject to gravity or forces until they are given a path,
    * velocity, or other form of motion. This lets an actor be subject to forces.  In practice,
    * using this in a side-scroller means the actor will fall to the ground.
    */
    setCanFall() {
        this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
    }
    /**
    * Force an actor to have a Kinematic body type.  Kinematic bodies can move, but are not subject
    * to forces in the same way as Dynamic bodies.
    */
    setKinematic() {
        if (this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.KINEMATIC)
            this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
    }
    /**
    * Retrieve any additional text information for this actor
    *
    * @return The string that the programmer provided
    */
    getInfoText() {
        return this.mInfoText;
    }
    /**
    * Retrieve any additional numerical information for this actor
    *
    * @return The integer that the programmer provided
    */
    getInfoInt() {
        return this.mInfoInt;
    }
    /**
    * Set additional text information for this actor
    *
    * @param text Text to attach to the actor
    */
    setInfoText(text) {
        this.mInfoText = text;
    }
    /**
    * Set additional numerical information for this actor
    *
    * @param newVal An integer to attach to the actor
    */
    setInfoInt(newVal) {
        this.mInfoInt = newVal;
    }
    /**
    * Returns the X coordinate of this actor
    *
    * @return x coordinate of bottom left corner, in meters
    */
    getXPosition() {
        return this.mBody.GetPosition().x - this.mSize.x / 2;
    }
    /**
    * Returns the Y coordinate of this actor
    *
    * @return y coordinate of bottom left corner, in meters
    */
    getYPosition() {
        return this.mBody.GetPosition().y - this.mSize.y / 2;
    }
    /**
    * Change the position of an actor
    *
    * @param x The new X position, in meters
    * @param y The new Y position, in meters
    */
    setPosition(x, y) {
        this.mBody.SetTransform(new PhysicsType2d.Vector2(x + this.mSize.x / 2, y + this.mSize.y / 2), this.mBody.GetAngle());
    }
    /**
    * Returns the width of this actor
    *
    * @return the actor's width, in meters
    */
    getWidth() {
        return this.mSize.x;
    }
    /**
    * Return the height of this actor
    *
    * @return the actor's height, in meters
    */
    getHeight() {
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
    resize(x, y, width, height) {
        // set new height and width
        this.mSize.Set(width, height);
        // read old body information
        let oldBody = this.mBody;
        let oldFix = oldBody.GetFixtures().Current();
        // make a new body
        if (this.mIsCircleBody) {
            this.setCirclePhysics(oldBody.GetType(), x, y, (width > height) ? width / 2 : height / 2);
        }
        else if (this.mIsBoxBody) {
            this.setBoxPhysics(oldBody.GetType(), x, y);
        }
        else if (this.mIsPolygonBody) {
            // we need to manually scale all the vertices
            let xScale = height / this.mSize.y;
            let yScale = width / this.mSize.x;
            let ps = oldFix.GetShape();
            let verts = new Array(ps.GetChildCount() * 2); //TEST: GetChildCount == GetVertexCount ??
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
    getRotation() {
        return this.mBody.GetAngle();
    }
    /**
    * Call this on an actor to rotate it. Note that this works best on boxes.
    *
    * @param rotation amount to rotate the actor (in radians)
    */
    setRotation(rotation) {
        this.mBody.SetTransform(this.mBody.GetPosition(), rotation);
    }
    /**
    * Make the actor continuously rotate. This is usually only useful for fixed objects.
    *
    * @param duration Time it takes to complete one rotation
    */
    setRotationSpeed(duration) {
        if (this.mBody.GetType() == PhysicsType2d.Dynamics.BodyType.STATIC)
            this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.KINEMATIC);
        this.mBody.SetAngularVelocity(duration);
    }
    /**
    * Indicate that this actor should not rotate due to torque
    */
    disableRotation() {
        this.mBody.SetFixedRotation(true);
    }
    /**
    * Make an actor disappear
    *
    * @param quiet True if the disappear sound should not be played
    */
    remove(quiet) {
        // set it invisible immediately, so that future calls know to ignore this actor
        this.mEnabled = false;
        this.mBody.SetActive(false);
        // play a sound when we remove this actor?
        //  if (mDisappearSound != null && !quiet)
        //      mDisappearSound.play(Lol.getGameFact(mScene.mConfig, "volume", 1));
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
    getXVelocity() {
        return this.mBody.GetLinearVelocity().x;
    }
    /**
    * Returns the Y velocity of of this actor
    *
    * @return Velocity in Y dimension, in meters per second
    */
    getYVelocity() {
        return this.mBody.GetLinearVelocity().y;
    }
    /**
    * Add velocity to this actor
    *
    * @param x Velocity in X dimension, in meters per second
    * @param y Velocity in Y dimension, in meters per second
    */
    addVelocity(x, y) {
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
    setAbsoluteVelocity(x, y) {
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
    setDamping(amount) {
        this.mBody.SetLinearDamping(amount);
    }
    /**
    * Set a dampening factor to cause a spinning body to decrease its rate of spin
    *
    * @param amount The amount of damping to apply
    */
    setAngularDamping(amount) {
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
    //  /**
    //   * Request that this actor moves according to a fixed route
    //   *
    //   * @param route    The route to follow
    //   * @param velocity speed at which to travel along the route
    //   * @param loop     When the route completes, should we start it over again?
    //   */
    //  public void setRoute(Route route, float velocity, boolean loop) {
    //      // This must be a KinematicBody or a Dynamic Body!
    //      if (mBody.getType() == BodyDef.BodyType.StaticBody)
    //          mBody.setType(BodyDef.BodyType.KinematicBody);
    //
    //      // Create a Driver to advance the actor's position according to the route
    //      mRoute = new Route.Driver(route, velocity, loop, this);
    //  }
    //  /**
    //   * Request that a sound plays whenever the player touches this actor
    //   *
    //   * @param sound The name of the sound file to play
    //   */
    //  public void setTouchSound(String sound) {
    //      mTouchSound = mScene.mMedia.getSound(sound);
    //  }
    //  /**
    //   * Request that a sound plays whenever this actor disappears
    //   *
    //   * @param soundName The name of the sound file to play
    //   */
    //  public void setDisappearSound(String soundName) {
    //      mDisappearSound = mScene.mMedia.getSound(soundName);
    //  }
    /**
    * Change the image being used to display the actor
    *
    * @param imgName The name of the new image file to use
    */
    setImage(imgName) {
        //mAnimator.updateImage(mScene.mMedia, imgName);
        this.mSprite = new PIXI.Sprite(PIXI.loader.resources[imgName].texture);
    }
    /**
    * Set the z plane for this actor
    *
    * @param zIndex The z plane. Values range from -2 to 2. The default is 0.
    */
    setZIndex(zIndex) {
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
    //TODO: Timer vs setTimeout
    setAppearDelay(delay) {
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
    setDisappearDelay(delay, quiet) {
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
    setRotationByDirection() {
        let out_this = this;
        this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
            //@Override
            go() {
                if (out_this.mEnabled) {
                    let x = out_this.mBody.GetLinearVelocity().x;
                    let y = out_this.mBody.GetLinearVelocity().y;
                    let angle = Math.atan2(y, x) + Math.atan2(-1, 0);
                    out_this.mBody.SetTransform(out_this.mBody.GetPosition(), angle);
                }
            }
        })());
    }
}
// TODO: Right now the camera can only follow an actor
// The Camera is essentially a wrapper for a pixi Container
// which could contain an actor to chase
// and the scene it is acting as a camera for
class Camera {
    constructor(x, y) {
        this.mContainer = new PIXI.Container();
        this.mWidth = x;
        this.mHeight = y;
        //this.mContainer.position.x = x;
        //this.mContainer.position.y = y;
    }
    // changeScene(scene: Scene) {
    //   this.mContainer.removeChildren();
    //   this.mScene = scene;
    //   this.mContainer.addChild(scene.mContainer);
    // }
    setPosition(x, y) {
        this.mContainer.position.x = x; // - this.mWidth / 2;
        this.mContainer.position.y = y; // - this.mHeight / 2;
    }
    centerOn(x, y) {
        this.mContainer.pivot.x = x; // - this.mWidth / 2;
        this.mContainer.pivot.y = y; // - this.mHeight / 2;
    }
    // updatePosition() {
    //   this.mContainer.pivot = this.mChaseActor.mSprite.position;
    //   this.mContainer.position.x = this.mWidth / 2;
    //   this.mContainer.position.y = this.mHeight / 2;
    // }
    // setChase(chaseActor: WorldActor) {
    //   this.mChaseActor = chaseActor;
    // }
    setZoom(zoom) {
        this.mContainer.scale.set((1 / zoom), (1 / zoom));
    }
    getZoom() {
        return (1 / this.mContainer.scale.x);
    }
    zoomInOut(zoom) {
        let z = this.mContainer.scale;
        this.mContainer.scale.set(z.x * (1 / zoom), z.y * (1 / zoom));
    }
}
//// <reference path="./WorldActor.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
// <reference types="pixi.js"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
/**
* Level provides a broad, public, declarative interface to the core functionality of LibLOL.
* <p>
* Game designers will spend most of their time in the <code>display</code> function of the various
* <code>ScreenManager</code> objects that comprise the game (i.e., Chooser, Help, Levels, Splash,
* Store).  Within that function, a <code>Level</code> object is available.  It corresponds to a
* pre-configured, blank, interactive portion of the game.  By calling functions on the level, a
* programmer can realize their game.
* <p>
* Conceptually, a Level consists of many screens:
* <ul>
* <li>MainScreen: This is where the Actors of the game are drawn</li>
* <li>Hud: A heads-up display onto which text and input controls can be drawn</li>
* <li>PreScene: A quick scene to display before the level starts</li>
* <li>PostScene (WinScene or LoseScene): Two quick scenes to display at the end of the level</li>
* <li>PauseScene: A scene to show when the game is paused</li>
* </ul>
*/
class Level {
    /**
    * Construct a level.  Since Level is merely a facade, this method need only store references to
    * the actual game objects.
    *
    * @param config The configuration object describing this game
    * @param media  References to all image and sound assets
    * @param game   The top-level game object
    */
    constructor(config, media, game) {
        // save game configuration information
        this.mGame = game;
        this.mConfig = config;
        this.mMedia = media;
    }
    // /**
    // * Configure the camera bounds for a level
    // * <p>
    // * TODO: set upper and lower bounds, instead of assuming a lower bound of (0, 0)
    // *
    // * @param width  width of the camera
    // * @param height height of the camera
    // */
    // public void setCameraBounds(float width, float height) {
    //   mGame.mManager.mWorld.mCamBound.set(width, height);
    //
    //   // warn on strange dimensions
    //   if (width < mConfig.mWidth / mConfig.mPixelMeterRatio)
    //   Lol.message(mConfig, "Warning", "Your game width is less than 1/10 of the screen width");
    //   if (height < mConfig.mHeight / mConfig.mPixelMeterRatio)
    //   Lol.message(mConfig, "Warning", "Your game height is less than 1/10 of the screen height");
    // }
    /**
    * Identify the actor that the camera should try to keep on screen at all times
    *
    * @param actor The actor the camera should chase
    */
    setCameraChase(actor) {
        this.mGame.mManager.mWorld.mChaseActor = actor;
    }
    // /**
    // * Set the background music for this level
    // *
    // * @param musicName Name of the Music file to play
    // */
    // public void setMusic(String musicName) {
    //   mGame.mManager.mWorld.mMusic = mMedia.getMusic(musicName);
    // }
    //
    // /**
    // * Specify that you want some code to run after a fixed amount of time passes.
    // *
    // * @param howLong  How long to wait before the timer code runs
    // * @param callback The code to run
    // */
    // public void setTimerCallback(float howLong, final LolAction callback) {
    //   Timer.schedule(new Timer.Task() {
    //     @Override
    //     public void run() {
    //       if (!mGame.mManager.mGameOver)
    //       callback.go();
    //     }
    //   }, howLong);
    // }
    //
    // /**
    // * Specify that you want some code to run repeatedly
    // *
    // * @param howLong  How long to wait before the timer code runs for the first time
    // * @param interval The time between subsequent executions of the code
    // * @param callback The code to run
    // */
    // public void setTimerCallback(float howLong, float interval, final LolAction callback) {
    //   Timer.schedule(new Timer.Task() {
    //     @Override
    //     public void run() {
    //       if (!mGame.mManager.mGameOver)
    //       callback.go();
    //     }
    //   }, howLong, interval);
    // }
    //
    // /**
    // * Turn on scribble mode, so that scene touch events draw circular objects
    // * <p>
    // * Note: this code should be thought of as serving to demonstrate, only. If you really wanted to
    // * do anything clever with scribbling, you'd certainly want to change this code.
    // *
    // * @param imgName          The name of the image to use for scribbling
    // * @param width            Width of the individual components of the scribble
    // * @param height           Height of the individual components of the scribble
    // * @param interval         Time (in milliseconds) that must transpire between scribble events...
    // *                         use this to avoid outrageously high rates of scribbling
    // * @param onCreateCallback A callback to run in order to modify the scribble behavior. The
    // *                         obstacle that is drawn in the scribble will be passed to the callback
    // */
    // public void setScribbleMode(final String imgName, final float width, final float height,
    //   final int interval, final LolActorEvent onCreateCallback) {
    //     // we set a callback on the Level, so that any touch to the level (down, drag, up) will
    //     // affect our scribbling
    //     mGame.mManager.mWorld.mPanHandlers.add(new PanEventHandler() {
    //       /// The time of the last touch event... we use this to prevent high rates of scribble
    //       long mLastTime;
    //
    //       /**
    //       * Draw a new obstacle if enough time has transpired
    //       */
    //       public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
    //         // check if enough milliseconds have passed
    //         long now = System.currentTimeMillis();
    //         if (now < mLastTime + interval) {
    //           return true;
    //         }
    //         mLastTime = now;
    //
    //         // make a circular obstacle
    //         final Obstacle o = makeObstacleAsCircle(worldX - width / 2, worldY - height / 2,
    //           width, height, imgName);
    //           if (onCreateCallback != null) {
    //             onCreateCallback.go(o);
    //           }
    //
    //           return true;
    //         }
    //       });
    //     }
    //
    //     /**
    //     * Manually set the zoom level of the game
    //     *
    //     * @param zoom The amount of zoom (1 is no zoom, &gt;1 zooms out)
    //     */
    //     public void setZoom(float zoom) {
    //       mGame.mManager.mWorld.mCamera.zoom = zoom;
    //       mGame.mManager.mBackground.mBgCam.zoom = zoom;
    //       mGame.mManager.mForeground.mBgCam.zoom = zoom;
    //     }
    //
    //     /**
    //     * Register a callback so that custom code will run when the level is won
    //     *
    //     * @param callback The code to run
    //     */
    //     public void setWinCallback(LolAction callback) {
    //       mGame.mManager.mWinCallback = callback;
    //     }
    //
    //     /**
    //     * Register a callback so that custom code will run when the level is lost
    //     *
    //     * @param callback The code to run
    //     */
    //     public void setLoseCallback(LolAction callback) {
    //       mGame.mManager.mLoseCallback = callback;
    //     }
    /**
    * Manually increment the number of goodies of type 1 that have been collected.
    */
    incrementGoodiesCollected1() {
        this.mGame.mManager.mGoodiesCollected[0]++;
    }
    /**
    * Manually increment the number of goodies of type 2 that have been collected.
    */
    incrementGoodiesCollected2() {
        this.mGame.mManager.mGoodiesCollected[1]++;
    }
    /**
    * Manually increment the number of goodies of type 3 that have been collected.
    */
    incrementGoodiesCollected3() {
        this.mGame.mManager.mGoodiesCollected[2]++;
    }
    /**
    * Manually increment the number of goodies of type 4 that have been collected.
    */
    incrementGoodiesCollected4() {
        this.mGame.mManager.mGoodiesCollected[3]++;
    }
    /**
    * Getter for number of goodies of type 1 that have been collected.
    *
    * @return The number of goodies collected.
    */
    getGoodiesCollected1() {
        return this.mGame.mManager.mGoodiesCollected[0];
    }
    /**
    * Manually set the number of goodies of type 1 that have been collected.
    *
    * @param value The new value
    */
    setGoodiesCollected1(value) {
        this.mGame.mManager.mGoodiesCollected[0] = value;
    }
    /**
    * Getter for number of goodies of type 2 that have been collected.
    *
    * @return The number of goodies collected.
    */
    getGoodiesCollected2() {
        return this.mGame.mManager.mGoodiesCollected[1];
    }
    /**
    * Manually set the number of goodies of type 2 that have been collected.
    *
    * @param value The new value
    */
    setGoodiesCollected2(value) {
        this.mGame.mManager.mGoodiesCollected[1] = value;
    }
    /**
    * Getter for number of goodies of type 3 that have been collected.
    *
    * @return The number of goodies collected.
    */
    getGoodiesCollected3() {
        return this.mGame.mManager.mGoodiesCollected[2];
    }
    /**
    * Manually set the number of goodies of type 3 that have been collected.
    *
    * @param value The new value
    */
    setGoodiesCollected3(value) {
        this.mGame.mManager.mGoodiesCollected[2] = value;
    }
    /**
    * Getter for number of goodies of type 4 that have been collected.
    *
    * @return The number of goodies collected.
    */
    getGoodiesCollected4() {
        return this.mGame.mManager.mGoodiesCollected[3];
    }
    /**
    * Manually set the number of goodies of type 4 that have been collected.
    *
    * @param value The new value
    */
    setGoodiesCollected4(value) {
        this.mGame.mManager.mGoodiesCollected[3] = value;
    }
    /**
    * Indicate that the level is won by defeating a certain number of enemies or by defeating
    * all of the enemies if not given an argument. This version is useful if the number of
    * enemies isn't known, or if the goal is to defeat all enemies before more are are created.
    *
    * @param howMany The number of enemies that must be defeated to win the level
    */
    setVictoryEnemyCount(howMany) {
        this.mGame.mManager.mVictoryType = VictoryType.ENEMYCOUNT;
        if (howMany) {
            this.mGame.mManager.mVictoryEnemyCount = howMany;
        }
        else {
            this.mGame.mManager.mVictoryEnemyCount = -1;
        }
    }
    /**
    * Indicate that the level is won by collecting enough goodies
    *
    * @param v1 Number of type-1 goodies that must be collected to win the level
    * @param v2 Number of type-2 goodies that must be collected to win the level
    * @param v3 Number of type-3 goodies that must be collected to win the level
    * @param v4 Number of type-4 goodies that must be collected to win the level
    */
    setVictoryGoodies(v1, v2, v3, v4) {
        this.mGame.mManager.mVictoryType = VictoryType.GOODIECOUNT;
        this.mGame.mManager.mVictoryGoodieCount[0] = v1;
        this.mGame.mManager.mVictoryGoodieCount[1] = v2;
        this.mGame.mManager.mVictoryGoodieCount[2] = v3;
        this.mGame.mManager.mVictoryGoodieCount[3] = v4;
    }
    /**
    * Indicate that the level is won by having a certain number of heroes reach destinations
    *
    * @param howMany Number of heroes that must reach destinations
    */
    setVictoryDestination(howMany) {
        this.mGame.mManager.mVictoryType = VictoryType.DESTINATION;
        this.mGame.mManager.mVictoryHeroCount = howMany;
    }
    /**
    * Change the amount of time left in a countdown timer
    *
    * @param delta The amount of time to add before the timer expires
    */
    updateTimerExpiration(delta) {
        this.mGame.mManager.mLoseCountDownRemaining += delta;
    }
    //     /**
    //     * Report the total distance the hero has traveled
    //     *
    //     * @return The distance the hero has traveled
    //     */
    //     public int getDistance() {
    //       return mGame.mManager.mDistance;
    //     }
    //
    //     /**
    //     * Report the stopwatch value
    //     *
    //     * @return the stopwatch value
    //     */
    //     public int getStopwatch() {
    //       // Inactive stopwatch should return 0
    //       if (mGame.mManager.mStopWatchProgress == -100)
    //       return 0;
    //       return (int) mGame.mManager.mStopWatchProgress;
    //     }
    //
    //     /**
    //     * Report the number of enemies that have been defeated
    //     *
    //     * @return the number of defeated enemies
    //     */
    //     public int getEnemiesDefeated() {
    //       return mGame.mManager.mEnemiesDefeated;
    //     }
    //
    //     /**
    //     * Force the level to end in victory
    //     * <p>
    //     * This is useful in callbacks, where we might want to immediately end the game
    //     */
    //     public void winLevel() {
    //       mGame.mManager.endLevel(true);
    //     }
    //
    //     /**
    //     * Force the level to end in defeat
    //     * <p>
    //     * This is useful in callbacks, where we might want to immediately end the game
    //     */
    //     public void loseLevel() {
    //       mGame.mManager.endLevel(false);
    //     }
    /**
    * Change the gravity in a running level
    *
    * @param newXGravity The new X gravity
    * @param newYGravity The new Y gravity
    */
    resetGravity(newXGravity, newYGravity) {
        this.mGame.mManager.mWorld.mWorld.SetGravity(new PhysicsType2d.Vector2(newXGravity, newYGravity));
    }
    //
    //     /**
    //     * Turn on accelerometer support so that tilt can control actors in this level
    //     *
    //     * @param xGravityMax Max X force that the accelerometer can produce
    //     * @param yGravityMax Max Y force that the accelerometer can produce
    //     */
    //     public void enableTilt(float xGravityMax, float yGravityMax) {
    //       mGame.mManager.mWorld.mTiltMax = new Vector2(xGravityMax, yGravityMax);
    //     }
    //
    //     /**
    //     * Turn off accelerometer support so that tilt stops controlling actors in this level
    //     */
    //     public void disableTilt() {
    //       mGame.mManager.mWorld.mTiltMax = null;
    //     }
    //
    //     /**
    //     * This method lets us change the behavior of tilt, so that instead of applying a force, we
    //     * directly set the velocity of objects using the accelerometer data.
    //     *
    //     * @param toggle This should usually be false. Setting it to true means that tilt does not cause
    //     *               forces upon objects, but instead the tilt of the phone directly sets velocities
    //     */
    //     public void setTiltAsVelocity(boolean toggle) {
    //       mGame.mManager.mWorld.mTiltVelocityOverride = toggle;
    //     }
    //
    //     /**
    //     * Use this to make the accelerometer more or less responsive, by multiplying accelerometer
    //     * values by a constant.
    //     *
    //     * @param multiplier The constant that should be multiplied by the accelerometer data. This can
    //     *                   be a fraction, like 0.5f, to make the accelerometer less sensitive
    //     */
    //     public void setGravityMultiplier(float multiplier) {
    //       mGame.mManager.mWorld.mTiltMultiplier = multiplier;
    //     }
    //
    //     /**
    //     * Generate text that doesn't change
    //     *
    //     * @param text The text to generate each time the TextProducer is called
    //     * @return A TextProducer who generates the text
    //     */
    //     public TextProducer DisplayFixedText(final String text) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           return text;
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Generate text indicating the current FPS
    //     */
    //     public final TextProducer DisplayFPS = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + Gdx.graphics.getFramesPerSecond();
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the current count of Type 1 Goodies
    //     */
    //     public final TextProducer DisplayGoodies1 = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mGoodiesCollected[0];
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the current count of Type 2 Goodies
    //     */
    //     public final TextProducer DisplayGoodies2 = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mGoodiesCollected[1];
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the current count of Type 3 Goodies
    //     */
    //     public final TextProducer DisplayGoodies3 = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mGoodiesCollected[2];
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the current count of Type 4 Goodies
    //     */
    //     public final TextProducer DisplayGoodies4 = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mGoodiesCollected[3];
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the time until the level is lost
    //     */
    //     public final TextProducer DisplayLoseCountdown = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + (int) mGame.mManager.mLoseCountDownRemaining;
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the time until the level is won
    //     */
    //     public final TextProducer DisplayWinCountdown = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + (int) mGame.mManager.mWinCountRemaining;
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the number of defeated enemies
    //     */
    //     public final TextProducer DisplayEnemiesDefeated = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mEnemiesDefeated;
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the value of the stopwatch
    //     */
    //     public final TextProducer DisplayStopwatch = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + (int) mGame.mManager.mStopWatchProgress;
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the remaining projectiles
    //     */
    //     public final TextProducer DisplayRemainingProjectiles = new TextProducer() {
    //       @Override
    //       public String makeText() {
    //         return "" + mGame.mManager.mWorld.mProjectilePool.mProjectilesRemaining;
    //       }
    //     };
    //
    //     /**
    //     * Generate text indicating the strength of a hero
    //     *
    //     * @param h The hero whose strength is to be displayed
    //     * @return A TextProducer who produces the hero's strength
    //     */
    //     public TextProducer DisplayStrength(final Hero h) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           return "" + h.getStrength();
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Generate text indicating the value of a Level fact
    //     *
    //     * @param key The key to use to get the Level fact
    //     * @return A TextProducer who reports the current value
    //     */
    //     public TextProducer DisplayLevelFact(final String key) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           return "" + getLevelFact(key, -1);
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Generate text indicating the value of a Session fact
    //     *
    //     * @param key The key to use to get the Session fact
    //     * @return A TextProducer who reports the current value
    //     */
    //     public TextProducer DisplaySessionFact(final String key) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           return "" + getSessionFact(key, -1);
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Generate text indicating the value of a Game fact
    //     *
    //     * @param key The key to use to get the Game fact
    //     * @return A TextProducer who reports the current value
    //     */
    //     public TextProducer DisplayGameFact(final String key) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           return "" + getGameFact(key, -1);
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Generate text indicating the distance that an actor has travelled.
    //     * <p>
    //     * Note: This distance will also become the Distance Score for the level.
    //     *
    //     * @param actor The actor whose distance is being monitored
    //     * @return A TextProducer that reports the current value
    //     */
    //     public TextProducer DisplayDistance(final WorldActor actor) {
    //       return new TextProducer() {
    //         @Override
    //         public String makeText() {
    //           mGame.mManager.mDistance = (int) actor.getXPosition();
    //           return "" + mGame.mManager.mDistance;
    //         }
    //       };
    //     }
    //
    //     /**
    //     * Place some text on the screen.  The text will be generated by tp, which is called on every
    //     * screen render
    //     *
    //     * @param x         The X coordinate of the bottom left corner (in pixels)
    //     * @param y         The Y coordinate of the bottom left corner (in pixels)
    //     * @param fontName  The name of the font to use
    //     * @param fontColor The color to use for the text
    //     * @param size      The font size
    //     * @param prefix    Text to display before the produced text
    //     * @param suffix    Text to display after the produced text
    //     * @param tp        The TextProducer
    //     * @param zIndex    The z index where the text should go
    //     * @return The display, so that it can be controlled further if needed
    //     */
    //     public Renderable addDisplay(final float x, final float y, final String fontName,
    //       final String fontColor, final int size, final String prefix,
    //       final String suffix, final TextProducer tp, int zIndex) {
    //         return mGame.mManager.mHud.addText(x, y, fontName, fontColor, size, prefix, suffix, tp,
    //           zIndex);
    //         }
    //
    //         /**
    //         * Indicate that the level will end in defeat if it is not completed in a given amount of time.
    //         *
    //         * @param timeout The amount of time until the level will end in defeat
    //         * @param text    The text to display when the level ends in defeat
    //         */
    //         public void setLoseCountdown(float timeout, String text) {
    //           // Once the Lose CountDown is not -100, it will start counting down
    //           this.mGame.mManager.mLoseCountDownRemaining = timeout;
    //           this.mGame.mManager.mLoseCountDownText = text;
    //         }
    //
    //         /**
    //         * Indicate that the level will end in victory if the hero survives for a given amount of time
    //         *
    //         * @param timeout The amount of time until the level will end in victory
    //         * @param text    The text to display when the level ends in victory
    //         */
    //         public void setWinCountdown(float timeout, String text) {
    //           // Once the Win CountDown is not -100, it will start counting down
    //           this.mGame.mManager.mWinCountRemaining = timeout;
    //           this.mGame.mManager.mWinCountText = text;
    //         }
    //
    //         /**
    //         * Set the current value of the stopwatch.  Use -100 to disable the stopwatch, otherwise it will
    //         * start counting immediately.
    //         *
    //         * @param newVal The new value of the stopwatch
    //         */
    //         public void setStopwatch(float newVal) {
    //           this.mGame.mManager.mStopWatchProgress = newVal;
    //         }
    /**
    * Add a button that performs an action when clicked.
    *
    * @param x       The X coordinate of the bottom left corner (in pixels)
    * @param y       The Y coordinate of the bottom left corner (in pixels)
    * @param width   The width of the image
    * @param height  The height of the image
    * @param imgName The name of the image to display. Use "" for an invisible button
    * @param action  The action to run in response to a tap
    */
    addTapControl(x, y, width, height, imgName, action) {
        let c = new SceneActor(this.mGame.mManager.mHud, imgName, width, height);
        c.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
        //c.mTapHandler = action;
        //action.mSource = c;
        c.mSprite.interactive = true;
        c.mSprite.on('click', () => action.go());
        this.mGame.mManager.mHud.addActor(c, 0);
        return c;
    }
    //           /**
    //           * An action to pause the game.  This action can be used as the action taken on a Control tap.
    //           */
    //           public TouchEventHandler PauseAction = new TouchEventHandler() {
    //             @Override
    //             public boolean go(float x, float y) {
    //               getPauseScene().show();
    //               return true;
    //             }
    //           };
    //
    //           /**
    //           * Create an action that makes a hero jump.  This action can be used as the action taken on a
    //           * Control tap.
    //           *
    //           * @param hero The hero who we want to jump
    //           * @return The action object
    //           */
    //           public TouchEventHandler JumpAction(final Hero hero) {
    //             return new TouchEventHandler() {
    //               @Override
    //               public boolean go(float x, float y) {
    //                 hero.jump();
    //                 return true;
    //               }
    //             };
    //           }
    //
    //           /**
    //           * Create an action that makes a hero throw a projectile
    //           *
    //           * @param hero      The hero who should throw the projectile
    //           * @param offsetX   specifies the x distance between the bottom left of the projectile and the
    //           *                  bottom left of the hero throwing the projectile
    //           * @param offsetY   specifies the y distance between the bottom left of the projectile and the
    //           *                  bottom left of the hero throwing the projectile
    //           * @param velocityX The X velocity of the projectile when it is thrown
    //           * @param velocityY The Y velocity of the projectile when it is thrown
    //           * @return The action object
    //           */
    //           public TouchEventHandler ThrowFixedAction(final Hero hero, final float offsetX,
    //             final float offsetY, final float velocityX,
    //             final float velocityY) {
    //               return new TouchEventHandler() {
    //                 public boolean go(float x, float y) {
    //                   mGame.mManager.mWorld.mProjectilePool.throwFixed(hero, offsetX, offsetY, velocityX,
    //                     velocityY);
    //                     return true;
    //                   }
    //                 };
    //               }
    //
    //               /**
    //               * Create an action that makes a hero throw a projectile in a direction that relates to how the
    //               * screen was touched
    //               *
    //               * @param hero    The hero who should throw the projectile
    //               * @param offsetX specifies the x distance between the bottom left of the projectile and the
    //               *                bottom left of the hero throwing the projectile
    //               * @param offsetY specifies the y distance between the bottom left of the projectile and the
    //               *                bottom left of the hero throwing the projectile
    //               * @return The action object
    //               */
    //               public TouchEventHandler ThrowDirectionalAction(final Hero hero, final float offsetX,
    //                 final float offsetY) {
    //                   return new TouchEventHandler() {
    //                     public boolean go(float worldX, float worldY) {
    //                       mGame.mManager.mWorld.mProjectilePool.throwAt(hero.mBody.getPosition().x,
    //                       hero.mBody.getPosition().y, worldX, worldY, hero, offsetX, offsetY);
    //                       return true;
    //                     }
    //                   };
    //                 }
    //
    //                 /**
    //                 * Create an action that makes the screen zoom out
    //                 *
    //                 * @param maxZoom The maximum zoom factor to allow
    //                 * @return The action object
    //                 */
    //                 public TouchEventHandler ZoomOutAction(final float maxZoom) {
    //                   return new TouchEventHandler() {
    //                     public boolean go(float x, float y) {
    //                       float curzoom = mGame.mManager.mWorld.mCamera.zoom;
    //                       if (curzoom < maxZoom) {
    //                         mGame.mManager.mWorld.mCamera.zoom *= 2;
    //                         mGame.mManager.mBackground.mBgCam.zoom *= 2;
    //                         mGame.mManager.mForeground.mBgCam.zoom *= 2;
    //                       }
    //                       return true;
    //                     }
    //                   };
    //                 }
    //
    //                 /**
    //                 * Create an action that makes the screen zoom in
    //                 *
    //                 * @param minZoom The minimum zoom factor to allow
    //                 * @return The action object
    //                 */
    //                 public TouchEventHandler ZoomInAction(final float minZoom) {
    //                   return new TouchEventHandler() {
    //                     public boolean go(float x, float y) {
    //                       float curzoom = mGame.mManager.mWorld.mCamera.zoom;
    //                       if (curzoom > minZoom) {
    //                         mGame.mManager.mWorld.mCamera.zoom /= 2;
    //                         mGame.mManager.mBackground.mBgCam.zoom /= 2;
    //                         mGame.mManager.mForeground.mBgCam.zoom /= 2;
    //                       }
    //                       return true;
    //                     }
    //                   };
    //                 }
    //
    //                 /**
    //                 * Add a button that has one behavior while it is being pressed, and another when it is released
    //                 *
    //                 * @param x               The X coordinate of the bottom left corner
    //                 * @param y               The Y coordinate of the bottom left corner
    //                 * @param width           The width of the image
    //                 * @param height          The height of the image
    //                 * @param imgName         The name of the image to display.  Use "" for an invisible button
    //                 * @param whileDownAction The action to execute, repeatedly, whenever the button is pressed
    //                 * @param onUpAction      The action to execute once any time the button is released
    //                 * @return The control, so we can do more with it as needed.
    //                 */
    //                 public SceneActor addToggleButton(int x, int y, int width, int height, String imgName,
    //                   final LolAction whileDownAction, final LolAction onUpAction) {
    //                     SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
    //                     c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                     // initially the down action is not active
    //                     whileDownAction.mIsActive = false;
    //                     // set up the toggle behavior
    //                     c.mToggleHandler = new ToggleEventHandler() {
    //                       public boolean go(boolean isUp, float x, float y) {
    //                         if (isUp) {
    //                           whileDownAction.mIsActive = false;
    //                           if (onUpAction != null)
    //                           onUpAction.go();
    //                         } else {
    //                           whileDownAction.mIsActive = true;
    //                         }
    //                         return true;
    //                       }
    //                     };
    //                     // Put the control and events in the appropriate lists
    //                     c.mToggleHandler.mSource = c;
    //                     mGame.mManager.mHud.addActor(c, 0);
    //                     mGame.mManager.mHud.mToggleControls.add(c);
    //                     mGame.mManager.mWorld.mRepeatEvents.add(whileDownAction);
    //                     return c;
    //                   }
    /**
    * Create an action for moving an actor in the X direction.  This action can be used by a
    * Control.
    *
    * @param actor The actor to move
    * @param xRate The rate at which the actor should move in the X direction (negative values are
    *              allowed)
    * @return The action
    */
    makeXMotionAction(actor, xRate) {
        return new (class _ extends LolAction {
            //@Override
            go() {
                let v = actor.mBody.GetLinearVelocity();
                v.x = xRate;
                actor.updateVelocity(v.x, v.y);
            }
        })();
    }
    /**
    * Create an action for moving an actor in the Y direction.  This action can be used by a
    * Control.
    *
    * @param actor The actor to move
    * @param yRate The rate at which the actor should move in the Y direction (negative values are
    *              allowed)
    * @return The action
    */
    makeYMotionAction(actor, yRate) {
        return new (class _ extends LolAction {
            //@Override
            go() {
                let v = actor.mBody.GetLinearVelocity();
                v.y = yRate;
                actor.updateVelocity(v.x, v.y);
            }
        })();
    }
    //
    //                   /**
    //                   * Create an action for moving an actor in the X and Y directions.  This action can be used by a
    //                   * Control.
    //                   *
    //                   * @param actor The actor to move
    //                   * @param xRate The rate at which the actor should move in the X direction (negative values are
    //                   *              allowed)
    //                   * @param yRate The rate at which the actor should move in the Y direction (negative values are
    //                   *              allowed)
    //                   * @return The action
    //                   */
    //                   public LolAction makeXYMotionAction(final WorldActor actor, final float xRate,
    //                     final float yRate) {
    //                       return new LolAction() {
    //                         @Override
    //                         public void go() {
    //                           actor.updateVelocity(xRate, yRate);
    //                         }
    //                       };
    //                     }
    /**
    * Let an actor be controlled by arrow keys
    *
    * @param actor     The actor to move
    * @param speed     Speed to move an actor
    * @param dampening The dampening factor
    */
    setArrowKeyControls(actor, speed) {
        let up = this.makeYMotionAction(actor, -speed);
        let down = this.makeYMotionAction(actor, speed);
        let left = this.makeXMotionAction(actor, -speed);
        let right = this.makeXMotionAction(actor, speed);
        document.onkeydown = (e) => {
            if (e.key == "ArrowUp") {
                up.go();
            }
            else if (e.key == "ArrowDown") {
                down.go();
            }
            else if (e.key == "ArrowLeft") {
                left.go();
            }
            else if (e.key == "ArrowRight") {
                right.go();
            }
        };
        document.onkeyup = (e) => {
            if (e.key == "ArrowUp") {
                actor.updateVelocity(actor.mBody.GetLinearVelocity().x, 0);
            }
            else if (e.key == "ArrowDown") {
                actor.updateVelocity(actor.mBody.GetLinearVelocity().x, 0);
            }
            else if (e.key == "ArrowLeft") {
                actor.updateVelocity(0, actor.mBody.GetLinearVelocity().y);
            }
            else if (e.key == "ArrowRight") {
                actor.updateVelocity(0, actor.mBody.GetLinearVelocity().y);
            }
        };
    }
    /**
    * Create an action for moving an actor in the X and Y directions, with dampening on release.
    * This action can be used by a Control.
    *
    * @param actor     The actor to move
    * @param xRate     The rate at which the actor should move in the X direction (negative values
    *                  are allowed)
    * @param yRate     The rate at which the actor should move in the Y direction (negative values
    *                  are allowed)
    * @param dampening The dampening factor
    * @return The action
    */
    makeXYDampenedMotionAction(actor, xRate, yRate, dampening) {
        let action = new (class _ extends LolAction {
            //@Override
            go() {
                actor.updateVelocity(xRate, yRate);
                actor.mBody.SetLinearDamping(dampening);
            }
        })();
        return action;
    }
    //
    //                       /**
    //                       * Create an action for making a hero either start or stop crawling
    //                       *
    //                       * @param hero       The hero to control
    //                       * @param crawlState True to start crawling, false to stop
    //                       * @return The action
    //                       */
    //                       public LolAction makeCrawlToggle(final Hero hero, final boolean crawlState) {
    //                         return new LolAction() {
    //                           @Override
    //                           public void go() {
    //                             if (crawlState)
    //                             hero.crawlOn();
    //                             else
    //                             hero.crawlOff();
    //                           }
    //                         };
    //                       }
    //
    //                       /**
    //                       * Create an action for making a hero rotate
    //                       *
    //                       * @param hero The hero to rotate
    //                       * @param rate Amount of rotation to apply to the hero on each press
    //                       * @return The action
    //                       */
    //                       public LolAction makeRotator(final Hero hero, final float rate) {
    //                         return new LolAction() {
    //                           @Override
    //                           public void go() {
    //                             hero.increaseRotation(rate);
    //                           }
    //                         };
    //                       }
    //
    //                       /**
    //                       * Create an action for making a hero throw a projectile
    //                       *
    //                       * @param hero       The hero who should throw the projectile
    //                       * @param milliDelay A delay between throws, so that holding doesn't lead to too many throws at
    //                       *                   once
    //                       * @param offsetX    specifies the x distance between the bottom left of the projectile and the
    //                       *                   bottom left of the hero throwing the projectile
    //                       * @param offsetY    specifies the y distance between the bottom left of the projectile and the
    //                       *                   bottom left of the hero throwing the projectile
    //                       * @param velocityX  The X velocity of the projectile when it is thrown
    //                       * @param velocityY  The Y velocity of the projectile when it is thrown
    //                       * @return The action object
    //                       */
    //                       public LolAction makeRepeatThrow(final Hero hero, final int milliDelay, final float offsetX,
    //                         final float offsetY, final float velocityX,
    //                         final float velocityY) {
    //                           return new LolAction() {
    //                             long mLastThrow;
    //
    //                             @Override
    //                             public void go() {
    //                               long now = System.currentTimeMillis();
    //                               if (mLastThrow + milliDelay < now) {
    //                                 mLastThrow = now;
    //                                 mGame.mManager.mWorld.mProjectilePool.throwFixed(hero, offsetX, offsetY,
    //                                   velocityX, velocityY);
    //                                 }
    //                               }
    //                             };
    //                           }
    //
    //                           /**
    //                           * The default behavior for throwing is to throw in a straight line. If we instead desire that
    //                           * the projectiles have some sort of aiming to them, we need to use this method, which throws
    //                           * toward where the screen was pressed
    //                           * <p>
    //                           * Note: you probably want to use an invisible button that covers the screen...
    //                           *
    //                           * @param x          The X coordinate of the bottom left corner (in pixels)
    //                           * @param y          The Y coordinate of the bottom left corner (in pixels)
    //                           * @param width      The width of the image
    //                           * @param height     The height of the image
    //                           * @param imgName    The name of the image to display. Use "" for an invisible button
    //                           * @param h          The hero who should throw the projectile
    //                           * @param milliDelay A delay between throws, so that holding doesn't lead to too many throws at
    //                           *                   once
    //                           * @param offsetX    specifies the x distance between the bottom left of the projectile and the
    //                           *                   bottom left of the hero throwing the projectile
    //                           * @param offsetY    specifies the y distance between the bottom left of the projectile and the
    //                           *                   bottom left of the hero throwing the projectile
    //                           * @return The button that was created
    //                           */
    //                           public SceneActor addDirectionalThrowButton(int x, int y, int width, int height, String imgName,
    //                             final Hero h, final long milliDelay,
    //                             final float offsetX, final float offsetY) {
    //                               final SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
    //                               c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                               final Vector2 v = new Vector2();
    //                               c.mToggleHandler = new ToggleEventHandler() {
    //                                 public boolean go(boolean isUp, float worldX, float worldY) {
    //                                   if (isUp) {
    //                                     isHolding = false;
    //                                   } else {
    //                                     isHolding = true;
    //                                     v.x = worldX;
    //                                     v.y = worldY;
    //                                   }
    //                                   return true;
    //                                 }
    //                               };
    //                               c.mPanHandler = new PanEventHandler() {
    //                                 public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
    //                                   if (c.mToggleHandler.isHolding) {
    //                                     v.x = worldX;
    //                                     v.y = worldY;
    //                                   }
    //                                   return c.mToggleHandler.isHolding;
    //                                 }
    //                               };
    //                               mGame.mManager.mHud.addActor(c, 0);
    //                               // on toggle, we start or stop throwing; on pan, we change throw direction
    //                               mGame.mManager.mHud.mToggleControls.add(c);
    //
    //                               c.mToggleHandler.mSource = c;
    //                               c.mPanHandler.mSource = c;
    //
    //                               mGame.mManager.mWorld.mRepeatEvents.add(new LolAction() {
    //                                 long mLastThrow;
    //
    //                                 @Override
    //                                 public void go() {
    //                                   if (c.mToggleHandler.isHolding) {
    //                                     long now = System.currentTimeMillis();
    //                                     if (mLastThrow + milliDelay < now) {
    //                                       mLastThrow = now;
    //                                       mGame.mManager.mWorld.mProjectilePool.throwAt(h.mBody.getPosition().x,
    //                                       h.mBody.getPosition().y, v.x, v.y, h, offsetX, offsetY);
    //                                     }
    //                                   }
    //                                 }
    //                               });
    //                               return c;
    //                             }
    //
    //
    //                             /**
    //                             * Allow panning to view more of the screen than is currently visible
    //                             *
    //                             * @param x       The X coordinate of the bottom left corner (in pixels)
    //                             * @param y       The Y coordinate of the bottom left corner (in pixels)
    //                             * @param width   The width of the image
    //                             * @param height  The height of the image
    //                             * @param imgName The name of the image to display. Use "" for an invisible button
    //                             * @return The button that was created
    //                             */
    //                             public SceneActor addPanControl(int x, int y, int width, int height, String imgName) {
    //                               final SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
    //                               c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                               c.mPanStopHandler = new TouchEventHandler() {
    //                                 /**
    //                                 * Handle a pan stop event by restoring the chase actor, if there was one
    //                                 */
    //                                 public boolean go(float worldX, float worldY) {
    //                                   setCameraChase((WorldActor) mSource);
    //                                   mSource = null;
    //                                   return true;
    //                                 }
    //                               };
    //                               c.mPanHandler = new PanEventHandler() {
    //                                 public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
    //                                   if (mGame.mManager.mWorld.mChaseActor != null) {
    //                                     c.mPanStopHandler.mSource = mGame.mManager.mWorld.mChaseActor;
    //                                     mGame.mManager.mWorld.mChaseActor = null;
    //                                   }
    //                                   OrthographicCamera cam = mGame.mManager.mWorld.mCamera;
    //                                   Vector2 camBound = mGame.mManager.mWorld.mCamBound;
    //                                   float x = cam.position.x - deltaX * .1f * cam.zoom;
    //                                   float y = cam.position.y + deltaY * .1f * cam.zoom;
    //                                   // if x or y is too close to MAX,MAX, stick with max acceptable values
    //                                   if (x > camBound.x - mConfig.mWidth * cam.zoom / mConfig.mPixelMeterRatio / 2)
    //                                   x = camBound.x - mConfig.mWidth * cam.zoom / mConfig.mPixelMeterRatio / 2;
    //                                   if (y > camBound.y - mConfig.mHeight * cam.zoom / mConfig.mPixelMeterRatio / 2)
    //                                   y = camBound.y - mConfig.mHeight * cam.zoom / mConfig.mPixelMeterRatio / 2;
    //
    //                                   // if x or y is too close to 0,0, stick with minimum acceptable values
    //                                   //
    //                                   // NB: we do MAX before MIN, so that if we're zoomed out, we show extra space at the
    //                                   // top instead of the bottom
    //                                   if (x < mConfig.mWidth * cam.zoom / mConfig.mPixelMeterRatio / 2)
    //                                   x = mConfig.mWidth * cam.zoom / mConfig.mPixelMeterRatio / 2;
    //                                   if (y < mConfig.mHeight * cam.zoom / mConfig.mPixelMeterRatio / 2)
    //                                   y = mConfig.mHeight * cam.zoom / mConfig.mPixelMeterRatio / 2;
    //
    //                                   // update the camera position
    //                                   cam.position.set(x, y, 0);
    //                                   return true;
    //                                 }
    //                               };
    //                               c.mPanHandler.mSource = c;
    //                               c.mPanStopHandler.mSource = c;
    //                               mGame.mManager.mHud.addActor(c, 0);
    //                               return c;
    //                             }
    //
    //                             /**
    //                             * Allow pinch-to-zoom
    //                             *
    //                             * @param x       The X coordinate of the bottom left corner (in pixels)
    //                             * @param y       The Y coordinate of the bottom left corner (in pixels)
    //                             * @param width   The width of the image
    //                             * @param height  The height of the image
    //                             * @param imgName The name of the image to display. Use "" for an invisible button
    //                             * @param maxZoom The maximum zoom (out) factor. 8 is usually a good choice.
    //                             * @param minZoom The minimum zoom (int) factor. .25f is usually a good choice.
    //                             * @return The button that was created
    //                             */
    //                             public SceneActor addPinchZoomControl(float x, float y, float width, float height,
    //                               String imgName, final float maxZoom,
    //                               final float minZoom) {
    //                                 final SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
    //                                 c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                                 c.mDownHandler = new TouchEventHandler() {
    //                                   public boolean go(float worldX, float worldY) {
    //                                     // this handler is being used for up/down, so we can safely use the deltaX as a way
    //                                     // of storing the last zoom value
    //                                     c.setInfoInt((int) (mGame.mManager.mWorld.mCamera.zoom * 1000));
    //                                     return false;
    //                                   }
    //                                 };
    //                                 c.mZoomHandler = new TouchEventHandler() {
    //                                   public boolean go(float initialDistance, float distance) {
    //                                     float ratio = initialDistance / distance;
    //                                     float newZoom = ((float) c.getInfoInt()) / 1000 * ratio;
    //                                     if (newZoom > minZoom && newZoom < maxZoom)
    //                                     mGame.mManager.mWorld.mCamera.zoom = newZoom;
    //                                     return true;
    //                                   }
    //                                 };
    //                                 mGame.mManager.mHud.addActor(c, 0);
    //                                 return c;
    //                               }
    /**
    * Add an image to the heads-up display. Touching the image has no effect
    *
    * @param x       The X coordinate of the bottom left corner (in pixels)
    * @param y       The Y coordinate of the bottom left corner (in pixels)
    * @param width   The width of the image
    * @param height  The height of the image
    * @param imgName The name of the image to display. Use "" for an invisible button
    * @return The image that was created
    */
    addImage(x, y, width, height, imgName) {
        let c = new SceneActor(this.mGame.mManager.mHud, imgName, width, height);
        c.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
        this.mGame.mManager.mHud.addActor(c, 0);
        return c;
    }
    //                               /**
    //                               * Add a control with callbacks for down, up, and pan
    //                               *
    //                               * @param x       The X coordinate of the bottom left corner (in pixels)
    //                               * @param y       The Y coordinate of the bottom left corner (in pixels)
    //                               * @param width   The width of the image
    //                               * @param height  The height of the image
    //                               * @param imgName The name of the image to display. Use "" for an invisible button
    //                               * @param upCB    The callback to run when the Control is released
    //                               * @param dnCB    The callback to run when the Control is pressed
    //                               * @param mvCB    The callback to run when there is a finger move (pan) on the Control
    //                               * @return The button that was created
    //                               */
    //                               // TODO: we never test this code!
    //                               public SceneActor addPanCallbackControl(float x, float y, float width, float height,
    //                                 String imgName, final TouchEventHandler upCB,
    //                                 final TouchEventHandler dnCB,
    //                                 final TouchEventHandler mvCB) {
    //                                   final SceneActor c = new SceneActor(mGame.mManager.mHud, imgName, width, height);
    //                                   c.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                                   // Pan only consists of pan-stop and pan events. That means we can't capture a down-press or
    //                                   // up-press that isn't also involved in a move.  To overcome this limitation, we'll make
    //                                   // this BOTH a pan control and a toggle control
    //                                   c.mToggleHandler = new ToggleEventHandler() {
    //                                     public boolean go(boolean isUp, float worldX, float worldY) {
    //                                       // up event
    //                                       if (isUp) {
    //                                         upCB.go(worldX, worldY);
    //                                         isHolding = false;
    //                                       }
    //                                       // down event
    //                                       else {
    //                                         isHolding = true;
    //                                         dnCB.go(worldX, worldY);
    //                                       }
    //                                       // toggle state
    //                                       isHolding = !isUp;
    //                                       return true;
    //                                     }
    //                                   };
    //                                   c.mPanHandler = new PanEventHandler() {
    //                                     public boolean go(float worldX, float worldY, float deltaX, float deltaY) {
    //                                       // force a down event, if we didn't get one
    //                                       if (!c.mToggleHandler.isHolding) {
    //                                         c.mToggleHandler.go(false, worldX, worldY);
    //                                         return true;
    //                                       }
    //                                       // pan event
    //                                       mvCB.go(worldX, worldY);
    //                                       return true;
    //                                     }
    //                                   };
    //                                   c.mPanStopHandler = new TouchEventHandler() {
    //                                     public boolean go(float worldX, float worldY) {
    //                                       // force an up event?
    //                                       if (c.mToggleHandler.isHolding) {
    //                                         c.mToggleHandler.go(true, worldX, worldY);
    //                                         return true;
    //                                       }
    //                                       return false;
    //                                     }
    //                                   };
    //                                   c.mPanHandler.mSource = c;
    //                                   c.mPanStopHandler.mSource = c;
    //                                   c.mToggleHandler.mSource = c;
    //                                   mGame.mManager.mHud.addActor(c, 0);
    //                                   mGame.mManager.mHud.mToggleControls.add(c);
    //                                   return c;
    //                                 }
    //
    //                                 /**
    //                                 * Look up a fact that was stored for the current level. If no such fact exists, defaultVal will
    //                                 * be returned.
    //                                 *
    //                                 * @param factName   The name used to store the fact
    //                                 * @param defaultVal The default value to use if the fact cannot be found
    //                                 * @return The integer value corresponding to the last value stored
    //                                 */
    //                                 public int getLevelFact(String factName, int defaultVal) {
    //                                   Integer i = mGame.mManager.mWorld.mLevelFacts.get(factName);
    //                                   if (i == null) {
    //                                     Lol.message(mConfig, "ERROR", "Error retreiving level fact '" + factName + "'");
    //                                     return defaultVal;
    //                                   }
    //                                   return i;
    //                                 }
    //
    //                                 /**
    //                                 * Save a fact about the current level. If the factName has already been used for this level,
    //                                 * the new value will overwrite the old.
    //                                 *
    //                                 * @param factName  The name for the fact being saved
    //                                 * @param factValue The integer value that is the fact being saved
    //                                 */
    //                                 public void putLevelFact(String factName, int factValue) {
    //                                   mGame.mManager.mWorld.mLevelFacts.put(factName, factValue);
    //                                 }
    //
    //                                 /**
    //                                 * Look up a fact that was stored for the current game session. If no such fact exists, -1 will
    //                                 * be returned.
    //                                 *
    //                                 * @param factName   The name used to store the fact
    //                                 * @param defaultVal The default value to use if the fact cannot be found
    //                                 * @return The integer value corresponding to the last value stored
    //                                 */
    //                                 public int getSessionFact(String factName, int defaultVal) {
    //                                   Integer i = mGame.mManager.mSessionFacts.get(factName);
    //                                   if (i == null) {
    //                                     Lol.message(mConfig, "ERROR", "Error retreiving level fact '" + factName + "'");
    //                                     return defaultVal;
    //                                   }
    //                                   return i;
    //                                 }
    //
    //                                 /**
    //                                 * Save a fact about the current game session. If the factName has already been used for this
    //                                 * game session, the new value will overwrite the old.
    //                                 *
    //                                 * @param factName  The name for the fact being saved
    //                                 * @param factValue The integer value that is the fact being saved
    //                                 */
    //                                 public void putSessionFact(String factName, int factValue) {
    //                                   mGame.mManager.mSessionFacts.put(factName, factValue);
    //                                 }
    //
    //                                 /**
    //                                 * Look up a fact that was stored for the current game session. If no such fact exists,
    //                                 * defaultVal will be returned.
    //                                 *
    //                                 * @param factName   The name used to store the fact
    //                                 * @param defaultVal The value to return if the fact does not exist
    //                                 * @return The integer value corresponding to the last value stored
    //                                 */
    //                                 public int getGameFact(String factName, int defaultVal) {
    //                                   return Lol.getGameFact(mConfig, factName, defaultVal);
    //                                 }
    //
    //                                 /**
    //                                 * Save a fact about the current game session. If the factName has already been used for this
    //                                 * game session, the new value will overwrite the old.
    //                                 *
    //                                 * @param factName  The name for the fact being saved
    //                                 * @param factValue The integer value that is the fact being saved
    //                                 */
    //                                 public void putGameFact(String factName, int factValue) {
    //                                   Lol.putGameFact(mConfig, factName, factValue);
    //                                 }
    //
    //                                 /**
    //                                 * Look up an WorldActor that was stored for the current level. If no such WorldActor exists,
    //                                 * null will be returned.
    //                                 *
    //                                 * @param actorName The name used to store the WorldActor
    //                                 * @return The last WorldActor stored with this name
    //                                 */
    //                                 public WorldActor getLevelActor(String actorName) {
    //                                   WorldActor actor = mGame.mManager.mWorld.mLevelActors.get(actorName);
    //                                   if (actor == null) {
    //                                     Lol.message(mConfig, "ERROR", "Error retreiving level fact '" + actorName + "'");
    //                                     return null;
    //                                   }
    //                                   return actor;
    //                                 }
    //
    //                                 /**
    //                                 * Save a WorldActor from the current level. If the actorName has already been used for this
    //                                 * level, the new value will overwrite the old.
    //                                 *
    //                                 * @param actorName The name for the WorldActor being saved
    //                                 * @param actor     The WorldActor that is the fact being saved
    //                                 */
    //                                 public void putLevelActor(String actorName, WorldActor actor) {
    //                                   mGame.mManager.mWorld.mLevelActors.put(actorName, actor);
    //                                 }
    //
    //                                 /**
    //                                 * Set the background color for the current level
    //                                 *
    //                                 * @param color The color, formated as #RRGGBB
    //                                 */
    //                                 public void setBackgroundColor(String color) {
    //                                   mGame.mManager.mBackground.mColor = Color.valueOf(color);
    //                                 }
    /**
    * Set the background color for the current level
    *
    * @param color The color, formatted as a hex number
    */
    setBackgroundColor(color) {
        //this.mGame.mRenderer = PIXI.autoDetectRenderer(this.mConfig.mWidth, this.mConfig.mHeight, {backgroundColor: color});
    }
    //                                 /**
    //                                 * Add a picture that may repeat in the X dimension
    //                                 *
    //                                 * @param xSpeed  Speed that the picture seems to move in the X direction. "1" is the same speed
    //                                 *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                 * @param ySpeed  Speed that the picture seems to move in the Y direction. "1" is the same speed
    //                                 *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                 * @param imgName The name of the image file to use as the background
    //                                 * @param yOffset The default is to draw the image at y=0. This field allows the picture to be
    //                                 *                moved up or down.
    //                                 * @param width   The width of the image being used as a background layer
    //                                 * @param height  The height of the image being used as a background layer
    //                                 */
    //                                 public void addHorizontalBackgroundLayer(float xSpeed, float ySpeed, String imgName,
    //                                   float yOffset, float width, float height) {
    //                                     ParallaxLayer pl = new ParallaxLayer(xSpeed, ySpeed,
    //                                       mMedia.getImage(imgName), 0, yOffset
    //                                       * mConfig.mPixelMeterRatio, width, height);
    //                                       pl.mXRepeat = xSpeed != 0;
    //                                       mGame.mManager.mBackground.mLayers.add(pl);
    //                                     }
    //
    //                                     /**
    //                                     * Add a picture that may repeat in the X dimension, and which moves automatically
    //                                     *
    //                                     * @param xSpeed  Speed, in pixels per second
    //                                     * @param imgName The name of the image file to use as the background
    //                                     * @param yOffset The default is to draw the image at y=0. This field allows the picture to be
    //                                     *                moved up or down.
    //                                     * @param width   The width of the image being used as a background layer
    //                                     * @param height  The height of the image being used as a background layer
    //                                     */
    //                                     public void addHorizontalAutoBackgroundLayer(float xSpeed, String imgName,
    //                                       float yOffset, float width, float height) {
    //                                         ParallaxLayer pl = new ParallaxLayer(xSpeed, 0,
    //                                           mMedia.getImage(imgName), 0, yOffset
    //                                           * mConfig.mPixelMeterRatio, width, height);
    //                                           pl.mAutoX = true;
    //                                           pl.mXRepeat = xSpeed != 0;
    //                                           mGame.mManager.mBackground.mLayers.add(pl);
    //                                         }
    //
    //                                         /**
    //                                         * Add a picture that may repeat in the Y dimension
    //                                         *
    //                                         * @param xSpeed  Speed that the picture seems to move in the X direction. "1" is the same speed
    //                                         *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                         * @param ySpeed  Speed that the picture seems to move in the Y direction. "1" is the same speed
    //                                         *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                         * @param imgName The name of the image file to use as the background
    //                                         * @param xOffset The default is to draw the image at x=0. This field allows the picture to be
    //                                         *                moved left or right.
    //                                         * @param width   The width of the image being used as a background layer
    //                                         * @param height  The height of the image being used as a background layer
    //                                         */
    //                                         public void addVerticalBackgroundLayer(float xSpeed, float ySpeed, String imgName,
    //                                           float xOffset, float width, float height) {
    //                                             ParallaxLayer pl = new ParallaxLayer(xSpeed, ySpeed,
    //                                               mMedia.getImage(imgName),
    //                                               xOffset * mConfig.mPixelMeterRatio, 0, width, height);
    //                                               pl.mYRepeat = ySpeed != 0;
    //                                               mGame.mManager.mBackground.mLayers.add(pl);
    //                                             }
    //
    //                                             /**
    //                                             * Create a particle effect system
    //                                             *
    //                                             * @param filename The file holding the particle definition
    //                                             * @param zIndex   The z index of the particle system.
    //                                             * @param x        The x coordinate of the starting point of the particle system
    //                                             * @param y        The y coordinate of the starting point of the particle system
    //                                             * @return the Effect, so that it can be modified further
    //                                             */
    //                                             public Effect makeParticleSystem(String filename, int zIndex, float x, float y) {
    //                                               Effect e = new Effect();
    //
    //                                               // create the particle effect system.
    //                                               ParticleEffect pe = new ParticleEffect();
    //                                               pe.load(Gdx.files.internal(filename), Gdx.files.internal(""));
    //                                               e.mParticleEffect = pe;
    //
    //                                               // update the effect's coordinates to reflect world coordinates
    //                                               pe.getEmitters().first().setPosition(x, y);
    //
    //                                               // NB: we pretend effects are Actors, so that we can have them in front of or behind Actors
    //                                               mGame.mManager.mWorld.addActor(e, zIndex);
    //
    //                                               // start emitting particles
    //                                               pe.start();
    //                                               return e;
    //                                             }
    //
    //                                             /**
    //                                             * Add a picture that may repeat in the X dimension
    //                                             *
    //                                             * @param xSpeed  Speed that the picture seems to move in the X direction. "1" is the same speed
    //                                             *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                             * @param ySpeed  Speed that the picture seems to move in the Y direction. "1" is the same speed
    //                                             *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                             * @param imgName The name of the image file to use as the foreground
    //                                             * @param yOffset The default is to draw the image at y=0. This field allows the picture to be
    //                                             *                moved up or down.
    //                                             * @param width   The width of the image being used as a foreground layer
    //                                             * @param height  The height of the image being used as a foreground layer
    //                                             */
    //                                             public void addHorizontalForegroundLayer(float xSpeed, float ySpeed, String imgName,
    //                                               float yOffset, float width, float height) {
    //                                                 ParallaxLayer pl = new ParallaxLayer(xSpeed, ySpeed,
    //                                                   mMedia.getImage(imgName), 0, yOffset
    //                                                   * mConfig.mPixelMeterRatio, width, height);
    //                                                   pl.mXRepeat = xSpeed != 0;
    //                                                   mGame.mManager.mForeground.mLayers.add(pl);
    //                                                 }
    //
    //                                                 /**
    //                                                 * Add a picture that may repeat in the X dimension, and which moves automatically
    //                                                 *
    //                                                 * @param xSpeed  Speed, in pixels per second
    //                                                 * @param imgName The name of the image file to use as the foreground
    //                                                 * @param yOffset The default is to draw the image at y=0. This field allows the picture to be
    //                                                 *                moved up or down.
    //                                                 * @param width   The width of the image being used as a foreground layer
    //                                                 * @param height  The height of the image being used as a foreground layer
    //                                                 */
    //                                                 public void addHorizontalAutoForegroundLayer(float xSpeed, String imgName,
    //                                                   float yOffset, float width, float height) {
    //                                                     ParallaxLayer pl = new ParallaxLayer(xSpeed, 0,
    //                                                       mMedia.getImage(imgName), 0, yOffset
    //                                                       * mConfig.mPixelMeterRatio, width, height);
    //                                                       pl.mAutoX = true;
    //                                                       pl.mXRepeat = xSpeed != 0;
    //                                                       mGame.mManager.mForeground.mLayers.add(pl);
    //                                                     }
    //
    //                                                     /**
    //                                                     * Add a picture that may repeat in the Y dimension
    //                                                     *
    //                                                     * @param xSpeed  Speed that the picture seems to move in the Y direction. "1" is the same speed
    //                                                     *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                                     * @param ySpeed  Speed that the picture seems to move in the Y direction. "1" is the same speed
    //                                                     *                as the hero; "0" is not at all; ".5f" is at half the hero's speed
    //                                                     * @param imgName The name of the image file to use as the foreground
    //                                                     * @param xOffset The default is to draw the image at x=0. This field allows the picture to be
    //                                                     *                moved left or right.
    //                                                     * @param width   The width of the image being used as a foreground layer
    //                                                     * @param height  The height of the image being used as a foreground layer
    //                                                     */
    //                                                     public void addVerticalForegroundLayer(float xSpeed, float ySpeed, String imgName,
    //                                                       float xOffset, float width, float height) {
    //                                                         ParallaxLayer pl = new ParallaxLayer(xSpeed, ySpeed,
    //                                                           mMedia.getImage(imgName),
    //                                                           xOffset * mConfig.mPixelMeterRatio, 0, width, height);
    //                                                           pl.mYRepeat = ySpeed != 0;
    //                                                           mGame.mManager.mForeground.mLayers.add(pl);
    //                                                         }
    //
    //                                                         /**
    //                                                         * Get the LoseScene that is configured for the current level, or create a blank one if none
    //                                                         * exists.
    //                                                         *
    //                                                         * @return The current LoseScene
    //                                                         */
    //                                                         public QuickScene getLoseScene() {
    //                                                           return mGame.mManager.mLoseScene;
    //                                                         }
    //
    //                                                         /**
    //                                                         * Get the PreScene that is configured for the current level, or create a blank one if none
    //                                                         * exists.
    //                                                         *
    //                                                         * @return The current PreScene
    //                                                         */
    //                                                         public QuickScene getPreScene() {
    //                                                           mGame.mManager.mPreScene.mVisible = true;
    //                                                           mGame.mManager.mPreScene.suspendClock();
    //                                                           return mGame.mManager.mPreScene;
    //                                                         }
    //
    //                                                         /**
    //                                                         * Get the PauseScene that is configured for the current level, or create a blank one if none
    //                                                         * exists.
    //                                                         *
    //                                                         * @return The current PauseScene
    //                                                         */
    //                                                         public QuickScene getPauseScene() {
    //                                                           return mGame.mManager.mPauseScene;
    //                                                         }
    //
    //                                                         /**
    //                                                         * Get the WinScene that is configured for the current level, or create a blank one if none
    //                                                         * exists.
    //                                                         *
    //                                                         * @return The current WinScene
    //                                                         */
    //                                                         public QuickScene getWinScene() {
    //                                                           return mGame.mManager.mWinScene;
    //                                                         }
    /**
    * Make an enemy that has an underlying rectangular shape.
    *
    * @param x       The X coordinate of the bottom left corner
    * @param y       The Y coordinate of the bottom right corner
    * @param width   The width of the enemy
    * @param height  The height of the enemy
    * @param imgName The name of the image to display
    * @return The enemy, so that it can be modified further
    */
    makeEnemyAsBox(x, y, width, height, imgName) {
        let e = new Enemy(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
        this.mGame.mManager.mEnemiesCreated++;
        e.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
        this.mGame.mManager.mWorld.addActor(e, 0);
        return e;
    }
    //
    //                                                         /**
    //                                                         * Draw an enemy with an underlying polygon shape
    //                                                         *
    //                                                         * @param x       X coordinate of the bottom left corner
    //                                                         * @param y       Y coordinate of the bottom left corner
    //                                                         * @param width   Width of the obstacle
    //                                                         * @param height  Height of the obstacle
    //                                                         * @param imgName Name of image file to use
    //                                                         * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
    //                                                         *                x0,y0,x1,y1,x2,y2,...
    //                                                         * @return The enemy, so that it can be further modified
    //                                                         */
    //                                                         public Enemy makeEnemyAsPolygon(float x, float y, float width, float height, String imgName,
    //                                                           float... verts) {
    //                                                             Enemy e = new Enemy(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                             mGame.mManager.mEnemiesCreated++;
    //                                                             e.setPolygonPhysics(BodyDef.BodyType.StaticBody, x, y, verts);
    //                                                             mGame.mManager.mWorld.addActor(e, 0);
    //                                                             return e;
    //                                                           }
    //
    //                                                           /**
    //                                                           * Make an enemy that has an underlying circular shape.
    //                                                           *
    //                                                           * @param x       The X coordinate of the bottom left corner
    //                                                           * @param y       The Y coordinate of the bottom right corner
    //                                                           * @param width   The width of the enemy
    //                                                           * @param height  The height of the enemy
    //                                                           * @param imgName The name of the image to display
    //                                                           * @return The enemy, so that it can be modified further
    //                                                           */
    //                                                           public Enemy makeEnemyAsCircle(float x, float y, float width, float height, String imgName) {
    //                                                             float radius = Math.max(width, height);
    //                                                             Enemy e = new Enemy(mGame, mGame.mManager.mWorld, radius, radius, imgName);
    //                                                             mGame.mManager.mEnemiesCreated++;
    //                                                             e.setCirclePhysics(BodyDef.BodyType.StaticBody, x, y, radius / 2);
    //                                                             mGame.mManager.mWorld.addActor(e, 0);
    //                                                             return e;
    //                                                           }
    //
    /**
    * Make a destination that has an underlying rectangular shape.
    *
    * @param x       The X coordinate of the bottom left corner
    * @param y       The Y coordinate of the bottom right corner
    * @param width   The width of the destination
    * @param height  The height of the destination
    * @param imgName The name of the image to display
    * @return The destination, so that it can be modified further
    */
    makeDestinationAsBox(x, y, width, height, imgName) {
        let d = new Destination(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
        d.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
        d.setCollisionsEnabled(false);
        this.mGame.mManager.mWorld.addActor(d, 0);
        return d;
    }
    //                                                             /**
    //                                                             * Draw a destination with an underlying polygon shape
    //                                                             *
    //                                                             * @param x       X coordinate of the bottom left corner
    //                                                             * @param y       Y coordinate of the bottom left corner
    //                                                             * @param width   Width of the obstacle
    //                                                             * @param height  Height of the obstacle
    //                                                             * @param imgName Name of image file to use
    //                                                             * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
    //                                                             *                x0,y0,x1,y1,x2,y2,...
    //                                                             * @return The destination, so that it can be further modified
    //                                                             */
    //                                                             public Destination makeDestinationAsPolygon(float x, float y, float width, float height,
    //                                                               String imgName, float... verts) {
    //                                                                 Destination d = new Destination(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                 d.setPolygonPhysics(BodyDef.BodyType.StaticBody, x, y, verts);
    //                                                                 d.setCollisionsEnabled(false);
    //                                                                 mGame.mManager.mWorld.addActor(d, 0);
    //                                                                 return d;
    //                                                               }
    //
    //                                                               /**
    //                                                               * Make a destination that has an underlying circular shape.
    //                                                               *
    //                                                               * @param x       The X coordinate of the bottom left corner
    //                                                               * @param y       The Y coordinate of the bottom right corner
    //                                                               * @param width   The width of the destination
    //                                                               * @param height  The height of the destination
    //                                                               * @param imgName The name of the image to display
    //                                                               * @return The destination, so that it can be modified further
    //                                                               */
    //                                                               public Destination makeDestinationAsCircle(float x, float y, float width, float height,
    //                                                                 String imgName) {
    //                                                                   float radius = Math.max(width, height);
    //                                                                   Destination d = new Destination(mGame, mGame.mManager.mWorld, radius, radius, imgName);
    //                                                                   d.setCirclePhysics(BodyDef.BodyType.StaticBody, x, y, radius / 2);
    //                                                                   d.setCollisionsEnabled(false);
    //                                                                   mGame.mManager.mWorld.addActor(d, 0);
    //                                                                   return d;
    //                                                                 }
    //
    /**
    * Draw an obstacle with an underlying box shape
    *
    * @param x       X coordinate of the bottom left corner
    * @param y       Y coordinate of the bottom left corner
    * @param width   Width of the obstacle
    * @param height  Height of the obstacle
    * @param imgName Name of image file to use
    * @return The obstacle, so that it can be further modified
    */
    makeObstacleAsBox(x, y, width, height, imgName) {
        let o = new Obstacle(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
        o.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, x, y);
        this.mGame.mManager.mWorld.addActor(o, 0);
        return o;
    }
    //
    //                                                                 /**
    //                                                                 * Draw an obstacle with an underlying polygon shape
    //                                                                 *
    //                                                                 * @param x       X coordinate of the bottom left corner
    //                                                                 * @param y       Y coordinate of the bottom left corner
    //                                                                 * @param width   Width of the obstacle
    //                                                                 * @param height  Height of the obstacle
    //                                                                 * @param imgName Name of image file to use
    //                                                                 * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
    //                                                                 *                x0,y0,x1,y1,x2,y2,...
    //                                                                 * @return The obstacle, so that it can be further modified
    //                                                                 */
    //                                                                 public Obstacle makeObstacleAsPolygon(float x, float y, float width, float height,
    //                                                                   String imgName, float... verts) {
    //                                                                     Obstacle o = new Obstacle(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                     o.setPolygonPhysics(BodyDef.BodyType.StaticBody, x, y, verts);
    //                                                                     mGame.mManager.mWorld.addActor(o, 0);
    //                                                                     return o;
    //                                                                   }
    //
    //                                                                   /**
    //                                                                   * Draw an obstacle with an underlying circle shape
    //                                                                   *
    //                                                                   * @param x       X coordinate of the bottom left corner
    //                                                                   * @param y       Y coordinate of the bottom left corner
    //                                                                   * @param width   Width of the obstacle
    //                                                                   * @param height  Height of the obstacle
    //                                                                   * @param imgName Name of image file to use
    //                                                                   * @return The obstacle, so that it can be further modified
    //                                                                   */
    //                                                                   public Obstacle makeObstacleAsCircle(float x, float y, float width, float height,
    //                                                                     String imgName) {
    //                                                                       float radius = Math.max(width, height);
    //                                                                       Obstacle o = new Obstacle(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                       o.setCirclePhysics(BodyDef.BodyType.StaticBody, x, y, radius / 2);
    //                                                                       mGame.mManager.mWorld.addActor(o, 0);
    //                                                                       return o;
    //                                                                     }
    //
    //                                                                     /**
    //                                                                     * Draw a goodie with an underlying box shape, and a default score of [1,0,0,0]
    //                                                                     *
    //                                                                     * @param x       X coordinate of bottom left corner
    //                                                                     * @param y       Y coordinate of bottom left corner
    //                                                                     * @param width   Width of the image
    //                                                                     * @param height  Height of the image
    //                                                                     * @param imgName Name of image file to use
    //                                                                     * @return The goodie, so that it can be further modified
    //                                                                     */
    //                                                                     public Goodie makeGoodieAsBox(float x, float y, float width, float height, String imgName) {
    //                                                                       Goodie g = new Goodie(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                       g.setBoxPhysics(BodyDef.BodyType.StaticBody, x, y);
    //                                                                       g.setCollisionsEnabled(false);
    //                                                                       mGame.mManager.mWorld.addActor(g, 0);
    //                                                                       return g;
    //                                                                     }
    //
    //                                                                     /**
    //                                                                     * Draw a goodie with an underlying circle shape, and a default score of [1,0,0,0]
    //                                                                     *
    //                                                                     * @param x       X coordinate of bottom left corner
    //                                                                     * @param y       Y coordinate of bottom left corner
    //                                                                     * @param width   Width of the image
    //                                                                     * @param height  Height of the image
    //                                                                     * @param imgName Name of image file to use
    //                                                                     * @return The goodie, so that it can be further modified
    //                                                                     */
    //                                                                     public Goodie makeGoodieAsCircle(float x, float y, float width, float height, String imgName) {
    //                                                                       float radius = Math.max(width, height);
    //                                                                       Goodie g = new Goodie(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                       g.setCirclePhysics(BodyDef.BodyType.StaticBody, x, y, radius / 2);
    //                                                                       g.setCollisionsEnabled(false);
    //                                                                       mGame.mManager.mWorld.addActor(g, 0);
    //                                                                       return g;
    //                                                                     }
    //
    //                                                                     /**
    //                                                                     * Draw a goodie with an underlying polygon shape
    //                                                                     *
    //                                                                     * @param x       X coordinate of the bottom left corner
    //                                                                     * @param y       Y coordinate of the bottom left corner
    //                                                                     * @param width   Width of the obstacle
    //                                                                     * @param height  Height of the obstacle
    //                                                                     * @param imgName Name of image file to use
    //                                                                     * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
    //                                                                     *                x0,y0,x1,y1,x2,y2,...
    //                                                                     * @return The goodie, so that it can be further modified
    //                                                                     */
    //                                                                     public Goodie makeGoodieAsPolygon(float x, float y, float width, float height, String imgName,
    //                                                                       float... verts) {
    //                                                                         Goodie g = new Goodie(mGame, mGame.mManager.mWorld, width, height, imgName);
    //                                                                         g.setPolygonPhysics(BodyDef.BodyType.StaticBody, x, y, verts);
    //                                                                         g.setCollisionsEnabled(false);
    //                                                                         mGame.mManager.mWorld.addActor(g, 0);
    //                                                                         return g;
    //                                                                       }
    //
    /**
    * Make a Hero with an underlying rectangular shape
    *
    * @param x       X coordinate of the hero
    * @param y       Y coordinate of the hero
    * @param width   width of the hero
    * @param height  height of the hero
    * @param imgName File name of the default image to display
    * @return The hero that was created
    */
    makeHeroAsBox(x, y, width, height, imgName) {
        let h = new Hero(this.mGame, this.mGame.mManager.mWorld, width, height, imgName);
        this.mGame.mManager.mHeroesCreated++;
        h.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y);
        this.mGame.mManager.mWorld.addActor(h, 0);
        return h;
    }
    // /**
    // * Make a Hero with an underlying circular shape
    // *
    // * @param x       X coordinate of the hero
    // * @param y       Y coordinate of the hero
    // * @param width   width of the hero
    // * @param height  height of the hero
    // * @param imgName File name of the default image to display
    // * @return The hero that was created
    // */
    // public Hero makeHeroAsCircle(float x, float y, float width, float height, String imgName) {
    //   float radius = Math.max(width, height);
    //   Hero h = new Hero(mGame, mGame.mManager.mWorld, width, height, imgName);
    //   mGame.mManager.mHeroesCreated++;
    //   h.setCirclePhysics(BodyDef.BodyType.DynamicBody, x, y, radius / 2);
    //   mGame.mManager.mWorld.addActor(h, 0);
    //   return h;
    // }
    // /**
    // * Draw a hero with an underlying polygon shape
    // *
    // * @param x       X coordinate of the bottom left corner
    // * @param y       Y coordinate of the bottom left corner
    // * @param width   Width of the obstacle
    // * @param height  Height of the obstacle
    // * @param imgName Name of image file to use
    // * @param verts   Up to 16 coordinates representing the vertexes of this polygon, listed as
    // *                x0,y0,x1,y1,x2,y2,...
    // * @return The hero, so that it can be further modified
    // */
    // public Hero makeHeroAsPolygon(float x, float y, float width, float height, String imgName,
    //   float... verts) {
    //     Hero h = new Hero(mGame, mGame.mManager.mWorld, width, height, imgName);
    //     mGame.mManager.mHeroesCreated++;
    //     h.setPolygonPhysics(BodyDef.BodyType.StaticBody, x, y, verts);
    //     mGame.mManager.mWorld.addActor(h, 0);
    //     return h;
    //   }
    //                                                                         /**
    //                                                                         * Specify a limit on how far away from the Hero a projectile can go.  Without this, projectiles
    //                                                                         * could keep on traveling forever.
    //                                                                         *
    //                                                                         * @param distance Maximum distance from the hero that a projectile can travel
    //                                                                         */
    //                                                                         public void setProjectileRange(float distance) {
    //                                                                           for (Projectile p : mGame.mManager.mWorld.mProjectilePool.mPool)
    //                                                                           p.mRange = distance;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Indicate that projectiles should feel the effects of gravity. Otherwise, they will be (more
    //                                                                         * or less) immune to gravitational forces.
    //                                                                         */
    //                                                                         public void setProjectileGravityOn() {
    //                                                                           for (Projectile p : mGame.mManager.mWorld.mProjectilePool.mPool)
    //                                                                           p.mBody.setGravityScale(1);
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Specify the image file from which to randomly choose projectile images
    //                                                                         *
    //                                                                         * @param imgName The file to use when picking images
    //                                                                         */
    //                                                                         // TODO: this is probably broken now that we removed Animatable images
    //                                                                         public void setProjectileImageSource(String imgName) {
    //                                                                           for (Projectile p : mGame.mManager.mWorld.mProjectilePool.mPool)
    //                                                                           p.mAnimator.updateImage(mGame.mMedia, imgName);
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mRandomizeImages = true;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * The "directional projectile" mechanism might lead to the projectiles moving too fast. This
    //                                                                         * will cause the speed to be multiplied by a factor
    //                                                                         *
    //                                                                         * @param factor The value to multiply against the projectile speed.
    //                                                                         */
    //                                                                         public void setProjectileVectorDampeningFactor(float factor) {
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mDirectionalDamp = factor;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Indicate that all projectiles should participate in collisions, rather than disappearing when
    //                                                                         * they collide with other actors
    //                                                                         */
    //                                                                         public void enableCollisionsForProjectiles() {
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mSensorProjectiles = false;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Indicate that projectiles thrown with the "directional" mechanism should have a fixed
    //                                                                         * velocity
    //                                                                         *
    //                                                                         * @param velocity The magnitude of the velocity for projectiles
    //                                                                         */
    //                                                                         public void setFixedVectorThrowVelocityForProjectiles(float velocity) {
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mEnableFixedVectorVelocity = true;
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mFixedVectorVelocity = velocity;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Indicate that projectiles thrown via the "directional" mechanism should be rotated to face in
    //                                                                         * their direction or movement
    //                                                                         */
    //                                                                         public void setRotateVectorThrowForProjectiles() {
    //                                                                           mGame.mManager.mWorld.mProjectilePool.mRotateVectorThrow = true;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Indicate that when two projectiles collide, they should both remain on screen
    //                                                                         */
    //                                                                         public void setCollisionOkForProjectiles() {
    //                                                                           for (Projectile p : mGame.mManager.mWorld.mProjectilePool.mPool)
    //                                                                           p.mDisappearOnCollide = false;
    //                                                                         }
    //
    //                                                                         /**
    //                                                                         * Describe the behavior of projectiles in a scene. You must call this if you intend to use
    //                                                                         * projectiles in your scene.
    //                                                                         *
    //                                                                         * @param size     number of projectiles that can be thrown at once
    //                                                                         * @param width    width of a projectile
    //                                                                         * @param height   height of a projectile
    //                                                                         * @param imgName  image to use for projectiles
    //                                                                         * @param strength specifies the amount of damage that a projectile does to an enemy
    //                                                                         * @param zIndex   The z plane on which the projectiles should be drawn
    //                                                                         * @param isCircle Should projectiles have an underlying circle or box shape?
    //                                                                         */
    //                                                                         public void configureProjectiles(int size, float width, float height, String imgName,
    //                                                                           int strength, int zIndex, boolean isCircle) {
    //                                                                             mGame.mManager.mWorld.mProjectilePool = new ProjectilePool(mGame, mGame.mManager.mWorld,
    //                                                                               size, width, height, imgName, strength, zIndex, isCircle);
    //                                                                             }
    //
    //                                                                             /**
    //                                                                             * Set a limit on the total number of projectiles that can be thrown
    //                                                                             *
    //                                                                             * @param number How many projectiles are available
    //                                                                             */
    //                                                                             public void setNumberOfProjectiles(int number) {
    //                                                                               mGame.mManager.mWorld.mProjectilePool.mProjectilesRemaining = number;
    //                                                                             }
    //
    //                                                                             /**
    //                                                                             * Specify a sound to play when the projectile is thrown
    //                                                                             *
    //                                                                             * @param soundName Name of the sound file to play
    //                                                                             */
    //                                                                             public void setThrowSound(String soundName) {
    //                                                                               mGame.mManager.mWorld.mProjectilePool.mThrowSound = mMedia.getSound(soundName);
    //                                                                             }
    //
    //                                                                             /**
    //                                                                             * Specify the sound to play when a projectile disappears
    //                                                                             *
    //                                                                             * @param soundName the name of the sound file to play
    //                                                                             */
    //                                                                             public void setProjectileDisappearSound(String soundName) {
    //                                                                               mGame.mManager.mWorld.mProjectilePool.mProjectileDisappearSound =
    //                                                                               mMedia.getSound(soundName);
    //                                                                             }
    //
    //                                                                             /**
    //                                                                             * Specify how projectiles should be animated
    //                                                                             *
    //                                                                             * @param animation The animation object to use for each projectile that is thrown
    //                                                                             */
    //                                                                             public void setProjectileAnimation(Animation animation) {
    //                                                                               for (Projectile p : mGame.mManager.mWorld.mProjectilePool.mPool)
    //                                                                               p.setDefaultAnimation(animation);
    //                                                                             }
    //
    //                                                                             /**
    //                                                                             * Draw a box on the scene
    //                                                                             * <p>
    //                                                                             * Note: the box is actually four narrow rectangles
    //                                                                             *
    //                                                                             * @param x0         X coordinate of top left corner
    //                                                                             * @param y0         Y coordinate of top left corner
    //                                                                             * @param x1         X coordinate of bottom right corner
    //                                                                             * @param y1         Y coordinate of bottom right corner
    //                                                                             * @param imgName    name of the image file to use when drawing the rectangles
    //                                                                             * @param density    Density of the rectangle. When in doubt, use 1
    //                                                                             * @param elasticity Elasticity of the rectangle. When in doubt, use 0
    //                                                                             * @param friction   Friction of the rectangle. When in doubt, use 1
    //                                                                             */
    //                                                                             public void drawBoundingBox(float x0, float y0, float x1, float y1, String imgName,
    //                                                                               float density, float elasticity, float friction) {
    //                                                                                 Obstacle bottom = makeObstacleAsBox(x0 - 1, y0 - 1, Math.abs(x0 - x1) + 2, 1, imgName);
    //                                                                                 bottom.setPhysics(density, elasticity, friction);
    //
    //                                                                                 Obstacle top = makeObstacleAsBox(x0 - 1, y1, Math.abs(x0 - x1) + 2, 1, imgName);
    //                                                                                 top.setPhysics(density, elasticity, friction);
    //
    //                                                                                 Obstacle left = makeObstacleAsBox(x0 - 1, y0 - 1, 1, Math.abs(y0 - y1) + 2, imgName);
    //                                                                                 left.setPhysics(density, elasticity, friction);
    //
    //                                                                                 Obstacle right = makeObstacleAsBox(x1, y0 - 1, 1, Math.abs(y0 - y1) + 2, imgName);
    //                                                                                 right.setPhysics(density, elasticity, friction);
    //                                                                               }
    //
    //                                                                               /**
    //                                                                               * Load an SVG line drawing generated from Inkscape. The SVG will be loaded as a bunch of
    //                                                                               * Obstacles. Note that not all Inkscape drawings will work as expected... if you need more
    //                                                                               * power than this provides, you'll have to modify Svg.java
    //                                                                               *
    //                                                                               * @param svgName    Name of the svg file to load. It should be in the assets folder
    //                                                                               * @param stretchX   Stretch the drawing in the X dimension by this percentage
    //                                                                               * @param stretchY   Stretch the drawing in the Y dimension by this percentage
    //                                                                               * @param transposeX Shift the drawing in the X dimension. NB: shifting occurs after stretching
    //                                                                               * @param transposeY Shift the drawing in the Y dimension. NB: shifting occurs after stretching
    //                                                                               * @param callback   A callback for customizing each (obstacle) line segment of the SVG
    //                                                                               */
    //                                                                               public void importLineDrawing(String svgName, float stretchX, float stretchY,
    //                                                                                 float transposeX, float transposeY, LolActorEvent callback) {
    //                                                                                   // Create an SVG object to hold all the parameters, then use it to parse the file
    //                                                                                   Svg s = new Svg(this, stretchX, stretchY, transposeX, transposeY, callback);
    //                                                                                   s.parse(svgName);
    //                                                                                 }
    //
    //                                                                                 /**
    //                                                                                 * Use this to manage the state of Mute
    //                                                                                 */
    //                                                                                 public void toggleMute() {
    //                                                                                   // volume is either 1 or 0
    //                                                                                   if (getGameFact("volume", 1) == 1) {
    //                                                                                     // set volume to 0, set image to 'unmute'
    //                                                                                     putGameFact("volume", 0);
    //                                                                                   } else {
    //                                                                                     // set volume to 1, set image to 'mute'
    //                                                                                     putGameFact("volume", 1);
    //                                                                                   }
    //                                                                                   // update all music
    //                                                                                   mMedia.resetMusicVolume();
    //                                                                                 }
    //
    //                                                                                 /**
    //                                                                                 * Use this to determine if the game is muted or not. True corresponds to not muted, false
    //                                                                                 * corresponds to muted.
    //                                                                                 */
    //                                                                                 public boolean getVolume() {
    //                                                                                   return getGameFact("volume", 1) == 1;
    //                                                                                 }
    // /**
    // * Draw a picture on the current level
    // * <p>
    // * Note: the order in which this is called relative to other actors will determine whether they
    // * go under or over this picture.
    // *
    // * @param x       X coordinate of bottom left corner
    // * @param y       Y coordinate of bottom left corner
    // * @param width   Width of the picture
    // * @param height  Height of this picture
    // * @param imgName Name of the picture to display
    // * @param zIndex  The z index of the image. There are 5 planes: -2, -2, 0, 1, and 2. By default,
    // *                everything goes to plane 0
    // */
    // public void drawPicture(final float x, final float y, final float width, final float height,
    //   final String imgName, int zIndex) {
    //     mGame.mManager.mWorld.makePicture(x, y, width, height, imgName, zIndex);
    //   }
    // /**
    // * Draw some text in the scene, using a bottom-left coordinate
    // *
    // * @param x         The x coordinate of the bottom left corner
    // * @param y         The y coordinate of the bottom left corner
    // * @param fontName  The name of the font to use
    // * @param fontColor The color of the font
    // * @param fontSize  The size of the font
    // * @param prefix    Prefix text to put before the generated text
    // * @param suffix    Suffix text to put after the generated text
    // * @param tp        A TextProducer that will generate the text to display
    // * @param zIndex    The z index of the text
    // * @return A Renderable of the text, so it can be enabled/disabled by program code
    // */
    // public Renderable addText(float x, float y, String fontName, String fontColor, int fontSize,
    //   String prefix, String suffix, TextProducer tp, int zIndex) {
    //     return mGame.mManager.mWorld.addText(x, y, fontName, fontColor, fontSize, prefix, suffix,
    //       tp, zIndex);
    //     }
    /**
    * Draw some text in the scene, using a bottom-left coordinate
    *
    * @param x         The x coordinate of the bottom left corner
    * @param y         The y coordinate of the bottom left corner
    * @param fontName  The name of the font to use
    * @param fontColor The color of the font
    * @param fontSize  The size of the font
    * @param text      Text text to put before the generated text
    * @param zIndex    The z index of the text
    * @return A Renderable of the text, so it can be enabled/disabled by program code
    */
    addStaticText(x, y, fontName, fontColor, fontSize, text, zIndex) {
        return this.mGame.mManager.mWorld.addStaticText(x, y, fontName, fontColor, fontSize, text, zIndex);
    }
    // /**
    // * Draw some text in the scene, centering it on a specific point
    // *
    // * @param centerX   The x coordinate of the center
    // * @param centerY   The y coordinate of the center
    // * @param fontName  The name of the font to use
    // * @param fontColor The color of the font
    // * @param fontSize  The size of the font
    // * @param prefix    Prefix text to put before the generated text
    // * @param suffix    Suffix text to put after the generated text
    // * @param tp        A TextProducer that will generate the text to display
    // * @param zIndex    The z index of the text
    // * @return A Renderable of the text, so it can be enabled/disabled by program code
    // */
    // public Renderable addTextCentered(float centerX, float centerY, String fontName,
    //   String fontColor, int fontSize, String prefix, String suffix,
    //   TextProducer tp, int zIndex) {
    //     return mGame.mManager.mWorld.addTextCentered(centerX, centerY, fontName, fontColor,
    //       fontSize, prefix, suffix, tp, zIndex);
    //     }
    //                                                                                           /**
    //                                                                                           * Generate a random number x in the range [0,max)
    //                                                                                           *
    //                                                                                           * @param max The largest number returned will be one less than max
    //                                                                                           * @return a random integer
    //                                                                                           */
    //                                                                                           public int getRandom(int max) {
    //                                                                                             return mGame.mManager.mWorld.mGenerator.nextInt(max);
    //                                                                                           }
    //
    //                                                                                           /**
    //                                                                                           * Report whether all levels should be treated as unlocked. This is useful in Chooser, where we
    //                                                                                           * might need to prevent some levels from being played.
    //                                                                                           */
    //                                                                                           public boolean getUnlockMode() {
    //                                                                                             return mConfig.mUnlockAllLevels;
    //                                                                                           }
    /**
    * load the splash screen
    */
    doSplash() {
        this.mGame.mManager.doSplash();
    }
    /**
    * load the level-chooser screen. Note that when the chooser is disabled, we jump straight to
    * level 1.
    *
    * @param whichChooser The chooser screen to create
    */
    doChooser(whichChooser) {
        this.mGame.mManager.doChooser(whichChooser);
    }
    /**
    * load a playable level.
    *
    * @param which The index of the level to load
    */
    doLevel(which) {
        this.mGame.mManager.doPlay(which);
    }
    /**
    * load a help level.
    *
    * @param which The index of the help level to load
    */
    doHelp(which) {
        this.mGame.mManager.doHelp(which);
    }
}
/// <reference path="./Level.ts"/>
/// <reference path="./ScreenManager.ts"/>
/**
* Config stores game-specific configuration values.
* <p>
* A programmer should extend Config, and change these values in their class constructor.
*/
class Config {
    constructor() { }
}
/**
 * TouchEventHandler is a wrapper for code that ought to run in response to a touch event.
 *
 * We can use TouchEventHandlers to specify how a game should respond to a taps, pan stops, and
 * other touch events
 */
class TouchEventHandler {
    constructor() {
        /// A flag to control whether the event is allowed to execute or not
        this.mIsActive = true;
        /// The actor who generated this touch event
        this.mSource = null;
    }
}
/// <reference path="./BaseActor.ts"/>
/// <reference path="./TouchEventHandler.ts"/>
//// <reference path="./Lol.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class WorldActor extends BaseActor {
    /**
    * Create a new actor that does not yet have physics, but that has a renderable picture
    *
    * @param game    The currently active game
    * @param scene   The scene into which the actor is being placed
    * @param imgName The image to display
    * @param width   The width
    * @param height  The height
    */
    constructor(game, scene, imgName, width, height) {
        super(scene, imgName, width, height);
        /// When the camera follows the actor without centering on it, this gives us the difference
        /// between the actor and camera
        this.mCameraOffset = new PhysicsType2d.Vector2(0, 0);
        /// Track if Heros stick to this WorldActor. The array has 4 positions, corresponding to top,
        /// right, bottom, left
        //boolean[] mIsSticky = new boolean[4];
        /// Disable 3 of 4 sides of a Actors, to allow walking through walls. The value reflects the
        /// side that remains active. 0 is top, 1 is right, 2 is bottom, 3 is left
        this.mIsOneSided = -1;
        /// Actors with a matching nonzero Id don't collide with each other
        this.mPassThroughId = 0;
        this.mGame = game;
    }
    /**
    * Indicate that when this actor stops, we should run custom code
    *
    * @param callback The callback to run when the actor stops
    */
    setStopCallback(callback) {
        let out_this = this;
        this.mScene.mRepeatEvents.push(new (class _ extends LolAction {
            constructor() {
                super(...arguments);
                this.moving = false;
            }
            //@Override
            go() {
                let speed = out_this.mBody.GetLinearVelocity();
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
    * Make the camera follow the actor, but without centering the actor on the screen
    *
    * @param x Amount of x distance between actor and center
    * @param y Amount of y distance between actor and center
    */
    setCameraOffset(x, y) {
        this.mCameraOffset.x = x;
        this.mCameraOffset.y = y;
    }
    /**
    * Indicate that the actor should move with the tilt of the phone
    */
    setMoveByTilting() {
        // If we've already added this to the set of tiltable objects, don't do it again
        if (this.mScene.mTiltActors.indexOf(this) < 0) {
            return;
        }
        // make sure it is moveable, add it to the list of tilt actors
        if (this.mBody.GetType() != PhysicsType2d.Dynamics.BodyType.DYNAMIC) {
            this.mBody.SetType(PhysicsType2d.Dynamics.BodyType.DYNAMIC);
        }
        this.mScene.mTiltActors.push(this);
        // turn off sensor behavior, so this collides with stuff...
        this.setCollisionsEnabled(true);
    }
}
/// <reference path="./WorldActor.ts"/>
/**
 * Destinations are actors that the Hero should try to reach. When a Hero reaches a destination, the
 * Hero disappears, and the score updates.
 */
class Destination extends WorldActor {
    /// Sound to play when a hero arrives at this destination
    //Sound mArrivalSound;
    /**
     * Create a basic Destination.  The destination won't yet have any physics attached to it.
     *
     * @param game    The currently active game
     * @param scene   The scene into which the destination is being placed
     * @param width   Width of this destination
     * @param height  Height of this destination
     * @param imgName Name of the image to display
     */
    constructor(game, scene, width, height, imgName) {
        super(game, scene, imgName, width, height);
        this.mCapacity = 1;
        this.mHolding = 0;
        this.mActivation = new Array(4);
        for (let i = 0; i < 4; i++) {
            this.mActivation[i] = 0;
        }
    }
    /**
     * Code to run when a Destination collides with a WorldActor.
     * <p>
     * NB: Destinations are at the end of the collision hierarchy, so we don't do anything when
     * they are in a collision that hasn't already been handled by a higher-ranked WorldActor.
     *
     * @param other   Other actor involved in this collision
     * @param contact A description of the collision
     */
    //@Override
    onCollide(other, contact) {
    }
    /**
     * Change the number of goodies that must be collected before the destination accepts any heroes
     * (the default is 0,0,0,0)
     *
     * @param score1 The number of type-1 goodies that must be collected.
     * @param score2 The number of type-2 goodies that must be collected.
     * @param score3 The number of type-3 goodies that must be collected.
     * @param score4 The number of type-4 goodies that must be collected.
     */
    setActivationScore(score1, score2, score3, score4) {
        this.mActivation[0] = score1;
        this.mActivation[1] = score2;
        this.mActivation[2] = score3;
        this.mActivation[3] = score4;
    }
    /**
     * Change the number of heroes that can be accepted by this destination (the default is 1)
     *
     * @param heroes The number of heroes that can be accepted
     */
    setHeroCount(heroes) {
        this.mCapacity = heroes;
    }
}
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
/// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
* Goodies are actors that a hero can collect.
* <p>
* Collecting a goodie has three possible consequences: it can change the score, it can change the
* hero's strength, and it can make the hero invincible
*/
class Goodie extends WorldActor {
    /**
    * Create a basic Goodie.  The goodie won't yet have any physics attached to it.
    *
    * @param game    The currently active game
    * @param scene   The scene into which the destination is being placed
    * @param width   width of this Goodie
    * @param height  height of this Goodie
    * @param imgName image to use for this Goodie
    */
    constructor(game, scene, width, height, imgName) {
        super(game, scene, imgName, width, height);
        this.mStrengthBoost = 0;
        this.mInvincibilityDuration = 0;
        this.mScore = new Array();
        this.mScore[0] = 1;
        this.mScore[1] = 0;
        this.mScore[2] = 0;
        this.mScore[3] = 0;
    }
    /**
    * Code to run when a Goodie collides with a WorldActor.
    * <p>
    * NB: Goodies are at the end of the collision hierarchy, so we don't do anything when
    * they are in a collision that hasn't already been handled by a higher-ranked WorldActor.
    *
    * @param other   Other object involved in this collision
    * @param contact A description of the contact that caused this collision
    */
    //@Override
    onCollide(other, contact) {
    }
}
/**
 * LolAction describes code that runs in response to events.  LolAction is only intended for events
 * that take no parameters, such as events that run on a timer.
 */
class LolAction {
    constructor() {
        /// A flag to disable and re-enable actions.  This is especially useful when a LolAction is on
        /// a repeating timer.
        this.mIsActive = true;
    }
}
/// <reference path="./Camera.ts" />
/// <reference path="./LolAction.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
// ^this isn't working properly right now
/**
 * LolScene is the parent of all Scene types
 * <p>
 * A Scene consists of a physics world and a bunch of actors who exist within that world.  Notably,
 * a Scene can be rendered, which advances its physics world.
 * <p>
 * There is a close relationship between a BaseActor and a LolScene, namely that a BaseActor should
 * not need any scene functionality that is not present in LolScene.
 */
class LolScene {
    /**
     * Construct a new scene
     *
     * @param media  All image and sound assets for the game
     * @param config The game-wide configuration
     */
    constructor(config, media) {
        this.mContainer = new PIXI.Container();
        this.mConfig = config;
        this.mMedia = media;
        let w = config.mWidth / config.mPixelMeterRatio;
        let h = config.mHeight / config.mPixelMeterRatio;
        this.mContainer.position.x = 0;
        this.mContainer.position.y = 0;
        // set up the event lists
        this.mOneTimeEvents = new Array();
        //this.mRepeatEvents = new ArrayList<>();
        // set up the game camera, with (0, 0) in the bottom left
        this.mCamera = new Camera(w, h);
        this.mCamera.setPosition(w / 2, h / 2);
        this.mCamera.setZoom(1);
        // set default camera bounds
        this.mCamBound = new PhysicsType2d.Vector2(w, h);
        // create a world with no default gravitational forces
        this.mWorld = new PhysicsType2d.Dynamics.World(new PhysicsType2d.Vector2(0, 0));
        // set up the containers for holding anything we can render
        this.mRenderables = new Array(5);
        for (let i = 0; i < 5; ++i) {
            this.mRenderables[i] = new Array();
        }
    }
    /**
     * Add an actor to the level, putting it into the appropriate z plane
     *
     * @param actor  The actor to add
     * @param zIndex The z plane. valid values are -2, -1, 0, 1, and 2. 0 is the default.
     */
    addActor(actor, zIndex) {
        // Coerce index into legal range, then add the actor
        zIndex = (zIndex < -2) ? -2 : zIndex;
        zIndex = (zIndex > 2) ? 2 : zIndex;
        this.mRenderables[zIndex + 2].push(actor);
        if (actor.mSprite)
            this.mContainer.addChild(actor.mSprite);
        if (actor.mText)
            this.mContainer.addChild(actor.mText);
        this.mCamera.mContainer.addChild(this.mContainer);
    }
    /**
    * Remove an actor from its z plane
    *
    * @param actor  The actor to remove
    * @param zIndex The z plane where it is expected to be
    */
    removeActor(actor, zIndex) {
        // Coerce index into legal range, then remove the actor
        zIndex = (zIndex < -2) ? -2 : zIndex;
        zIndex = (zIndex > 2) ? 2 : zIndex;
        let i = this.mRenderables[zIndex + 2].indexOf(actor);
        this.mRenderables[zIndex + 2].splice(i, 1);
    }
    /**
    * Reset a scene by clearing all of its lists
    */
    reset() {
        //this.mTapHandlers.length = 0;
        this.mOneTimeEvents.length = 0;
        this.mRepeatEvents.length = 0;
        for (let a of this.mRenderables) {
            a.length = 0;
        }
    }
    // /**
    //  * Draw some text in the scene, using a bottom-left coordinate
    //  *
    //  * @param x         The x coordinate of the bottom left corner
    //  * @param y         The y coordinate of the bottom left corner
    //  * @param fontName  The name of the font to use
    //  * @param fontColor The color of the font
    //  * @param fontSize  The size of the font
    //  * @param prefix    Prefix text to put before the generated text
    //  * @param suffix    Suffix text to put after the generated text
    //  * @param tp        A TextProducer that will generate the text to display
    //  * @param zIndex    The z index of the text
    //  * @return A Renderable of the text, so it can be enabled/disabled by program code
    //  */
    // public addText(x: number, y: number, fontName: string, fontColor: string,
    //                           fontSize: number, prefix: string, suffix: string,
    //                           tp: Object, zIndex: number): Renderable {
    //     // Choose a font color and get the BitmapFont
    //     //final Color mColor = Color.valueOf(fontColor);
    //     //final BitmapFont mFont = mMedia.getFont(fontName, fontSize);
    //     // Create a renderable that updates its text on every render, and add it to the scene
    //     var superThis = this;
    //     let d: Renderable = new (class _ extends Renderable {
    //         //@Override
    //         onRender(): void {
    //             //mFont.setColor(mColor);
    //             //String txt = prefix + tp.makeText() + suffix;
    //             //renderText(x, y, txt, mFont, sb);
    //             let txt = prefix + tp.toString() + suffix;
    //             let newText = new PIXI.Text(txt, {fontFamily: fontName, fontSize: fontSize, fill: 0xffffff, align: 'center'});
    //             superThis.mContainer.addChild(newText);
    //         }
    //     })();
    //     this.addActor(d, zIndex);
    //     return d;
    // }
    /**
     * Draw some text in the scene, using a bottom-left coordinate
     *
     * @param x         The x coordinate of the bottom left corner
     * @param y         The y coordinate of the bottom left corner
     * @param fontName  The name of the font to use
     * @param fontColor The color of the font
     * @param fontSize  The size of the font
     * @param text      Text to put on screen
     * @param zIndex    The z index of the text
     * @return A Renderable of the text, so it can be enabled/disabled by program code
     */
    addStaticText(x, y, fontName, fontColor, fontSize, text, zIndex) {
        // Create a renderable that updates its text on every render, and add it to the scene
        let d = new (class _ extends Renderable {
            //@Override
            onRender() {
                // let newText = new PIXI.Text("Hello Darkness My Old Friend", {fontFamily: fontName, fontSize: fontSize, fill: fontColor, align: 'center'});
                // newText.position.x = x;
                // newText.position.y = y;
                // this.mText = newText;
            }
        })();
        let newText = new PIXI.Text(text, { fontFamily: fontName, fontSize: fontSize, fill: fontColor, align: 'center' });
        d.mText = newText;
        d.mText.position.x = x;
        d.mText.position.y = y;
        this.addActor(d, zIndex);
        return d;
    }
}
/// <reference path="./Config.ts"/>
class Media {
    /**
     * Construct a Media object by loading all images and sounds
     *
     * @param config The game-wide configuration object, which contains lists of images and sounds
     */
    constructor(config) {
        // mConfig = config;
        // for (String imgName : config.mImageNames) {
        //     TextureRegion tr = new TextureRegion(new Texture(Gdx.files.internal(imgName)));
        //     mImages.put(imgName, tr);
        // }
        // for (String soundName : config.mSoundNames) {
        //     Sound s = Gdx.audio.newSound(Gdx.files.internal(soundName));
        //     mSounds.put(soundName, s);
        // }
        // int volume = Lol.getGameFact(mConfig, "volume", 1);
        // for (String musicName : config.mMusicNames) {
        //     Music m = Gdx.audio.newMusic(Gdx.files.internal(musicName));
        //     m.setLooping(true);
        //     m.setVolume(volume);
        //     mTunes.put(musicName, m);
        // }
    }
}
/// <reference path="./LolScene.ts" />
/// <reference path="./Media.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class HudScene extends LolScene {
    /// The set of all controls that have toggle handlers.  We need this, so we can "lift" toggles
    /// on screen change evenrs
    //readonly mToggleControls: Array<SceneActor>;
    /**
    * Create a new heads-up display by providing the dimensions for its camera
    *
    * @param media  All image and sound assets for the game
    * @param config The game-wide configuration
    */
    constructor(config, media) {
        super(config, media);
        //this.mToggleControls = new Array<SceneActor>();
    }
    /**
    * Draw the Hud
    *
    * @param sb    The spritebatch to use when drawing
    * @param delta The time since the last render
    */
    render() {
        //this.mCamera.updatePosition();
        // Advance the physics world by 1/45 of a second (1/45 is the recommended rate)
        this.mWorld.Step(1 / 45, 8, 3);
        // Render all actors and text
        //sb.setProjectionMatrix(mCamera.combined);
        //sb.begin();
        for (let zA of this.mRenderables) {
            for (let r of zA) {
                r.render();
            }
        }
        //sb.end();
        // TODO: box2d shape renderer for controls2
        // if (mConfig.mShowDebugBoxes) {
        // }
        return true;
    }
}
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
    constructor(config, media) {
        super(config, media);
        /// A multiplier to make gravity change faster or slower than the accelerometer default
        this.mTiltMultiplier = 1;
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
    configureCollisionHandlers() {
        // set up the collision handlers
        this.mWorld.SetContactListener(new (class myContactListener extends PhysicsType2d.Dynamics.ContactListener {
            constructor(superThis) {
                super();
                this.superThis = superThis;
            }
            /**
            * When two bodies start to collide, we can use this to forward to our onCollide methods
            *
            * @param contact A description of the contact event
            */
            //@Override
            BeginContact(contact) {
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
                let c0;
                let c1;
                if (a instanceof Hero) {
                    c0 = a;
                    c1 = b;
                }
                else if (b instanceof Hero) {
                    c0 = b;
                    c1 = a;
                }
                else if (a instanceof Enemy) {
                    c0 = a;
                    c1 = b;
                }
                else if (b instanceof Enemy) {
                    c0 = b;
                    c1 = a;
                    // } else if (a instanceof Projectile) {
                    //   c0 = a as WorldActor;
                    //   c1 = b as WorldActor;
                    // } else if (b instanceof Projectile) {
                    //   c0 = b as WorldActor;
                    //   c1 = a as WorldActor;
                }
                else {
                    return;
                }
                // Schedule an event to run as soon as the physics world finishes its step.
                //
                // NB: this is called from render, while world is updating.  We can't modify the
                // world or its actors until the update finishes, so we have to schedule
                // collision-based updates to run after the world update.
                this.superThis.mOneTimeEvents.push(new (class _ extends LolAction {
                    //@Override
                    go() {
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
            EndContact(contact) {
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
            PreSolve(contact, oldManifold) {
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
            PostSolve(contact, impulse) {
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
    adjustCamera() {
        if (!this.mChaseActor) {
            return;
        }
        // figure out the actor's position
        let x = this.mChaseActor.mBody.GetWorldCenter().x + this.mChaseActor.mCameraOffset.x;
        let y = this.mChaseActor.mBody.GetWorldCenter().y + this.mChaseActor.mCameraOffset.y;
        // // if x or y is too close to MAX,MAX, stick with max acceptable values
        // if (x > this.mCamBound.x - this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
        //   x = this.mCamBound.x - this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
        // }
        // if (y > this.mCamBound.y - this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
        //   y = this.mCamBound.y - this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
        // }
        // // if x or y is too close to 0,0, stick with minimum acceptable values
        // //
        // // NB: we do MAX before MIN, so that if we're zoomed out, we show extra
        // // space at the top instead of the bottom
        // if (x < this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
        //   x = this.mConfig.mWidth * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
        // }
        // if (y < this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2) {
        //   y = this.mConfig.mHeight * this.mCamera.getZoom() / this.mConfig.mPixelMeterRatio / 2;
        // }
        // update the camera position
        this.mCamera.centerOn(x, y);
        this.mCamera.setPosition(this.mConfig.mWidth / 2, this.mConfig.mHeight / 2);
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
    render() {
        for (let zA of this.mRenderables) {
            for (let r of zA) {
                r.render();
            }
        }
        return true;
    }
}
/// <reference path="./LolScene.ts"/>
class QuickScene extends LolScene {
    /**
     * Construct a QuickScene with default show and dismiss behaviors
     *
     * @param media       The media object, with all loaded sound and image files
     * @param config      The game-wide configuration
     * @param defaultText The default text to display, centered, on this QuickScene
     */
    constructor(config, media, defaultText) {
        super(config, media);
        this.mClickToClear = true;
        this.mText = defaultText;
        let out_this = this;
        // Set the default dismiss action to clear the screen and fix the timers
        this.mDismissAction = new (class _ extends LolAction {
            //@Override
            go() {
                if (out_this.mClickToClear) {
                    let showTime = (new Date()).getTime() - out_this.mDisplayTime;
                    //Timer.instance().delay(showTime);
                    //Timer.instance().start();
                    PIXI.ticker.shared.start();
                }
            }
        })();
        // Set the default show action to put the default text on the screen
        // mShowAction = new LolAction() {
        //     @Override
        //     public void go() {
        //         // If the scene has been disabled, just return
        //         if (mDisable) {
        //             dismiss();
        //             return;
        //         }
        //         // play the show sound
        //         if (mSound != null)
        //             mSound.play(Lol.getGameFact(mConfig, "volume", 1));
        //         // The default text to display can change at the last second, so we compute it here
        //         addTextCentered(mConfig.mWidth / mConfig.mPixelMeterRatio / 2, mConfig.mHeight / mConfig.mPixelMeterRatio / 2,
        //                 mConfig.mDefaultFontFace, mConfig.mDefaultFontColor, mConfig.mDefaultFontSize, "", "", new TextProducer() {
        //                     @Override
        //                     public String makeText() {
        //                         return mText;
        //                     }
        //                 }, 0);
        //     }
        // };
    }
    //
    // /**
    //  * Pause the timer when this screen is shown
    //  */
    // void suspendClock() {
    //     Timer.instance().stop();
    //     mDisplayTime = System.currentTimeMillis();
    // }
    //
    /**
     * Render the QuickScene, or return false if it is not supposed to be shown
     *
     * @param sb    The SpriteBatch used to draw the text and pictures
     * @param delta The time since the last render
     * @return true if the PauseScene was drawn, false otherwise
     */
    render() {
        // if the scene is not visible, do nothing
        // if (!mVisible)
        //     return false;
        //
        // // clear screen and draw images/text via HudCam
        // Gdx.gl.glClearColor(0, 0, 0, 1);
        // Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
        // mCamera.update();
        // sb.setProjectionMatrix(mCamera.combined);
        // sb.begin();
        // for (ArrayList<Renderable> a : mRenderables) {
        //     for (Renderable r : a) {
        //         r.render(sb, delta);
        //     }
        // }
        // sb.end();
        // TODO: debug rendering?
        return true;
    }
    //
    // /**
    //  * Handler to run when the screen is tapped while the scene is being displayed
    //  *
    //  * @param screenX The x coordinate on screen where the touch happened
    //  * @param screenY The y coordinate on screen where the touch happened
    //  * @param game    The top-level game object
    //  * @return True if the tap was handled, false otherwise
    //  */
    // boolean onTap(float screenX, float screenY, Lol game) {
    //     // ignore if not visible
    //     if (!mVisible)
    //         return false;
    //
    //     // check for taps to the buttons
    //     mHitActor = null;
    //     mCamera.unproject(mTouchVec.set(screenX, screenY, 0));
    //     mWorld.QueryAABB(mTouchCallback, mTouchVec.x - 0.1f, mTouchVec.y - 0.1f, mTouchVec.x + 0.1f, mTouchVec.y + 0.1f);
    //     if (mHitActor != null && mHitActor.mTapHandler != null) {
    //         dismiss(); // TODO: make this the responsibility of the programmer?
    //         mHitActor.onTap(mTouchVec);
    //         return true;
    //     }
    //
    //     // hide the scene only if it's click-to-clear
    //     if (mClickToClear) {
    //         dismiss();
    //         game.liftAllButtons(mTouchVec.x, mTouchVec.y);
    //     }
    //     return true;
    // }
    //
    // /**
    //  * Set the sound to play when the screen is displayed
    //  *
    //  * @param soundName Name of the sound file to play
    //  */
    // public void setSound(String soundName) {
    //     mSound = mMedia.getSound(soundName);
    // }
    //
    /**
     * Indicate that this scene should not be displayed
     */
    disable() {
        this.mDisable = true;
    }
    //
    // /**
    //  * Indicate that tapping the non-button parts of the scene shouldn't return immediately to the
    //  * game.
    //  */
    // public void suppressClearClick() {
    //     mClickToClear = false;
    // }
    //
    // /**
    //  * The default is for a Scene to show until the user touches it to dismiss it. To have the
    //  * Scene disappear after a fixed time instead, use this.
    //  *
    //  * @param duration The time, in seconds, before the PreScene should disappear.
    //  */
    // public void setExpire(float duration) {
    //     if (duration > 0) {
    //         mClickToClear = false;
    //         // resume timers, or this won't work
    //         Timer.instance().start();
    //         Timer.schedule(new Timer.Task() {
    //             @Override
    //             public void run() {
    //                 dismiss();
    //             }
    //         }, duration);
    //     }
    // }
    /**
     * Set the text that should be drawn, centered, when the Scene is shown
     *
     * @param text The text to display. Use "" to disable
     */
    setDefaultText(text) {
        this.mText = text;
    }
    /**
     * Reset a scene, so we can change what is on it.  Only useful for the scenes we might show more
     * than once (such as the PauseScene)
     */
    reset() {
        this.mDisable = false;
        this.mVisible = false;
        //this.mSound = null;
        this.mDisplayTime = 0;
        this.mClickToClear = true;
        this.mText = "";
        super.reset();
    }
    /**
     * Show the scene
     */
    show() {
        this.mVisible = true;
        if (this.mShowAction != null) {
            this.mShowAction.go();
        }
    }
    /**
     * Stop showing the scene
     */
    dismiss() {
        this.mVisible = false;
        this.mDismissAction.go();
    }
    /**
     * Provide some custom code to run when the scene is dismissed
     *
     * @param dismissAction The code to run
     */
    setDismissAction(dismissAction) {
        this.mDismissAction = dismissAction;
    }
    /**
     * Provide some custom code to run when the scene is dismissed
     *
     * @param showAction The code to run
     */
    setShowAction(showAction) {
        this.mShowAction = showAction;
    }
}
/// <reference path="./HudScene.ts"/>
/// <reference path="./MainScene.ts"/>
/// <reference path="./Enemy.ts"/>
/// <reference path="./Goodie.ts"/>
/// <reference path="./QuickScene.ts"/>
/// <reference path="./Media.ts"/>
/// <reference path="./Lol.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
* These are the ways you can complete a level: you can reach the destination, you can collect
* enough stuff, or you can reach a certain number of enemies defeated.
* <p>
* Technically, there's also 'survive for x seconds', but that doesn't need special support
*/
var VictoryType;
(function (VictoryType) {
    VictoryType[VictoryType["DESTINATION"] = 0] = "DESTINATION";
    VictoryType[VictoryType["GOODIECOUNT"] = 1] = "GOODIECOUNT";
    VictoryType[VictoryType["ENEMYCOUNT"] = 2] = "ENEMYCOUNT";
})(VictoryType || (VictoryType = {}));
class LolManager {
    /**
    * Construct the LolManager, build the scenes, set up the state machine, and clear the scores.
    *
    * @param config The game-wide configuration
    * @param media  All image and sound assets for the game
    * @param game   A reference to the top-level game object
    */
    constructor(config, media, game) {
        /// Modes of the game, for use by the state machine.  We can be showing the main splash
        /// screen, the help screens, the level chooser, the store, or a playable level
        this.SPLASH = 0;
        this.HELP = 1;
        this.CHOOSER = 2;
        this.STORE = 3;
        this.PLAY = 4;
        /// The level within each mode (e.g., we are in PLAY scene 4, and will return to CHOOSER 2)
        this.mModeStates = new Array(5);
        this.mGame = game;
        this.mConfig = config;
        this.mMedia = media;
        // Set up the API, so that any user code we call is able to reach this object
        this.mLevel = new Level(this.mConfig, this.mMedia, this.mGame);
        // build scenes and facts
        this.createScenes();
        this.mSessionFacts = new Map();
        // set current mode states, and reset the scores
        for (let i = 0; i < 5; ++i)
            this.mModeStates[i] = 1;
        this.resetScores();
        //
        // this.mGoodiesCollected = new Array<number>();
    }
    /**
    * Reset all scores.  This should be called at the beginning of every level.
    */
    resetScores() {
        this.mVictoryGoodieCount = new Array(4);
        this.mHeroesCreated = 0;
        this.mGoodiesCollected = new Array(0, 0, 0, 0);
        this.mEnemiesCreated = 0;
        this.mEnemiesDefeated = 0;
        this.mGameOver = false;
        this.mLoseCountDownRemaining = -100;
        this.mLoseCountDownText = "";
        this.mWinCountRemaining = -100;
        this.mWinCountText = "";
        this.mStopWatchProgress = -100;
        this.mDistance = 0;
        this.mHeroesDefeated = 0;
        this.mDestinationArrivals = 0;
        this.mVictoryType = VictoryType.DESTINATION;
        this.mVictoryHeroCount = 0;
        this.mVictoryEnemyCount = 0;
        this.mEndGameEvent = null;
        this.mWinCallback = null;
        this.mLoseCallback = null;
    }
    /**
    * Create all scenes for a playable level.
    */
    createScenes() {
        // Create the easy scenes
        this.mWorld = new MainScene(this.mConfig, this.mMedia);
        this.mHud = new HudScene(this.mConfig, this.mMedia);
        //this.mBackground = new ParallaxScene(this.mConfig);
        //this.mForeground = new ParallaxScene(this.mConfig);
        // the win/lose/pre/pause scenes are a little bit complicated
        // this.mWinScene = new QuickScene(this.mConfig, this.mMedia, this.mConfig.mDefaultWinText);
        // let out_this = this;
        // this.mWinScene.setDismissAction(new (class _ extends LolAction {
        //   //@Override
        //   public go(): void {
        //     out_this.doChooser(1);
        //   }
        // })());
        // this.mLoseScene = new QuickScene(this.mConfig, this.mMedia, this.mConfig.mDefaultLoseText);
        // this.mLoseScene.setDismissAction(new (class _ extends LolAction {
        //   //@Override
        //   public go(): void {
        //     out_this.repeatLevel();
        //   }
        // })());
        this.mContainer = new PIXI.Container();
        this.mContainer.addChild(this.mWorld.mCamera.mContainer);
        this.mContainer.addChild(this.mHud.mCamera.mContainer);
        //this.mWorld.mContainer.addChild(new PIXI.Text("Hello", {fontFamily: "Arial", fontSize: 24, fill: 0x0000FF, align: 'center'}));
        // this.mPreScene = new QuickScene(this.mConfig, this.mMedia, "");
        // this.mPreScene.setShowAction(null);
        // this.mPauseScene = new QuickScene(this.mConfig, this.mMedia, "");
        // this.mPauseScene.setAsPauseScene();
    }
    /**
    * Before we call programmer code to load a new scene, we call this to ensure that everything is
    * in a clean state.
    */
    onScreenChange() {
        //this.mWorld.pauseMusic();
        this.createScenes();
        // When debug mode is on, print the frames per second
        // if (this.mConfig.mShowDebugBoxes)
        //   this.mLevel.addDisplay(800, 15, mConfig.mDefaultFontFace, mConfig.mDefaultFontColor, 12, "fps: ", "", mLevel.DisplayFPS, 2);
    }
    // /**
    // * If the level that follows this level has not yet been unlocked, unlock it.
    // * <p>
    // * NB: we only track one value for locking/unlocking, so this actually unlocks all levels up to
    // * and including the level after the current level.
    // */
    // private unlockNext(): void {
    //   if (Lol.getGameFact(this.mConfig, "unlocked", 1) <= this.mModeStates[this.PLAY]) {
    //     Lol.putGameFact(this.mConfig, "unlocked", this.mModeStates[this.PLAY] + 1);
    //   }
    // }
    /**
    * Move forward to the next level, if there is one, and otherwise go back to the chooser.
    */
    advanceLevel() {
        // Make sure to stop the music!
        //this.mWorld.stopMusic();
        if (this.mModeStates[this.PLAY] == this.mConfig.mNumLevels) {
            this.doChooser(1);
        }
        else {
            this.mModeStates[this.PLAY]++;
            this.doPlay(this.mModeStates[this.PLAY]);
        }
    }
    /**
    * Start a level over again.
    */
    repeatLevel() {
        this.doPlay(this.mModeStates[this.PLAY]);
    }
    /**
    * Load the splash screen
    */
    doSplash() {
        for (let i = 0; i < 5; ++i) {
            this.mModeStates[i] = 1;
        }
        this.mMode = this.SPLASH;
        this.onScreenChange();
        this.mConfig.mSplash.display(1, this.mLevel);
    }
    /**
    * Load the level-chooser screen. If the chooser is disabled, jump straight to level 1.
    *
    * @param index The chooser screen to create
    */
    doChooser(index) {
        // if chooser disabled, then we either called this from splash, or from a game level
        if (!this.mConfig.mEnableChooser) {
            if (this.mMode == this.PLAY) {
                this.doSplash();
            }
            else {
                this.doPlay(this.mModeStates[this.PLAY]);
            }
            return;
        }
        // the chooser is not disabled... save the choice of level, configure it, and show it.
        this.mMode = this.CHOOSER;
        this.mModeStates[this.CHOOSER] = index;
        this.onScreenChange();
        this.mConfig.mChooser.display(index, this.mLevel);
    }
    /**
    * Load a playable level
    *
    * @param index The index of the level to load
    */
    doPlay(index) {
        this.mModeStates[this.PLAY] = index;
        this.mMode = this.PLAY;
        this.onScreenChange();
        this.resetScores();
        this.mConfig.mLevels.display(index, this.mLevel);
    }
    /**
    * Load a help level
    *
    * @param index The index of the help level to load
    */
    doHelp(index) {
        this.mModeStates[this.HELP] = index;
        this.mMode = this.HELP;
        this.onScreenChange();
        this.mConfig.mHelp.display(index, this.mLevel);
    }
    /**
    * Load a lose scene
    *
    * @param index The index of the help level to load
    */
    doLose(index) {
        this.onScreenChange();
        this.mConfig.mLose.display(index, this.mLevel);
    }
    /**
    * Load a win scene
    *
    * @param index The index of the help level to load
    */
    doWin(index) {
        this.onScreenChange();
        this.mConfig.mWin.display(index, this.mLevel);
    }
    /**
    * Load a screen of the store.
    *
    * @param index The index of the help level to load
    */
    doStore(index) {
        this.mModeStates[this.STORE] = index;
        this.mMode = this.STORE;
        this.onScreenChange();
        this.mConfig.mStore.display(index, this.mLevel);
    }
    // TODO: What does quitting the game look like??
    // With a webpage, closing the browser tab should be sufficient?
    /**
    * Quit the game
    */
    doQuit() {
        //this.mWorld.stopMusic();
        //Gdx.app.exit();
    }
    /**
    * Indicate that a hero has been defeated
    *
    * @param enemy The enemy who defeated the hero
    */
    defeatHero(enemy) {
        this.mHeroesDefeated++;
        if (this.mHeroesDefeated == this.mHeroesCreated) {
            // possibly change the end-of-level text
            if (enemy.mOnDefeatHeroText !== "") {
                this.mLoseScene.setDefaultText(enemy.mOnDefeatHeroText);
            }
            this.endLevel(false);
        }
    }
    /**
    * Indicate that a goodie has been collected
    *
    * @param goodie The goodie that was collected
    */
    onGoodieCollected(goodie) {
        // Update goodie counts
        for (let i = 0; i < 4; ++i) {
            this.mGoodiesCollected[i] += goodie.mScore[i];
        }
        // possibly win the level, but only if we win on goodie count and all
        // four counts are high enough
        if (this.mVictoryType != VictoryType.GOODIECOUNT) {
            return;
        }
        let match = true;
        for (let i = 0; i < 4; ++i) {
            match = match && (this.mVictoryGoodieCount[i] <= this.mGoodiesCollected[i]);
        }
        if (match) {
            this.endLevel(true);
        }
    }
    /**
    * Indicate that a hero has reached a destination
    */
    onDestinationArrive() {
        // check if the level is complete
        this.mDestinationArrivals++;
        if ((this.mVictoryType == VictoryType.DESTINATION) && (this.mDestinationArrivals >= this.mVictoryHeroCount)) {
            console.log("Win");
            this.endLevel(true);
        }
    }
    /**
    * Indicate that an enemy has been defeated
    */
    onDefeatEnemy() {
        // update the count of defeated enemies
        this.mEnemiesDefeated++;
        // if we win by defeating enemies, see if we've defeated enough of them:
        let win = false;
        if (this.mVictoryType == VictoryType.ENEMYCOUNT) {
            // -1 means "defeat all enemies"
            if (this.mVictoryEnemyCount == -1) {
                win = this.mEnemiesDefeated == this.mEnemiesCreated;
            }
            else {
                win = this.mEnemiesDefeated >= this.mVictoryEnemyCount;
            }
        }
        if (win) {
            this.endLevel(true);
        }
    }
    /**
    * When a level ends, we run this code to shut it down, print a message, and
    * then let the user resume play
    *
    * @param win true if the level was won, false otherwise
    */
    endLevel(win) {
        if (win) {
            this.doWin(this.mModeStates[this.PLAY]);
        }
        else {
            this.doLose(this.mModeStates[this.PLAY]);
        }
        // if (this.mEndGameEvent == null) {
        //   let out_this = this;
        //   this.mEndGameEvent = new (class _ extends LolAction {
        //     //@Override
        //     public go(): void {
        //       // Safeguard: only call this method once per level
        //       if (out_this.mGameOver){
        //         return;
        //       }
        //       out_this.mGameOver = true;
        //
        //       // Run the level-complete callback
        //       if (win && out_this.mWinCallback != null){
        //         out_this.mWinCallback.go();
        //       } else if (!win && out_this.mLoseCallback != null){
        //         out_this.mLoseCallback.go();
        //       }
        //       // if we won, unlock the next level
        //       // if (win){
        //       //   out_this.mGame.mManager.unlockNext();
        //       // }
        //       // drop everything from the hud
        //       out_this.mGame.mManager.mHud.reset();
        //
        //       //TODO: clear setInterval calls or create a timer class
        //       // clear any pending timers
        //       //PhysicsType2d.Timer.clear();
        //
        //       // display the PostScene before we retry/start the next level
        //       if (win) {
        //         out_this.mGame.mManager.mWinScene.show();
        //       } else {
        //         out_this.mGame.mManager.mLoseScene.show();
        //       }
        //     }
        //   })();
        //}
    }
    /**
    * Update all timer counters associated with the current level
    */
    // TODO: This uses PIXI.ticker, which may require some adjustments
    updateTimeCounts() {
        // Check the countdown timers
        if (this.mLoseCountDownRemaining != -100) {
            this.mLoseCountDownRemaining -= PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
            if (this.mLoseCountDownRemaining < 0) {
                if (this.mLoseCountDownText !== "") {
                    this.mLoseScene.setDefaultText(this.mLoseCountDownText);
                }
                this.endLevel(false);
            }
        }
        if (this.mWinCountRemaining != -100) {
            this.mWinCountRemaining -= PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
            if (this.mWinCountRemaining < 0) {
                if (this.mWinCountText !== "") {
                    this.mWinScene.setDefaultText(this.mWinCountText);
                }
                this.endLevel(true);
            }
        }
        if (this.mStopWatchProgress != -100) {
            this.mStopWatchProgress += PIXI.ticker.shared.deltaTime; //Gdx.graphics.getDeltaTime();
        }
    }
}
/// <reference path="./LolManager.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class Lol {
    constructor(config) {
        this.mConfig = config;
        this.mRenderer = PIXI.autoDetectRenderer(config.mWidth, config.mHeight);
    }
    /**
     * App creation lifecycle event.
     * NB: This is an internal method for initializing a game. User code should never call this.
     */
    create() {
        // We want to intercept 'back' button presses, so that we can poll for them in
        // <code>render</code> and react accordingly
        //Gdx.input.setCatchBackKey(true);
        // The config object has already been set, so we can load all assets
        this.mMedia = new Media(this.mConfig);
        // Configure the objects we need in order to render
        //mDebugRender = new Box2DDebugRenderer();
        //mSpriteBatch = new SpriteBatch();
        // Configure the input handlers.  We process gestures first, and if no gesture occurs, then
        // we look for a non-gesture touch event
        //InputMultiplexer mux = new InputMultiplexer();
        //mux.addProcessor(new GestureDetector(new LolGestureManager()));
        //mux.addProcessor(new LolInputManager());
        //Gdx.input.setInputProcessor(mux);
        // configure the volume
        //if (getGameFact(mConfig, "volume", 1) == 1)
        //    putGameFact(mConfig, "volume", 1);
        // this.mConfig.mImageNames.forEach( (e) => {
        //   PIXI.loader.add(e);
        // } );
        // PIXI.loader.load();
        // Create the level manager, and instruct it to transition to the Splash screen
        this.mManager = new LolManager(this.mConfig, this.mMedia, this);
        this.mManager.doSplash();
    }
    /**
     * This code is called every 1/45th of a second to update the game state and re-draw the screen
     * <p>
     * NB: This is an internal method. User code should never call this.
     */
    render() {
        this.mManager.mWorld.mWorld.Step(1 / 45, 8, 3);
        this.mManager.mWorld.adjustCamera();
        //this.mManager.mWorld.mCamera.updatePosition();
        this.mManager.mWorld.render();
        this.mManager.mHud.render();
        this.mRenderer.render(this.mManager.mContainer);
        this.mManager.mWorld.mOneTimeEvents.forEach((pe) => {
            pe.go();
        });
        this.mManager.mWorld.mOneTimeEvents.length = 0;
    }
}
/// <reference path="./WorldActor.ts"/>
/// <reference path="./CollisionCallback.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Level.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
 * Obstacles are usually walls, except they can move, and can be used to run all sorts of arbitrary
 * code that changes the game, or the behavior of the things that collide with them. It's best to
 * think of them as being both "a wall" and "a catch-all for any behavior that we don't have
 * anywhere else".
 */
class Obstacle extends WorldActor {
    /**
     * Build an obstacle, but do not give it any Physics body yet
     *
     * @param width   width of this Obstacle
     * @param height  height of this Obstacle
     * @param imgName Name of the image file to use
     */
    constructor(game, level, width, height, imgName) {
        super(game, level, imgName, width, height);
    }
    // /**
    //  * Internal method for playing a sound when a hero collides with this obstacle
    //  */
    // playCollideSound(): void {
    //     if (this.mCollideSound == null)
    //         return;
    //
    //     // Make sure we have waited long enough since the last time we played the sound
    //     let now = System.currentTimeMillis(); //TODO: find an equivalent for this
    //     if (now < this.mLastCollideSoundTime + this.mCollideSoundDelay)
    //         return;
    //     this.mLastCollideSoundTime = now;
    //     this.mCollideSound.play(Lol.getGameFact(this.mScene.mConfig, "volume", 1));
    // }
    /**
     * Code to run when an Obstacle collides with a WorldActor.
     *
     * The Obstacle always comes last in the collision hierarchy, so no code is needed here
     *
     * @param other   Other object involved in this collision
     * @param contact A description of the contact that caused this collision
     */
    //@Override
    onCollide(other, contact) {
    }
}
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
    /**
    * Construct a Hero, but don't give it any physics yet
    *
    * @param game    The currently active game
    * @param scene   The scene into which the Hero is being placed
    * @param width   The width of the hero
    * @param height  The height of the hero
    * @param imgName The name of the file that has the default image for this hero
    */
    constructor(game, scene, width, height, imgName) {
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
    onRender() {
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
    jump() {
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
    stopJump() {
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
    crawlOn() {
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
    crawlOff() {
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
    increaseRotation(delta) {
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
    onCollide(other, contact) {
        // NB: we currently ignore Projectile and Hero
        if (other instanceof Enemy) {
            this.onCollideWithEnemy(other);
        }
        else if (other instanceof Destination) {
            this.onCollideWithDestination(other);
        }
        else if (other instanceof Obstacle) {
            this.onCollideWithObstacle(other, contact);
        }
        else if (other instanceof Goodie) {
            this.onCollideWithGoodie(other);
        }
        if (other instanceof Goodie) {
            this.mGame.mManager.onGoodieCollected(other);
        }
    }
    /**
    * Dispatch method for handling Hero collisions with Destinations
    *
    * @param destination The destination with which this hero collided
    */
    onCollideWithDestination(destination) {
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
    onCollideWithEnemy(enemy) {
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
        else if (this.mCrawling && enemy.mDefeatByCrawl) {
            enemy.defeat(true);
        }
        else if (this.mInAir && enemy.mDefeatByJump && this.getYPosition() > enemy.getYPosition() + enemy.mSize.y / 2) {
            enemy.defeat(true);
        }
        else if (enemy.mDamage >= this.mStrength) {
            this.remove(false);
            this.mGame.mManager.defeatHero(enemy);
            if (this.mMustSurvive) {
                this.mGame.mManager.endLevel(false);
            }
        }
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
    addStrength(amount) {
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
    onCollideWithObstacle(o, contact) {
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
    onCollideWithGoodie(g) {
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
    getStrength() {
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
    setStrength(amount) {
        this.mStrength = amount;
    }
    /**
     * Indicate that upon a touch, this hero should begin moving with a specific velocity
     *
     * @param x Velocity in X dimension
     * @param y Velocity in Y dimension
     */
    setTouchAndGo(x, y) {
        let out_this = this;
        this.mTapHandler = new (class _ extends TouchEventHandler {
            go(worldX, worldY) {
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
    setJumpImpulses(x, y) {
        this.mJumpImpulses = new PhysicsType2d.Vector2(x, y);
    }
    /**
     * Indicate that this hero can jump while it is in the air
     */
    setMultiJumpOn() {
        this.mAllowMultiJump = true;
    }
    /**
    * Indicate that touching this hero should make it jump
    */
    setTouchToJump() {
        let out_this = this;
        this.mTapHandler = new (class _ extends TouchEventHandler {
            go(worldX, worldY) {
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
    setMustSurvive() {
        this.mMustSurvive = true;
    }
    /**
     * Provide code to run when the hero's strength changes
     *
     * @param callback The code to run.
     */
    setStrengthChangeCallback(callback) {
        this.mStrengthChangeCallback = callback;
    }
}
/// <reference path="./WorldActor.ts"/>
/// <reference path="./MainScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
/**
 * Projectiles are actors that can be thrown from the hero's location in order to remove enemies.
 */
class Projectile extends WorldActor {
    /**
     * Create a projectile, and give it a physics body
     *
     * @param width    width of the projectile
     * @param height   height of the projectile
     * @param imgName  Name of the image file to use for this projectile
     * @param x        initial x position of the projectile
     * @param y        initial y position of the projectile
     * @param zIndex   The z plane of the projectile
     * @param isCircle True if it is a circle, false if it is a box
     */
    constructor(game, level, width, height, imgName, x, y, zIndex, isCircle) {
        super(game, level, imgName, width, height);
        if (isCircle) {
            let radius = Math.max(width, height);
            //this.setCirclePhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y, radius / 2);
        }
        else {
            this.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, x, y);
        }
        this.setFastMoving(true);
        this.mBody.SetGravityScale(0);
        //this.setCollisionsEnabled(false);
        //this.disableRotation();
        this.mScene.addActor(this, zIndex);
        this.mDisappearOnCollide = true;
        //NB: in physicstype2d, Vector2 constructor must take two arguments
        this.mRangeFrom = new PhysicsType2d.Vector2(-1, -1);
        this.mRange = 1000;
    }
    /**
     * Code to run when a Projectile collides with a WorldActor.
     *
     * The only collision where Projectile is dominant is a collision with an Obstacle or another
     * Projectile.  On most collisions, a projectile will disappear.
     *
     * @param other   Other object involved in this collision
     * @param contact A description of the contact that caused this collision
     */
    //@Override
    onCollide(other, contact) {
        // if this is an obstacle, check if it is a projectile callback, and if so, do the callback
        if (other instanceof Obstacle) {
            let o = other;
            if (o.mProjectileCollision != null) {
                o.mProjectileCollision.go(o, this, contact);
                // return... don't remove the projectile
                return;
            }
        }
        if (other instanceof Projectile) {
            if (!this.mDisappearOnCollide)
                return;
        }
        // only disappear if other is not a sensor
        if (other.mBody.GetFixtures().Current().IsSensor())
            return;
        //this.remove(false);
    }
    /**
     * When drawing a projectile, we first check if it is too far from its starting point. We only
     * draw it if it is not.
     *
     * @param sb    The SpriteBatch to use for drawing this hero
     * @param delta The time since the last render
     */
    //@Override
    onRender() {
        // eliminate the projectile quietly if it has traveled too far
        //let dx = Math.abs(this.mBody.getPosition().x - this.mRangeFrom.x);
        //let dy = Math.abs(this.mBody.getPosition().y - this.mRangeFrom.y);
        //if (dx * dx + dy * dy > this.mRange * this.mRange) {
        //    this.remove(true);
        //    this.mBody.setActive(false);
        //    return;
        //}
        //super.onRender();
    }
}
/// <reference path="./BaseActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class SceneActor extends BaseActor {
    /// callback when this actor receives a pan event
    //mPanHandler: PanEventHandler;
    /// callback when this actor receives a pan stop event
    //TouchEventHandler mPanStopHandler;
    /// callback when this actor receives a zoom event
    //TouchEventHandler mZoomHandler;
    /// callback when this actor receives a Down event
    //TouchEventHandler mDownHandler;
    /**
    * Construct a SceneActor, but do not give it any physics yet
    *
    * @param scene   The scene into which this actor should be placed
    * @param imgName The image to show for this actor
    * @param width   The width of the actor's image and body, in meters
    * @param height  The height of the actor's image and body, in meters
    */
    constructor(scene, imgName, width, height) {
        super(scene, imgName, width, height);
    }
    /**
    * Disable touch for this actor
    */
    disableTouch() {
        this.mIsTouchable = false;
    }
    /**
    * Enable touch for this actor
    */
    enableTouch() {
        this.mIsTouchable = true;
    }
}
// Testing file
/// <reference path="./MainScene.ts"/>
/// <reference path="./Hero.ts"/>
/// <reference path="./LolScene.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Obstacle.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference types="pixi.js"/>
let heroImg = "./images/OrangeBox.png";
let obstImg = "./images/BlueBox.png";
let zoomInImg = "./images/ZoomIn.png";
let zoomOutImg = "./images/ZoomOut.png";
let upImg = "./images/up_arrow.png";
let downImg = "./images/down_arrow.png";
let leftImg = "./images/left_arrow.png";
let rightImg = "./images/right_arrow.png";
PIXI.loader
    .add(heroImg)
    .add(obstImg)
    .add(zoomInImg)
    .add(zoomOutImg)
    .add(upImg)
    .add(downImg)
    .add(leftImg)
    .add(rightImg)
    .load(() => main(20));
function main(speed) {
    let myConfig = new (class _ extends Config {
        constructor() {
            super();
            this.mWidth = 512;
            this.mHeight = 512;
            this.mPixelMeterRatio = 1;
        }
    });
    //let myMedia = new Media();
    //let mainScene = new MainScene(myConfig, myMedia);
    //let hud = new HudScene(myConfig, myMedia);
    let game = new Lol(myConfig);
    game.create();
    document.body.appendChild(game.mRenderer.view);
    //mgr.mHud.addText(400, 0, "Arial", "Blue", 24, "Score: ", "", mgr.mGoodiesCollected[1], 2);
    //let myHero = new Hero(game, mainScene, 25, 25, heroImg);
    //myHero.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, 100, 100);
    //myHero.updateVelocity(speed, 0);
    let myHero = game.mManager.mLevel.makeHeroAsBox(100, 100, 25, 25, heroImg);
    game.mManager.mLevel.setCameraChase(myHero);
    game.mManager.mLevel.setArrowKeyControls(myHero, 25);
    //game.mManager.mWorld.mChaseActor = myHero;
    // let Obstacle1 = new Obstacle(game, mainScene, 25, 25, obstImg);
    // Obstacle1.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 0, 0);
    let Obstacle1 = game.mManager.mLevel.makeObstacleAsBox(0, 0, 25, 25, obstImg);
    // let Obstacle2 = new Obstacle(game, mainScene, 50, 50, obstImg);
    // Obstacle2.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 200, 200);
    let Obstacle2 = game.mManager.mLevel.makeObstacleAsBox(200, 200, 50, 50, obstImg);
    // let Obstacle3 = new Obstacle(game, mainScene, 50, 50, obstImg);
    // Obstacle3.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 75, 25);
    let Obstacle3 = game.mManager.mLevel.makeObstacleAsBox(75, 75, 50, 50, obstImg);
    // mainScene.addActor(Obstacle1, 0);
    // mainScene.addActor(Obstacle2, 0);
    // mainScene.addActor(Obstacle3, 0);
    let zoominBtn = new SceneActor(game.mManager.mHud, zoomInImg, 25, 25);
    let zoomoutBtn = new SceneActor(game.mManager.mHud, zoomOutImg, 25, 25);
    zoominBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 50, 10);
    zoomoutBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 10, 10);
    game.mManager.mHud.addActor(zoominBtn, 2);
    game.mManager.mHud.addActor(zoomoutBtn, 2);
    let upBtn = new SceneActor(game.mManager.mHud, upImg, 25, 25);
    let downBtn = new SceneActor(game.mManager.mHud, downImg, 25, 25);
    upBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 380);
    downBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 420);
    game.mManager.mHud.addActor(upBtn, 2);
    game.mManager.mHud.addActor(downBtn, 2);
    let leftBtn = new SceneActor(game.mManager.mHud, leftImg, 25, 25);
    let rightBtn = new SceneActor(game.mManager.mHud, rightImg, 25, 25);
    leftBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 380, 400);
    rightBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 420, 400);
    game.mManager.mHud.addActor(leftBtn, 2);
    game.mManager.mHud.addActor(rightBtn, 2);
    game.mManager.mContainer.interactive = true;
    zoominBtn.mSprite.interactive = true;
    zoomoutBtn.mSprite.interactive = true;
    upBtn.mSprite.interactive = true;
    downBtn.mSprite.interactive = true;
    leftBtn.mSprite.interactive = true;
    rightBtn.mSprite.interactive = true;
    zoominBtn.mSprite.on('click', () => game.mManager.mWorld.mCamera.zoomInOut(1.25));
    zoomoutBtn.mSprite.on('click', () => game.mManager.mWorld.mCamera.zoomInOut(0.75));
    upBtn.mSprite.on('click', () => myHero.updateVelocity(0, -speed));
    downBtn.mSprite.on('click', () => myHero.updateVelocity(0, speed));
    leftBtn.mSprite.on('click', () => myHero.updateVelocity(-speed, 0));
    rightBtn.mSprite.on('click', () => myHero.updateVelocity(speed, 0));
    requestAnimationFrame(() => gameLoop2(game));
}
function gameLoop2(game) {
    game.render();
    requestAnimationFrame(() => gameLoop2(game));
}
/// <reference path="../library/ScreenManager.ts"/>
/**
* Chooser draws the level chooser screens. Our chooser code is pretty
* straightforward. However, the different screens are drawn in different ways,
* to show how we can write more effective code once we are comfortable with
* loops and basic geometry.
*/
class Chooser {
    /**
    * Describe how to draw each level of the chooser. Our chooser will have 15
    * levels per screen, so we need 7 screens.
    */
    display(index, level) {
        // screen 1: show 1-->15
        //
        // NB: in this screen, we assume you haven't done much programming, so
        // we draw each button with its own line of code, and we don't use any
        // variables.
        if (index == 1) {
            // Back to splash
            level.addStaticText(300, 200, "Arial", 0xFFFF00, 24, "Back to Menu", 0);
            level.addTapControl(300, 200, 100, 50, "", new (class _ extends LolAction {
                go() {
                    level.doSplash();
                    return true;
                }
            })());
            // Play level 1
            level.addStaticText(500, 200, "Arial", 0xFFFF00, 24, "Play Level 1", 0);
            level.addTapControl(500, 200, 100, 50, "", new (class _ extends LolAction {
                go() {
                    level.doLevel(1);
                    return true;
                }
            })());
        }
    }
}
/// <reference path="../library/ScreenManager.ts"/>
/// <reference path="../library/LolAction.ts"/>
/**
 * Technically, Help can be anything... even playable levels. In this
 * demonstration, it's just a bit of information. It's a good place to put
 * instructions, credits, etc.
 */
class Help {
    /**
     * Describe how to draw each level of help. Our help will have 2 screens
     */
    display(index, level) {
        // Our first scene describes the color coding that we use for the
        // different entities in the game
        if (index == 1) {
            // set up a basic screen
            //level.setBackgroundColor(0x00FFFF);
            //set up a control to go to the splash screen on screen press
            level.addTapControl(0, 0, 960, 640, "", new (class _ extends LolAction {
                go() {
                    level.doSplash();
                    return true;
                }
            })());
            //PIXI.loader.add("./images/fun.jpg").load();
            //let Obstacle1 = level.makeObstacleAsBox(0, 0, 25, 25, "https://s3.amazonaws.com/typescript-game-studio/standard/fun.jpg");
            level.addStaticText(280, 220, "Arial", 0xFFFFFF, 24, "This is an example Help screen", 0);
            level.addStaticText(280, 320, "Arial", 0xFFFFFF, 24, "You are the heroic orange box", 0);
            level.addStaticText(280, 420, "Arial", 0xFFFFFF, 24, "Your enemies are the evil blue boxes", 0);
            //level.addImage(400, 490, 150, 150, "./images/fun.jpg");
        }
    }
}
/// <reference path="../library/ScreenManager.ts"/>
/**
* Levels is where all of the code goes for describing the different levels of
* the game. If you know how to create methods and classes, you're free to make
* the big "if" statement in this code simply call to your classes and methods.
* Otherwise, put your code directly into the parts of the "if" statement.
*/
class Levels {
    /**
    * We currently have 94 levels, each of which is described in part of the
    * following function.
    */
    display(index, level) {
        /*
        * In this level, all we have is a hero (the green ball) who needs to
        * make it to the destination (a mustard colored ball). The game is
        * configured to use tilt to control the level.
        */
        if (index == 1) {
            // set the screen to 48 meters wide by 32 meters high... this is
            // important, because Config.java says the screen is 480x320, and
            // LOL likes a 20:1 pixel to meter ratio. If we went smaller than
            // 48x32, things would getLoseScene really weird. And, of course, if you make
            // your screen resolution higher in Config.java, these numbers would
            // need to getLoseScene bigger.
            //
            //level.configureGravity
            //level.resetGravity(0, 90);
            // now let's create a hero, and indicate that the hero can move by
            // tilting the phone. "greenball.png" must be registered in
            // the registerMedia() method, which is also in this file. It must
            // also be in your android game's assets folder.
            let h = level.makeHeroAsBox(960 / 2, 640 / 2, 30, 30, "https://s3.amazonaws.com/typescript-game-studio/standard/OrangeBox.png");
            level.setCameraChase(h);
            level.setArrowKeyControls(h, 50);
            let e = level.makeEnemyAsBox(960 / 2 - 80, 640 / 2 + 100, 30, 30, "https://s3.amazonaws.com/typescript-game-studio/standard/BlueBox.png");
            //let o: Obstacle = level.makeObstacleAsBox(0, 500, 960, 1, "https://s3.amazonaws.com/typescript-game-studio/standard/BlueBox.png");
            // draw a destination, and indicate that the level is won
            // when the hero reaches the level.
            level.makeDestinationAsBox(960 / 2 + 55, 640 / 2 + 155, 100, 100, "https://s3.amazonaws.com/typescript-game-studio/standard/fun.jpg");
            level.setVictoryDestination(1);
        }
    }
}
/// <reference path="../library/ScreenManager.ts"/>
/**
* Splash encapsulates the code that will be run to configure the opening screen of the game.
* Typically this has buttons for playing, getting help, and quitting.
*/
class LoseScene {
    /**
    * There is usually only one splash screen. However, the ScreenManager interface requires
    * display() to take a parameter for which screen to display.  We ignore it.
    *
    * @param index Which splash screen should be displayed (typically you can ignore this)
    * @param level The physics-based world that comprises the splash screen
    */
    display(index, level) {
        // Configure our win screen
        // This is the Play button... it switches to the first screen of the
        // level chooser. You could jump straight to the first level by using
        // "doLevel(1)", but check the configuration in MyConfig... there's a
        // field you should change if you don't want the 'back' button to go
        // from that level to the chooser.
        level.addStaticText(960 / 2 - 100, 640 / 2 - 10, "Arial", 0x00FFFF, 32, "Try Again", 0);
        level.addTapControl(0, 0, 960, 640, "", new (class _ extends LolAction {
            go() {
                level.doLevel(index);
                return true;
            }
        })());
    }
}
/// <reference path="../library/Config.ts"/>
/**
* Any configuration that the programmer needs to provide to Lol should go here.
* <p/>
* Config stores things like screen dimensions, default text and font configuration,
* and the names of all the assets (images and sounds) used by the game.
* <p/>
* Be sure to look at the Levels.java file for how each level of the game is
* drawn, as well as Splash.ts, Chooser.ts, Help.ts.
*/
class MyConfig extends Config {
    /**
    * The MyConfig object is used to pass configuration information to the LOL
    * system.
    * <p/>
    * To see documentation for any of these variables, hover your mouse
    * over the word on the left side of the equals sign.
    */
    constructor() {
        super();
        // The size of the screen, and some game behavior configuration
        this.mWidth = 960;
        this.mHeight = 640;
        this.mPixelMeterRatio = 20;
        this.mEnableVibration = true;
        this.mGameTitle = "Micah's Basic Game";
        this.mDefaultWinText = "Good Job";
        this.mDefaultLoseText = "Try Again";
        //this.mShowDebugBoxes = true;
        // Chooser configuration
        this.mNumLevels = 1;
        this.mEnableChooser = true;
        this.mUnlockAllLevels = true;
        // Font configuration
        this.mDefaultFontFace = "Arial";
        this.mDefaultFontSize = 32;
        this.mDefaultFontColor = "#FFFFFF";
        // list the images that the game will use
        this.mImageNames = new Array("https://s3.amazonaws.com/typescript-game-studio/standard/fun.jpg", "https://s3.amazonaws.com/typescript-game-studio/standard/BlueBox.png", "https://s3.amazonaws.com/typescript-game-studio/standard/OrangeBox.png");
        // list the sound effects that the game will use
        //this.mSoundNames = new string[]();
        // list the background music files that the game will use
        //this.mMusicNames = new string[]();
        // don't change these lines unless you know what you are doing
        this.mLevels = new Levels();
        this.mChooser = new Chooser();
        this.mHelp = new Help();
        this.mSplash = new Splash();
        this.mWin = new WinScene();
        this.mLose = new LoseScene();
    }
}
/// <reference path="../library/ScreenManager.ts"/>
/**
* Splash encapsulates the code that will be run to configure the opening screen of the game.
* Typically this has buttons for playing, getting help, and quitting.
*/
class Splash {
    /**
    * There is usually only one splash screen. However, the ScreenManager interface requires
    * display() to take a parameter for which screen to display.  We ignore it.
    *
    * @param index Which splash screen should be displayed (typically you can ignore this)
    * @param level The physics-based world that comprises the splash screen
    */
    display(index, level) {
        // set up a simple level. We could make interesting things happen, since
        // we've got a physics world, but we won't.
        // draw the background. Note that "Play", "Help", and "Quit" are part of
        // this background image.
        //level.drawPicture(0, 0, 48, 32, "splash.png", 0);
        // start the music
        //level.setMusic("tune.ogg");
        // This is the Play button... it switches to the first screen of the
        // level chooser. You could jump straight to the first level by using
        // "doLevel(1)", but check the configuration in MyConfig... there's a
        // field you should change if you don't want the 'back' button to go
        // from that level to the chooser.
        level.addStaticText(300, 200, "Arial", 0xFFFF00, 24, "Play", 0);
        level.addTapControl(300, 200, 100, 50, "", new (class _ extends LolAction {
            go() {
                level.doChooser(1);
                return true;
            }
        })());
        // This is the Help button... it switches to the first screen of the
        // help system
        level.addStaticText(500, 200, "Arial", 0xFFFF00, 24, "Help", 0);
        level.addTapControl(500, 200, 100, 50, "", new (class _ extends LolAction {
            go() {
                level.doHelp(1);
                return true;
            }
        })());
    }
}
/// <reference path="../library/Config.ts"/>
/// <reference path="../library/Lol.ts"/>
/// <reference path="../library/Level.ts"/>
/// <reference path="./MyConfig.ts"/>
/// <reference path="../library/typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
/// <reference path="../library/typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
document.addEventListener("DOMContentLoaded", () => {
    PIXI.utils.sayHello("Hello");
    let myConfig = new MyConfig();
    let game = new Lol(myConfig);
    game.create();
    document.body.appendChild(game.mRenderer.view);
    requestAnimationFrame(() => gameLoop(game));
});
function gameLoop(game) {
    game.render();
    requestAnimationFrame(() => gameLoop(game));
}
/// <reference path="../library/ScreenManager.ts"/>
/**
* Splash encapsulates the code that will be run to configure the opening screen of the game.
* Typically this has buttons for playing, getting help, and quitting.
*/
class WinScene {
    /**
    * There is usually only one splash screen. However, the ScreenManager interface requires
    * display() to take a parameter for which screen to display.  We ignore it.
    *
    * @param index Which splash screen should be displayed (typically you can ignore this)
    * @param level The physics-based world that comprises the splash screen
    */
    display(index, level) {
        // Configure our win screen
        // This is the Play button... it switches to the first screen of the
        // level chooser. You could jump straight to the first level by using
        // "doLevel(1)", but check the configuration in MyConfig... there's a
        // field you should change if you don't want the 'back' button to go
        // from that level to the chooser.
        level.addStaticText(960 / 2 - 100, 640 / 2 - 10, "Arial", 0x00FFFF, 32, "You Win!!", 0);
        level.addTapControl(0, 0, 960, 640, "", new (class _ extends LolAction {
            go() {
                level.doChooser(1);
                return true;
            }
        })());
    }
}
