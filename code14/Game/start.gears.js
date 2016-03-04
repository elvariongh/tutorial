(function(TGE) {
    "use strict";
	
	var _prefix = 'st.';
	
	var StartGear = {
		// args[0] scope of once - user or session
		// args[1] text to be displayed
		tipOnce: function(map, obj, ent, args) {
			var trig = _prefix + 'usr.' + ent['id'] + args[1];
			if (args[0] === 'user') {
				if ($['gears'].getTrigger(trig)) return;
			} else return;
			
			TGE['gears'].setTrigger(trig, 1);
			
//			var tt = $.EntitiesFactory.retain('UI.Tooltip');
			var tooltip = $.EntitiesFactory.retain('UI.Tooltip');
			
			map.addEntity(tooltip);
			tooltip.visible = true;
			tooltip.setText(args[1]);
			map.moveEntity(tooltip, 25, 15);
		},
		
		// args[0] Quest name
		// args[1] NPC name, associated with quest source/complete
		// args[2] Quest status
		addQuest: function(map, obj, ent, args) {
			
			// var trig = _prefix + 'qst.'+ent['id'] + args[0];
			var trig = _prefix + 'qst.'+args[1] + '.' + args[0];
			
			if ($['gears'].getTrigger(trig)) return;
			
			$['gears'].setTrigger(trig, args[2], true);
			
			console.info('added new quest:', args[0], ent);
			
			var q = $.EntitiesFactory.retain('QuestMark');
			if (!q) {
				$.EntitiesFactory.createPool({    type: 'QuestMark',
													x: 0,
													y: 0,
													fps: 6,

													// pool specific params
													poolSize: 4
													}, map.assetsManager, map);
																
				q = $.EntitiesFactory.retain('QuestMark');
			}
			
			if (q) {
				var npc = map.getEntityByName(args[1]);
				if (npc) {
					map.addEntity(q);
					
					q.visible = true;
					q.bind(npc);
					map.moveEntity(q, npc.x, npc.y);
				} else {
					console.warn('no NPC found');
				}
			} else {
				console.warn('no questmark object');
			}
			console.log('addQuest', args);
		}
	};
	
	if (TGE['gears']) TGE['gears']['register']('start', StartGear);
})(TiledGameEngine);