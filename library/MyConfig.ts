/**
 * Any configuration that the programmer needs to provide to Lol should go here.
 * <p/>
 * Config stores things like screen dimensions, default text and font configuration,
 * and the names of all the assets (images and sounds) used by the game.
 * <p/>
 * Be sure to look at the Levels.java file for how each level of the game is
 * drawn, as well as Splash.java, Chooser.java, Help.java, and Store.java.
 */
class MyConfig extends Config {

    /**
     * The MyConfig object is used to pass configuration information to the LOL
     * system.
     * <p/>
     * To see documentation for any of these variables, hover your mouse
     * over the word on the left side of the equals sign.
     */
    public MyConfig() {
        // The size of the screen, and some game behavior configuration
        this.mWidth = 960;
        this.mHeight = 640;
        this.mPixelMeterRatio = 20;
        this.mEnableVibration = true;
        this.mGameTitle = "My Lol Game";
        this.mDefaultWinText = "Good Job";
        this.mDefaultLoseText = "Try Again";

        // Chooser configuration
        this.mNumLevels = 94;
        this.mEnableChooser = true;
        this.mUnlockAllLevels = true;

        // Font configuration
        this.mDefaultFontFace = "arial";
        this.mDefaultFontSize = 32;
        this.mDefaultFontColor = "#FFFFFF";

        // list the images that the game will use
        this.mImageNames = new Array<string>(
                // The non-animated actors in the game
                "greenball.png", "mustardball.png", "redball.png", "blueball.png",
                "purpleball.png", "greyball.png",
                // Images that we use for buttons in the Splash and Chooser
                "leftarrow.png", "rightarrow.png", "backarrow.png", "leveltile.png",
                "audio_on.png", "audio_off.png",
                // Background images we use on QuickScenes
                "red.png", "msg1.png", "msg2.png", "fade.png",
                // The backgrounds for the Splash and Chooser
                "splash.png", "chooser.png",
                // Layers for Parallax backgrounds and foregrounds
                "mid.png", "front.png", "back.png",
                // The animation for a star with legs
                "legstar1.png", "legstar2.png", "legstar3.png", "legstar4.png",
                "legstar5.png", "legstar6.png", "legstar7.png", "legstar8.png",
                // The animation for the star with legs, with each image flipped
                "fliplegstar1.png", "fliplegstar2.png", "fliplegstar3.png", "fliplegstar4.png",
                "fliplegstar5.png", "fliplegstar6.png", "fliplegstar7.png", "fliplegstar8.png",
                // The flying star animation
                "flystar1.png", "flystar2.png",
                // Animation for a star that expands and then disappears
                "starburst1.png", "starburst2.png", "starburst3.png", "starburst4.png",
                // eight colored stars
                "colorstar1.png", "colorstar2.png", "colorstar3.png", "colorstar4.png",
                "colorstar5.png", "colorstar6.png", "colorstar7.png", "colorstar8.png",
        );

        // list the sound effects that the game will use
        this.mSoundNames = new Array<string>(
                "hipitch.ogg", "lowpitch.ogg",
                "losesound.ogg", "winsound.ogg",
                "slowdown.ogg", "woowoowoo.ogg", "fwapfwap.ogg",
        );

        // list the background music files that the game will use
        this.mMusicNames = new Array<string>("tune.ogg");

        // don't change these lines unless you know what you are doing
        // THESES WILL BE THE USER CREATED CLASSES
        //this.mLevels = new Levels();
        //this.mChooser = new Chooser();
        //this.mHelp = new Help();
        //this.mSplash = new Splash();
        //this.mStore = new Store();
    }
}
