(function(w, TGE) {
    // @constructor
    // Publish-Subscruber pattern implementation
    function PubSub() {
        /** @private */
        this.handlers = {};
    }
    
    // Add new handler for event == key
    PubSub.prototype.subscribe = function(key, handler) {
        key = key.toLowerCase();
        if (this.handlers[key] === undefined)
            this.handlers[key] = [];
        this.handlers[key].push(handler);
    };

        // Remove handler for key
    PubSub.prototype.unsubscribe = function(key, handler) {
        key = key.toLowerCase();

        if (!this.handlers[key])
            return;

          var index = this.handlers[key].indexOf(handler)

          if (~index) {
            this.handler[key].splice(index, 1)
          }
    };

        // Notify all handlers for the specified key. Value is optional
    PubSub.prototype.notify = function(key, value) {
        key = key.toLowerCase();

        if (!this.handlers[key])
            return;

        for (var i = this.handlers[key].length; i--;) {
            if (value) {
                this.handlers[key][i](key, value)
            } else {
                this.handlers[key][i](key)
            }
        }
    };
    
    TGE['PubSub'] = PubSub;
})(window, TiledGameEngine);