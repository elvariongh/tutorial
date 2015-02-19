(function(w, TGE) {
    function TiledMap(assetManager, asset) {
        this.asset = asset;
        
        this.am = assetManager;
    }
    
    TiledMap.prototype.parse = function() {
        if (!this.am) return false;
        
        var json = this.am.get(this.asset);
        
        if (!json) return false;
        
        return true;
    }
})(window, TiledGameEngine);