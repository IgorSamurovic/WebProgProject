$.extend(User, {

	renderSelectModal : function(target, elementTarget) {
		const modal = $(target).closest('.modal').data('modalObject');
		
		Search.create({
			allowed    : ['owner', 'page', 'perPage'],
			useParams  : false,
			prefix     : "selectUser",
			parent     : target,
			flexType   : "row",
			objType    : User,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "user",
				data   : function() {
					return {
						orderBy : "role",
						asc     : "DESC",
					};
				},
			},
			renderFunc : User.renderSelect,
			//filter     : User.renderFilter,
		}).loadResults();

		// Select
		$(target).on('click', '[name="select"]', function(btn) {
			const obj = Search.getObject(this);
			$(elementTarget).siblings('[data-val="selectId"]').val(obj.data.id);
			$(elementTarget).siblings('[data-val="selectObject"]').val(obj.data.username);
			if (modal) {
				modal.destroy();
			}
		});
		
	},
	
	renderEdit : function(target, user=this) {
		const modal = $(target).closest('.modal').data('modalObject');
		const name = `editUser`;
		const form = `#${name}Form`;
		
		const html = `
			<form id='${name}Form'>
				${H.input.email()}
				${H.input.name()}
				${H.input.surname()} 
				${user.isGod() ? '' : H.input.role()}
				${H.msg(name)}
				<div class="rowFlex">
					${H.btn('Reset', 'reset', 'big btn flex1')}
					${H.btn('Edit', 'edit', 'big btn2 flex3', null, 'submit')}
					${H.btn('Cancel', 'cancel', 'big btn flex1')}
				</div>
			</form>`;
		
		$(target).append(html);
		$(form).setFields(user.data);
		return form;
		
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
	
	renderName: function(maxLength = 60, omitIfEmpty=false) {
		var retval = "";
		const alternative = omitIfEmpty ? "" : "Not specified";
		if (this.data.name) retval += this.data.name + " ";
		if (this.data.surname) retval += this.data.surname;
		return retval.length <= 0 ? alternative : retval.shorten(maxLength);
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
		return this.renderYesNo('banned');
	},
	
	render : function(user) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isGod = user.isGod();
		var isOwner = currentUser.data.id == user.data.id; 
		
		var dlFields = ['Username', 'Role', 'Date', 'Name'];
		if (isAdmin || (user.data.email && isOwner)) dlFields.push('Email');
		if (isAdmin) dlFields.push('Banned', 'Deleted');
		
		var s = `
				{avatar}
				${H.dl(dlFields)}
	           
				<div class="buttons">
					${(isAdmin && !isGod && !isOwner) ?
						H.toggleBtn(['Delete', 'Undelete'], 'userDeleteBtn', 'small btn', !user.data.deleted) : ""}
					${(isAdmin || isOwner) ?
						H.btn('Edit', 'userEditBtn', "small btn2") : ""}
					${(isAdmin && !isGod && !isOwner) ?
						H.toggleBtn(['Ban', 'Unban'], 'userBanBtn', 'small btn', !user.data.banned) : ""}
			 	</div>

	         `.supplant({
			avatar     :  user.renderAvatarLink(),
			Username   :  user.renderUsername(),
			Role       :  user.renderRole(),
			Date       :  user.renderDate(),
			Name       :  user.renderName(40),
			Email      :  user.renderEmail(40),
			Banned     :  user.renderBanned(),
			Deleted    :  user.renderDeleted()
		});
		
		
		
		// Add button events
		
		if (this._renderInit === undefined) {
			$(document).on('click', '[name="userDeleteBtn"]', function(button) {
				var that = this;
				Search.getObject(this).del($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			});
			
			$(document).on('click', '[name="userBanBtn"]', function(button) {
				var that = this;
				Search.getObject(this).ban($(that).data("val"), function() {
					Search.getSearch(that).loadResults();
				});
			});
			
			$(document).on('click', '[name="userEditBtn"]', function(button) {
				Search.getObject(this).openEditWindow();
			});
			
			this._renderInit = true;
		}

		return s;
	},
	
	renderSelect : function(user) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isGod = user.isGod();
		var isOwner = currentUser.data.id == user.data.id; 
		
		var dlFields = ['Username', 'Role', 'Name'];
		
		return `
			<div class="columnFlex">
				${user.renderAvatarLink(user.data.id, height=60, width=60)}
				${user.renderUsername()}
	            ${user.renderRole()}
				<div class="buttons">
					${H.btn('Select', 'select', "")}
			 	</div>
			 </div>
		`;
	}
		
});