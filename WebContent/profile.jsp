<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">

<script src="/site/js/users.js"></script>
<script src="/site/js/cookies.js"></script>
<script src="/site/js/jquery.js"></script>
<script src="/site/js/skinny.js"></script>
<script src="/site/js/general.js"></script>
<script src="/site/js/edituser.js"></script>
<script src="/site/js/avatarupload.js"></script>
<script src="/site/js/profile.js"></script>
<script src="/site/js/forum.js"></script>
<script src="/site/js/search.js"></script>

<jsp:include page="css/colors.css"/>
<jsp:include page="css/general.css"/>


<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	var owner = null;
	var current = null;

	function redirectToOwnProfile()
	{
		window.location.href = "profile.jsp?id=" + current.id;
	}
	
	function redrawProfile()
	{
		getUser(owner.id, function(data)
		{
			owner = data;
			renderPage();
		});
	}
	
	function renderProfile(data, params, settings)
	{

		var data2 = {
				user    : data,
				index   : -1,
				current : current
				}
		
		processProfile(data2, params, settings);
	}
	
	function renderPage()
	{
		$("#profileHeader").html(formatUsername(owner));
		
		var settings = {
			prefix     : "profile",
			detail     : 2,
			title      : "Profile",
			dataFunc   : fetchUsers,
			dataArgs   : {},
			callback   : renderProfile
			}
		settings.dataArgs.params = {id:owner.id};
		settings.dataArgs.settings = settings;

		loadResults(settings.dataArgs.params, settings);
	}

	function loadPage()
	{
		var params = window.location.href.split("?")[1];
		params = $.deparam(params);
		
		if (params && params.id && parseInt(params.id))
		{
			getUser(params.id, function(data)
			{
				if (data)
				{
					owner = data;
					if (data)
						renderPage();
					else
						redirectToOwnProfile();	
				}
				else
				{
					redirectToOwnProfile();	
				}
			});
		}
		else
		{
			redirectToOwnProfile();
		}

	}
	
	$(document).ready(function()
	{	
		current = getUserData();
		loadPage();
		
		$(window).bind('popstate', function()
		{
			loadPage();	
		});
		
	});
	
	</script>
	  
	<div class="pageborder">
		<div class="page">
			<div id="profileHeader" class="pageheader"></div>
			<div id="profileSearchResults" class="pagecontent"> 
			</div>
		</div>
	</div>
	
	
	<%@include file="jspf/edituser.jspf" %>
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>