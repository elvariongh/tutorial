(function(w) {
/**
 * TiledGameEngine main class
 * @constructor
 */
function TGE() {
    this.rAF = 0;           // reference for RequestAnimationFrame
    this.ttu = 0;           // TimeToUpdate - time (in ms) till next update
    this.time = 0;          // Last update time

    this.initialized = false;      // Flag to store init state
    this.running = false;   // Flag to store runloop state
}

TGE.prototype = {
    /**
     * Initialize the TGE
     */
    init: function() {
        this.initialized = true;
    },

    /**
     * Start the game loop
     */
    start: function() {
        if (!this.initialized) return;

        if (!this.running) {
            this.rAF = w.requestAnimationFrame(this.frame.bind(this));
        }

        this.running = true;
    },

    /**
     * Stop the game loop
     */
    stop: function() {
        if (this.running) {
            if (this.rAF) {
                w.cancelAnimationFrame(this.rAF);
            }
        }

        this.rAF = 0;
        this.running = false;
    },

    /**
     * Game loop body
     * @param {number}  time     frame timestamp
     */
    frame: function(time) {
        var dt = time - this.time;

        // store last update time
        this.time = time;

        // decrease update timer
        this.ttu -= dt;

        if (this.ttu > 0) {
            // nothing to update yet
            this.rAF = w.requestAnimationFrame(this.frame.bind(this));

            return;
        }

        // update and render the stage
        this.ttu = this.update(dt);
        this.render();

        // request next frame update
        this.rAF = w.requestAnimationFrame(this.frame.bind(this));
    },

    /**
     * Called internally from game loop body to update current stage
     * @param {number}  dt      time difference from last update
     * @return {number}         Return time difference (in ms) to next update
     * @private
     */
    update: function(dt) {
        console.log('update');
        return 16; // 16 ms to achieve 69 FPS
    },

    /**
     * Called internally from game loop body to render current stage
     * @private
     */
    render: function() {
        console.log('render');
    }
};

w['TiledGameEngine'] = TGE;

})(window);