$.extend(Thread, {

	// Renders the specified field into HTML
	
	renderSelectModal : function(target, elementTarget) {
		const modal = $(target).closest('.modal').data('modalObject');
		
		Search.create({
			useParams  : false,
			prefix     : "selectThread",
			parent     : target,
			flexType   : "row",
			objType    : Thread,
			filter     : Thread.renderFilterSimple,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "thread",
				data   : function() {
					return {
						orderBy : "obj.date",
						asc     : "DESC",
					};
				},
			},
			renderFunc : Thread.renderSelect,
		}).loadResults();

		// Select
		$(target).on('click', '[name="select"]', function(btn) {
			const obj = Search.getObject(this);
			$(elementTarget).siblings('[data-val="selectId"]').val(obj.data.id);
			$(elementTarget).siblings('[data-val="selectObject"]').val(obj.data.title);
			if (modal) {
				modal.destroy();
			}
		});
		
	},
	
	renderEdit : function(target, obj=this) {
		const isMainForum = obj.isGod();
		
		const html = `
			<div class="columnFlex wide">
				<div class="rowFlex">
					<div class="columnFlex">
						${Thread.inputTitle()}
						${Thread.inputDescript()}
						${Thread.inputText()}
						${!isMainForum ? Forum.selectType() : ""}
					</div>
					<div class="columnFlex">
						${!isMainForum ? Forum.inputOwner({disabled:true}) : ""}
						${!isMainForum ? Forum.inputParent({disabled:true}) : ""}
					</div>
				</div>

				${Forum.inputDescript()}

			</div>
		`;
		
		$(target).append(html);
		$(target).setFields(obj.data);	
		$(target).find('[name="!ownerUsername"]').val(obj.xtra.ownerUsername);
		$(target).find('[name="!forumTitle"]').val(obj.xtra.forumTitle);
	},
	
	renderTitle : function(cls) {
		return `<a class="link2 ${cls}" href="thread.jsp?id=${this.data.id}">${this.data.title}</a>`;
	},
	
	renderDescript : function() {
		return (this.data.descript !== undefined && this.data.descript !== null) ? this.data.descript.shorten(80) : "No description";
	},
	
	renderText : function() {
		return (this.data.text !== undefined && this.data.text !== null) ? this.data.text.shorten(100) : "No text";
	},
	
	renderForum : function() {
		return `<a class="link2" href="forum.jsp?id=${this.data.forum}">${this.xtra.forumTitle}</a>`;
	},
	
	renderSticky: function() {
		return this.renderYesNo('sticky');
	},
	
	renderAdd : function () {
		return `
			<div class="columnFlex wide">
				<div class="rowFlex">
					${Forum.inputTitle()}
					${Forum.selectType()}
					${Forum.inputOwner({disabled:true})}
				</div>
				<div>
				${Forum.inputDescript()}
				</div>
			</div>
		`;
	},
	
	renderFilter : function() {
		return `
			<div class="columnFlex flex4">
				<div class="rowFlex">
					${Forum.inputTitle()}
					${Forum.selectDescendants()}
				</div>
				${Forum.inputOwner({name:"ownerUsername"})}
			</div>
			
			<div class="columnFlex flex3">
				${Forum.inputDate({name:'dateA'})}
				${Forum.inputDate({name:'dateB'})}
			</div>
		`;
	},
	
	renderFilterSimple : function() {
		return `
			<div class="columnFlex flex4">
				<div class="rowFlex">
					${Forum.inputTitle()}
					${Forum.selectDescendants()}
				</div>
				${Forum.inputOwner({name:"ownerUsername"})}
			</div>
			
			<div class="columnFlex flex3">
				${Forum.inputDate({name:'dateA'})}
				${Forum.inputDate({name:'dateB'})}
			</div>
		`;
	},
	
	render : function(thread=this) {
		
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		var isDeleted = thread.data.deleted;
		var isOwner = currentUser.data.id == thread.data.owner; 
		
		// Let's make buttons first!
		var buttons = [`<div class="buttons">`];
		
		if (isAdmin) {
			if (!isDeleted) buttons.push(H.btn('Edit', 'editBtn', 'small special'));
			if (thread.xtra.deletable)
				buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !thread.data.deleted));
			if (!isDeleted && thread.xtra.lockable)
				buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'threadLockBtn', 'small', !thread.data.locked));
			if (!isDeleted) 
				buttons.push(H.toggleBtn(['Stick', 'Unstick'], 'threadStickBtn', 'small', !thread.data.sticky));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		s.push('{Avatar}');
		var dlFields = ['Title', 'Descript', 'Text', 'Forum', 'Owner'];
		var dlFields2 = ['Date', 'Sticky', 'Locked'];
		if (isAdmin) dlFields2.push('Deleted');
		
		s.push(H.dl(dlFields, 'flex2'), H.dl(dlFields2, 'flex1'));

		s.push(buttons);
		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(thread.data.owner, 80, 80),
			Title      : thread.renderTitle(),
			Descript   : thread.renderDescript(),
			Text       : thread.renderText(),
			Forum      : thread.renderForum(),
			Owner      : thread.renderOwner(),
			Date       : thread.renderDate(),
			Sticky     : thread.renderSticky(),
			Locked     : thread.renderLocked(),
			Deleted    : thread.renderDeleted()
		});
		
		return s;
	},
	
	renderSelect : function(forum) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		
		return `
			<div class="columnFlex">
				${User.renderAvatarLink(forum.data.owner, height=60, width=60, 'flex1')}
				<div class="flex1">
					${forum.renderTitle('flex1')}
				</div>

				${H.btn('Select', 'select', 'flex1')}

			 </div>
		`;
	}	
});