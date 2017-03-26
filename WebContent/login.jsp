<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<script src="/site/js/users.js"></script>
<script src="/site/js/cookies.js"></script>
<script src="/site/js/jquery.js"></script>
<script src="/site/js/skinny.js"></script>
<script src="/site/js/general.js"></script>
<script src="/site/js/edituser.js"></script>
<script src="/site/js/avatarupload.js"></script>

<jsp:include page="css/colors.css"/>
<jsp:include page="css/general.css"/>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Login</title>
</head>
<body>

	<script>
	
	var username = null;
	
	$(document).ready(function()
	{
		username = window.location.href.split("?username=")[1];
		
		if (username != null)
		{
			$("#inputEntry").val(username);
			$("#inputPassword").focus();
		}
		else
		{
			$("#inputEntry").focus();
		}
			
		var user = JSON.parse(JSON.parse(getCookie("user")));
		
		$("#logoutBtn").click(function(event)
		{
			$.delete("/site/session", {}, function(data)
			{
				console.log("logged out!");
			});
		});
		
		$("#inputForm").submit(function(event)
		{
			event.stopPropagation();
			event.preventDefault();
			
			$.ajax
			({
				url   :   "/site/session",
				type  :   "POST",
				data  :
				{
					entry      :  $("#inputEntry").val(),
					password   :  $("#inputPassword").val(),
				},
				success: function(data)
				{
					showMsg("loginMsg", false);
					window.location.href = "/site/forum.jsp";
				},
				error: function(data)
				{
					showMsg("loginMsg", "Wrong username or password!", "error");
				}
			});
			
		});
		
	});
	
	
	
	</script>
<body>
<%@include file="jspf/header.jspf" %>
<div class="pageborder">
	<div class="page">
		<div class="pageheader">Login</div>
		<div class="pagecontent">
			<form id="inputForm" method="POST" action="session">
				<input class="wide" name="entry" id="inputEntry" type='text' placeholder="Username or Email" maxlength=60 required/>
				<input class="wide" name="password" type='password' id = "inputPassword" placeholder="Password" pattern=".{6,20}" maxlength=20 required oninvalid="setCustomValidity('Password must be between 6 and 20 characters long.')" oninput="setCustomValidity('')"/>
				<div class="hidden msg" id="loginMsg"></div>
				<input class="big wide btn2 center" type="submit" value="Login"/>
			</form>
			
		</div>
	</div>
</div>
<%@include file="jspf/footer.jspf" %>
</body>
</html>