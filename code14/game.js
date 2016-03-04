// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.ViewPort('#viewport', window.innerWidth, window.innerHeight);

    // set "world" background
    this.screen.setBGColor('black');
    
    // creat assets manager instance
    this.assets = new TiledGameEngine.Assets();
    
    this.assetsLoaded = false;
    
    // create LoadingStage instance
    var stage = new TiledGameEngine.LoadingStage(this.assets, this.screen, true, 4);
	// stage 1 - load TMX file
	// stage 2 - load assets
	// stage 3 - parse map
	// stage 4 - activate map
	
	stage.setStage(1);
	
    // add loader stage into game loop manager
    this.addStage('load', stage);
    
    // TMX Map parser
//    this.map = new TiledGameEngine.TiledMap(this.assets, 'start2.json');
    this.map = new TiledGameEngine.TiledMap(this.assets, 'grassland_td1.json');

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
    
    TiledGameEngine.bus.subscribe('assetsLoaded',       this.onAssetsLoaded.bind(this));
    TiledGameEngine.bus.subscribe('tmxMapParsed',       this.onMapParsed.bind(this));
    TiledGameEngine.bus.subscribe('screenAnimationEnd', this.onScreenAnimationEnd.bind(this));
    
    TiledGameEngine.bus.subscribe('mousemove',          this.onMouseMove.bind(this));
    TiledGameEngine.bus.subscribe('click',              this.onMouseClick.bind(this));
    TiledGameEngine.bus.subscribe('keypresses',         this.onKeyPressed.bind(this));

    TiledGameEngine.bus.subscribe('entityActionFinished', this.onActionFinished.bind(this));
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
//    this.screen.show(false);
    
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
        
		// TMX file loaded - go to the next stage
        stage.setStage(2);
        
        stage.start();
    } else {
        // all assets loaded - time to parse map
        var stage = this.getStage('load');
		
		// all assets loaded - go to the stage 3 - parsing
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
	var stage = this.getStage('load');
	// TMX map parsed and ready
	stage.setStage(4);

    TiledGameEngine.EntitiesFactory.createPool({    type: 'Selection',
                                                    x: 0,
                                                    y: 0,
                                                    fps: 6,
                                                    color: 'rgba(255, 255, 255, 0.03)',

                                                    // pool specific params
                                                    poolSize: 5
                                                    }, this.assets, this.map);

    TiledGameEngine.EntitiesFactory.createPool({    type: 'Target',
                                                    x: 0,
                                                    y: 0,
                                                    fps: 30,
                                                    color: 'rgba(255, 255, 255, 0.3)',
                                                    
                                                    // pool specific params
                                                    poolSize: 1
                                                    }, this.assets, this.map);

	TiledGameEngine.EntitiesFactory.createPool({    type: 'UI.Tooltip',
                                                    x: 0,
                                                    y: 0,
                                                    fps: 10,
                                                    
                                                    // pool specific params
                                                    poolSize: 1
                                                    }, this.assets, this.map);
								
	var gui = $.EntitiesFactory.create({type: 'ui.gui', fps: 24, img: 'img/gui/'}, this.assets, this.map);
	this.map.addEntity(gui);
	
	var qwnd = $.EntitiesFactory.create({type: 'ui.gui.quests', fps: 24, img: 'img/gui/'}, this.assets, this.map);
	this.map.addEntity(qwnd);
      
//    this.path = TiledGameEngine.EntitiesFactory.create({type: 'Path'}, this.assets, this.map);
    
//    this.map.addEntity(this.path);
    
    this.sel = TiledGameEngine.EntitiesFactory.retain('Selection');
    
    this.map.addEntity(this.sel);
    
    this.sel.visible = true;
	
	var plUnit = this.map.getEntityByName('Player');
	if (plUnit) {
		this.map.moveEntity(this.sel, plUnit.x, plUnit.y);
	} else {
		this.map.moveEntity(this.sel, 0, 0);
	}

    obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
    if (obj) {
        this.sel.bind(obj);
    }

//	var stage = this.getStage('load');
    setTimeout((function() { this.screen.fade(false); }).bind(this), 500);
//    setTimeout((function() { this.activateStage('playground'); }).bind(this), 1000);
};

Game.prototype.onKeyPressed = function(key, value) {
    var obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
    if (obj) {
        switch (value) {
                case 37 /* Left */: {
					var plUnit = this.map.getEntityByName('Player');
					if (plUnit) {
						plUnit.direction--; if (plUnit.direction < 0) plUnit.direction = 7;
					}
                    // if (obj.x == 0) break;
                    
                    // console.profile();
                    // for (var i = 0; i < 1000; ++i) {
                        // var p = this.map.getPath(obj.x+obj.dx, obj.y+obj.dy, obj.x-10, obj.y-10, true);
                    // }
                    // console.profileEnd();
                    
//                    this.map.setEntityPath(obj, p);
                } break;
                case 38 /* Up */: {
					var plUnit = this.map.getEntityByName('Player');
					if (plUnit) {
						plUnit.frameIdx = 0;
						plUnit.state = 'stance';
					}
                    // if (obj.y == 0) break;
                    // var p = this.map.getPath(obj.x+obj.dx, obj.y+obj.dy, obj.x, obj.y-2, true);
                    
                    // this.map.setEntityPath(obj, p);
                } break;
                case 39 /* Right */: {
					var plUnit = this.map.getEntityByName('Player');
					if (plUnit) {
						plUnit.direction++; if (plUnit.direction > 7) plUnit.direction = 0;
					}
                } break;
                case 40 /* Down */: {
					var plUnit = this.map.getEntityByName('Player');
					if (plUnit) {
						plUnit.frameIdx = 0;
						plUnit.state = 'die';
					}
                    // if (obj.y == this.map.height-1) break;
                    // var p = this.map.getPath(obj.x+obj.dx, obj.y+obj.dy, obj.x, obj.y+2, true);
                    
                    // this.map.setEntityPath(obj, p);
                } break;
        }
    }
};

