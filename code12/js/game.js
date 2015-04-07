// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.ViewPort('#viewport', 640, 480);//window.innerWidth, window.innerHeight);

    // set "world" background
    this.screen.setBGColor('black');
    
    // creat assets manager instance
    this.assets = new TiledGameEngine.Assets();
    
    this.assetsLoaded = false;
    
    // create LoadingStage instance
    var stage = new TiledGameEngine.LoadingStage(this.assets, this.screen, true, 3);
    // add loader stage into game loop manager
    this.addStage('load', stage);
    
    // TMX Map parser
//    this.map = new TiledGameEngine.TiledMap(this.assets, 'grassland1.json');
    this.map = new TiledGameEngine.TiledMap(this.assets, 'sage_home.json');

    // create MapStage instance
    stage = new TiledGameEngine.TiledMapStage(this.assets, this.screen, this.map);
    this.addStage('playground', stage);
};

// super-class inheritance
Game.prototype = Object.create(TiledGameEngine.prototype);
    
Game.prototype.init = function() {
    // call super-class
    TiledGameEngine.prototype.init.call(this);

    // request assets from server
    var stage = this.getStage('load');
    stage.request(this.map.asset);
    
    TiledGameEngine.bus.subscribe('assetsLoaded', this.onAssetsLoaded.bind(this));
    
    TiledGameEngine.bus.subscribe('tmxMapParsed', this.onMapParsed.bind(this));
    
    TiledGameEngine.bus.subscribe('screenAnimationEnd', this.onScreenAnimationEnd.bind(this));
    
    TiledGameEngine.bus.subscribe('mousemove', 	this.onMouseMove.bind(this));
    TiledGameEngine.bus.subscribe('click', 		this.onMouseClick.bind(this));
};

Game.prototype.start = function() {
    // activate loader stage. Loading will be started automatically (see stLoader creation)
    this.activateStage('load');

    // show screen
    this.screen.show(true);

    // call super-class
    TiledGameEngine.prototype.start.call(this);
};

Game.prototype.stop = function() {
    this.assetsLoaded = false;

    // hide screen
    this.screen.show(false);
    
    // call super-class
    TiledGameEngine.prototype.stop.call(this);
}

Game.prototype.toggleFullscreen = function() {
    this.screen.fullscreen();
}
    
Game.prototype.onAssetsLoaded = function() {
    if (!this.assetsLoaded) {
        // .json file loaded - time to download assets from map
        this.assetsLoaded = true;
        
        var stage = this.getStage('load');
        
        stage.request(this.map.asset);
        stage.request(this.map.getAssets());
        
        stage.setStage(2);
        
        stage.start();
    } else {
        // all assets loaded - time to parse map
        var stage = this.getStage('load');
        stage.setStage(3);

        this.map.parse();
        
//        setTimeout((function() { this.map.parse(); }).bind(this), 0);
    }
};

Game.prototype.toggleGrid = function() {
    var stage = this.getStage('playground');
    stage.showGrid ^= 1;
    stage.redraw = 1;
    TiledGameEngine.bus.notify('invalidateStage', stage['name']);
};

Game.prototype.toggleEarthQuake = function() {

//    console.profile('earth');

    var stage = this.getStage('playground');
    stage.earthQuake ^= 1;
    stage.redraw = 1;

    TiledGameEngine.bus.notify('invalidateStage', stage['name']);
};

Game.prototype.options = function() {
    var el = document.getElementById('options');
    
    if (el.style.display === 'block') el.style.display = 'none';
    else el.style.display = 'block';
};

Game.prototype.toggleAnimation = function() {
    var stage = this.getStage('playground');
    stage.animation ^= 1;
    stage.redraw = 1;
};

