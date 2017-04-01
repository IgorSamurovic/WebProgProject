User = Object.assign(Object.create(DataObj), {

	render : function(user) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isGod = user.isGod();
		var isOwner = currentUser.data.id == user.data.id; 
		
		var dlFields = ['Username', 'Role', 'Date', 'Name'];
		if (isAdmin || (user.data.email && isOwner)) dlFields.push('Email');
		if (isAdmin) dlFields.push('Banned', 'Deleted');
		
		var s = `<div class="userProfile">
				<div class="useravatar">{avatar}</div>
				${H.dl(dlFields)}
	           
				<div class="buttons">
					${(isAdmin && !isGod && !isOwner) ?
						H.toggleBtn(['Delete', 'Undelete'], 'userDeleteBtn', 'small btn', !user.data.deleted) : ""}
					${(isAdmin || isOwner) ?
						H.btn('Edit', 'userEditBtn', "small btn2") : ""}
					${(isAdmin && !isGod && !isOwner) ?
						H.toggleBtn(['Ban', 'Unban'], 'userBanBtn', 'small btn', !user.data.banned) : ""}
			 	</div>;

	         </div>`.supplant({
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
		
	isGod : function(id=this.data.id) {
		return id == 1;
	},
		
	generateAvatarUpload : function(target, user=this) {
		const modal = $(target).data('modal');
		const name = `avatarUpload`;
		const form = `#${name}Form`;
		const html = `
			<form id="${name}Form" class="center">
				<div class="useravatarsetup">
					<input type="file" name="avatarSelect" accept="image/*"/>
					<div class="useravatar" name="preview">
						${user.renderAvatar()}
					</div>
					<div class="buttons">
						${H.btn('Select', 'select', 'small btn')}
						${H.btn('Remove', 'remove', 'small btn')}
						${H.btn('Reset', 'reset', 'small btn', null, 'reset')}
						${H.btn('Upload', 'upload', 'small btn', null, 'submit')}
					</div>
				</div>
				${H.msg('avatarUpload')}
			</form>`;
		
		var avatarFile = null;
		
		$(target).append(html);
		
		// Browse
		
		$(form).on('click', '[name="select"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
			$('[name="avatarSelect"]').trigger('click');
		});
		
		// Remove
		$(form).on('click', '[name="select"]', function(event)
		{
		    event.stopPropagation();
		    event.preventDefault();
			$.ajax({
			    url: "avatar?id=" + user.data.id,
			    type: 'DELETE',
			    success: function(data)
			    {
			    	if (avatarFile === null) {
		    			$('[name="upload"]').addClass("hidden");
		    			$('[name="reset"]').addClass("hidden");
		    			avatarFile = null;
		    			$('[name="preview"]').html(user.renderAvatar());
			    	}
			    	G.refreshImage(user.data.id);
			    	showMsg("avatarUpload", "Avatar has been removed.", true);
			    	avatarUpdateRemoveVis();
			    }
			});
			
		});
		
	},
	
	generateEdit : function(target, user=this) {
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
		G.input.setFields(form, user.data);

		// Submit
		$(form).submit(function(event) {
			event.preventDefault();
			
			const data = G.input.loadFields(form);
			
			data.reqType = 'update';
			data.id = user.data.id;
			
			$.ajax({
				url     : 'user',
				method  : 'post',
				data    : data,
				success : function(error) {
					if (!error) {
						if (modal) {
							modal.destroy();
						}
						Page.render();
					} else {
						G.msg('editUser', error, false);
					}
				}
			});
				
		});
		
		// Cancel
		$(form).on('click', '[name="cancel"]', function(btn) {
			if (modal) {
				modal.destroy();
			}
		});
		
		// Reset
		$(form).on('click', '[name="reset"]', function(btn) {
			G.input.setFields(form, user.data);
		});	
	},
	
	openEditWindow : function(user=this) {

		const modal = Modal.create(`editUser`, `small`);

		this.generateAvatarUpload(modal.content, user);
		this.generateEdit(modal.content, user);
		
		$(modal.title).html(`Editing user ${user.data.username}`);
		modal.display();
	},
		
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
		return this.renderYesNo('banned');
	},
	
	roles : {
		guest: 0,
		user : 1,
		mod  : 2,
		admin: 3
	},
	
	isAdmin : function() {return this.data.role === this.roles.admin},
	isMod   : function() {return this.data.role === this.roles.mod},
	isUser  : function() {return this.data.role === this.roles.user},
	isGuest : function() {return this.data.role === this.roles.guest},
	
	getCurrent : function()  {
		// Create guest data if not available
		if (this._guestRawData === undefined) {
			this._guestRawData = {
				id: -1, 
				username: "Guest",
				banned: false,
				deleted: false,
				role: 0
			}
		}
		
		if (this._currentUser === undefined) {
			// First get raw user data
			var userRawData = JSON.parse(JSON.parse(G.cookie.get("user")));

	    	if (!userRawData) {
	    		this._currentUser = G.create(this, this._guestRawData, true);
	    	}
	    	else {
				if (!userRawData && userRawData.deleted) {
					G.setCookie("user", null);
					this._currentUser = G.create(this, this._guestRawData, true);
				} else {
					this._currentUser = G.create(this, userRawData, true);
				}
	    	}
		}
		return this._currentUser;
	},

	
});
