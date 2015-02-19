(function(w, TGE) {
    function TiledMap(assetManager, asset) {
        this.asset = asset;
        
        this.am = assetManager;
    }
    
    TiledMap.prototype.parse = function() {
        if (!this.am) return false;
        
        var json = this.am.get(this.asset);
        
        if (!json) return false;
        
        var layers = json['layers'],
            layer;
        
        var i = layers.length;
        
        for (;i--;) {
            layer = layers[i];
            
            if (layer['type'] === 'tilelayer') {
                // compress regular JS array to typed array for memory usage optimization and further processing speed
                layer['data'] = new Uint16Array(layer['data']);
            }
        }
        
        return true;
    };
    
    TiledMap.prototype.getAssets = function() {
        var json = this.am.get(this.asset);
        
        if (!json) return [];
        
        var tilesets = json['tilesets'], 
            imgs = [],
            tileset;
            
        var i = tilesets.length;

        for (; i--;) {
            tileset = tilesets[i];
            if (tileset['properties']['download']) {
                if (tileset['properties']['download'] === 'false' ||
                    tileset['properties']['download'] === '0') {
                    continue;
                }
            }
            
            imgs[imgs.length] = tileset['image'];
        }
        
        return imgs;
    };
    
    TGE['TiledMap'] = TiledMap;

})(window, TiledGameEngine);