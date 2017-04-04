$.extend(DataObj, {

	renderYesNo : function(prop) {
		if (this.data[prop] === undefined) {
			return 'Undefined';
		} else if (this.data[prop] === true) {
			return 'Yes';
		} else {
			return 'No';
		}
	},
	
	renderOwner : function() {
		return '<a class="link2" href="profile.jsp?id={id}">{username}</a>'.supplant({id:this.data.owner, username:this.xtra.ownerUsername});
	},

	renderVistype: function() {
		const vistype = this.data.vistype !== undefined ? this.data.vistype : this.xtra.vistype;
		switch (vistype) {
		case (0): return "Public";
		case (1): return "Private";
		case (2): return "Closed";
		}
	},
	
	renderDate: function() {
		return this.data.date.substring(0, 16);
	},
	
	renderLocked: function() {
		return this.renderYesNo('locked');
	},
	
	renderDeleted: function() {
		return this.renderYesNo('deleted');
	},

});