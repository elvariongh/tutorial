(function(w, TGE) {
    /**
     * @constructor
     * @param {string|undefined}       tag          css query for screen HTML-element
     * @param {number|undefined}       height       screen height, 320px by default
     * @param {number|undefined}       width        screen width, 200px by default
     */
    function Screen(tag, width, height) {
        // set default values, if any
        if (!tag) tag = '#viewport';
        if (!height) height = 320;
        if (!width) width = 200;
        
        this.ctx = [];
        this.domViewport = undefined;

        // viewport data storage [left, top, width, height, visible]
        this.viewport = new Int32Array([0, 0, width, height, false]);
        
        // viewport DnD structure [startX, startY, dragging, dx, dy]
        this.dnd = new Int32Array([0, 0, 0, 0, 0]);

        // create canvas elements inside container
		var t = document.querySelector(tag);
        
        if (t) {
            t.innerHTML =   '<canvas style="position:fixed; left:0px;  top: 0px; z-index:0;" id="_background"></canvas>'+
                            '<canvas style="position:fixed; left:0px;  top: 0px; z-index:1;" id="_entity"></canvas>';
        }

        // store viewport reference and set initial css styles
        this.domViewport = t;
        this.domViewport.style.cssText = 'position:fixed; left: 0px; top:0px; display:none;';
//        this.domViewport.style.cssText = 'position:absolute; left: 50%; margin-left: -'+width/2+'px; top:50%; margin-top: -'+height/2+'px; display:none;';
        
        // store canvas context for further usage
        var canvas = [document.getElementById('_background'), document.getElementById('_entity')];
        for (var l = canvas.length; l--;) {
            this.ctx[l] = canvas[l].getContext('2d');
        }
        
        // desktop only events: resize, mousedown, mouseup, mousemove
		window.addEventListener('resize', this.onResize.bind(this));
        t.addEventListener('mousedown', this.onMouseDown.bind(this));
        t.addEventListener('mouseup', this.onMouseUp.bind(this));
        t.addEventListener('mousemove', this.onMouseMove.bind(this));
        t.addEventListener('mouseout', this.onMouseUp.bind(this));
        
        // set initial viewport size
        this.resize(width, height);
    };
    
    Screen.prototype.onMouseDown = function(e) {
        // stop event propagation
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        // store initial mouse position
        this.dnd[0] = e.clientX;
        this.dnd[1] = e.clientY;
        this.dnd[2] = true;
    };
    
    Screen.prototype.onMouseUp = function(e) {
        // stop event propagation
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        
        // stop dragging
        if (this.dnd[2]) {
            this.dnd[2] = false;
            this.dnd[3] = e.clientX - this.dnd[0];
            this.dnd[4] = e.clientY - this.dnd[1];
            
            // if mouse didn't changed its position - stop processing
            if (!this.dnd[3] && !this.dnd[4]) return;

            // update viewport coordinates
            this.viewport[0] += this.dnd[3];
            this.viewport[1] += this.dnd[4];
            
            // notify all subscribers
            TGE.bus.notify('onviewportmove');
        }
    };
    
    Screen.prototype.onMouseMove = function(e) {
        if (this.dnd[2]) {
            // stop event propagation
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            // calculate mouse position difference
            this.dnd[3] = e.clientX - this.dnd[0];
            this.dnd[4] = e.clientY - this.dnd[1];
            
            // if mouse didn't changed its position - stop processing
            if (!this.dnd[3] && !this.dnd[4]) return;
            
            // update viewport coordinates
            this.viewport[0] += this.dnd[3];
            this.viewport[1] += this.dnd[4];

            // store new initial mouse position
            this.dnd[0] = e.clientX;
            this.dnd[1] = e.clientY;
            
            // notify all subscribers
            TGE.bus.notify('onviewportmove');
        }
    };
    
    // resize event handler
    Screen.prototype.onResize = function(e) {
        this.resize(e.target.innerWidth, e.target.innerHeight);
    };
    
    // resize canvas and viewport
    Screen.prototype.resize = function(width, height) {
        for (var l = this.ctx.length; l--;) {
            this.ctx[l].canvas.width = width;
            this.ctx[l].canvas.height = height;
            this.ctx[l].width = width;
            this.ctx[l].height = height;
        }
        
        this.viewport[2] = width;
        this.viewport[3] = height;
        
        this.domViewport.style.width = width + 'px';
        this.domViewport.style.height = height + 'px';

        if (TGE.bus) {
            TGE.bus.notify('onviewportresize');
        }
    };
    
    // move viewport
    Screen.prototype.move = function(x, y) {
        // update viewport coordinates
        this.viewport[0] = x;
        this.viewport[1] = y;
        
        // notify all subscribers
        TGE.bus.notify('onviewportmove');
    };

    // show/hide screen
    Screen.prototype.show = function(visible) {
        if (visible != this.viewport[4]) {
            // make changes only if it differ from current state
            this.domViewport.style.display = visible ? 'block' : 'none';
        }
        
        this.viewport[4] = visible;
    };
    
    // get canvas context for layer.
    // @param {number}  layer   Layer number (0 for bottom layer)
    Screen.prototype.getCTX = function(layer) {
        if (this.ctx.length > layer)
            return this.ctx[layer];

        return undefined;
    };

    // clear specified layer/all layers
    // @param {number|undefined}    layer   layer id
    Screen.prototype.clear = function(layer) {
        if (layer === undefined) {
            for (var l = this.ctx.length; l--;) {
                this.ctx[l].clearRect(0, 0, this.viewport[2], this.viewport[3]);
            }
        } else {
            var ctx = this.getCTX(layer);
            if (ctx) {
                ctx.clearRect(0, 0, this.viewport[2], this.viewport[3]);
            }
        }
    };

    // set background color for whole scene
    Screen.prototype.setBGColor = function(color) {
        this.domViewport.style.backgroundColor = color;
    };
    
    TGE['Screen'] = Screen;
})(window, TiledGameEngine);