$.extend(Forum, {

	// Renders the specified field into HTML
	
	renderHeader : function (cls) {
		const txt = [];
		txt.push(this.renderTitle());
		
		const parents = this.xtra.parents;
		var i = 0;
		
		if (parents) {
			for (i = 0; i<parents.length; i++) {	
				txt.push(`<a class="link2 ${cls}" href="forum.jsp?id=${parents[i][0]}">${parents[i][1]}</a>`);
			}
		}
		
		return txt.reverse().join(" > ");
	},
	
	renderTitle : function(cls) {
		return `<a class="link2 ${cls}" href="forum.jsp?id=${this.data.id}">${this.data.title}</a>`;
	},
	
	renderDescript : function() {
		return (this.data.descript !== undefined && this.data.descript !== null) ? this.data.descript : "No description";
	},
	
	renderParent : function() {
		return `<a class="link2" href="forum.jsp?id=${this.data.parent}">${this.xtra.parentTitle}</a>`;
	},
	
	// Render pages
	
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
	},
	
	renderSelectModal : function(target, elementTarget) {
		const modal = $(target).closest('.modal').data('modalObject');
		
		Search.create({
			allowed    : ['owner', 'page', 'perPage'],
			useParams  : false,
			prefix     : "selectForum",
			parent     : target,
			flexType   : "row",
			objType    : Forum,
			filter     : Forum.renderFilterSimple,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "forum",
				data   : function() {
					return {
						orderBy : "obj.date",
						asc     : "DESC",
					};
				},
			},
			renderFunc : Forum.renderSelect,
			//filter     : User.renderFilter,
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
						${Forum.inputTitle()}
						${!isMainForum ? Forum.selectType() : ""}
					</div>
					<div class="columnFlex">
						${!isMainForum ? Forum.inputOwner({disabled:true, value:obj.xtra.ownerUsername}, {disabled:true}) : ""}
						${!isMainForum ? Forum.inputParent({disabled:true, value:obj.xtra.parentTitle}, {disabled:true}) : ""}
					</div>
				</div>

				${Forum.inputDescript()}

			</div>
		`;
		
		$(target).append(html);
		$(target).setFields(obj.data);	
	},
	
	renderAdd : function () {
		const currentUser = User.getCurrent();
		return `
			<div class="columnFlex wide">
				<div class="rowFlex">
					${Forum.inputTitle()}
					${Forum.selectType()}
					${Forum.inputOwner({disabled:true, value:currentUser.data.username}, {disabled:true, value:currentUser.data.id})}
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
	
	render : function(forum=this) {
		
		var currentUser = User.getCurrent();
		
		// Let's make buttons first!
		var buttons = [`<div class="buttons">`];
		
		if (forum.canBeEditedBy(currentUser)) {
			buttons.push(H.btn('Edit', 'editBtn', 'small special'));
		}
		
		if (forum.canBeLockedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'forumLockBtn', 'small', !forum.data.locked));
		}
		
		if (forum.canBeDeletedBy(currentUser)) {
			buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !forum.data.deleted));
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		s.push('{Avatar}');
		var dlFields, dlFields2;
		
		if (forum.isGod()) {
			dlFields = ['Description'];
			dlFields2 = [];
		} else {
			dlFields = ['Title', 'Description', 'Parent', 'Owner'];
			dlFields2 = ['Visibility', 'Date', 'Locked'];
			if (currentUser.isAdmin()) dlFields2.push('Deleted');
		}
	
		s.push(H.dl(dlFields, 'flex2'), forum.isGod() ? "" : H.dl(dlFields2, 'flex1'));

		s.push(buttons);
		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : forum.isGod() ? "" : User.renderAvatarLink(forum.data.owner, 80, 80),
			Title      : forum.renderTitle(),
			Description: forum.renderDescript(),
			Parent     : forum.renderParent(),
			Owner      : forum.renderOwner(),
			Visibility : forum.renderVistype(),
			Date       : forum.renderDate(),
			Locked     : forum.renderLocked(),
			Deleted    : forum.renderDeleted()
		});
		
		return s;
	},
	
});