// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.Screen('#viewport', window.innerWidth, window.innerHeight);

    // set "world" background
    this.screen.setBGColor('gray');
    
    // creat assets manager instance
    this.assets = new TiledGameEngine.Assets();
    
    // create LoadingStage instance
    this.stLoader = new TiledGameEngine.LoadingStage(this.assets, true, this.screen);
};

Game.prototype = (function() {
    // super-class inheritance
    var o = Object.create(TiledGameEngine.prototype);
    
    o.init = function() {
        // call super-class
        TiledGameEngine.prototype.init.call(this);

        // add loader stage into game loop manager
        this.addStage('load', this.stLoader);
        
        // request assets from server
        this.stLoader.request(['sage_home.png', 'sage_home.json', 'grassland1.json']);

        // activate loader stage. Loading will be started automatically (see stLoader creation)
        this.activateStage('load');

        // show screen
        this.screen.show(true);
    };
    
    return o;
})();

function start() {
    var G = new Game();
    
    G.init();
    
    G.start();
};

window.onload = start;
