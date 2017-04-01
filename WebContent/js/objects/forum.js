Forum = Object.assign(Object.create(DataObj), {

	render : function(forum=this) {
		
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isOwner = currentUser.data.id == forum.data.owner; 
		
		// Let's make buttons first!
		var buttons = ['<div class="buttons">'];
		
		if (isAdmin) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'forumDeleteBtn', 'small btn', !forum.data.deleted));
			buttons.push(H.btn('Edit', 'forumEditBtn', "small btn2"));
			buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'forumLockBtn', 'small btn', !forum.data.locked));
		}
		
		// Close buttons!
		buttons.push('</div>');
		
		// Now render the rest of it!
		var s = ['<div class="userProfile">'];
		s.push("{Avatar}");
		var dlFields = ['Title', 'Descript', 'Parent', 'Owner'];
		var dlFields2 = ['Visibility', 'Date', 'Locked'];
		if (isAdmin) dlFields2.push('Deleted');
		
		s.push(H.dl(dlFields, "flex2"), H.dl(dlFields2, "flex1"));

		s.push(buttons);
		s.push(['</div>']);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(forum.data.owner, 80, 80),
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
		
	// Bans a user, then calls the callback function
	lock: function(doLock, callback) {
		$.ajax({
			method :   "POST",
			url    :   "forum",
			data   : {
				reqType : "lock",
				id      :  this.data.id,
				locked  :  doLock
			},
			success: callback
		});
	},
	
	// Deletes a user from the database, then calls the callback function
	del: function(doDelete, callback) {
		$.ajax({
			method :   "POST",
			url    :   "forum",
			data   : {
				reqType : "delete",
				id      :  this.data.id,
				deleted :  doDelete
			},
			success: callback
		});
	},
	
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
	
});

$(document).ready(function() {
	
	$(document).on('click', '[name="forumDeleteBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {
				Search.getObject(that).del($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			}
		});
	});
	
	$(document).on('click', '[name="forumLockBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).lock($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			}
		});
	});
	
	$(document).on('click', '[name="forumEditBtn"]', function(button) {
		Search.getObject(this).openEditWindow();
	});
});

