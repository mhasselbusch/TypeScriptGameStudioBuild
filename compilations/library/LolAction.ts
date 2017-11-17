/**
 * LolAction describes code that runs in response to events.  LolAction is only intended for events
 * that take no parameters, such as events that run on a timer.
 */
abstract class LolAction {
    /// A flag to disable and re-enable actions.  This is especially useful when a LolAction is on
    /// a repeating timer.
    public mIsActive: boolean = true;

    /**
     * The go() method encapsulates the code that should be run
     */
    public abstract go(): void;
}
