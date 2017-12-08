/// <reference path="./LolScene.ts"/>

class QuickScene extends LolScene {
    /// A flag for disabling the scene, so we can keep it from displaying
    private mDisable: boolean;
    /// Track if the Scene is visible. Initially it is not.
    mVisible: boolean;
    /// Sound to play when the scene is displayed
    private mSound: Sound;
    /// Time that the Scene started being shown, so we can update timers
    private mDisplayTime: number;
    /// True if we must click in order to clear the scene
    private mClickToClear: boolean;
    /// Some default text that we might want to display
    private mText: string;
    /// Scene-specific code to run when we show() a scene
    private mShowAction: LolAction;
    /// Scene-specific code to run when we dismiss() a scene
    private mDismissAction: LolAction;

    /**
     * Construct a QuickScene with default show and dismiss behaviors
     *
     * @param media       The media object, with all loaded sound and image files
     * @param config      The game-wide configuration
     * @param defaultText The default text to display, centered, on this QuickScene
     */
    constructor(config: Config, media: Media, defaultText: string) {
        super(config, media);
        this.mClickToClear = true;
        this.mText = defaultText;

        let out_this = this;
        // Set the default dismiss action to clear the screen and fix the timers
        this.mDismissAction = new (class _ extends LolAction {
            public go(): void {
                if (out_this.mClickToClear) {
                  let showTime: number = (new Date()).getTime() - out_this.mDisplayTime;
                    PIXI.ticker.shared.start();
                }
            }
        })();
    }
    /**
     * Render the QuickScene, or return false if it is not supposed to be shown
     * @return true if the PauseScene was drawn, false otherwise
     */
    render(): boolean {
        return true;
    }
    /**
     * Indicate that this scene should not be displayed
     */
    public disable(): void {
        this.mDisable = true;
    }
    /**
     * Set the text that should be drawn, centered, when the Scene is shown
     *
     * @param text The text to display. Use "" to disable
     */
    public setDefaultText(text: string): void {
        this.mText = text;
    }

    /**
     * Reset a scene, so we can change what is on it.  Only useful for the scenes we might show more
     * than once (such as the PauseScene)
     */
    public reset(): void {
        this.mDisable = false;
        this.mVisible = false;
        //this.mSound = null;
        this.mDisplayTime = 0;
        this.mClickToClear = true;
        this.mText = "";
        super.reset();
    }

    /**
     * Show the scene
     */
    public show(): void {
        this.mVisible = true;
        if (this.mShowAction != null) {
            this.mShowAction.go();
        }
    }

    /**
     * Stop showing the scene
     */
    public dismiss(): void {
        this.mVisible = false;
        this.mDismissAction.go();
    }

    /**
     * Provide some custom code to run when the scene is dismissed
     *
     * @param dismissAction The code to run
     */
    setDismissAction(dismissAction: LolAction): void {
        this.mDismissAction = dismissAction;
    }

    /**
     * Provide some custom code to run when the scene is dismissed
     *
     * @param showAction The code to run
     */
    setShowAction(showAction: LolAction): void {
        this.mShowAction = showAction;
    }
}
