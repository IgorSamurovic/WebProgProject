Forum = $.extend(Forum, {

	inputTitle : function(name) {
		return H.inputBase ({
			cls       : '',
			name      : name || 'title',
			maxlength : '40',
			pattern   : '.{3,40}',
			error     : 'Must be at least 3 characters long.'
		});
	},
	
	selectOrderBy : function(args) {
		return DataObj.selectOrderBy([
			['obj.DATE', 'Date'],
			['obj.TITLE', 'Title'],
			['obj.OWNER', 'Owner']
		]);		
	},
	
	inputOwner : function(name) {
		return H.inputBase ({
			cls       : '',
			name      : name || 'ownerUsername',
			placeholder : "Owner",
			maxlength : '20',
			pattern   : '.{3,20}',
			error     : 'Must be at least 3 characters long.'
		});
	},
	
	inputDate : function(name) {
		return H.inputBase ({
			cls       : '',
			type      : 'datetime-local',
			name      : name || 'date',
		});
	},
	
		
});