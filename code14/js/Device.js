/*! TiledGameEngine v0.0.3 - 19th Mar 2015 | https://github.com/elvariongh/tiledgameengine */
(function(n, TGE) {
    "use strict";
    /**
     * @constructor
     */
    function Device() {
        this['Android'] = n.userAgent.match(/Android/i) !== null ? 1 : 0;
        this['BlackBerry'] = n.userAgent.match(/BlackBerry/i) !== null ? 1 : 0;
        this['iOS'] = n.userAgent.match(/iPhone|iPad|iPod/i) !== null ? 1 : 0;
        this['Opera'] = n.userAgent.match(/Opera Mini/i) !== null ? 1 : 0;
        this['Windows'] = n.userAgent.match(/IEMobile/i) !== null ? 1 : 0;
        
        // touch event support
        this['touch'] = (('ontouchstart' in window) || (n.MaxTouchPoints > 0) || (n.msMaxTouchPoints > 0));
        
        // orientation API support
        this['orientation'] = screen.orientation || screen.mozOrientation || screen.msOrientation || null;
        
        if (this['orientation']) {
            if (typeof this['orientation'] === 'object') {
                this['orientationLock'] =  function(v) { screen.orientation.lock(v) };
                this['orientationUnlock'] =  function(v) { screen.orientation.unlock() };
            } else {
                if (screen.mozOrientation) {
                    this['orientationLock'] =  screen.mozLockOrientation;
                    this['orientationUnlock'] =  screen.mozUnlockOrientation;
                } else if (screen.msOrientation) {
                    this['orientationLock'] =  screen.msLockOrientation;
                    this['orientationUnlock'] =  screen.msUnlockOrientation;
                } else {
                    this['orientationLock'] =  screen.lockOrientation;
                    this['orientationUnlock'] =  screen.unlockOrientation;
                }
            }
        }

        this['mobile'] = this['Android'] || this['BlackBerry'] || this['iOS'] || this['Opera'] || this['Windows'];
    }
    
    TGE['Device'] = new Device();
})(navigator, TiledGameEngine);