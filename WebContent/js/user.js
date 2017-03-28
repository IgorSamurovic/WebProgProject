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
	
	// Getters
	
	getProfileLink : function(id=this.data.id) {
		 return "profile.jsp?id={id}&tab=profile".supplant({id:id});
	},
	
	// Renders the specified field into HTML
	
	renderAvatar : function(id=this.data.id, height=120, width=120) {
		//return '<img src="avatar?id=' + this.data.id + '&time=' + new Date().getTime() + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
		return '<img src="avatar?id=' +id+ '" class="useravatar" height="' +height+ '" width="' +width+ '"/>';
	},
	
	renderAvatarLink: function (id=this.data.id, height=120, width=120) {
		return '<a href="profile.jsp?id=' + id + '">' + this.renderAvatar(id, height, width) + '</a>';
	},
	
	renderUsername : function() {
		return '<a class="link2" href="profile.jsp?id=' + this.data.id + '">' + this.data.username + '</a>';
	},
	
	renderEmail: function(maxLength = 60) {
		return this.data.email ? '<a href="mailto:' + this.data.email + '">' + this.data.email.shorten(maxLength) + '</a>' : "Not available";
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
	
	render : function(user) {
		
		var currentUser = Users.getCurrent();
		var isAdmin = currentUser.data.role >= Users.roles.admin; 
		
		var isOwner = currentUser.data.id == user.data.id; 
		
		// Let's make buttons first!
		var buttons = ['<div class="buttons">'];
		
		// Delete button
		if (isAdmin && user.data.id != 1) {
			if (!user.data.deleted) buttons.push(
				H.smallBtnDo('Delete', 'userDeleteBtn', 'true'));
			else buttons.push(
				H.smallBtnDo('Undelete', 'userDeleteBtn', 'false'));
		}
		
		// Edit button
		if (isAdmin || isOwner) {
			buttons.push(H.smallBtn('Edit', 'userEditBtn'));
		}
		
		// Ban button
		if (isAdmin && user.data.id != 1 && !isOwner) {
			if (!user.data.banned) buttons.push(
				H.smallBtnDo('Ban', 'userBanBtn', 'true'));
			else buttons.push(
				H.smallBtnDo('Unban', 'userBanBtn', 'false'));
		}
		
		// Close buttons!
		buttons.push('</div>');
		
		// Now render the rest of it!
		var s = [];
		
		var dlFields = ['Username', 'Role', 'Date', 'Name'];
		if (isAdmin || (user.data.email && isOwner)) dlFields.push('Email');
		if (isAdmin) dlFields.push('Banned', 'Deleted');
		

		s.push([
			'<div class="userProfile">',
				'<div class="useravatar">{avatar}</div>',
				H.dl(dlFields),
	            buttons,
	         '</div>'
        ]);
		
		s = s.supplant({
			avatar     :  user.renderAvatarLink(),
			Username   :  user.renderUsername(),
			Role       :  user.renderRole(),
			Date       :  user.renderDate(),
			Name       :  user.renderName(40),
			Email      :  user.renderEmail(40),
			Banned     :  user.renderBanned(),
			Deleted    :  user.renderDeleted()
		});
		
		return s;
	},
};

$(document).ready(function() {
	
	$(document).on('click', '[name="userDeleteBtn"]', function(button) {
		var that = this;
		Search.getObject(this).del($(that).data("do"), function() {
			Search.getSearch(that).loadResults();
		});
	});
	
	$(document).on('click', '[name="userBanBtn"]', function(button) {
		var that = this;
		Search.getObject(this).ban($(that).data("do"), function() {
			Search.getSearch(that).loadResults();
		});
	});
	
	$(document).on('click', '[name="userEditBtn"]', function(button) {
		Users.loadEditWindow(Search.getObject(this));
	});
});
