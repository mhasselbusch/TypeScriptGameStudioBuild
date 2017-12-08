/*
 * The Camera is essentially a wrapper for a pixi Container
 * which could contain an actor to chase
 * and the scene it is acting as a camera for
 */
class Camera {
  mContainer: PIXI.Container;
  mHeight: number;
  mWidth: number;

  constructor(x: number, y: number) {
    this.mContainer = new PIXI.Container();
    this.mWidth = x;
    this.mHeight = y;
  }

  /*
   * Sets the position of the camera
   */
  setPosition(x: number, y: number) {
    this.mContainer.position.x = x;
    this.mContainer.position.y = y;
  }

  /*
   * Tells the camera to center on a coordinate
   */
  centerOn(x: number, y: number) {
    this.mContainer.pivot.x = x;
    this.mContainer.pivot.y = y;
  }

  /*
   * Sets the zoom, <1 zooms in, >1 zooms out
   */
  setZoom(zoom: number) {
    this.mContainer.scale.set((1 / zoom), (1 / zoom));
  }

  /*
   * Gets the current amount of zoom
   */
  getZoom(): number {
    return (1 / this.mContainer.scale.x);
  }

  /*
   * Zooms in or out based on the zoom factor, <1 zooms in, >1 zooms out
   */
  zoomInOut(zoom: number) {
    let z = this.mContainer.scale;
    this.mContainer.scale.set(z.x * (1 / zoom), z.y * (1 /zoom));
  }
}
