
$(document).ready(function() {	

	G.addPage(H.page({
		name: 'register',
		title: 'Register',
	}));
	
	const content = $('#registerPageContent');
	
	content.html(`
		<form id="form">
			${User.renderAdd()}
			${H.msg('response')}
			${H.btn('Register', 'registerBtn', 'special wide big',"",'submit')}
		</form>
	`);
	
	$('#form').submit(function(e) {
		e.preventDefault();
		const fields = $('#form').loadFields();
		G.loading(true);
		G.dbPost({
			reqType : 'add',
			url   : 'user',
			data  : fields
		}, function(data) {
			if (data.isError()) {
				G.msg('response', data.getError(), !data.isError());
				G.loading(false);
			} else {
				
				// Pseudo log in
				
				$.ajax
				({
					url   :   "session",
					type  :   "POST",
					data  : {
						entry      :  fields.username,
						password   :  fields.password,
					},
					success: function() {
						content.html(`${H.msg('response')}`);
						G.msg(`response`, `You have successfully registered, ${fields.username}!<br/>Select your avatar now if you wish, but you can change it at any time.`, 'success');
						Avatar.renderUpload('#registerPageContent', data);
						G.loading(false);
					}
				});
			}	
		});
	});
});

const Page = {
	
	redirect : function() {
		G.goHome();
	},
};