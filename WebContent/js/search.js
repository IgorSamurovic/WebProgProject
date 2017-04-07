/* Aside from properties displayed here, a Search object should also have the following:
	
	.data               Array of objects that can be displayed
	{
		totalRecords    Number of records to be displayed
	}
	
	.settings           Object that contains settings
	{
		parent          HTML element where the results will be printed out
		prefix          Prefix used to discern from other SearchResults
		dataFunc        Function used to fetch all the data necessary before showing results
		dataArgs        Arguments for the above function
	}

*/

// Example layout for a Search object in HTML:

/*
 * Parent
 * 	 Container
 *   Search Container
 *     Fields
 *     Search Button
 *   Result Container
 *     Buttons Pages
 *       Button1 Page
 *       Button2 Page
 *     Results
 *       Result1
 *         Buttons
 *           Button1
 *           Button2
 *       Result2
 *     Buttons
 *     
 */ 

Search = {
	
	register : function(obj, prefix) {
		if (this._searchObjects === undefined) {
			this._searchObjects = {};
		}
		this._searchObjects[prefix] = obj;
	},
		
	byPrefix : function(prefix) {
		if (this._searchObjects === undefined) {
			this._searchObjects = {};
		}
		return this._searchObjects[prefix];
	},
		
	reloadAll : function() {
		$(document).find('[id$="SearchContainer"]').each(function() {
			$(this).data('searchObject').loadResults();
		});
	},
		
	getParams() {
		if (this.settings.useParams) {
			return G.getParams();
		} else {
			return this.settings._params;
		}
	},
		
	getNumPages : function() {
		var params = this.getParams(),
			numPages = Math.floor(this.data.totalRecords/params.perPage);
		if (this.data.totalRecords % params.perPage > 0)
			numPages += 1;
		return numPages || 0;
	},

	getPerPageSelector : function() {
		var perPage = this.getParams().perPage;

		if (this.getParams().id === undefined) {
			return H.input.perPage('flex1', "resultPerPage", perPage);
		}
	},
	
	getButton : function(pageId, btnType) {
		const cls = this.getParams().page === pageId ? 'selected' : "";
		return H.btn(pageId, 'changePageBtn', `${cls} ${btnType}`, pageId);
	},
	
	getAddButton : function() {
		return this.settings.add ? H.btn(this.settings.add.label, 'addObjectToggle', 'special flex1') : "";
	},
	
	getButtons : function(totalRecords) {
		var params = this.getParams();
		
		if (this.settings.isSingle) return "";
		
		var numPages = this.getNumPages(),
			startPage = 1;
			endPage = numPages;
			
		if (params.page !== null) {
			// The number of additional pages that can be added to right
			startPage = Math.max(1, params.page-5);
			endPage = Math.min(params.page + 5, numPages);
		}
		
		pageBtns = [];
		if (numPages > 1) {
			pageBtns.push(this.getButton(1, "special"));
			for (var i = startPage+1; i <= endPage-1; i++) {
				pageBtns.push(this.getButton(i, ""));
			}
			pageBtns.push(this.getButton(numPages, "special"));
		}
		
		return `
			<div class="rowFlex">
				${this.getPerPageSelector()}
		    	<div class="pages flex4">
		    		${pageBtns.join("")}
				</div>
		    	${this.settings.add && !this.settings.add.condition || (
		    		this.settings.add && this.settings.add.condition && this.settings.add.condition()) ?
		    		this.getAddButton() : ""}
		    </div>`;
		
	},
	
	drawAdd : function() {
		if (!$(this.selAddContainer()).html()) {
			$(this.selAddContainer()).html(`
				<div class="itemContainer">
					<div class="subpagetitle">
						${this.settings.add.title}
					</div>
					<form id="${this.settings.prefix}AddObjectForm">
						${G.interpret(this.settings.add.html)}
						${H.btn(this.settings.add.title, "addObject", cls="big special", null, type='submit')}
					</form>
				</div>
			`);
		}
	},
	
	selParent : function() {
		return `${this.settings.parent}`;
	},
	
	selFilterContainer : function() {
		return `#${this.settings.prefix}SearchFilterContainer`;
	},
	
	selResultsContainer : function() {
		return `#${this.settings.prefix}SearchResultsContainer`;
	},
	
	selAddContainer : function() {
		return `#${this.settings.prefix}SearchAddContainer`;
	},
	
	selContainer : function() {
		return `#${this.settings.prefix}SearchContainer`;
	},
	
	selResults : function() {
		return `#${this.settings.prefix}SearchResults`;
	},
	
	selHeader : function() {
		return `#${this.settings.prefix}PageHeader`;
	},
	
	selTitle : function() {
		return `#${this.settings.prefix}PageTitle`;
	},
	
	getObject : function(sel) {
		return $(sel).closest('div[name="result"]').data('obj');
	},
	
	getOnlyObject : function() {
		return $(this.selResults()).find('div[name="result"]').data('obj');
	},
	
	getSearch : function(sel) {
		return $(sel).closest('[id$="SearchContainer"]').data('searchObject');
	},
	
	DEFAULT_PERPAGE : 10,
	MAX_PERPAGE : 50,
	
	renderResults : function(data) {
		
		var params = this.getParams();
		var useParams = this.settings.useParams;
		
		var html;
		
		// Set the raw data here
		this.data = data;
		
		// Render fitting HTML
		if (data !== null && data !== undefined) {
			
			var needPush = false;
			
			if (data.totalRecords > 1) {
				// Fix perPage property if needed
				if (!$.isNumeric(params.perPage)) {
					params.perPage = this.DEFAULT_PERPAGE;
					needPush = true;
				} else if (params.perPage <= 0) {
					params.perPage = this.DEFAULT_PERPAGE;
					needPush = true;
				} else if (params.perPage > this.MAX_PERPAGE) {
					params.perPage = this.MAX_PERPAGE;
					needPush = true;
				} else if ($.inArray(params.perPage, H.input._perPageValues) <= -1) {
					params.perPage = this.DEFAULT_PERPAGE;
					needPush = true;
				}
				
				// Fix page number if needed
				var numPages = this.getNumPages();
				if ($.isNumeric(params.page)) {
					if (params.page > numPages) {
						params.page = numPages;
						needPush = true;
					} else if (params.page <= 0) {
						params.page = 1;
						needPush = true;
					}
				} else {
					params.page = 1;
					needPush = true;
				}
				
				if (needPush) {
					G.replaceState(useParams);
				}
			}
			
			// Create an outline for search results
			var pageBtns = this.getButtons();
			
			var flex = "";
			
			if (this.settings.flexType === "row") {
				flex = 'rowFlex';
			} else if (this.settings.flexType === "col") {
				flex = 'columnFlex';
			}
			
			$(this.selResultsContainer()).html(`
		    	<div class="searchresults ${flex}" id="${this.settings.prefix}SearchResults" name="results"></div>
		    	${pageBtns}
			`);
			
			
			// Create actual results to fill out the list
			
			// Now process all objects and render all elements 
			if (data.totalRecords === 0) {
				$(this.selResults()).html(`<div class="boldText">The search has returned no results.</div>`);
			} else if (data.totalRecords) {
			
				for (var i=0; i<data.length; i++) {
					
					// Convert every raw JSON object to a proper G object with methods
					data[i] = this.settings.objType.create(data[i]);
					data[i]["xtra"].resultIndex = i;
					
					// Add the generated HTML to the results
					$(this.selResults()).append(`
						<div class="itemContainer" id="${this.settings.prefix}SearchResult${i}" name="result">
					    	${this.settings.renderFunc(data[i])}
					    </div>
					`);
					
					// Attach the last processed object to the last added HTML element
					$(this.selResults()).children().last().data("obj", data[i]);
				}
			}
			
			// In case this initialized with an object, lets destroy it
			if (this.settings.updateFunc) {
				this.settings.updateFunc();
			}
			this.settings.data = null;
		}
	},
	
	loadResults : function() {
		// Executes a dataFunc function with dataArgs, calling renderResults once the data is collected
		// Remove needless parameters
		if (this.settings.data) {
			this.renderResults(this.settings.data);
			return;
		}
		
		if (this.settings.useParams) {
			G.restrictParams(this.settings.allowed);
		} else {
			this.settings.dataArgs.xData = this.getParams();
		}
		this.settings.dataFunc(this.settings.dataArgs, this.renderResults.bind(this));

	},
	
	// Creates a search result environment
	create : function(settings) {
		
		// Instantiate
		var obj = Object.create(this);
		obj.settings = settings;
		
		this.register(obj, settings.prefix);
		
		// If we are not using params, we're making sure to create a container for them
		if (!obj.settings.useParams) {
			obj.settings._params = {};
			obj.settings.useParams = false;
		} else {
			obj.settings.useParams = true;
			settings.allowed = (settings.allowed !== undefined) ? settings.allowed : [];
		}
		
		if (settings.dataArgs)
			settings.dataArgs.data = (settings.dataArgs.data !== undefined) ? settings.dataArgs.data : obj.getParams(); 

		if (settings.updateFunc) {
			settings.updateFunc = settings.updateFunc.bind(obj);
		}
		
		// Fixing all the properties
		
		settings.dataFunc = (settings.dataFunc !== undefined) ? settings.dataFunc : G.dbGet;
		
		
		const filter = typeof settings.filter === 'function' ? settings.filter() : settings.filter;
		
		const searchFilter = settings.filter !== undefined ? `
			<div id="${settings.prefix}SearchFilterContainer" class="hidden itemContainer">
				<div class="subpagetitle">Filter...</div>
				<form class="rowFlex wide" id="${settings.prefix}SearchFilterForm">
					${filter ? filter : ""}
						<div class="columnFlex flex2">
							${filter ? settings.objType.selectOrderBy() : ""}
						</div>
						<div class="columnFlex ">
							${filter ? H.btn("Reset", "searchReset", cls="", null, type='reset') : ""}
							${filter ? H.btn("Filter", "searchFilter", cls="special", null, type='submit') : ""}
						</div>
				</form>
			</div>` : "";
				
		const searchResults = `<div id="${settings.prefix}SearchResultsContainer" class="searchresults"></div>`;
		const searchAdd = settings.add !== undefined ? `
			<div id="${settings.prefix}SearchAddContainer" class="hidden searchresults"></div>
			` : "";
		
		// Creating the base for search results
		var html = `
			<div id="${settings.prefix}SearchContainer" class="searchresults">
				${searchFilter}
				${searchResults}
				${searchAdd}
			</div>
		`;
		
		$(obj.selParent()).append(html);
		$(obj.selContainer()).data('searchObject', obj);
		
		return obj;
	},
	
	show : function(doShow) {
		if (doShow) {
			$(this.selContainer()).removeClass("hidden");
			this.loadResults();
		} else {
			$(this.selContainer()).html("");
			$(this.selContainer()).addClass("hidden");
		}
	},
	
	display : function() {
		this.loadResults();
	}
	
};

