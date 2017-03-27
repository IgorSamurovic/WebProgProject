<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@include file="jspf/headbasic.jspf"%>
<script src="js/forum.js"></script>
<script src="js/edituser.js"></script>
<script src="js/avatarupload.js"></script>
<script src="js/search.js"></script>

<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	$(document).ready(function() {	
		var owner;
		var ownerData;
		var tabStrings = ["profile", "forums", "threads", "posts"];
		
		function loadPage() {
			
			var params = G.getParams();
			
			if (!$.isNumeric(params.id) || params.id < 0) {
				redirectToOwnProfile();
			}
			
			if (params && params.id && parseInt(params.id)) {
				// Determine owner first
				G.dbGet({
					url: "user",
					data: {id:params.id},
					error: redirectToOwnProfile,
					}, function(data) {
					
						if (data.totalRecords === 1) {
							ownerData = data;
							owner = G.create(User, data[0]);
							
							$("#profileLabel").html(owner.data.username);
							createSearchObjects();
							render();
						} else {
							redirectToOwnProfile();	
						}
					});
			} else {
				redirectToOwnProfile();
			}
		};
		
		var searchObjects;
		
		// Create Search objects
		function createSearchObjects() {
			searchObjects = [];
			var search;
			var settings;
			var params = G.getParams();
			
			// Profile
			settings = {
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
				renderFunc : Users.render 
			}
			
			search = Search.create(settings);
			searchObjects.push(search);
			
			// Forums
			settings = {
				prefix     : "forums",
				parent     : "pageContent",
				objType    : Forum,
				dataFunc   : G.dbGet,
				dataArgs   : {
					url    : "forum",
					data   : function() {
						return {
							owner   : params.id,
							page    : params.page,
							perPage : params.perPage
						};
					},
				},
				renderFunc : Forums.render 
			}
			
			search = Search.create(settings);
			searchObjects.push(search);
		};
		
		var currentTab = -1;
		
		function render() {
			
			// Fix tab to default in case something random was entered
			var params = G.getParams();
			if (!params.tab || tabStrings.indexOf(params.tab) < 0) {
				params.tab = tabStrings[0];
				G.replaceState();
			}
			
			searchObjects[tabStrings.indexOf(params.tab)].display();
		}
		
		function selectTab(tab) {
			if (tab != currentTab) {
				currentTab = tab;
				var params = G.getParams();
				params.tab = tabStrings[tab];
				G.pushState();
				render();
			}
		}
		
		function redirectToOwnProfile() {
			window.location.href = "profile.jsp?id=" + Users.getCurrent().data.id;
			console.log("htmm");
		}
		
		
		$(window).bind('popstate', function() {
			var params = G.getParams(true);
			render();
		});
		
		G.tabHandler("#profileTabs", selectTab);
		
		loadPage();
	});
	
	</script>
	 
	<div class="page">
		<div class="pageheader" id="profileHeader" >Profile</div>
		
		<div class="tabs" id="profileTabs">
			<button class="tab small btn">Profile</button>
			<button class="tab small btn">Forums</button>
			<button class="tab small btn">Threads</button>
			<button class="tab small btn">Posts</button>
		</div>
		
		<div class="pagecontent" id="pageContent">
			
		</div>
		
	</div>
	
	<%@include file="jspf/edituser.jspf" %>
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>