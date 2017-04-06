
$(document).ready(function() {	

	G.addPage(H.page({
		name: 'forum',
		title: 'Forum',
	}));
	
	G.addPage(H.page({
		name: 'subforums',
		title: 'Subforums',
		canHide : true,
		canFilter : true
	}));
	
	(function () {
		const params = G.getParams();
		
		if (!G.isProperId(params.id)) {
			params.id = 1;
			G.replaceState();
		}
		
		if (params.id != 1) {
			G.addPage(H.page({
				name: 'threads',
				title: 'Threads',
				canHide : true,
				canFilter : true
			}));
		}
		
		// Determine owner first
		G.protectParam('id');
		G.restrictParams();
		
		G.dbGet({
			url: "forum",
			data: {id:params.id},
			error: Page.redirect,
			}, function(data) {
				console.log(data);
				if (data.totalRecords === 1) {
					Search.create({
						useParams  : true,
						isSingle   : true,
						prefix     : "forum",
						parent     : "#forumPageContent",
						objType    : Forum,
						data       : data,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "forum",
							data   : function() {
								return {
									id   : params.id,
								};
							},
						},
						renderFunc : Forum.render ,
						updateFunc : function() {
							$(this.selTitle()).html(`${this.getOnlyObject().renderHeader()}`);
						}
					}).loadResults();
					
					// Render forum page
					
					Search.create({
						useParams  : false,
						prefix     : "subforums",
						parent     : "#subforumsPageContent",
						objType    : Forum,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "forum",
							data   : function() {
								return {
									orderBy : "obj.DATE",
									asc     : "FALSE",
									parent  : params.id,
								};
							},
						},
						renderFunc : Forum.render,
						filter     : Forum.renderFilter,
						add : {
							html  : Forum.renderAdd,
							label : 'New subforum',
							title : 'New subforum',
							data  : function() {
								return {
									parent  : params.id,
								}
							}, redirectTo : function(id) {
								return `forum.jsp?id=${id}`;
							} , condition : function() {
								return User.getCurrent().isAdmin();
							}
						},
						updateFunc : function() {
							$(this.selTitle()).html(`Subforums (${this.data.totalRecords})`);
						}
						
					}).loadResults();
					
					// Threads
					
					if (params.id != 1) {
						Search.create({
							useParams  : false,
							prefix     : "threads",
							parent     : "#threadsPageContent",
							objType    : Thread,
							dataFunc   : G.dbGet,
							dataArgs   : {
								url    : "thread",
								data   : function() {
									return {
										orderBy : "obj.DATE",
										asc     : "FALSE",
										forum   : params.id,
									};
								},
							},
							renderFunc : Thread.render,
							filter     : Thread.renderFilter,
							add : {
								html  : Thread.renderAdd,
								label : 'New thread',
								title : 'New thread',
								data  : function() {
									return {
										forum  : params.id,
										owner  : User.getCurrent().data.id
									}
								},
								
								redirectTo : function(id) {
									return `thread.jsp?id=${id}`;
								},
								
								condition : function() {
									var currentUser = User.getCurrent();
									console.log(Search.byPrefix("forum"));
									var currentForum = Search.byPrefix("forum").getOnlyObject();
									
									if (currentUser.isAdmin()) {
										return true;
									} else if (currentUser.isMod()) {
										return true;
									} else if (currentUser.isUser()) {
										return (currentForum.isPublic() || currentForum.isOpen()) && !currentForum.data.locked;
									} else if (currentUser.isGuest()) {
										return false;
									}
								}
							},
							updateFunc : function() {
								$(this.selTitle()).html(`Threads (${this.data.totalRecords})`);
							}
						}).loadResults();
					}
					
					G.protectParam('id');
					G.popStateHandler();
					
				} else {
					Page.redirect();	
				}
			});
	}) ();
	
});

const Page = {
	
	redirect : function() {
		console.log("hax");
		G.goHome();
	},
};