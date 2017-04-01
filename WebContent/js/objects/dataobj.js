DataObj = {

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
		const vistype = this.data.vistype || this.xtra.vistype
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
	
	create : function(objData) {
		var obj = Object.create(this);
		obj.xtra = {};
		if (objData) {
			obj.data = objData;
			for (var prop in obj.data) {
				if (prop.startsWith("_")) {
					obj.xtra[prop.substring(1, prop.length)] = obj.data[prop];
					delete obj.data[prop];
				}
			}
		}
		
		if (obj._init) {
			obj._init();
		}
		
		return obj;
	},
		
}