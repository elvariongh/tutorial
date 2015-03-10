(function(w, TGE) {
    "use strict";
    
    var res_scr2Tile = new Int32Array(2),
        res_tile2Scr = new Int32Array(2);
        
    // internal function variable moved to global scope to eleminate GC
//    var tx, ty, i;  
    
    /**
     * Construct TiledMapStage instance 
     * @constructor
     * @extends Stage
     * @param {Assets|null|undefined}   assetManager        Reference to the TiledGameEngine.Assets instance or null
     * @param {Screen|undefined}        [screen=undefined]  Reference to the #Screen object
     * @param {TiledMap}                map                 Reference to the TiledGameEngine.TiledMap instance
     */
    function TiledMapStage(assetManager, screen, map) {
        TiledGameEngine['Stage'].call(this, 'TiledMapStage', assetManager, screen);
        
        this.tmap = map;    // referense to TiledMap object
        
        this.backbuffer = [];    // array of canvas backbuffer
        
        this.cached = false;
        
        this.pos = [];
        
        this.target = [25, 17];
        this.start = [];
        
        this.sidMouseMove = -1;
        
        this.mousePosX = 0;
        this.mousePosY = 0;
        
        this.gridCache = undefined;

        this.showGrid = false;
        this.earthQuake = false;
        this.animation = true;
        
        this.viewportX = 0;
        this.viewportY = 0;
        this.viewportW = 0;
        this.viewportH = 0;
        
        this.viewportMoved = false;
        this.viewportResized = true;
    };
    
    // super-class inheritance
    TiledMapStage.prototype = Object.create(TGE['Stage'].prototype);
    
    /**
     * Activate stage.
     */
    TiledMapStage.prototype['activate'] = function() {
        TiledGameEngine['Stage'].prototype['activate'].call(this);
        
        if (this['screen']['layers'] < this.tmap['layerscnt']) {
            this['screen']['addLayer'](this.tmap['layerscnt'] - this['screen']['layers']);
        } else if (this['screen']['layers'] > this.tmap['layerscnt']) {
            this['screen']['remLayer'](this['screen']['layers'] - this.tmap['layerscnt']);
        }
        
        this['screen']['clear']();

        this['screen']['setBGColor'](this.tmap['bgcolor']);
        this['redraw'] = true;
        
        if (this.tmap) {
            this.pos = [~~(-this.tmap['mapwidth']/2 + this['screen']['viewport'][2]/2), 0];
            this['screen']['move']( this.pos[0], this.pos[1]);
            
            this['screen']['setBoundingBox'](   - (this.tmap['mapwidth'] - this['screen']['viewport'][2]), 
                                                - (this.tmap['mapheight'] - this['screen']['viewport'][3]), 
                                                this.tmap['mapwidth'] - this['screen']['viewport'][2], // - this['screen']['viewport'][2], 
                                                this.tmap['mapheight'] - this['screen']['viewport'][3]);// - this['screen']['viewport'][3]);
        }
        
        this.sidMouseMove = TiledGameEngine['bus']['subscribe']('mousemove', this.onMouseMove.bind(this));
        
        this.start = this.scr2Tile(this['screen']['viewport'][2]/2, this['screen']['viewport'][3]/2);
        
        var tx = -(this.target[0] - this.start[0]),
            ty = -(this.target[1] - this.start[1]);
        
        this.target[2] = 50; // ~~((tx - ty) * this.tmap['tilewidth'] / 2);
        this.target[3] = 50; //~~((tx + ty) * this.tmap['tileheight'] / 2);
        this.target[4] = 0;
        this.target[5] = 0;
        
        this['screen']['fade'](true);
    };


    TiledMapStage.prototype['deactivate'] = function() {
        TiledGameEngine.Stage.prototype['deactivate'].call(this);
        
        TiledGameEngine['bus']['unsubscribe']('mousemove', this.sidMouseMove);
        
        this.sidMouseMove = -1;
    }
    
    TiledMapStage.prototype['onViewportResize'] = function(key, value) {
        TiledGameEngine.Stage.prototype['onViewportResize'].call(this, key, value);
        
        this.cached = false;
        this.viewportMoved = true;
        this.viewportResized = true;
//        console.log('onViewportResize');
    }

    TiledMapStage.prototype['onViewportMove'] = function(key, value) {
        TiledGameEngine.Stage.prototype['onViewportMove'].call(this, key, value);
        
        this.cached = false;
        this.viewportMoved = true;
        
//        this.animation = false;
//        console.log('onViewportMove');
    }

    TiledMapStage.prototype.scr2Tile = function(x, y) {
        // convert screen position to tiles
        x = (x - this['screen']['viewport'][0] - this.tmap['mapwidth']/2)/ this.tmap['tilewidth'];
        y = (y - this['screen']['viewport'][1])/ this.tmap['tileheight'];
        
        res_scr2Tile[0] = ~~(x + y); 
        res_scr2Tile[1] = ~~(y - x); 
        
        return res_scr2Tile;//[~~(x + y), ~~(y - x)];
    }
    
    TiledMapStage.prototype.tile2Scr = function(x, y) {
        res_tile2Scr[0] = ~~(((x - y) * this.tmap['tilewidth'] / 2) + this['screen']['viewport'][0] + this.tmap['mapwidth']/2);
        res_tile2Scr[1] = ~~(((x + y) * this.tmap['tileheight'] / 2) + this['screen']['viewport'][1]);
        return res_tile2Scr;
    }
    
    // handle mouse pointer movement
    TiledMapStage.prototype.onMouseMove = function(key, e) {
        if (!this.showGrid) return;
        
        var iso = this.scr2Tile(e.x, e.y);
        
        if (iso[0] !== this.mousePosX || iso[1] !== this.mousePosY) {
            TiledGameEngine['bus']['notify']('invalidateStage', this['name']);
        }
        
        this.mousePosX = iso[0]; this.mousePosY = iso[1];
    }
    
    /**
     * Update routine for the TiledMapStage. If map is not parsed yet - 10 FPS is enought.
     * @param {number}  dt      time difference from last update
     * @return {number}         Return time difference (in ms) to next update
     */
    TiledMapStage.prototype['update'] = function(dt, t) {
        // 2 FPS if no screen, map or stage is not active
        if (!this['screen'] || !this.tmap || !this['active']) return 500;
        
        if (!this.tmap['ready']) {
            return 100; // 10 FPS is enough for idle stage
        }
        
        this.redraw = false;
        
        var dt2;
        
//        if (this.viewportMoved) this.animation = true;
        
        // mark stage as invalid - redraw required
/*
        if (this.earthQuake) {
            if (!this.target[5]) {
                this.target[5] = t;
            } else {
                dt2 = t - this.target[5];
                
                if (dt2 > 16) {
                    if (this.target[4] < 100) {
                        // this.pos[0] = ~~(this['screen']['viewport'][0] + (-1)*(this.target[4]%3-1) * 8 * this.target[2] / 50);
                        // this.pos[1] = ~~(this['screen']['viewport'][1] + (-1)*(this.target[4]%3-1) * 8 * this.target[3] / 50);
                        this.pos[0] = ~~(this['screen']['viewport'][0] + this.target[2] / 50);
                        this.pos[1] = ~~(this['screen']['viewport'][1] + this.target[3] / 50);

                        this['screen']['move'](this.pos[0], this.pos[1]);
                        
                        this.target[4]++;
                    } else {
                        this.earthQuake ^= 1;
                        this.target[4] = 0;
                        
//                        console.profileEnd('earth');
                    }
                    
                    this.target[5] = t;
                }
            }
            
            dt2 = dt2 % 16;
            
            this.redraw = true;
            dt = ~~(16 - dt2);
//            return ~~(16 - dt2);
        }
*/
        var cnt = this.tmap.objects.length;
        if (!cnt || !this.animation) {
            dt = dt % 16;
            
//            console.log(1, ~~(16 - dt));
            return ~~(16 - dt); // 60 FPS by default
        } else {
            dt2 = 1000;
            
            for (var i = 0; i < cnt; ++i) {
                var obj = this.tmap.objects[i];
                
                dt2 = Math.min(dt2, obj.update(dt, t, this['screen']['viewport']));
                
                this.redraw |= obj.redraw;
            }

//            this.redraw = true;
            
//            dt2 = ~~(16 - dt2);

            if (this.earthQuake) dt2 = Math.min(dt2, dt);

//            console.log('TMS::update', this.redraw);
//            console.log(2, dt2, dt);
            return dt2;
        }
    };

    TiledMapStage.prototype.renderGrid = function(ctx) {
        ctx.clearRect(0, 0, this['screen']['viewport'][2], this['screen']['viewport'][3]);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(29, 57, 101, 0.75)";
//        ctx.fillStyle = "rgba(255, 64, 255, 0.75)";
//        ctx.textAlign = "center";
//        ctx.textBaseline = "middle";
        
        var iso = this.scr2Tile(this['screen']['viewport'][2]/2, this['screen']['viewport'][3]/2);
        
        var w = (~~(this['screen']['viewport'][2] / this.tmap['tilewidth']) + 2); if (!w%2) w++;
        var h = (~~(this['screen']['viewport'][3] / this.tmap['tileheight']) + 2); if (!h%2) h++;
        
        var dx = this.tmap['mapwidth']/2 + this['screen']['viewport'][0],
            dy = this['screen']['viewport'][1],
            points = [	[- 0,                          + 0],
                        [+ this.tmap['tilewidth']/2,   + this.tmap['tileheight']/2],
                        [- 0,                          + this.tmap['tileheight']],
                        [- this.tmap['tilewidth']/2,   + this.tmap['tileheight']/2]];
        
        for (var x = -w; x < w; x++) {
            for (var y = -h; y < h; y++) {
            
                if ((x + y) & 1) continue;
                
                var tx = iso[0] + ~~((y + x)/2),
                    ty = iso[1] + ~~((y - x)/2);
                    
                if (tx < 0 || ty < 0) continue;
                if (tx >= this.tmap['width'] || ty >= this.tmap['height']) continue;

                var scrx = ~~((tx - ty) * this.tmap['tilewidth'] / 2),
                    scry = ~~((tx + ty) * this.tmap['tileheight'] / 2);
                
                ctx .dashedLine(points[0][0] + dx + scrx, points[0][1] + dy + scry, points[1][0] + dx + scrx, points[1][1] + dy + scry)
                    .dashedLine(points[1][0] + dx + scrx, points[1][1] + dy + scry, points[2][0] + dx + scrx, points[2][1] + dy + scry);
            }
        }

        ctx.closePath();
        ctx.stroke();
    }
    
    TiledMapStage.prototype['render'] = function() {
        // stage is not active, map is not defined, no view port or map is not parsed yet
        if (!this['active'] || !this.tmap || !this['screen']) return;
        if (!this.tmap['ready']) return;

        // viewport array structure: [left, top, width, height, visible]
        var vp = this['screen']['viewport'];

        if (!this.gridCache) {
            this.gridCache = this.offScreenRender(vp[2], vp[3], this.renderGrid.bind(this));
        }

        if (!this.cached || this.viewportMoved || this.viewportResized) {
            this.prerender(true);
            this.cached = true;

            if (this.showGrid) {
                this.renderGrid(this.gridCache.getContext('2d'));
            }
        }
//            return;

//        else 
        {
            // mark stage as up to date - no redraw needed
            this['redraw'] = false;
            
            var layerscount = this.tmap['layers'].length,
                i = 0,
                layer,
                ctx;

            if (this.viewportMoved) {
                this['screen']['clear']();
            
                for (; i < layerscount; ++i) {
                    layer = this.tmap['layers'][i];
                    
                    // ignore object and image layers
                    if (layer['type'] !== 'tilelayer') continue;

                    // layer is not visible - ignore it
                    if (!layer['visible']) continue;

                    if (!layer['properties']['render']) continue;

                    if (layer['properties']['mergeWithLayer']) continue;

                    ctx = this['screen']['getLayer'](layer['ctxlayer']);
                    ctx.drawImage(this.backbuffer[layer['ctxlayer']], 0, 0);
                }
            }
            
            // clear view port moving/resizing flags
            this.viewportMoved = false;
            this.viewportResized = false;
            
            if (true) {
                ctx = this['screen']['getLayer'](this.tmap['entitiesLayer']);

                if (ctx) {
                    ctx.clearRect(0, 0, vp[2], vp[3]);

                    var _cnt = 0;
                    for (i = 0, layerscount = this.tmap.objects.length; i < layerscount; ++i) {
                        var obj = this.tmap.objects[i];
                        
                        if (obj.visible) _cnt++;
                        obj.render(ctx, this, vp);
                    }
                }
            }

            /*
            if (this.showGrid) {
                if (!ctx) {
                    ctx = this['screen']['getLayer'](this['screen']['layerscnt']);
                    ctx.clearRect(0, 0, vp[2], vp[3]);
                }
                if (!ctx) {
                    return;
                }
                
                ctx.drawImage(this.gridCache, 0, 0);
                
                ctx.beginPath();
                ctx.strokeStyle = "rgba(255, 64, 64, 0.75)";
                ctx.fillStyle = "rgba(255, 64, 64, 0.75)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                    
                var scrx = ~~((this.mousePosX - this.mousePosY) * this.tmap['tilewidth'] / 2),
                    scry = ~~((this.mousePosX + this.mousePosY) * this.tmap['tileheight'] / 2),
                
                    points = [	[scrx - 0,                          scry],
                                [scrx + this.tmap['tilewidth']/2,   scry + this.tmap['tileheight']/2],
                                [scrx - 0,                          scry + this.tmap['tileheight']],
                                [scrx - this.tmap['tilewidth']/2,   scry + this.tmap['tileheight']/2]],
                
                    dx = this.tmap['mapwidth']/2 + this['screen']['viewport'][0],
                    dy = this['screen']['viewport'][1];
                
                ctx.moveTo(points[0][0] + dx, points[0][1] + dy);
                ctx.lineTo(points[1][0] + dx, points[1][1] + dy);
                ctx.lineTo(points[2][0] + dx, points[2][1] + dy);
                ctx.lineTo(points[3][0] + dx, points[3][1] + dy);
                ctx.lineTo(points[0][0] + dx, points[0][1] + dy);
                
                ctx.fillText(this.mousePosX + ";" + this.mousePosY, points[0][0] + dx, points[0][1] + dy + this.tmap['tileheight']/2);
                ctx.closePath();
                ctx.stroke();
            }
            */
        }
    };
    
    TiledMapStage.prototype.renderLayer = function(ctx, layerID, isox, isoy, width, height, maxx, maxy) {
        var layer = this.tmap['layers'][layerID],   // layer object to render
            data = layer['data'],                   // get layer data and itterate through it for rendering
            scr = layer['screen'],                  // get pre-processed values
            x, y,
            startX = -width,
            lastX = width,
            startY = -height,
            lastY = height,
            tx, ty,
            idx, tsidx,
            tileset,
            img, j,
            vp = this['screen']['viewport'];        // view port reference

        // ignore object and image layers
        if (layer['type'] !== 'tilelayer') {
            console.log('ignore (type)', layer['name']);
            return;
        }
        
        // layer is not visible - ignore it
        if (!layer['visible']) {
            console.log('ignore (visible)', layer['name']);
            return;
        }
        
        // layer is not planned to be rendered - ignore it
        if (!layer['properties']['render']) {
            console.log('ignore (render)', layer['name']);
            return;
        }
            
        for (var y = startY; y <= lastY; y++) {
            for (var x = startX; x <= lastX; x++) {
            
                if ((x + y) & 1) continue;
                
                
                tx = isox + ~~((y + x)/2);
                ty = isoy + ~~((y - x)/2);


                if (tx < 0 || ty < 0) continue;
                if (tx >= maxx || ty >= maxy) continue;

                j = tx + ty * maxx;

                idx = data[j];
            
                if (!idx) continue; // if tile index is 0 - no tile for render

                // check if tilesed was found for that tile
                tsidx = scr[j*5+0];
                if (tsidx < 0) continue;
            
                tileset = this.tmap['tilesets'][tsidx];
            
                // check if image is loaded
                img = this['am'].get(tileset['image']);
                if (!img) continue;

                // render image
                ctx.drawImage(img, 
                                scr[j*5+1], scr[j*5+2],                         // position in image map
                                tileset['tilewidth'], tileset['tileheight'],    // dimension on image
                                scr[j*5+3] + this.tmap['mapwidth']/2 + vp[0],   // x-position on screen
                                scr[j*5+4] + vp[1],                             // y-position on screen
                                tileset['tilewidth'], tileset['tileheight']);   // dimension on screen
            }
        }
    };
    
    TiledMapStage.prototype.prerender = function(onScreen) {
        var i = 0,                                          // {number}     layer id
            layer,                                          // {object}     reference for layer
            layerscount =  this.tmap['layers'].length,      // {number}     count of layers
            ctx,                                            // {Object}     Canvas2DContext reference
            vp = this['screen']['viewport'],                // {Array}      viewport array structure: [left, top, width, height, visible]
            iso = this.scr2Tile(vp[2]/2, vp[3]/2),          // {Array}      get center tile
            w = (~~(vp[2] / this.tmap['tilewidth']) + 2),   // {number}     calculate screen dimension in tiles
            h = (~~(vp[3] / this.tmap['tileheight']) + 2),  // {number}
            width = vp[2],                                  // {number}     canvas width
            height = vp[3];                                 // {number}     canvas height
        
        // if layer is rendered to offscreen - create full size canvas and render whole layer into it
        if (!onScreen) {
            w = (~~(this.tmap['mapwidth'] / this.tmap['tilewidth']) + 2);
            h = (~~(this.tmap['mapheight'] / this.tmap['tileheight']) + 2);
            
            width = this.tmap['mapwidth'];
            height = this.tmap['mapheight'];
        }
        
        w = w > this.tmap['width'] ? this.tmap['width'] : w;
        h = h > this.tmap['height'] ? this.tmap['height'] : h;

        // loop through layers to render
        for (; i < layerscount; ++i) {
            layer = this.tmap['layers'][i];
            
            // ignore object and image layers
            if (layer['type'] !== 'tilelayer') continue;
            
            // layer is not visible - ignore it
            if (!layer['visible']) continue;
            
            // layer is not planned to be rendered
            if (!layer['properties']['render']) continue;
            
            // if layer is rendered to on screen - create backbuffer canvas with viewport dimension
            if (!this.backbuffer[layer['ctxlayer']]) {
                this.backbuffer[layer['ctxlayer']] = document.createElement('canvas');
                this.backbuffer[layer['ctxlayer']].width = width;
                this.backbuffer[layer['ctxlayer']].height = height;
                ctx = this.backbuffer[layer['ctxlayer']].getContext('2d');
            } else {
                ctx = this.backbuffer[layer['ctxlayer']].getContext('2d');
                
                if (!layer['properties']['mergeWithLayer']) {
                    if (this.viewportResized) {
                        this.backbuffer[layer['ctxlayer']].width = width;
                        this.backbuffer[layer['ctxlayer']].height = height;
                    } else {
                        ctx.clearRect(0, 0, width, height);
                    }
                }
            }
            
            this.renderLayer(ctx, i, iso[0], iso[1], w, h, this.tmap['width'], this.tmap['height']);
        }
        
        // store last rendered viewport position and dimension
        this.viewportX = this['screen']['viewport'][0];
        this.viewportY = this['screen']['viewport'][1];
    };

    TGE['TiledMapStage'] = TiledMapStage;
})(window, TiledGameEngine);