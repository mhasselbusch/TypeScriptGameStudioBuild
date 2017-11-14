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
    constructor(scene, imgName, width, height) {
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
    updateVelocity(x, y) {
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
    addVelocity(x, y) {
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
    setFastMoving(state) {
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
        if (this.mBody)
            this.mSprite.position.x = this.mBody.GetWorldCenter().x;
        if (this.mBody)
            this.mSprite.position.y = this.mBody.GetWorldCenter().y;
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
        this.mContainer.position.x = x - this.mWidth / 2;
        this.mContainer.position.y = y - this.mHeight / 2;
    }
    updatePosition() {
        this.mContainer.pivot = this.mChaseActor.mSprite.position;
        this.mContainer.position.x = this.mWidth / 2;
        this.mContainer.position.y = this.mHeight / 2;
    }
    setChase(chaseActor) {
        this.mChaseActor = chaseActor;
    }
    setZoom(zoom) {
        this.mContainer.scale.set(zoom, zoom);
    }
    getZoom() {
        return this.mContainer.scale;
    }
    zoomInOut(zoom) {
        let z = this.mContainer.scale;
        this.mContainer.scale.set(z.x * zoom, z.y * zoom);
    }
}
//// <reference path="./WorldActor.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
// <reference types="pixi.js"/>
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
    /// Events that get processed on every render
    //readonly mRepeatEvents: ArrayList<LolAction>;
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
        this.mRenderables = new Array();
    }
    /**
     * Add an actor to the level, putting it into the appropriate z plane
     *
     * @param actor  The actor to add
     * @param zIndex The z plane. valid values are -2, -1, 0, 1, and 2. 0 is the default.
     */
    addActor(actor, zIndex) {
        //TODO: change actor to a RENDERABLE type
        // Coerce index into legal range, then add the actor
        // zIndex = (zIndex < -2) ? -2 : zIndex;
        // zIndex = (zIndex > 2) ? 2 : zIndex;
        // mRenderables.get(zIndex + 2).add(actor);
        this.mRenderables.push(actor);
        this.mContainer.addChild(actor.mSprite);
        this.mCamera.mContainer.addChild(this.mContainer);
    }
}
//// <reference path="./Hero.ts"/>
//// <reference path="./Enemy.ts"/>
//// <reference path="./Projectile.ts"/>
//// <reference path="./LolAction.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./Config.ts"/>
//// <reference path="./Media.ts"/>
//// <reference path="./WorldActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class MainScene extends LolScene {
    constructor(config, media) {
        super(config, media);
        this.configureCollisionHandlers();
    }
    chaseActor(hero) {
        this.mChaseActor = hero;
        this.mCamera.setChase(hero);
    }
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
                console.log("In BeginContact");
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
                }
                else if (a instanceof Projectile) {
                    c0 = a;
                    c1 = b;
                }
                else if (b instanceof Projectile) {
                    c0 = b;
                    c1 = a;
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
    render() {
        this.mRenderables.forEach((e) => {
            e.render();
        });
        return true;
    }
}
/// <reference path="./LolScene.ts" />
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
// <reference types="pixi.js"/>
class HudScene extends LolScene {
    /// The set of all controls that have toggle handlers.  We need this, so we can "lift" toggles
    /// on screen change evenrs
    //readonly mToggleControls: ArrayList<SceneActor>;
    /**
     * Create a new heads-up display by providing the dimensions for its camera
     *
     * @param media  All image and sound assets for the game
     * @param config The game-wide configuration
     */
    constructor(config, media) {
        super(config, media);
        //mToggleControls = new ArrayList<>();
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
        this.mRenderables.forEach((e) => {
            e.render();
        });
        //sb.end();
        // TODO: box2d shape renderer for controls2
        // if (mConfig.mShowDebugBoxes) {
        // }
        return true;
    }
}
/// <reference path="./MainScene.ts"/>
/// <reference path="./HudScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class LolManager {
    constructor(world, hud) {
        this.mWorld = world;
        if (hud)
            this.mHud = hud;
        this.mContainer = new PIXI.Container();
        this.mContainer.addChild(this.mWorld.mCamera.mContainer);
        if (hud)
            this.mContainer.addChild(this.mHud.mCamera.mContainer);
    }
}
/// <reference path="./LolManager.ts"/>
/// <reference path="./LolScene.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>
class Lol {
    constructor(manager, config) {
        this.mManager = manager;
        this.mConfig = config;
        this.mRenderer = PIXI.autoDetectRenderer(config.mWidth, config.mHeight);
    }
    /**
     * This code is called every 1/45th of a second to update the game state and re-draw the screen
     * <p>
     * NB: This is an internal method. User code should never call this.
     */
    render() {
        this.mManager.mWorld.mWorld.Step(1 / 45, 8, 3);
        this.mManager.mWorld.mCamera.updatePosition();
        this.mManager.mWorld.render();
        this.mManager.mHud.render();
        this.mRenderer.render(this.mManager.mContainer);
        this.mManager.mWorld.mOneTimeEvents.forEach((pe) => {
            pe.go();
        });
    }
}
/// <reference path="./Config.ts"/>
class Media {
    /**
     * Construct a Media object by loading all images and sounds
     *
     * @param config The game-wide configuration object, which contains lists of images and sounds
     */
    Media(config) {
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
/// <reference path="./Lol.ts"/>
/// <reference path="./Config.ts"/>
/// <reference path="./Media.ts"/>
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
}
/// <reference path="./Level.ts"/>
/// <reference path="./ScreenManager.ts"/>
/**
 * Config stores game-specific configuration values.
 * <p>
 * A programmer should extend Config, and change these values in their class constructor.
 */
class Config {
}
/// <reference path="./BaseActor.ts"/>
//// <reference path="./MainScene.ts"/>
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
        this.mGame = game;
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
    /// A callback to run when the enemy is defeated
    //private mDefeatCallback: LolActorEvent;
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
}
//// <reference path="./WorldActor.ts"/>
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
    onCollide(other, contact) {
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
}
// Testing file
/// <reference path="./MainScene.ts"/>
/// <reference path="./Hero.ts"/>
/// <reference path="./LolScene.ts"/>
/// <reference path="./Lol.ts"/>
/// <reference path="./Obstacle.ts"/>
/// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
/// <reference types="pixi.js"/>
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
    let myMedia = new Media();
    let mainScene = new MainScene(myConfig, myMedia);
    let hud = new HudScene(myConfig, myMedia);
    let mgr = new LolManager(mainScene, hud);
    let game = new Lol(mgr, myConfig);
    document.body.appendChild(game.mRenderer.view);
    let myHero = new Hero(game, mainScene, 25, 25, heroImg);
    myHero.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.DYNAMIC, 100, 100);
    myHero.updateVelocity(speed, 0);
    mainScene.addActor(myHero, 1);
    mainScene.chaseActor(myHero);
    let Obstacle1 = new Obstacle(game, mainScene, 25, 25, obstImg);
    Obstacle1.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 0, 0);
    let Obstacle2 = new Obstacle(game, mainScene, 50, 50, obstImg);
    Obstacle2.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 200, 200);
    let Obstacle3 = new Obstacle(game, mainScene, 50, 50, obstImg);
    Obstacle3.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.KINEMATIC, 75, 25);
    mainScene.addActor(Obstacle1, 0);
    mainScene.addActor(Obstacle2, 0);
    mainScene.addActor(Obstacle3, 0);
    let zoominBtn = new SceneActor(hud, zoomInImg, 25, 25);
    let zoomoutBtn = new SceneActor(hud, zoomOutImg, 25, 25);
    zoominBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 50, 10);
    zoomoutBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 10, 10);
    hud.addActor(zoominBtn, 2);
    hud.addActor(zoomoutBtn, 2);
    let upBtn = new SceneActor(hud, upImg, 25, 25);
    let downBtn = new SceneActor(hud, downImg, 25, 25);
    upBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 380);
    downBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 400, 420);
    hud.addActor(upBtn, 2);
    hud.addActor(downBtn, 2);
    let leftBtn = new SceneActor(hud, leftImg, 25, 25);
    let rightBtn = new SceneActor(hud, rightImg, 25, 25);
    leftBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 380, 400);
    rightBtn.setBoxPhysics(PhysicsType2d.Dynamics.BodyType.STATIC, 420, 400);
    hud.addActor(leftBtn, 2);
    hud.addActor(rightBtn, 2);
    mgr.mContainer.interactive = true;
    zoominBtn.mSprite.interactive = true;
    zoomoutBtn.mSprite.interactive = true;
    upBtn.mSprite.interactive = true;
    downBtn.mSprite.interactive = true;
    leftBtn.mSprite.interactive = true;
    rightBtn.mSprite.interactive = true;
    zoominBtn.mSprite.on('click', () => mgr.mWorld.mCamera.zoomInOut(1.25));
    zoomoutBtn.mSprite.on('click', () => mgr.mWorld.mCamera.zoomInOut(0.75));
    upBtn.mSprite.on('click', () => myHero.updateVelocity(0, -speed));
    downBtn.mSprite.on('click', () => myHero.updateVelocity(0, speed));
    leftBtn.mSprite.on('click', () => myHero.updateVelocity(-speed, 0));
    rightBtn.mSprite.on('click', () => myHero.updateVelocity(speed, 0));
    // mgr.mWorld.mWorld.SetContactListener(new (class myContactListener extends PhysicsType2d.Dynamics.ContactListener {
    //   constructor() {
    //     super();
    //   }
    //   public BeginContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    //     console.log("CONTACT!");
    //   }
    //   public EndContact(contact: PhysicsType2d.Dynamics.Contacts.Contact): void {
    //   }
    //   public PreSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, oldManifold: PhysicsType2d.Collision.Manifold): void {
    //   }
    //   public PostSolve(contact: PhysicsType2d.Dynamics.Contacts.Contact, impulse: PhysicsType2d.Dynamics.ContactImpulse): void {
    //   }
    // })());
    requestAnimationFrame(() => gameLoop2(game));
}
function gameLoop2(game) {
    game.render();
    requestAnimationFrame(() => gameLoop2(game));
}