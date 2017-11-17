"use strict";
/**
 * ToggleEventHandler is a wrapper for code that ought to run in response to a toggle event.
 */
class ToggleEventHandler {
    constructor() {
        /// A flag to control whether the event is allowed to execute or not
        this.mIsActive = true;
        /// The actor who generated this touch event
        this.mSource = null;
        /// A flag to track if we are in a 'hold' state
        this.isHolding = false;
    }
}
