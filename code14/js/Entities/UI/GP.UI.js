(function(TGE) {
    "use strict";
    /**
     * @constructor
     */
    function GUI() {
        TGE['EntitiesFactory']['entity'].call(this);
		
		this.text = 'test';
		
		this['z'] = Number.MAX_SAFE_INTEGER;
		
        this.frames = 5;                           // total frames in animation sequence
        this.frame = 0;                             // current frame
        this.duration = 1000;                       // frame duration in ms
        
        this.lasttime = 0;                          // last update timestamp
        this.dt = undefined;                        // time till next update
	}

    // super-class inheritance
    GUI.prototype = Object.create(TGE['EntitiesFactory']['entity'].prototype);
	
    GUI.prototype.init = function(data, assetManager, map) {
        // call super-class implementation
        TGE['EntitiesFactory']['entity'].prototype['init'].call(this, data, assetManager, map);

        // check init params
        if (data['fps']) {
            this.duration = 1000 / +data['fps'];
        }

        this['clickable'] = false;
        this['mutable'] = true;
		
		TGE['bus']['subscribe']('mousemove',          this.onMouseMove.bind(this));
		TGE['bus']['subscribe']('click',              this.onMouseClick.bind(this));
		
		this.hovered = false;
		
		// load assets
		this['img'] = data['img'];
		this['am']['request'](this['img'] + 'quests.png');
		this['am']['download']();
	};
	
    GUI.prototype.update = function update(dt, time, viewport) {
		this['z'] = Number.MAX_SAFE_INTEGER;//this.map.height * this.map.width * 20 + 20;
		
        this.redraw = false;
		
        if (time >= this.lasttime) {
			
            if (!this.lasttime) this.lasttime = time;
            while (time >= this.lasttime) {
				if (this.frame === this.frames-1) {
					// do nothing
				} else {
					this.frame = (this.frame + 1) % this.frames;
					this.redraw = true;
				}
				this.lasttime += this.duration;
			}
		}
		
        this.dt = this.lasttime - time;
		
        return ~~(this.dt);
//		return 1000;
	}
	
    GUI.prototype.render = function render(ctx, stage, vp) {
        ctx.save();

		var maxOpacity = 0.8;
		var opacity = maxOpacity;
		if (this.hovered) {
			opacity = (this.frame/this.frames * maxOpacity);
		} else {
			opacity = (maxOpacity - (this.frame/this.frames * maxOpacity));
		}

		ctx.fillStyle = 'rgba(0, 0, 0, ' + opacity + ')';
		
		var w = 32, h = 32;
		// right sidebar
		ctx.beginPath();
		ctx.roundRect0((vp[2]-w), (vp[3]-h*6), w, h, 3);  // 1 - quest book
		ctx.roundRect0((vp[2]-w), (vp[3]-h*5), w, h, 3);  // 2 - power book
		ctx.roundRect0((vp[2]-w), (vp[3]-h*4), w, h, 3);  // 3 - skill book
		ctx.roundRect0((vp[2]-w), (vp[3]-h*3), w, h, 3);  // 4 - character window
		ctx.roundRect0((vp[2]-w), (vp[3]-h*2), w, h, 3);  // 5 - inventory
		ctx.roundRect0((vp[2]-w), (vp[3]-h*1), w, h, 3);  // 6 - settings
		ctx.closePath();
		ctx.fill();
		
		if (this['am']['completed']()) {
			var img = this['am']['get'](this['img'] + 'quests.png');
			ctx.save();
			ctx.globalAlpha = opacity;
			if (img) {
				ctx.drawImage(  img,
								0, 0,    	// position in image map
								w, h,    // dimension
								vp[2]-w,
								vp[3]-h*6,
								w, h);
			}
			ctx.restore();
		}

		// avatar circle
		ctx.fillStyle = 'rgba(0, 0, 0, ' + maxOpacity + ')';
		ctx.strokeStyle = 'rgba(125, 125, 125, ' + maxOpacity + ')';

		w = 32; h = 32;
		ctx.beginPath();
		ctx.arc(w, h, w, 0, Math.PI*2);
		ctx.roundRect0(w+w-1, h-5,  100, 10, 3);
		ctx.roundRect0(w+w-4, h+5,  100, 10, 3);
		ctx.roundRect0(w+w-12, h+15, 100, 10, 3);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();

		// map circle
		ctx.font = '8px Arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';

		w = 64; h = 64;
		ctx.beginPath();
		ctx.arc(vp[2]-w-10, h+10, w, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		
		ctx.beginPath();
		ctx.arc(vp[2]-w-10, 10, 10, 0, Math.PI*2);
		ctx.arc(vp[2]-w-10, 10, 9, 0, Math.PI*2);
		ctx.arc(vp[2]-w-10, 10, 8, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		ctx.strokeText('N', vp[2]-w-10, 10);

		ctx.beginPath();
		ctx.arc(vp[2]-w-10, 10+h*2, 10, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		ctx.strokeText('S', vp[2]-w-10, 10+h*2);

		ctx.beginPath();
		ctx.arc(vp[2]-w*2-10, 10+h, 10, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		ctx.strokeText('W', vp[2]-w*2-10, 10+h);

		ctx.beginPath();
		ctx.arc(vp[2]-10, 10+h, 10, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		
		ctx.beginPath();
		ctx.arc(vp[2]-10, 10+h, 10, 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
		ctx.fill();
		ctx.strokeText('E', vp[2]-10, 10+h);
//		ctx.circle(0, 0, w, h);

		// action bar
		w = 32; h = 32;
		ctx.roundRect((vp[2])/2-w*5, (vp[3]-h), w*10, h, 3).fill();
		/*
		ctx.roundRect((vp[2])/2-w*5, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2-w*4, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2-w*3, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2-w*2, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2-w*1, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2-w*0, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2+w*1, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2+w*2, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2+w*3, (vp[3]-h), w, h, 3).fill();
		ctx.roundRect((vp[2])/2+w*4, (vp[3]-h), w, h, 3).fill();*/

		// experience bar
		var y = vp[3]-h;
		w = w*10; h = 14; y -= h;
		ctx.fillStyle = 'rgba(0, 0, 0, ' + maxOpacity + ')';
		ctx.roundRect((vp[2]-w)/2, y, w, h, 3).fill(); // experience progress bar canvas

		ctx.fillStyle = 'rgba(0, 200, 0, ' + maxOpacity + ')';
		ctx.roundRect((vp[2]-w+4)/2, (y+2), (w-4)*0.5, h-4, 3).fill(); // experience progress bar value
		
		ctx.fillStyle = 'rgba(200, 200, 200, 1)';
		ctx.font = '9px Arial';
		ctx.fillText('100/200', (vp[2])/2, (y+h/2));
/*
		ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.frame/this.frames * 0.5) + ')';
		ctx.textAlign = 'center';
		ctx.fillText(this.text, vp[2]/2, vp[3]/2);
*/
        ctx.restore();
    };
	
	GUI.prototype.onMouseMove = function(k, v) {
		var w = 32, h = 32;

		if (v.x >= v.viewport[2]-w && v.x < v.viewport[2] &&
			v.y >= v.viewport[3]-h*6 && v.y < v.viewport[3]) {
				if (!this.hovered) {
					this.hovered = true;
					this.frame = 0;
				}
		} else {
			if (this.hovered) {
				this.hovered = false;
				this.frame = 0;
			}
		}
	};
	
	GUI.prototype.onMouseClick = function(k, v) {
		var w = 32, h = 32;

		if (v.x >= v.viewport[2]-w && v.x < v.viewport[2] &&
			v.y >= v.viewport[3]-h*6 && v.y < v.viewport[3]) {
//			console.log('clicked');
			
			for (var i = 0; i < 6; ++i) {
				if (v.y < v.viewport[3]-h*i && v.y > v.viewport[3]-h*(i+1)) {
					TGE['bus']['notify']('guiClicked', i+1);
//					console.log('clicked', i);
				}
			}
			return true;	
		} else {
			// not in the sidebar
		}
	};

    GUI.prototype['move'] = function(x, y) {
		this['z'] = Number.MAX_SAFE_INTEGER;//this.map.height * this.map.width * 20 + 20;
    };

    TGE['EntitiesFactory']['register']('ui.gui', GUI);
})(TiledGameEngine);