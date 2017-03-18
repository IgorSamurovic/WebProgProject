function getForum(id, callback)
{
	$.ajax
	({
		url   :   "forum",
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

function getForums(data, callback)
{
	$.ajax
	({
		url   :   "forum",
		type  :   "GET",
		data  :   data,
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