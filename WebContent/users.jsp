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

<title>Users</title>
</head>
<body>

	
	
	<script>
	
	var users = null;
	var current = null;
	var searchParams = null;
	
	$(document).ready(function()
	{	
		current = getUserData();
		var searchParams = window.location.href.split("?")[1];
		if (searchParams)
			searchParams = $.deparam(searchParams);
		else
			searchParams = {};
		
		$(window).bind("popstate", function() {
			searchParams = window.location.href.split("?")[1];
			if (searchParams)
				searchParams = $.deparam(searchParams);
			else
				searchParams = {};
			loadUserSearchPage(searchParams);
		});
		
		function renderSearchResults(params)
		{
			var settings = {
				prefix     : "user",
				detail     : 1,
				title      : "Users",
				dataFunc   : fetchUsers,
				dataArgs   : {},
				callback   : populateUserList
				}
			settings.dataArgs.params = params;
			settings.dataArgs.settings = settings;
			loadResults(params, settings);
		}
		
		loadUserSearchPage(searchParams);
		
		if (searchParams)
			renderSearchResults(searchParams);

		function loadUserSearchPage(params)
		{
			if (params != null)
			{
				params.page = parseInt(params.page);
				if (!params.page) params.page = 1;
				
				if (params.username) $("#inputUsername").val(params.username);
				if (params.email) $("#inputEmail").val(params.email);
				if (params.name) $("#inputName").val(params.name);
				if (params.surname) $("#inputSurname").val(params.surname);
				if (params.dateA) $("#inputDateA").val(params.dateA);
				if (params.dateB) $("#inputDateB").val(params.dateB);
				if (params.role) $("#inputRole").val(params.role);
				if (params.orderBy) $("#inputOrderBy").val(params.orderBy);
				if (params.perPage) $("#inputPerPage").val(params.perPage);
				if (params.asc) $("#inputAsc").val(params.asc);
				if (params.includeBanned) $("#inputIncludeBanned").val(params.includeBanned);
				if (params.includeDeleted) $("#inputIncludeDeleted").val(params.includeDeleted);
				
				renderSearchResults(params);
				
			}
		}
		
		function getParams()
		{
			obj = {
				username    :  $("#inputUsername").val(),
				email       :  $("#inputEmail").val(),
				name        :  $("#inputName").val(),
				surname     :  $("#inputSurname").val(),
				dateA       :  $("#inputDateA").val(),
				dateB       :  $("#inputDateB").val(),
				role        :  $("#inputRole").val(),
				orderBy     :  $("#inputOrderBy").val(),
				asc         :  $("#inputAsc").val(),
				startFrom   :  0,
				perPage     :  $("#inputPerPage").val(),
				page        :  1
			}	
			
			if (current.role >= role.admin)
			{
				obj.includeBanned = $("#inputIncludeBanned").val();
				obj.includeDeleted = $("#inputIncludeDeleted").val();
			}
			
			return obj;
		}
		
		$("#inputForm").submit(function(event)
		{
			event.preventDefault();
			params = getParams();
			if (!params) params = {};
			
				params.page = 1;
				//window.location.href = "users.jsp?" + $.param(params);
				window.history.pushState("", "Users", "users.jsp?" + $.param(params));
				hide("#searchPage", true);
				hide("#resultsContainer", false);
				renderSearchResults(params);
			


		});

		
	});
	
	</script>
	
	<%@include file="jspf/header.jspf" %>
	<%@include file="jspf/usersearch.jspf" %>
	<%@include file="jspf/results.jspf" %>
	<%@include file="jspf/edituser.jspf" %>
	<%@include file="jspf/footer.jspf" %>
</body>
</html>