User = {
		
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
	
	// Deletes a user from the database, then calls the callback function
	del: function(doDelete, callback) {
		$.ajax({
			method :   "POST",
			url    :   "user",
			data   : {
				reqType : "delete",
				id      :  this.data.id,
				deleted :  doDelete
			},
			success: callback
		});
	},
	
	// Renders the specified field into HTML

	renderAvatar : function(height, width) {
		if (!height) height = 120;
		if (!width) width = 120;
		return '<img src="avatar?id=' + this.data.id + '&time=' + new Date().getTime() + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
	},
	
	renderAvatarLink: function (height, width) {
		return '<a href="profile.jsp?id=' + this.data.id + '">' + this.renderAvatar(height, width) + '</a>';
	},
	
	renderUsername : function() {
		return '<a class="link2" href="profile.jsp?id=' + this.data.id + '">' + this.data.username + '</a>';
	},
	
	renderEmail: function(maxLength = 60) {
		return '<a href="mailto:' + this.data.email + '">' + this.data.email.shorten(maxLength) + '</a>';
	},
	
	renderName: function(maxLength = 60) {
		var retval = "";
		if (this.data.name) retval += this.data.name + " ";
		if (this.data.surname) retval += this.data.surname;
		return retval.length <= 0 ? "Not specified" : retval.shorten(maxLength);
	},

	renderDate: function() {
		return this.data.date.substring(0, 16);
	},

	renderRole: function() {
		switch (this.data.role) {
		case (0): return "Guest";
		case (1): return "User";
		case (2): return "Moderator";
		case (3): return "Administrator";	
		}
	},

	renderBanned: function() {
		return (this.data.banned === true || this.data.banned === 1) ? "Yes" : "No";
	},

	renderDeleted: function() {
		return (this.data.deleted === true || this.data.deleted === 1) ? "Yes" : "No";
	}
		
		
};