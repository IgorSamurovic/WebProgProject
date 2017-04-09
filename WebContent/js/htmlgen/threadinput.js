$.extend(Thread, {

	_orderByOptions : [
		['obj.date', 'Date'],
		['obj.title', 'Title'],
		['usr.username', 'Owner']
	],
	
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
			placeholder : "Thread Title"
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
	
	inputText : function(alt) {
		return H.textareaBase ({
			alt       : alt,
			cls       : '',
			required  : true,
			name      : 'text',
			placeholder : 'Content...',
			maxlength : '25000',
			pattern   : '.{6,25000}',
			rows      : '8'
		});
	},

});