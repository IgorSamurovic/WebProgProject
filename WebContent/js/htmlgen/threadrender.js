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
				${Thread.inputTitle()}
				${Thread.inputDescript()}
				${Thread.inputText()}
			</div>
		`;
		
		$(target).append(html);
		$(target).setFields(obj.data);
	},
	
	renderHeader : function(cls) {
		return `<a class="link2 ${cls}" href="thread.jsp?thread=${this.data.id}">${this.data.title}</a>`;
	},
	
	renderTitle : function(cls) {
		return `<a class="link2 ${cls}" href="thread.jsp?thread=${this.data.id}">${this.data.title}</a>`;
	},
	
	renderDescript : function(shorten) {
		return (this.data.descript !== undefined && this.data.descript !== null) ? this.data.descript.shorten(shorten) : "No description";
	},
	
	renderText : function(shorten) {
		return (this.data.text !== undefined && this.data.text !== null) ? this.data.text.shorten(shorten) : "No text";
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
				${Thread.inputTitle()}
				${Thread.inputText()}
				${Thread.inputDescript()}
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
	
	render : function(thread=this) {
		var currentUser = User.getCurrent();
		
		// Let's make buttons first!
		var buttons = [`<div class="buttons">`];
		
		// Editing <Only admin or owner>
		if (thread.canBeEditedBy(currentUser)) {
			buttons.push(H.btn('Edit', 'editBtn', 'small special'));
		}
		
		// Locking <Only admins and mods>
		if (thread.canBeLockedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'threadLockBtn', 'small', !thread.data.locked));
		}

		if (thread.canBeDeletedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !thread.data.deleted));
		}
		
		if (thread.canBeStickiedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Stick', 'Unstick'], 'threadStickBtn', 'small', !thread.data.sticky));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		
		s.push('{Avatar}');
		
		var dlFields = ['Title', 'Description', 'Text', 'Forum', 'Owner'];
		var dlFields2 = ['Date', 'Sticky', 'Locked'];
		
		if (currentUser.isAdmin()) dlFields2.push('Deleted');
		
		s.push(H.dl(dlFields, 'flex2'), H.dl(dlFields2, 'flex1'));

		s.push(buttons);
		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(thread.data.owner, 80, 80),
			Title      : thread.renderTitle(),
			Description: thread.renderDescript(120),
			Text       : thread.renderText(120),
			Forum      : thread.renderForum(),
			Owner      : thread.renderOwner(),
			Date       : thread.renderDate(),
			Sticky     : thread.renderSticky(),
			Locked     : thread.renderLocked(),
			Deleted    : thread.renderDeleted()
		});
		
		return s;
	},
	
	renderMain : function(thread=this) {
		var currentUser = User.getCurrent();
		
		// Let's make buttons first!
		var buttons = [`<div class="rowFlexAlways alignRight">`];
		
		// Editing <Only admin or owner>
		if (thread.canBeEditedBy(currentUser)) {
			buttons.push(H.btn('Edit', 'editBtn', 'small special'));
		}
		
		// Locking <Only admins and mods>
		if (thread.canBeLockedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'threadLockBtn', 'small', !thread.data.locked));
		}

		if (thread.canBeDeletedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !thread.data.deleted));
		}
		
		if (thread.canBeStickiedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Stick', 'Unstick'], 'threadStickBtn', 'small', !thread.data.sticky));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		return `
			<div class="columnFlex">
				<div class="rowFlex">
					<div class="columnFlex flex05 alignLeft">
						${thread.renderDate()}
					</div>
					<div class="wide flex3">
						${thread.data.sticky ? "Sticky" : ""}
						${thread.data.locked ? "Locked" : ""}
						${thread.data.deleted && currentUser.isAdmin() ? "Deleted" : ""}
						${thread.renderTitle()}					
					</div>
				</div>
				<hr/>
				<div class="rowFlex">
					<div class="columnFlex flex05">
						${thread.renderOwner()}
						${User.renderAvatarLink(thread.data.owner, 80, 80)}
					</div>
					<div class="columnFlex flex4">
						
						<div class="postContent">
							${thread.renderDescript()}
							<hr/>
							${thread.renderText()}
						</div>
						${buttons.join("")}
					</div>
				</div>
			</div>		
		`;
	},

});