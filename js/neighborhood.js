var destinations = [];

var defaultMapCenter = "United States";

var cityList = [' ',
                'Atlanta',
                'Baltimore',
                'Boston',
                'Chicago',
                'Cincinnati',
                'Cleveland',
                'Dallas',
                'Denver',
                'Detroit',
                'Houston',
                'Kansas City',
                'Los Angeles',
                'Miami',
                'Milwaukee',
                'Minneapolis',
                'New York',
                'Oakland',
                'Philadelphia',
                'Phoenix',
                'Pittsburgh',
                'Saint Louis',
                'San Diego',
                'San Francisco',
                'Seattle',
                'Tampa',
                'Toronto',
                'Washington DC'
               ];

var maxDestinationList = [5, 8, 12];
var mapZoomList = [10, 11, 12];

/**
  Return the screen size level:
    0 for small
    1 for medium
    2 for large

  The level is used to access values in the above arrays
*/
var screenSizeLevel = function()
{
    var mq = window.matchMedia('(min-width: 1000px)');
    if (mq.matches)
    {
        return 2;
    }
    else
    {
        mq = window.matchMedia('(min-width: 650px)');
        if (mq.matches)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }
}

/**
  Return the city selected by the user
*/
var selectedCity = function()
{
    var city = document.getElementById("selectedCity").value;

    // clear destinations and return if no city was selected
    if (city == null || city.trim().length == 0)
    {
        return null;
    }

    return city;
};

/**
  Center the passed map on the passed location
*/
var centerMap = function(map, mapCenter)
{
    var geocoder = new google.maps.Geocoder();

    if (mapCenter == null)
    {
        mapCenter = defaultMapCenter;
    }

    geocoder.geocode({'address': mapCenter}, function(results, status)
    {
        if (status == google.maps.GeocoderStatus.OK)
        {
            map.setCenter(results[0].geometry.location);
        }
        else
        {
            alert("Could not find location : " + location);
        }
    });
};


function initMap()
{
    var ViewModel = function()
    {
      //Self alias
      var self = this;

      ko.options.deferUpdates = true;

      //Center map on University of Minnesota east bank
      this.map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 5,
      });
      centerMap(self.map, defaultMapCenter);

      this.infoWindow = new google.maps.InfoWindow();

      // list of cities
      this.cities = ko.observableArray(cityList);

      // list of map markers
      this.markers = ko.observableArray([]);

      // This filters the display of destinations
      self.filter = ko.observable('');

      /**
        The following loop through the destination array and adds markers
      */
      this.loadBreweries = function()
      {
          // clear markers if array was already populated
          while (self.markers().length > 0)
          {
              self.markers.pop();
          }

          destinations.forEach(function(destination)
          {
              console.log("add brewery: " + destination.name);
              // Create a marker for each destination
              this.marker = new google.maps.Marker
              ({
                  position: {lat: destination.latitude, lng: destination.longitude},
                  name: destination.name,
                  address: destination.address,
                  website: destination.website,
                  id: destination.id,
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

                  apiRequest = new XMLHttpRequest();

                  // 3rd param 'true' makes it async
                  apiRequest.open("GET", fullUrl, true);

                  apiRequest.addEventListener('load', function()
                  {
                      var response = JSON.parse(apiRequest .responseText);

                      if (response.data.length > 0)
                      {
                          console.log(response.data[0].name);
                          description = response.data[0].description;

                          if (!description || description == "undefined")
                          {
                              description = "No description found on ";
                          }

                          if (self.infoWindow.marker != this)
                          {
                              self.infoWindow.marker = this;
                              self.infoWindow.setContent
                                ('<p class="infoWindow">' + currentMarker.name + '</p>' +
                                 '<p class="infoWindow">' + currentMarker.address + '</p>' +
                                 '<p class="infoWindow">' + currentMarker.website + '</p>' +
                                 '<p class="infoWindow">' + description + " " + apiAttribution + '</p>');
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

                   apiRequest.send();
              });

              // show marker
              this.marker.setMap(self.map);
              this.marker.setVisible(true);

              // Add the marker to the destination
              destination.marker = this.marker;

              // add the marker to the observable array
              self.markers.push(this.marker);
          });

          self.map.setZoom(mapZoomList[screenSizeLevel()]);
          centerMap(self.map, selectedCity());
      };

      // This is the search value
      self.filter = ko.observable('');

      /**
        filter the items using the filter text
      */
      self.filterMarkers = function()
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
      };

      self.filteredMarkers = ko.computed(self.filterMarkers);

      /**
       Activate marker when destination selected from list
      */
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

      /**
        determine if passed 'string' contains the passed value
      */
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