/* global instantsearch algoliasearch */

// Initialization of search instances for different Algolia indices
const searchpfi = instantsearch({
  indexName: 'python_final_index',
  searchClient: algoliasearch(
	'index', 'apiKey'
  ),
});

const searchics = instantsearch({
  indexName: 'conference-series',
  searchClient: algoliasearch(
	'index', 'apiKey'
  ),
});

// Determine current page and set search instance accordingly
const currentPage = window.location.pathname;
let searchInstance;
if (currentPage.includes('/ives-conference-series/search-a-document-ics/')) {
    searchInstance = searchics;
} else {
    searchInstance = searchpfi;
}

// Function to render search box
const renderSearchBox = (renderOptions, isFirstRender) => {
  const { query, refine, clear, isSearchStalled, widgetParams } = renderOptions;
  // Only runs once on initial render
  if (isFirstRender) {
    // Create search box elements and attach event listeners
	const divWBord = document.createElement('div');
    	divWBord.classList.add("et_pb_with_border");
	divWBord.classList.add("et_pb_search_0");
	divWBord.classList.add("et_pb_module");
	divWBord.classList.add("et_pb_text_align_left");
	divWBord.classList.add("et_pb_bg_layout_light");
	divWBord.classList.add("et_pb_search");      
	
    const input = document.createElement('input');
    	input.classList.add("et_pb_s");
	input.classList.add("form-control");	
	divWBord.appendChild(input);  

    input.addEventListener('input', event => {
      	refine(event.target.value);
    });
     // Update search box value on subsequent renders
    if(widgetParams.container != null){
      widgetParams.container.appendChild(divWBord); 
    }
  }
if(widgetParams.container != null){

  widgetParams.container.querySelector('input').value = query;
  widgetParams.container.querySelector('input').placeholder = 'Search a document'; 
} 
};

// Create and instantiate custom search box widget
const customSearchBox = instantsearch.connectors.connectSearchBox(
  renderSearchBox
);

// Setup refinement list panels for different attributes
searchInstance.addWidgets([
  customSearchBox({
    container: document.querySelector('#searchbox'),
  })
]);
searchInstance.addWidgets([
  customSearchBox({
    container: document.querySelector('#searchboxics'),
  })
]);

//filters started
const refinementListWithPanel  = instantsearch.widgets.panel({
  templates: { header: 'Author',},  
})(instantsearch.widgets.refinementList);

const rLWithSource = instantsearch.widgets.panel({
  templates: { header: 'Media',},  
})(instantsearch.widgets.refinementList);

const rLWithConference = instantsearch.widgets.panel({
  templates: { header: 'Conferences',},
  hidden(options) { return options.results.nbHits === 0; },
})(instantsearch.widgets.refinementList);

const rLWithYear = instantsearch.widgets.panel({
  templates: { header: 'Year',},
  hidden(options) { return options.results.nbHits === 0; },
})(instantsearch.widgets.refinementList);

const rLWithKeywords = instantsearch.widgets.panel({
  templates: { header: 'Keywords',},
})(instantsearch.widgets.refinementList);

const rLWithType = instantsearch.widgets.panel({
 hidden(options) {
    const facetValues = options.results.getFacetValues('type');
    return Array.isArray(facetValues) ? facetValues.length <= 1 : false;
  },
  templates: { header: 'Document Type',},
})(instantsearch.widgets.refinementList);

