
/**
 * ToggleEventHandler is a wrapper for code that ought to run in response to a toggle event.
 */
abstract class ToggleEventHandler {
    /// A flag to control whether the event is allowed to execute or not
    public mIsActive: boolean = true;

    /// The actor who generated this touch event
    public mSource: BaseActor | null = null;

    /// A flag to track if we are in a 'hold' state
    public isHolding: boolean = false;

    /**
     * The go() method encapsulates the code that should be run in response to a toggle event.
     *
     * @param isUp           True of the source is being released, false otherwise
     * @param eventPositionX The screen X coordinate of the touch
     * @param eventPositionY The screen Y coordinate of the touch
     */
    public abstract go(isUp: boolean, eventPositionX: number, eventPositionY: number): boolean;
}
