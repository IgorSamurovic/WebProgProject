//////////////////////////////////////////////////////////////////////////////////////////////
// The capital G stands for [G]eneric and it contains all the functions that I thought      //
// would be useful in a general sense, so I added them here instead of adding them on the   //
// global level or to other, more specific objects.                                         //
// This allows me to have a clearer picture of the object hierarchy.            	        //
//////////////////////////////////////////////////////////////////////////////////////////////

var G = {

	// Goes to the location
	href : function(href) {
		window.location.href(url);
	},
	
	// Redirects to the location
	redirect : function(url) {
		window.location.replace(url);
	},
	
	
	_loadedScripts : {},
	
	loadScript : function (url, callback) {
		if (this._loadedScripts[url]) {
			callback();
		} else {
			this._loadedScripts[url] = true;
		    $.ajax({
		        url: 'js/'+url+'.js',
		        dataType: 'script',
		        success: callback,
		        async: true
		    });
		}
	},
	
	// Creates an object with a specified prototype, and sets its data
	create : function(protoObject, objData) {
		var obj = Object.create(protoObject);
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
	
	createMany : function(protoObject, aryData, doCopy) {
		var retVal;
		if (Array.isArray(aryData)) {
			retVal = [];
			for (i=0; i<aryData.length; i++) {
				retVal.push(this.create(protoObject, aryData[i], doCopy));
			}
		} else {
			retVal = create(protoObject, aryData, doCopy);
		}
		
		return retVal;
	},
	
	// Adds all properties of the data object to the target object, replacing as necessary
	addToObject : function (data, object, doReplace) {
		for (var prop in data) {
			if (object[prop] === undefined || doReplace) {
				object[prop] = data[prop];
			}
		}
	},
	
	// Converts a collection of raw data objects to a proper JSON object with methods and other functionalities
	// Mutates an array, does not return a new one!
	convertRawObjects : function (ary, protoObject) {
		for (i=0; i<ary.length; i++) {
			ary[i] = G.create(protoObject, ary[i]);
		}
	},
	
	// Gets a specified object by id
	dbGetById : function(url, id, callback) {
		$.ajax ({
			url     :   url,
			method  :   "get",
			data    :   {id:id},
			success : function(data) {
				callback(JSON.parse(data));
			}
		});
	},
	
	_paramProtected : {},
	
	// Makes it so that the parameter can only be directly changed, not through deletion
	protectParam : function(prop) {
		this._paramProtected[prop] = true;
	},
	
	restrictParams : function(allowed) {
		var prop;
		if (allowed === undefined || allowed === null) {
			allowed = [];
		}
		for (prop in this._params) {
			if (!this._paramProtected[prop] && $.inArray(prop, allowed) <= -1) {
				delete this._params[prop];
			}
		}
		this.replaceState();
	},
	
	// Deletes all unprotected parameters
	deleteParams : function() {
		if (_params) {
			var prop;
			for (prop in _params) {
				if (!_paramProtected[prop]) {
					delete _params[prop];
				}
			}
		}
	},
	
	// Reloads parameters from the URL, into the _params object
	reloadParams : function() {
		var newParams = $.deparam(window.location.href.split("?")[1]);
		var prop;
		
		for (prop in this._params) {
			delete this._params[prop];
		}
		
		for (prop in newParams) {
			this._params[prop] = newParams[prop];
		}
	},
	
	// Gets the _params object, if it is not created yet, creates it by loading data from the URL
	getParams : function(reset = false) {
		var paramString = window.location.href.split("?")[1];
		
		if (!this._params) {
			if (paramString !== null && paramString !== undefined) {
				this._params = $.deparam(paramString); 
			} else {
				this._params = {};
			}
		} 

		return this._params;
	},
	
	// Deletes all parameters except the protected ones, then sets new values from the given object
	setParams : function(params) {
		this.deleteParams();
		if (params) {
			var prop;
			for (prop in params) {
				this._params[prop] = params[prop];
			}
		} 
	},
	
	pushState : function() {
		window.history.pushState(this.getParams(), document.title, window.location.href.split("?")[0] +"?" + $.param(this._params));
	},
	
	replaceState : function() {
		window.history.replaceState("", document.title, window.location.href.split("?")[0] +"?" + $.param(this._params));
	},
	
	// Posts a json object
	dbPost : function(args, callback) {
		args.method = "post";
		args.success = (args.success || callback);
		$.ajax(args);
	},
	
	// Gets raw JSON objects from a table in the database
	dbGet : function(args, callback) {
		var params = {};
		
		if (typeof args.data === 'function') {
			params.data = args.data();
		} else {
			params.data = args.data;
		}
		
		params.error = args.error;
		params.url = args.url;
		params.method = "get";
		params.success = function(data) {
			data = JSON.parse(data);
			
			if (!data) {
				data = null;
				
			} else {
				
				if (Array.isArray(data)) {
					var totalRecords = data[0];
					if (totalRecords) {
						data = data[1];
						data.totalRecords = totalRecords;
						data.type = "multi";
					} else {
						data.totalRecords = 0;
					}
				} else {
					data = [data];
					data.totalRecords = 1;
					data.type = "single";
				}
				
			}

			callback(data);
		};
		$.ajax(params);
	},
	
	// Forces a refresh of all images that contain a specified string in their URL
	// If no string is provided, or an empty string is provided, all images will be refreshed
	refreshImage : function(str) {
		if (!str) str = "";

		var images = document.images;
	    for (var i=0; i<images.length; i++)
	    {
	    	if (images[i].src.includes(str))
	    		images[i].src = images[i].src.replace(/\btime=[^&]*/, 'time=' + new Date().getTime());
	    }
	},
	
	getHomepage : function() {
		return "forum.jsp";
	},
	
	goHome : function() {
		window.location.href="forum.jsp";
	},
	
	// Hides objects identified by the obj string in JQuery
	hide :function(obj, doHide) {
		if (doHide) $(obj).addClass("hidden");
		else $(obj).removeClass("hidden");
	},
	
	// Shows a message in a msg field with a specific name
	_msgRegistered : false,
	
	msg : function(id, msg, type) {
		if (!G._msgRegistered) {
			$(document).on('click', '.msgCloseBtn', function(button) {
				$(this).parent().addClass("hidden");
			});
			G._msgRegistered = true;
		}
		
		var query = "[name=" + id + "].msg";
		
		if (!msg) {
			$(query).html("");
			$(query).addClass("hidden");
		} else {
			var btn = ' <button type="button" class="msgCloseBtn small right btn">&times</button>';
			msg = msg + btn;
			$(query).html(msg);
			$(query).removeClass("hidden");
			if (!type) {
				$(query).removeClass("good");
				$(query).removeClass("bad");
			} else if (type === "good" || type === "success") {
				$(query).addClass("good");
				$(query).removeClass("bad");
			} else if (type === "bad" || type === "error") {
				$(query).addClass("bad");
				$(query).removeClass("good");
			}
		}
	},
		
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Text supplanting
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	// Supplants an array of any depth, returning a string
	supplantArray : function(ary, o) {
		return G.flatten(ary).join("").supplant(o);
	},
	
	// Flattens the array of any depth, returning an array with a depth of 1
	flatten : function (ary) {
	    var ret = [];
	    for(var i = 0; i < ary.length; i++) {
	        if(Array.isArray(ary[i])) {
	            ret = ret.concat(this.flatten(ary[i]));
	        } else {
	            ret.push(ary[i]);
	        }
	    }
	    return ret;
	},
	
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Cookies
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	// Sets a cookie to a specified value
	
	cookie : {
		
		set : function(key, value) {
	        var expires = new Date();
	        expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
	        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
	    },
	    
		remove : function(key) {
	        var expires = new Date();
	        document.cookie = key + '=;expires=' + expires.toUTCString();
	    },

	    // Gets a cookie with a specified key
	    get : function(key) {
	        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
	        return keyValue ? keyValue[2] : null;
	    },
		
	},

	
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Button binding
	//////////////////////////////////////////////////////////////////////////////////////////////
    
	_tabs : null,
	
	selectTab : function(index, pushState=true) {
		if (this._tabs && $(this._tabs).data('currentTab') !== index) {
			var params = G.getParams();
			$(this._tabs).children().removeClass("selected");
			$(this._tabs).children().eq(index).addClass("selected");
			
			params.tab = Page.getTabString(index);
			if (pushState)
				G.pushState();
			else
				G.replaceState();
			Page.render();
		}
	},
	
    // Connects a tab button container to pages
    tabHandler : function(initial=0) {
    	var that = this;
    	this._tabs = $(".tabs");
		$(this._tabs).on('click', '.tab', function(button) {
			that.selectTab($(this).index());
		});

		this.selectTab(initial, false);
	},
	
	popStateHandler : function() {
		var that = this;
		$(window).bind('popstate', function() {
			var params = that.getParams();
			that.reloadParams();
			that.selectTab(Page.getTabId(params.tab), false);
			Page.render();
		});	
	}
    
};

//////////////////////////////////////////////////////////////////////////////////////////////
// Additional functionalities for base object types in Javascript
//////////////////////////////////////////////////////////////////////////////////////////////

(function() {

	Array.prototype.supplant = function(o) {
		return this.flatten().join("").supplant(o);
	};
	
	// Shortens a string, adding "..." at the end if it needs to be shortened
	if (!String.prototype.shorten) {
		String.prototype.shorten = function (maxLength) {
			if (!maxLength || this.length + 3 <= maxLength)
				return this.valueOf();
			else
				return this.substring(0, maxLength) + "...";
		};
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
	
	if (!String.prototype.supplant) {
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
	    };
	}

}) ();