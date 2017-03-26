User = {
	
	// Bans a user, then calls the callback function
	ban: function(doBan, callback) {
		$.post ("user", {
			reqType     : "ban",
			id          :  this.data.id,
			doBan       :  doBan,
		}).done(callback(data));
	},
	
	// Deletes a user from the database, then calls the callback function
	del: function(doDelete, callback) {
		$.post ("user", {
			reqType     : "delete",
			softDelete  :  true,
			id          :  this.data.id,
			doDelete    :  doDelete,
		}).done(callback(data));
	},
		
	// Sets a value for every role
	roles : {
		guest: 0,
		user : 1,
		mod  : 2,
		admin: 3
	},
	
	// Renders the specified field into HTML
	render: {
		
		avatar : function(height, width) {
			if (!height) height = 120;
			if (!width) width = 120;
			return '<img src="avatar?id=' + this.data.id + '&time=' + new Date().getTime() + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
			//return '<img src="avatar?id=' + id + '&time=' + 0 + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
		},
		
		avatarLink: function (height, width) {
			return '<a href="profile.jsp?id=' + this.data.id + '">' + avatar(height, width) + '</a>';
		},
		
		username : function() {
			return '<a class="link2" href="profile.jsp?id=' + this.data.id + '">' + this.data.username + '</a>';
		},
		
		email: function(maxLength) {
			return '<a href="mailto:' + this.data.email + '">' + this.data.email.shorten(maxLength) + '</a>';
		},
		
		name: function(maxLength) {
			retval = "";
			if (this.data.name !== null) retval += this.data.name + " ";
			if (this.data.surname !== null) retval += this.data.surname;
			return retval.length <= 0 ? "Not specified" : retval.shorten(maxLength);
		},

		date: function() {
			return this.data.date.substring(0, 16);
		},

		role: function() {
			switch (this.data.role) {
			case (0): return "Guest";
			case (1): return "User";
			case (2): return "Moderator";
			case (3): return "Administrator";	
			}
		},

		banned: function() {
			return (this.data.banned === true || this.data.banned === 1) ? "Yes" : "No";
		},

		deleted: function() {
			return (this.data.deleted === true || this.data.deleted === 1) ? "Yes" : "No";
		}
		
	},
		
};

















