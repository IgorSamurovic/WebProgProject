(function() {
	String.prototype.oldJoin = String.prototype.join;
	
	String.prototype.join = function (byWhat="") {
		return String.prototype.oldJoin(byWhat);
	}
	
	Array.prototype.flatten = function () {
	    var ret = [];
	    for(var i = 0; i < this.length; i++) {
	        if(Array.isArray(this[i])) {
	            ret = ret.concat(this[i].flatten());
	        } else {
	            ret.push(this[i]);
	        }
	    }
	    return ret;
	};
	
	Array.prototype.supplant = function(o) {
		return this.flatten().join("").supplant(o);
	};
	
	// Shortens a string, adding "..." at the end if it needs to be shortened

	String.prototype.shorten = function (maxLength) {
		if (!maxLength || this.length + 3 <= maxLength)
			return this.valueOf();
		else
			return this.substring(0, maxLength) + "...";
	}
	
    String.prototype.supplant = function (o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
            	var r;
            	if (typeof o[b] === 'function') {
            		r = o[b]();
            	} else {
            		r =  o[b];
            	}
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    }

}) ();