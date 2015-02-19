(function(w, TGE) {

    /**
     * Game stage basic class
     * @memberOf TiledGameEngine
     * @param {string}      name    Stage name
     * @constructor
     */
    function Stage(name) {
        /** @type {boolean}         Indicates if the stage is active */
        this.active = false;
        
        /** @type {string}          Store stage name */
        this.name = name;
        
        /** @type {boolean}         Indicates if the stage need to be redrawn */
        this.redraw = false;
    };
    
    /**
     * Update stage internal objects. That routine called by main game loop
     * @param {number}  dt      time difference from last update
     * @return {number}         Return time difference (in ms) to next update
     */
    Stage.prototype.update = function(dt) {
        if (this.active) {
            return 16; // 60 FPS by default
        } else {
            return 1000; // 1 FPS in inactive state
        }
    };
        
    /**
     * Render the stage to the viewport. That routine called by main game loop
     */
    Stage.prototype.render = function() {
        if (!this.active) return;
        
        // your render code goes here
    };
        
    /**
     * Activate stage and prepare for rendering
     */
    Stage.prototype.deactivate = function() {
        this.active = false;
    };
        
    /**
     * Deactivate stage
     */
    Stage.prototype.activate = function() {
        this.active = true;
    };
    
    TGE['Stage'] = Stage;
})(window, TiledGameEngine);
