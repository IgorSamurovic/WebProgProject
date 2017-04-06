$.extend(Post, {

	_orderByOptions : [
		['obj.text', 'Content'],
		['usr.username', 'Owner']
	],
	
	inputText : function(alt) {
		return H.textareaBase ({
			alt       : alt,
			cls       : '',
			name      : 'text',
			placeholder : 'Content...',
			maxlength : '2500',
			rows      : '8'
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