	function getHomepage()
	{
		return "forum.jsp";
	}
	
	function goHome()
	{
		window.location.href="forum.jsp";
	}

	if (!String.prototype.supplant) {
	    String.prototype.supplant = function (o) {
	        return this.replace(
	            /\{([^{}]*)\}/g,
	            function (a, b) {
	                var r = o[b];
	                return typeof r === 'string' || typeof r === 'number' ? r : a;
	            }
	        );
	    };
	}
	
	function dbGet(table, data, callback)
	{
		$.ajax
		({
			url     :   table,
			type    :   "get",
			data    :   data,
			success :   function(data)
			{
				data = JSON.parse(data);
				data[3] = table;
				callback(data);
			}
		});
	}
	
	function createToggleBtn() {
		return '<button id="toggleResultsHidden" name="toggleBtn" class="small btn right">_</button>';
	}
	
	function isNumber(n)
	{
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	function refreshImage(id)
	{
		if (!id) id = "";

		var images = document.images;
	    for (var i=0; i<images.length; i++)
	    {
	    	if (images[i].src.includes(id))
	    		images[i].src = images[i].src.replace(/\btime=[^&]*/, 'time=' + new Date().getTime());
	    }
	}
	
	
	$(document).ready(function()
	{
		$(document).on('click', "[name=toggleBtn]", function(event)
		{
			event.preventDefault();
			var container = $(this).closest(".pageheader").siblings(".pagecontent");
			console.log($(this));
			if ($(container).hasClass("hidden"))
			{
				$(container).removeClass("hidden");
			}
			else
			{
				$(container).addClass("hidden");
			}
		});	
	});
	
	
	function hide(obj, doHide)
	{
		if (doHide) $(obj).addClass("hidden");
		else $(obj).removeClass("hidden");
	}
	
	var showMsgRegistered = false;
	function showMsg(id, msg, type)
	{
		if (!showMsgRegistered)
		{
			$(document).on('click', '.msgCloseBtn', function(button)
			{
				$(this).parent().addClass("hidden");
			});
			showMsgRegistered = true;
		}
		
		var query = "#" + id + ".msg";
		
		if (!msg)
		{
			$(query).html("");
			$(query).addClass("hidden");
		}
		else
		{
			var btn = ' <button type="button" class="msgCloseBtn small right btn">&times</button>';
			msg = msg + btn;
			$(query).html(msg);
			$(query).removeClass("hidden");
			if (!type)
			{
				$(query).removeClass("good");
				$(query).removeClass("bad");
			}
			else if (type === "good" || type === "success")
			{
				$(query).addClass("good");
				$(query).removeClass("bad");
			}
			else if (type === "bad" || type === "error")
			{
				$(query).addClass("bad");
				$(query).removeClass("good");
			}
		}
	}