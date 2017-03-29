<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@include file="jspf/headbasic.jspf"%>

<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	// This global variable should only be defined in .jsp files!
	Page = {
		
		render : function() {
			this.threadsSearch.display();
		},
		
		redirect : function() {
			G.goHome();
		},
		
		createSearchObjects : function() {
			Page.searchObjects = [];
			
			var search;
			var settings;
			var params = G.getParams();
			
			// Profile
			settings = {
				allowed    : [],
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
			Page.searchObjects.push(search);
			
			// Forums
			settings = {
				allowed    : ['page', 'perPage'],
				prefix     : "forums",
				parent     : "pageContent",
				objType    : Forum,
				dataFunc   : G.dbGet,
				dataArgs   : {
					url    : "forum",
					data   : function() {
						return {
							orderBy : "DATE",
							asc     : "FALSE",
							owner   : params.id,
							page    : params.page,
							perPage : params.perPage
						};
					},
				},
				renderFunc : Forums.render 
			}
			
			search = Search.create(settings);
			Page.searchObjects.push(search);
		}
	};
	
	$(document).ready(function() {	

		(function () {
			const params = G.getParams();
			console.log(params);
			
			if (G.isProperId(params.id)) {
				// Determine owner first
				G.dbGet({
					url: "forum",
					data: {id:params.id},
					error: Page.redirect,
					}, function(data) {
					
						if (data.totalRecords === 1) {
							var forumData = data;
							var forum = G.create(Forum, data[0]);
							
							// Init successful
							
							// Render forum page
							$("#forumInfoHeader").html(forum.data.title);
							$("#forumInfoContent").html(forum.render());
							
							// Render subforums
							G.dbGet({
								url: 'forum',
								data: {parent:params.id, perPage:50},
							}, function(data) {
								console.log(data);
								if (data.totalRecords > 0) {
									for (var i=0; i<data.totalRecords; i++) {
										data[i] = G.create(Forum, data[i]);
										$("#subforumsContent").append(data[i].render());
									}
									
									$("#subforumsHeader").html('Subforums ('+data.totalRecords+')');	
								} else {
									$("#subforumsPage").remove();
									console.log(data.totalRecords);
								}
								
							});
							
							//Page.createSearchObjects();
							G.protectParam('id');
							G.popStateHandler();
							//Page.render();
							
						} else {
							Page.redirect();	
						}
					});
			} else {
				Page.redirect();
			}
		}) ();

		
	});
	
	</script>
	 
	<div class="page" id="forumPage">
		<div class="pageheader" id="forumInfoHeader">Forum</div>
		<div class="pagecontent" id="forumInfoContent"></div>
	</div>
	
	<div class="page" id="subforumsPage">
		<div class="pageheader" id="subforumsHeader">Subforums</div>
		<div class="pagecontent" id="subforumsContent"></div>
	</div>
	
	<div class="page" id="threadsPage">
		<div class="pageheader" id="threadsHeader">Threads</div>
		<div class="pagecontent" id="threadsContent"></div>
	</div>
	
	<%@include file="jspf/edituser.jspf" %>
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>