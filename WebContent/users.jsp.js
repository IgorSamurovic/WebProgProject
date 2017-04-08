$(document).ready(function() {	

	G.addPage(H.page({
		name: 'users',
		title: 'Users',
		canFilter : true,
	}));
	
	(function () {
		const params = G.getParams();
		G.restrictParams();

		var usersSearch = Search.create({
			useParams  : false,
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
					};
				},
			},
			renderFunc : User.render,
			filter     : User.renderFilter,
			updateFunc : function() {
				$(this.selTitle()).html(`Users (${this.data.totalRecords})`);
			}
		});
					
		usersSearch.loadResults();
		G.popStateHandler();

	}) ();
});