const Thread = Object.assign(Object.create(DataObj), {
	
	_table : 'thread',
	
	getTitle : function() {
		return this.renderTitle();
	},
	
	// ----------------------------------------------------------------------------------------------------
	// Permissions
	
	// Posting
	canBePostedInBy(user) {
		return !this.isDeleted() && !user.isBanned() && (
			user.isAdmin() ||
			user.isMod() ||
			user.isUser() && !this.data.locked && this.xtra.allowPosting
		);
	},
	
	// Editing
	
	canBeEditedBy(user) {
		return !this.isDeleted() && !user.isBanned() && (
			user.isAdmin() ||
			user.isMod() && (user.owns(this) || this.xtra.ownerRole <= User.roles.user) ||
			user.isUser() && user.owns(this) && !this.data.locked && this.xtra.allowPosting 
		);
	},
	
	// Deleting	
	
	canBeDeletedBy(user) {
		return !user.isBanned() && (
			user.isAdmin() ||
			user.isMod() && (user.owns(this) || this.xtra.ownerRole <= User.roles.user)
		);
	},
	
	// Locking
	
	canBeLockedBy(user) {
		return !this.isDeleted() && !user.isBanned() && (
			user.isAdmin() ||
			user.isMod() && (user.owns(this) || this.xtra.ownerRole <= User.roles.mod)
		);
	},
	
	// Stickying
	
	canBeStickiedBy(user) {
		return !this.isDeleted() && !user.isBanned() && (
			user.isAdmin() ||
			user.isMod() && (user.owns(this) || this.xtra.ownerRole <= User.roles.user)
		);
	},
	
	// Locks a forum, then calls the callback function
	stick : function(doStick, callback) {
		$.ajax({
			method :   "POST",
			url    :   "thread",
			data   : {
				reqType : "stick",
				id      :  this.data.id,
				sticky  :  doStick
			},
			success: callback
		});
	},
	
	// Locks a forum, then calls the callback function
	lock : function(doLock, callback) {
		$.ajax({
			method :   "POST",
			url    :   "thread",
			data   : {
				reqType : "lock",
				id      :  this.data.id,
				locked  :  doLock
			},
			success: callback
		});
	},

	
});

$(document).ready(function() {
	
	$(document).on('click', '[name="selectThread"]', function(btn) {
		Thread.openSelectModal(this);
	});
	
	$(document).on('click', '[name="threadStickBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).stick($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			}
		});
	});
	
	$(document).on('click', '[name="threadLockBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).lock($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			}
		});
	});

});

