//////////////////////////////////////////////////////////////////////////////////////////////
// The capital H stands for [H]tml and it contains all the functions that I thought         //
// would be useful for HTML generation.                                                     //
// This allows me to have a clearer picture of the object hierarchy.	       			    //
//////////////////////////////////////////////////////////////////////////////////////////////

H = {
		
	smallBtnDo : function(label, name, doVal, style="") {
	    return '<button name="{name}" data-do="{doVal}" class="small btn{style} flex1">{label}</button>'.supplant(
	    	{name:name, doVal:doVal, label:label, style:style});
	},
	
	// DL element
	dle : function(str) {
		return ['<dt>', str, '</dt><dd>{', str, '}</dd></br>'].join("");
	},
	
	dl : function(fields) {
		var s = ['<dl class="userinfo">'];
		
		for (var i=0; i < fields.length; i++) {
			s.push(this.dle(fields[i]));
		}
		
		s.push('</dl>');
		return s;
	},
		
		
		
};

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