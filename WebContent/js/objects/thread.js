const Thread = Object.assign(Object.create(DataObj), {
	
	_table : 'thread',
	
	getTitle : function() {
		return this.renderTitle();
	},
	
	// Locks a forum, then calls the callback function
	stick: function(doStick, callback) {
		$.ajax({
			method :   "POST",
			url    :   "thread",
			data   : {
				reqType : "stick",
				id      :  this.data.id,
				sticky  :  doStick
			},
			success: callback
		});
	},
	
	// Locks a forum, then calls the callback function
	lock: function(doLock, callback) {
		$.ajax({
			method :   "POST",
			url    :   "thread",
			data   : {
				reqType : "lock",
				id      :  this.data.id,
				locked  :  doLock
			},
			success: callback
		});
	},
			
});

$(document).ready(function() {
	
	$(document).on('click', '[name="selectThread"]', function(btn) {
		Thread.openSelectModal(this);
	});
	
	$(document).on('click', '[name="threadStickBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).stick($(that).data("val"), function() {
					Search.reloadAll();
				});
			}
		});
	});
	
	$(document).on('click', '[name="threadLockBtn"]', function(button) {
		var that = this;
		Modals.confirmation({
			yesFunc : function() {  
				Search.getObject(that).lock($(that).data("val"), function() {
					Search.reloadAll();
				});
			}
		});
	});

});

