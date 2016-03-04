(function(TGE) {
    "use strict";
	
	var triggers = {};
	
	function Gears() {};
	
	Gears.prototype.register = function(name, obj) {
		this[name] = obj;
	};
	
	Gears.prototype.setTrigger = function(name, val, save) {
		triggers[name] = val;
		
		if (save && localStorage) {
			localStorage.setItem(name, val);
		}
	};
	
	Gears.prototype.getTrigger = function(name) {
		if (!triggers[name] && localStorage) {
			triggers[name] = localStorage.getItem(name);
		}
		
		console.log(triggers[name]);
		return triggers[name];
		
	};
	
	
	TGE['gears'] = new Gears();
})(TiledGameEngine);