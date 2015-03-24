/*! TiledGameEngine v0.0.4 - 20th Mar 2015 | https://github.com/elvariongh/tiledgameengine */
(function(w, TGE) {
    "use strict";
    function Selection() {
        // call super-class implementation
        TGE['EntitiesFactory']['entity'].call(this);

        
        this.scr = undefined;                       // cached value of entity screen position
        
        this.frames = 10;                           // total frames in animation sequence
        this.frame = 0;                             // current frame
        this.duration = 1000;                       // frame duration in ms
        
        this.lasttime = 0;                          // last update timestamp
        this.dt = undefined;                        // time till next update
        
        this.direction = 0;                         // animation direction: 0 - forward, 1 - back

        this.type = 'back_forth';                   // animation loop type
        this.color = 'rgba(255, 025, 025, 0.05)';   // stroke color
        this.lineWidth = 3;                         // stroke line width

    };

    // super-class inheritance
    Selection.prototype = Object.create(TGE['EntitiesFactory']['entity'].prototype);

    Selection.prototype.init = function(data, assetManager, map) {
        // call super-class implementation
        TGE['EntitiesFactory']['entity'].prototype['init'].call(this, data, assetManager, map);

        // check init params
        if (data['fps']) {
            this.duration = 1000 / +data['fps'];
        }
        
        if (data['color']) {
            this.color = data['color'];
        }
        
        if (data['type']) {
            this.type = data['type'];
        }
        
        if (data['lineWidth']) {
            this.lineWidth = +data['lineWidth'];
        }

        this['clickable'] = false;
    };

    Selection.prototype.update = function update(dt, time, viewport) {
        this.redraw = false;

        if (time >= this.lasttime) {
            if (!this.lasttime) this.lasttime = time;
            while (time >= this.lasttime) {
                if (this.type === 'back_forth') {
                    if (this.direction) --this.frame;
                    else ++this.frame;

                    if (this.frame >= this.frames) {
                        this.frame = this.frames-2;
                        this.direction = 1;
                    } else if (this.frame < 0) {
                        this.direction = 0;
                        this.frame = 1;
                    }
                } else {
                    // looped by default
                    this.frame = (this.frame + 1) % this.frames;
                }
                this.lasttime += this.duration;
            }
            this.redraw = true;
        }

        this.dt = this.lasttime - time;

        if (!this.visible) this.redraw = false;

        return ~~(this.dt);
    };

    Selection.prototype.render = function render(ctx, stage, viewport) {
        if (!this.visible) return;

        // cache entity screen position, if not done yet
        if (!this.scr) {
            var scr = stage.tile2Scr( this.x, this.y);
            this.scr = new Int32Array([scr[0] - viewport[0], scr[1] - viewport[1] + ~~(this.map.tileheight/2)]);
        }

        ctx.save();
        ctx.beginPath();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        var PI2 = 2*Math.PI, x = this.scr[0] + viewport[0], y = this.scr[1] + viewport[1];
        for (var i = 0; i < this.frame+1; ++i) {
            ctx.ellipse(x, y, 20 - i*2, 10 - i, 0, 0, PI2);
            ctx.stroke();
        }

        ctx.closePath();
        ctx.restore();
    };

    TGE.EntitiesFactory.register('Selection', Selection);
})(window, TiledGameEngine);