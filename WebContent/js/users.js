function populateUserList(data, params, settings)
	{
		var num = Math.min(params.perPage, data[1].length);
		
		$("#"+settings.prefix+"SearchResults").html("");

		for (i = 0; i < num; i++)
		{
			var data2 = {
				user    : data[1][i],
				index   : i,
				current : current
			};
			
			processProfile(data2, params, settings);
		}
	}
	


Users = {
		
	_guestRawData : {
		username: "Guest",
		banned: false,
		deleted: false,
		role: 0
	},
	
	getCurrent : function()  {
		if (!Users._currentUser) {
			// First get raw user data
			var userRawData = JSON.parse(JSON.parse(G.getCookie("user")));
			
	    	if (userRawData === null) {
	    		Users._currentUser = G.create("User", _guestRawData, true);
	    	}
	    	else {
	    		Users._currentUser = G.create("User", userRawData, true);
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



