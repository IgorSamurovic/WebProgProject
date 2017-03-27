Forum = {
		
	// Renders the specified field into HTML
	
	renderTitle : function() {
		return '<a class="link2" href="forum.jsp?id={id}">{title}</a>'.supplant({id:this.data.id, title:this.data.title});
	},
	
	renderDescript : function() {
		return this.data.descript.shorten(80);
	},
	
	renderParent : function() {
		return '<a class="link2" href="forum.jsp?id={id}">{title}</a>'.supplant({id:this.data.parent, title:this.xtra.parentTitle});
	},
	
	renderOwner : function() {
		return '<a class="link2" href="profile.jsp?id={id}">{username}</a>'.supplant({id:this.data.owner, username:this.xtra.ownerUsername});
	},

	renderDate: function() {
		return this.data.date.substring(0, 16);
	},

	renderVistype: function() {
		switch (this.data.vistype) {
		case (0): return "Public";
		case (1): return "Private";
		case (2): return "Closed";
		}
	},

	renderLocked: function() {
		return (this.data.locked === true || this.data.locked === 1) ? "Yes" : "No";
	},

	renderDeleted: function() {
		return (this.data.deleted === true || this.data.deleted === 1) ? "Yes" : "No";
	}
	
};

Forums = {
	
	render : function(forum) {
		
		var currentUser = Users.getCurrent();
		var isAdmin = currentUser.data.role >= Users.roles.admin;
		var isOwner = currentUser.data.id == forum.data.owner; 
		
		// Let's make buttons first!
		var buttons = ['<div class="buttons">'];
		
		// Close buttons!
		buttons.push('</div>');
		
		// Now render the rest of it!
		var s = ['<div class="userProfile">'];
		
		var dlFields = ['Title', 'Descript', 'Parent', 'Owner', 'Visibility', 'Date', 'Locked']
		if (isAdmin) dlFields.push('Deleted');
		
		s.push(H.dl(dlFields));

		s.push(['</div>']);
		
		s = G.supplantArray(s, {
			Title      : forum.renderTitle(),
			Descript   : forum.renderDescript(),
			Parent     : forum.renderParent(),
			Owner      : forum.renderOwner(),
			Visibility : forum.renderVistype(),
			Date       : forum.renderDate(),
			Locked     : forum.renderLocked(),
			Deleted    : forum.renderDeleted()
		});
		
		return s;
	},
};
