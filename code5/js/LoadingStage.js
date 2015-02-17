(function(w, TGE) {
    /**
     * Construct LoadingStage instance 
     * @constructor
     * @extends Stage
     * @param {Assets|null|undefined}   am                  Reference to the TiledGameEngine.Assets instance or null
     * @param {boolean|undefined}       [autostart=true]    Indicates should assets loading be started on stage activation
     * @param {Screen|undefined}        [screen=undefined]  Reference to the #Screen object
     */
    function LoadingStage(am, autostart, screen) {
        TGE.Stage.call(this, 'LoadingStage');

        this.am = am ? am : new TGE.Assets();
        
        this.progress = 0;
        this.autostart = autostart !== undefined ? autostart : true;
        
        this.screen = screen;
        
        this.ctxEntity = undefined;
        this.ctxBG = undefined;
        
        this.status = {};
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
                    this.am.request(name[l]);
                    
                    this.status[name[l]] = 0;
                }
            } else {
                this.am.request(name);
                this.status[name] = 0;
            }
        };
        
        /**
         * Initiates assets loading
         * @this {LoadingStage}
         */
        o.start = function() {
            this.status['total'] = this.am.queue.length;
            
            this.am.download( this.fnDone.bind(this), this.fnProgress.bind(this) );
            
            if (this.screen) {
                // clear screen
                this.screen.clear();

                // set CTX properties once
                this.ctxBG = this.screen.getCTX(0);
                this.ctxBG.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctxBG.fillStyle = 'rgba(255, 0, 0, 0.25)';
                this.ctxBG.lineWidth = 1;
                
                this.ctxEntity = this.screen.getCTX(1);
                this.ctxEntity.textAlign = 'center'
                this.ctxEntity.textBaseline = 'middle';
                this.ctxEntity.fillStyle = 'rgba(255, 255, 255, 0.75)';
            }
        };
        
        /**
         * Callback function for all assets loaded
         * @this {LoadingStage}
         */
        o.fnDone = function() {
            console.log('all assets loaded');
            
            this.progress = 100;
        };
        
        /**
         * Callback function for asset loadeding progress
         * @param {string}  name    asset name
         * @param {number}  p       loading progress on specified asset
         * @this {LoadingStage}
         */
        o.fnProgress = function(name, p) {
            console.log(name, p);

            this.progress = 0;//~~(100 * (this.am.success + this.am.error) / this.am.queue.length);
            
            var s = 0;
            for (var k in this.status) {
                if (k === 'total') continue;
                
                if (k === name) {
                    this.status[k] = p;
                }
                
                this.progress += this.status[k];
            }
            
            this.progress = ~~(this.progress / this.status['total']);
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
            if (this.progress < 100) {
                return 500; // 2 FPS is enough for the loading stage
            } else {
                return 1000; // 1 FPS is enough for idle stage
            }
        };

        /**
         * Show progress information to user
         */
        o.render = function() {
            if (!this.screen) return;

            // render progress bar
            this.ctxBG.clearRect(0, 0, this.screen.width, this.screen.height);
            this.ctxBG.fillRect(10, this.screen.height/2 - 10, (this.screen.width-20) * this.progress / 100, 20);
            this.ctxBG.strokeRect(10, this.screen.height/2 - 10, this.screen.width-20, 20);
            
            // render progress text
            this.ctxEntity.clearRect(0, 0, this.screen.width, this.screen.height);
            this.ctxEntity.fillText(this.progress + '% Loaded', this.screen.width/2, this.screen.height/2, this.screen.width-40);
        };
     
        return o;
    })();
    
    TGE['LoadingStage'] = LoadingStage;
})(window, TiledGameEngine);