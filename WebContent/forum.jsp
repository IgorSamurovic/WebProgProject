<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@include file="jspf/headbasic.jspf"%>

<title>Profile</title>
</head>
<body>

	<%@include file="jspf/header.jspf" %>
	<script>
	
	$('body').append(H.page({
		name: 'forum',
		title: 'Forum',
		canHide: true,
		canExit: true,
	}));
	
	$('body').append(H.page({
		name: 'subforums',
		title: 'Subforums',
		canHide: true,
		canExit: true,
	}));
	
	$('body').append(H.page({
		name: 'threads',
		title: 'Threads',
		canHide: true,
		canExit: true,
	}));
	
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
			
			if (G.isProperId(params.id)) {
				// Determine owner first
				G.protectParam('id');
				G.restrictParams();
				
				G.dbGet({
					url: "forum",
					data: {id:params.id},
					error: Page.redirect,
					}, function(data) {
					
						if (data.totalRecords === 1) {
							Search.create({
								prefix     : "forum",
								parent     : "forumPageContent",
								objType    : Forum,
								data       : data,
								dataFunc   : G.dbGet,
								dataArgs   : {
									url    : "forum",
									data   : function() {
										return {
											id   : params.id,
										};
									},
								},
								renderFunc : Forum.render 
							}).loadResults();
							
							var forumData = data;
							var forum = G.create(Forum, data[0]);
							
			
							
							// Init successful							
							// Render forum page
							$("#forumPageTitle").html(forum.data.title);
							
							Search.create({
								allowed    : ['page', 'perPage'],
								useParams  : false,
								prefix     : "subforums",
								parent     : "subforumsPageContent",
								objType    : Forum,
								dataFunc   : G.dbGet,
								dataArgs   : {
									url    : "forum",
									data   : function() {
										return {
											orderBy : "DATE",
											asc     : "FALSE",
											parent  : params.id,
										};
									},
								},
								renderFunc : Forum.render 
							}).loadResults();
							
							
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
	<!--  
	<div class="page" id="forumPage">
		<div class="pageheader" id="forumInfoHeader">
			<div class="pagetitle" id="forumInfoTitle">Forum</div>
		</div>
		<div class="pagecontent" id="forumInfoContent"></div>
	</div>
	
	<div class="page" id="subforumsPage">
		<div class="pageheader" id="subforumsHeader">
			<div class="pagetitle" id="subforumsTitle">Subforums</div>
		</div>
		<div class="pagecontent" id="subforumsContent"></div>
	</div>
	
	<div class="page" id="threadsPage">
		<div class="pageheader" id="threadsHeader">
			<div class="pagetitle" id="threadsTitle">Threads</div>
		</div>
		<div class="pagecontent" id="threadsContent"></div>
	</div>
	-->
	
<%@include file="jspf/footer.jspf" %>
</body>
</html>