Game.prototype.onMouseMove = function(key, value) {
    return;
    
    // if (this.activeStage.name !== "TiledMapStage") return;
    
    // var iso = this.activeStage.scr2Tile(value.x, value.y);

    // this.map.moveEntity(this.sel, iso[0], iso[1]);
};

Game.prototype.onActionFinished = function(key, ent) {
    if (ent.action === ent.behaviorActions.swing ||
        ent.action === ent.behaviorActions.shoot) {
            
        var obj = this.map.getEntityByXY(ent.actionX, ent.actionY, false);
        if (!obj) return;
        
        console.log(obj.name, obj.id, 'to die', obj.path.length);

        if (obj.state !== 'critdie' && obj.state !== 'die') {
            if (obj.path.length) {
                obj.changeState('critdie');
            } else {
                obj.changeState('die');
            }
            
            if (obj.name === "Player") {
                setTimeout(function() { alert('Your character was killed. Reload page to try again')}, 1000);
            }
        }
    }
};

Game.prototype.onMouseClick = function(key, value) {
    
    // Track clicks only on playground
    if (this.activeStage.name !== "TiledMapStage") return;
    
    var obj;

    // convert screen coordinates to tile
    var iso = this.activeStage.scr2Tile(value.x, value.y);

    // Hightlight click
    var tgt = TiledGameEngine.EntitiesFactory.retain('Target');
    tgt.visible = true;
    this.map.addEntity(tgt);
    this.map.moveEntity(tgt, iso[0], iso[1]);

    if (value.which === 4) { // right button
        obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
        if (obj) {
            if (this.map.getDistance(obj.x, obj.y, iso[0], iso[1]) === 1) {
                obj.pushBehavior({action: obj.behaviorActions.swing, x: iso[0], y: iso[1], immediate: true});
            } else {
                obj.pushBehavior({action: obj.behaviorActions.shoot, x: iso[0], y: iso[1], immediate: true});
            }
        }
        
        return;
    }
    
    // get object from click position
    obj = this.map.getEntityByXY(iso[0], iso[1]);
    
    if (!obj) {
        // no object was clicked - find path to the target position
        // get currently selected object
        obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
        if (obj) {
            var p = this.map.getPath(obj.x + obj.dx, obj.y + obj.dy, iso[0], iso[1], true);
            if (p) {
                // set path for that object
                this.map.setEntityPath(obj, p);
            }
        }
    } else {
        // selectable object was clicked - change selection
        // highlight newly selected entitiy
		if (obj.clickable) {
			this.map.moveEntity(this.sel, iso[0], iso[1]);
			this.sel.visible = true;
			
			// bind selection entity to the newly selected object
			this.sel.bind(obj);
			
			this.activeStage.follow(obj);
		}
		
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
		if (this.sel) {
			obj = this.map.getEntityByXY(this.sel.x, this.sel.y);
			if (obj) {
				this.activeStage.follow(obj);
			}
		}
    }
};

Game.prototype.changeState = function(val, e) {
    for (var i = 0; i < G.map.entities.length; ++i) {
        if (G.map.entities[i] instanceof TiledGameEngine.EntitiesFactory['unit']) {
            G.map.entities[i].changeState(val);
//            G.map.objects[i].state = val;
//            G.map.objects[i].frameIdx = 0;
        }
    }
}

Game.prototype.rotate = function(dif) {
    for (var i = 0; i < G.map.entities.length; ++i) {
        if (G.map.entities[i] instanceof TiledGameEngine.EntitiesFactory['unit']) {
            G.map.entities[i].direction = (G.map.entities[i].direction + dif) % 8;
            if (G.map.entities[i].direction < 0) G.map.entities[i].direction = 7;
        }
    }
}

Game.prototype.changeColor = function(val) {
    this.sel.color = val;
}

Game.prototype.onMapTrigger = function(key, value) {
	console.log(value);
	
	switch (value.cmd) {
		case 'changeMap': {
			this.stop();
//			this.assetsLoaded = false;		
			
			var stage = this.getStage('load');
			stage.setStage(1);

			this.map.reset(this.assets, value.args[0]);
			
			stage.request(this.map.asset);
			
			this.start();
		} break;
	}
}

var G;

function start() {
	G = new Game();
	G.init();G.start();
};


window.onload = start;
