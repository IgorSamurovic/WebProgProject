var edituserInitialized = false;

function edituserInit(callback)
{
	if (!edituserInitialized)
	{
		edituserReady();
		edituserInitialized = true;
	}
	callback();
}

var editUser = null;

function fillOutEditFields()
{
	$("#editEmail").val(editUser.email);
	$("#editName").val(editUser.name);
	$("#editSurname").val(editUser.surname);
	$("#editRole").val(editUser.role);
}

function loadEditWindow(userId)
{
	edituserInit(function()
	{

		console.log("editing!");
		$.ajax
		({
			url   :   "user",
			type  :   "GET",
			data  :   {id:userId},
			success: function(data)
			{
				data = JSON.parse(data);
				editUser = data;
				
				avataruploadInit({
					avatarUser: editUser,
					callback: function()
					{	
						fillOutEditFields();
						$("#editPageHeader").html("Editing profile: " + formatUsername(data));
						$("#editModal").removeClass("hidden");
					}
				});
				
	
			}
		});
	});
}
	
function edituserReady()
{
	$("#editForm").submit(function(event)
	{
		event.preventDefault();
		showMsg(false);
		$.ajax
		({
			url   :   "user",
			type  :   "POST",
			data  :
			{
				reqType     :  "update",
				id          :  editUser.id,
				email       :  $("#editEmail").val(),
				name        :  $("#editName").val(),
				surname     :  $("#editSurname").val(),
				role        :  $("#editRole").val(),
			},
			success: function(data)
			{
				if (data === "email")
				{
					showMsg("editUserMsg", "Entered Email is already in use by another user.", "error");
				}
				else
				{
					showMsg("editUserMsg", false);
					showMsg("avatarUploadMsg", false);
					$("#editModal").addClass("hidden");
					$("#editRole").addClass("hidden");
					var editHeader = $("#editPageHeader");
					loadResults($(editHeader).data("params"), $(editHeader).data("settings"));
				}
			}
		});
	
	});
	
	$(document).on('click', '#editCancelBtn', function(button)
	{
		showMsg("editUserMsg", false);
		showMsg("avatarUploadMsg", false);
		$("#editModal").addClass("hidden");
		$("#editRole").addClass("hidden");
	});
	
	$(document).on('click', '#editResetBtn', function(button)
	{
		fillOutEditFields();
	});
}

