$.extend(Forum, {

	_orderByOptions : [
		['obj.DATE', 'Date'],
		['obj.TITLE', 'Title'],
		['usrowner.USERNAME', 'Owner']
	],
	
	selectType : function(alt) {
		return H.selectBase({
			name : "vistype",
			cls  : 'flex05',
			options : [
				['0', 'Public'],
				['1', 'Open'],
				['2', 'Closed']
			]
		});
	},
	
	inputTitle : function(alt) {
		return H.inputBase ({
			required  : true,
			alt       : alt,
			cls       : '',
			name      : 'title',
			maxlength : '40',
			pattern   : '.{3,40}',
			error     : 'Must be at least 3 characters long.',
			val       : 'selectObject',
		});
	},
	
	inputDescript : function(alt) {
		return H.textareaBase ({
			alt       : alt,
			cls       : '',
			name      : 'descript',
			placeholder : 'Description...',
			maxlength : '250',
			rows      : '3'
		});
	},

	inputOwner : function(alt, alt2) {
		alt = $.extend({
			name    : '!ownerUsername',
			placeholder : 'Owner',
		}, alt);
		
		alt2 = $.extend({
			name    : 'owner',
			placeholder : 'Id',
		}, alt2);
		
		return this.inputUser(alt, alt2);
	},
	
	inputParent : function(alt, alt2) {
		alt = $.extend({
			name    : '!parentTitle',
			placeholder : 'Parent',
		}, alt);
		
		alt2 = $.extend({
			name    : 'parent',
			placeholder : 'Id',
		}, alt2);
		
		return this.inputForum(alt, alt2);
	},
	
	inputDate : function(alt) {
		return H.inputBase ({
			alt       : alt,
			cls       : '',
			type      : 'datetime-local',
			name      : name || 'date',
		});
	},
		
});