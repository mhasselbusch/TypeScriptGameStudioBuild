/// <reference path="./Config.ts"/>

class Media {
    /// Store the sounds used by this game
    private readonly mSounds: Map<string, Sound>;
    /// Store the music used by this game
    private readonly mTunes: Map<string, Sound>;
    /// Store the images used by this game
    private readonly mImages: Map<string, PIXI.Texture>;
    /// A copy of the game-wide configuration object
    private mConfig: Config;

    /**
     * Construct a Media object by loading all images and sounds
     *
     * @param config The game-wide configuration object, which contains lists of images and sounds
     */
    constructor(config: Config) {
        this.mConfig = config;
        this.mSounds = new Map<string, Sound>();
        this.mTunes = new Map<string, Sound>();
        for (let imgName of config.mImageNames) {
            // PIXI has a built-in image loader
            PIXI.loader.add(imgName);

            //let texture: PIXI.Texture
            //this.mImages.set(imgName, texture);
        }
        //PIXI.loader.load();
        for (let soundName of config.mSoundNames) {
            let s: Sound = new Sound(soundName);
            this.mSounds.set(soundName, s);
        }
        for (let musicName of config.mMusicNames) {
            let m: Sound = new Sound(musicName);
            m.setLooping(true);
            this.mTunes.set(musicName, m);
        }
    }

    /**
     * Get a previously loaded Sound object
     *
     * @param soundName Name of the sound file to retrieve
     * @return a Sound object that can be used for sound effects
     */
    getSound(soundName: string): Sound {
        let ret: Sound = this.mSounds.get(soundName);
        if (ret == null) {
          Lol.message(this.mConfig, "ERROR", "Error retrieving sound '" + soundName + "'");
        }
        return ret;
    }

    /**
     * Get a previously loaded Music object
     *
     * @param musicName Name of the music file to retrieve
     * @return a Music object that can be used to play background music
     */
    getMusic(musicName: string): Sound {
        let ret: Sound = this.mTunes.get(musicName);
        if (ret == null) {
            Lol.message(this.mConfig, "ERROR", "Error retrieving music '" + musicName + "'");
        }
        return ret;
    }
}
