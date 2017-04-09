
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
		} else {
			G.addPage(H.page({
				name: 'posts',
				title: 'Posts',
				canHide : true,
				canFilter : true,
				hiddenContent : true
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
				G.log(data);
				if (data.totalRecords === 1) {
					var forumSearch = Search.create({
						useParams  : true,
						isSingle   : true,
						cascade    : ['subforums'],
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
							var obj = this.getOnlyObject();
							if (obj) {
								$(this.selTitle()).html(`${obj.renderHeader()}`);
							} else {
								Page.redirect();
							}
						}
					});
					
					// Render forum page
					
					var subforumsSearch = Search.create({
						useParams  : false,
						cascade    : [params.id == 1 ? 'posts' : 'threads'],
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
								var currentUser = User.getCurrent();
								var currentForum = Search.byPrefix("forum").getOnlyObject();
								return currentForum.canBePostedInBy(currentUser);
							}
						},
						updateFunc : function() {
							$(this.selTitle()).html(`Subforums (${this.data.totalRecords})`);
						}
						
					});
					
					// Threads
					
					if (params.id != 1) {
						var threadsSearch = Search.create({
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
									return `thread.jsp?thread=${id}`;
								},
								
								condition : function() {
									var currentUser = User.getCurrent();
									var currentForum = Search.byPrefix("forum").getOnlyObject();
									return currentForum.canBePostedInBy(currentUser);
								}
							},
							updateFunc : function() {
								$(this.selTitle()).html(`Threads (${this.data.totalRecords})`);
							}
						});
					}
						
					// Posts
					
					if (params.id == 1) {
						var postsSearch = Search.create({
							useParams  : false,
							filterOnly : true,
							prefix     : "posts",
							parent     : "#postsPageContent",
							objType    : Post,
							dataFunc   : G.dbGet,
							dataArgs   : {
								url    : "post",
								data   : function() {
									return {
										orderBy : "obj.DATE",
										asc     : "FALSE",
										deleted : false,
									};
								},
							},
							renderFunc : Post.render,
							filter     : Post.renderFilter,
							updateFunc : function() {
								$(this.selTitle()).html(`Posts (${this.data.totalRecords})`);
							}
						});
					}
					
					forumSearch.loadResults();
					
					G.protectParam('id');
					
				} else {
					Page.redirect();	
				}
			});
	}) ();
	
});

const Page = {
	
	redirect : function() {
		G.goHome();
	},
};