Udacity Front-End Developer Nanodegree: Neighborhood Map Project
============================
The requirements for this project are to develop a single page application featuring a map of a neighborhood. It will have this additional functionality:
- map markers to identify popular destinations or places I’d like to visit
- a search function to easily discover these destinations
- a listview to support simple browsing of all destinations
- a third-party API that provide additional information about each of these destinations (I used http://www.brewerydb.com/developers, API Key 0d1c7bd898b81732618aa3295f808828)


##Usage Instructions
====================

The application shows a Google Map of the University of Minnesota area, with several breweries designated with markers on the map. A search box can be used to filter the list of breweries.

The application can be run directly from the [GitHub Repository](https://rawgit.com/howardjmn/NeighborhoodMap/master/index.html)

You can also run it locally by downloading the repository to a folder on your computer, then opening the index.html file in the web browser of your choice.

## Resources Used For This Project
- Knockout Framework (knockoutjs.com)
-- This implementation is based on the "Cat Clicker" application developed in this course.

- Google Maps API
-- This implementation is based on the examples provided in the "Understanding API services" module in this course.

##Update History
================
 - Iteration 1: Just displays a map and list of destinations

 - Iteration 2: Added markers and infowindows, copying code from (Project_Code_4_WindowShoppingPart2.html) with modifications to make it compatible with knockout.

 - Iteration 3: Clicking item in the list now opens the corresponding infoWindow.  This wasn't working in the previous iteration because I had created separate observable arrays for the destinations and the markers.  I only needed the one for the markers.  Debugged with help from http://knockoutjs.com/documentation/foreach-binding.html.  Also added marker animation (https://developers.google.com/maps/documentation/javascript/examples/marker-animations-iteration).

- Iteration 4: Added search function, using code from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html.  Also copied 'stringStartsWith' function from https://stackoverflow.com/questions/30168480/ko-utils-stringstartswith-not-working.

- Iteration 5: Populate infoWindow with values retrieved from BreweryDb API: http://www.brewerydb.com/developers.  At this point the brewery ID to get the brewery description is hard-coded and thus not correct for the infoWindow being displayed.  Problems encountered in this iteration:

    * Details for XMLHttpRequest used to call API: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
    * Installed CORS extension for Chrome to solve this problem: https://stackoverflow.com/questions/20035101/no-access-control-allow-origin-header-is-present-on-the-requested-resource
    * Added setPosition to infoWindow to solve this problem: https://stackoverflow.com/questions/42331086/adding-google-maps-infowindow-from-data-features-generates-error-b-get-is-not

- Iteration 6:
    * added BrewerDB IDs for all breweries
    * changed filter function to 'contains' instead of 'startsWith'
    * corrected filtering of markers (all markers were being shown after list was filtered)

- Iteration 7:
    * The hard-coded list of destination has been removed.
    * There is now an input field for a city.  Breweries within that cities are requested via an API call.  There are a couple limitations that made things easier on myself:
        ** The maximum number breweries displayed is 12.  This is so I didn't have to write
        code to deal with too many destinations to display elegantly on the page.
        ** Rather than allowing any city to be entered I limited it to a list of large cities.  This means I didn't have to deal with validating an entered location.
    * Filtered markers (all markers before a filter is entered) were not being displayed after I made the above change.  I solved that problem with this link: https://stackoverflow.com/questions/13836351/knockout-js-manually-trigger-computed.  The filtered marker list is now built with a knockout computed function (self.filteredMarkers = ko.computed(self.filterMarkers)).
    * The map is centered on the selected city.


    http://en.marnoto.com/2014/09/5-formas-de-personalizar-infowindow.html