function processFileCheckData(data, params, settings)
{
	if (settings.detail < 2)
	{
		return true;
	}
	else
	{
		if (data.forums === undefined)
		{
			getForums({owner:data.user.id}, function(ret)
			{
				data.forums = formatForums(ret[1]);
				processProfile(data, params, settings);
				
			});
			return false;
		}
		else
		{
			return true;
		}
	}
	return false;
}

function processProfile(data, params, settings)
{	
	if (processFileCheckData(data, params, settings) == false) return;

	var o = data.user;
	var c = data.current;
	var detail = settings.detail;
	var prefix = settings.prefix;
	var s = "";
	var i = data.index;
	
	if (!i && i != 0) i = -1;
	
	buttons = "";
	buttons +=    '<div class="buttons">';
	if (c.role >= role.admin && o.id != 1 && o.id != c.id)
	{
		if (!o.deleted) buttons += '<button id = "userDeleteBtn" data-do="true"  data-id="' + i + '" class="small btn flex1">Delete</button>';
		else            buttons += '<button id = "userDeleteBtn" data-do="false" data-id="' + i + '" class="small btn flex1">Undelete</button>';
	}
	
	if (c.role >= role.admin || c.id === o.id)
	{
		buttons += '<button id = "userEditBtn"   data-id="' + i + '" class="small btn2 flex3">Edit</button>';
	}
	
	if (c.role >= role.admin && o.id != 1 && o.id != c.id)
	{
		if (!o.banned)  buttons += '<button id = "userBanBtn" data-do="true"  data-id="' + i + '" class="small btn flex1">Ban</button>';
		else            buttons += '<button id = "userBanBtn" data-do="false" data-id="' + i + '" class="small btn flex1">Unban</button>';
	}

	buttons += " </div>";
	
	var query = "profileResult"+i;
	
	s += '<div id="'+query+'"  class="userProfile">';
	
	
	s += 	'<div class="useravatar">';
	s +=      formatAvatar(o, showUserAvatar(o.id));
	s +=    '</div>';
	s += 	'<dl class="userinfo">';
	s +=       '<dt>User</dt>';
	s +=       '<dd>' + formatUsername(o) + '</dd>';
	s +=       '<dt>Role</dt>';
	s +=       '<dd>' + formatRole(o) + '</dd>';
	s +=       '<dt>Date</dt>';
	s +=       '<dd>' + formatDate(o) + '</dd>';
	s +=       '<dt>Name</dt>';
	s +=       '<dd>' + formatName(o, 30) + ' </dd>';
	
	if (current.role >= role.admin || (i == -1 && c.id === o.id))
	{
	s +=       '<dt>Email</dt>';
	s +=       '<dd>' + formatEmail(o,30) + '</dd>';
	}
	
	if (detail >= 2)
	{
		s +=   '<dt class="spaced">Forums</dt>';
		s +=   '<dd class="spaced">' + data.forums + ' </dd>';
		s +=   '<dt>Threads</dt>';
		s +=   '<dd>' + '344' + ' </dd>';
		s +=   '<dt>Posts</dt>';
		s +=   '<dd>' + '4522' + ' </dd>';
	}
	
	if (current.role >= role.admin)
	{
		if (detail < 2)
		{
			s +=       '<dt>Banned</dt>';
			s +=       '<dd>' + formatBanned(o) + '</dd>';
		}
		else
		{
			s +=       '<dt class="spaced">Banned</dt>';
			s +=       '<dd class="spaced">' + formatBanned(o) + '</dd>';
		}
	}
	
	if (current.role >= role.admin)
	{
		s +=       '<dt>Deleted</dt>';
		s +=       '<dd>' + formatDeleted(o) + '</dd>';
	}

	s +=       '<dt></dt>';
	s +=       '<dd>' + "" + '</dd>';
	s +=    '</dl>' + buttons;
	s += '</div>';

	console.log(i);
	if (i != -1)
		$("#"+prefix+"SearchResults").append(s);
	else
		$("#"+prefix+"SearchResults").html(s);
	$("#"+query).data("user", o);
	$("#"+query).data("params", params);
	$("#"+query).data("settings", settings);
}

$(document).ready(function()
{
	$(document).on('click', '#userDeleteBtn', function(button)
	{
		var that = $(this).parent().parent();
		var user = $(that).data("user");
		var params = $(that).data("params");
		var settings = $(that).data("settings");
		deleteUser(user.id, $(this).data("do"), function()
		{
			loadResults(params, settings);
		});
	});
	
	$(document).on('click', '#userBanBtn', function(button)
	{
		var that = $(this).parent().parent();
		var user = $(that).data("user");
		var params = $(that).data("params");
		var settings = $(that).data("settings");
		banUser(user.id, $(this).data("do"), function()
		{
			loadResults(params, settings);
		});
	});
	
	$(document).on('click', '#userEditBtn', function(button)
	{
		var that = $(this).parent().parent();
		var user = $(that).data("user");
		var params = $(that).data("params");
		var settings = $(that).data("settings");
		
		var editHeader = $("#editPageHeader");
		$(editHeader).data("params", params);
		$(editHeader).data("settings", settings);
		
		loadEditWindow(user.id);
	});
});
