$.extend(Forum, {

	// Renders the specified field into HTML
	
	renderSelectModal : function(target, elementTarget) {
		const modal = $(target).closest('.modal').data('modalObject');
		
		Search.create({
			allowed    : ['owner', 'page', 'perPage'],
			useParams  : false,
			prefix     : "selectForum",
			parent     : target,
			flexType   : "row",
			objType    : Forum,
			filter     : Forum.renderFilter,
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
		$(target).find('[name="!parentTitle"]').val(obj.xtra.parentTitle);
	},
	
	renderTitle : function(cls) {
		return `<a class="link2 ${cls}" href="forum.jsp?id=${this.data.id}">${this.data.title}</a>`;
	},
	
	renderDescript : function() {
		return (this.data.descript !== undefined && this.data.descript !== null) ? this.data.descript.shorten(80) : "No description";
	},
	
	renderParent : function() {
		return `<a class="link2" href="forum.jsp?id=${this.data.parent}">${this.xtra.parentTitle}</a>`;
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
				${Forum.inputTitle()}
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
		var isAdmin = currentUser.isAdmin();
		var isGod = forum.isGod();
		var isDeleted = forum.data.deleted;
		var isOwner = currentUser.data.id == forum.data.owner; 
		
		// Let's make buttons first!
		var buttons = [`<div class="buttons">`];
		
		if (isAdmin) {
			if (!isDeleted) buttons.push(H.btn('Edit', 'editBtn', 'small special'));
			if (!isGod) {
				buttons.push(H.toggleBtn(['Delete', 'Undelete'], 'deleteBtn', 'small', !forum.data.deleted));
				if (!isDeleted) buttons.push(H.toggleBtn(['Lock', 'Unlock'], 'forumLockBtn', 'small', !forum.data.locked));
			}
		}
		
		// Close buttons!
		buttons.push(`</div>`);
		
		// Now render the rest of it!
		var s = [`<div class="rowFlex">`];
		s.push('{Avatar}');
		var dlFields = ['Title', 'Descript', 'Parent', 'Owner'];
		var dlFields2 = ['Visibility', 'Date', 'Locked'];
		if (isAdmin) dlFields2.push('Deleted');
		
		s.push(H.dl(dlFields, 'flex2'), H.dl(dlFields2, 'flex1'));

		s.push(buttons);
		s.push([`</div>`]);
		s = s.supplant({
			Avatar     : User.renderAvatarLink(forum.data.owner, 80, 80),
			Title      : forum.renderTitle(),
			Descript   : forum.renderDescript(),
			Parent     : forum.renderParent(),
			Owner      : forum.renderOwner(),
			Visibility : forum.renderVistype(),
			Date       : forum.renderDate(),
			Locked     : forum.renderLocked(),
			Deleted    : forum.renderDeleted()
		});
		
		return s;
	},
	
	renderSelect : function(forum) {
		var currentUser = User.getCurrent();
		var isAdmin = currentUser.isAdmin();
		
		return `
			<div class="columnFlex">
				${User.renderAvatarLink(forum.data.owner, height=60, width=60, {cls:'flex2'})}
				${forum.renderTitle('flex4')}
				<div class="buttons">
					${H.btn('Select', 'select', 'flex1')}
			 	</div>
			 </div>
		`;
	}	
});