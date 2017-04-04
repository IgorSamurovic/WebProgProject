// Extends jQuery functionality a bit

(function($) {
	
	// Hides objects identified by the obj string in JQuery
	$.fn.show = function(doShow=true) {
		if (doShow) {
			this.removeClass("hidden");
		} else {
			this.addClass("hidden");
		}
		return this;
	};
	
	$.fn.isShown = function() {
		return !this.hasClass('hidden');
	};
	
	$.fn.showToggle = function() {
		if (this.isShown()) {
			this.show(false);
		} else {
			this.show(true);
		}
	};
	
	// Maps all form fields into properties of their name
	$.fn.loadFields = function() {
		const data = {};
		var name;
		this.find('input, select, textarea').each(function () {
			name = $(this).attr(`name`);
			if (!name.startsWith('!')) {
				data[name] = $(this).val();
			}
		});
		return data;
	};
	
	// Sets all form fields by passing an object that contains
	// values mapped by their name
	$.fn.setFields = function(data) {
		this.find('input, select, textarea').each(function () {
			$(this).val(data[$(this).attr(`name`)]);
		});
		return data;
	};
	
	
	
}) (jQuery);