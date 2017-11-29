/**
 * TouchEventHandler is a wrapper for code that ought to run in response to a touch event.
 *
 * We can use TouchEventHandlers to specify how a game should respond to a taps, pan stops, and
 * other touch events
 */
abstract class TouchEventHandler {
    /// A flag to control whether the event is allowed to execute or not
    public mIsActive: boolean = true;

    /// The actor who generated this touch event
    public mSource: BaseActor | null = null;

    /**
     * The go() method encapsulates the code that should be run in response to a touch event.
     *
     * @param eventPositionX The screen X coordinate of the touch
     * @param eventPositionY The screen Y coordinate of the touch
     */
    public abstract go(eventPositionX: number, eventPositionY: number): boolean;
}
