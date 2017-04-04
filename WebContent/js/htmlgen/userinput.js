$.extend(User, {
	inputUsername : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt,
			name      : '!username',
			placeholder : "Username",
			maxlength : '20',
			pattern   : '.{3,20}',
			error     : 'Must be at least 3 characters long.',
			val       : 'selectObject',
		});
	},	
});