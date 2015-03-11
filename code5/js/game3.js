// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.Screen('#viewport', 640, 480);//window.innerWidth, window.innerHeight);

    // set "world" background
    this.screen.setBGColor('gray');
    
    // creat assets manager instance
    this.assets = new TiledGameEngine.Assets();
    
    // create LoadingStage instance
    var stage = new TiledGameEngine.LoadingStage(this.assets, true, this.screen);

    // add loader stage into game loop manager
    this.addStage('load', stage);
};

Game.prototype = (function() {
    // super-class inheritance
    var o = Object.create(TiledGameEngine.prototype);
    
    o.init = function() {
        // call super-class
        TiledGameEngine.prototype.init.call(this);

        // request assets from server
        var stage = this.getStage('load');
        stage.request('viewport.png');

        // activate loader stage. Loading will be started automatically (see stLoader creation)
        this.activateStage('load');

        // show screen
        this.screen.show(true);
    };
    
    return o;
})();

var G = new Game();
    
    G.init();
