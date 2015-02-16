(function(w, TGE) {
    /**
     * Construct LoadingStage instance 
     * @constructor
     * @extends Stage
     * @param {Assets|null|undefined}   am                  Reference to the TiledGameEngine.Assets instance or null
     * @param {boolean|undefined}       [autostart=true]    Indicates should assets loading be started on stage activation
     */
    function LoadingStage(am, autostart) {
        TGE.Stage.call(this, 'LoadingStage');

        this.am = am ? am : new TGE.Assets();
        
        this.progress = 0;
        this.autostart = autostart !== undefined ? autostart : true;
    };
    
    LoadingStage.prototype = (function() {
        // super-class inheritance
        var o = Object.create(TGE.Stage.prototype);
        
        /**
         * Request new asset from server
         * @param {string}      name    Asset file name
         * @this {LoadingStage}
         */
        o.request = function(name) {
            if (Array.isArray(name)) {
                for (var l = name.length; l--; ) {
                    this.am.request(name[l-1]);
                }
            } else {
                this.am.request(name);
            }
        };
        
        /**
         * Initiates assets loading
         * @this {LoadingStage}
         */
        o.start = function() {
            this.am.download( this.fnDone.bind(this), this.fnProgress.bind(this) );
        };
        
        /**
         * Callback function for all assets loaded
         * @this {LoadingStage}
         */
        o.fnDone = function() {
            console.log('all assets loaded');
        };
        
        /**
         * Callback function for asset loadeding progress
         * @param {string}  name    asset name
         * @param {number}  p       loading progress on specified asset
         * @this {LoadingStage}
         */
        o.fnProgress = function(name, p) {
            console.log(name, p);
            this.progress = p;
        };
        
        /**
         * Activate stage. If autostart is switched on - assets loading will start
         */
        o.activate = function() {
            TiledGameEngine.Stage.prototype.activate.call(this);

            if (this.autostart) {
                this.start();
            }
        };
        
        /**
         * Update routine for the LoadingStage. It is not required more than twice per 
         * second to update progress information
         * @param {number}  dt      time difference from last update
         * @return {number}         Return time difference (in ms) to next update
         */
        o.update = function(dt) {
            return 500; // 2 FPS is enought for the loading stage
        };

        /**
         * Show progress information to user
         */
        o.render = function() {
            console.log('Progress:', this.progress);
        };
     
        return o;
    })();
    
    TGE['LoadingStage'] = LoadingStage;
})(window, TiledGameEngine);