Avatar = {
	
	generateAvatarUpload : function(target, user=this) {
		const modal = $(target).data('modal');
		const name = `avatarUpload`;
		const form = `#${name}Form`;
		const html = `
			<form id="${name}Form" class="center">
				<div class="useravatarsetup">
					<input type="file" name="avatarSelect" accept="image/*"/>
					<div class="useravatar" name="preview">
						${user.renderAvatar()}
					</div>
					<div class="buttons">
						${H.btn('Select', 'select', 'small btn')}
						${H.btn('Remove', 'remove', 'small btn')}
						${H.btn('Reset', 'reset', 'small btn', null, 'reset')}
						${H.btn('Upload', 'upload', 'small btn', null, 'submit')}
					</div>
				</div>
				${H.msg('avatarUpload')}
			</form>`;
		
		var avatarFile = null;
		
		$(target).append(html);
		
		// Browse
		
		$(form).on('click', '[name="select"]', function(event) {
		    event.stopPropagation();
		    event.preventDefault();
			$('[name="avatarSelect"]').trigger('click');
		});
		
		// Remove
		$(form).on('click', '[name="select"]', function(event)
		{
		    event.stopPropagation();
		    event.preventDefault();
			$.ajax({
				    url: "avatar?id=" + user.data.id,
				    type: 'DELETE',
				    success: function(data)
				    {
				    	if (avatarFile === null) {
			    			$('[name="upload"]').addClass("hidden");
			    			$('[name="reset"]').addClass("hidden");
			    			avatarFile = null;
			    			$('[name="preview"]').html(user.renderAvatar());
				    	}
				    	G.refreshImage(user.data.id);
				    	showMsg("avatarUpload", "Avatar has been removed.", true);
				    	avatarUpdateRemoveVis();
				    }
				});
				
			});
			
		},
		
};