(function(w, TGE) {
    "use strict";
    function Device() {
        this['Android'] = navigator.userAgent.match(/Android/i);
        this['BlackBerry'] = navigator.userAgent.match(/BlackBerry/i);
        this['iOS'] = navigator.userAgent.match(/iPhone|iPad|iPod/i);
        this['Opera'] = navigator.userAgent.match(/Opera Mini/i);
        this['Windows'] = navigator.userAgent.match(/IEMobile/i);

        this['mobile'] = this['Android'] || this['BlackBerry'] || this['iOS'] || this['Opera'] || this['Windows'];
    }
    
    TGE['Device'] = new Device();
})(window, TiledGameEngine);