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
        
        this.img = undefined;
        
        this.status = {};
    };
    
    // super-class inheritance
    LoadingStage.prototype = Object.create(TGE.Stage.prototype);
    
    /**
     * Request new asset from server
     * @param {string}      name    Asset file name
     * @this {LoadingStage}
     */
    LoadingStage.prototype.request = function(name) {
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
    LoadingStage.prototype.start = function() {
        this.status['total'] = this.am.queue.length;
        
        this.am.download( this.fnDone.bind(this), this.fnProgress.bind(this) );
        
        if (this.screen) {
            // clear screen
            this.screen.clear();
            
            // move viewport to initial position
            this.screen.move(-251, -52);

            // set CTX properties once
            this.ctxBG = this.screen.getCTX(0);
            this.ctxBG.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctxBG.fillStyle = 'rgba(255, 0, 0, 0.25)';
            this.ctxBG.lineWidth = 1;
            
            this.ctxEntity = this.screen.getCTX(1);
            this.ctxEntity.textAlign = 'center'
            this.ctxEntity.textBaseline = 'middle';
            this.ctxEntity.fillStyle = 'rgba(255, 255, 255, 0.75)';

            // subscribe to Viewport events
            TGE.bus.subscribe('onViewportResize', this.onViewportResize.bind(this));
            TGE.bus.subscribe('onViewportMove', this.onViewportMove.bind(this));
        }
    };
    
    LoadingStage.prototype.onViewportResize = function(key, value) {
        // set CTX properties once
        this.ctxBG.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctxBG.fillStyle = 'rgba(255, 0, 0, 0.25)';
        this.ctxBG.lineWidth = 1;
        
        this.ctxEntity.textAlign = 'center'
        this.ctxEntity.textBaseline = 'middle';
        this.ctxEntity.fillStyle = 'rgba(255, 255, 255, 0.75)';
        
        // mark stage for redraw
        this.redraw = true;
        TGE.bus.notify('invalidateStage', this.name);
    };
    
    LoadingStage.prototype.onViewportMove = function(key, value) {
        this.redraw = true;

        TGE.bus.notify('invalidateStage', this.name);
    };
    
    /**
     * Callback function for all assets loaded
     * @this {LoadingStage}
     */
    LoadingStage.prototype.fnDone = function() {
        console.log('all assets loaded');
        
        this.progress = 100;
        
        this.img = this.am.get('viewport.png');

        // mark stage for redraw
        this.redraw = true;
    };
    
    /**
     * Callback function for asset loadeding progress
     * @param {string}  name    asset name
     * @param {number}  p       loading progress on specified asset
     * @this {LoadingStage}
     */
    LoadingStage.prototype.fnProgress = function(name, p) {
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

        // mark stage for redraw
        this.redraw = true;
    };
    
    /**
     * Activate stage. If autostart is switched on - assets loading will start
     */
    LoadingStage.prototype.activate = function() {
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
    LoadingStage.prototype.update = function(dt) {
        if (this.progress < 100) {
            // mark stage as invalid - redraw required
            this.redraw = true;

            return 500; // 2 FPS is enough for the loading stage
        } else {
            return 1000; // 1 FPS is enough for idle stage
        }
    };

    /**
     * Show progress information to user
     */
    LoadingStage.prototype.render = function() {
        console.log('LoadingStage::render');
        // mark stage as up to date - no redraw needed
        this.redraw = false;
        
        if (!this.screen) return;

        // viewport array structure: [left, top, width, height, visible]
        var vp = this.screen.viewport;
        
        // render progress bar
        this.ctxBG.clearRect(0, 0, vp[2], vp[3]);

        if (this.img) {
            this.ctxBG.drawImage(this.img, vp[0], vp[1]);
        }
        
        this.ctxBG.fillRect(260 + vp[0], 60 + vp[3]/2 - 10 + vp[1], (vp[2]-20) * this.progress / 100, 20);
        this.ctxBG.strokeRect(260 + vp[0], 60 + vp[3]/2 - 10 + vp[1], vp[2]-20, 20);
        
        // render progress text
        this.ctxEntity.clearRect(0, 0, vp[2], vp[3]);
        
        this.ctxEntity.fillText(this.progress + '% Loaded', 260 + vp[2]/2 + vp[0], 60 + vp[3]/2 + vp[1], vp[2]-60);
    };
   
    TGE['LoadingStage'] = LoadingStage;
})(window, TiledGameEngine);