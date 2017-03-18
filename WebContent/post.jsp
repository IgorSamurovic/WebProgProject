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


<title>Post</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	var current = null;
	
	function redrawPage()
	{
		dbGet("post", {id:params.id}, function(data)
		{
			renderPage(data);
		});
	}
	
	function renderProfile(data, params, settings)
	{
		var data2 = {
				post    : data,
				index   : -1,
				current : current
					}
		processPost(data2, params, settings);
	}
	
	function fetchPosts(args, callback)
	{
		dbGet("post", args.params, function(data)
		{
			callback(args.params, data, args.settings);
		});
	}
	
	function renderPage(post)
	{
		$("#profileHeader").html(formatUsername(owner));
		
		var settings = {
			prefix     : "post",
			detail     : 2,
			title      : "Post",
			dataFunc   : fetchPosts,
			dataArgs   : {},
			callback   : renderProfile
			}
		settings.dataArgs.params = {id:post.id};
		settings.dataArgs.settings = settings;

		loadResults(settings.dataArgs.params, settings);
	}

	function loadPage()
	{
		var params = window.location.href.split("?")[1];
		params = $.deparam(params);
		
		if (params && params.id && parseInt(params.id))
		{
			dbGet("post", {id:params.id}, function(data)
			{
				if (data)
				{
					if (data)
						renderPage(data);
					else
						goHome();	
				}
				else
				{
					goHome();	
				}
			});
		}
		else
		{
			goHome();
		}

	}
	
	$(document).ready(function()
	{	
		current = getUserData();
		loadPage();
	
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