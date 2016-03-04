(function(TGE) {
    "use strict";
    /**
     * @constructor
     */
    function UITooltip() {
        TGE['EntitiesFactory']['entity'].call(this);
		
		this.text = 'test';
		
		this['z'] = Number.MAX_SAFE_INTEGER;//Math.MAX_VALUE;
		
        this.frames = 10;                           // total frames in animation sequence
        this.frame = 0;                             // current frame
        this.duration = 1000;                       // frame duration in ms
        
        this.lasttime = 0;                          // last update timestamp
        this.dt = undefined;                        // time till next update
	}

    // super-class inheritance
    UITooltip.prototype = Object.create(TGE['EntitiesFactory']['entity'].prototype);
	
    UITooltip.prototype.init = function(data, assetManager, map) {
        // call super-class implementation
        TGE['EntitiesFactory']['entity'].prototype['init'].call(this, data, assetManager, map);

        // check init params
        if (data['fps']) {
            this.duration = 1000 / +data['fps'];
        }

        this['clickable'] = false;
        this['mutable'] = true;
	}
	
    UITooltip.prototype.update = function update(dt, time, viewport) {
		this['z'] = Number.MAX_SAFE_INTEGER;//this.map.height * this.map.width * 20 + 20;
		
        this.redraw = false;
		
        if (time >= this.lasttime) {
            if (!this.lasttime) this.lasttime = time;
            while (time >= this.lasttime) {
				if (this.frame === this.frames-1) {
					return 1000;
					this.frame = (this.frame + 1) % this.frames;
				} else {
					this.frame = (this.frame + 1) % this.frames;
				}
				this.lasttime += this.duration;
			}

            this.redraw = true;
		}
		
        this.dt = this.lasttime - time;
		
        return ~~(this.dt);
	}
	
    UITooltip.prototype.render = function render(ctx, stage, vp) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (this.frame/this.frames * 0.5) + ')';
		
		var w = 100, h = 50;
		
		ctx.roundRect((vp[2]-w)/2, (vp[3]-h)/2, w, h, 5).fill()
		
		ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.frame/this.frames * 0.5) + ')';
		ctx.textAlign = 'center';
		ctx.fillText(this.text, vp[2]/2, vp[3]/2);

        ctx.restore();
    };

    UITooltip.prototype['move'] = function(x, y) {
        x = +x; y = +y;
        if (this['x'] === x && this['y'] === y) return;
        
        this.scr = undefined;

        TGE['EntitiesFactory']['entity'].prototype['move'].call(this, x, y);
		this['z'] = Number.MAX_SAFE_INTEGER;//this.map.height * this.map.width * 20 + 20;
    };
	
	UITooltip.prototype['setText'] = function(txt) {
		this.text = txt;
		
		this.redraw = true;
	}

    TGE['EntitiesFactory']['register']('ui.tooltip', UITooltip);
})(TiledGameEngine);