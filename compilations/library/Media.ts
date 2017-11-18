/// <reference path="./Config.ts"/>

class Media {
    /// Store the fonts used by this game
    //private readonly mFonts: Map<String, BitmapFont> = new Map<>();
    /// Store the sounds used by this game
    // private readonly mSounds: Map<String, Audio>;
    /// Store the music used by this game
    // private readonly mTunes: Map<String, Music>;
    /// Store the images used by this game
    // private readonly mImages: Map<String, TextureRegion>;
    /// A copy of the game-wide configuration object
    private mConfig: Config;

    /**
     * Construct a Media object by loading all images and sounds
     *
     * @param config The game-wide configuration object, which contains lists of images and sounds
     */
    constructor(config: Config) {
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

    // /**
    //  * Clear out all assets when a game is disposed.
    //  * <p>
    //  * Dispose doesn't always mean "the game is closed forever", and the app might resurrect.  When
    //  * it does, LibGDX restores any sound/music/image assets.  However, it does not restore fonts.
    //  * Since we use FreeType to create BitmapFonts on the fly, we can just drop the font collection
    //  * when the app disposes, and then we'll recreate fonts on the fly when the app restarts.
    //  */
    // void onDispose() {
    //     mFonts.clear();
    // }
    //
    // /**
    //  * Get the font described by the file name and font size
    //  *
    //  * @param fontFileName The filename for the font. This should be in the android
    //  *                     project's assets folder, and should end in .ttf
    //  * @param fontSize     The font size to use for the BitmapFont we create
    //  * @return A font object that can be used to render text
    //  */
    // BitmapFont getFont(String fontFileName, int fontSize) {
    //     // we store fonts as their filename appended with their size
    //     String key = fontFileName + "--" + fontSize;
    //
    //     // check if we've already got this font, return it if we do
    //     BitmapFont f = mFonts.get(key);
    //     if (f != null) {
    //         // just to play it safe, make the font white... the caller can
    //         // change this
    //         f.setColor(1, 1, 1, 1);
    //         return f;
    //     }
    //
    //     // Generate the font, save it, and return it
    //     //
    //     // NB: if this crashes, the user will get a reasonably good error message
    //     FreeTypeFontParameter parameter = new FreeTypeFontParameter();
    //     parameter.size = fontSize;
    //     parameter.minFilter = Texture.TextureFilter.Linear;
    //     parameter.magFilter = Texture.TextureFilter.Linear;
    //     FreeTypeFontGenerator generator = new FreeTypeFontGenerator(Gdx.files.internal(fontFileName));
    //     generator.scaleForPixelHeight(fontSize);
    //     f = generator.generateFont(parameter);
    //     f.setUseIntegerPositions(false); // NB: when we switch to HTML builds, this helps
    //     generator.dispose();
    //     mFonts.put(key, f);
    //     return f;
    // }
    //
    // /**
    //  * Get a previously loaded Sound object
    //  *
    //  * @param soundName Name of the sound file to retrieve
    //  * @return a Sound object that can be used for sound effects
    //  */
    // Sound getSound(String soundName) {
    //     Sound ret = mSounds.get(soundName);
    //     if (ret == null) {
    //         Lol.message(mConfig, "ERROR", "Error retrieving sound '" + soundName + "'");
    //     }
    //     return ret;
    // }
    //
    // /**
    //  * Get a previously loaded Music object
    //  *
    //  * @param musicName Name of the music file to retrieve
    //  * @return a Music object that can be used to play background music
    //  */
    // Music getMusic(String musicName) {
    //     Music ret = mTunes.get(musicName);
    //     if (ret == null) {
    //         Lol.message(mConfig, "ERROR", "Error retrieving music '" + musicName + "'");
    //     }
    //     return ret;
    // }
    //
    // /**
    //  * Get a previously loaded image
    //  *
    //  * @param imgName Name of the image file to retrieve
    //  * @return a TextureRegion object that can be used to create Actors
    //  */
    // TextureRegion getImage(String imgName) {
    //     // don't give an error for "", since it's probably intentional
    //     if (imgName.equals("")) {
    //         return null;
    //     }
    //     TextureRegion ret = mImages.get(imgName);
    //     if (ret == null) {
    //         Lol.message(mConfig, "ERROR", "Error retrieving image '" + imgName + "'");
    //     }
    //     return ret;
    // }
    //
    // /**
    //  * On a volume change event, make sure all Music objects are updated
    //  */
    // void resetMusicVolume() {
    //     for (Music m : mTunes.values()) {
    //         m.setVolume(Lol.getGameFact(mConfig, "volume", 1));
    //     }
    // }
}
