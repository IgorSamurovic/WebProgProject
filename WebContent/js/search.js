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
 *   Container
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
		
	getNumPages : function() {
		var params = G.getParams(),
			numPages = Math.floor(this.data.totalRecords/params.perPage);
		if (this.data.totalRecords % params.perPage > 0)
			numPages += 1;
		return numPages;
	},

	getButton : function(pageId, btnType) {
		return [
		    '<button name="changePageBtn" data-page="{pageId}" class="page btn{btnType} ',
		    (pageId==G.getParams().page ? 'selected{btnType}' : ''),
		    '">{pageId}</button>'].supplant({pageId:pageId, btnType:btnType});
	},
	
	getButtons : function(totalRecords) {
		var params = G.getParams(),
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
			//s.push(H.stdSpacer());
			
			for (var i = startPage; i <= endPage; i++) {
				s.push(this.getButton(i, ""));
			}

			s.push('</div>');
			
			s = s.join("");
		}

		return s;
	},
	
	getPerPageSelector : function() {
		var perPage = G.getParams().perPage;
		
		if (this.data.totalRecords <= 1) {
			return "";
		} else {
			return H.input.perPage('half', "resultPerPage");
		}
	},
	
	selParent : function() {
		return "#" + this.settings.parent;
	},
	
	selContainer : function() {
		return "#" + this.settings.prefix + "SearchResultsContainer";
	},
	
	selResults : function() {
		return "#" + this.settings.prefix + "SearchResults";
	},
	
	getObject : function(sel) {
		return $(sel).closest('div[name="result"]').data('obj');
	},
	
	getSearch : function(sel) {
		return $(sel).closest('div[name="container"]').data('searchObject');
	},
	
	DEFAULT_PERPAGE : 10,
	MAX_PERPAGE : 50,
	
	renderResults : function(data) {
		
		var params = G.getParams();
		var html;
		
		// Set the raw data here
		this.data = data;
		
		// Render fitting HTML
		if (data !== null && data !== undefined) {
			
			html = '<div id="{prefix}SearchResultsContainer" name="container" class="searchresults"></div>'.supplant({prefix:this.settings.prefix});
			$(this.selParent()).html(html);
			$(this.selContainer()).data('searchObject', this);
			
			if (data.totalRecords === 0) {

				$(this.selContainer()).html('<div class="boldText">The search has returned no results.</div>');
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
						G.replaceState();
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
				
				$(this.selContainer()).html(result);
				
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
			}
		}
	},
	
	loadResults : function() {
		// Executes a dataFunc function with dataArgs, calling renderResults once the data is collected
		// Remove needless parameters
		G.restrictParams(this.settings.allowed);
		this.settings.dataFunc(this.settings.dataArgs, this.renderResults.bind(this));

	},
	
	// Creates a search result environment
	create : function(settings) {
		var obj = Object.create(this);
		obj.settings = settings;
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
		var searchObject = $(this).closest('[name="container"]').data('searchObject'),
			params = G.getParams();
		
		if (params.page != $(this).data('page')) {
			params.page = $(this).data('page');
			G.pushState();

			searchObject.loadResults();
		}
		
	});
	
	$(document).on('change', '[name=resultPerPage]', function(button) {
		var searchObject = $(this).closest('[name="container"]').data('searchObject'),
			params = G.getParams();
		
		if (params.perPage != $(this).val()) {
			params.perPage = $(this).val();
			G.pushState();

			searchObject.loadResults();
		}

	});
});



	