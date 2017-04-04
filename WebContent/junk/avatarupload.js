var avataruploadInitialized = false;
var avataruploadOnUpload = null;

function avataruploadInit(data)
{
	avatarUser = data.avatarUser;
	avataruploadOnUpload = data.onUpload;
	
	if (!avataruploadInitialized)
	{
		avataruploadReady();
		avataruploadInitialized = true;
	}
	avatarUpdateRemoveVis(function()
	{
		resetAvatarInput();
		if (data.callback) data.callback();
	});
}

var avatarFile = null;
var avatarUser = null;

function resetAvatarInput()
{
	$("#uploadAvatar").addClass("hidden");
	$("#resetAvatar").addClass("hidden");
	avatarFile = null;
	$('#avatarPreview').html(formatAvatar(avatarUser, showUserAvatar(avatarUser.id)));
	
}

function avatarUpdateRemoveVis(callback)
{
	userIdHasAvatar(avatarUser.id, function(data)
	{
		if (data === "true")
			$("#removeAvatar").removeClass("hidden");
		else
			$("#removeAvatar").addClass("hidden");
		if (callback) callback();
	});
}

function userIdHasAvatar(id, callback, error)
{
	$.ajax({
	    url: "avatar?has=" + id,
	    type: 'GET',
	    success: callback,
	    error: callback
	});
}

function avataruploadReady()
{
	$(document).on('change', '#inputAvatar', function(evt)
	{
		var files = evt.target.files;
        var file = files[0];
        var reader = new FileReader();

        if (!file) return;
        
        var ftype = file.type;
        var validTypes = ["image/gif", "image/jpeg", "image/png"];
        
        if ($.inArray(ftype, validTypes) > -1)
        {
        	
            img = new Image();
            
            img.onload = function() {
                showMsg("avatarUploadMsg", "Image data is valid.");
                avatarFile = file;
            	$("#uploadAvatar").removeClass("hidden");
            	$("#resetAvatar").removeClass("hidden");
            	
		        reader.onload = (function(theFile)
	   	        {
	   	        	return function(e)
	   	        	{
	   	            	$('#avatarPreview').html(formatAvatar(avatarUser, ['<img class="useravatar " src="', e.target.result,'" title="', theFile.name, '" width="120" height="120" />'].join('')));
	   	            	
	   	        	};
	   	        }) (file);
	   	           
	   	        reader.readAsDataURL(file);
            };
            
            img.onerror = function() {
            	showMsg("avatarUploadMsg", "Image data is invalid.", "error");
            	$('#inputAvatarForm')[0].reset();
            	resetAvatarInput();
            };
            
            var _URL = window.URL || window.webkitURL;
            img.src = _URL.createObjectURL(file);
        	
        }
        else
        {
         	avatarFile = null;
        	$("#uploadAvatar").addClass("hidden");	
        	$("#resetAvatar").addClass("hidden");
        	showMsg("avatarUploadMsg", "Must be a valid image file.", "error");
        	$('#avatarPreview').html(showUserAvatar(avatarUser.id));
        	return;
        }


	});
	
	$(document).on('click', '#resetAvatar', function(evt)
	{
		showMsg("avatarUploadMsg", false);
		resetAvatarInput();
	});
	

	
	$("#inputAvatar").click(function(event)
	{
		event.stopPropagation();
	});
	


	
	$("#inputAvatarForm").submit(function(event)
	{
	    event.stopPropagation();
	    event.preventDefault();

	    var formData = new FormData();
	    formData.append("a", avatarUser.id);
	    formData.append("file", avatarFile);
	    
	    var xhr = new XMLHttpRequest();
	    
	    xhr.onreadystatechange = function()
	    {
			avatarFile = null;
	    	if (xhr.responseText === "ok")
	    	{
	    		showMsg("avatarUploadMsg", "Avatar has been uploaded.", "success");
	    		$('#inputAvatarForm')[0].reset();
	    		$("#uploadAvatar").addClass("hidden");
	    		$("#resetAvatar").addClass("hidden");
	    		
	    		refreshImage(avatarUser.id);
	    		avatarUpdateRemoveVis();
	    		if (avataruploadOnUpload) avataruploadOnUpload();
	    	}
	    	else if (xhr.responseText === "not image")
	    	{
	    		showMsg("avatarUploadMsg", "You must upload a valid image file.", "error");
	    		$('#inputAvatarForm')[0].reset();
	    	}
	    }; 
	    xhr.open("POST", "/site/avatar");
	    xhr.send(formData);

	});
	
	
}