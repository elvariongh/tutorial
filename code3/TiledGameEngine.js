(function(w) {
/**
 * TiledGameEngine main class
 * @constructor
 */
function TGE() {
    this.rAF = 0;                   // reference for RequestAnimationFrame
    this.ttu = 0;                   // TimeToUpdate - time (in ms) till next update
    this.time = 0;                  // Last update time

    this.initialized = false;       // Flag to store init state
    this.running = false;           // Flag to store runloop state
    
    this.stages = {};               // key:value dictionary of game stages
    this.activeStage = undefined;   // Current active stage name
};

TGE.prototype = {
    /**
     * Initialize the TGE
     */
    init: function() {
        this.initialized = true;
        this.frame = this.frame.bind(this);
    },

    /**
     * Start the game loop
     */
    start: function() {
        if (!this.initialized) return;

        if (!this.running) {
            this.rAF = w.requestAnimationFrame(this.frame);
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

        if (this.ttu - dt > 0) {
            // nothing to update yet
            this.rAF = w.requestAnimationFrame(this.frame);

            return;
        }

        // store last update time
        this.time = time;
        
        // update and render the stage
        this.ttu = this.update(dt);
        this.render();

        // request next frame update
        this.rAF = w.requestAnimationFrame(this.frame);
    },

    /**
     * Called internally from game loop body to update current stage
     * @param {number}  dt      time difference from last update
     * @return {number}         Return time difference (in ms) to next update
     * @private
     */
    update: function(dt) {
        if (this.activeStage) {
            return this.activeStage.update(dt);
        }
        
        console.log('TGE::update');
        return 16;
    },

    /**
     * Called internally from game loop body to render current stage
     * @private
     */
    render: function() {
        if (this.activeStage) {
            return this.activeStage.render();
        }

        console.log('TGE::render');
    },
    
    addStage: function(name, stage) {
        if (!this.stages[name]) {
            this.stages[name] = stage;
            return true;
        }
        
        return false;
    },
    
    activateStage: function(name) {
        if (this.activeStage) {
            this.activeStage.deactivate();
            
            this.activeStage = undefined;
        }
        
        if (this.stages[name]) {
            this.activeStage = this.stages[name];

            this.activeStage.activate();
        }
        
        return this.activeStage !== undefined;
    }
};

w['TiledGameEngine'] = TGE;

})(window);