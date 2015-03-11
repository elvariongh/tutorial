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

    this.log = document.getElementById('log');
};

TGE.prototype = {
    /**
     * Initialize the TGE
     * @this {TGE}
     * @export
     */
    init: function() {
        this.initialized = true;
        this.frame = this.frame.bind(this);
    },

    /**
     * Start the game loop
     * @this {TGE}
     * @export
     */
    start: function() {
        if (!this.initialized) return;

        if (!this.running) {
            this.rAF = w.requestAnimationFrame(this.frame);
        }

        this.running = true;

        this.log.innerHTML += Date.now() + ' TiledGameEngine started...<br />';
    },

    /**
     * Stop the game loop
     * @this {TGE}
     * @export
     */
    stop: function() {
        if (this.running) {
            if (this.rAF) {
                w.cancelAnimationFrame(this.rAF);
            }
        }

        this.rAF = 0;
        this.running = false;

        this.log.innerHTML += Date.now() + ' TiledGameEngine stopped...<br />';
    },

    /**
     * Game loop body
     * @param {number}  time     frame timestamp
     * @private
     * @this {TGE}
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
     * @this {TGE}
     */
    update: function(dt) {
        if (this.activeStage) {
            return this.activeStage.update(dt);
        }
        
        console.log('TGE::update');
        this.log.innerHTML += Date.now() + ' TGE::update<br />';
        return 16;
    },

    /**
     * Called internally from game loop body to render current stage
     * @private
     * @this {TGE}
     */
    render: function() {
        if (this.activeStage) {
            return this.activeStage.render();
        }

        console.log('TGE::render');
        this.log.innerHTML += Date.now() + ' TGE::render<br />';
    },
    
    /**
     * Add stage to the contrainer
     * @param {string}  name    Stage name
     * @param {Stage}   stage   Stage object
     * @this {TGE}
     * @export
     */
    addStage: function(name, stage) {
        if (!this.stages[name]) {
            this.stages[name] = stage;
            return true;
        }
        
        return false;
    },
    
    /**
     * Deactivate current stage and switch to the specified one
     * @param {string}      name    New stage name
     * @return {boolean}    TRUE on success
     * @this {TGE}
     * @export
     */
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