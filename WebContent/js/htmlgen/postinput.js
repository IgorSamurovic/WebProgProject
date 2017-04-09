$.extend(Post, {

	_orderByOptions : [
		['obj.date', 'Date'],
		['obj.text', 'Content'],
		['usr.username', 'Owner']
	],
	
	selectOrderBy : function() {
		return DataObj.selectOrderBy(this._orderByOptions, 0)
	}, 
		
	inputText : function(alt) {
		return H.textareaBase ({
			alt       : alt,
			required  : true,
			cls       : '',
			name      : 'text',
			placeholder : 'Content...',
			maxlength : '25000',
			pattern   : '.{6,25000}',
			rows      : '8'
		});
	},
	
	inputSearchText : function(alt) {
		return H.inputBase ({
			alt       : alt,
			cls       : '',
			name      : 'text',
			placeholder : 'Post content...',
			maxlength : '50',
		});
	},
	
	inputTextSingleRow : function(alt) {
		return H.textareaBase ({
			alt       : alt,
			cls       : '',
			name      : 'text',
			placeholder : 'Content...',
			maxlength : '2500',
			rows      : '1.6'
		});
	},
	
});