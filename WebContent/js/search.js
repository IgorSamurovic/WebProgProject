

function getNumPages(numRecords, perPage)
{
	var numPages = Math.floor(numRecords/perPage);
	if (numRecords % perPage > 0)
		numPages += 1;
	return numPages;
}

function getButtons(params, numRecords)
{
	var numPages = getNumPages(numRecords, params.perPage);
	var startPage = 1;
	var endPage = numPages;
	
	if (params.page !== null)
	{
		startPage = Math.max(2, params.page-10);
		endPage = Math.min(params.page+10, numPages);
	}
	
	var s = "";
	if (numPages > 1)
    {
		s += '<div class="pages">';
		s += '<button id="changePageBtn" data-id="' + 1 + '" class="page btn2 ' + (1==params.page ? 'selected2' : '') +  '">' + 1 + '</button>';
		
		for (i=startPage; i < endPage; i++)
		{
			s += '<button id="changePageBtn" data-id="' + i + '" class="page btn ' + (i==params.page ? 'selected' : '') +  '">' + i + '</button>';
		}
		
		s += '<button button id="changePageBtn" data-id="' + numPages + '" class="page btn2 ' + (numPages==params.page ? 'selected2' : '') +  '">' + numPages + '</button>';
		s += '</div>';
	}


	
	return s;
}

$(document).ready(function()
{
	$(document).on('click', '#changePageBtn', function(button)
	{
		params   = $(this).parent().parent().data('params');
		settings = $(this).parent().parent().data('settings');
		
		params.page = $(this).data("id");
		params.startFrom = (params.page-1) * params.perPage;
		
		window.history.pushState("", settings.title, window.location.href.split("?")[0] +"?" + $.param(params));
		loadResults(params, settings);
	});
});

function ResultContainer(args)
{
	this.title = args.title;
	this.updateTitle = args.updateTitle;
	this.prefix = args.prefix;
	this.targetElement = args.targetElement;
	this.insertMode = args.insertMode;
	this.canToggle = args.canToggle;
	
	this.render = function(args)
	{
		var html =
			'<div id="'+this.prefix+'"ResultContainer" class="pageborder">' + 
			    '<div class="page">' +
			    	'<div class="pageheader">' + (this.canToggle) ? this.title + createToggleBtn() : "" + '</div>' +
			        '<div id="userSearchResultsPage" class="pagecontent"></div>' +
			    '</div>' +
			'</div>';
		
		if (this.insertMode === "append") {
			$(this.targetElement).append(html);
		} else if (this.insertMode === "html") {
			$(this.targetElement).html(html);
		}
	};
}




function loadResults(params, settings)
{
	settings.dataFunc(settings.dataArgs, function(params, data, settings)
	{
		numRecords = data[0];
		
		if (!isNumber(params.perPage)) params.perPage = 10;
	
		numPages = getNumPages(numRecords, params.perPage);
		
		pageBtns = getButtons(params, numRecords, settings.prefix);
		
		console.log(numRecords);
		console.log(params);
		var result = '<div id="'+settings.prefix+'SearchResultsContainer" class="searchresults">' + pageBtns + '<div class="searchresults" id="'+settings.prefix+'SearchResults"></div>' + pageBtns + '</div>';
		
		$("#"+settings.prefix+"SearchResultsPage").html(result);
		$("#"+settings.prefix+"SearchResultsContainer").data("params", params);
		$("#"+settings.prefix+"SearchResultsContainer").data("settings", settings);
		
		if (numRecords <= 0)
		{
			$("#"+settings.prefix + "SearchResultsContainer").html('<div class="boldText">The search has returned no results.</div>');
		}
		settings.callback(data, params, settings);
		
	});
}
	