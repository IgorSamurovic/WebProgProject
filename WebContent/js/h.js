//////////////////////////////////////////////////////////////////////////////////////////////
// The capital H stands for [H]tml and it contains all the functions that I thought         //
// would be useful for HTML generation and/or fetching data from HTML.                      //
// This allows me to have a clearer picture of the object hierarchy.	       			    //
//////////////////////////////////////////////////////////////////////////////////////////////

H = {
	
	page : function(args) {
		const name = args.name;
		const title = "" || args.title;
		const hidden = args.hidden;
		const cls = args.cls;
		const hiddenHeader = args.hiddenHeader;
		const hiddenContent = args.hiddenContent;
		const headerButtons = [];
		if (args.canExit) headerButtons.push(H.pageExitBtn());
		if (args.canHide) headerButtons.push(H.pageHideBtn());
		
		return `
			<div class="${hidden ? "hidden" : ""} ${cls} page" id="${name}Page">
				<div class="${hiddenHeader ? "hidden" : ""} pageheader" id="${name}PageHeader">
					<div class="pagetitle" id="${name}PageTitle">${title}</div>
					${headerButtons.join("")}
				</div>
				<div class="${hiddenContent ? "hidden" : ""} pagecontent" id="${name}PageContent"></div>
			</div>`;
	},
		
	pageHideBtn : function() {
		return `<button name="pageHideBtn" class="small btn right">_</button>`;
	},
	
	pageExitBtn : function() {
		return `<button name="pageExitBtn" class="small btn right">&times</button>`;
	},
		
	btn : function(label, name, cls="small btn", val=null, type='button') {
	    return `<button
	    			name="${name}"
	    			type="${type}"
	    			${val!==null ? 'data-val="'+val+'"' : ''}
	    			class="${cls}">
	    			${label}
	    		</button>`;
	},
	
	toggleBtn : function(labels, name, cls='small btn', val=null) {
		const label = val ? labels[0] : labels[1];
		return this.btn(label, name, cls, val);
	},
	
	stdSpacer : function() {
		return '<div class="stdSpacer"></div>';
	},
	
	msg : function(name) {
		return `<div class="hidden msg" name="${name}Msg"></div>`;
	},
	
	input : {
		
		defaultClass : 'wide',
		
		username : function(cls=this.defaultClass, name="username") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Username" pattern = "[a-zA-Z0-9_]{3,20}" maxlength=20/>'.supplant({cls:cls, name:name});
		},
		
		role : function(cls=this.defaultClass, name="role", strict=true) {
			return `
			    <select class="${cls}" name="${name}">
	   ${!strict ? '<option value="null">Any role</option>' : ''}
			    	<option value="1">User</option>
			    	<option value="2">Moderator</option>
			    	<option value="3">Administrator</option>
			    </select>`;
		},
		
		email : function(cls=this.defaultClass, name="email") {
			return '<input class="{cls}" name="{name}" type="email" placeholder="Email" maxlength=60/>'.supplant({cls:cls, name:name});
		},
		
		name : function(cls=this.defaultClass, name="name") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Name" maxlength=40/>'.supplant({cls:cls, name:name});
		},
		
		surname : function(cls=this.defaultClass, name="surname") {
			return '<input class="{cls}" name="{name}" type="text" placeholder="Surname" maxlength=40/>'.supplant({cls:cls, name:name});
		},
		
		date : function(cls=this.defaultClass, name="date") {
			return '<input class="{cls}" name="{name}" type="datetime-local">'.supplant({cls:cls, name:name});
		},
		
		exclusionSelect : function(cls=this.defaultClass, name="change", what='change', selected=true) {
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
		
		orderBy : function(cls=this.defaultClass, name="orderBy", options=[]) {
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
		
		asc : function(cls=this.defaultClass, name="asc") {
			return [
			    '<select class="{cls}" name="{name}">',
			    '<option value="true">Ascending</option>',
			    '<option value="false">Descending</option>',
			    '</select>'
			 ].supplant({cls:cls, name:name});

		},
		
		_perPageValues : ['1', '5', '10', '20', '50'],
		
		perPage : function(cls=this.defaultClass, name="perPage", perPage=10, vals=this._perPageValues) {
			var options = [];
			
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
	
	dl : function(fields, cls="") {
		var s = [`<dl class="userinfo ${cls}">`];
		
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
		$(document).on('click', "[name=pageHideBtn]", function(event) {
			event.preventDefault();
			var container = $(this).closest(".pageheader").siblings(".pagecontent");
			
			if ($(container).hasClass("hidden")) {
				$(container).removeClass("hidden");
			} else {
				$(container).addClass("hidden");
			}
		});	
		
		$(document).on('click', "[name=pageExitBtn]", function(event) {
			event.preventDefault();
			const modal = $(this).closest(".modal").data('modal');
			if (modal) modal.destroy();
			$(this).closest(".page").remove();
		});	
	});

}) ();