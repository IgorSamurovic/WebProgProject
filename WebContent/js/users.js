Users = {
		
	_guestRawData : {
		username: "Guest",
		banned: false,
		deleted: false,
		role: 0
	},
	
	// Sets a value for every role
	roles : {
		guest: 0,
		user : 1,
		mod  : 2,
		admin: 3
	},
	
	getCurrent : function()  {
		if (!Users._currentUser) {
			// First get raw user data
			var userRawData = JSON.parse(JSON.parse(G.cookie.get("user")));
			if (userRawData.deleted) {
				G.setCookie("user", null);
			}
	    	if (userRawData === null) {
	    		Users._currentUser = G.create(User, _guestRawData, true);
	    	}
	    	else {
	    		Users._currentUser = G.create(User, userRawData, true);
	    	}
		}
		return Users._currentUser;
	},
	
	fetchUsers : function(args, callback) {
		G.dbGet("user", args.params, function(data) {
			callback(data);
		});
	}
	
};



