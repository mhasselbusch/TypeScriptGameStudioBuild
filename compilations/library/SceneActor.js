"use strict";
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
