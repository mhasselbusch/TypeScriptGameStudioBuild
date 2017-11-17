"use strict";
/**
* Renderable is the base of all objects that can be displayed on the screen.  At its most simple
* level, a Renderable is simply a function (<code>onRender</code>), and a flag to indicate whether
* the object is currently active and enabled, or disabled.
*/
class Renderable {
    constructor() {
        /// Track if the object is currently allowed to be rendered.
        /// When it is false, we don't run any updates on the object
        this.mEnabled = true;
    }
    /**
    * Specify whether this Renderable object is enabled or disabled.  When it is disabled, it
    * effectively does not exist in the game.
    *
    * @param val The new state (true for enabled, false for disabled)
    */
    setEnabled(val) {
        this.mEnabled = val;
    }
    /**
    * Return the current enabled/disabled state of this Renderable
    *
    * @return The state of the renderable
    */
    getEnabled() {
        return this.mEnabled;
    }
    /**
    * Render something to the screen.  This doesn't do the actual rendering,
    * instead it forwards to the onRender function, but only if the object
    * is enabled.
    */
    render() {
        if (!this.mEnabled)
            return;
        this.onRender();
    }
}
