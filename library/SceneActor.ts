/// <reference path="./BaseActor.ts"/>
//// <reference path="./typedefinitions/physicstype2d/PhysicsType2d.v0_9.d.ts"/>
//// <reference path="./typedefinitions/pixi.js/index.d.ts"/>
//// <reference types="pixi.js"/>

class SceneActor extends BaseActor {
  /// Should we run code when this actor is touched?
  mIsTouchable: boolean;

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
  constructor(scene: LolScene, imgName: string, width: number, height: number) {
    super(scene, imgName, width, height);
  }

  /**
  * Disable touch for this actor
  */
  public disableTouch(): void {
    this.mIsTouchable = false;
  }

  /**
  * Enable touch for this actor
  */
  public enableTouch(): void {
    this.mIsTouchable = true;
  }
}
