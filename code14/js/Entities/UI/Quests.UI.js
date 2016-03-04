(function(TGE) {
    "use strict";
    /**
     * @constructor
     */
    function QuestLog() {
        TGE['EntitiesFactory']['entity'].call(this);
		
		this.text = 'Quest Log';
		
		this['z'] = Number.MAX_SAFE_INTEGER;
		
        this.frames = 10;                           // total frames in animation sequence
        this.frame = 0;                             // current frame
        this.duration = 1000;                       // frame duration in ms
        
        this.lasttime = 0;                          // last update timestamp
        this.dt = undefined;                        // time till next update
		
		TGE['bus']['subscribe']('guiClicked',          this.onGUIClicked.bind(this));
	}

    // super-class inheritance
    QuestLog.prototype = Object.create(TGE['EntitiesFactory']['entity'].prototype);
	
    QuestLog.prototype.init = function(data, assetManager, map) {
        // call super-class implementation
        TGE['EntitiesFactory']['entity'].prototype['init'].call(this, data, assetManager, map);

        // check init params
        if (data['fps']) {
            this.duration = 1000 / +data['fps'];
        }

		this['z'] = Number.MAX_SAFE_INTEGER;
        this['clickable'] = false;
        this['mutable'] = true;
		this['visible'] = false;
		
		TGE['bus']['subscribe']('click',              this.onMouseClick.bind(this));

		// load assets
		this['img'] = data['img'];
		this['am']['request'](this['img'] + 'quests.png');
		this['am']['download']();
	}
	
    QuestLog.prototype.update = function update(dt, time, viewport) {
//		this.z = this.map.height * this.map.width * 20 + 20;
		
        this.redraw = false;
		
		if (!this.visible) return this.duration * this.frames;
		
        if (time >= this.lasttime) {
            if (!this.lasttime) this.lasttime = time;
            while (time >= this.lasttime) {
				if (this.frame === this.frames-1) {
					//return 1000;
					// this.frame = (this.frame + 1) % this.frames;
				} else {
					this.frame = (this.frame + 1) % this.frames;
					this.redraw = true;
				}
				this.lasttime += this.duration;
			}
		}
		
        this.dt = this.lasttime - time;
		
        return ~~(this.dt);
	}
	
    QuestLog.prototype.render = function render(ctx, stage, vp) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (this.frame/this.frames * 0.7) + ')';
		
		var w = 320, h = 480;
		
		ctx.beginPath();
		ctx.roundRect((vp[2]-w)/2, (vp[3]-h)/2, w, h, 5).clip();
		ctx.closePath();
		ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, ' + (this.frame/this.frames * 0.2) + ')';
		ctx.beginPath();
		ctx.rect((vp[2]-w)/2, (vp[3]-h)/2 + 32, 130, h-32);
		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.frame/this.frames * 0.5) + ')';
		ctx.font = 'bold 12pt Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.text, vp[2]/2, (vp[3]-h)/2 + 16);

		if (this['am']['completed']()) {
			var img = this['am']['get'](this['img'] + 'quests.png');
			ctx.save();
			ctx.globalAlpha = (this.frame/this.frames * 0.7);
			if (img) {
				ctx.drawImage(  img,
								0, 0,    	// position in image map
								32, 32,    // dimension
								(vp[2]-w)/2,
								(vp[3]-h)/2,
								32, 32);
			}
			ctx.restore();
		}

        ctx.restore();
    };

    QuestLog.prototype['move'] = function(x, y) {
        x = +x; y = +y;
        if (this['x'] === x && this['y'] === y) return;
        
        this.scr = undefined;

        TGE['EntitiesFactory']['entity'].prototype['move'].call(this, x, y);
//		this.z = this.map.height * this.map.width * 20 + 20;
		this['z'] = Number.MAX_SAFE_INTEGER;
		
		this.map['resortRequired'] = true;
    };
	
	QuestLog.prototype.onGUIClicked = function(key, value) {
		if (value === 6) { // quests window
			this.visible ^= true;
			this.map['resortRequired'] = true;
//			this.frame = 0;
		}
	};

	QuestLog.prototype.onMouseClick = function(k, v) {
		if (!this.visible) return;
		
		var w = 320, h = 480;

		if (v.x >= (v.viewport[2]-w)/2 && v.x < (v.viewport[2]+w)/2 &&
			v.y >= (v.viewport[3]-h)/2 && v.y < (v.viewport[3]+h)/2) {
			console.log('clicked');
			
			return true;	
		} else {
			// not in that window
		}
	};

    TGE['EntitiesFactory']['register']('ui.gui.quests', QuestLog);
})(TiledGameEngine);