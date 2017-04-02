//////////////////////////////////////////////////////////////////////////////////////////////
// The capital G stands for [G]eneric and it contains all the functions that I thought      //
// would be useful in a general sense, so I added them here instead of adding them on the   //
// global level or to other, more specific objects.                                         //
// This allows me to have a clearer picture of the object hierarchy.            	        //
//////////////////////////////////////////////////////////////////////////////////////////////

var G = {

	clone : function(obj) {
		return $.extend(true, {}, obj);
	}, 
		
	addPage : function(page) {
		$('#pages').append(page);
	},
	
	removePage : function(pageName) {
		$('#pages').children(`#${page}Page`).remove();
	},
		
	// Shows a 'loading' gif in the middle of the screen
	loading : function(isLoading) {
		if (this._loadingInitialized === undefined) {
			$('body').append(`
					<div id="asyncLoadingImage" class="modalImage">
						<img height="200" width="200" src="res/img/loading.gif"/>
					</div>
				`);	
			this._loadingInitialized = true;	
		}
		
		if (this._loading === undefined) this._loading = 0;
		if (isLoading)
			this._loading += 1;
		else
			this._loading -= 1;
		
		$(`#asyncLoadingImage`).show(this._loading > 0);

	},
	
	// Checks an id value against null, undefined and greater than 0
	isProperId : function(val) {
		val = parseInt(val, 10);
		return (val !== undefined && val !== null && typeof val === 'number' && val > 0);
	},
	
	input : {
		// Maps all form fields into properties of their name
		loadFields : function(selector) {
			const data = {};
			$(selector).children('input, select').each(function () {
				data[$(this).attr(`name`)] = $(this).val();
			});
			return data;
		},
		
		// Sets all form fields by passing an object that contains
		// values mapped by their name
		setFields : function(selector, data) {
			$(selector).children('input, select').each(function () {
				$(this).val(data[$(this).attr(`name`)]);
			});
			return data;
		},	
	},
	
	// Goes to the location
	href : function(url) {
		window.location.href = url;
	},
	
	// Redirects to the location
	redirect : function(url) {
		window.location.replace(url);
	},
	
	// Dynamically loads a javascript file, then calls a callback function
	loadScript : function (url, callback) {
		if (!this._loadedScripts) this._loadedScripts = {};
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
	
	// Creates an object with a specified prototype, and sets its data property
	// to the passed object (objData)
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
	
	// Same as above, just works with an array as well as with a single object
	createMany : function(protoObject, aryData) {
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
		return object;
	},
	
	// Makes it so that the parameter can only be directly changed, not through deletion
	protectParam : function(prop, doProtect=true) {
		if (this._paramProtected === undefined) this._paramProtected = {};
		this._paramProtected[prop] = doProtect;
	},
	
	restrictParams : function(allowed=[]) {
		var prop;
		
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
	
	pushState : function(really=true) {
		if (really) window.history.pushState(this.getParams(), document.title, window.location.href.split("?")[0] +"?" + $.param(this._params));
	},
	
	replaceState : function(really=true) {
		if (really) window.history.replaceState("", document.title, window.location.href.split("?")[0] +"?" + $.param(this._params));
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

		G.loading(true);
		
		if (typeof args.data === 'function') {
			params.data = args.data();
		} else {
			params.data = args.data;
		}
		
		$.extend(params.data, args.xData);
		
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
					data.length = 1;
				}
				
			}
			
			G.loading(false);
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
		this.href("forum.jsp?id=1");
	},

	// Shows a message in a msg field with a specific name
	_msgRegistered : false,
	
	msg : function(name, msg, type) {
		if (!G._msgRegistered) {
			$(document).on('click', '.msgCloseBtn', function(button) {
				$(this).parent().addClass("hidden");
			});
			G._msgRegistered = true;
		}
		
		var query = `[name="${name}Msg"].msg`;
		
		if (!msg) {
			$(query).html("");
			$(query).addClass("hidden");
		} else {
			var btn = ' <button type="button" class="msgCloseBtn small right btn">&times</button>';
			msg = msg + btn;
			$(query).html(msg);
			$(query).removeClass("hidden");
			if (type === null || type === undefined) {
				$(query).removeClass("good");
				$(query).removeClass("bad");
			} else if (type === true || type === "good" || type === "success") {
				$(query).addClass("good");
				$(query).removeClass("bad");
			} else if (type === false || type === "bad" || type === "error") {
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

