(function(w, TGE) {
    "use strict";

    /** @constructor */
    function EntitiesFactory() {
    };
    
    EntitiesFactory.prototype.register = function(typeName, entity) {
        this[typeName.toLowerCase()] = entity;
    };
    
    EntitiesFactory.prototype.create = function(json) {
        if (!json['type']) return undefined;
        
        var t = json['type'].toLowerCase();
        
        if (this[t]) {
            var ent = new this[t]();
            ent.init.apply(ent, arguments);
            
            return ent;
        } else if (this['entity']) {
            var ent = new this['entity']();
            ent.init.apply(ent, arguments);
            
            return ent;
        }
        
        return undefined;
    };
    
    TGE['EntitiesFactory'] = new EntitiesFactory();
})(window, TiledGameEngine);