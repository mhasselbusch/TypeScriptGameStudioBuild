"use strict";
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
