$.extend(Post, {

	// Renders the specified field into HTML
	
	renderEdit : function(target, obj=this) {
		
		const html = `
			<div class="columnFlex wide">
				${Thread.inputText()}
			</div>
		`;
		
		$(target).append(html);
		$(target).setFields(obj.data);
	},
	
	renderHeader : function(cls) {
		return `<a class="link2 ${cls}" href="post.jsp?id=${this.data.id}">${this.data.threadTitle}</a>`;
	},
	renderText : function(shorten) {
		return (this.data.text !== undefined && this.data.text !== null) ? this.data.text.shorten(shorten) : "No text";
	},
	
	renderText : function(shorten) {
		return (this.data.text !== undefined && this.data.text !== null) ? this.data.text.shorten(shorten) : "No text";
	},
	
	renderForum : function() {
		return `<a class="link2" href="forum.jsp?id=${this.data.forum}">${this.xtra.forumTitle}</a>`;
	},

	renderAdd : function () {
		return `
			<div class="columnFlex wide">
				${Post.inputText()}
			</div>
		`;
	},
	
	renderFilterThread : function() {
		return `
			<div class="columnFlex flex4">
				${Post.inputOwner()}
				${Post.inputTextSingleRow()}
			</div>
		`;
	},
	
	render : function(post=this) {
		var currentUser = User.getCurrent();
		
		// Let's make buttons first!
		var buttons = [`<div class="buttons">`];
		
		// Editing <Only admin or owner>
		if (post.canBeEditedBy(currentUser)) {
			buttons.push(H.btn('Edit', 'editBtn', 'small special'));
		}

		if (post.canBeDeletedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !post.data.deleted));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		
		s.push('{Avatar}');
		
		var dlFields = ['Owner', 'Thread', 'Date', 'Text', ];
		
		if (currentUser.isAdmin()) dlFields1.push('Deleted');
		
		s.push(H.dl(dlFields, 'flex2'));

		s.push(buttons);
		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(post.data.owner, 80, 80),
			Text       : post.renderText(120),
			Owner      : post.renderOwner(),
			Date       : post.renderDate(),
			Deleted    : post.renderDeleted()
		});
		
		return s;
	},
	
	renderMain : function(post=this) {
		var currentUser = User.getCurrent();
		
		// Let's make buttons first!
		var buttons = [`<div class="alignRight">`];
		
		// Editing <Only admin or owner>
		if (post.canBeEditedBy(currentUser)) {
			buttons.push(H.btn('Edit', 'editBtn', 'small special'));
		}

		if (post.canBeDeletedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !post.data.deleted));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// ${post.renderLink()}
		
		return post.isDeleted() ? buttons.join("") : `

				<div class="rowFlex">
					<div class="columnFlex flex05 alignLeft">
						${post.renderDate()}
					</div>
					<div class="columnFlex flex05 alignRight">
						
					</div>
				</div>
				<hr/>
				<div class="rowFlex">
					<div class="columnFlex flex05">
						${post.renderOwner()}
						${User.renderAvatarLink(post.data.owner, 80, 80)}
					</div>
					<div class="columnFlex flex4">
						<div class="postContent">
							${post.renderText()}
						</div>
						${buttons.join("")}
					</div>
				</div>
		`;
	},

});