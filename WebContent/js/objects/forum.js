const Forum = Object.assign(Object.create(DataObj), {

	_table : 'forum',
	
	// ----------------------------------------------------------------------------------------------------
	// Permissions
	
	// Editing
	
	canBeEditedBy(user) {
		return !this.isDeleted() && (
			user.isAdmin()
		);
	},
	
	// Deleting	
	
	canBeDeletedBy(user) {
		return (
			user.isAdmin() && !this.isGod()
		);
	},
	
	// Locking
	
	canBeLockedBy(user) {
		return !this.isDeleted() && (
			user.isAdmin() && !this.isGod()
		);
	},
	
	getTitle : function() {
		return this.renderTitle();
	},
	
	// Locks a forum, then calls the callback function
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
	
	types : {
		publ : 0,
		open : 1,
		closed : 2
	},
	
	isPublic : function() {return this.data.vistype === this.types.publ},
	isOpen   : function() {return this.data.vistype === this.types.open},
	isClosed : function() {return this.data.vistype === this.types.closed},
	
	isLocked : function() {
		return this.data.locked;
	},
	
	isDeleted : function() {
		return this.data.deleted;
	},

	isSticky : function() {
		return this.data.sticky;
	},
	
});

$(document).ready(function() {
	
	$(document).on('click', '[name="selectForum"]', function(btn) {
		Forum.openSelectModal(this);
	});
	
	$(document).on('click', '[name="forumLockBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).lock($(that).data("val"), function() {
					Search.reloadAll();
				});
			}
		});
	});

});

