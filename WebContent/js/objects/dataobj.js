const DataObj = {

	// Checks whether the object gets special treatment because it is a ROOT administrator or core FORUM
	isGod : function(id=this.data.id) {
		return id == 1;
	},
	
	// Creates a JSON object from literal data that was already taken from the database
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
	
	// Changes an object from the database, then calls the callback function
	add: function(data, callback) {
		
		G.dbPost({
			reqType : 'add',
			url     : this._table,
			data    : data,
			success : callback
		});
	},
	
	// Changes an object from the database, then calls the callback function
	edit: function(data=this.data, callback) {
		G.dbPost({
			reqType : 'edit',
			url     : this._table,
			id      : this.data.id,
			data    : data,
			success : callback
		});
	},
	
	// Deletes an object from the database, then calls the callback function
	del: function(doDelete, preferHard=false, callback) {
		G.dbPost({
			url  : this._table,
			data : {
				reqType : 'del',
				id      :  this.data.id,
				deleted :  doDelete,
				preferHard : preferHard
			},
			success : callback
		});
	},

	openSelectModal : function(elementTarget) {
		const modal = Modal.create(`select${this._table}`, {cls:`small`, canFilter:true});

		this.renderSelectModal(modal.content, elementTarget);
		
		$(modal.title).html(`Select ${this._table}`);
		modal.display();
	}, 
	
	openEditModal : function(obj=this, callback) {
		const formBase = 'editModalForm';
		const form = `#${formBase}`;
		
		const modal = Modal.create(`edit`, {cls:`small`});

		$(modal.content).html(`<form id="${formBase}"></form>`);
		this.renderEdit(form, obj);
		
		// Submit
		$(form).submit(function(event) {
			event.preventDefault();
			
			var data = $(form).loadFields();
			
			obj.edit(data,  function(error) {
				if (!error) {
					if (modal) {
						modal.destroy();
					}
					callback(error);
				} else {
					G.msg('editModal', error, false);
				}
			});
				
		});
		
		$(form).append(`
			${H.msg('editModal')}
			<div class="rowFlex">
				${H.btn('Reset', 'reset', 'big btn flex1')}
				${H.btn('Edit', 'edit', 'big btn2 flex3', null, 'submit')}
				${H.btn('Cancel', 'cancel', 'big btn flex1')}
			</div>
		`);
		
		// Cancel
		$(form).on('click', '[name="cancel"]', function(btn) {
			if (modal) {
				modal.destroy();
			}
		});
		
		// Reset
		$(form).on('click', '[name="reset"]', function(btn) {
			$(form).setFields(obj.data);
		});	
		
		$(modal.title).html(`Editing ${this._table} ${this.getTitle()}`);
		modal.display();
	},
}

$(document).ready(function() {
	
	$(document).on('click', '[name="editBtn"]', function(button) {
		const that = this;
		Search.getObject(this).openEditModal(undefined, function() {
			Search.reloadAll();
		});
	});
	
	$(document).on('click', '[name="deleteBtn"]', function(button) {
		const that = this;
		Modals.deleteDialog(Search.getObject(this), $(this).data("val"), function() {
			Search.getSearch(that).reloadAll();
		});
	});
});

