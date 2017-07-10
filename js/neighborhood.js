// These varibles are used to communicate with the BreweryDB API
var breweryDbUrl = "https://api.brewerydb.com/v2";
var breweryDbKey = "&key=0d1c7bd898b81732618aa3295f808828";
var search;
var terms;
var fullUrl;
var requestTimeout;
var breweryRequest;
var apiAttribution = "(Source: www.brewerydb.com)";

var locations =
[
  { name: 'Surly Brewing',
    address: '520 Malcolm Ave SE, Minneapolis, MN 55414',
    location: {lat: 44.973279, lng: -93.209802},
    website: 'http://www.surlybrewing.com/',
    id: 'cPRfoj'
  },
  { name: 'Utepils Brewing',
    address: '225 Thomas Av N, Minneapolis, MN 55405',
    location: {lat: 44.978673, lng: -93.312176},
    website: 'www.utepilsbrewing.com/',
    id: 'W00af5'
  },
  { name: 'Boom Island Brewing',
    address: '2022 N Washington Av, Minneapolis, MN 55411',
    location: {lat: 45.000042, lng: -93.281488},
    website: 'http://www.boomislandbrewing.com/',
    id: 'rdrfPw'
  },
  { name: 'Fulton Brewery',
    address: '414 N 6th Ave, Minneapolis, MN 55401',
    location: {lat: 44.985134, lng: -93.279214},
    website: 'http://www.fultonbeer.com/',
    id: '5GoGSi'
  },
  { name: 'Eastlake Craft Brewery',
    address: '920 E Lake St, Minneapolis, MN 55407',
    location: {lat: 44.948903, lng: -93.260741},
    website: 'http://www.eastlakemgm.com/',
    id: 'IHouhj'
  },
  { name: 'Wild Mind Artisan Ales',
    address: '6031 Pillsbury Ave S, Minneapolis, MN 55419',
    location: {lat: 44.893291, lng: -93.281513},
    website: 'http://www.wildmindales.com/',
    id: 'KGfYg2'
  }
];


function initMap()
{
    var ViewModel = function()
    {
      //Self alias
      var self = this;

      //Center map on University of Minnesota east bank
      this.map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 12,
        center: {lat: 44.978409, lng: -93.234671}
      });

      this.infoWindow = new google.maps.InfoWindow();

      // create list of neighborhood locations
      this.markers = ko.observableArray([]);

      // The following loop uses the location array to add markers to the location array
      locations.forEach(function(location)
      {
          // Create a marker for each location
          this.marker = new google.maps.Marker
          ({
              position: location.location,
              name: location.name,
              address: location.address,
              website: location.website,
              id: location.id,
              animation: google.maps.Animation.DROP
          });

          var currentMarker = this.marker;

          // Create an onclick event to open an infoWindow at each marker.
          google.maps.event.addListener(currentMarker, 'click', function()
          {
              search = "/breweries?";
              terms = "ids=" +  currentMarker.id;
              fullUrl = breweryDbUrl + search + terms + breweryDbKey;

              console.log("URL: " + fullUrl);

              requestTimeout = setTimeout(function()
              {
                  alert("Unable to retrieve brewery description for brewery with ID " + currentMarker.id);
              }, 10000);

              breweryRequest = new XMLHttpRequest();

              // 3rd param 'true' makes it async
              breweryRequest.open("GET", fullUrl, true);

              breweryRequest.addEventListener('load', function()
              {
                  var response = JSON.parse(breweryRequest.responseText);
                  console.log(response);
                  if (response.data.length > 0)
                  {
                      console.log(response.data[0].name);
                      description = response.data[0].description + " " + apiAttribution;

                      if (self.infoWindow.marker != this)
                      {
                          self.infoWindow.marker = this;
                          self.infoWindow.setContent
                            ('<p>' + currentMarker.name + '</p>' +
                             '<p>' + currentMarker.address + '</p>' +
                             '<p>' + currentMarker.website + '</p>' +
                             '<p>' + description + '</p>');
                          self.infoWindow.setPosition(currentMarker.position);
                          self.infoWindow.open(self.map);
                          // Make sure the marker property is cleared if the infoWindow is closed.
                          self.infoWindow.addListener('closeclick', function()
                          {
                              self.infoWindow.marker = null;
                          });
                      }

                      clearTimeout(requestTimeout);
                   }
                  else
                  {
                      description = "Brewery with ID " + currentMarker.id + " not found";
                  }
               });

               breweryRequest.send();
          });

          // show marker
          this.marker.setMap(self.map);

          // Add the marker to the location
          location.marker = this.marker;

          // add the marker to the observable array
          self.markers.push(this.marker);
      });

      // This is the search value
      self.filter = ko.observable('');

      // filter the items using the filter text
      self.filteredMarkers = ko.computed(function()
      {
          var filter = self.filter().toLowerCase();
          if (!filter)
          {
              // make all markers visible when filter is cleared
              self.markers().forEach(function(marker)
              {
                  marker.setVisible(true);
              });

              return self.markers();
          }
          else
          {
              return ko.utils.arrayFilter(self.markers(), function(marker)
              {
                  marker.setVisible(false);
                  displayMarker = self.stringContains(marker.name.toLowerCase(), filter);

                  if (displayMarker)
                  {
                      marker.setVisible(true);
                  }

                  return displayMarker;
              });
          }
      }, self).extend({notify: 'always'});

      // Activate marker when location selected from list
      self.activateMarker = function(marker)
      {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          google.maps.event.trigger(marker, 'click');

          // stop bouncing after 3 seconds
          setTimeout(function()
          {
              marker.setAnimation(null);
          }, 3000);
      };

      self.updateMarker = function(marker, name)
      {
          marker.name = name;
      };

      // determine if passed 'string' contains the passed value
      this.stringContains = function(string, contains)
      {
          string = string || "";
          if (contains.length > string.length)
              return false;
          return string.includes(contains);
      };
  };

  // Instantiate the ViewModel
  ko.applyBindings(new ViewModel());
}