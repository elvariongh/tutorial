/*! TiledGameEngine v0.0.4 - 23th Mar 2015 | https://github.com/elvariongh/tiledgameengine */
/** History:
 *  Who             When            What    Status  Description
 *  @elvariongh     23 Mar, 2015    #1      Fixed   error and success counters now beeing reseted on download start
 */
(function(w, TGE) {
    /**
     * @constructor
     */
    function Assets() {
        this.success = 0;
        this.errors = 0;
        
        this.cache = {};
        
        this.queue = [];
        
        this.qmap = {};
        
        this.cbProgress = undefined;
        this.cbDone = undefined;
        
        this._fnProgress	= this._fnProgress.bind(this);
        this._fnError 		= this._fnError.bind(this);
        this._fnLoad 		= this._fnLoad.bind(this);
    };
    
    /**
     *  Request new asset to be loaded. This routine will put new asset name to the download queue
     */
    function request(name) {
        // check if such resource already requested to avoid multiple downloading of same asset
        if (this.qmap[name]) {
            return;
        }
        
        // store request
        this.queue[this.queue.length] = name;
        this.qmap[name] = 1;
    };
        
    Assets.prototype._fnProgress = function(event) {
        if (event.lengthComputable) {
            if (event.loaded !== event.total) {
                // notify about loading progress
                if (this.cbProgress) this.cbProgress(event.target.url, ~~((event.loaded / event.total) * 100));
            }
        } else {
            // length is not computable - just notify that loading in progress
            if (this.cbProgress) this.cbProgress(event.target.url, -1);
        }
    };
        
    Assets.prototype._fnError = function(event) {
        ++this.errors;

        if (this['completed']()) {
            this._fnFinish();
        }
    };
        
    Assets.prototype._fnImageLoad = function(data, type) {
        var blob = new Blob([data], {type: type});

        var img = new Image();
		
        img.onload = function(e) {
            // Clean up after yourself.
            w.URL.revokeObjectURL(img.src);
        };
        
        img.src = w.URL.createObjectURL(blob);

        return img;
    };
        
    Assets.prototype._fnJSONLoad = function(data) {
        var bufView = new Uint8Array(data);
        var length = bufView.length;
        var s = '';
        for(var i = 0; i < length; i += 65535) {
            var addition = 65535;
            
            if(i + 65535 > length) {
                addition = length - i;
            }
            
            s += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
        }
        
        return JSON.parse(s);
    };
	
	Assets.prototype._fnJSLoad = function(data) {
        var bufView = new Uint8Array(data);
        var length = bufView.length;
        var s = '';
        for(var i = 0; i < length; i += 65535) {
            var addition = 65535;
            
            if(i + 65535 > length) {
                addition = length - i;
            }
            
            s += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
        }
/*
		var sc = document.createElement('script');
		sc.language = 'javascript';
		sc.type = 'text/javascript';
		sc.defer = 'true';
		sc.text = s;
		
		document.getElementsByTagName('head').item(0).appendChild(sc);
*/
		eval(s);
		
		return true;
//		return sc;
	};
        
    Assets.prototype._fnLoad = function(xhr) {
        xhr = xhr.target;
        
        if (xhr.status !== 404) {
            var type = xhr.getResponseHeader('content-type'),
                r;

            if (type.indexOf('image') !== -1) {
                r = this._fnImageLoad(xhr.response, type);
                this.success++;
            } else if (type.indexOf('json') !== -1) {
                r = this._fnJSONLoad(xhr.response);
                this.success++;
			} else if (type.indexOf('javascript') !== -1) {
				r = this._fnJSLoad(xhr.response);
				this.success++;
            } else {
                console.warn('Unknown asset type', type);
                r = xhr.response;
                
                ++this.errors;
            }
            
            this.cache[xhr.url] = r;
        } else {
            ++this.errors;
            console.warn('Asset not found (404)', xhr.url);
        }

        if (this.cbProgress) {
            this.cbProgress(xhr.url, 100);
        }

        if (this['completed']()) {
            this._fnFinish();
        }
    };
        
    Assets.prototype._fnFinish = function() {
        var cb = this.cbDone;
        
        this.cbProgress = undefined;
        this.cbDone = undefined;
        
        this.queue.length = 0;

        if (cb) {
            cb();
        }
    };

    /**
     *  Start assets downloading
     *  @param  {callback}      fnDone      Done callback
     *  @param  {fnProgress}    fnProgress  Progress callback
     */
    function download(fnDone, fnProgress) {
        // fix #1
        this.success = 0;
        this.errors = 0
        // ~fix

        if (this.queue.length === 0) {
            if (fnDone) {
                fnDone();
            }
            return;
        }
        
        this.cbDone = fnDone;
        this.cbProgress = fnProgress;
        
        for (var i = 0, l = this.queue.length; i < l; ++i) {
            var name = this.queue[i];
            
            if (this.cache[name]) {
                if (this.cbProgress) {
                    this.cbProgress(name, 100);
                }

                if (this['completed']()) {
                    this._fnFinish();
                    return;
                }
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', name, true);
                xhr.responseType = 'arraybuffer';
                xhr.url = name;
                
                xhr.onprogress = this._fnProgress;
                xhr.onerror = this._fnError;
                xhr.onload = this._fnLoad;
                xhr.send();	
            }
        }
    };

    /**
     *  Get loaded asset by name
     *  @param  {string}    name    required asset name
     *  @return {object|undefined}
     */
    function get(name) {
        return this.cache[name];
    };

    /**
     *  Check if all assets are loaded
     */
    function completed() {
        return this.queue.length <= this.errors + this.success;
    };
    
    /**
     *  Clear download cache and internal variables
     */
    function clear() {
        this.success = 0;
        this.errors = 0
        this.cache = {};
        this.queue.length = 0;
        this.qmap = {};
        
        this.cbProgress = undefined;
        this.cbDone = undefined;
    };
    
    /**
     * Get download queue length. Indicates how many assets still in queue
     */
    function total() {
        return this.queue.length;
    };
    
    Assets.prototype['request'] = request;
    Assets.prototype['download'] = download;
    Assets.prototype['get'] = get;
    Assets.prototype['clear'] = clear;
    Assets.prototype['completed'] = completed;
    Assets.prototype['total'] = total;
    
    TGE['Assets'] = Assets;

})(window, TiledGameEngine);