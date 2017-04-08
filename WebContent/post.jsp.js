
$(document).ready(function() {	

	G.addPage(H.page({
		name: 'post',
		title: 'Post',
	}));
	
	(function () {
		const params = G.getParams();
		
		if (!G.isProperId(params.id)) {
			params.id = 1;
			G.replaceState();
		}
		
		// Determine owner first
		G.protectParam('id');
		G.restrictParams();
		
		G.dbGet({
			url: "post",
			data: {id:params.id},
			error: Page.redirect,
			}, function(data) {
				
				if (data.totalRecords === 1) {
					
					Search.create({
						useParams  : true,
						isSingle   : true,
						prefix     : "post",
						parent     : "#postPageContent",
						objType    : Post,
						data       : data,
						dataFunc   : G.dbGet,
						dataArgs   : {
							url    : "post",
							data   : function() {
								return {
									id   : params.id,
								};
							},
						},
						renderFunc : Post.renderMain,
						updateFunc : function() {
							$(this.selTitle()).html(`${this.getOnlyObject().renderHeader()}`);
						}
					}).loadResults();
									
					G.protectParam('id');
					G.popStateHandler();
					
				} else {
					Page.redirect();	
				}
			});
	}) ();
	
});

const Page = {
	
	redirect : function() {
		G.goHome();
	},
};