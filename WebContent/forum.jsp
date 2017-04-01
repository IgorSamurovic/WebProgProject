<%!
String title="Forum"; 
%>
<%@include file="jspf/everypage.jspf" %>

<script>

$(document).ready(function() {	

	G.addPage(H.page({
		name: 'forum',
		title: 'Forum',
		canHide: true,
		canExit: true,
	}));
	
	G.addPage(H.page({
		name: 'subforums',
		title: 'Subforums',
		canHide: true,
		canExit: true,
	}));
	
	G.addPage(H.page({
		name: 'threads',
		title: 'Threads',
		canHide: true,
		canExit: true,
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
						prefix     : "forum",
						parent     : "forumPageContent",
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
					var forum = G.create(Forum, data[0]);
					
	
					
					// Init successful							
					// Render forum page
					$("#forumPageTitle").html(forum.data.title);
					
					Search.create({
						allowed    : ['page', 'perPage'],
						useParams  : false,
						prefix     : "subforums",
						parent     : "subforumsPageContent",
						objType    : Forum,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "forum",
							data   : function() {
								return {
									orderBy : "DATE",
									asc     : "FALSE",
									parent  : params.id,
								};
							},
						},
						renderFunc : Forum.render 
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
		}
		
		search = Search.create(settings);
		Page.searchObjects.push(search);
	}
};


</script>
</body>
</html>