//////////////////////////////////////////////////////////////////////////////////////////////
// The capital H stands for [H]tml and it contains all the functions that I thought         //
// would be useful for HTML generation and/or fetching data from HTML.                      //
// This allows me to have a clearer picture of the object hierarchy.	       			    //
//////////////////////////////////////////////////////////////////////////////////////////////

H = {
	
	inputBase : function(args) {
		const cls = args.cls || "";
		const name = args.name || "name";
		const type = args.type || "text";
		const placeholder = args.placeholder !== undefined ? args.placeholder : name.capitalize();
		const maxlength = args.maxlength || null;
		const pattern = args.pattern !== undefined ? args.pattern : null;
		const error = args.error !== undefined ? args.error : null;
		
		return `
			<input
				class="${cls} flex1"
				name="${name}"
				type="${type}"
				placeholder="${placeholder}"
				maxlength="${maxlength}"
				pattern = "${pattern ? pattern : ''}"
				${error ? "oninvalid=setCustomValidity('${error}');" : ""}
				${error ? "oninput=setCustomValidity('');" : ""}
			/>`;
	},
	
	selectBase : function(args) {
		const cls = args.cls || "";
		const name = args.name || "name";
		const selected = args.selected || "0";
		var options = args.options || [];
		var option;
		var sel = "";
		
		for (var i=0; i<options.length; i++) {
			option = options[i];
			sel = (selected === i) ? "selected" : "";
			
			if (!$.isArray(option)) {
				option = [
					option,
					option.capitalize(),
				];
			}
			options[i] = `<option ${sel} value="${option[0]}">${option[1]}</option>`;
		}
		
		return `<select name="${name}" class="${cls}">
				    ${options.join("")}
				</select>`;
	},
		
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
				${args.tabs ? H.tabs(args.tabs) : ""}
				<div class="${hiddenContent ? "hidden" : ""} pagecontent" id="${name}PageContent"></div>
			</div>`;
	},
	
	tabs : function(ary) {
		var allTabs = [];
		for (var i = 0; i < ary.length; i++) {
			allTabs.push(`<button class="tab small btn">${ary[i]}</button>`);
		}
		allTabs = allTabs.join("");
		
		return `<div class="tabs">
					${allTabs}
				</div>`;
	},
		
	pageHideBtn : function() {
		return `<button name="pageHideBtn" class="">_</button>`;
	},
	
	pageExitBtn : function() {
		return `<button name="pageExitBtn" class="small right">&times</button>`;
	},
	
	filterBtn : function() {
		return `<button name="filterBtn" class="small right">&times</button>`;
	},
		
	btn : function(label, name, cls="", val=null, type='button') {
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
		return `<div class="stdSpacer"></div>`;
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
			var currentUser = User.getCurrentUser();
			for (var i=0; i<options.length; i++) {
				if (!options[i].startsWith('!') || currentUser.data.role >= User.roles.admin) {
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
		return s.join("");
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
			const modal = $(this).closest(".modal").data('modalObject');
			if (modal) modal.destroy();
			$(this).closest(".page").remove();
		});	
		
		$(document).on('click', "[name=filterBtn]", function(event) {
			event.preventDefault();
			const modal = $(this).closest(".page").find('[id$="searchFilter]').show(false);
		});	
	});

}) ();