Game.prototype.onMapParsed = function(key, value) {
    
    TiledGameEngine.EntitiesFactory.createPool({    type: 'Selection',
                                                    x: 0,
                                                    y: 0,
                                                    fps: 8,
                                                    color: 'rgba(255, 255, 255, 0.03)',

                                                    // pool specific params
                                                    poolSize: 2
                                                    }, this.assets, this.map);

    TiledGameEngine.EntitiesFactory.createPool({    type: 'Target',
                                                    x: 0,
                                                    y: 0,
                                                    fps: 30,
                                                    color: 'rgba(255, 255, 255, 0.3)',
                                                    
                                                    // pool specific params
                                                    poolSize: 1
                                                    }, this.assets, this.map);
                                                    
    this.path = TiledGameEngine.EntitiesFactory.create({type: 'Path'}, this.assets, this.map);
    
    this.map.addEntity(this.path);
    
    this.sel = TiledGameEngine.EntitiesFactory.retain('Selection');
    
    this.map.addEntity(this.sel);
    
    this.sel.visible = true;

    this.map.moveEntity(this.sel, 9, 8);

    obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
    if (obj) {
        this.sel.bind(obj);
    }
    
    setTimeout((function() { this.screen.fade(false); }).bind(this), 1000);
//    setTimeout((function() { this.activateStage('playground'); }).bind(this), 1000);
};

Game.prototype.onMouseMove = function(key, value) {
    return;
    
    // if (this.activeStage.name !== "TiledMapStage") return;
    
    // var iso = this.activeStage.scr2Tile(value.x, value.y);

    // this.map.moveEntity(this.sel, iso[0], iso[1]);
};

Game.prototype.onMouseClick = function(key, value) {
    
    // Track clicks only on playground
    if (this.activeStage.name !== "TiledMapStage") return;
    
    // convert screen coordinates to tile
    var iso = this.activeStage.scr2Tile(value.x, value.y);

    // Hightlight click
    var tgt = TiledGameEngine.EntitiesFactory.retain('Target');
    tgt.visible = true;
    this.map.addEntity(tgt);
    this.map.moveEntity(tgt, iso[0], iso[1]);

    // get object from click position
    var obj = this.map.getEntityByXY(iso[0], iso[1]);

    if (!obj) {
        // no object was clicked - find path to the target position
        var p = this.map.getPath(this.sel.x, this.sel.y, iso[0], iso[1]);
        if (p) {
            // for debug purposes only - show path on screen
            this.path.setPath(p);

            // get currently selected object
            obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
            if (obj) {
                // set path for that object
                if (obj.setPath) {
                    obj.setPath(p);
                }
            }
        }
    } else {
        // selectable object was clicked - change selection
        // highlight newly selected entitiy
        this.map.moveEntity(this.sel, iso[0], iso[1]);
        this.sel.visible = true;
        
        // bind selection entity to the newly selected object
        this.sel.bind(obj);
    }
};

Game.prototype.onScreenAnimationEnd = function(key, value) {
    if (value.visible) {
//        this.activateStage('playground');
    } else {
/*        setTimeout((function() {
            this.screen.clear();
            this.screen.fade(true);
        }).bind(this), 500);
*/
        this.activateStage('playground');
    }
};

Game.prototype.changeState = function(val, e) {
    for (var i = 0; i < G.map.objects.length; ++i) {
        if (G.map.objects[i] instanceof TiledGameEngine.EntitiesFactory['unit']) {
            G.map.objects[i].changeState(val);
//            G.map.objects[i].state = val;
//            G.map.objects[i].frameIdx = 0;
        }
    }
}

Game.prototype.rotate = function(dif) {
    for (var i = 0; i < G.map.objects.length; ++i) {
        if (G.map.objects[i] instanceof TiledGameEngine.EntitiesFactory['unit']) {
            G.map.objects[i].direction = (G.map.objects[i].direction + dif) % 8;
            if (G.map.objects[i].direction < 0) G.map.objects[i].direction = 7;
        }
    }
}

Game.prototype.changeColor = function(val) {
    this.sel.color = val;
}

var G = new Game();
G.init();G.start();
