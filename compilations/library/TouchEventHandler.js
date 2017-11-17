"use strict";
/**
 * TouchEventHandler is a wrapper for code that ought to run in response to a touch event.
 *
 * We can use TouchEventHandlers to specify how a game should respond to a taps, pan stops, and
 * other touch events
 */
class TouchEventHandler {
    constructor() {
        /// A flag to control whether the event is allowed to execute or not
        this.mIsActive = true;
        /// The actor who generated this touch event
        this.mSource = null;
    }
}
