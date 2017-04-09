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
	
	renderLink : function(cls) {
		return `<a class="link2 ${cls}" href="post.jsp?id=${this.data.id}">Post</a>`;
	},
	
	renderHeader : function(cls) {
		return `Post in <a class="link2 ${cls}" href="thread.jsp?thread=${this.data.thread}">${this.xtra.threadTitle}</a>`;
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

	renderFilter : function() {
		return `
			<div class="columnFlex flex8">
				<div class="rowFlex">
					<div class="columnFlex flex4">
						<div class="rowFlex">
							${Forum.inputTitle({name:"forumTitle"})}
							${Thread.inputTitle({name:"threadTitle"})}
						</div>
						${Forum.inputOwner({name:"ownerUsername"})}
					</div>
					
					<div class="columnFlex flex3">
						${Forum.inputDate({name:'dateA'})}
						${Forum.inputDate({name:'dateB'})}
					</div>
				</div>
				${Post.inputSearchText()}
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
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		
		s.push('{Avatar}');
		
		var dlFields1 = ['Post', 'Thread', 'Owner', 'Text'];
		var dlFields2 = ['Forum', 'Found', 'Date'];
		if (currentUser.isAdmin()) dlFields2.push('Deleted');
		
		s.push(H.dl(dlFields1, 'flex2'), H.dl(dlFields2, 'flex1'));

		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(post.data.owner, 80, 80),
			Text       : post.renderText(),
			Owner      : post.renderOwner(),
			Thread     : post.renderThread(),
			Post   	   : post.renderLink(),
			Found      : post.xtra.resultForumId ? post.renderResultForum() : post.renderForum(),
			Forum      : post.renderForum(),
			Date       : post.renderDate(),
			Deleted    : post.renderDeleted()
		});
		
		return s;
	},
	
	renderResultForum(cls) {
		return Forum.renderTitle("", this.xtra.resultForumId, this.xtra.resultForumTitle);
	},
	
	renderForum(cls) {
		return Forum.renderTitle("", this.xtra.forumId, this.xtra.forumTitle);
	}, 
	
	renderThread(cls) {
		return Thread.renderTitle("", this.data.thread, this.xtra.threadTitle);
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
						${post.renderLink()}
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