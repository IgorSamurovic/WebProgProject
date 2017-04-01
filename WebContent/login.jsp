<%!
String title="Login";
%>
<%@include file="jspf/everypage.jspf" %>

<script>

$(document).ready(function() {
	
	$('#pages').append(H.page({
		name: 'login',
		title: 'Login',
		canHide: true,
		canExit: true,
	}));
	
	$('#loginPageContent').html(`
			<form id="inputForm">
				<input class="wide" name="entry" id="inputEntry" type='text' placeholder="Username or Email" maxlength=60 required/>
				<input class="wide" name="password" type='password' id = "inputPassword" placeholder="Password" pattern=".{6,20}" maxlength=20 required oninvalid="setCustomValidity('Password must be between 6 and 20 characters long.')" oninput="setCustomValidity('')"/>
				<div class="hidden msg" name="loginMsg"></div>
				<input class="big wide btn2 center" type="submit" value="Login"/>
			</form>`);
	
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
				G.msg("loginMsg", "Wrong username or password!", "error");
			}
		});
	});
});

</script>
</body>
</html>