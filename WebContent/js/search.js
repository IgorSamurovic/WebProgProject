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
		return numPages;
	},

	getButton : function(pageId, btnType) {
		const cls = this.getParams().page === pageId ? 'selected' : "";
		return H.btn(pageId, 'changePageBtn', cls, pageId);
	},
	
	getButtons : function(totalRecords) {
		var params = this.getParams(),
			numPages = this.getNumPages(),
			startPage = 1,
			endPage = numPages;
		
		if (params.page !== null)
		{
			startPage = Math.max(1, params.page-10);
			endPage = Math.min(params.page+10, numPages);
		}
		
		var s = "";
		if (true) {//numPages > 1) {
			
			s = [];
			
			s.push('<div class="pages">');
			s.push(this.getPerPageSelector());
			
			for (var i = startPage; i <= endPage; i++) {
				s.push(this.getButton(i, ""));
			}

			s.push('</div>');
			
			s = s.join("");
		}

		return s;
	},
	
	getPerPageSelector : function() {
		var perPage = this.getParams().perPage;
		
		if (this.data.totalRecords <= 1) {
			return "";
		} else {
			return H.input.perPage('', "resultPerPage", perPage);
		}
	},
	
	selParent : function() {
		return "#" + this.settings.parent;
	},
	
	selFilterContainer : function() {
		return "#" + this.settings.prefix + "SearchFilterContainer";
	},
	
	selResultsContainer : function() {
		return "#" + this.settings.prefix + "SearchResultsContainer";
	},
	
	selContainer : function() {
		return "#" + this.settings.prefix + "SearchContainer";
	},
	
	selResults : function() {
		return "#" + this.settings.prefix + "SearchResults";
	},
	
	getObject : function(sel) {
		return $(sel).closest('div[name="result"]').data('obj');
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
			
			if (data.totalRecords === 0) {
				$(this.selResultsContainer()).html('<div class="boldText">The search has returned no results.</div>');
			} else if (data.totalRecords) {
				
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
				
				var result = [
			    	'<div class="searchresults" id="{prefix}SearchResults" name="results"></div>',
			    	pageBtns,
				];
				
				result = result.supplant({
					prefix: this.settings.prefix
				});
				
				$(this.selResultsContainer()).html(result);
				
				// Create actual results to fill out the list
				
				// Now process all objects and render all elements 
				for (var i=0; i<data.length; i++) {
					
					// Convert every raw JSON object to a proper G object with methods
					data[i] = G.create(this.settings.objType, data[i]);
					
					result = [
					    '<div class="searchresult" id="{prefix}SearchResult{i}" name="result">'.supplant({prefix: this.settings.prefix, i:i}),
					    this.settings.renderFunc(data[i]),
					    '</div>'
					];

					// Add the generated HTML to the results
					$(this.selResults()).append(result.join(""));
					
					// Attach the last processed object to the last added HTML element
					$(this.selResults()).children().last().data("obj", data[i]);
				}
				
				// In case this initialized with an object, lets destroy it
				this.settings.data = null;
			}
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
		
		// If we are not using params, we're making sure to create a container for them
		if (!obj.settings.useParams) {
			obj.settings._params = {};
			obj.settings.useParams = false;
		} else {
			obj.settings.useParams = true;
		}

		// Creating the base for search results
		var html = `
			<div id="${settings.prefix}SearchContainer" class="searchContainer">
				<div id="${settings.prefix}SearchFilterContainer">
					<form class="rowFlex wide" name="searchFilterForm">
						${settings.filter ?	settings.filter : ""}
						${settings.filter ? H.btn("Reset", "searchReset", cls="", null, type='reset') : ""}
						${settings.filter ? H.btn("Filter", "searchFilter", cls="", null, type='submit') : ""}
					</form>
				</div>
				<div id="${settings.prefix}SearchResultsContainer" class="searchContainer"></div>
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
		e.stopPropagation();
		e.preventDefault();
		const searchObject = $(this).closest('[id$="SearchContainer"]').data('searchObject');
		const form = $(this).closest('[name="searchFilterForm"]');
		var params = searchObject.getParams();
		
		$.extend(params, G.input.loadFields(form));

		G.pushState(searchObject.settings.useParams);
		searchObject.loadResults();
	});
});



	