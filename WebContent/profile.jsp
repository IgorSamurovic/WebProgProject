<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@include file="jspf/headbasic.jspf"%>

<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	// This global variable should only be defined in .jsp files!
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
			var current = Users.getCurrent();
			if (current.data.role > Users.roles.guest) {
				window.location.href = Users.getCurrent().getProfileLink();
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
				useParams  : true,
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
				renderFunc : Forum.render 
			};
			
			search = Search.create(settings);
			Page.searchObjects.push(search);
		}
	};
	
	$(document).ready(function() {	

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
							
							$("#profileHeader").html(owner.data.username);
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
	
	</script>
	 
	<div class="page">
		<div class="pageheader" id="profileHeader">Profile</div>
		
		<div class="tabs">
			<button class="tab small btn">Profile</button>
			<button class="tab small btn">Forums</button>
			<button class="tab small btn">Threads</button>
			<button class="tab small btn">Posts</button>
		</div>

		<div class="pagecontent" id="pageContent"></div>
		
	</div>
	
	<%@include file="jspf/edituser.jspf" %>
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>