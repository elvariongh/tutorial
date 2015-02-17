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
        this.visible = false;
        this.viewport = undefined;
        this.width = width;
        this.height = height;

        // create canvas elements inside container
		var t = document.querySelector(tag);
        
        if (t) {
            t.innerHTML =   '<canvas style="position:fixed; left:0px;  top: 0px; z-index:0;" id="_background"></canvas>'+
                            '<canvas style="position:fixed; left:0px;  top: 0px; z-index:1;" id="_entity"></canvas>';
        }

        // store viewport reference and set initial css styles
        this.viewport = t;
        this.viewport.style.cssText = 'position:fixed; left: 0px; top:0px; display:none;';
        
        // store canvas context for further usage
        var canvas = [document.getElementById('_background'), document.getElementById('_entity')];
        for (var l = canvas.length; l--;) {
            this.ctx[l] = canvas[l].getContext('2d');
        }
        
        // set initial viewport size
        this.resize(width, height);
    };
    
    Screen.prototype = {
        // resize canvas
        resize: function(width, height) {
            for (var l = this.ctx.length; l--;) {
                this.ctx[l].canvas.width = width;
                this.ctx[l].canvas.height = height;
                this.ctx[l].width = width;
                this.ctx[l].height = height;
            }
            
            this.width = width;
            this.height = height;
            
            this.viewport.style.width = width + 'px';
            this.viewport.style.height = height + 'px';
        },

        // show/hide screen
        show: function(visible) {
            if (visible != this.visible) {
                // make changes only if it differ from current state
                this.viewport.style.display = visible ? 'block' : 'none';
            }
            
            this.visible = visible;
        },
        
        // get canvas context for layer.
        // @param {number}  layer   Layer number (0 for bottom layer)
        getCTX: function(layer) {
            if (this.ctx.length > layer)
                return this.ctx[layer];

            return undefined;
        },

        // clear specified layer/all layers
        // @param {number|undefined}    layer   layer id
        clear: function(layer) {
            if (layer === undefined) {
                for (var l = this.ctx.length; l--;) {
                    this.ctx[l].clearRect(0, 0, this.width, this.height);
                }
            } else {
                var ctx = this.getCTX(layer);
                if (ctx) {
                    ctx.clearRect(0, 0, this.width, this.height);
                }
            }
        },

        // set background color for whole scene
        setBGColor: function(color) {
            this.viewport.style.backgroundColor = color;
        }
    };
    
    TGE['Screen'] = Screen;
})(window, TiledGameEngine);