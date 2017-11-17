"use strict";
/// <reference path="./Config.ts"/>
class Media {
    /**
     * Construct a Media object by loading all images and sounds
     *
     * @param config The game-wide configuration object, which contains lists of images and sounds
     */
    constructor(config) {
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
