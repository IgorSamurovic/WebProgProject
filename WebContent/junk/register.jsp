<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Forum</title>
	
<script src="/site/js/users.js"></script>
<script src="/site/js/cookies.js"></script>
<script src="/site/js/jquery.js"></script>
<script src="/site/js/skinny.js"></script>
<script src="/site/js/general.js"></script>
<script src="/site/js/edituser.js"></script>
<script src="/site/js/avatarupload.js"></script>

<jsp:include page="css/colors.css"/>
<jsp:include page="css/general.css"/>
	
	<script>
		var newId = null;
		
		$(document).ready(function()
		{
			$("#inputUsername").focus();
			$("#inputPassword1").keyup(validate);
	    	$("#inputPassword2").keyup(validate);
	    	
		    function validate()
		    {
		    	var inputPassword1 = $("#inputPassword1").val();
		        var inputPassword2 = $("#inputPassword2").val();
		
		        if(inputPassword1.length >= 6 && inputPassword1 == inputPassword2)
		        {
		        	showMsg("registrationMsg", false);
		        	$("#inputPassword1").css('background-color', 'lightgreen')
		        	$("#inputPassword2").css('background-color', 'lightgreen')
		        }
		        else
		        {
		        	if (inputPassword1.length > inputPassword2.length || inputPassword1.length == 0)
		        	{
		        		showMsg("registrationMsg", false);
			        	$("#inputPassword1").css('background-color', 'white')
			        	$("#inputPassword2").css('background-color', 'white')
		        	}
		        	else
		        	{
			        	showMsg("registrationMsg", "Passwords don't match.", "error");
			        	$("#inputPassword1").css('background-color', 'red')
			        	$("#inputPassword2").css('background-color', 'red')
		        	}

		        }    
		    }
			
			
			$("#inputForm").submit(function(event)
			{
				event.preventDefault();
				
				if ($("#inputPassword1").val() !== $("#inputPassword2").val())
				{
					showMsg("registrationMsg", "Passwords don't match.", "error");
					return;
				}
				else
				{
					showMsg("registrationMsg", false);
				}
				
				$.ajax
				({
					url   :   "/site/user",
					type  :   "POST",
					data  :
					{
						reqType     :  "register",
						username    :  $("#inputUsername").val(),
						email       :  $("#inputEmail").val(),
						name        :  $("#inputName").val(),
						surname     :  $("#inputSurname").val(),
						password    :  $("#inputPassword1").val(),
						avatar      :  $("#inputAvatar").get(0).files[0]
					},
					success: function(data)
					{
						if (data === "error")
						{
							showMsg("registrationMsg", "That username or email is already in use.", "error");
						}
						else
						{
							showMsg("registrationMsg", false);
							newId = data;
	
							avataruploadInit(
							{
								avatarUser: {id: newId},
								callback  : function()
								{
									$("#finish").removeClass("hidden");
									$("#inputForm").addClass("hidden");
								},
								onUpload  : function()
								{
									$("#inputAvatarDiv").addClass("hidden");
								}
							});
						}
					},
					error: function(data)
					{
						showMsg("registrationMsg", "An error occurred.", "error");
					}
				});

			});
			
			$("#finishRegistration").click(function(event)
			{
				window.location.href = "/site/login.jsp?username=" + $("#inputUsername").val();
			});
			
		});
	
	</script>
</head>
<body>
<%@include file="jspf/header.jspf" %>
<div class="pageborder">
	<div class="page">
		<div class="pageheader">Registration</div>
		<div class="pagecontent" id="pagecontent">
			<form id="inputForm">
				<input class="wide" type='text' id = "inputUsername" placeholder="Username" pattern = "[a-zA-Z0-9_]{3,20}" maxlength=20 required oninvalid="setCustomValidity('Username can only contain between 3 and 20 alphanumeric characters including the underscore.');" oninput="setCustomValidity('')"/>
				<input class="wide" type='email' id = "inputEmail" placeholder="Email" pattern = ".*@.*" maxlength=60 required/>
				<input class="wide" type='text' id = "inputName" placeholder="Name" maxlength=40 oninvalid="setCustomValidity('Maximum name length is 40 characters.');" oninput="setCustomValidity('')"/>
				<input class="wide" type='text' id = "inputSurname" placeholder="Surname" maxlength=40 oninvalid="setCustomValidity('Maximum surname length is 40 characters.');" oninput="setCustomValidity('')"/> 
				<input class="wide" type='password' id = "inputPassword1" placeholder="Password" pattern=".{6,20}" maxlength=20 required oninvalid="setCustomValidity('Password must be between 6 and 20 characters long.')" oninput="setCustomValidity('')"/>
				<input class="wide" type='password' id = "inputPassword2" placeholder="Confirm Password" pattern=".{6,20}" maxlength=20 required oninvalid="setCustomValidity('Password must be between 6 and 20 characters long.')" oninput="setCustomValidity('')"/>
				<div class="hidden msg" id="registrationMsg"></div>
				<input class="big wide btn2 center" type="submit" value="Register"/>
			</form>
			
			
			<div id="finish" class="hidden pagecontent">
				<%@include file="jspf/avatarupload.jspf" %>
				<button class="big wide btn2" id="finishRegistration">Log in</button>
			</div>
			
			
		</div>
	</div>
</div>
<%@include file="jspf/footer.jspf" %>
</body>
</html>



        		