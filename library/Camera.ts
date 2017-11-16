// TODO: Right now the camera can only follow an actor
// The Camera is essentially a wrapper for a pixi Container
// which could contain an actor to chase
// and the scene it is acting as a camera for
class Camera {
  mContainer: PIXI.Container;
  //mScene: LolScene;
  //mChaseActor: WorldActor;
  mHeight: number;
  mWidth: number;

  constructor(x: number, y: number) {
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

  setPosition(x: number, y: number) {
    this.mContainer.position.x = x - this.mWidth / 2;
    this.mContainer.position.y = y - this.mHeight / 2;
  }

  // updatePosition() {
  //   this.mContainer.pivot = this.mChaseActor.mSprite.position;
  //   this.mContainer.position.x = this.mWidth / 2;
  //   this.mContainer.position.y = this.mHeight / 2;
  // }

  // setChase(chaseActor: WorldActor) {
  //   this.mChaseActor = chaseActor;
  // }

  setZoom(zoom: number) {
    this.mContainer.scale.set((1 / zoom), (1 / zoom));
  }

  getZoom(): number {
    return (1 / this.mContainer.scale.x);
  }

  zoomInOut(zoom: number) {
    let z = this.mContainer.scale;
    this.mContainer.scale.set(z.x * (1 / zoom), z.y * (1 /zoom));
  }
}
