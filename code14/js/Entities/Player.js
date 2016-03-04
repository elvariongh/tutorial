/*! TiledGameEngine v0.0.4 - 23th Mar 2015 | https://github.com/elvariongh/tiledgameengine */
/** History:
 *  Who             When            What    Status  Description
 *  @elvariongh     03 Mar, 2016    n/a         	Initial commit
 */
(function(w, TGE) {
    "use strict";
    
    function Player() {
        // call super-class implementation
        TGE['EntitiesFactory']['unit'].call(this);
    }
    
    // super-class inheritance
    Player.prototype = Object.create(TGE['EntitiesFactory']['unit'].prototype);
    
	Player.getAssets = TGE['EntitiesFactory']['unit'].getAssets;
	
    TGE.EntitiesFactory.register('player', Player);
})(window, TiledGameEngine);