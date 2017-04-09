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
	
	selectRole : function(alt={}, strict=false) {
		const options = [
			["", "Any"],
			[1, "User"],
			[2, "Moderator"],
			[3, "Administrator"]
		];
		if (strict) {
			delete options[0];
		}
		
		return H.selectBase({
			alt : alt,
			name : "role",
			options : options,
		});
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
			maxlength : '20',
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
			pattern   : '.{3,40}',
			error     : 'Must be a proper Email address.'
		});
	},
	
	inputEntry : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt, 
			name      : 'entry',
			placeholder : "Username or Email",
			maxlength : '40',
			pattern   : '.{3,40}',
			error     : 'This field must be at least 3 characters long.',
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