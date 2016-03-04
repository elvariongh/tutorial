(function(w, TGE) {
    "use strict";
    
    var _ents = [];
    
    var states = {die: 'die', critdie: 'critdie', stance: 'stance'};
    
    function AIPattern() {
    };
    
    AIPattern.bind = function(ent, args) {
        if (!args) args = [];
        
        _ents[ent['id']] = {args: args}
        return true;
    };
    
    TGE.AI.register('AIPattern', AIPattern);
})(window, TiledGameEngine);