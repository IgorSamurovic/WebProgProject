
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
	/*
	G.addPage(H.page({
		name: 'threads',
		title: 'Threads',
	}));
	*/
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
						allowed    : ['owner', 'page', 'perPage'],
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
							label : 'Add a subforum',
							title : 'New subforum',
							data  : function() {
								return {
									parent  : params.id,
								}
							}
						}
					}).loadResults();
					
					
					//Page.createSearchObjects();
					G.protectParam('id');
					G.popStateHandler();
					//Page.render();
					
				} else {
					Page.redirect();	
				}
			});
	}) ();
	
});

Page = {
	
	render : function() {
		this.threadsSearch.display();
	},
	
	redirect : function() {
		G.goHome();
	},
	
	createSearchObjects : function() {
		Page.searchObjects = [];
		
		var search;
		var settings;
		var params = G.getParams();
		
		// Profile
		settings = {
			allowed    : [],
			prefix     : "profile",
			parent     : "pageContent",
			objType    : User,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "user",
				data   : function() {
					return {
						id : params.id
					};
				},
			},
			renderFunc : User.render 
		};
		
		search = Search.create(settings);
		Page.searchObjects.push(search);
		
		// Forums
		settings = {
			allowed    : ['page', 'perPage'],
			prefix     : "forums",
			parent     : "pageContent",
			objType    : Forum,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "forum",
				data   : function() {
					return {
						orderBy : "DATE",
						asc     : "FALSE",
						owner   : params.id,
						page    : params.page,
						perPage : params.perPage
					};
				},
			},
			renderFunc : Forums.render 
		};
		
		search = Search.create(settings);
		Page.searchObjects.push(search);
	}
};