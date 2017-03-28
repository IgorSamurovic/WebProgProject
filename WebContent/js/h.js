//////////////////////////////////////////////////////////////////////////////////////////////
// The capital H stands for [H]tml and it contains all the functions that I thought         //
// would be useful for HTML generation and/or fetching data from HTML.                      //
// This allows me to have a clearer picture of the object hierarchy.	       			    //
//////////////////////////////////////////////////////////////////////////////////////////////

H = {
		
	smallBtnDo : function(label, name, doVal, style="") {
	    return '<button name="{name}" data-do="{doVal}" class="small btn{style} flex1">{label}</button>'.supplant(
	    	{name:name, doVal:doVal, label:label, style:style});
	},
	
	smallBtn : function(label, name, style="") {
	    return '<button name="{name}" class="small btn{style} flex1">{label}</button>'.supplant(
	    	{name:name, label:label, style:style});
	},
	
	stdSpacer : function() {
		return '<div class="stdSpacer"></div>';
	},
	
	modal : function(cls="small") {
		return [
		    '<div class="modal">',
		    	'<div class="modalWindow">',
					'<div class="page {cls}">',
					    '<div class="pageheader" name="modalHeader"></div>',
						'<div class="pagecontent"></div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>'
		].supplant({cls:cls});
	},
	
	input : {
		
		defaultClass : 'wide',
		
		username : function(cls=defaultClass, name="username") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Username" pattern = "[a-zA-Z0-9_]{3,20}" maxlength=20/>'.supplant({cls:cls, name:name});
		},
		
		role : function(cls=defaultClass, name="role") {
			return [
			    '<select class="{cls}" name="{name}">',
			    '<option value="null">Any role</option>',
			    '<option value="1">User</option>',
			    '<option value="2">Moderator</option>',
			    '<option value="3">Administrator</option>',
			    '</select>'
			].supplant({cls:cls, name:name});
		},
		
		email : function(cls=defaultClass, name="email") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Email" maxlength=60/>'.supplant({cls:cls, name:name});
		},
		
		name : function(cls=defaultClass, name="name") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Name" maxlength=40/>'.supplant({cls:cls, name:name});
		},
		
		surname : function(cls=defaultClass, name="surname") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Surname" maxlength=40/>'.supplant({cls:cls, name:name});
		},
		
		date : function(cls=defaultClass, name="date") {
			return '<input class="{cls}" name="{name}" type="datetime-local">'.supplant({cls:cls, name:name});
		},
		
		exclusionSelect : function(cls=defaultClass, name="change", what=change, selected=true) {
			return [
				'<select class="{cls}" name="{name}"',
				'<option {s1} value="true">Include {what}</option>',
				'<option {s2} value="false">Exclude {what}</option>',
				'</select>'
			].supplant({cls:cls, name:name, what:what, s1:(selected ? "selected":""), s2:(!selected ? "selected":"")});
		},
		
		banned : function(cls, name="banned", selected=true) {
			return exclusionSelect(cls, name, "banned", selected);
		}, 
		
		deleted : function(cls, name="deleted", selected=true) {
			return exclusionSelect(cls, name, "deleted", selected);
		}, 
		
		locked : function(cls, name="locked", selected=true) {
			return exclusionSelect(cls, name, "locked", selected);
		}, 
		
		orderBy : function(cls=defaultClass, name="orderBy", options=[]) {
			var currentUser = Users.getCurrentUser();
			for (var i=0; i<options.length; i++) {
				if (!options[i].startsWith('!') || currentUser.data.role >= Users.roles.admin) {
					options[i] = '<option value="{val}">{val}</option>'.supplant({val:options[i].replace('!', '')});
				}
			}
			
			return [
			    '<select class="{cls}" name="{name}">',
			    options,
			    '</select>'
			 ].supplant({cls:cls, name:name});
		},
		
		asc : function(cls=defaultClass, name="asc") {
			return [
			    '<select class="{cls}" name="{name}">',
			    '<option value="true">Ascending</option>',
			    '<option value="false">Descending</option>',
			    '</select>'
			 ].supplant({cls:cls, name:name});

		},
		
		_perPageValues : ['1', '5', '10', '20', '50'],
		
		perPage : function(cls=defaultClass, name="perPage", vals=this._perPageValues) {
			var options = [];
			var perPage = G.getParams().perPage;
			
			for (var i=0; i < vals.length; i++) {
				options.push('<option ' , vals[i] == perPage ? 'selected' : '', ' value=',vals[i], '>',vals[i],' per page</option>');
			}
			
			return [
			    '<select class="{cls}" name="{name}">',
			    options,
			    '</select>'
			].supplant({cls:cls, name:name});
			
		},

		
	},
	
	// DL element
	dle : function(str) {
		return ['<dt>', str, '</dt><dd>{', str, '}</dd>'].join("");
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