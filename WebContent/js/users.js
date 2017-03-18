function populateUserList(data, params, settings)
	{
		var num = Math.min(params.perPage, data[1].length);
		
		$("#"+settings.prefix+"SearchResults").html("");

		for (i = 0; i < num; i++)
		{
			var data2 = {
					user    : data[1][i],
					index   : i,
					current : current
						}
			
			processProfile(data2, params, settings);
		}
	}
	
	function fetchUsers(args, callback)
	{
		dbGet("user", args.params, function(data)
		{
			callback(args.params, data, args.settings);
		});
	}


function shorten(str, short)
{
	if (!str) return "";
	if (!short || str.length + 3 <= short)
		return str;
	else
		return str.substring(0, short) + "...";
}

function showUserAvatar(id, height, width)
{
	if (!height) height = 120;
	if (!width) width = 120;
	return '<img src="avatar?id=' + id + '&time=' + new Date().getTime() + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
	//return '<img src="avatar?id=' + id + '&time=' + 0 + '" class="useravatar" height="' +height+  '" width="' +width+ '"/>';
}

function formatUsername(u)
{
	return '<a class="link2" href="profile.jsp?id=' + u.id + '">' + u.username + '</a>';
}

function formatAvatar(u, img)
{
	return '<a href="profile.jsp?id=' + u.id + '">' + img + '</a>';
}

function formatEmail(u, short)
{
	return '<a href="mailto:' + u.email + '">' + shorten(u.email, short) + '</a>';
}

function formatName(u, short)
{
	retval = "";
	if (u.name !== null) retval += u.name + " ";
	if (u.surname !== null) retval += u.surname;
	return retval.length <= 0 ? "Not specified" : shorten(retval, short);
}

function formatDate(u)
{
	return u.date.substring(0, 16);
}

function formatRole(u)
{
	switch (u.role)
	{
	case (0): return "Guest";
	case (1): return "User";
	case (2): return "Moderator";
	case (3): return "Administrator";	
	}
}

function formatBanned(u)
{
	return (u.banned === true || u.banned === 1) ? "Yes" : "No";
}

function formatDeleted(u)
{
	return (u.deleted === true || u.deleted === 1) ? "Yes" : "No";
}

function formatForum(f)
{
	return '<a class="link2" href="forum.jsp?id=' + f.id + '">' + f.title + '</a>';
}

function formatForums(forums)
{
	if (forums.length <= 0)
		return "None";
	else
		str = "";
	
	for (i = 0; i < forums.length; i++)
	{
		str += formatForum(forums[i]);
		if (i != forums.length-1)
		str += ", ";
	}
	return str;
}

function formatOwned(u, current, callback) 
{
	getForums(
	{
		owner    :   u.id,
		vistype  :   current.role,
	}, function(data)
	{
		for (i = 0; i < data.length; i++)
		{
			data[i] = formatForum(f);
		}
		callback(data.join(","));
	});
}

function banUser(id, doBan, callback)
{
	$.ajax
	({
		url   :   "user",
		type  :   "POST",
		data  :
		{
			reqType     : "ban",
			banned      : doBan,
			id          : id,
		},
		success: callback
	});
}

function deleteUser(id, doDelete, callback)
{
	$.ajax
	({
		url   :   "/site/user",
		type  :   "POST",
		data  :
		{
			reqType     : "delete",
			softDelete  :  true,
			id          :  id,
			doDelete    :  doDelete,
		},
		success: callback
	});
}

function getUser(id, callback)
{
	$.ajax
	({
		url   :   "user",
		type  :   "GET",
		data  :
		{
			id          :  id,
		},
		success: function(data)
		{
			data = JSON.parse(data);
			callback(data);
		},
		error: function(data)
		{
			callback(null);
		}
	});
}

var role = {
		guest: 0,
		user : 1,
		mod  : 2,
		admin: 3
	}


