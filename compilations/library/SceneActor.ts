/// <reference path="./BaseActor.ts"/>

class SceneActor extends BaseActor {
  /// Should we run code when this actor is touched?
  mIsTouchable: boolean;

  /**
  * Construct a SceneActor, but do not give it any physics yet
  *
  * @param scene   The scene into which this actor should be placed
  * @param imgName The image to show for this actor
  * @param width   The width of the actor's image and body, in pixels
  * @param height  The height of the actor's image and body, in pixels
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
