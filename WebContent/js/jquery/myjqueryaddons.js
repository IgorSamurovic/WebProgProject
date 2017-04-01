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
	
	
	// Maps all form fields into properties of their name
	$.fn.loadFields = function() {
		const data = {};
		this.children('input, select').each(function () {
			data[$(this).attr(`name`)] = $(this).val();
		});
		return data;
	};
	
	// Sets all form fields by passing an object that contains
	// values mapped by their name
	setFields = function(data) {
		this.children('input, select').each(function () {
			$(this).val(data[$(this).attr(`name`)]);
		});
		return data;
	};
	
}) (jQuery);