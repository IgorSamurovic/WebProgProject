//////////////////////////////////////////////////////////////////////////////////////////////
// The capital H stands for [H]tml and it contains all the functions that I thought         //
// would be useful for HTML generation.                                                     //
// This allows me to have a clearer picture of the object hierarchy.	       			    //
//////////////////////////////////////////////////////////////////////////////////////////////

(function() {

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

}) ();