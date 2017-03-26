<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<script src="js/jquery.js"></script>
<script src="js/skinny.js"></script>
<script src="js/g.js"></script>
<script src="js/h.js"></script>
<script src="js/user.js"></script>
<script src="js/users.js"></script>
<script src="js/edituser.js"></script>
<script src="js/avatarupload.js"></script>
<script src="js/profile.js"></script>
<script src="js/search.js"></script>

<jsp:include page="css/colors.css"/>
<jsp:include page="css/general.css"/>

<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	$(document).ready(function()
	{	
		var owner;
		var tabStrings = ["profile", "forums", "threads", "posts"];
		
		function loadPage() {
			params = G.getParams();
			
			if (params && params.id && parseInt(params.id)) {
				// Determine owner first
				G.dbGetById("user", params.id, function(data) {
					if (data) {
						owner = G.create("User", data);
						$("#profileHeader").html(owner.data.username);
						selectTab(tabStrings.indexOf(params.tab));
					} else {
						redirectToOwnProfile();	
					}
				});
			} else {
				redirectToOwnProfile();
			}
		};
		
		var searchObjects = [];
		
		// Create Search objects
		(function() {
			var settings
			
			// Profile
			settings = {
				prefix     : "profile",
				parent     : "pageContent",
				objType    : User,
				dataFunc   : G.dbGet,
				dataArgs   : {
					url    : "user",
					data   : {id:owner.data.id},
				},
				renderFunc : Profile.render 
			}
			
			searchObjects.push(Search.create(settings));
			
		}) ();
		
		var currentTab = -1;
		
		function selectTab(tab) {
			
			// Fix tab to default in case something random was entered
			var params = G.getParams();
			if (tab < 0) {
				tab = 0;
				params.tab = tabString[0];
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
			window.location.href = "profile.jsp?id=" + Users.getCurrent().data.id;
		}
		
		
		$(window).bind('popstate', function() {
			loadPage();	
		});
		
		G.tabHandler("#profileTabs", selectTab);
		
		loadPage();
	});
	
	</script>
	 
	<div class="page">
		<div class="pageheader" id="profileHeader" ></div>
		
		<div class="tabs" id="profileTabs">
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