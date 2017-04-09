
$(document).ready(function() {
	
	$('#pages').append(H.page({
		name: 'login',
		title: 'Login',
	}));
	
	const content = $('#loginPageContent');
	
	
	content.html(`
		<form id="form">
			${User.renderLogin()}
			${H.msg('response')}
			${H.btn('Login', 'loginBtn', 'special wide big',"",'submit')}
		</form>
	`);
	
	const form = $('#form');
	const entry = $('[name="entry"]');
	const password = $('[name="password"]');
	var params = G.getParams();
	
	if (params.username) {
		entry.val(params.username);
		password.focus();
	}
	else {
		entry.focus();
	}
	
	form.submit(function(event) {
		event.stopPropagation();
		event.preventDefault();
		
		$.ajax
		({
			url   :   "session",
			type  :   "POST",
			data  : {
				entry      :  entry.val(),
				password   :  password.val(),
			},
			success: function(data) {
				if (data.isError()) {
					G.msg("response", data.getError(), "error");
				} else {
					G.goHome();
					G.msg("response", "");
				}
			},
		});
	});
});