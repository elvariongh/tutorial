// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.Screen('#viewport', window.innerWidth, window.innerHeight);

    // set "world" background
    this.screen.setBGColor('black');
    
    // creat assets manager instance
    this.assets = new TiledGameEngine.Assets();
    
    this.assetsLoaded = false;
    
    // create LoadingStage instance
    var stage = new TiledGameEngine.LoadingStage(this.assets, true, this.screen);

    // add loader stage into game loop manager
    this.addStage('load', stage);
    
    // TMX Map parser
    this.map = new TiledGameEngine.TiledMap(this.assets, 'sage_home.json');
};

Game.prototype = (function() {
    // super-class inheritance
    var o = Object.create(TiledGameEngine.prototype);
    
    o.init = function() {
        // call super-class
        TiledGameEngine.prototype.init.call(this);

        // request assets from server
        var stage = this.getStage('load');
        stage.request('sage_home.json');
        
        TiledGameEngine.bus.subscribe('assetsLoaded', this.onAssetsLoaded.bind(this));

        // activate loader stage. Loading will be started automatically (see stLoader creation)
        this.activateStage('load');

        // show screen
        this.screen.show(true);
    };
    
    o.onAssetsLoaded = function() {
        console.log('onAssetsLoaded');
        
        if (!this.assetsLoaded) {
            // download assets from map
            this.assetsLoaded = true;
            
            var stage = this.getStage('load');
            
            stage.request(this.map.getAssets());
            
            stage.start();
        } else {
            this.map.parse();
        }
    };
    
    return o;
})();

var G;
function start() {
    G = new Game();
    
    G.init();
    
    G.start();
};

window.onload = start;
