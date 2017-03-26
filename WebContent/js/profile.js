Profile = {
		
	render : function(user) {
		var isAdmin = Users.getCurrent().role >= Users.roles.admin; 
		var isOwner = Users.getCurrent().data.id == user.data.id; 
		
		// Let's make buttons first!
		var buttons = ['<div class="buttons">'];
		
		// Delete button
		if (isAdmin) {
			if (!user.data.deleted) buttons.push(
			    '<button name="userDeleteBtn" data-do="true" class="small btn flex1">Delete</button>');
			else buttons.push(
				'<button name="userDeleteBtn" data-do="false" class="small btn flex1">Undelete</button>');
		}
		
		// Edit button
		if (isAdmin || isOwner) {
			buttons.push('<button name="userEditBtn" class="small btn2 flex3">Edit</button>');
		}
		
		// Ban button
		if (isAdmin && user.data.id != 1 && !isOwner)
		{
			if (!user.data.banned) buttons.push(
				'<button name="userBanBtn" data-do="true" class="small btn flex1">Ban</button>');
			else buttons.push(
				'<button name="userBanBtn" data-do="false" class="small btn flex1">Unban</button>');
		}
		
		// Close buttons!
		buttons.push('</div>');
		
		// Now render the rest of it!
		var s = [];
		
		s.push([
			'<div class="userProfile">',
				'<div class="useravatar">{avatar}</div>',
				'<dl class="userinfo">',
					'<dt>User</dt>',
					'<dd>{username}</dd>',
					'<dt>Role</dt>',
					'<dd>{role}</dd>',
					'<dt>Date</dt>',
					'<dd>{date}</dd>',
					'<dt>Name</dt>',
					'<dd>{name}</dd>'
		]);
		
		if (isAdmin || (user.data.email && isOwner)) s.push([
					'<dt>Email</dt>',
					'<dd>{email}</dd>'
		]);
		
		if (isAdmin) s.push([
		            '<dt>Banned</dt>',
		            '<dd>{banned}</dd>',
		            '<dt>Deleted</dt>',
		            '<dd>{deleted}</dd>'
		]);
			

		s.push([
                 '</dl>',
             '</div>'
        ]);
		
		var complete = [buttons, s, buttons];
		var renderString = G.supplantArray(complete, {
			username   :  user.render.username(),
			role       :  user.render.role(),
			date       :  user.render.date(),
			name       :  user.render.name()
		});
		
		return renderString;
	}
		
};


$(document).ready(function()
{
	$(document).on('click', '[name="userDeleteBtn"]', function(button) {
		Search.getObject(this).del($(this).data("do"), function() {
			Search.getSearch(this).loadResults();
		});
	});
	
	$(document).on('click', '[name="userBanBtn"]', function(button) {
		Search.getObject(this).ban($(this).data("do"), function() {
			Search.getSearch(this).loadResults();
		});
	});
	
	$(document).on('click', '[name="userEditBtn"]', function(button) {
		Users.loadEditWindow(Search.getObject(this));
	});
});
