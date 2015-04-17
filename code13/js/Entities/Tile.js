/*! TiledGameEngine v0.0.6 - 17th Apr 2015 | https://github.com/elvariongh/tiledgameengine */
(function(TGE) {
    "use strict";
    /**
     * @constructor
     */
    function Tile() {
        TiledGameEngine['EntitiesFactory']['entity'].call(this);
        
        this.width = undefined;
        this.height = undefined;
        
        this.animated = false;
        
        this.animation = undefined;
        
        this.frames = 1;
        this.frame = 0;
        this.layer = undefined;
        
        this.id = undefined;
        
        this.lasttime = 0;
    };
    
    // super-class inheritance
    Tile.prototype = Object.create(TiledGameEngine['EntitiesFactory']['entity'].prototype);
    
    Tile.prototype['init'] = function(data, assetManager, map) {
        TiledGameEngine['EntitiesFactory']['entity'].prototype['init'].call(this, data, assetManager, map);
        
        var scr = map['layers'][data['layer']]['screen'],
            tset = scr[data.id*5],
            tileset = map['tilesets'][tset];
        
        this.layer = data['layer'];
        this.id = data.id;
        
        this.width = tileset['tilewidth'];
        this.height = tileset['tileheight'];
        
        this['z'] -= ~~(this.height / map['tileheight']);
        
        if (tileset['tiles']) {
            // this tile set has animated tiles - check if this one is animated
            var idx = map['layers'][data['layer']]['data'][data['id']] - tileset['firstgid'];
            
            if (tileset['tiles'][idx]) {
                this.animated = true;
                
                // check if this tile has custom properties, that supported by TGE
                if (tileset['tileproperties']) {
                    if (tileset['tileproperties'][idx]) {
                        if (tileset['tileproperties'][idx]['animated']) {
                            this.animated = (tileset['tileproperties'][idx]['animated'] === 'false' ||
                                             tileset['tileproperties'][idx]['animated'] == 0) ? false : true;
                        }
                        
                        this.frame = +tileset['tileproperties'][idx]['startframe'] || 0;
                    }
                }
                
                // create animation data
                var animation = tileset['tiles'][idx]['animation'],
                    frames = animation.length,
                    frame = 0;
                
                var anim = [];
                
                for (; frame < frames; ++frame) {
                    idx = animation[frame]['tileid'];
                    
                    var imgx = ~~(idx % tileset['cols']) * tileset['tilewidth'];
                    var imgy = ~~(idx / tileset['cols']) * tileset['tileheight'];
                    
                    anim[frame] = new Uint32Array([imgx, imgy, +animation[frame]['duration']]);
                }
                
                this.animation = anim;
                this.frames = frames;
                this.frame %= frames;
            }
        } 

        // if this tile is not animated - create one-frame animation
        if (!this.animation) {
            this.frames = 1;
            this.frame = 0;
            this.animated = false;
            this.animation = [new Uint32Array([scr[this.id*5+1], scr[this.id*5+2], 1000])];
        }

        // store tile screen position
        this['x'] = scr[this.id*5+3] + ~~(map['mapwidth']/2);
        this['y'] = scr[this.id*5+4];

        this['img'] = assetManager.get(tileset['image'])
        
        if (this.animated) this['mutable'] = true;
    };
    
    Tile.prototype['update'] = function(dt, time, viewport) {
        // lazy resource load check
        if (!this.width) console.error('tile is not loaded');

        // check if entity is visible
        if (this['x'] + this.width + viewport[0] > 0 &&
            this['y'] + this.height + viewport[1] > 0 &&
            this['x'] + viewport[0] < viewport[2] &&
            this['y'] + viewport[1] < viewport[3]) {
            this['visible'] = true;
        } else {
            this['visible'] = false;
        }

        this['redraw'] = false;

        // check if new frame need to be drawn
        if (this.animated && this['visible']) {
            if (time >= this.lasttime) {
                
                if (!this.lasttime) this.lasttime = time;
                
                while (time >= this.lasttime) {
                    this.lasttime += this.animation[this.frame][2]; //'duration';
                    
                    this.frame = (this.frame+ 1)%this.frames;
                }

                this['redraw'] = true;
            }
            
            return this.lasttime - time;
        }

        // if tile is not animated - return default update duration - 1000 ms
        return 1000;
    };
    
    Tile.prototype['isVisible'] = function(viewport) {
        // check if entity is visible
        if (this['x'] + this.width + viewport[0] > 0 &&
            this['y'] + this.height + viewport[1] > 0 &&
            this['x'] + viewport[0] < viewport[2] &&
            this['y'] + viewport[1] < viewport[3]) {
            this['visible'] = true;
        } else {
            this['visible'] = false;
        }
        
        return this['visible'];
    };

    Tile.prototype['render'] = function(ctx, stage, viewport) {
        if (!this['img'] || !this['visible']) return;
        
        var a = this.animation[this.frame];
        
        ctx.drawImage(  this['img'],
                        a[0], a[1],                 // position in image map
                        this.width, this.height,    // dimension
                        this['x'] + viewport[0],
                        this['y'] + viewport[1],
                        this.width, this.height);
                        
        this['redraw'] = false;
    };
    
    /**
     *  Move tile to new position.
     * @param   {number}    x           new X coordinate (in tiles)
     * @param   {number}    y           new Y coordinate (in tiles)
     */
    Tile.prototype['move'] = function(x, y) {
        x = +x; y = +y;
        this['x'] = x;
        this['y'] = y;
        
        this['z'] = x + y*this['map']['width']*20;
        this['z'] -= ~~(this.height / this['map']['tileheight']);
        
        var scr = this['map']['layers'][this['layer']]['screen'];

        this['x'] = scr[this.id*5+3] + ~~(this['map']['mapwidth']/2);
        this['y'] = scr[this.id*5+4];

        TGE['bus']['notify']('entityMoved');
    };

    TGE['EntitiesFactory']['register']('tile', Tile);
})(TiledGameEngine);