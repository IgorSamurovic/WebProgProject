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
		return G.supplantArray([
		    '<button name="changePageBtn" data-page="{pageId}" class="page btn{btnType} ',
		    (1==G.getParams().page ? 'selected{btnType}' : ''), '">{pageId}</button>'],
		    {pageId:pageId, btnType:btnType}
		);
	},
	
	getButtons : function(totalRecords) {
		var params = G.getParams(),
			numPages = this.getNumPages(),
			startPage = 1,
			endPage = numPages;
		
		if (params.page !== null)
		{
			startPage = Math.max(2, params.page-10);
			endPage = Math.min(params.page+10, numPages);
		}
		
		var s = "";
		if (numPages > 1) {
			
			s = [];
			s.push('<div class="pages">');
			s.push(this.getButton(1, 2));
			
			for (i=params.startPage; i < endPage; i++) {
				s.push(this.getButton(i, 1));
			}
			
			s.push(this.getButton(numPages, 2));
			s.push('</div>');
			
			s = s.join();
		}

		return s;
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
		$(sel).closest('[name="result"]').data('obj');
	},
	
	getSearch : function(sel) {
		$(sel).closest('[name="container"]').data('searchObject');
	},
	
	DEFAULT_PERPAGE : 10,
	
	renderResults : function(data) {
		
		var params = G.getParams();
		
		// Set the raw data here
		this.data = data;
		
		// Render fitting HTML
		if (data !== null && data !== undefined) {
			if (data.totalRecords === 0) {
				$(this.selContainer()).html('<div class="boldText">The search has returned no results.</div>');
			} else if (data.totalRecords) {
				
				var needPush = false;
				
				// Fix perPage property if needed
				if (!$.isNumeric(params.perPage)) {
					params.perPage = this.DEFAULT_PERPAGE;
					needPush = true;
				}
				
				// Fix page number if needed
				var numPages = this.getNumPages();
				
				if (!$.isNumeric(params.page)) {
					if (params.page > numPages) {
						params.page = numPages;
						needPush = true;
					}
				} else {
					params.page = 1;
					needPush = true;
				}
				
				if (needPush) {
					G.replaceState();
				}
				
				// Create an outline for search results
				var pageBtns = this.getButtons();
				var result = [
			    	pageBtns,
			    	'<div class="searchresults" id="{prefix}SearchResults" name="results"></div>',
			    	pageBtns,
				];
				
				
				result = G.supplantArray(result, {
					prefix: settings.prefix
				});
				
				$(this.selContainer()).html(result);
				
				// Create actual results to fill out the list
				result = [
				    '<div class="searchresult" id="{prefix}SearchResult{i}" name="result">'.supplant({prefix: settings.prefix, i:i}),
				    null,
				    '</div>'
				];
				
				// Now process all objects and render all elements 
				for (i=0; i<data.length; i++) {
					
					// Convert every raw JSON object to a proper G object with methods
					data[i] = G.create(this.settings.objType, data[i]);
					
					// Process the object to generate HTML and put it in a proper result housing
					result[1] = this.settings.renderFunc(data[i]);

					// Add the generated HTML to the results
					$(this.selResults()).append(result.join());
					
					// Attach the last processed object to the last added HTML element
					$(this.selResults()).last().data("obj", data[i]);
				}
			}
		}
	},
	
	loadResults : function() {
		// Executes a dataFunc function with dataArgs, calling renderResults once the data is collected
		this.settings.dataFunc(settings.dataArgs, this.renderResults);
	},
	
	// Creates a search result environment
	create : function(settings) {
		var obj = Object.create(this);
		obj.settings = settings;
		
		var html = '<div id="{prefix}SearchResultsContainer" name="container" class="hidden searchresults"></div>'.supplant({prefix:settings.prefix});
		
		$(obj.selParent()).append(html);
		$(obj.selContainer()).data('searchObject', this);
		
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
	}
	
};

$(document).ready(function() {
	
	$(document).on('click', '[name=changePageBtn]', function(button) {
		var searchObject = $(this).closest('[name="container"]').data('searchObject'),
			params = G.getParams();
		
		params.page = $(this).data('page');
		G.pushState();
		
		window.history.pushState("", settings.title, window.location.href.split("?")[0] +"?" + $.param(params));
		searchObject.loadResults();
	});
});



	