$(document).ready(function() {
	
	$(document).on('click', '[name=changePageBtn]', function(button) {
		var searchObject = $(this).closest('[id$="SearchContainer"]').data('searchObject');
		var params = searchObject.getParams();
		
		if (params.page != $(this).data('val')) {
			params.page = $(this).data('val');
			G.pushState(searchObject.settings.useParams);

			searchObject.loadResults();
		}		
	});
	
	$(document).on('change', '[name=resultPerPage]', function(button) {
		var searchObject = $(this).closest('[id$="SearchContainer"]').data('searchObject');
		var params = searchObject.getParams();
		
		if (params.perPage != $(this).val()) {
			params.perPage = $(this).val();
			G.pushState(searchObject.settings.useParams);

			searchObject.loadResults();
		}

	});
	
	$(document).on('click', '[name=searchFilter]', function(e) {
		e.preventDefault();
		const searchObject = Search.getSearch(this);
		const form = $(this).closest('[id$="SearchFilterForm"]');
		var params = searchObject.getParams();
		
		$.extend(params, $(form).loadFields());

		G.pushState(searchObject.settings.useParams);
		searchObject.loadResults();
	});
	
	$(document).on('click', '[name=searchReset]', function(e) {
		e.preventDefault();
		const searchObject = Search.getSearch(this);
		const form = $(this).closest('[id$="SearchFilterForm"]');
		var params = searchObject.getParams();
		
		$(form)[0].reset();
		$.extend(params, $(form).loadFields());

		G.pushState(searchObject.settings.useParams);
		searchObject.loadResults();
	});
	
	$(document).on('click', '[name=addObjectToggle]', function(e) {
		e.preventDefault();
		const searchObject = Search.getSearch(this);
		searchObject.drawAdd();
		$(searchObject.selAddContainer()).showToggle();
	});
	
	$(document).on('submit', '[id$=AddObjectForm]', function(e) {
		e.preventDefault();
		const that = this;
		const searchObject = Search.getSearch(this);
		const args = {};
		const objData = $.extend({}, $(this).loadFields(),  G.interpret(searchObject.settings.add.data));
		G.log("Adding object:");
		G.log(objData);
		searchObject.settings.objType.add(objData, function(data) {
			G.log("Created object ID:");
			G.log(data);
			$(that).setFields();
			searchObject.reloadAll();
			if (searchObject.settings.add.redirectTo) {
				window.location.href = searchObject.settings.add.redirectTo(data);
			}
		});
	});
});



	