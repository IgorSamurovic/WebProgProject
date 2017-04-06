const Post = Object.assign(Object.create(DataObj), {
	
	_table : 'post',
	
	getTitle : function() {
		return `Post`;//this.renderTitle();
	},
	
	// ----------------------------------------------------------------------------------------------------
	// Permissions
	
	// Editing
	
	canBeEditedBy(user) {
		return !this.isDeleted() && (
			user.isAdmin() ||
			user.isMod() && (user.owns(this) || this.xtra.ownerRole <= User.roles.user) ||
			user.isUser() && user.owns(this) && !this.data.locked && !this.xtra.forumLocked
		);
	},
	
	// Deleting	
	
	canBeDeletedBy(user) {
		return (
			user.isAdmin() ||
			user.isMod() && (this.owner == user.data.id || this.xtra.ownerRole <= User.roles.user)
		);
	},
	
});

$(document).ready(function() {
	
});

