<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@include file="jspf/headbasic.jspf"%>
<script src="js/edituser.js"></script>
<script src="js/avatarupload.js"></script>
<script src="js/profile.js"></script>
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
			
			if (params && params.id && parseInt(params.id)) {
				// Determine owner first
				G.dbGet({url: "user", data: {id:params.id}}, function(data) {
					
					if (data) {
						ownerData = data;
						owner = G.create(User, data[0]);
						
						$("#profileLabel").html(owner.data.username);
						createSearchObjects();
						selectTab(tabStrings.indexOf(params.tab));
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
			
			
			// Profile
			settings = {
				prefix     : "profile",
				parent     : "pageContent",
				objType    : User,
				dataArg    : ownerData,
				dataFunc   : G.dbGet,
				dataArgs   : {
					url    : "user",
					data   : {id:owner.data.id},
				},
				renderFunc : Profile.render 
			}
			
			search = Search.create(settings);
			
			searchObjects.push(search);
		};
		
		var currentTab = -1;
		
		function selectTab(tab) {
			
			// Fix tab to default in case something random was entered
			var params = G.getParams();
			if (tab < 0) {
				tab = 0;
				params.tab = tabStrings[0];
				G.replaceState();
			}
			if (tab != currentTab) {
				if (currentTab >= 0) {
					searchObjects[currentTab].show(false);
				}
				currentTab = tab;
				searchObjects[currentTab].show(true);
				params.tab = tabStrings[currentTab];
				G.pushState();
			}
		}
		
		function redirectToOwnProfile() {
			//window.location.href = "profile.jsp?id=" + Users.getCurrent().data.id;
		}
		
		
		$(window).bind('popstate', function() {
			loadPage();	
		});
		
		G.tabHandler("#profileTabs", selectTab);
		
		loadPage();
	});
	
	</script>
	 
	<div class="page">
		<div class="pageheader" id="profileHeader" >Profile</div>
		
		<div class="pagecontent" id="pageContent">
			<div class="tabs" id="profileTabs">
				<button class="tab small btn">Profile</button>
				<button class="tab small btn">Forums</button>
				<button class="tab small btn">Threads</button>
				<button class="tab small btn">Posts</button>
			</div>
		</div>
		
	</div>
	
	<%@include file="jspf/edituser.jspf" %>
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>