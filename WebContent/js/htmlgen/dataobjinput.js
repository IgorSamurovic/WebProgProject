$.extend(DataObj, {
	
	selectAsc : function() {
		return H.selectBase({
			name : "asc",
			options : [['ASC', 'In ascending order'], ['DESC', 'In descending order']],
			selected : 1
		});	
	},
		
	selectOrderBy : function(options=this._orderByOptions) {
		return [H.selectBase({
			name : "orderBy",
			prefix: "Order by",
			options : options || []
		}), this.selectAsc()].join("");
	}, 
	
	inputId : function(alt) {
		return H.inputBase({
			required  : true,
			alt       : alt,
			cls       : 'flex05',
			name      : 'id',
			placeholder : 'Id',
			maxlength : '6',
			pattern   : '^[0-9]*$',
			error     : 'This value must be numeric.',
			val       : 'selectId',
		});
	},
	
	inputDate : function(alt) {
		return H.inputBase ({
			alt       : alt,
			cls       : '',
			type      : 'datetime-local',
			name      : name || 'date',
		});
	},
	
	inputUser : function(alt, alt2, btnLabel="user") {
		const input = User.inputUsername(alt);
		const inputId = this.inputId(alt2);
		const button = H.btn(`Select ${btnLabel}`, 'selectUser', cls='flex1');
		
		return `
			<div class="rowFlexAlways">
				${input}
				${inputId}
				${button}
			</div>
		`;
	},
	
	inputForum : function(alt, alt2, btnLabel="forum" ) {
		const input = Forum.inputTitle(alt);
		const inputId = this.inputId(alt2);
		const button = H.btn(`Select ${btnLabel}`, 'selectForum', cls='flex1');
		
		return `
			<div class="rowFlexAlways">
				${input}
				${inputId}
				${button}
			</div>
		`;
	},
	
	inputParent : function(alt, alt2) {
		alt = $.extend({
			name    : '!parentTitle',
			placeholder : 'Parent',
		}, alt);
		
		alt2 = $.extend({
			name    : 'parent',
			placeholder : 'Id',
		}, alt2);
		
		return this.inputForum(alt, alt2, 'parent');
	},
	
	inputOwner : function(alt, alt2) {
		alt = $.extend({
			name    : '!ownerUsername',
			placeholder : 'Owner',
		}, alt);
		
		alt2 = $.extend({
			name    : 'owner',
			placeholder : 'Id',
		}, alt2);
		
		return this.inputUser(alt, alt2, 'owner');
	},
	
	selectDescendants : function(alt) {
		return H.selectBase({
			alt  : alt,
			name : "showDescendants",
			options : [
				[false, "Children"],
				[true, "Descendants"]
			],
		});
	}, 
	
});