<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
    
<%@include file="jspf/headbasic.jspf"%>

<script src="js/edituser.js"></script>
<script src="js/avatarupload.js"></script>

<title>Login</title>
</head>
<body>

	<script>

	$(document).ready(function() {
		var username = window.location.href.split("?username=")[1];
		
		if (username != null) {
			$("#inputEntry").val(username);
			$("#inputPassword").focus();
		}
		else {
			$("#inputEntry").focus();
		}
		
		$("#inputForm").submit(function(event) {
			event.stopPropagation();
			event.preventDefault();
			
			$.ajax
			({
				url   :   "session",
				type  :   "POST",
				data  : {
					entry      :  $("#inputEntry").val(),
					password   :  $("#inputPassword").val(),
				},
				success: function(data) {
					G.goHome();
					G.showMsg("loginMsg", "");
				},
				error: function(data) {
					G.showMsg("loginMsg", "Wrong username or password!", "error");
				}
			});
		});
	});
	
	</script>
<body>
	<%@include file="jspf/header.jspf" %>
	<div class="page">
		<div class="pageheader">Login</div>
		<div class="pagecontent">
			<form id="inputForm">
				<input class="wide" name="entry" id="inputEntry" type='text' placeholder="Username or Email" maxlength=60 required/>
				<input class="wide" name="password" type='password' id = "inputPassword" placeholder="Password" pattern=".{6,20}" maxlength=20 required oninvalid="setCustomValidity('Password must be between 6 and 20 characters long.')" oninput="setCustomValidity('')"/>
				<div class="hidden msg" id="loginMsg"></div>
				<input class="big wide btn2 center" type="submit" value="Login"/>
			</form>
		</div>
	</div>
	<%@include file="jspf/footer.jspf" %>
</body>
</html>