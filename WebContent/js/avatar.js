const Avatar = {
		
		avatarOwner : null,
		
		userIdHasAvatar : function(id, callback, error) {
			$.ajax({
			    url: "avatar?has=" + id,
			    type: 'GET',
			    success: callback,
			    error: callback
			});
		},
		
		renderUpload : function(target, id) {
			
			const html = `
				<div name="container" class="center">
					<form name="inputAvatarForm" class="center">
						<div class="useravatarsetup">
							
							<div style="min-width:120; min-height:120;" name="avatarPreview">${User.renderAvatar(id)}</div>
							<div class="buttons">
								
								${H.btn("Select", "selectAvatar", "small special")}
								${H.btn("Remove", "removeAvatar", "small hidden")}
								${H.btn("Reset", "resetAvatar", "small hidden", "reset")}
								${H.btn("Upload", "uploadAvatar", "small special hidden", undefined, "submit")}
							</div>
							<input type="file" name="inputAvatar" accept="image/*"/>
						</div>
						${H.msg("avatar")}
					</form>
				</div>		
			`;
		
			$(target).append(html);
			
			const form = $('[name="inputAvatarForm"]').first();
			const inputAvatar = $(form).find('[name="inputAvatar"]');

			const preview = $(form).find('[name="avatarPreview"]');
			const selectBtn = $(form).find('[name="selectAvatar"]');
			const removeBtn = $(form).find('[name="removeAvatar"]');
			const resetBtn  = $(form).find('[name="resetAvatar"]');
			const uploadBtn = $(form).find('[name="uploadAvatar"]');
			
			Avatar.userIdHasAvatar(id, function(does) {
				console.log("DOES!!!!!!!! DONTEN");
				console.log(does);
				console.log(true);
				if (does === "true") {
					removeBtn.show();
				}
			});	
			
			var avatarFile;
			
			var fold1 = $(form).on('change', inputAvatar, function(evt) {
				var files = evt.target.files;
		        var file = files[0];
		        var reader = new FileReader();

		        G.loading(true);
		        
		        uploadBtn.hide();
		        
		        if (!file) return;
		        
		        var ftype = file.type;
		        var validTypes = ["image/gif", "image/jpeg", "image/png"];
		        
		        if ($.inArray(ftype, validTypes) > -1) {
		        	
		            img = new Image();
		            
		            img.onload = function() {
		                G.msg("avatar", "Image data is valid.", "success");
		                G.loading(false);
		                uploadBtn.show();
		                resetBtn.show();
		                selectBtn.hide();
		                avatarFile = file;
		                uploadBtn.show();
		            	console.log("HAAAAAAAAAAAAAX");
		            	console.log(uploadBtn);
				        reader.onload = (function(theFile) {
			   	        	return function(e) {
			   	            	$(preview).html(User.renderAvatar(
			   	            		id, undefined, undefined, e.target.result
			   	            	));	
			   	        	};
			   	        }) (file);
			   	           
			   	        reader.readAsDataURL(file);
		            };
		            
		            img.onerror = function() {
		            	G.msg("avatar", "Image data is invalid.", "error");
		            	G.loading(false);
		            	selectBtn.show();
		            	$(form)[0].reset();
		            };
		            
		            var _URL = window.URL || window.webkitURL;
		            img.src = _URL.createObjectURL(file);
		        	
		        }  else {
		         	avatarFile = null;
		        	$(uploadBtn).hide();	
		        	$(resetBtn).hide();
		        	G.msg("avatar", "Must be a valid image file.", "error");
		        	G.loading(false);
		        	$(preview).html(User.renderAvatar(id));
		        	return;
		        }


			});
			
			var fold2 = $(form).on('click', '[name="selectAvatar"]', function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				$(inputAvatar).click();
			});
			
			var fold2 = $(form).on('click', '[name="resetAvatar"]', function(evt) {
				G.msg("avatar", false);
				preview.html(User.renderAvatar(id));
				form[0].reset();
				selectBtn.show();
				resetBtn.hide();
				uploadBtn.hide();
			});
			
			var fold2 = $(form).on('click', '[name="removeAvatar"]', function(evt) {
				G.msg("avatar", false);
				$.ajax({
					method   : 'delete',
					url      : `avatar?id=${id}`,
					success  : function() { 
						G.msg("avatar", "Avatar successfully deleted.", "success");
						removeBtn.hide();
						preview.html(User.renderAvatar(id));
						G.refreshImage(id);
					}
				});
			});
			
			var fold3 = $(form).on('click', '[name="inputAvatar"]', function(event) {
				event.stopPropagation();
			});
			
			var fold4 = $(form).submit(function(event) {
			    event.stopPropagation();
			    event.preventDefault();
			    G.loading(true);
			    var formData = new FormData();
			    formData.append("a", id);
			    formData.append("file", avatarFile);
			    
			    var xhr = new XMLHttpRequest();
			    
			    xhr.onreadystatechange = function() {
					avatarFile = null;
			    	if (xhr.responseText === "ok") {
			    		G.loading(false);
			    		G.msg("avatar", "Avatar has been uploaded.", "success");
			    		selectBtn.show();
			    		$(form)[0].reset();
			    		removeBtn.show();
			    		uploadBtn.hide();
			    		resetBtn.hide();
			    		preview.html(User.renderAvatar(id));
			    		G.refreshImage(id);
			    	}
			    	else if (xhr.responseText === "not image") {
			    		G.loading(false);
			    		G.msg("avatar", "You must upload a valid image file.", "error");
			    		$(form)[0].reset();
			    		selectBtn.show();
			    	}
			    }; 
			    xhr.open("POST", "avatar");
			    xhr.send(formData);

			});
			
		}
	}
