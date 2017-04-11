
$(document).ready(function() {	

	G.addPage(H.page({
		name: 'profile',
		title: 'Profile',
	}));
	
	G.addPage(H.page({
		name: 'threads',
		title: 'Threads',
		canHide : true,
	}));
	
	G.addPage(H.page({
		name: 'posts',
		title: 'Posts',
		canHide : true,
	}));
	
	(function () {
		const params = G.getParams();
		const current = User.getCurrent();
		
		if (!G.isProperId(params.id)) {
			params.id = current.data.id;
			G.replaceState();
		}
		
		// Determine owner first
		G.protectParam('id');
		G.restrictParams();
		
		G.dbGet({
			url: "user",
			data: {id:params.id},
			error: Page.redirect,
			}, function(data) {
				
				if (data.totalRecords === 1) {
					
					Search.create({
						isSingle   : true,
						prefix     : "profile",
						parent     : "#profilePageContent",
						objType    : User,
						data       : data,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "user",
							data   : function() {
								return {
									id   : params.id,
								};
							},
						},
						renderFunc : User.render,
						updateFunc : function() {
							var obj = this.getOnlyObject();
							if (obj) {
								$(this.selTitle()).html(`${obj.renderHeader()}`);
								G.refreshImage(obj.data.id);
							} else {
								Page.redirect();
							}
							
						},
					}).loadResults();
											
					// Render threads

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
									orderBy : "obj.date",
									asc     : "FALSE",
									owner   : params.id,
								};
							},
						},
						renderFunc : Thread.render,
						updateFunc : function() {
							$(this.selTitle()).html(`Threads (${this.data.totalRecords})`);
						}
						
					}).loadResults();
					
					// Render posts

					var postsSearch = Search.create({
						useParams  : false,
						prefix     : "posts",
						parent     : "#postsPageContent",
						objType    : Post,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "post",
							data   : function() {
								return {
									orderBy : "obj.date",
									asc     : "FALSE",
									owner   : params.id,
								};
							},
						},
						renderFunc : Post.render,
						updateFunc : function() {
							$(this.selTitle()).html(`Posts (${this.data.totalRecords})`);
						}
						
					}).loadResults();
					
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