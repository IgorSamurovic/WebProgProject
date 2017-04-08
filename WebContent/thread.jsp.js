
$(document).ready(function() {	

	G.addPage(H.page({
		name: 'thread',
		title: 'Thread',
	}));
	
	G.addPage(H.page({
		name: 'posts',
		title: 'Posts',
		canHide : true,
		canFilter : true
	}));
	
	(function () {
		const params = G.getParams();
		
		if (!G.isProperId(params.thread)) {
			params.thread = 1;
			G.replaceState();
		}
		
		// Determine owner first
		G.protectParam('thread');
		G.restrictParams();
		
		G.dbGet({
			url: "thread",
			data: {id:params.thread},
			error: Page.redirect,
			}, function(data) {
				
				if (data.totalRecords === 1) {
					
					var threadSearch = Search.create({
						cascade    : ['posts'],
						useParams  : true,
						isSingle   : true,
						prefix     : "thread",
						parent     : "#threadPageContent",
						objType    : Thread,
						data       : data,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "thread",
							data   : function() {
								return {
									id   : params.thread,
								};
							},
						},
						renderFunc : Thread.renderMain,
						updateFunc : function() {
							console.log("thread upd8");
							$(this.selTitle()).html(`${this.getOnlyObject().renderHeader()}`);
						}
					});
											
					// Render replies


					var replySearch = Search.create({
						useParams  : false,
						prefix     : "posts",
						parent     : "#postsPageContent",
						objType    : Post,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "post",
							data   : function() {
								return {
									orderBy : "obj.DATE",
									asc     : "TRUE",
									thread  : params.thread,
								};
							},
						},
						renderFunc : Post.renderMain,
						filter     : Post.renderFilterThread,
						add : {
							html  : Post.renderAdd,
							label : 'Reply',
							title : 'Reply',
							data  : function() {
								return {
									thread  : params.thread,
									owner  : User.getCurrent().data.id,
								}
							/*}, redirectTo : function(id) {
								return `thread.jsp?thread=${params.thread}&page=1000000`;*/
							} , condition : function() {
								var currentUser = User.getCurrent();
								var currentThread = Search.byPrefix("thread").getOnlyObject();
								return currentThread.canBePostedInBy(currentUser);
							}
						},
						updateFunc : function() {
							console.log("reply upd8");
							$(this.selTitle()).html(`Replies (${this.data.totalRecords})`);
						}
						
					});
					
					threadSearch.loadResults();
					
					if (!data[0].isDeleted()) {
						replySearch.loadResults();
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
		G.goHome();
	},
};