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
	
	inputForum : function(alt, alt2) {
		alt = $.extend({
			name      : '!title',
			placeholder : "Forum",
			maxlength : '40',
			pattern   : '.{3,40}',
			error     : 'Must be at least 3 characters long.',
			val       : 'selectForum',
		}, alt);
		
		return this.inputObject(alt, alt2);
	},
	
	inputUser : function(alt, alt2) {
		const input = User.inputUsername(alt);
		const inputId = this.inputId(alt2);
		const button = H.btn('Select user', 'selectUser', cls='flex1');
		
		return `
			<div class="rowFlexAlways">
				${input}
				${inputId}
				${button}
			</div>
		`;
	},
	
	inputForum : function(alt, alt2) {
		const input = Forum.inputTitle(alt);
		const inputId = this.inputId(alt2);
		const button = H.btn('Select forum', 'selectForum', cls='flex1');
		
		return `
			<div class="rowFlexAlways">
				${input}
				${inputId}
				${button}
			</div>
		`;
	},
	
});