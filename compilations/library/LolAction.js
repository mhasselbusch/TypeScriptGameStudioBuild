"use strict";
/**
 * LolAction describes code that runs in response to events.  LolAction is only intended for events
 * that take no parameters, such as events that run on a timer.
 */
class LolAction {
    constructor() {
        /// A flag to disable and re-enable actions.  This is especially useful when a LolAction is on
        /// a repeating timer.
        this.mIsActive = true;
    }
}
