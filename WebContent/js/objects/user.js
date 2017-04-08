const  User = Object.assign(Object.create(DataObj), {

	_table : 'user',
	
	getTitle : function() {
		return this.renderUsername();
	},
	
	owns : function(obj) {
		return this.data.id == obj.data.owner
	},
	
	// Bans a user, then calls the callback function
	ban: function(doBan, callback) {
		$.ajax({
			method :   "POST",
			url    :   "user",
			data   : {
				reqType : "ban",
				id      :  this.data.id,
				banned  :  doBan
			},
			success: callback
		});
	},
	
	roles : {
		guest: 0,
		user : 1,
		mod  : 2,
		admin: 3
	},
	
	isAdmin : function() {return this.data.role >= this.roles.admin},
	isMod   : function() {return this.data.role >= this.roles.mod},
	isUser  : function() {return this.data.role >= this.roles.user},
	isGuest : function() {return this.data.role >= this.roles.guest},
	
	getCurrent : function()  {
		// Create guest data if not available
		if (this._guestRawData === undefined) {
			this._guestRawData = {
				id: -1, 
				username: "Guest",
				banned: false,
				deleted: false,
				role: 0
			}
		}
		
		if (this._currentUser === undefined) {
			// First get raw user data
			var userRawData = JSON.parse(JSON.parse(G.cookie.get("user")));

	    	if (!userRawData) {
	    		this._currentUser = G.create(this, this._guestRawData, true);
	    	}
	    	else {
				if (!userRawData && userRawData.deleted) {
					G.setCookie("user", null);
					this._currentUser = G.create(this, this._guestRawData, true);
				} else {
					this._currentUser = G.create(this, userRawData, true);
				}
	    	}
		}
		return this._currentUser;
	},

	
});

$(document).ready(function() {

	$(document).on('click', '[name="selectUser"]', function(btn) {
		User.openSelectModal(this);
	});
	
	$(document).on('click', '[name="userBanBtn"]', function(button) {
		var that = this;
		Search.getObject(this).ban($(that).data("val"), function() {
			Search.getSearch(that).loadResults();
		});
	});
});
