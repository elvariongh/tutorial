// @constructor
function Game() {
    // call super-class constructor
    TiledGameEngine.call(this);
    
    // create canvas in the #viewport container
    this.screen = new TiledGameEngine.Screen('#viewport', 640, 480);
    
    // set "world" background
    this.screen.setBGColor('gray');
    
    // sample object to animate
    this.obj = {
        x: ~~(Math.random()*640), 
        y: ~~(Math.random()*480), 
        w: 16, 
        h: 16};

    this.velocity = {x: ~~(Math.random()*3) + 1,
                    y: ~~(Math.random()*3) + 1};
};

Game.prototype = (function() {
    // super-class inheritance
    var o = Object.create(TiledGameEngine.prototype);
    
    o.init = function() {
        TiledGameEngine.prototype.init.call(this);

        this.screen.show(true);
    };
    
    o.update = function(dt) {
        // update position of sample object
        this.obj.x = (this.obj.x + this.velocity.x);
        this.obj.y = (this.obj.y + this.velocity.y);
        
        if (this.obj.x < 0 || this.obj.x + this.obj.w > this.screen.width) this.velocity.x = (-1) * this.velocity.x;
        if (this.obj.y < 0 || this.obj.y + this.obj.h > this.screen.height) this.velocity.y = (-1) * this.velocity.y;
        
        // return time till next update
        return 16 - (dt-16);
    };
    
    o.render = function() {
        // render sample object
        var ctx = this.screen.getCTX(1);
        
        this.screen.clear(1);
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        
        ctx.fillRect(this.obj.x, this.obj.y, this.obj.w, this.obj.h);
        ctx.strokeRect(this.obj.x, this.obj.y, this.obj.w, this.obj.h);
    };
    
    return o;
})();

var G = new Game();
G.init();


//window.onload = start;