// Add widgets to search instance
searchInstance.addWidgets([  
  // Configure, Hits, Clear Refinements, Current Refinements, Refinement Lists, Stats, Pagination widgets
  instantsearch.widgets.configure({
	hitsPerPage: 9,
  }),
  instantsearch.widgets.hits({
      container: "#hits",
	  cssClasses: {
		root: 'ais_et_pb_blog_grid  articleHits',
		list: ['column size-1of3'],
		item: ['hit ']
	  },
      templates: {
		empty: 'No posts found for <q>{{ query }}</q>',
        item: function(item) {
			
			let baseDomain= 'https://ives-openscience.eu/';
			if(item.url){
				baseDomain = item.url;
			}
 			
			let tmpl = `
			<article class="ais_et_pb_post clearfix"><h2 class="entry-title"><a href="${baseDomain}">${item.title}</a></h2>
				<p class="post-meta">
					<span class="published">${item.source}</span> | 
					${item.year}
				</p>
				<div class="post-content">
					<div class="post-content-inner">
						<p>${item.abstract}</p>
					</div>
				<a href="${baseDomain}" target="_blank" class="more-link">read more</a></div>
				</article>`
			return tmpl;
          
        }
      }
    }),
  instantsearch.widgets.clearRefinements({
		container: '#clear-refinements',
		templates: {
		resetLabel({ hasRefinements }, { html }) {
		  return html`<span id="clearAisFilters">${hasRefinements ? 'Clear filters' : 'Filters'}</span>`;
		},
		},
  }),
  instantsearch.widgets.currentRefinements({
		container: '#current-refinements',
  }),
  
    refinementListWithPanel ({
		container: '#ais-author',
		attribute: 'author',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search author',
		sortBy: ['name:asc'],	
		operator: 'or',
	}),	
	rLWithSource({
		container: '#ais-source',
		attribute: 'source',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search source',
		sortBy: ['name:asc'],	
		operator: 'or',
	}),
	rLWithConference({
		container: '#ais-conference',
		attribute: 'conference',
		sortBy: ['name:asc'],	
		operator: 'or',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for conference',
		searchableIsAlwaysActive: false,
	}),
	rLWithKeywords({
		container: '#ais-keywords',
		attribute: 'keywords',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Keywords',
		sortBy: ['name:asc'],
		operator: 'or',
	}),
	
   
    rLWithYear({
		container: '#ais-year',
		attribute: 'year',    
		attributeName: 'year', 
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Year',
		sortBy: ['name:desc'],
		operator: 'or',
	}),

	rLWithType({
		container: '#ais-type',
		attribute: 'type',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Type',
		sortBy: ['name:asc'],	
		operator: 'or',
	}),
	
	 
   instantsearch.widgets.stats({
    container: '#aisStats',
    templates: {
      text: `
        {{#hasManyResults}} See {{nbHits}} Records {{/hasManyResults}}
        {{#hasOneResult}} See 1 Record {{/hasOneResult}}
        {{#hasNoResults}} 0 Records{{/hasNoResults}}
      `
    }
  }),
   
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

//ICS
searchics.addWidgets([  
  
  instantsearch.widgets.configure({
	hitsPerPage: 9,
  }),
  instantsearch.widgets.hits({
      container: "#hits",
	  cssClasses: {
		root: 'ais_et_pb_blog_grid  articleHits',
		list: ['column size-1of3'],
		item: ['hit ']
	  },
      templates: {
		empty: 'No posts found for <q>{{ query }}</q>',
        item: function(item) {
			
			let baseDomain= 'https://ives-openscience.eu/';
			if(item.url){
				baseDomain = item.url;
			}
 			
			
			let tmpl = `
			<article class="ais_et_pb_post clearfix"><h2 class="entry-title"><a href="${baseDomain}">${item.title}</a></h2>
				<p class="post-meta">
					Conference: <span class="published">${item.conference+" "+item.year}</span>   
				</p>
				<div class="post-content">
					<div class="post-content-inner">
						<p>${item.abstract}</p>
					</div>
				<a href="${baseDomain}" target="_blank" class="more-link">read more</a></div>
				</article>`
			return tmpl;
          
        }
      }
    }),
  instantsearch.widgets.clearRefinements({
		container: '#clear-refinements',
		templates: {
		resetLabel({ hasRefinements }, { html }) {
		  return html`<span id="clearAisFilters">${hasRefinements ? 'Clear filters' : 'Filters'}</span>`;
		},
		},
  }),
  instantsearch.widgets.currentRefinements({
		container: '#current-refinements',
  }),
  
    refinementListWithPanel ({
		container: '#ais-author',
		attribute: 'author',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search author',
		sortBy: ['count:desc', 'name:asc'],	
		operator: 'or',
	}),	
	rLWithSource({
		container: '#ais-source',
		attribute: 'source',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search source',
		sortBy: ['count:desc', 'name:asc'],	
		operator: 'or',
	}),
	rLWithConference({
		container: '#ais-conference',
		attribute: 'conference',
		sortBy: ['count:desc', 'name:asc'],	
		operator: 'or',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for conference',
		searchableIsAlwaysActive: false,
	}),
	rLWithKeywords({
		container: '#ais-keywords',
		attribute: 'keywords',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Keywords',
		sortBy: ['count:desc', 'name:asc'],
		operator: 'or',
	}),
   
    rLWithYear({
		container: '#ais-year',
		attribute: 'year',    
		attributeName: 'year', 
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Year',
		sortBy: ['name:desc'],
		operator: 'or',
	}),

	rLWithType({
		container: '#ais-type',
		attribute: 'type',
		limit: 5,
		showMore: true,
		showMoreLimit: 20,
		searchable: true,
		searchablePlaceholder: 'Search for Type',
		sortBy: ['count:desc', 'name:asc'],	
		operator: 'or',
	}),
	
	 
   instantsearch.widgets.stats({
    container: '#aisStats',
    templates: {
      text: `
        {{#hasManyResults}} See {{nbHits}} Records {{/hasManyResults}}
        {{#hasOneResult}} See 1 Record {{/hasOneResult}}
        {{#hasNoResults}} 0 Records{{/hasNoResults}}
      `
    }
  }),
   
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

// Start search instance and setup event handlers
function onRenderHandler() { }
searchInstance.on('render', onRenderHandler);
searchInstance.start();
searchInstance.on('error', () => {});
searchInstance.on('render', () => {
  console.log(search.status === 'error' && search.error);
});

// Setup event handlers for filter overlay
document.getElementById("openOverlay").onclick = function() {openOverlay()};
document.getElementById("resetOverlay").onclick = function() {resetOverlay(true)};
document.getElementById("aisStats").onclick = function() {resetOverlay()};
function openOverlay() {
   // Open filter overlay and add keyup listener
	document.body.classList.add("filtering");
	window.scrollTo(0,300);
	window.addEventListener('keyup', onKeyUpAlgolia);    
}

function resetOverlay(a){
	// Close filter overlay, remove keyup listener, and optionally clear filters
	document.body.classList.remove("filtering");
	window.removeEventListener('keyup', onKeyUpAlgolia);
	if (a !== undefined) {
		document.getElementById('clearAisFilters').click();  
	}
	window.scrollTo(0,2000);  
}

function onKeyUpAlgolia(event) {
    // Close filter overlay when 'Escape' key is pressed
    if (event.key !== 'Escape') {
      return;
    }
    resetOverlay();
}
