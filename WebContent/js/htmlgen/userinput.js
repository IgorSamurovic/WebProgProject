$.extend(User, {
	
	_orderByOptions : [
		['obj.username', 'Username'],
		['obj.date', 'Date'],
		['obj.role', 'Role'],
		['obj.email', 'Email'],
	],

	selectOrderBy : function() {
		return DataObj.selectOrderBy(this._orderByOptions, 0)
	}, 
	
	inputName : function(alt) {
		return H.inputBase({
			required  : false,
			alt       : alt,
			name      : 'name',
			placeholder : "Name",
			maxlength : '40',
			pattern   : '.{0,40}',
		});
	},	
	
	inputSurname : function(alt={}) {
		alt.name = 'surname';
		alt.placeholder = 'Surname';
		return this.inputName(alt);
	},	
	
	inputUsername : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt,
			name      : 'username',
			placeholder : "Username",
			maxlength : '40',
			pattern   : '.{0,20}',
			error     : 'Must be at least 3 characters long.',
			val       : 'selectObject',
		});
	},	
	
	inputEmail : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt,
			type      : 'email', 
			name      : 'email',
			placeholder : "Email",
			maxlength : '40',
			pattern   : '.{6,40}',
			error     : 'Must be at least 3 characters long.',
			val       : 'selectObject',
		});
	},
	
	inputPassword : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt,
			type      : 'password', 
			name      : 'password',
			placeholder : "Password",
			maxlength : '40',
			pattern   : '.{6,40}',
			error     : 'Must be at least 6 characters long.',
			val       : 'selectObject',
		});
	},
	
	inputConfirmPassword : function(alt={}) {
		alt.name = "confirmPassword";
		alt.placeholder = "Confirm Pasword";
		return this.inputPassword(alt);
	}

});