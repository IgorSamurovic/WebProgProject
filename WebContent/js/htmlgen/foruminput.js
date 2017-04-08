$.extend(Forum, {

	_orderByOptions : [
		['obj.date', 'Date'],
		['obj.title', 'Title'],
		['usr.username', 'Owner']
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
			placeholder : "Forum Title"
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
	
});