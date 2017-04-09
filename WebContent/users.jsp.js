$(document).ready(function() {	

	G.addPage(H.page({
		name: 'users',
		title: 'Users',
		canFilter : true,
	}));
	
	(function () {
		const params = G.getParams();

		var usersSearch = Search.create({
			allowed    : ['id', 'page', 'perPage'],
			useParams  : true,
			prefix     : "users",
			parent     : "#usersPageContent",
			objType    : User,
			dataFunc   : G.dbGet,
			dataArgs   : {
				url    : "user",
				data   : function() {
					return {
						orderBy : "obj.username",
						asc     : "true",
						page    : params.page,
						perPage : params.perPage,
					};
				},
			},
			renderFunc : User.render,
			filter     : User.renderFilter,
			updateFunc : function() {
				$(this.selTitle()).html(`Users (${this.data.totalRecords})`);
			},
			add : {
				html  : User.renderAdd,
				label : 'Add user',
				title : 'Add user',
				data  : function() {
					return {
					}
				},
				
				condition : function() {
					return User.getCurrent().isAdmin();
				}
			}
		});
		
		usersSearch.loadResults();

	}) ();
});