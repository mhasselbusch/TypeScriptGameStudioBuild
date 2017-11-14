/// <reference path="./Lol.ts"/>
/// <reference path="./Config.ts"/>
/// <reference path="./Media.ts"/>

class Level {
  /// A reference to the game object, so we can access session facts and the state machine
  private readonly mGame: Lol;
  /// A reference to the game-wide configuration variables
  protected readonly mConfig: Config;
  /// A reference to the object that stores all of the sounds and images we use in the game
  protected readonly mMedia: Media;

  /**
   * Construct a level.  Since Level is merely a facade, this method need only store references to
   * the actual game objects.
   *
   * @param config The configuration object describing this game
   * @param media  References to all image and sound assets
   * @param game   The top-level game object
   */
  constructor(config: Config, media: Media, game: Lol) {
      // save game configuration information
      this.mGame = game;
      this.mConfig = config;
      this.mMedia = media;
  }
}
