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
						deleted : false,
					};
				},
			},
			renderFunc : User.renderSelect,
			filter     : User.renderFilter,
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
				${User.inputEmail()}
				${User.inputPassword()}
				${User.inputConfirmPassword()}
				${User.inputName()}
				${User.inputSurname()} 
				${user.isGod() ? '' : H.input.role()}
				${H.msg(name)}
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
	
	renderAvatarLink: function (id=this.data.id, height=120, width=120, cls="") {
		return '<a class="cls" href="profile.jsp?id=' + id + '">' + this.renderAvatar(id, height, width) + '</a>';
	},
	
	renderUsername : function(id=this.data.id, username=this.data.username) {
		return `<a class="link2" href="profile.jsp?id=${id}">${username}</a>`;
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
		var isDeleted = user.isDeleted();
		
		var dlFields1 = ['Username', 'Role', 'Name'];
		if (isAdmin || (user.data.email && isOwner)) dlFields1.push('Email');
		var dlFields2 = ['Date', 'Banned'];
		if (isAdmin) dlFields2.push('Deleted');
		
		var s = `
			<div class="rowFlex">
				{avatar}
				${H.dl(dlFields1, "flex2")}
	           	${H.dl(dlFields2, "flex1")}
				<div class="buttons">
					${(isAdmin && !isGod && !isOwner) ?
						H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !user.data.deleted) : ""}
					${(!isDeleted && (isAdmin || isOwner)) ?
						H.btn('Edit', 'editBtn', "small special") : ""}
					${(!isDeleted && (isAdmin && !isGod && !isOwner)) ?
						H.toggleBtn(['Ban', 'Unban'], 'userBanBtn', 'small', !user.data.banned) : ""}
			 	</div>
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

		return s;
	},
	
	renderAdd : function () {
		return `
			<div class="columnFlex wide">
				${User.inputUsername()}
				${User.inputEmail()}
				${User.inputPassword()}
				${User.inputConfirmPassword()}
				${User.selectRole({}, strict=true)}
				${User.inputName()}
				${User.inputSurname()}
			</div>
		`;
	},
	
	renderFilter : function() {
		return `
			<div class="columnFlex flex2">
				<div class="rowFlexAlways">
					${User.inputUsername()}
					${User.selectRole()}
				</div>
				${User.inputEmail()}
			</div>
			
			<div class="columnFlex flex2">
				${User.inputName()}
				${User.inputSurname()}
			</div>
			
			<div class="columnFlex flex2">
				${User.inputDate({name:'dateA'})}
				${User.inputDate({name:'dateB'})}
			</div>
		`;
	},
	
	renderSelect : function(user) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isGod = user.isGod();
		var isOwner = currentUser.data.id == user.data.id; 
		
		var dlFields = ['Username', 'Role', 'Name'];
		
		return `
			<div class="columnFlex">
				${user.renderAvatarLink(user.data.id, height=60, width=60, 'flex1')}
				${user.renderUsername()}
		        ${user.renderRole()}

				${H.btn('Select', 'select', "flex1")}

			 </div>
		`;
	},
		
});