<%!
String title="Profile"; 
String jsfile="profile.jsp.js";
%>
<%@include file="jspf/everypage.jspf" %>

<script>

$(document).ready(function() {	

	G.addPage(H.page({
		name: 'profile',
		title: 'Profile',
		canHide: true,
		canExit: true,
		tabs: ['Profile', 'Forums', 'Threads', 'Posts']
	}));
	
	(function () {
		var params = G.getParams();
		
		if (!$.isNumeric(params.id) || params.id < 0) {
			Page.redirect();
		}
		
		if (params && params.id && parseInt(params.id)) {
			// Determine owner first
			G.dbGet({
				url: "user",
				data: {id:params.id},
				error: Page.redirect,
				}, function(data) {
				
					if (data.totalRecords === 1) {
						var ownerData = data;
						var owner = G.create(User, data[0]);
						
						// Init successful
						
						$("#profilePageTitle").html(owner.data.username);
						Page.createSearchObjects();
						G.protectParam('id');
						G.protectParam('tab');
						G.popStateHandler();
						G.tabHandler(Page.getTabId(params.tab));
						Page.render();
						
					} else {
						Page.redirect();	
					}
				});
		} else {
			Page.redirect();
		}
	}) ();
	
	// Create Search objects
	
});

Page = {

	searchObjects : [],	
		
	_tabStrings : ["profile", "forums", "threads", "posts"],
		
	getTabId : function(str) {
		return Math.max(0, this._tabStrings.indexOf(str));	
	},
	
	getTabString : function(id) {
		return this._tabStrings[Math.max(0, id)];
	},
	
	render : function() {

		// Fix tab to default in case something random was entered
		var params = G.getParams();
		if (!params.tab) {
			params.tab = this.getTabString(0);
			G.replaceState();
		}
		
		this.searchObjects[this.getTabId(params.tab)].display();
	},
	
	redirect : function () {
		var current = User.getCurrent();
		if (!current.isGuest()) {
			window.location.href = current.getProfileLink();
		} else {
			G.goHome();
		}
	},
	
	createSearchObjects : function() {
		Page.searchObjects = [];
		
		var search;
		var settings;
		var params = G.getParams();
		
		// Profile
		settings = {
			allowed    : [],
			useParams  : true,
			prefix     : "profile",
			parent     : "profilePageContent",
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
		
		Page.searchObjects.push(Search.create(settings));
		
		// Forums
		settings = {
			allowed    : ['page', 'perPage'],
			useParams  : true,
			prefix     : "forums",
			parent     : "profilePageContent",
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
			renderFunc : Forum.render 
		};
		
		Page.searchObjects.push(Search.create(settings));
		
		// Threads
		settings = (G.clone(settings));
		settings.prefix = "thread";
		settings.objType = Thread;
		settings.dataArgs.url = "thread";
		settings.renderFunc = Thread.render;
		Page.searchObjects.push(Search.create(settings));
		
		// Posts
		settings = (G.clone(settings));
		settings.prefix = "post";
		settings.objType = Post;
		settings.dataArgs.url = "post";
		settings.renderFunc = Post.render;
		Page.searchObjects.push(Search.create(settings));
	}
};

</script>
</body>
</html>

