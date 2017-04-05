
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
	
	G.addPage(H.page({
		name: 'threads',
		title: 'Threads',
		canHide : true,
		canFilter : true
	}));
	
	(function () {
		const params = G.getParams();
		
		if (!G.isProperId(params.id)) {
			params.id = 1;
			G.replaceState();
		}
		
		// Determine owner first
		G.protectParam('id');
		G.restrictParams();
		
		G.dbGet({
			url: "forum",
			data: {id:params.id},
			error: Page.redirect,
			}, function(data) {
			
				if (data.totalRecords === 1) {
					Search.create({
						useParams  : true,
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
						renderFunc : Forum.render 
					}).loadResults();
					
					var forumData = data;
					var forum = Forum.create(data[0]);
					
					// Init successful							
					// Render forum page
					$("#forumPageTitle").html(forum.data.title);
					
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
									owner   : params.owner
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
							}
						}
					}).loadResults();
					
					// Threads
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
								}
							}
						}
					}).loadResults();
					
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