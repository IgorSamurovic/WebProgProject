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
	
	$.fn.hide = function(doHide=true) {
		if (!doHide) {
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

		this.find('input:not(:checkbox), input:checkbox:checked, select, textarea').each(function () {
			name = $(this).attr(`name`);

			if (!name.startsWith('!')) {
				data[name] = $(this).val();
			} else {
				data[name.substring(1, name.length)] = $(this).val();
			}
		});
		
		this.find('input:checkbox:not(:checked)').each(function () {
			name = $(this).attr(`name`);

			if (!name.startsWith('!')) {
				data[name] = false;
			}
		});
		var val;
		this.find('input[type="datetime-local"]').each(function () {
			name = $(this).attr(`name`);
			val = $(this).val() + "";
			if (val && !name.startsWith('!')) {
				data[name] = `${val.substring(0,9)} ${val.substring(11, 16)}:00`;
			}
		});
		return data;
	};
	
	// Sets all form fields by passing an object that contains
	// values mapped by their name
	$.fn.setFields = function(data={}) {
		var name;
		this.find('input, select, textarea').each(function () {
			name = $(this).attr(`name`);
			$(this).val(data[name] !== undefined ? data[name] : "");
		});
		return data;
	};
	
	
	
}) (jQuery);