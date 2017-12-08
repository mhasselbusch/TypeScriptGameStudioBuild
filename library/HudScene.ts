/// <reference path="./LolScene.ts" />
/// <reference path="./Media.ts" />

class HudScene extends LolScene {

  /**
  * Create a new heads-up display by providing the dimensions for its camera
  *
  * @param media  All image and sound assets for the game
  * @param config The game-wide configuration
  */
  constructor(config: Config, media: Media) {
    super(config, media);
  }

  /**
  * Draw the Hud
  *
  * @param sb    The spritebatch to use when drawing
  * @param delta The time since the last render
  */
  render() {
    // Advance the physics world by 1/45 of a second (1/45 is the recommended rate)
    this.mWorld.Step(1 / 45, 8, 3);

    for(let zA of this.mRenderables) {
      for(let r of zA) {
        r.render();
      }
    }
    return true;
  }
}
